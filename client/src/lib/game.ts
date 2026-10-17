// The game layer around the cases: XP, levels, streaks and the daily goal. Everything is derived
// from the student's completed sessions (the same rows the leaderboard view sums), never stored twice.
import type { PersistedSession } from "./leaderboard";

/** XP for one finished case: the formula the `leaderboard` view uses. */
export const sessionXp = (s: Pick<PersistedSession, "score" | "outcome">) => (s.outcome === "Critical" ? 50 : 100 + Math.floor(Math.max(0, s.score) / 10));

export const totalXp = (sessions: Pick<PersistedSession, "score" | "outcome">[]) => sessions.reduce((a, s) => a + sessionXp(s), 0);

/** Difficulty tiers unlock at these XP totals (shared with the procedure library). */
export const TIERS = [
  { id: "beginner", label: "Beginner", at: 0 },
  { id: "intermediate", label: "Intermediate", at: 500 },
  { id: "advanced", label: "Advanced", at: 2000 },
] as const;

/** Levels get 25% longer each time: 1 → 2 at 150 XP, 2 → 3 at 337, and so on. */
export function levelFor(xp: number) {
  let level = 1;
  let floor = 0;
  let need = 150;
  while (xp >= floor + need) {
    floor += need;
    need = Math.round(need * 1.25);
    level++;
  }
  return { level, into: xp - floor, need, progress: (xp - floor) / need };
}

export const RANKS = ["Medical student", "Intern", "Junior resident", "Senior resident", "Chief resident", "Fellow", "Attending", "Department chief"];
export const rankFor = (level: number) => RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))];

const day = (d: Date) => d.toISOString().slice(0, 10);

/** Consecutive days with at least one case, ending today or yesterday (a streak survives until midnight). */
export function streakFor(sessions: Pick<PersistedSession, "created_at">[], now = new Date()) {
  const days = new Set(sessions.map((s) => day(new Date(s.created_at))));
  const today = day(now);
  const cursor = new Date(now);
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(day(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, doneToday: days.has(today) };
}

/** The last 7 days, oldest first, for the streak calendar. */
export function lastWeek(sessions: Pick<PersistedSession, "created_at">[], now = new Date()) {
  const days = new Set(sessions.map((s) => day(new Date(s.created_at))));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return { date: d, label: d.toLocaleDateString(undefined, { weekday: "narrow" }), done: days.has(day(d)) };
  });
}

/** XP earned so far today, for the daily goal ring. */
export const xpToday = (sessions: Pick<PersistedSession, "created_at" | "score" | "outcome">[], now = new Date()) =>
  totalXp(sessions.filter((s) => day(new Date(s.created_at)) === day(now)));

export const DAILY_GOAL_XP = 100;
