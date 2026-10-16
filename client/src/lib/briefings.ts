// Pre-op briefings, assembled only from data the simulator already uses: the procedure catalog
// (patient, indication, vitals) and the surgery step banks (approach, anatomy at risk, steps).
// Nothing here is written separately, so a briefing can never disagree with its case.
import catalog from "@/data/procedureCatalog.json";
import { STOCK_STEP_BANKS, type StepDef, type StepKind } from "@/data/stockSteps";
import { ENGINE_SCENARIO } from "@/engine/scenarios";

export const RISK_LABELS: Record<string, string> = {
  hemorrhage: "Haemorrhage",
  infection: "Infection",
  hypoxia: "Hypoxia",
  nerve_injury: "Nerve injury",
  thrombosis: "Thrombosis (VTE)",
  cardiac_arrhythmia: "Arrhythmia",
  anaphylaxis: "Anaphylaxis",
  fluid_overload: "Fluid overload",
};

const PHASES: { name: string; kinds: StepKind[] }[] = [
  { name: "Before incision", kinds: ["preop", "antibiotic", "position"] },
  { name: "Access and exposure", kinds: ["access", "exposure"] },
  // "vitals" and "bleed" steps are scripted events (a pressure drop, a slipped tie), so a briefing never lists them.
  { name: "The operation", kinds: ["landmark", "vessel", "nerve", "dissect", "core", "verify"] },
  { name: "Closing", kinds: ["closure"] },
  { name: "After the operation", kinds: ["postop", "dvt"] },
];

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Briefing {
  id: string;
  name: string;
  specialty: string;
  difficulty: Difficulty;
  description: string;
  realtime: boolean;
  patient: {
    name: string;
    age: number;
    sex: string;
    weight?: string;
    bloodType?: string;
    presentation?: string;
    comorbidities: string[];
    vitals?: { hr?: number; bp?: string; spo2?: number; rr?: number; temp?: number };
  };
  risks: string[];
  know: { label: string; value: string }[];
  /** Step titles only: descriptions carry case clues (an allergy band, a falling BP) the student should find in the OR. */
  phases: { name: string; steps: string[] }[];
  stepCount: number;
}

// Steps whose condition needs a flag (`all`/`any`) only happen after a complication or a choice;
// steps with only `none` clauses are the normal path.
const onNormalPath = (s: StepDef) => !s.when || !(s.when.all?.length || s.when.any?.length);
const sentence = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function build(p: any): Briefing {
  const bank = STOCK_STEP_BANKS[p.id];
  const spec = bank?.spec;
  const v = p.patient?.baselineVitals ?? {};
  const raw = String(p.difficulty || p.category || "").toLowerCase();
  const steps = (bank?.steps ?? []).filter(onNormalPath);
  return {
    id: p.id,
    name: p.name,
    specialty: p.specialty || "Other",
    difficulty: (["beginner", "intermediate", "advanced"].includes(raw) ? raw : "beginner") as Difficulty,
    description: p.description,
    realtime: Boolean(ENGINE_SCENARIO[p.id]),
    patient: {
      name: p.patient?.name,
      age: p.patient?.age,
      sex: p.patient?.sex,
      weight: p.patient?.weight,
      bloodType: p.patient?.bloodType,
      presentation: p.patient?.admission,
      comorbidities: p.patient?.comorbidities ?? [],
      vitals: {
        hr: v.heart_rate,
        bp: v.bp_systolic && v.bp_diastolic ? `${v.bp_systolic}/${v.bp_diastolic}` : undefined,
        spo2: v.spo2,
        rr: v.respiratory_rate,
        temp: v.temperature,
      },
    },
    risks: (spec?.risks ?? p.allowedComplications ?? []).map((r: string) => RISK_LABELS[r] ?? r),
    know: spec
      ? [
          { label: "Position", value: sentence(spec.position) },
          { label: "Approach", value: sentence(spec.approach) },
          { label: "Key landmark", value: sentence(spec.landmark) },
          { label: "Vessel to control", value: sentence(spec.vessel) },
          { label: "Nerve to protect", value: sentence(spec.nerve) },
          { label: "Target structure", value: sentence(spec.structure) },
          { label: "Signature instrument", value: sentence(spec.instrument) },
        ]
      : [],
    phases: PHASES.map((ph) => ({
      name: ph.name,
      steps: steps.filter((s) => ph.kinds.includes(s.kind)).map((s) => s.title),
    })).filter((ph) => ph.steps.length > 0),
    stepCount: (bank?.steps ?? []).length,
  };
}

export const BRIEFINGS: Briefing[] = (catalog as any).procedures.map(build);

export const getBriefing = (id: string) => BRIEFINGS.find((b) => b.id === id);
