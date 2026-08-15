# ScrubIn Hybrid Architecture — Local Python Engine + Groq

**Goal:** Keep ScrubIn-Core as the deterministic physiological engine (vitals math,
reserve %, scoring, hard game state) and move *complication routing + clinical
narrative* to an external LLM (Groq). The result: when a trainee picks a
wrong stock-step action, the complication is medically logical for the *actual
step and action* — not a pre-authored default.

**Implementation status:** Phases 1–4 are implemented. Express calls Groq with a
circuit-breaker fallback, the client sends full step context, and Scrubin-Core
accepts the optional narrative and returns it as a timeline event without
participating in the LLM call or changing physiology.

---

## 1. System Architecture Plan

### The problem today

When the user picks an incorrect stock-step option, the client reads
`choice.complication` **from the authored bank** (`stepBuilder.ts` → `wrongComps`
or `spec.risks`) and POSTs it straight to ScrubIn-Core's `/complicate`. The engine
trusts it and applies the vitals hit. So:

- Complications are authored per step, not reasoned per action → mismatch feels
  arbitrary (e.g., HYPOXIA on a patient-identification error).
- The engine never gets to explain *why* — the narrative is a canned string.

### The hybrid flow (target)

```
┌──────────────┐   POST /api/sim/complicate   ┌───────────────────────────────┐
│   Browser    │ ───────────────────────────► │        Express (scrubin)      │
│ (React UI)   │                              │  ┌─────────────────────────┐  │
└──────────────┘                              │  │ llmClient.classifyChoice │  │
        ▲                                     │  │  (calls Groq)      │  │
        │ pending_decision + narrative        │  └───────────┬─────────────┘  │
        │                                     │              │ 1. step context │
        │                                     │              ▼                 │
        │                                     │   ┌────────────────────────┐  │
        │                                     │   │ Groq (chat/completions) │  │
        │                                     │   │ → { is_correct,        │  │
        │                                     │   │    complication_type,  │  │
        │                                     │   │    explanation }       │  │
        │                                     │   └───────────┬────────────┘  │
        │                                     │               │ 2. validated  │
        │                                     │               │  complication │
        │                                     │               ▼                 │
        │                                     │  POST /complicate (core)       │
        │                                     │  ┌─────────────────────────┐  │
        │                                     │  │  ScrubIn-Core (Python)  │  │
        │                                     │  │  vitals / reserve /      │  │
        │                                     │  │  death / scoring math    │  │
        │                                     │  └─────────────────────────┘  │
        └─────────────────────────────────────┴───────────────────────────────┘
```

**Who owns what:**

| Concern | Owner |
|---|---|
| BP / HR / SpO₂ / Temp / RR math, clamp, decay | ScrubIn-Core (Python) |
| Physiological reserve %, STABILIZED vs DECEASED, scoring | ScrubIn-Core (Python) |
| Complication trigger vitals effects | ScrubIn-Core (Python) |
| **Was the choice medically correct?** | Groq |
| **Which complication type?** (context-aware) | Groq |
| Clinical explanation / narrative for the event | Groq |
| Dynamic debrief summary & advice | Groq |

**Where the Groq call lives:** in Express (`server/llmClient.ts`), not inside the
Python engine. Rationale:

- Express already owns LLM integration today (`/api/evaluate` → Groq with a
  `proxyToCore` fallback) — same pattern, new provider.
- The Python engine stays pure/deterministic: its 579 tests keep passing without
  network mocking, and the engine never blocks on an external API.
- Fallback is a single decision point in one place (Express), so the game never
  crashes if Groq is slow or down.

**What changes in `/decide`:** nothing in the engine math. `/decide` keeps
proxying to ScrubIn-Core unchanged — the hybrid layer only enriches the
*complication entry point* (`/complicate`) and the *debrief* (`/complete`). If we
later want Groq to also grade recovery decisions inside an active complication,
that's an additive `/evaluate-choice` call with the same schema (Section 2) and
fallback (Section 3).

---

## 2. Prompt Design & Schema

### 2.1 Endpoint & auth

- Base URL: `https://api.groq.com/openai/v1/chat/completions`
- Header: `Authorization: Bearer $GROQ_API_KEY`
- Body: OpenAI-compatible `messages` + `response_format: { "type": "json_object" }`
- Model: `llama-3.3-70b-versatile` (good JSON adherence; configurable via env)

