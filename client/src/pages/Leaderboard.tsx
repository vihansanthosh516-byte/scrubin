/**
 * ScrubIn Leaderboard v2.0 - Real Data Only
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, ArrowLeft, Activity, User } from "lucide-react";
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
    if (rank === 1) return <Crown className="w-10 h-10 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-10 h-10 text-gray-400" />;
    if (rank === 3) return <Medal className="w-10 h-10 text-amber-600" />;
    return <span className="text-2xl font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-32 pb-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute w-[900px] h-[900px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7EC8E3 0%, transparent 70%)", top: "-20%", right: "-10%" }} animate={{ x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 28, repeat: Infinity }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </motion.div>
          </div>
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6" whileHover={{ scale: 1.05 }}>
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono-data text-primary">Global Rankings</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Leader<span className="text-gradient">board</span>
          </h1>
          <p className="text-muted-foreground text-xl">Top surgeons worldwide</p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <motion.div className="inline-flex gap-2 p-1.5 rounded-2xl glass-card">
            {["daily", "weekly", "monthly", "all"].map(range => (
              <motion.button
                key={range}
                onClick={() => setTimeRange(range)}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  timeRange === range ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(126,200,227,0.4)]" : "text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No leaderboard data available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.03, x: 10, y: -5 }}
                className="group"
              >
                <div className={`relative p-6 rounded-2xl glass-card transition-all duration-500 ${entry.rank <= 3 ? 'border-primary/30' : ''}`}>
                  <div className="absolute left-6 top-1/2 -translate-y-1/2">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex items-center gap-6 pl-16">
                    <motion.div className="w-16 h-16 rounded-2xl border-2 border-primary/30 overflow-hidden" whileHover={{ scale: 1.2, rotate: 15 }}>
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {entry.username}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono-data mt-2">
                        <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> {entry.procedures_completed} procedures</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <motion.div className="text-3xl font-bold text-primary group-hover:text-primary/80 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }} initial={{ scale: 0.9 }} whileInView={{ scale: 1 }}>
                        {entry.total_xp?.toLocaleString() || 0}
                      </motion.div>
                      <div className="text-xs text-muted-foreground font-mono-data">XP</div>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
