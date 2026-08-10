/**
 * ScrubIn Leaderboard v3.0 — Anthropic Editorial
 * Warm table layout, subtle dividers, gold/silver/bronze podium accents.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Trophy, Medal, Crown, ArrowLeft, Activity, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string;
  total_xp: number;
  procedures_completed: number;
  rank: number;
}

const EASE = [0.25, 1, 0.5, 1] as const;

// Warm podium accents — gold, silver, bronze
const PODIUM: Record<number, { ring: string; badge: string; label: string }> = {
  1: { ring: "border-[#C9A227]", badge: "bg-[#C9A227]", label: "text-[#8F7418]" },
  2: { ring: "border-[#9EA2A6]", badge: "bg-[#9EA2A6]", label: "text-[#6E7276]" },
  3: { ring: "border-[#B07A4A]", badge: "bg-[#B07A4A]", label: "text-[#8A5A30]" },
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    loadLeaderboard();
  }, [timeRange]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankedData = data?.map((entry: any, index: number) => ({
        user_id: entry.user_id,
        username: entry.username || 'Unknown',
        avatar_url: entry.avatar_url,
        total_xp: entry.total_xp,
        procedures_completed: entry.procedures_completed,
        rank: index + 1
      })) || [];

      setLeaderboard(rankedData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-[#C9A227]" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-[#9EA2A6]" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-[#B07A4A]" />;
    return <span className="font-mono-data text-lg font-semibold text-[#8C827A]">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#191919] dark:bg-[#161310] dark:text-[#EDEAE4]">
      {/* Header */}
      <header className="border-b border-[#E2DDD1] bg-background/60 pt-24 pb-10 backdrop-blur-sm dark:border-[#3A342C]">
        <div className="mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-center"
          >
            <div className="mb-6 flex items-center justify-center">
              <Link href="/">
                <motion.div whileHover={{ scale: 1.02, x: -3 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="ghost" className="gap-2 text-[#666059] hover:text-[#191919]">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                </motion.div>
              </Link>
            </div>
            <div className="mb-5 flex items-center justify-center gap-2.5">
              <Trophy className="h-4 w-4 text-[#CC553D] dark:text-[#D95338]" />
              <span className="font-mono-data text-xs uppercase tracking-[0.16em] text-[#8C827A] dark:text-[#C2BBB0]">Global Rankings</span>
            </div>
            <h1 className="font-display text-4xl leading-[1.02] tracking-tight text-[#191919] sm:text-5xl md:text-6xl dark:text-[#EDEAE4]">
              Leader<span className="text-[#CC553D] dark:text-[#D95338]">board</span>
            </h1>
            <p className="mt-3 text-lg text-[#666059] dark:text-[#A89F95]">Top surgeons worldwide</p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Time range toggle — underlined editorial tabs */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex gap-1 border-b border-[#E2DDD1]">
            {["daily", "weekly", "monthly", "all"].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2.5 text-sm font-medium transition-all ${
                  timeRange === range
                    ? "border-b-2 border-[#CC553D] text-[#191919] dark:text-[#EDEAE4]"
                    : "text-[#8C827A] hover:text-[#191919] dark:hover:text-[#EDEAE4]"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-[#CC553D] border-t-transparent" />
            <p className="text-[#666059] dark:text-[#A89F95]">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-20 text-center">
            <Trophy className="mx-auto mb-4 h-14 w-14 text-[#8C827A] opacity-30" />
            <p className="text-[#666059] dark:text-[#A89F95]">No leaderboard data available yet</p>
          </div>
        ) : (
          <div className="border border-[#E2DDD1] bg-white dark:border-[#3A342C] dark:bg-[#1E1A16]">
            {/* Table head */}
            <div className="hidden grid-cols-[64px_1fr_140px_120px] items-center gap-4 border-b border-[#E2DDD1] px-6 py-3 font-mono-data text-[11px] uppercase tracking-[0.14em] text-[#8C827A] sm:grid">
              <span>Rank</span>
              <span>Surgeon</span>
              <span className="text-right">Procedures</span>
              <span className="text-right">XP</span>
            </div>

            {leaderboard.map((entry, i) => {
              const podium = PODIUM[entry.rank];
              const isTop3 = !!podium;
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.6), ease: EASE }}
                  className={`group grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-[#E2DDD1] px-6 py-4 transition-colors last:border-b-0 hover:bg-[#FBF9F5] sm:grid-cols-[64px_1fr_140px_120px] dark:hover:bg-[#26211B] ${
                    isTop3 ? "bg-[#FBF9F5]/70 dark:bg-[#26211B]/40" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border ${isTop3 ? podium.ring : "border-[#E2DDD1]"}`}>
                      {getRankIcon(entry.rank)}
                    </div>
                  </div>

                  {/* Surgeon */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[#E2DDD1] bg-[#F4F0E8] dark:border-[#3A342C] dark:bg-[#26211B]">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt={entry.username} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-[#8C827A]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`truncate font-semibold tracking-tight ${isTop3 ? podium.label : "text-[#191919] dark:text-[#EDEAE4]"}`}>
                        {entry.username}
                      </h3>
                      {isTop3 && (
                        <span className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#8C827A]">
                          #{entry.rank} overall
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Procedures (desktop) */}
                  <div className="hidden items-center justify-end gap-1.5 font-mono-data text-sm text-[#666059] sm:flex dark:text-[#A89F95]">
                    <Activity className="h-4 w-4 text-[#8C827A]" />
                    {entry.procedures_completed}
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className={`font-mono-data text-xl font-semibold tabular-nums tracking-tight ${isTop3 ? podium.label : "text-[#191919] dark:text-[#EDEAE4]"}`}>
                      {entry.total_xp?.toLocaleString() || 0}
                    </div>
                    <div className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#8C827A]">XP</div>
                  </div>
                </motion.div>
              );
            })}

            {/* Footer note */}
            <div className="flex items-center gap-2 border-t border-[#E2DDD1] bg-[#FBF9F5]/60 px-6 py-3 text-xs text-[#8C827A] dark:bg-[#26211B]/40">
              <TrendingUp className="h-3.5 w-3.5" />
              Rankings update as you complete procedures
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
