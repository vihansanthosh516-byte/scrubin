import { request } from "./api";

export interface ProcedureSummary {
  id: string;
  name: string;
  category: string;
  specialty: string;
  description: string;
  patient: any;
  totalTicks: number;
  phases: any[];
  // UI‑only fields added by backend enrichment
  thumbnail?: string;
  tags?: string[];
  estimated_time?: string;
}

/** List all available procedure scenarios */
export function listProcedures() {
  return request<{ procedures: ProcedureSummary[] }>("/api/scenarios");
}

/** Get details for a specific procedure */
export function getProcedure(id: string) {
  return request<ProcedureSummary>(`/api/scenarios/${id}`);
}
