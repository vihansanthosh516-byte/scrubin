// ── Core Vitals ──
export interface Vitals {
  spo2: number;
  heart_rate: number;
  bp_systolic: number;
  bp_diastolic: number;
  temperature: number;
  respiratory_rate: number;
}

export const DEFAULT_VITALS: Vitals = {
  spo2: 98,
  heart_rate: 72,
  bp_systolic: 120,
  bp_diastolic: 80,
  temperature: 37.0,
  respiratory_rate: 16,
};

export const VITAL_RANGES: Record<keyof Vitals, [number, number]> = {
  spo2: [40, 100],
  heart_rate: [20, 220],
  bp_systolic: [30, 250],
  bp_diastolic: [20, 150],
  temperature: [30, 44],
  respiratory_rate: [4, 60],
};

export function clampVitals(v: Vitals): Vitals {
  const result: Vitals = {
    spo2: Math.max(VITAL_RANGES.spo2[0], Math.min(VITAL_RANGES.spo2[1], v.spo2)),
    heart_rate: Math.max(VITAL_RANGES.heart_rate[0], Math.min(VITAL_RANGES.heart_rate[1], v.heart_rate)),
    bp_systolic: Math.max(VITAL_RANGES.bp_systolic[0], Math.min(VITAL_RANGES.bp_systolic[1], v.bp_systolic)),
    bp_diastolic: Math.max(VITAL_RANGES.bp_diastolic[0], Math.min(VITAL_RANGES.bp_diastolic[1], v.bp_diastolic)),
    temperature: Math.max(VITAL_RANGES.temperature[0], Math.min(VITAL_RANGES.temperature[1], v.temperature)),
    respiratory_rate: Math.max(VITAL_RANGES.respiratory_rate[0], Math.min(VITAL_RANGES.respiratory_rate[1], v.respiratory_rate)),
  };
  // Physiologic invariant mirroring the Python clamp_vitals: diastolic can never
  // reach or exceed systolic. Anchor on systolic (the BP < 40 mortality driver).
  if (result.bp_diastolic >= result.bp_systolic) {
    result.bp_diastolic = result.bp_systolic - 1;
  }
  return result;
}

// ── Complication Types ──
export const COMPLICATION_TYPES = [
  "hypoxia",
  "hemorrhage",
  "infection",
  "thrombosis",
  "cardiac_arrhythmia",
  "anaphylaxis",
  "nerve_injury",
  "fluid_overload",
] as const;

export type ComplicationType = (typeof COMPLICATION_TYPES)[number];

export const COMPLICATION_VITAL_EFFECTS: Record<ComplicationType, Partial<Vitals>> = {
  hypoxia:             { spo2: -12, heart_rate: +15, respiratory_rate: +8, bp_systolic: -5 },
  hemorrhage:          { heart_rate: +35, bp_systolic: -30, bp_diastolic: -20, spo2: -3, respiratory_rate: +6 },
  infection:           { temperature: +2.0, heart_rate: +12, bp_systolic: -8 },
  thrombosis:          { heart_rate: +10, bp_systolic: -15, spo2: -6, respiratory_rate: +4 },
  cardiac_arrhythmia:  { heart_rate: +40, bp_systolic: -25, bp_diastolic: -15, spo2: -5 },
  anaphylaxis:         { heart_rate: +30, bp_systolic: -40, bp_diastolic: -25, spo2: -10, respiratory_rate: +12 },
  nerve_injury:        { heart_rate: +12, bp_systolic: +10, respiratory_rate: +3 },
  fluid_overload:      { spo2: -8, heart_rate: +8, bp_systolic: +10, respiratory_rate: +5 },
};

// ── Decision Archetypes ──
export const DECISION_ARCHETYPES = [
  "AIRWAY_STABILITY",
  "HEMODYNAMIC_CONTROL",
  "BLEEDING_CONTROL",
  "INFECTION_MANAGEMENT",
  "PAIN_MANAGEMENT",
  "DIAGNOSTIC_STEP",
  "SURGICAL_DECISION",
  "POST_OP_MONITORING",
] as const;

export type DecisionArchetypeType = (typeof DECISION_ARCHETYPES)[number];

