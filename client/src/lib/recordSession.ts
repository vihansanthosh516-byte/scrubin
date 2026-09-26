import { recordSession as recordSessionRow } from "./leaderboard";
import type { Debrief } from "@/engine/types";

/**
 * Turn a finished real-time OR debrief into a `sessions` row (the same table
 * the classic simulation writes), so Profile, ProcedureLibrary and the
 * leaderboard include it. The full case lives in the engine regardless.
 */
export async function recordSession(
  user: { id: string; name: string; login: string; avatar_url?: string | null },
  procedureId: string,
  procedureName: string,
  debrief: Debrief,
): Promise<void> {
  if (debrief.score == null) return; // ended before anything happened
  const graded = debrief.items.filter((i) => i.grade !== "n/a");
  await recordSessionRow(
    {
      user_id: user.id,
      procedure_id: procedureId,
      procedure_name: procedureName,
      score: debrief.score,
      outcome: debrief.outcome === "death" ? "Critical" : debrief.score >= 70 ? "Successful" : "Complicated",
      time_seconds: Math.round(debrief.duration_min * 60),
      decisions_correct: graded.filter((i) => i.grade === "good").length,
      decisions_total: graded.length,
      complications_count: debrief.timeline.filter((e) => e.kind === "complication").length,
    },
    user,
  );
}
