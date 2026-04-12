/**
 * ScrubIn Profile/Dashboard — Clinical Precision Design
 * Rank display, stats grid, surgery history, achievements
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Activity, Star, Trophy, Shield, BookOpen, Zap, Target, Award, TrendingUp, Github } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrubinCard, ScrubinStaticPanel } from "@/components/ui/scrubin-card";
import { supabase } from "@/lib/supabase";

const STATS = [
  { label: "Total Surgeries", value: "3", icon: <Activity className="w-4 h-4" /> },
  { label: "Best Procedure", value: "Appendectomy", icon: <Star className="w-4 h-4" /> },
  { label: "Avg Safety Score", value: "82%", icon: <Shield className="w-4 h-4" /> },
  { label: "Complications", value: "4", icon: <Zap className="w-4 h-4" /> },
  { label: "Hints Used", value: "2", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Perfect Runs", value: "0", icon: <Target className="w-4 h-4" /> },
];

const HISTORY = [
  { procedure: "Appendectomy", patient: "Marcus T., 28M", date: "Mar 29, 2026", score: "94%", outcome: "Successful", time: "22:14", stars: 5 },
  { procedure: "Appendectomy", patient: "Elena K., 34F", date: "Mar 28, 2026", score: "71%", outcome: "Complicated", time: "31:08", stars: 3 },
  { procedure: "Heart Bypass", patient: "Robert C., 62M", date: "Mar 27, 2026", score: "58%", outcome: "Critical", time: "48:22", stars: 2 },
];

const BADGES = [
  { icon: <Activity className="w-5 h-5" />, name: "First Cut", desc: "Complete your first procedure", unlocked: true },
  { icon: <Shield className="w-5 h-5" />, name: "Clean Hands", desc: "Complete a surgery with zero mistakes", unlocked: false },
  { icon: <Trophy className="w-5 h-5" />, name: "Neuro Curious", desc: "Complete the Craniotomy", unlocked: false },
  { icon: <Zap className="w-5 h-5" />, name: "Code Blue", desc: "Successfully manage a cardiac complication", unlocked: false },
  { icon: <BookOpen className="w-5 h-5" />, name: "Scholar", desc: "Read 10 Learn Hub articles", unlocked: false },
  { icon: <Award className="w-5 h-5" />, name: "Top Surgeon", desc: "Reach #1 on the global leaderboard", unlocked: false },
];

const RANKS = ["Medical Student", "Intern", "Resident", "Fellow", "Attending", "Chief of Surgery"];
// XP thresholds for each rank
const XP_THRESHOLDS = [0, 1000, 5000, 10000, 15000, 20000];

export default function Profile() {
  const { user, loginWithGitHub, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    if (user) {
      loadHistoryFromSupabase();
    }
  }, [user]);

  const loadHistoryFromSupabase = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to load history:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem(`scrubin_history_${user.id}`);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } else {
        // Calculate XP: 50 for failed (Critical), 100 + bonus for others
        const xp = (data || []).reduce((acc: number, session: any) => {
          if (session.outcome === "Critical") {
            return acc + 50; // 50 XP for failed surgeries
          }
          return acc + 100 + Math.floor(session.score / 10);
        }, 0);
        setTotalXP(xp);

        const formattedHistory = (data || []).map((session: any) => ({
          id: '#' + (session.id || '').toString().slice(0, 6).toUpperCase(),
          procedure: session.procedure_name,
          outcome: session.outcome,
          score: Math.max(0, session.score) + '%',
          date: new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: Math.floor(session.time_seconds / 60) + ':' + String(session.time_seconds % 60).padStart(2, '0')
        }));
        setHistory(formattedHistory);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl p-8 text-center bg-card/90 backdrop-blur-xl border border-border shadow-[0_0_30px_rgba(126,200,227,0.1)]"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-6 mx-auto">
              <Activity className="w-6 h-6 text-baby-blue" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view Profile</h1>
            <p className="text-gray-400 mb-8 text-sm">
              Track your rank, XP, and detailed surgery performance across every session.
            </p>
            <Button
              onClick={loginWithGitHub}
              className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg flex items-center justify-center gap-3 transition-all"
            >
              <Github className="w-5 h-5" /> Continue with GitHub
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Calculate stats from dynamic history
  const totalSurgeries = history.length;
  const avgScore = totalSurgeries > 0
    ? Math.round(history.reduce((acc, h) => acc + parseInt(h.score), 0) / totalSurgeries)
    : 0;
  const complications = history.filter(h => h.outcome === "Complicated" || h.outcome === "Critical").length;

  const stats = [
    { label: "Total Surgeries", value: totalSurgeries.toString(), icon: <Activity className="w-4 h-4" /> },
    { label: "Best Score", value: totalSurgeries > 0 ? Math.max(...history.map(h => parseInt(h.score))) + "%" : "N/A", icon: <Star className="w-4 h-4" /> },
    { label: "Avg Safety Score", value: avgScore + "%", icon: <Shield className="w-4 h-4" /> },
    { label: "Complications", value: complications.toString(), icon: <Zap className="w-4 h-4" /> },
    { label: "Experience Points", value: totalXP.toString(), icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Certifications", value: totalSurgeries > 5 ? "1" : "0", icon: <Award className="w-4 h-4" /> },
  ];

  // Calculate rank based on XP thresholds

const currentXP = totalXP;
const currentRankIndex = XP_THRESHOLDS.findIndex((threshold, i) => {
  if (i === XP_THRESHOLDS.length - 1) return currentXP >= threshold;
  return currentXP >= threshold && currentXP < XP_THRESHOLDS[i + 1];
});
  
  const nextRankXP = currentRankIndex < XP_THRESHOLDS.length - 1 ? XP_THRESHOLDS[currentRankIndex + 1] : XP_THRESHOLDS[XP_THRESHOLDS.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-8 mb-8 bg-card/90 backdrop-blur-xl border border-border shadow-[0_0_30px_rgba(126,200,227,0.1)]"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-2 border-primary/40 overflow-hidden bg-muted">
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1
                  className="text-2xl font-bold text-foreground"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {user.name}
                </h1>
                <span className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary font-mono-data">
                  {RANKS[currentRankIndex]}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-4 font-mono-data">{user.email || `@${user.login}`} · {totalSurgeries} surgeries · {avgScore}% avg score</p>

              {/* XP Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="label-mono text-muted-foreground">
                    Level Up Progress
                  </span>
                  <span className="label-mono text-primary">{currentXP} / {nextRankXP} XP</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((currentXP / nextRankXP) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Rank progression */}
            <div className="hidden lg:flex flex-col gap-1">
              {RANKS.map((rank, i) => (
                <div key={rank} className={`flex items-center gap-2 text-xs ${i === currentRankIndex ? "text-primary font-semibold" : i < currentRankIndex ? "text-emerald-400" : "text-muted-foreground opacity-50"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${i === currentRankIndex ? "bg-primary" : i < currentRankIndex ? "bg-emerald-400" : "bg-muted"}`} />
                  <span className="font-mono-data">{rank}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="rounded-xl p-5 bg-card/90 backdrop-blur-xl border border-border hover:border-primary/30 hover:shadow-[0_0_20px_rgba(126,200,227,0.1)] transition-all"
            >
              <div className="flex items-center gap-2 mb-3 text-primary">{stat.icon}</div>
              <div
                className="text-2xl font-bold text-foreground mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="label-mono text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Surgery History */}
        <div className="rounded-2xl overflow-hidden mb-8 bg-card/90 backdrop-blur-xl border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2
              className="font-bold text-foreground"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Surgery History
            </h2>
            <span className="label-mono text-muted-foreground">{history.length} procedures</span>
          </div>
          <div className="divide-y divide-border/50">
            {history.length > 0 ? history.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div
                      className="font-semibold text-sm text-foreground mb-0.5"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {entry.procedure}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono-data">{entry.date} · {entry.time} · {entry.id}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < (parseInt(entry.score) / 20) ? "fill-primary text-primary" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono-data ${
                    entry.outcome === "Successful"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : entry.outcome === "Complicated"
                      ? "bg-amber-400/10 text-amber-400"
                      : "bg-red-400/10 text-red-400"
                  }`}>
                    {entry.outcome}
                  </span>
                  <span className="text-sm font-bold text-primary font-mono-data w-12 text-right">{entry.score}</span>
                </div>
              </motion.div>
            )) : (
              <div className="px-6 py-12 text-center">
                <div className="text-muted-foreground text-sm font-mono-data">No surgery records found for this account.</div>
                <Link href="/procedures">
                  <Button variant="link" className="text-primary mt-2">Enter the OR to start your career</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2
            className="font-bold text-foreground mb-5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BADGES.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className={`rounded-xl p-4 bg-card/90 backdrop-blur-xl border ${badge.unlocked ? "border-primary/30 shadow-[0_0_20px_rgba(126,200,227,0.1)]" : "border-border opacity-60"} transition-all hover:border-primary/40`}
              >
                <div className="text-3xl mb-3">{badge.icon}</div>
                <div
                  className="font-semibold text-sm text-foreground mb-1"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {badge.name}
                </div>
                <div className="text-xs text-muted-foreground">{badge.desc}</div>
                {badge.unlocked && (
                  <div className="mt-2 flex items-center gap-1">
                    <Award className="w-3 h-3 text-primary" />
                    <span className="label-mono text-primary">Unlocked</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