### 2.2 System prompt (exact)

```
You are the clinical judgment module of ScrubIn, a surgical training simulator
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
7. The explanation field is mandatory in every response and must contain 1-2 concise sentences.
```

### 2.3 User payload (built by Express from the request)

```json
{
  "procedure": "appendectomy",
  "procedure_phase": "Patient Intake",
  "step_title": "Confirm identity and consent",
  "step_description": "Verify the patient, the diagnosis of acute appendicitis, and the signed consent before induction.",
  "chosen_action": "Proceed straight to induction — the team completed the checklist earlier this morning.",
  "patient_profile": { "asa": "ASA II", "presentation": "Early sepsis / systemic inflammation" },
  "allowed_complications": ["infection", "hemorrhage", "hypoxia", "nerve_injury"]
}
```

### 2.4 Expected JSON response (exact schema)

```json
{
  "is_correct": false,
  "complication_type": "infection",
  "explanation": "Skipping the formal time-out and consent verification breaks the surgical safety checklist, which measurably increases the risk of wrong-site surgery and sterile-field contamination.",
  "correct_action": "Verify the identity band, confirm the marked site, and review the signed consent."
}
```

**Field contract**

| Field | Type | Rules |
|---|---|---|
| `is_correct` | boolean | required |
| `complication_type` | string enum | must be in `["", "hypoxia", "hemorrhage", "infection", "thrombosis", "cardiac_arrhythmia", "anaphylaxis", "nerve_injury", "fluid_overload"]` — the exact keys of `COMPLICATION_VITAL_EFFECTS` in ScrubIn-Core |
| `explanation` | string | 1–2 sentences; shown as the event narrative |
| `correct_action` | string | optional; the right move, for the debrief |

**Note on `safety_violation`:** the engine's vitals table has no
`safety_violation` entry. If you want that as a first-class type, the clean
option is to map it in the Groq prompt to the closest physiological consequence
(contamination → `infection`, wrong-site/wrong-side → `hemorrhage`/`nerve_injury`
per mechanism). Adding a brand-new complication type to the engine means new
vitals effects, trigger criteria, treating options, and recovery archetypes — a
much bigger change, so the plan keeps the enum aligned with the engine's current
table.

### 2.5 Debrief prompt (for `/complete`)

System: "You are a senior attending surgeon writing a post-operative debrief for
a medical student who just completed a {procedure} simulation. Reference exact
decisions and complications from the log. Be direct, specific, and educational,
under 200 words. Respond with STRICT JSON: {\"summary\": string,
\"key_mistakes\": [string], \"strengths\": [string], \"advice\": string}."

User payload: the case's decision history (decision number, title, correct?
complication, vitals at the time) — same shape the existing Groq `/api/evaluate`
already builds.

---

## 3. Fallback Logic (game never crashes)

All Groq calls are wrapped in `llmClient` with a **circuit-breaker + cascade**:

```
evaluateChoice(context)
  ├─ if circuit OPEN → return FALLBACK (authored complication, as today)
  ├─ try Groq call (fetch, AbortController, timeout GROQ_TIMEOUT_MS=2500)
  │   ├─ success → validate JSON against schema (Section 2.4)
  │   │    ├─ valid + complication_type ∈ allowed → use it
  │   │    └─ invalid enum / bad JSON / missing field → FALLBACK
  │   └─ failure (timeout / 4xx / 5xx / network) → record failure
  │        └─ failures >= GROQ_MAX_FAILURES (3) → open circuit for
  │           GROQ_CIRCUIT_OPEN_MS (60_000) — no further Groq calls for 60s
  └─ FALLBACK = the authored choice.complication from the bank (today's behavior)
```

**Invariants:**

1. **The engine always wins.** Groq only picks *which* complication and supplies
   narrative. ScrubIn-Core still owns the vitals hit, reserve penalty, death
   check, and recovery decision. A bad/missing Groq answer can never corrupt the
   physiology.
2. **Never block the UI.** The whole Groq leg is subject to `GROQ_TIMEOUT_MS`; if
   it doesn't answer in time, the request continues with the authored
   complication. Worst case the student sees the *old* behavior, never an error.
