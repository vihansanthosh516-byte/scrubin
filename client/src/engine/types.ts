// Types mirroring the Python engine's public snapshot (engine/scrubin_engine).

export type Role = "anesthesia" | "surgeon";

export interface PatientSummary {
  name: string;
  age: number;
  sex: string;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  mallampati: number;
  history: string;
  allergies: string[];
  comorbidities: string[];
  npo_hours: number;
  blood_type: string;
  baseline: { hr: number; sbp: number; dbp: number; rr: number; temp_c: number; hb: number };
}

export interface CreateCaseResponse {
  case_id: string;
  seed: number;
  role: Role;
  scenario: { id: string; name: string; specialty: string; summary: string };
  patient: PatientSummary;
  t?: number;
  status?: CaseState["status"];
}

export interface SavedCase {
  id: string;
  scenario: string;
  scenario_name: string;
  role: Role;
  seed: number;
  tick: number;
  sim_t: number;
  status: CaseState["status"];
  outcome: string | null;
  score: number | null;
  created_at: number;
  updated_at: number;
}

export interface ReplayFrame {
  t: number;
  monitor: MonitorReadout;
  alarms: string[];
  comms: CommsMessage[];
  airway: string;
  status: string;
  surgery: SurgeryState["running"] | null;
  iap: number | null;
}

export interface ReplayData {
  frames: ReplayFrame[];
  every_s: number;
  debrief: Debrief;
  scenario: string;
  role: Role;
  seed: number;
}

export interface CommsMessage {
  id: number;
  t: number;
  from: string;
  name: string;
  text: string;
  kind: "speech" | "question" | "finding" | "sign" | "alarm" | "trainee" | "narration";
}

export interface MonitorReadout {
  attached: string[];
  hr?: number;
  rhythm?: string;
  spo2?: number | null;
  pulse_rate?: number;
  perfusion_index?: number;
  nibp?: { sbp: number | null; dbp: number | null; map: number | null } | null;
  nibp_age_s?: number | null;
  nibp_cycling?: boolean;
  nibp_interval_s?: number;
  art?: { sbp: number; dbp: number; map: number };
  etco2?: number | null;
  rr?: number;
  capno_shape?: "none" | "normal" | "obstructive" | "curare_cleft";
  fio2?: number;
  temp?: number;
  bis?: number;
  tof?: { count: number; ratio: number | null } | null;
  peak_pressure?: number | null;
  tv?: number | null;
}

export interface MachineState {
  o2_flow: number;
  air_flow: number;
  fgf: number;
  sevo_dial: number;
  mode: "manual" | "vcv" | "pcv";
  tv_ml: number;
  rr: number;
  peep: number;
  pinsp: number;
  ie_ratio: number;
  circuit_fio2: number;
  bagging: boolean;
}

export interface AirwayState {
  device: "none" | "nasal_cannula" | "face_mask" | "lma" | "ett";
  cannula_flow: number;
  oral_airway: boolean;
  nasal_airway: boolean;
  jaw_thrust: boolean;
  two_hand_mask: boolean;
  cricoid: boolean;
  ett_depth_cm: number;
  ett_size: number;
  cuff_inflated: boolean;
  lma_size: number;
  intubating: boolean;
  intubation_remaining_s: number;
  attempts: number;
  last_view: number | null;
  peak_pressure: number;
  plateau_pressure: number;
  delivered_tv: number;
  delivered_rr: number;
  capno_shape: string;
}

export interface SurgeryTask {
  id: string;
  name: string;
  done: boolean;
  available: boolean;
  blocked: string | null;
  instruments: string[];
  optional: boolean;
}

export interface SurgeryState {
  mode: "auto" | "trainee";
  running: { task: string; name: string; progress: number; instrument: string | null } | null;
  done: string[];
  iap: number;
  bleeding: boolean;
  findings: string[];
  paused: boolean;
  finished: boolean;
  tasks: SurgeryTask[];
  instruments: Record<string, string>;
}

export interface CaseState {
  type: "state";
  t: number;
  tick: number;
  role: Role;
  status: "pre_induction" | "anesthetized" | "emergence" | "ended";
  outcome: string | null;
  monitor: MonitorReadout;
  alarms: string[];
  machine: MachineState;
  airway: AirwayState;
  infusions: Record<string, { rate: number; unit: string }>;
  position: string;
  pending: { action: Record<string, unknown>; from: string; question: string } | null;
  comms: CommsMessage[];
  patient_signs: { consciousness: string; breathing: string; moving: boolean; fasciculating: boolean };
  fluids: { in_ml: number; blood_loss_ml: number; urine_ml: number };
  drug_log: { t: number; drug: string; amount: number; unit: string; by: string }[];
  surgery?: SurgeryState;
  speed: number;
  paused: boolean;
}

export interface DrugInfo {
  id: string;
  name: string;
  unit: string;
  class: string;
  concentration: string;
  infusion_unit: string;
  aliases: string[];
  notes: string;
}

export interface Catalog {
  drugs: DrugInfo[];
  fluids: string[];
  speeds: number[];
  instruments: Record<string, string>;
}

export interface DebriefItem {
  domain: string;
  title: string;
  grade: "good" | "fair" | "poor" | "n/a";
  detail: string;
  teaching: string;
}

export interface Debrief {
  role: Role;
  outcome: string;
  duration_min: number;
  score: number | null;
  items: DebriefItem[];
  metrics: Record<string, number | null>;
  timeline: { t: number; kind: string; [k: string]: unknown }[];
  trend: { t: number; hr: number; sbp: number; dbp: number; map: number; spo2: number; etco2: number; bis: number; mac: number; iap: number; blood_loss: number }[];
  hidden: Record<string, unknown>;
  surgery: { notes: string[]; occult: string[]; findings: string[] };
  blood_loss_ml: number;
  fluids_in_ml: number;
}

export type Action = Record<string, unknown> & { type: string };
