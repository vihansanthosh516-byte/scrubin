/**
 * ScrubIn Profile - Real Streaks & Achievements
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Star, Trophy, Shield, Zap, Target, Award, Flame, TrendingUp, Github, Heart, Clock, CheckCircle, AlertCircle, Medal, Sparkles, Brain, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const ALL_BADGES = [
  { id: "first_cut", name: "First Cut", desc: "Complete your first procedure", icon: Scissors, color: "text-[#2E6B4B] dark:text-[#8FBF9A]", requirement: (stats: any) => stats.totalSurgeries >= 1 },
  { id: "perfectionist", name: "Perfectionist", desc: "Get 100% on any procedure", icon: Star, color: "text-[#D99B26] dark:text-[#E0B060]", requirement: (stats: any) => stats.bestScore === 100 },
  { id: "survivor", name: "Survivor", desc: "Complete 10 procedures", icon: Heart, color: "text-[#A32A2A] dark:text-[#E08080]", requirement: (stats: any) => stats.totalSurgeries >= 10 },
  { id: "scholar", name: "Scholar", desc: "Complete 25 procedures", icon: Brain, color: "text-[#8C5A7A] dark:text-[#C9A8BC]", requirement: (stats: any) => stats.totalSurgeries >= 25 },
  { id: "master", name: "Master Surgeon", desc: "Complete 50 procedures", icon: Trophy, color: "text-[#C27820] dark:text-[#E0B060]", requirement: (stats: any) => stats.totalSurgeries >= 50 },
  { id: "legend", name: "Legend", desc: "Complete 100 procedures", icon: Award, color: "text-[#CC553D] dark:text-[#E06D53]", requirement: (stats: any) => stats.totalSurgeries >= 100 },
  { id: "streak_3", name: "On Fire", desc: "Maintain a 3-day streak", icon: Flame, color: "text-[#C27820] dark:text-[#E0B060]", requirement: (stats: any) => stats.streak >= 3 },
  { id: "streak_7", name: "Dedicated", desc: "Maintain a 7-day streak", icon: Flame, color: "text-[#A32A2A] dark:text-[#E08080]", requirement: (stats: any) => stats.streak >= 7 },
  { id: "streak_30", name: "Obsessed", desc: "Maintain a 30-day streak", icon: Flame, color: "text-[#A32A2A] dark:text-[#E08080]", requirement: (stats: any) => stats.streak >= 30 },
  { id: "perfection_run", name: "Flawless", desc: "Complete 5 perfect surgeries in a row", icon: CheckCircle, color: "text-[#2E6B4B] dark:text-[#8FBF9A]", requirement: (stats: any) => stats.perfectRun >= 5 },
  { id: "comeback", name: "Comeback Kid", desc: "Return after a break", icon: TrendingUp, color: "text-[#CC553D] dark:text-[#E06D53]", requirement: (stats: any) => stats.hasReturned === true },
  { id: "speedster", name: "Speedster", desc: "Complete a procedure in under 10 minutes", icon: Zap, color: "text-[#E0B060] dark:text-[#E8C080]", requirement: (stats: any) => stats.fastestTime <= 600 },
];

export default function Profile() {
  const { user, loginWithGitHub } = useAuth();
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
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error || !sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate real streak
      const dates = sessions.map(s => new Date(s.created_at).toISOString().split('T')[0]);
      const uniqueDates = Array.from(new Set(dates)).sort();
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;
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
      const perfectScores = sessions.filter(s => s.score === 100);
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

      // Check badge unlocks
      const newStats = { totalSurgeries, bestScore, avgScore, streak: currentStreak, perfectRun, hasReturned, fastestTime };
      const newlyUnlocked = ALL_BADGES.filter(badge => badge.requirement(newStats)).map(b => b.id);
      setUnlockedBadges(newlyUnlocked);

    } catch (e) {
      console.error('Failed to load progress:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-sm p-8 text-center bg-card/90 backdrop-blur-xl border border-border shadow-[0_0_30px_rgba(204,85,61,0.1)]">
          <div className="w-12 h-12 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center mb-6 mx-auto">
            <Activity className="w-6 h-6 text-baby-blue" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view Profile</h1>
          <p className="text-[#8C827A] mb-8 text-sm">Track your rank, XP, and detailed surgery performance across every session.</p>
          <Button onClick={loginWithGitHub} className="w-full h-12 bg-white hover:bg-[#F4F0E8] text-black font-semibold rounded-sm flex items-center justify-center gap-3 transition-all">
            <Github className="w-5 h-5" /> Continue with GitHub
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-28 pb-16">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#2E6B4B]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="pt-8 pb-16 max-w-5xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="rounded-[2rem] p-8 mb-10 glass-card-pro relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[#2E6B4B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            <motion.div className="relative group" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
              <div className="w-24 h-24 rounded-sm border-2 border-primary/40 overflow-hidden bg-card shadow-[0_0_30px_rgba(204,85,61,0.2)] relative z-10 transition-transform group-hover:scale-110">
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <motion.div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#2E6B4B] border-[3px] border-background flex items-center justify-center z-20 shadow-[0_0_15px_rgba(46,107,75,0.5)]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </motion.div>
            </motion.div>
            <div className="flex-1">
              <motion.div className="flex items-center gap-3 mb-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <h1 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>{user.name}</h1>
                <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: "spring" }}>
                  <span className="px-3 py-1 rounded-full bg-[#CC553D] text-white text-xs font-semibold font-mono-data uppercase tracking-widest shadow-sm dark:bg-[#D95338]">{user.profession || "Resident"}</span>
                </motion.span>
              </motion.div>
              <motion.p className="text-[#666059] dark:text-[#D1C9BF] text-sm mb-6 font-mono-data tracking-wide">@{user.login} · {stats.totalSurgeries} Procedures · {stats.avgScore}% Avg</motion.p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: "Total Surgeries", value: stats.totalSurgeries, icon: Activity, color: "text-primary dark:text-[#E06D53]" },
            { label: "Best Score", value: `${stats.bestScore}%`, icon: Star, color: "text-[#D99B26] dark:text-[#E0B060]" },
            { label: "Avg Score", value: `${stats.avgScore}%`, icon: Target, color: "text-[#2E6B4B] dark:text-[#8FBF9A]" },
            { label: "Complications", value: stats.complications, icon: AlertCircle, color: "text-[#A32A2A] dark:text-[#E08080]" },
            { label: "Current Streak", value: `${stats.streak} days`, icon: Flame, color: stats.streak > 0 ? "text-[#C27820] dark:text-[#E0B060] drop-shadow-[0_0_8px_rgba(224,176,96,0.5)]" : "text-muted-foreground dark:text-[#C2BBB0]" },
            { label: "Longest Streak", value: `${stats.longestStreak} days`, icon: Trophy, color: "text-[#C27820] dark:text-[#E0B060]" },
            { label: "Perfect Run", value: stats.perfectRun, icon: CheckCircle, color: "text-[#2E6B4B] dark:text-[#8FBF9A]" },
            { label: "Fastest Time", value: stats.fastestTime < 9999 ? `${Math.floor(stats.fastestTime / 60)}:${String(stats.fastestTime % 60).padStart(2, '0')}` : "N/A", icon: Clock, color: "text-[#CC553D] dark:text-[#E06D53]" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }} className="rounded-sm p-6 glass-card flex flex-col justify-between min-h-[120px] group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.value}</div>
                <div className="label-mono text-[10px] tracking-widest text-[#8C827A] dark:text-[#C2BBB0]">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 px-2 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {ALL_BADGES.map((badge, i) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              return (
                <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.05 }} className={`p-5 rounded-sm achievement-card ${isUnlocked ? "unlocked" : "locked"}`}>
                  <div className={`w-12 h-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 drop-shadow-[0_0_8px_rgba(204,85,61,0.25)] ${badge.color}`}>
                    <badge.icon className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-base text-foreground mb-1 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>{badge.name}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed font-mono-data tracking-wide">{badge.desc}</div>
                  {isUnlocked && (
                    <div className="mt-4 flex items-center gap-1.5 bg-primary/10 w-fit px-2.5 py-1 rounded-full border border-primary/30">
                      <Award className="w-3 h-3 text-primary dark:text-[#E06D53]" />
                      <span className="text-[10px] uppercase font-bold text-primary dark:text-[#E06D53] font-mono-data tracking-widest">Unlocked</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
