import { request } from "./api";

export interface SimulationStartParams {
  seed?: number;
  procedure?: string;
}

export interface SimulationState {
  session_id: string;
  tick: number;
  procedure_id: string;
  procedure_name: string;
  patient: any;
  total_ticks: number;
}

export interface NextTickResponse {
  tick: number;
  vitals: any;
  escalation_phase: number;
  procedure_phase: number;
  active_complication: any;
  pending_decision: any;
  events: any[];
  score: number;
  completed: boolean;
}

export interface DecideResponse {
  tick: number;
  vitals: any;
  escalation_phase: number;
  procedure_phase: number;
  active_complication: any;
  decision_result: any;
  next_tick_ready: boolean;
  events: any[];
  score: number;
  completed: boolean;
  correct_decisions: number;
  total_decisions: number;
}

export function startSimulation(params: SimulationStartParams) {
  return request<SimulationState>("/api/sim/start", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function nextTick(session_id: string) {
  return request<NextTickResponse>("/api/sim/next", {
    method: "POST",
    body: JSON.stringify({ session_id }),
  });
}

export function decide(
  session_id: string,
  decision_id: number,
  option_id: string
) {
  return request<DecideResponse>("/api/sim/decide", {
    method: "POST",
    body: JSON.stringify({ session_id, decision_id, option_id }),
  });
}

export function resetSimulation(session_id: string) {
  return request<{ ok: boolean }>("/api/sim/reset", {
    method: "POST",
    body: JSON.stringify({ session_id }),
  });
}
