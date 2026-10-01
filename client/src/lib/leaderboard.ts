import { supabase } from "./supabase";

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_xp: number;
  procedures_completed: number;
}

/**
 * Leaderboard sorted by total XP. The single source of truth is the
 * `leaderboard` view in supabase_schema.sql — it joins users to sessions and
 * computes total_xp with the same formula the ProcedureLibrary page uses
 * (sum(100 + floor(score / 10)) per session). The view (and thus this query)
 * is locked against the schema by supabaseSchema.test.ts. Missing tables
 * degrade to an empty list instead of throwing.
 */
export async function getLeaderboard(): Promise<{ entries: LeaderboardEntry[] }> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("user_id, username, avatar_url, total_xp, procedures_completed")
    .order("total_xp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to load leaderboard:", error);
    return { entries: [] };
  }
  return { entries: (data ?? []) as LeaderboardEntry[] };
}

/**
 * Sync the signed-in user's profile into the `users` table so the leaderboard
 * view has rows to join against. Resolves when the sync settles; a failed
 * sync (e.g. the schema is not yet applied to the project) must never break
 * the auth flow, so errors are logged and swallowed.
 */
export async function upsertUser(user: {
  id: string;
  name: string;
  login: string;
  avatar_url?: string | null;
}) {
  try {
    const { error } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          name: user.name,
          login: user.login,
          avatar_url: user.avatar_url ?? null,
        },
        { onConflict: "id" }
      );
    if (error) console.error("Failed to sync user profile:", error);
  } catch (err) {
    console.error("Failed to sync user profile:", err);
  }
  return user;
}

export interface PersistedSession {
  id: string;
  user_id: string;
  procedure_id: string;
  procedure_name: string;
  score: number;
  outcome: "Successful" | "Complicated" | "Critical";
  time_seconds: number;
  decisions_correct: number;
  decisions_total: number;
  complications_count: number;
  created_at: string;
}

/**
 * The signed-in user's persisted sessions (completed cases), newest first.
 * Same source as the leaderboard — the `sessions` table. Degrades to [] when
 * the schema is not applied or the table is unreachable.
 */
export async function getUserSessions(userId: string): Promise<PersistedSession[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("Failed to load session history:", error);
    return [];
  }
  return (data ?? []) as PersistedSession[];
}

export interface SessionRecord {
  user_id: string;
  procedure_id: string;
  procedure_name: string;
  score: number;
  outcome: "Successful" | "Complicated" | "Critical";
  time_seconds: number;
  decisions_correct: number;
  decisions_total: number;
  complications_count: number;
}

/**
 * Persist a completed simulation into the `sessions` table — the data source
 * behind the Profile page and the `leaderboard` view. Ensures the user row
 * exists first (sessions.user_id has a FK to users.id), then inserts.
 * Fire-and-forget from the caller's perspective: failures are logged and
 * never bubble up into the simulation flow.
 */
export async function recordSession(record: SessionRecord, user: {
  id: string;
  name: string;
  login: string;
  avatar_url?: string | null;
}): Promise<"saved" | "local"> {
  try {
    await upsertUser(user);
    const { error } = await supabase.from("sessions").insert(record);
    if (!error) return "saved";
    console.error("Failed to record session:", error);
  } catch (err) {
    console.error("Failed to record session:", err);
  }
  // The database refuses the row when the sign-in has lapsed (row-level
  // security checks auth.uid()), so keep the case on this device instead of
  // losing it — My Simulations merges these in.
  saveLocalSession(record);
  return "local";
}

const localKey = (userId: string) => `scrubin_local_sessions_${userId}`;

function saveLocalSession(record: SessionRecord) {
  try {
    const list: PersistedSession[] = JSON.parse(localStorage.getItem(localKey(record.user_id)) || "[]");
    list.unshift({ ...record, id: `local-${Date.now()}`, created_at: new Date().toISOString() } as PersistedSession);
    localStorage.setItem(localKey(record.user_id), JSON.stringify(list.slice(0, 100)));
  } catch {
    // Storage blocked — nothing more we can do.
  }
}

/** Completed cases kept on this device because the database refused them. */
export function getLocalSessions(userId: string): PersistedSession[] {
  try {
    return JSON.parse(localStorage.getItem(localKey(userId)) || "[]");
  } catch {
    return [];
  }
}

/**
 * Push cases kept on this device into the database once the sign-in works
 * again. Each one that goes through is removed from the device copy.
 */
export async function syncLocalSessions(userId: string): Promise<void> {
  const pending = getLocalSessions(userId);
  if (!pending.length) return;
  const left: PersistedSession[] = [];
  for (const row of pending) {
    const { id: _id, created_at: _at, ...record } = row;
    const { error } = await supabase.from("sessions").insert(record);
    if (error) left.push(row);
  }
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(left));
  } catch {
    // Storage blocked — the rows simply stay pending.
  }
}
