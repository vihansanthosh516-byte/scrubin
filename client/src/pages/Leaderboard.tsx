/**
 * ScrubIn Leaderboard — Clinical Precision Design
 * Global rankings, top 3 podium, weekly reset
 * Now connected to Supabase for real data
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, TrendingUp, Activity } from "lucide-react";
import { ScrubinCard, ScrubinStaticPanel } from "@/components/ui/scrubin-card";
import { getLeaderboard, LeaderboardEntry } from "@/lib/leaderboard";
import { useAuth } from "@/contexts/AuthContext";

const TABS = ["Global", "This Week", "By Procedure"];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Global");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    const filter = activeTab.toLowerCase().replace(" ", "") as 'global' | 'week' | 'procedure';
    getLeaderboard(filter)
      .then(data => {
        setLeaderboardData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard");
        setLoading(false);
      });
  }, [activeTab]);

  // Get top 3 for podium
  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  // Find current user's rank
  const userEntry = user ? leaderboardData.find(e => e.id === user.id) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="label-mono block mb-3">Rankings</span>
          <h1
            className="text-4xl md:text-6xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Top Surgeons
          </h1>
          <p className="text-muted-foreground">Global rankings reset every Monday at 00:00 UTC.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all font-mono-data ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading leaderboard...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">
            {error}
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No surgeries recorded yet</p>
            <p className="text-sm">Complete a simulation to appear on the leaderboard!</p>
          </div>
        ) : (
          <>
        {/* Enhanced Top 3 Podium with 3D effects */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8 relative">
            {/* Glow background for winner */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="w-1/3 h-full bg-primary/5 blur-3xl" />
            </div>
            
            {[topThree[1], topThree[0], topThree[2]].map((surgeon, i) => {
              const isFirst = surgeon.rank === 1;
              const badges = ["🥈", "🥇", "🥉"];
              const heights = ["h-32", "h-40", "h-28"]; // Different heights for podium
              
              return (
                <motion.div
                  key={surgeon.id}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.15, type: "spring" }}
                  className={`relative rounded-2xl p-5 border text-center backdrop-blur-xl transition-all duration-300 group ${
                    isFirst 
                      ? "border-primary/40 shadow-[0_0_40px_rgba(126,200,227,0.2)] bg-card/80" 
                      : "border-border bg-card/50 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(126,200,227,0.15)]"
                  }`}
                >
                  {/* Animated crown for winner */}
                  {isFirst && (
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl"
                      animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      👑
                    </motion.div>
                  )}
                  
                  {/* Badge with glow */}
                  <motion.div 
                    className="text-4xl mb-3"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  >
                    {badges[i]}
                  </motion.div>
                  
                  {/* Rank number with glow */}
                  <div className="label-mono text-muted-foreground mb-2">Rank #{surgeon.rank}</div>
                  
                  {/* Name with hover effect */}
                  <div
                    className="font-bold text-foreground text-sm mb-2 truncate"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {surgeon.name || "Anonymous"}
                  </div>
                  
                  {/* Stats with icons */}
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      <span className="font-mono-data">{surgeon.total_surgeries} surgeries</span>
                    </div>
                  </div>
                  
                  {/* Score with enhanced display */}
                  <motion.div 
                    className="text-3xl font-bold text-primary mb-1"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                  >
                    {surgeon.avg_score}%
                  </motion.div>
                  <div className="label-mono text-muted-foreground text-[10px]">avg score</div>
                  
                  {/* Success rate indicator */}
                  <div className="mt-3 flex items-center justify-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-mono-data">{surgeon.success_rate}% success</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

            {/* Table */}
            <div className="rounded-2xl border border-border overflow-hidden bg-card/90 backdrop-blur-xl">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 text-xs font-mono-data text-muted-foreground uppercase tracking-wider px-5 py-3 border-b border-border bg-muted/30">
                <span className="w-10">#</span>
                <span>Surgeon</span>
                <span className="w-20 text-right">Surgeries</span>
                <span className="w-20 text-right">Avg Score</span>
                <span className="w-20 text-right">Success</span>
              </div>
              {(topThree.length < 3 ? leaderboardData : restOfLeaderboard).map((entry, i) => {
                const isYou = user && entry.id === user.id;
                const displayRank = topThree.length < 3 ? i + 1 : i + 4;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 px-5 py-4 border-b border-border/50 last:border-0 transition-colors ${
                      isYou
                        ? "bg-primary/10 border-primary/20"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <span className={`w-10 font-bold text-sm ${isYou ? "text-primary" : "text-muted-foreground"} font-mono-data`}>
                      {displayRank}
                    </span>
                    <div>
                      <div
                        className={`font-semibold text-sm ${isYou ? "text-primary" : "text-foreground"}`}
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {entry.name || "Anonymous"} {isYou && <span className="text-xs text-primary/70 font-mono-data">(you)</span>}
                      </div>
                      {entry.avatar_url && (
                        <img src={entry.avatar_url} alt="" className="w-5 h-5 rounded-full inline mr-2" />
                      )}
                    </div>
                    <span className="w-20 text-right font-mono-data text-sm text-foreground">{entry.total_surgeries}</span>
                    <span className={`w-20 text-right font-mono-data text-sm font-semibold ${isYou ? "text-primary" : "text-foreground"}`}>
                      {entry.avg_score}%
                    </span>
                    <span className="w-20 text-right font-mono-data text-sm text-emerald-400">{entry.success_rate}%</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {userEntry ? (
                <>
                  <ScrubinStaticPanel glowColor="blue" className="p-5 text-center">
                    <Trophy className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="label-mono text-muted-foreground mb-1">Your Rank</div>
                    <div className="text-2xl font-bold text-foreground font-mono-data">#{leaderboardData.findIndex(e => e.id === user?.id) + 1}</div>
                  </ScrubinStaticPanel>
                  <ScrubinStaticPanel glowColor="blue" className="p-5 text-center">
                    <Activity className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="label-mono text-muted-foreground mb-1">Surgeries Done</div>
                    <div className="text-2xl font-bold text-foreground font-mono-data">{userEntry.total_surgeries}</div>
                  </ScrubinStaticPanel>
                  <ScrubinStaticPanel glowColor="blue" className="p-5 text-center">
                    <Star className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="label-mono text-muted-foreground mb-1">Avg Score</div>
                    <div className="text-2xl font-bold text-foreground font-mono-data">{userEntry.avg_score}%</div>
                  </ScrubinStaticPanel>
                </>
              ) : (
                <>
                  <ScrubinStaticPanel glowColor="blue" className="p-5 text-center">
                    <Trophy className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="label-mono text-muted-foreground mb-1">Your Rank</div>
                    <div className="text-2xl font-bold text-muted-foreground font-mono-data">--</div>
                  </ScrubinStaticPanel>
                  <ScrubinStaticPanel glowColor="blue" className="p-5 text-center">
                    <Activity className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="label-mono text-muted-foreground mb-1">Surgeries Done</div>
                    <div className="text-2xl font-bold text-muted-foreground font-mono-data">0</div>
                  </ScrubinStaticPanel>
                  <ScrubinStaticPanel glowColor="blue" className="p-5 text-center">
                    <Star className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="label-mono text-muted-foreground mb-1">Avg Score</div>
                    <div className="text-2xl font-bold text-muted-foreground font-mono-data">--%</div>
                  </ScrubinStaticPanel>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