// ── Archetype→Complication mapping ──
export const ARCHETYPE_COMPLICATION_MAP: Record<DecisionArchetypeType, ComplicationType[]> = {
  AIRWAY_STABILITY:     ["hypoxia", "anaphylaxis"],
  HEMODYNAMIC_CONTROL:  ["hemorrhage", "cardiac_arrhythmia", "fluid_overload", "anaphylaxis"],
  BLEEDING_CONTROL:     ["hemorrhage"],
  INFECTION_MANAGEMENT: ["infection"],
  PAIN_MANAGEMENT:      ["nerve_injury"],
  DIAGNOSTIC_STEP:      ["infection", "thrombosis", "nerve_injury"],
  SURGICAL_DECISION:    ["hemorrhage", "nerve_injury", "thrombosis"],
  POST_OP_MONITORING:   ["infection", "thrombosis", "fluid_overload"],
};

// ── Procedure-phase awareness ──
// Mirrors scrubin_core_procedures.py: each procedure phase falls into one of
// three buckets (pre-op / intra-op / post-op), and each archetype is only
// offered in the buckets where its interventions make clinical sense (e.g.
// BLEEDING_CONTROL — cautery/ligation — only while the patient is in the OR).
// The engine prefers phase-eligible archetypes so decisions match where the
// surgery actually is, falling back so a complication is always resolvable.
export type PhaseBucket = "pre_op" | "intra_op" | "post_op";

const PHASE_PRE_KEYWORDS = [
  "intake", "pre-op", "preop", "evaluation", "positioning",
  "stabilization", "induction", "anesthesia", "consult", "planning", "template",
];
const PHASE_POST_KEYWORDS = ["post-op", "postop", "debrief", "icu", "recovery"];

/** Map a procedure phase NAME to a bucket. Phases that aren't recognizably
 *  pre- or post-op are treated as intra-op (the default operating-room state). */
export function classifyPhaseBucket(name: string): PhaseBucket {
  const n = (name ?? "").toLowerCase();
  for (const kw of PHASE_POST_KEYWORDS) {
    if (n.includes(kw)) return "post_op";
  }
  for (const kw of PHASE_PRE_KEYWORDS) {
    if (n.includes(kw)) return "pre_op";
  }
  return "intra_op";
}

export const ARCHETYPE_PHASE_BUCKETS: Record<DecisionArchetypeType, PhaseBucket[]> = {
  AIRWAY_STABILITY:     ["pre_op", "intra_op", "post_op"],
  HEMODYNAMIC_CONTROL:  ["intra_op", "post_op"],
  BLEEDING_CONTROL:     ["intra_op"],
  INFECTION_MANAGEMENT: ["intra_op", "post_op"],
  PAIN_MANAGEMENT:      ["intra_op", "post_op"],
  DIAGNOSTIC_STEP:      ["pre_op", "intra_op", "post_op"],
  SURGICAL_DECISION:    ["intra_op"],
  POST_OP_MONITORING:   ["post_op"],
};

// Per-OPTION phase overrides on top of the archetype's buckets. Options not
// listed inherit their archetype's buckets. Treating options are NEVER filtered
// (a complication must always stay resolvable) — this governs the DECOY pool
// only, so e.g. "Surgical exploration" never appears as a decoy during Post-Op
// and "CT imaging" is not offered mid-case.
export const OPTION_PHASE_OVERRIDES: Partial<Record<string, PhaseBucket[]>> = {
  exploration: ["intra_op"], // surgical exploration only in the OR
  imaging: ["pre_op", "post_op"], // no intra-operative imaging
};

// ── Escalation Phases ──
export const ESCALATION_PHASES = [
  "stable_workup",
  "complication_risk",
  "active_complication",
  "crisis_management",
  "recovery_or_failure",
] as const;

export type EscalationPhase = (typeof ESCALATION_PHASES)[number];

// ── Procedure Category ──
export type ProcedureCategory = "beginner" | "intermediate" | "advanced";

// ── Risk Profile ──
export interface RiskProfile {
  base_complication_chance: number;   // per tick, 0-1
  crisis_threshold_factor: number;    // multiplier on vital deviation to trigger crisis
  recovery_speed: number;             // 0-1, how fast vitals recover post-intervention
}

// ── Patient State Template ──
export interface PatientStateTemplate {
  name: string;
  age: number;
  sex: "Male" | "Female";
  weight: string;
  bloodType: string;
  admission: string;
  mood: string;
  comorbidities: string[];
  baselineVitals: Vitals;
}

