import { describe, it, expect } from "vitest";
import {
  type ComplicationType,
  type Vitals,
  COMPLICATION_TYPES,
  ARCHETYPE_COMPLICATION_MAP,
  clampVitals,
} from "../state/models.js";
import { VitalsEngine } from "../vitals/engine.js";
import { DecisionEngine } from "../decision/engine.js";
import { DeterministicRNG } from "../rng.js";
import { SimulationOrchestrator } from "../orchestrator.js";
import { listProcedures, getProcedure } from "../procedures/registry.js";
import { toDecideResponse } from "../serialize.js";

// ─────────────────────────────────────────────────────────────────────────────
// The Python core (C:\Users\vihan\Scrubin-Core) is the authority on death and
// decay. These constants mirror scrubin_core_engine.py so the TS engine's
// recovery tables are tested against the same lethal thresholds and decay rates
// the real engine runs. `check_mortality()` (death) and `DECAY_RATES` (per-poll
// decay while a complication is untended in branched mode) are the contract.
// ─────────────────────────────────────────────────────────────────────────────

const LETHAL = {
  bp_systolic_below: 40, // "Severe Hypotension (BP < 40)"
  spo2_below: 65, // "Severe Hypoxia (SpO2 < 65%)"
  heart_rate_above: 180, // "Uncontrolled tachyarrhythmia (HR > 180)"
  heart_rate_below: 30, // "Severe bradycardia (HR < 30)"
} as const;

const PY_DECAY_RATES: Record<ComplicationType, Partial<Vitals>> = {
  hypoxia: { spo2: -2.0, heart_rate: +2.0, respiratory_rate: +1.0, bp_systolic: -1.0 },
  hemorrhage: { heart_rate: +4.0, bp_systolic: -3.5, bp_diastolic: -2.5, spo2: -0.5, respiratory_rate: +1.0 },
  infection: { temperature: +0.3, heart_rate: +1.5, bp_systolic: -1.0 },
  thrombosis: { heart_rate: +1.5, bp_systolic: -2.0, spo2: -1.0, respiratory_rate: +0.8 },
  cardiac_arrhythmia: { heart_rate: +5.5, bp_systolic: -3.0, bp_diastolic: -2.0, spo2: -0.8 },
  anaphylaxis: { heart_rate: +4.5, bp_systolic: -4.5, bp_diastolic: -3.0, spo2: -1.5, respiratory_rate: +1.5 },
  nerve_injury: { heart_rate: +1.5, bp_systolic: +1.0, respiratory_rate: +0.5 },
  fluid_overload: { spo2: -1.2, heart_rate: +1.0, bp_systolic: +1.5, respiratory_rate: +0.8 },
};

// Pacing floors (in polls, 1.5 s each) for the OFFLINE oracle: minimum untended
// polls-to-lethal for each complication across every procedure in the registry.
// Measured minima — hypoxia 8, hemorrhage 4, infection 26, thrombosis 24,
// arrhythmia 2 (exploratory-laparotomy's HR-130 trauma patient), nerve_injury 58.
// Floors sit ~2 below the measured min so a ~2x decay speedup trips them.
const OFFLINE_PACING_FLOORS: Partial<Record<ComplicationType, number>> = {
  hypoxia: 5,
  hemorrhage: 3,
  infection: 15,
  thrombosis: 12,
  cardiac_arrhythmia: 2,
  nerve_injury: 30,
};

function isLethal(v: Vitals): boolean {
  return (
    v.bp_systolic < LETHAL.bp_systolic_below ||
    v.spo2 < LETHAL.spo2_below ||
    v.heart_rate > LETHAL.heart_rate_above ||
    v.heart_rate < LETHAL.heart_rate_below
  );
}

/** Offline mirror of the Python untended-decay loop: complication onset, then
 *  one DECAY_RATES step per poll until a lethal threshold is crossed. */
function pollsToLethal(procId: string, comp: ComplicationType): number {
  const proc = getProcedure(procId);
  const start = { ...proc.patient.baselineVitals, ...proc.initialState.vitals_override };
  const engine = new VitalsEngine(start, new DeterministicRNG(1), proc.initialState.riskProfile);
  engine.applyComplication(comp, 1.0);
  let current = engine.snapshot();
  for (let polls = 1; polls <= 400; polls++) {
    const rates = PY_DECAY_RATES[comp];
    for (const [key, delta] of Object.entries(rates)) {
      if (delta !== undefined) (current as unknown as Record<string, number>)[key] += delta;
    }
    current = clampVitals(current);
    if (isLethal(current)) return polls;
  }
  return 401;
}

