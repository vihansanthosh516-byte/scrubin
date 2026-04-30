/**
 * ScrubIn Profile/Dashboard — Clinical Precision Design
 * Rank display, stats grid, surgery history, achievements
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Activity, Star, Trophy, Shield, BookOpen, Zap, Target, Award, TrendingUp, Github, Flame } from "lucide-react";
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
  const [streak, setStreak] = useState(0);

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

        // Calculate Streak (consecutive days of successful surgeries)
        const successfulDates = (data || [])
          .filter((s: any) => s.outcome === "Successful")
          .map((s: any) => {
            const d = new Date(s.created_at);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          })
          .sort((a: number, b: number) => b - a); // descending

        const uniqueSuccessfulDates = [...new Set(successfulDates)];

        let currentStreak = 0;
        const today = new Date();
        const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const yesterdayTime = todayTime - 86400000;

        if (uniqueSuccessfulDates.length > 0) {
          let expectedDate = todayTime;
          
          if (uniqueSuccessfulDates[0] === todayTime) {
            currentStreak = 1;
            expectedDate = yesterdayTime;
          } else if (uniqueSuccessfulDates[0] === yesterdayTime) {
            currentStreak = 1;
            expectedDate = yesterdayTime - 86400000;
          }
          
          if (currentStreak > 0) {
            for (let i = 1; i < uniqueSuccessfulDates.length; i++) {
              if (uniqueSuccessfulDates[i] === expectedDate) {
                currentStreak++;
                expectedDate -= 86400000;
              } else {
                break;
              }
            }
          }
        }
        setStreak(currentStreak);

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
    { label: "Active Streak", value: `${streak} Days`, icon: <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : ''}`} /> },
  ];

  // Calculate rank based on XP thresholds

const currentXP = totalXP;
const currentRankIndex = XP_THRESHOLDS.findIndex((threshold, i) => {
  if (i === XP_THRESHOLDS.length - 1) return currentXP >= threshold;
  return currentXP >= threshold && currentXP < XP_THRESHOLDS[i + 1];
});
  
  const nextRankXP = currentRankIndex < XP_THRESHOLDS.length - 1 ? XP_THRESHOLDS[currentRankIndex + 1] : XP_THRESHOLDS[XP_THRESHOLDS.length - 1];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Deep medical gradient background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-baby-blue/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="pt-28 pb-16 max-w-5xl mx-auto px-4 relative z-10">
        {/* Header Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] p-8 mb-10 glass-card-pro relative overflow-hidden"
        >
          {/* Subtle noise texture */}
          <div className="absolute inset-0 grain-overlay rounded-[2rem]" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl border border-primary/30 overflow-hidden bg-card shadow-lg relative z-10 transition-transform group-hover:scale-105">
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-400 border-[3px] border-background flex items-center justify-center z-20 shadow-md">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Info & Horizontal Progress Bar */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <h1
                  className="text-3xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {user.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary font-mono-data uppercase tracking-widest baby-blue-glow">
                  {RANKS[currentRankIndex]}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-6 font-mono-data tracking-wide">{user.email || `@${user.login}`} &nbsp;&middot;&nbsp; {totalSurgeries} Procedures &nbsp;&middot;&nbsp; {avgScore}% Precision</p>

              {/* Next Rank Goal (Horizontal Bar) */}
              <div className="w-full max-w-xl">
                <div className="flex justify-between mb-2">
                  <span className="label-mono text-muted-foreground text-[10px] uppercase">Rank Progress</span>
                  <span className="label-mono text-primary text-[10px] uppercase font-bold">{currentXP} / {nextRankXP} XP</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden border border-border/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((currentXP / nextRankXP) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-primary shadow-[0_0_10px_rgba(126,200,227,0.5)] rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* OR Monitor Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl p-6 stats-card flex flex-col justify-between min-h-[120px] group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                {i === 2 && (
                  <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 font-mono-data tracking-wider animate-vitals-blink">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
                  </div>
                )}
              </div>
              <div>
                <div
                  className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="label-mono text-muted-foreground text-[10px] tracking-widest">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Clinical Log (History) */}
        <div className="rounded-3xl overflow-hidden mb-10 glass-card">
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-card/30">
            <h2
              className="text-xl font-bold text-foreground tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Clinical Log
            </h2>
            <span className="px-3 py-1 rounded-full bg-muted/50 label-mono text-xs text-muted-foreground">{history.length} records</span>
          </div>
          
          <div className="divide-y divide-border/30">
            {history.length > 0 ? history.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="px-8 py-5 history-row"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div
                      className="font-bold text-base text-foreground mb-1 tracking-tight"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {entry.procedure}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono-data">
                      <span>{entry.date}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                      <span>{entry.time}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                      <span className="text-primary/70">{entry.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 ${j < (parseInt(entry.score) / 20) ? "fill-primary text-primary drop-shadow-[0_0_4px_rgba(126,200,227,0.5)]" : "text-muted"}`} />
                      ))}
                    </div>
                    
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono-data uppercase tracking-wider min-w-[120px] text-center ${
                      entry.outcome === "Successful"
                        ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                        : entry.outcome === "Complicated"
                        ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                        : "bg-red-400/10 text-red-400 border border-red-400/20"
                    }`}>
                      {entry.outcome}
                    </span>
                    
                    <span className="text-2xl font-bold text-primary font-mono-data w-16 text-right">
                      {entry.score}
                    </span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="px-8 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div className="text-muted-foreground text-sm font-mono-data mb-4 tracking-wide">No clinical records found.</div>
                <Link href="/procedures">
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2 font-semibold font-display shadow-lg transition-transform hover:scale-105">
                    Enter the OR
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Achievements */}
        <div>
          <h2
            className="text-xl font-bold text-foreground mb-6 px-2 tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Clinical Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {BADGES.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`p-5 rounded-2xl achievement-card ${badge.unlocked ? "unlocked" : "locked"}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 drop-shadow-[0_0_8px_rgba(126,200,227,0.3)]">
                  {badge.icon}
                </div>
                <div
                  className="font-bold text-base text-foreground mb-1 tracking-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {badge.name}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed font-mono-data tracking-wide">{badge.desc}</div>
                
                {badge.unlocked && (
                  <div className="mt-4 flex items-center gap-1.5 bg-primary/10 w-fit px-2.5 py-1 rounded-full border border-primary/20">
                    <Award className="w-3 h-3 text-primary" />
                    <span className="text-[10px] uppercase font-bold text-primary font-mono-data tracking-widest">Unlocked</span>
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