// ── Procedure Definition (MASTER TEMPLATE) ──
export interface ProcedureDefinition {
  id: string;
  name: string;
  category: ProcedureCategory;
  specialty: string;
  description: string;
  patient: PatientStateTemplate;
  initialState: {
    vitals_override: Partial<Vitals>;
    riskProfile: RiskProfile;
  };
  complicationWeights: Record<ComplicationType, number>;
  allowedComplications: ComplicationType[];
  decisionArchetypes: DecisionArchetypeType[];
  escalationCurve: EscalationModel;
  phases: { id: number; name: string; icon: string; short: string }[];
  totalTicks: number;
}

// ── Escalation Model ──
export interface EscalationModel {
  phase1: { tickRange: [number, number]; label: string };
  phase2: { tickRange: [number, number]; label: string };
  phase3: { tickRange: [number, number]; label: string };
  phase4: { tickRange: [number, number]; label: string };
  phase5: { tickRange: [number, number]; label: string };
}

export interface DecisionOption {
  id: string;
  label: string;
  archetype: DecisionArchetypeType;
  correctForComplications: ComplicationType[];
  effectOnVitals: Partial<Vitals>;
  riskIfWrong: Partial<Vitals>;
  feedback: { correct: string; wrong: string };
}

export interface DecisionOptionPublic {
  id: string;
  label: string;
  archetype: string;
}

export interface TickDecision {
  id: string;
  tick: number;
  phase: EscalationPhase;
  phaseLabel: string;
  procedurePhase: string;
  archetype: DecisionArchetypeType;
  prompt: string;
  context: string;
  options: DecisionOption[];
  urgency: "low" | "medium" | "high" | "critical";
}

export interface TickDecisionPublic {
  id: string;
  tick: number;
  phase: string;
  phaseLabel: string;
  procedurePhase: string;
  archetype: string;
  prompt: string;
  context: string;
  options: DecisionOptionPublic[];
  urgency: "low" | "medium" | "high" | "critical";
}

export interface PendingDecisionState {
  tick: number;
  decisionId: string;
  resolved: boolean;
}

export interface DecisionResult {
  decisionId: string;
  optionId: string;
  wasCorrect: boolean;
  complicationTriggered: ComplicationType | null;
  vitalsBefore: Vitals;
  vitalsAfter: Vitals;
  feedback: string;
  scoreDelta: number;
}

export interface DecisionResultPublic {
  wasCorrect: boolean;
  feedback: string;
  scoreDelta: number;
  complicationTriggered: string | null;
}

export interface NextTickResponse {
  tick: number;
  vitals: Vitals;
  escalation_phase: EscalationPhase;
  procedure_phase: string;
  active_complication: ComplicationType | null;
  pending_decision: TickDecisionPublic | null;
  events: string[];
  score: number;
  completed: boolean;
}

export interface DecideResponse {
  tick: number;
  vitals: Vitals;
  escalation_phase: EscalationPhase;
  procedure_phase: string;
  active_complication: ComplicationType | null;
  // Same shape as NextTickResponse: null after a decision resolves (the engine
  // clears the pending decision on submit and the client fetches the next one
  // via /next), an object while a decision is outstanding. Mirrors the Python
  // core's /decide contract.
  pending_decision: TickDecisionPublic | null;
  decision_result: DecisionResultPublic;
  next_tick_ready: boolean;
  events: string[];
  score: number;
  completed: boolean;
  correct_decisions: number;
  total_decisions: number;
}

// ── Session State ──
export interface SessionState {
  sessionId: string;
  tick: number;
  totalTicks: number;
  vitals: Vitals;
  procedureId: string;
  procedureName: string;
  patient: PatientStateTemplate;
  escalationPhase: EscalationPhase;
  procedurePhase: string;
  activeComplication: ComplicationType | null;
  pendingDecision: TickDecision | null;
  pendingDecisionState: PendingDecisionState | null;
  score: number;
  maxScore: number;
  completed: boolean;
  decisionHistory: DecisionResult[];
  complicationsEncountered: number;
  correctDecisions: number;
  totalDecisions: number;
}

// ── Tick Result ──
export interface TickResult {
  tick: number;
  vitalsBefore: Vitals;
  vitalsAfter: Vitals;
  escalationPhase: EscalationPhase;
  procedurePhase: string;
  activeComplication: ComplicationType | null;
  pendingDecision: TickDecision | null;
  pendingDecisionState: PendingDecisionState | null;
  decisionResult: DecisionResult | null;
  events: string[];
  score: number;
}
