/**
 * ScrubIn Profile: who you are, your rank and XP, real stats from your cases, and achievements
 * with progress towards each one.
 */
import { useState, useEffect } from "react";
import { Activity, AlertCircle, Award, Brain, CheckCircle, Clock, Flame, Heart, Scissors, Star, Target, TrendingUp, Trophy, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getLeaderboard } from "@/lib/leaderboard";
import { CtaLink, Eyebrow, LoadingState, Pill, StatCard } from "@/components/scrubin";

type Stats = { totalSurgeries: number; bestScore: number; streak: number; perfectRun: number; hasReturned: boolean; fastestTime: number };

// progress(stats) -> [current, target]; a badge unlocks when current >= target.
const ALL_BADGES: { id: string; name: string; desc: string; icon: React.ComponentType<{ className?: string }>; progress: (s: Stats) => [number, number] }[] = [
  { id: "first_cut", name: "First Cut", desc: "Complete your first procedure", icon: Scissors, progress: (s) => [s.totalSurgeries, 1] },
  { id: "perfectionist", name: "Perfectionist", desc: "Score 100% on any procedure", icon: Star, progress: (s) => [s.bestScore, 100] },
  { id: "survivor", name: "Survivor", desc: "Complete 10 procedures", icon: Heart, progress: (s) => [s.totalSurgeries, 10] },
  { id: "scholar", name: "Scholar", desc: "Complete 25 procedures", icon: Brain, progress: (s) => [s.totalSurgeries, 25] },
  { id: "master", name: "Master Surgeon", desc: "Complete 50 procedures", icon: Trophy, progress: (s) => [s.totalSurgeries, 50] },
  { id: "legend", name: "Legend", desc: "Complete 100 procedures", icon: Award, progress: (s) => [s.totalSurgeries, 100] },
  { id: "streak_3", name: "On Fire", desc: "Keep a 3-day streak", icon: Flame, progress: (s) => [s.streak, 3] },
  { id: "streak_7", name: "Dedicated", desc: "Keep a 7-day streak", icon: Flame, progress: (s) => [s.streak, 7] },
  { id: "streak_30", name: "Obsessed", desc: "Keep a 30-day streak", icon: Flame, progress: (s) => [s.streak, 30] },
  { id: "perfection_run", name: "Flawless", desc: "Score 100% five cases in a row", icon: CheckCircle, progress: (s) => [s.perfectRun, 5] },
  { id: "comeback", name: "Comeback Kid", desc: "Return after a week away", icon: TrendingUp, progress: (s) => [s.hasReturned ? 1 : 0, 1] },
  { id: "speedster", name: "Speedster", desc: "Finish a case in under 10 minutes", icon: Zap, progress: (s) => [s.fastestTime <= 600 ? 1 : 0, 1] },
];

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSurgeries: 0,
    bestScore: 0,
    avgScore: 0,
    complications: 0,
    streak: 0,
    longestStreak: 0,
    perfectRun: 0,
    hasReturned: false,
    fastestTime: 9999,
    lastSurgeryDate: null as string | null,
    surgeriesByDate: {} as Record<string, number>
  });
  const [loaded, setLoaded] = useState(false);
  const [rankInfo, setRankInfo] = useState<{ rank: number | null; totalPlayers: number; totalXp: number; proceduresCompleted: number } | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  // Global rank + XP from the leaderboard view — the single source of truth
  // shared with the Leaderboard page (sum(100 + floor(score / 10)) per session).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getLeaderboard().then(({ entries }) => {
      if (cancelled) return;
      const index = entries.findIndex((e) => e.user_id === user.id);
      setRankInfo({
        rank: index >= 0 ? index + 1 : null,
        totalPlayers: entries.length,
        totalXp: index >= 0 ? entries[index].total_xp : 0,
        proceduresCompleted: index >= 0 ? entries[index].procedures_completed : 0,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error || !sessions || sessions.length === 0) {
        return;
      }

      // Calculate real streak
      const dates = sessions.map(s => new Date(s.created_at).toISOString().split('T')[0]);
      const uniqueDates = Array.from(new Set(dates)).sort();
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if user did surgery today
      const didToday = uniqueDates.includes(today.toISOString().split('T')[0]);
      const didYesterday = uniqueDates.includes(yesterday.toISOString().split('T')[0]);

      // Calculate current streak (must be consecutive days ending today or yesterday)
      if (didToday || didYesterday) {
        // Count backwards from today/yesterday
        let checkDate = didToday ? today : yesterday;
        for (let i = 0; i < 365; i++) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (uniqueDates.includes(dateStr)) {
            tempStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        currentStreak = tempStreak;
      }

      // Calculate longest streak
      tempStreak = 0;
      let prevDate: Date | null = null;
      for (const dateStr of uniqueDates) {
        const currentDate = new Date(dateStr);
        if (prevDate) {
          const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        prevDate = currentDate;
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;

      // Calculate stats
      const totalSurgeries = sessions.length;
      const scores = sessions.map(s => s.score || 0);
      const bestScore = Math.max(...scores, 0);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const complications = sessions.filter(s => s.outcome === "Complicated" || s.outcome === "Critical").length;
      const times = sessions.map(s => s.time_seconds || 9999);
      const fastestTime = Math.min(...times);

      // Check perfect run (consecutive 100s)
      let perfectRun = 0;
      let currentRun = 0;
      for (let i = sessions.length - 1; i >= 0; i--) {
        if (sessions[i].score === 100) {
          currentRun++;
        } else {
          if (currentRun > perfectRun) perfectRun = currentRun;
          currentRun = 0;
        }
      }
      if (currentRun > perfectRun) perfectRun = currentRun;

      // Check if returned after break (7+ days)
      const hasReturned = sessions.length >= 2 && 
        ((new Date(sessions[sessions.length - 1].created_at).getTime() - 
          new Date(sessions[sessions.length - 2].created_at).getTime()) > 7 * 24 * 60 * 60 * 1000);

      setStats({
        totalSurgeries,
        bestScore,
        avgScore,
        complications,
        streak: currentStreak,
        longestStreak,
        perfectRun,
        hasReturned,
        fastestTime,
        lastSurgeryDate: uniqueDates[uniqueDates.length - 1] || null,
        surgeriesByDate: uniqueDates.reduce((acc, date) => {
          acc[date] = sessions.filter(s => s.created_at.startsWith(date)).length;
          return acc;
        }, {} as Record<string, number>)
      });

    } catch (e) {
      console.error('Failed to load progress:', e);
    } finally {
      setLoaded(true);
    }
  };

  if (!user) return null; // the route guard redirects signed-out visitors

  const name = user.name || user.login;
  const badgeStats: Stats = stats;
  const unlockedCount = ALL_BADGES.filter((b) => {
    const [cur, target] = b.progress(badgeStats);
    return cur >= target;
  }).length;
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-background text-foreground">
      <div className="border-b border-border pb-10 pt-28">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 md:flex-row md:items-center">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-20 w-20 rounded-sm border border-border object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-sm border border-border bg-muted font-display text-4xl" aria-hidden="true">
              {name[0]?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <Eyebrow variant="hero" className="mb-3 flex">{user.profession || "Surgeon in training"}</Eyebrow>
            <h1 className="font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl">{name}</h1>
            <p className="mt-2 font-mono-data text-sm text-muted-foreground">@{user.customUsername || user.login}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {rankInfo === null ? (
                <Pill>Loading rank…</Pill>
              ) : (
                <>
                  <Pill tone={rankInfo.rank ? "sage" : "neutral"}>{rankInfo.rank ? `Rank #${rankInfo.rank} of ${rankInfo.totalPlayers}` : "Not ranked yet"}</Pill>
                  <Pill tone="terracotta">{rankInfo.totalXp.toLocaleString()} XP</Pill>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {!loaded ? (
          <LoadingState label="Loading your cases" />
        ) : stats.totalSurgeries === 0 ? (
          <div className="surface flex flex-col items-start gap-4 p-8">
            <h2 className="font-display text-3xl tracking-tight">No cases yet</h2>
            <p className="text-muted-foreground">Your stats, streaks and achievements fill in as you complete cases.</p>
            <CtaLink href="/simulation?proc=appendectomy">
              <Activity className="h-4 w-4" aria-hidden="true" /> Start with an appendectomy
            </CtaLink>
          </div>
        ) : (
          <section aria-labelledby="stats-h">
            <h2 id="stats-h" className="section-tag mb-4">Your numbers</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={<Activity />} value={stats.totalSurgeries} label="Cases completed" />
              <StatCard icon={<Star />} value={`${stats.bestScore}%`} label="Best score" />
              <StatCard icon={<Target />} value={`${stats.avgScore}%`} label="Average score" />
              <StatCard icon={<AlertCircle />} value={stats.complications} label="Complicated cases" />
              <StatCard icon={<Flame />} value={`${stats.streak} d`} label="Current streak" />
              <StatCard icon={<Trophy />} value={`${stats.longestStreak} d`} label="Longest streak" />
              <StatCard icon={<CheckCircle />} value={stats.perfectRun} label="Perfect run" />
              <StatCard icon={<Clock />} value={stats.fastestTime < 9999 ? fmtTime(stats.fastestTime) : "—"} label="Fastest case" />
            </div>
          </section>
        )}

        <section aria-labelledby="badges-h" className="mt-14">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="badges-h" className="font-display text-3xl tracking-tight">Achievements</h2>
            <p className="font-mono-data text-sm text-muted-foreground">
              {unlockedCount} of {ALL_BADGES.length} unlocked
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {ALL_BADGES.map((badge) => {
              const [cur, target] = badge.progress(badgeStats);
              const done = cur >= target;
              const pct = Math.min(100, Math.round((cur / target) * 100));
              return (
                <li key={badge.id} className={`surface flex gap-4 p-5 ${done ? "border-success/40" : ""}`}>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border ${done ? "border-success/40 bg-success/10 text-success" : "border-border bg-muted text-label"}`} aria-hidden="true">
                    <badge.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-sm text-muted-foreground">{badge.desc}</p>
                    {done ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-success">Unlocked</p>
                    ) : (
                      <div className="mt-3">
                        <div className="h-1 w-full bg-accent" role="progressbar" aria-label={`${badge.name} progress`} aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(cur, target)}>
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1.5 font-mono-data text-xs text-label">
                          {Math.min(cur, target)} / {target}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
