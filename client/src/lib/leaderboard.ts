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
 * view has rows to join against. Fires and forgets — a failed sync (e.g. the
 * schema is not yet applied to the project) must never break the auth flow.
 */
export function upsertUser(user: {
  id: string;
  name: string;
  login: string;
  avatar_url?: string | null;
}) {
  void (async () => {
    try {
      await supabase
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
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
  })();
  return user;
}
