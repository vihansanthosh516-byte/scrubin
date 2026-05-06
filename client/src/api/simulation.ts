const API = "/api/sim";

export interface Vitals {
  spo2: number;
  heart_rate: number;
  bp_systolic: number;
  bp_diastolic: number;
  temperature: number;
  respiratory_rate: number;
}

export interface PatientInfo {
  name: string;
  age: number;
  sex: string;
  weight: string;
  bloodType: string;
  admission: string;
  mood: string;
  comorbidities: string[];
  baselineVitals: Vitals;
}

export interface DecisionOptionPublic {
  id: string;
  label: string;
  archetype: string;
}

export interface PendingDecisionPublic {
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

export interface DecisionResultPublic {
  wasCorrect: boolean;
  feedback: string;
  scoreDelta: number;
  complicationTriggered: string | null;
}

export interface SessionStartResponse {
  session_id: string;
  tick: number;
  procedure_id: string;
  procedure_name: string;
  patient: PatientInfo;
  total_ticks: number;
}

export interface NextResponse {
  tick: number;
  vitals: Vitals;
  escalation_phase: string;
  procedure_phase: string;
  active_complication: string | null;
  pending_decision: PendingDecisionPublic;
  events: string[];
  score: number;
  completed: boolean;
}

export interface DecideResponse {
  tick: number;
  vitals: Vitals;
  escalation_phase: string;
  procedure_phase: string;
  active_complication: string | null;
  decision_result: DecisionResultPublic;
  next_tick_ready: boolean;
  events: string[];
  score: number;
  completed: boolean;
  correct_decisions: number;
  total_decisions: number;
}

export interface ProceduresResponse {
  procedures: {
    id: string;
    name: string;
    category: string;
    specialty: string;
    description: string;
    patient: PatientInfo;
    totalTicks: number;
    phases: { id: number; name: string; icon: string; short: string }[];
  }[];
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw body;
  }
  return res.json();
}

export async function startSimulation(seed?: number, procedure = "appendectomy"): Promise<SessionStartResponse> {
  return apiFetch<SessionStartResponse>(`${API}/start`, {
    method: "POST",
    body: JSON.stringify({ seed, procedure }),
  });
}

export async function nextTick(session_id: string): Promise<NextResponse> {
  return apiFetch<NextResponse>(`${API}/next`, {
    method: "POST",
    body: JSON.stringify({ session_id }),
  });
}

export async function submitDecision(session_id: string, decision_id: string, option_id: string): Promise<DecideResponse> {
  return apiFetch<DecideResponse>(`${API}/decide`, {
    method: "POST",
    body: JSON.stringify({ session_id, decision_id, option_id }),
  });
}

export async function resetSimulation(session_id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`${API}/reset`, {
    method: "POST",
    body: JSON.stringify({ session_id }),
  });
}

export async function getProcedures(): Promise<ProceduresResponse> {
  return apiFetch<ProceduresResponse>(`${API}/procedures`);
}
