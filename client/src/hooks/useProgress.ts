import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalSessions, getUserSessions, type PersistedSession } from "@/lib/leaderboard";
import { DAILY_GOAL_XP, lastWeek, levelFor, rankFor, streakFor, totalXp, xpToday } from "@/lib/game";

export interface Progress {
  loaded: boolean;
  sessions: PersistedSession[];
  xp: number;
  level: ReturnType<typeof levelFor>;
  rank: string;
  streak: number;
  doneToday: boolean;
  week: ReturnType<typeof lastWeek>;
  todayXp: number;
  goal: number;
}

// One fetch shared by every widget on the page (navbar streak, home dashboard, path).
let cache: { userId: string; at: number; rows: PersistedSession[] } | null = null;
const listeners = new Set<() => void>();

/** Ask every progress widget to refetch (e.g. after a case is recorded). */
export function refreshProgress() {
  cache = null;
  listeners.forEach((l) => l());
}

/** The signed-in student's game progress, derived from their completed sessions. */
export function useProgress(): Progress {
  const { user } = useAuth();
  const [rows, setRows] = useState<PersistedSession[] | null>(cache && user && cache.userId === user.id ? cache.rows : null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (cache && cache.userId === user.id && Date.now() - cache.at < 60_000) {
      setRows(cache.rows);
      return;
    }
    let cancelled = false;
    getUserSessions(user.id).then((remote) => {
      if (cancelled) return;
      const all = [...remote, ...getLocalSessions(user.id)];
      cache = { userId: user.id, at: Date.now(), rows: all };
      setRows(all);
    });
    return () => {
      cancelled = true;
    };
  }, [user, tick]);

  const sessions = rows ?? [];
  const xp = totalXp(sessions);
  const level = levelFor(xp);
  const { streak, doneToday } = streakFor(sessions);
  return {
    loaded: rows !== null,
    sessions,
    xp,
    level,
    rank: rankFor(level.level),
    streak,
    doneToday,
    week: lastWeek(sessions),
    todayXp: xpToday(sessions),
    goal: DAILY_GOAL_XP,
  };
}