const ALLOWED_PAIRS: [string, ComplicationType][] = listProcedures().flatMap((p) =>
  p.allowedComplications.map((c) => [p.id, c] as [string, ComplicationType])
);

function startVitals(procId: string): Vitals {
  const proc = getProcedure(procId);
  return { ...proc.patient.baselineVitals, ...proc.initialState.vitals_override };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Correct recovery paths — every allowed complication of every procedure must
//    be resolvable by an option the engine can actually offer.
// ─────────────────────────────────────────────────────────────────────────────

describe("Correct recovery paths (recovery contract lock)", () => {
  it.each(ALLOWED_PAIRS)("%s / %s — engine offers a treating option, graded correct", (procId, comp) => {
    const proc = getProcedure(procId);
    const engine = new DecisionEngine(new DeterministicRNG(7), proc);
    const decision = engine.generateDecision(
      1,
      startVitals(procId),
      "active_complication",
      comp,
      "Core Procedure"
    );

    const treating = decision.options.filter((o) => o.correctForComplications.includes(comp));
    expect(treating.length, `${comp} on ${procId}: expected ≥1 treating option, got archetype ${decision.archetype}`).toBeGreaterThan(0);

    // Choosing a treating option is graded correct and triggers nothing new.
    const ok = engine.evaluateDecision(decision, treating[0].id, startVitals(procId), comp);
    expect(ok.wasCorrect).toBe(true);
    expect(ok.complicationTriggered).toBeNull();

    // Choosing a non-treating option is graded wrong — no free ride.
    const wrong = decision.options.find((o) => !o.correctForComplications.includes(comp));
    expect(wrong).toBeDefined();
    const bad = engine.evaluateDecision(decision, wrong!.id, startVitals(procId), comp);
    expect(bad.wasCorrect).toBe(false);

    // The correct intervention + one more decay poll must never reach lethal:
    // a correct recovery always buys at least one more poll.
    const afterTreat = { ...startVitals(procId) };
    for (const [k, delta] of Object.entries(treating[0].effectOnVitals)) {
      if (delta !== undefined) (afterTreat as Record<string, number>)[k] += delta;
    }
    const onePollLater = { ...afterTreat };
    for (const [k, delta] of Object.entries(PY_DECAY_RATES[comp])) {
      if (delta !== undefined) (onePollLater as Record<string, number>)[k] += delta;
    }
    expect(isLethal(clampVitals(onePollLater)), `correct ${treating[0].id} on ${procId}/${comp} should buy ≥1 poll`).toBe(false);
  });

  it("every complication type is mapped by at least one archetype (data sanity)", () => {
    // If a complication vanishes from the archetype map, the engine can never
    // offer a recovery option for it anywhere — the Python core's global
    // fallback depends on this coverage too.
    const covered = new Set<ComplicationType>();
    for (const comps of Object.values(ARCHETYPE_COMPLICATION_MAP)) {
      for (const c of comps) covered.add(c);
    }
    for (const comp of COMPLICATION_TYPES) {
      expect(covered.has(comp), `${comp} must appear in ARCHETYPE_COMPLICATION_MAP`).toBe(true);
    }
  });

  it("a complication spawned through the orchestrator is resolved by a treating option", () => {
    // Drive real sessions until next() spawns a complication directly, then
    // submit a treating recovery option and verify it resolves (complication
    // cleared + "Complication resolved" event) exactly like the Python engine.
    for (let seed = 1; seed <= 400; seed++) {
      const orch = new SimulationOrchestrator(seed, "appendectomy");
      let result: ReturnType<typeof orch.next> | null = null;
      for (let t = 0; t < 25 && !result?.activeComplication; t++) {
        result = orch.next();
        if (result.activeComplication) break;
        const d = result.pendingDecision!;
        orch.submitDecision(d.id, d.options[0].id);
      }
      if (!result?.activeComplication) continue;

      const comp = result.activeComplication;
      const recovery = result.pendingDecision!;
      const treating = recovery.options.find((o) => o.correctForComplications.includes(comp));
      expect(treating).toBeDefined();

      const resolved = orch.submitDecision(recovery.id, treating!.id);
      expect(resolved.activeComplication).toBeNull();
      expect(resolved.events).toContain("Complication resolved");
      return;
    }
    throw new Error("No seed spawned a complication directly within 400 seeds");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. DecideResponse contract — /decide must include pending_decision in the
//    same shape as /next, /tick, /complicate (mirroring the Python core fix).
// ─────────────────────────────────────────────────────────────────────────────

describe("DecideResponse contract (pending_decision symmetry)", () => {
  it("decide responses always carry pending_decision (null after submit)", () => {
    const orch = new SimulationOrchestrator(42, "appendectomy");
    const first = orch.next();
    const d = first.pendingDecision!;
    const decided = orch.submitDecision(d.id, d.options[0].id);

    const resp = toDecideResponse(decided, orch.getState());
    expect("pending_decision" in resp).toBe(true); // key present, never undefined
    expect(resp.pending_decision).toBeNull(); // engine clears the decision on submit
    expect(resp.next_tick_ready).toBe(true); // client gate fetches /next
    expect(resp.decision_result.wasCorrect).toBeDefined();
  });

  it("a pending decision is serialized while one is outstanding", () => {
    const orch = new SimulationOrchestrator(42, "appendectomy");
    const first = orch.next();
    const resp = toDecideResponse(first, orch.getState());
    expect(resp.pending_decision).not.toBeNull();
    expect(resp.pending_decision!.id).toBe(first.pendingDecision!.id);
    expect(resp.pending_decision!.options.length).toBe(4);
    expect(resp.next_tick_ready).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Complication onset is never instantly lethal — the patient must always get
//    at least one more decision/poll after a complication fires.
// ─────────────────────────────────────────────────────────────────────────────

describe("Complication onset is never instantly lethal", () => {
  it.each(ALLOWED_PAIRS)("%s / %s — onset (severity 1.0) leaves the patient alive", (procId, comp) => {
    const engine = new VitalsEngine(
      startVitals(procId),
      new DeterministicRNG(1),
      getProcedure(procId).initialState.riskProfile
    );
    engine.applyComplication(comp, 1.0);
    const after = engine.snapshot();
    expect(isLethal(after), `${comp} onset on ${procId} killed instantly: ${JSON.stringify(after)}`).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4a. Vitals invariant — bp_systolic must always exceed bp_diastolic (mirrors
//    the Python clamp_vitals fix; the live tier re-checks every engine response).
// ─────────────────────────────────────────────────────────────────────────────

describe("Vitals invariant: bp_systolic > bp_diastolic", () => {
  it("clampVitals enforces sys > dia without disturbing healthy readings", () => {
    const healthy = { spo2: 98, heart_rate: 72, bp_systolic: 120, bp_diastolic: 80, temperature: 37, respiratory_rate: 16 };
    expect(clampVitals({ ...healthy })).toEqual(healthy);

    // The field-reported inversions (infection died at 48.4/61.4, thrombosis at
    // 39.6/61.9): diastolic is pulled below systolic, systolic stays the anchor.
    const inverted = clampVitals({ ...healthy, bp_systolic: 39.6, bp_diastolic: 61.9 });
    expect(inverted.bp_systolic).toBe(39.6);
    expect(inverted.bp_diastolic).toBeLessThan(inverted.bp_systolic);

    // Equal pressures resolve; systolic at the range floor still wins.
    const equal = clampVitals({ ...healthy, bp_systolic: 120, bp_diastolic: 120 });
    expect(equal.bp_diastolic).toBe(119);
    const floor = clampVitals({ ...healthy, bp_systolic: 30, bp_diastolic: 150 });
    expect(floor.bp_diastolic).toBeLessThan(floor.bp_systolic);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4b. Offline decay-pacing oracle — untended complications must take at least the
//    floor number of polls to reach lethal, mirroring the Python DECAY_RATES.
// ─────────────────────────────────────────────────────────────────────────────

describe("Untended decay pacing (Python DECAY_RATES mirror)", () => {
  it.each(ALLOWED_PAIRS)("%s / %s — untended death takes ≥ floor polls", (procId, comp) => {
    const floor = OFFLINE_PACING_FLOORS[comp];
    if (floor === undefined) return; // complication not covered by a floor map
    const polls = pollsToLethal(procId, comp);
    expect(polls, `${comp} on ${procId} reached lethal in ${polls} polls (floor ${floor})`).toBeGreaterThanOrEqual(floor);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Live tier — drives the REAL Python engine (Scrubin-Core) when it is
//    reachable. Skips silently otherwise, so CI without the engine stays green.
//    Wrong recovery must eventually kill — but never before a pacing floor.
//    Correct recovery must keep the patient alive through a full window.
// ─────────────────────────────────────────────────────────────────────────────

const CORE_URL = process.env.SCRUBIN_CORE_URL ?? "http://127.0.0.1:8001";

function probe(url: string, timeoutMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    fetch(url, { signal: ctrl.signal })
      .then((res) => resolve(res.ok))
      .catch(() => resolve(false))
      .finally(() => clearTimeout(timer));
  });
}

const coreReachable = await probe(`${CORE_URL}/health`);

async function liveCall(path: string, body: unknown): Promise<{ status: number; data: any }> {
  const res = await fetch(`${CORE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

// Guaranteed-wrong / correct recovery option ids per complication, mirroring the
// Python ARCHETYPE_INTERVENTIONS (same ids as the TS decision table).
const LIVE_WRONG_OPTION: Record<string, string> = {
  hemorrhage: "observe_hemostasis", // BLEEDING_CONTROL treats:[]
  infection: "cultures_first", // INFECTION_MANAGEMENT treats:[]
  hypoxia: "call_anesthesia", // AIRWAY_STABILITY treats:[]
  nerve_injury: "non_pharmacologic", // PAIN_MANAGEMENT treats:[]
  thrombosis: "consult_specialist", // DIAGNOSTIC_STEP treats:[]
};
// Correct option ids PER COMPLICATION, in priority order (the API's public option
// shape doesn't expose `treats`, so the treating set is encoded here). Drawn from
// the Python ARCHETYPE_INTERVENTIONS. NOTE: serial_labs treats infection/fluid
// overload/hemorrhage but NOT thrombosis — it must never appear in that list.
const LIVE_CORRECT_OPTIONS: Record<string, string[]> = {
  hemorrhage: ["ligation", "cautery", "packing", "blood_transfusion", "fluid_resuscitation", "vasopressor"],
  infection: ["antibiotics_iv", "wound_irrigation", "source_control", "labs", "vitals_check"],
  hypoxia: ["oxygen_therapy", "intubate", "cricothyroidotomy"],
  nerve_injury: ["regional_block", "iv_opioid", "nsaid", "imaging", "modify"],
  thrombosis: ["doppler", "anticoagulation", "imaging", "labs", "modify", "abort"],
};

/** Pick the first OFFERED option from a priority-ordered list (list order wins
 *  over the API's shuffled order). */
function pickPriority(opts: { id: string }[], ids: string[]): string | undefined {
  for (const id of ids) {
    if (opts.some((o) => o.id === id)) return id;
  }
  return opts[0]?.id;
}

async function liveRun(
  comp: ComplicationType,
  wrong: boolean
): Promise<{ died: boolean; deathAtPolls: number | null; resolved: boolean | null }> {
  const s = await liveCall("/start", { procedure: "appendectomy" });
  const sid = s.data.session_id;
  try {
    const c = await liveCall("/complicate", { session_id: sid, complication: comp });
    const pd = c.data?.pending_decision;
    const opts: { id: string }[] = pd?.options ?? [];

    let pick: string | undefined;
    if (wrong) {
      pick =
        opts.find((o) => !LIVE_CORRECT_OPTIONS[comp].includes(o.id))?.id ??
        LIVE_WRONG_OPTION[comp] ??
        opts[0]?.id;
    } else {
      pick = pickPriority(opts, LIVE_CORRECT_OPTIONS[comp]);
    }

    const d = await liveCall("/decide", { session_id: sid, decision_id: pd?.id, option_id: pick });
    const resolved = d.data?.events?.includes("Complication resolved") ?? null;
    // Client gate: one /next after a decide.
    await liveCall("/next", { session_id: sid });

    const cap = wrong ? 150 : 25;
    for (let poll = 1; poll <= cap; poll++) {
      const t = await liveCall("/tick", { session_id: sid });
      if (t.data?.mode === "deceased") return { died: true, deathAtPolls: poll, resolved };
    }
    return { died: false, deathAtPolls: null, resolved };
  } finally {
    await liveCall("/reset", { session_id: sid });
  }
}

const MIN_LIVE_POLLS_BEFORE_DEATH = 3; // ≈ 4.5 s of 1.5 s polls — hemorrhage measured 6–8 untended
const MIN_FUMBLE_TICKS = 3; // hemorrhage fumbling measured 4–6 across 14 randomized patients

/** Fumbling path: repeatedly submit a WRONG recovery, one /next per cycle. */
async function liveFumble(comp: ComplicationType): Promise<{ died: boolean; deathAtTick: number | null }> {
  const s = await liveCall("/start", { procedure: "appendectomy" });
  const sid = s.data.session_id;
  try {
    const c = await liveCall("/complicate", { session_id: sid, complication: comp });
    let pd = c.data?.pending_decision;
    for (let tick = 0; tick < 12; tick++) {
      const opts: { id: string }[] = pd?.options ?? [];
      const wrong =
        opts.find((o) => !LIVE_CORRECT_OPTIONS[comp].includes(o.id))?.id ??
        LIVE_WRONG_OPTION[comp] ??
        opts[0]?.id;
      await liveCall("/decide", { session_id: sid, decision_id: pd?.id, option_id: wrong });
      const n = await liveCall("/next", { session_id: sid });
      if (n.status !== 200) break;
      if (n.data?.mode === "deceased") return { died: true, deathAtTick: n.data.tick };
      pd = n.data.pending_decision;
    }
    return { died: false, deathAtTick: null };
  } finally {
    await liveCall("/reset", { session_id: sid });
  }
}


/** Correct recovery, then advance `windowTicks` stock /next steps; report whether
 *  a spontaneous complication re-enters branched mode (and at which tick). */
async function liveRecoveryWindow(
  comp: ComplicationType,
  windowTicks: number
): Promise<{ reentered: boolean; tick: number | null }> {
  const s = await liveCall("/start", { procedure: "appendectomy" });
  const sid = s.data.session_id;
  try {
    const c = await liveCall("/complicate", { session_id: sid, complication: comp });
    const pd = c.data?.pending_decision;
    const opts: { id: string }[] = pd?.options ?? [];
    await liveCall("/decide", { session_id: sid, decision_id: pd?.id, option_id: pickPriority(opts, LIVE_CORRECT_OPTIONS[comp]) });
    await liveCall("/next", { session_id: sid });
    for (let i = 1; i <= windowTicks; i++) {
      const n = await liveCall("/next", { session_id: sid });
      if (n.status !== 200) break;
      if (n.data.mode === "branched") return { reentered: true, tick: n.data.tick };
    }
    return { reentered: false, tick: null };
  } finally {
    await liveCall("/reset", { session_id: sid });
  }
}

/** BP drops per cycle: fumbling (decide-wrong + /next) vs untended (/tick only). */
async function bpDropPerCycle(comp: ComplicationType, mode: "fumble" | "untended"): Promise<number[]> {
  const s = await liveCall("/start", { procedure: "appendectomy" });
  const sid = s.data.session_id;
  try {
    const c = await liveCall("/complicate", { session_id: sid, complication: comp });
    let prev = c.data.vitals.bp_systolic;
    const drops: number[] = [];
    if (mode === "fumble") {
      let pd = c.data.pending_decision;
      for (let i = 0; i < 3; i++) {
        const opts: { id: string }[] = pd?.options ?? [];
        const wrong =
          opts.find((o) => !LIVE_CORRECT_OPTIONS[comp].includes(o.id))?.id ??
          LIVE_WRONG_OPTION[comp] ??
          opts[0]?.id;
        await liveCall("/decide", { session_id: sid, decision_id: pd?.id, option_id: wrong });
        const n = await liveCall("/next", { session_id: sid });
        if (n.status !== 200 || n.data.mode === "deceased") break;
        drops.push(prev - n.data.vitals.bp_systolic);
        prev = n.data.vitals.bp_systolic;
        pd = n.data.pending_decision;
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const t = await liveCall("/tick", { session_id: sid });
        if (t.status !== 200 || t.data.mode === "deceased") break;
        drops.push(prev - t.data.vitals.bp_systolic);
        prev = t.data.vitals.bp_systolic;
      }
    }
    return drops;
  } finally {
    await liveCall("/reset", { session_id: sid });
  }
}

describe.skipIf(!coreReachable)(`Live Python engine death pacing (${CORE_URL})`, () => {
  it("wrong recovery eventually kills, but never before the pacing floor", async () => {
    for (const comp of Object.keys(LIVE_WRONG_OPTION) as ComplicationType[]) {
      const r = await liveRun(comp, true);
      expect(r.died, `${comp}: engine should still kill on a wrong recovery`).toBe(true);
      expect(
        r.deathAtPolls!,
        `${comp}: died after ${r.deathAtPolls} polls (1.5s each) — below the ${MIN_LIVE_POLLS_BEFORE_DEATH}-poll pacing floor`
      ).toBeGreaterThanOrEqual(MIN_LIVE_POLLS_BEFORE_DEATH);
    }
  }, 180_000);

  it("correct recovery resolves the complication and keeps the patient alive through the full window", async () => {
    for (const comp of Object.keys(LIVE_CORRECT_OPTIONS) as ComplicationType[]) {
      const r = await liveRun(comp, false);
      expect(r.resolved, `${comp}: correct recovery did not emit "Complication resolved"`).toBe(true);
      expect(
        r.died,
        `${comp}: patient died despite a correct recovery (polls to death: ${r.deathAtPolls ?? "—"})`
      ).toBe(false);
    }
  }, 180_000);

  it("fumbling wrong recoveries never kill faster than the decision floor (hemorrhage)", async () => {
    for (let i = 0; i < 5; i++) {
      const r = await liveFumble("hemorrhage");
      expect(r.died, `fumbling hemorrhage should still kill (run ${i + 1})`).toBe(true);
      expect(
        r.deathAtTick!,
        `fumbling hemorrhage died at tick ${r.deathAtTick} — below the ${MIN_FUMBLE_TICKS}-tick floor (run ${i + 1})`
      ).toBeGreaterThanOrEqual(MIN_FUMBLE_TICKS);
    }
  }, 180_000);

  it("a wrong recovery accelerates hemorrhage ~3x faster than untended decay (penalty stacking)", async () => {
    const fumble = await bpDropPerCycle("hemorrhage", "fumble");
    const untended = await bpDropPerCycle("hemorrhage", "untended");
    expect(fumble.length).toBeGreaterThan(0);
    expect(untended.length).toBeGreaterThan(0);

    const fumbleDrop = fumble.reduce((a, b) => a + b, 0) / fumble.length;
    const untendedDrop = untended.reduce((a, b) => a + b, 0) / untended.length;
    expect(untendedDrop).toBeGreaterThan(2); // decay alone ≈ 3.5/poll
    expect(
      fumbleDrop,
      `fumble cycle drops ${fumbleDrop.toFixed(1)} BP vs ${untendedDrop.toFixed(1)} untended — the observe_hemostasis penalty (-8) stacks with decay (-3.5)`
    ).toBeGreaterThan(untendedDrop * 1.5);
  }, 180_000);

  it("a correct recovery is not immediately re-triggered (stabilization window)", async () => {
    // Pre-fix, hemorrhage deterministically re-fired at tick 4 (~100% of runs) the
    // moment the post-resolution cooldown expired while BP was still < 88.
    for (let i = 0; i < 5; i++) {
      const r = await liveRecoveryWindow("hemorrhage", 8);
      expect(
        r.reentered,
        `hemorrhage spontaneously re-triggered at tick ${r.tick} after a correct recovery (run ${i + 1})`
      ).toBe(false);
    }
  }, 180_000);

  it("vitals never report inverted pulse pressure (sys > dia) on the death path", async () => {
    const check = (d: any, where: string) => {
      if (d?.vitals) {
        expect(
          d.vitals.bp_systolic,
          `inverted BP ${d.vitals.bp_systolic}/${d.vitals.bp_diastolic} at ${where}`
        ).toBeGreaterThan(d.vitals.bp_diastolic);
      }
    };
    for (const comp of Object.keys(LIVE_WRONG_OPTION) as ComplicationType[]) {
      const s = await liveCall("/start", { procedure: "appendectomy" });
      const sid = s.data.session_id;
      try {
        const c = await liveCall("/complicate", { session_id: sid, complication: comp });
        check(c.data, `${comp} complicate`);
        let pd = c.data?.pending_decision;
        for (let tick = 0; tick < 12; tick++) {
          const opts: { id: string }[] = pd?.options ?? [];
          const wrong =
            opts.find((o) => !LIVE_CORRECT_OPTIONS[comp].includes(o.id))?.id ??
            LIVE_WRONG_OPTION[comp] ??
            opts[0]?.id;
          await liveCall("/decide", { session_id: sid, decision_id: pd?.id, option_id: wrong });
          const n = await liveCall("/next", { session_id: sid });
          if (n.status !== 200) break;
          check(n.data, `${comp} next#${tick + 1}`);
          if (n.data.mode === "deceased") break;
          pd = n.data.pending_decision;
        }
      } finally {
        await liveCall("/reset", { session_id: sid });
      }
    }
  }, 180_000);
});