3. **Validate, don't trust.** `complication_type` is checked against the
   procedure's `allowedComplications` (from ScrubIn-Core's procedure registry)
   AND the engine's `COMPLICATION_VITAL_EFFECTS` keys. Anything else falls back.
4. **Silent degradation.** All Groq failures log to Express's console only —
   there is no user-facing error path from Groq.
5. **Debrief falls back to the existing Groq path**, then to `proxyToCore`
   (which is already the current `/api/evaluate` behavior). If even that fails,
   the client's existing fallback summary renders (the current app already
   handles a missing evaluation).

---

## 4. Step-by-Step Implementation TODO List

### Phase 1 — Groq client (Express, `scrubin` repo) — complete

- [x] **`server/llmClient.ts`** provides `classifyChoice(context)`, strict enum /
  allowlist validation, JSON-mode Groq calls, timeout handling, and a circuit
  breaker. Dynamic debrief generation remains on the existing `/api/evaluate`
  path and is outside this classifier's contract.
- [x] **`server/index.ts`** sends the step context, applies only validated Groq
  complication types, and preserves the authored complication on fallback.
- [x] **`server/llmClient.test.ts`** covers valid responses, invalid schema,
  malformed JSON, timeout, HTTP failure, missing key, and circuit recovery.

### Phase 2 — Client (scrubin repo) — complete

- [x] **`client/src/pages/Simulation.tsx`** sends `chosen_action`,
  `step_description`, `procedure_phase`, procedure ID, and patient profile.
- [x] **`client/src/pages/Simulation.tsx`** renders the validated narrative in
  the complication panel and consumes the core's attending-note event without
  duplicating it in the timeline.
- [ ] Optional future enhancement: when Groq says an authored choice is actually
  correct (`is_correct: true`), treat it as a correct step instead of forcing a
  complication. The current safety contract still treats the stock bank as the
  authoritative wrong/correct source.

### Phase 3 — Python engine (Scrubin-Core repo) — complete

- [x] **`server.py`** accepts a bounded optional `narrative` in
  `ComplicateRequest`, echoes it as an `🧠 Attending Note` event, and returns it
  as `narrative` for the client.
- [x] **`scrubin_core_procedures.py`** — no changes required; the engine's
  `COMPLICATION_VITAL_EFFECTS` and per-procedure `allowedComplications` remain
  the validation contract.
- [x] **`tests/test_debrief_evaluation.py`** — contract coverage proves the
  narrative changes neither vitals nor physiological reserve.

### Phase 4 — Env & docs — complete

- [x] **`.env.example`** documents the Groq key, endpoint, model, timeout, and
  circuit-breaker settings. The key is never committed or printed.
- [x] **`server/llmClient.ts`** reads the settings at request time and never
  exposes the key to the browser.
- [x] **`README.md`** documents the hybrid layer, server-only secret handling,
  and the no-Groq fallback guarantee.
- [x] **`deploy/DEPLOY.md` / `docker-compose.yml`** pass the Groq settings only
  to the API container and explain the VM setup.

### Phase 5 — Verify

- [ ] `npx vitest run server` — llmClient fallback/circuit tests green
- [ ] `npx tsc --noEmit` — clean
- [ ] Python: `python -m pytest tests/` — all 579 still green (engine untouched)
- [ ] Live playtest in the Preview tab: pick a wrong stock option on Step 1
  ("Confirm identity and consent") → expect a *mechanistically sensible*
  complication (e.g., infection/safety-related, NOT random hypoxia) with the
  Groq explanation in the event timeline
- [ ] Kill the Groq key / set an invalid one → confirm the game falls back to the
  authored complication with no crash and no user-visible error
- [ ] (If debrief is wired) run one full case → debrief is Groq-generated with
  specific references

---

## Open questions / decisions for you

1. **Where should the Groq call live long-term?** This plan puts it in Express.
   If you'd rather the Python engine call Groq directly (single hop from the
   core), the trade-off is engine purity vs. latency — happy to re-plan around
   that.
2. **Do you want Groq to also grade recovery decisions during an active
   complication** (not just the initial wrong step)? It's additive with the same
   schema.
3. **`safety_violation` as a first-class type** would require new engine vitals
   effects + treating archetypes; the plan maps it to existing types instead.
   Confirm if you want the bigger engine change.
