// Syncs real-time OR cases to the signed-in user's account through /api/cases, so a case started on one device
// can be resumed or replayed on another. Local (IndexedDB) stays the working copy; the cloud is a mirror.
import { py } from "@/py/runtime";
import { SCENARIO_NAME } from "@/engine/scenarios";

async function token(): Promise<string | null> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function cloud(method: string, query: string, body?: unknown): Promise<Response | null> {
  const t = await token();
  if (!t) return null;
  try {
    return await fetch(`/api/cases${query}`, {
      method,
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return null;
  }
}

const timers = new Map<string, number>();
const latest = new Map<string, any>();
let started = false;

/** Start mirroring saved cases to the account (idempotent). Pushes at most every 10 s per case, and at once when a case ends. */
export function startCloudSync(getUserId: () => string | undefined) {
  if (started) return;
  started = true;
  py.onPersist(({ row, deletedId }) => {
    const uid = getUserId();
    if (!uid) return;
    if (deletedId) {
      latest.delete(deletedId);
      void cloud("DELETE", `?id=${encodeURIComponent(deletedId)}`);
      return;
    }
    if (!row || row.user_id !== uid) return;
    latest.set(row.id, row);
    const push = () => {
      timers.delete(row.id);
      const r = latest.get(row.id);
      if (r) void cloud("POST", "", r);
    };
    if (row.status === "ended") {
      window.clearTimeout(timers.get(row.id));
      push();
    } else if (!timers.has(row.id)) {
      timers.set(row.id, window.setTimeout(push, 10_000));
    }
  });
  // Don't lose the last few seconds when the tab closes.
  window.addEventListener("pagehide", () => {
    timers.forEach((t, id) => {
      window.clearTimeout(t);
      const r = latest.get(id);
      const uid = getUserId();
      if (r && uid) void cloud("POST", "", r);
    });
  });
}

/** The account's cases (summary rows) as the engine API returns them, or [] when signed out / offline. */
export async function listCloudCases(): Promise<any[]> {
  const res = await cloud("GET", "");
  if (!res || !res.ok) return [];
  const rows = (await res.json()) as any[];
  return rows.map((r) => ({ ...r, scenario_name: SCENARIO_NAME[r.scenario] ?? r.scenario }));
}

/** Make sure the worker has the newest copy of a case: pulls it from the account when this device lacks it or is behind. */
export async function ensureCaseLocal(caseId: string): Promise<void> {
  const local = await py.api("GET", `/cases/${caseId}/exists`);
  const have = local.json as { exists: boolean; updated_at: number | null };
  const res = await cloud("GET", `?id=${encodeURIComponent(caseId)}`);
  if (!res || !res.ok) return;
  const remote = await res.json();
  if (!have.exists || Number(remote.updated_at) > Number(have.updated_at ?? 0)) await py.importRow(remote);
}

export async function deleteCloudCase(caseId: string): Promise<void> {
  await cloud("DELETE", `?id=${encodeURIComponent(caseId)}`);
}
