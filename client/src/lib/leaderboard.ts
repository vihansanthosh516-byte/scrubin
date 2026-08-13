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
}) {
  try {
    await upsertUser(user);
    const { error } = await supabase.from("sessions").insert(record);
    if (error) console.error("Failed to record session:", error);
  } catch (err) {
    console.error("Failed to record session:", err);
  }
}
