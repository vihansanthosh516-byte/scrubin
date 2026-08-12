// One-off measurement: untended polls-to-lethal for every procedure x allowed
// complication, using the Python DECAY_RATES mirror (offline oracle).
import { listProcedures } from "../server/engine/procedures/registry.js";
import { VitalsEngine } from "../server/engine/vitals/engine.js";
import { DeterministicRNG } from "../server/engine/rng.js";
import { clampVitals, COMPLICATION_TYPES, type Vitals, type ComplicationType } from "../server/engine/state/models.js";

const LETHAL = {
  bp_systolic_below: 40,
  spo2_below: 65,
  heart_rate_above: 180,
  heart_rate_below: 30,
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

function isLethal(v: Vitals): boolean {
  return (
    v.bp_systolic < LETHAL.bp_systolic_below ||
    v.spo2 < LETHAL.spo2_below ||
    v.heart_rate > LETHAL.heart_rate_above ||
    v.heart_rate < LETHAL.heart_rate_below
  );
}

function pollsToLethal(procId: string, comp: ComplicationType): number {
  const proc = listProcedures().find((p) => p.id === procId)!;
  const start = { ...proc.patient.baselineVitals, ...proc.initialState.vitals_override };
  const engine = new VitalsEngine(start, new DeterministicRNG(1), proc.initialState.riskProfile);
  engine.applyComplication(comp, 1.0);
  let current = engine.snapshot();
  for (let polls = 1; polls <= 400; polls++) {
    const rates = PY_DECAY_RATES[comp];
    for (const [k, delta] of Object.entries(rates)) {
      if (delta !== undefined) (current as any)[k] += delta;
    }
    current = clampVitals(current);
    if (isLethal(current)) return polls;
  }
  return 401;
}

const mins: Record<string, number> = {};
const rows: [string, string, number][] = [];
for (const proc of listProcedures()) {
  for (const comp of proc.allowedComplications) {
    const polls = pollsToLethal(proc.id, comp);
    rows.push([proc.id, comp, polls]);
    mins[comp] = Math.min(mins[comp] ?? Infinity, polls);
  }
}

for (const [procId, comp, polls] of rows) {
  console.log(`${procId.padEnd(24)} ${comp.padEnd(18)} ${polls} polls`);
}
console.log("\n── MIN polls per complication ──");
for (const comp of COMPLICATION_TYPES) {
  if (mins[comp] !== undefined) console.log(`${comp.padEnd(18)} min ${mins[comp]} polls`);
}
