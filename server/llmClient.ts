import { COMPLICATION_TYPES } from "./engine/state/models.js";

// ─────────────────────────────────────────────────────────────────────────────
// Groq-backed LLM client — hybrid complication routing for ScrubIn.
//
// The Python engine stays the authority on physiology (vitals math, reserve %,
// death, scoring). This module ONLY decides WHICH complication a wrong stock
// choice caused and supplies the clinical narrative. Every call is wrapped in a
// circuit breaker + fallback so the game never crashes if Groq is slow or down:
// on any failure the caller keeps the authored complication from the bank.
// ─────────────────────────────────────────────────────────────────────────────

/** The only complication types the engine's vitals table understands. */
export const LLM_COMPLICATION_TYPES: readonly string[] = COMPLICATION_TYPES;

export interface ChoiceContext {
  procedure?: string;
  procedurePhase?: string;
  stepTitle: string;
  stepDescription?: string;
  chosenAction: string;
  patientProfile?: unknown;
  /** Per-procedure allowlist from the registry; defaults to the full enum. */
  allowedComplications?: readonly string[];
}

export interface ChoiceVerdict {
  isCorrect: boolean;
  complicationType: string; // "" when the choice was correct
  explanation: string;
  correctAction?: string;
  source: "groq" | "fallback";
}

interface GroqConfig {
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  maxFailures: number;
  circuitOpenMs: number;
}

function getConfig(): GroqConfig {
  return {
    apiKey: process.env.GROQ_API_KEY,
    baseUrl:
      process.env.GROQ_BASE_URL ||
      "https://api.groq.com/openai/v1/chat/completions",
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    timeoutMs: parseInt(process.env.GROQ_TIMEOUT_MS || "2500", 10),
    maxFailures: parseInt(process.env.GROQ_MAX_FAILURES || "3", 10),
    circuitOpenMs: parseInt(process.env.GROQ_CIRCUIT_OPEN_MS || "60000", 10),
  };
}

// ── Circuit breaker state ────────────────────────────────────────────────────
let failureCount = 0;
let circuitOpenUntil = 0;

export function resetCircuit(): void {
  failureCount = 0;
  circuitOpenUntil = 0;
}

export function circuitState(): { open: boolean; failures: number; openUntil: number } {
  return {
    open: Date.now() < circuitOpenUntil,
    failures: failureCount,
    openUntil: circuitOpenUntil,
  };
}

function recordFailure(): void {
  const cfg = getConfig();
  failureCount += 1;
  if (failureCount >= cfg.maxFailures) {
    circuitOpenUntil = Date.now() + cfg.circuitOpenMs;
    console.warn(
      `Groq circuit breaker OPEN: ${failureCount} consecutive failures, skipping Groq for ${cfg.circuitOpenMs}ms`
    );
  }
}

function recordSuccess(): void {
  failureCount = 0;
  circuitOpenUntil = 0;
}

// ── System prompt (exact, from the hybrid plan §2.2) ─────────────────────────
export const LLM_SYSTEM_PROMPT = `You are the clinical judgment module of ScrubIn, a surgical training simulator
used by medical students. Your job is to evaluate ONE intraoperative decision a
trainee just made and decide, with real clinical reasoning, whether it was
correct — and if it was wrong, which complication it most plausibly caused.

Rules:
1. Use only the complication types in the ALLOWED list. Never invent a type.
2. Base your judgment on the actual step and the actual action chosen — a
   mismatch (e.g. wrong-side, wrong-site, wrong incision) is not "hypoxia".
   Favor the complication that is mechanistically caused by the action.
3. The patient is IN SURGERY, anesthetized, and monitored. Common intraoperative
   complications include hemorrhage (bleeding/vasculature mishap), nerve injury
   (anatomical landmark error), infection (breaks in sterility/contamination),
   hypoxia (airway/ventilation), thrombosis (vascular occlusion), cardiac
   arrhythmia (stimulation/instability), fluid overload (over-resuscitation),
   and anaphylaxis (drug/agent reaction).
4. If the action is correct or acceptable, set "is_correct": true and leave
   complication_type as "".
5. Be specific and brief. The explanation will be shown to a student right after
   the event. 1-2 sentences max.
6. Respond with STRICT JSON only — no markdown, no prose outside the object.
7. The explanation field is mandatory in every response and must contain 1-2 concise sentences.`;

/** Builds the user payload exactly per the hybrid plan §2.3. */
export function buildUserMessage(context: ChoiceContext): string {
  return JSON.stringify({
    procedure: context.procedure || "unknown",
    procedure_phase: context.procedurePhase || "",
    step_title: context.stepTitle,
    step_description: context.stepDescription || "",
    chosen_action: context.chosenAction,
    patient_profile: context.patientProfile ?? null,
    allowed_complications:
      context.allowedComplications && context.allowedComplications.length > 0
        ? context.allowedComplications
        : LLM_COMPLICATION_TYPES,
  });
}

// ── Schema validator (hybrid plan §2.4) ──────────────────────────────────────
export function validateVerdict(
  raw: unknown,
  allowed?: readonly string[]
): Omit<ChoiceVerdict, "source"> | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.is_correct !== "boolean") return null;
  if (typeof r.explanation !== "string" || r.explanation.trim().length === 0) return null;

  const type = typeof r.complication_type === "string" ? r.complication_type : "";
  const allowedSet = new Set(
    allowed && allowed.length > 0 ? allowed : LLM_COMPLICATION_TYPES
  );

  if (r.is_correct) {
    if (type !== "") return null;
  } else if (!allowedSet.has(type)) {
    return null;
  }

  return {
    isCorrect: r.is_correct,
    complicationType: type,
    explanation: r.explanation,
    correctAction:
      typeof r.correct_action === "string" && r.correct_action.trim()
        ? r.correct_action
        : undefined,
  };
}

// ── Groq low-level call ──────────────────────────────────────────────────────
async function callGroq(system: string, user: string): Promise<unknown> {
  const cfg = getConfig();
  if (!cfg.apiKey) throw new Error("GROQ_API_KEY not configured");
  if (Date.now() < circuitOpenUntil) throw new Error("Groq circuit open");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const res = await fetch(cfg.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
    const data = (await res.json()) as any;
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("Groq returned empty content");
    }
    return JSON.parse(content);
  } finally {
    clearTimeout(timer);
  }
}

const FALLBACK_VERDICT: ChoiceVerdict = {
  isCorrect: false,
  complicationType: "",
  explanation: "",
  source: "fallback",
};

/**
 * Evaluates one wrong stock-step choice. NEVER throws — on any Groq failure
 * (timeout, HTTP error, malformed JSON, schema violation, circuit open, missing
 * key) it records the failure, opens the circuit after GROQ_MAX_FAILURES, and
 * returns a fallback verdict so the caller keeps the authored complication.
 */
export async function classifyChoice(context: ChoiceContext): Promise<ChoiceVerdict> {
  try {
    const raw = await callGroq(LLM_SYSTEM_PROMPT, buildUserMessage(context));
    const verdict = validateVerdict(raw, context.allowedComplications);
    if (!verdict) {
      throw new Error("Groq response failed schema validation");
    }
    recordSuccess();
    return { ...verdict, source: "groq" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message !== "Groq circuit open") {
      console.error(`Groq classifyChoice fallback: ${message}`);
    }
    recordFailure();
    return FALLBACK_VERDICT;
  }
}
