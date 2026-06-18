/** Simple client‑side persistence for simulation state */
export interface SavedSim {
  id: string; // session_id
  state: any; // snapshot of the simulation state
  savedAt: number;
}

const STORAGE_KEY = "scrubin_saved_sims";

export function listSavedSimulations(): SavedSim[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveSimulation(id: string, state: any) {
  const sims = listSavedSimulations();
  const existingIndex = sims.findIndex((s) => s.id === id);
  const now = Date.now();
  const entry: SavedSim = { id, state, savedAt: now };
  if (existingIndex >= 0) sims[existingIndex] = entry; else sims.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sims));
}

export function deleteSimulation(id: string) {
  const sims = listSavedSimulations().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sims));
}
