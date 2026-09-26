import { supabase } from "./supabase";
import type { Debrief } from "@/engine/types";

/**
 * Write a finished OR case to the existing Supabase `sessions` table so the
 * Profile, ProcedureLibrary and leaderboard pick it up. Best effort: the full
 * case (seed + action log) is stored by the engine regardless.
 */
export async function recordSession(
  user: { id: string; name?: string; login?: string; avatar_url?: string },
  procedureId: string,
  procedureName: string,
  debrief: Debrief,
): Promise<void> {
  if (debrief.score == null) return; // ended before anything happened
  const graded = debrief.items.filter((i) => i.grade !== "n/a");
  const good = graded.filter((i) => i.grade === "good").length;
  const outcome = debrief.outcome === "death" ? "Critical" : debrief.score >= 70 ? "Successful" : "Complicated";
  try {
    await supabase.from("users").upsert({ id: user.id, name: user.name, login: user.login, avatar_url: user.avatar_url });
    await supabase.from("sessions").insert({
      user_id: user.id,
      procedure_id: procedureId,
      procedure_name: procedureName,
      score: debrief.score,
      outcome,
      time_seconds: Math.round(debrief.duration_min * 60),
      decisions_correct: good,
      decisions_total: graded.length,
      complications_count: debrief.timeline.filter((e) => e.kind === "complication").length,
    });
  } catch (err) {
    console.warn("Could not record session to Supabase", err);
  }
}
