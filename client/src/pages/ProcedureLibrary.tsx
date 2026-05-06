/**
 * ScrubIn Procedure Library v2.0 - Heavy Animations Edition
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Clock, Shuffle, Star, ArrowRight, Search, Activity, Heart, Brain, Bone, Baby, Scissors, Stethoscope, Shield, Zap, ChevronRight, Filter, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced", "Emergency", "Cardiovascular", "Neurological", "Orthopedic", "General", "OB/GYN", "Thoracic", "Urologic", "Plastic", "ENT"];

const PROCEDURES = [
  { id: "appendectomy", name: "Appendectomy", tag: "Emergency", difficulty: "Beginner", diffColor: "text-emerald-400", diffBg: "bg-emerald-400/10 border-emerald-400/20", category: "General", time: "25 min", decisions: 42, description: "The most common emergency surgery.", unlocked: true, bestScore: null },
  { id: "inguinal-hernia", name: "Inguinal Hernia Repair", tag: "General", difficulty: "Beginner", diffColor: "text-emerald-400", diffBg: "bg-emerald-400/10 border-emerald-400/20", category: "General", time: "30 min", decisions: 38, description: "Mesh repair of inguinal hernia.", unlocked: true, bestScore: null },
  { id: "thyroidectomy", name: "Thyroidectomy", tag: "ENT", difficulty: "Beginner", diffColor: "text-emerald-400", diffBg: "bg-emerald-400/10 border-emerald-400/20", category: "ENT", time: "45 min", decisions: 40, description: "Partial or total thyroid removal.", unlocked: true, bestScore: null },
  { id: "carpal-tunnel-release", name: "Carpal Tunnel Release", tag: "Orthopedic", difficulty: "Beginner", diffColor: "text-emerald-400", diffBg: "bg-emerald-400/10 border-emerald-400/20", category: "Orthopedic", time: "20 min", decisions: 32, description: "Release of transverse carpal ligament.", unlocked: false, bestScore: null },
  { id: "cholecystectomy", name: "Cholecystectomy", tag: "Laparoscopic", difficulty: "Intermediate", diffColor: "text-amber-400", diffBg: "bg-amber-400/10 border-amber-400/20", category: "General", time: "30 min", decisions: 51, description: "Laparoscopic gallbladder removal.", unlocked: true, bestScore: null },
  { id: "acl-reconstruction", name: "ACL Reconstruction", tag: "Orthopedic", difficulty: "Intermediate", diffColor: "text-amber-400", diffBg: "bg-amber-400/10 border-amber-400/20", category: "Orthopedic", time: "35 min", decisions: 48, description: "Sports medicine knee reconstruction.", unlocked: true, bestScore: null },
  { id: "c-section", name: "Cesarean Section", tag: "OB/GYN", difficulty: "Intermediate", diffColor: "text-amber-400", diffBg: "bg-amber-400/10 border-amber-400/20", category: "OB/GYN", time: "28 min", decisions: 50, description: "Cesarean delivery with maternal safety.", unlocked: true, bestScore: null },
  { id: "total-knee-replacement", name: "Total Knee Replacement", tag: "Orthopedic", difficulty: "Intermediate", diffColor: "text-amber-400", diffBg: "bg-amber-400/10 border-amber-400/20", category: "Orthopedic", time: "40 min", decisions: 55, description: "Degenerative osteoarthritis treatment.", unlocked: true, bestScore: null },
  { id: "cabg", name: "Heart Bypass (CABG)", tag: "Cardiovascular", difficulty: "Advanced", diffColor: "text-red-400", diffBg: "bg-red-400/10 border-red-400/20", category: "Cardiovascular", time: "55 min", decisions: 78, description: "High-stakes coronary artery bypass.", unlocked: true, bestScore: null },
  { id: "craniotomy", name: "Craniotomy for Tumor", tag: "Neurological", difficulty: "Advanced", diffColor: "text-red-400", diffBg: "bg-red-400/10 border-red-400/20", category: "Neurological", time: "60 min", decisions: 85, description: "Brain surgery basics.", unlocked: true, bestScore: null },
  { id: "spinal-fusion", name: "Spinal Fusion (L4-L5)", tag: "Neurosurgery", difficulty: "Advanced", diffColor: "text-red-400", diffBg: "bg-red-400/10 border-red-400/20", category: "Neurological", time: "45 min", decisions: 65, description: "Multi-level spinal stabilization.", unlocked: true, bestScore: null },
  { id: "exploratory-laparotomy", name: "Emergency Exploratory Laparotomy", tag: "Trauma", difficulty: "Advanced", diffColor: "text-red-400", diffBg: "bg-red-400/10 border-red-400/20", category: "General", time: "50 min", decisions: 60, description: "High-acuity trauma control.", unlocked: true, bestScore: null },
];

const ProcedureIcon = ({ category }: { category: string }) => {
  const iconClass = "w-10 h-10";
  const iconMap: Record<string, React.ReactNode> = {
    "Emergency": <Activity className={`${iconClass} text-red-400`} />,
    "Cardiovascular": <Heart className={`${iconClass} text-red-400`} />,
    "Neurological": <Brain className={`${iconClass} text-pink-400`} />,
    "Orthopedic": <Bone className={`${iconClass} text-amber-400`} />,
    "OB/GYN": <Baby className={`${iconClass} text-purple-400`} />,
    "General": <Scissors className={`${iconClass} text-blue-400`} />,
    "Thoracic": <Activity className={`${iconClass} text-cyan-400`} />,
    "Urologic": <Shield className={`${iconClass} text-green-400`} />,
    "Plastic": <Star className={`${iconClass} text-rose-400`} />,
    "ENT": <Stethoscope className={`${iconClass} text-teal-400`} />,
    "Laparoscopic": <Zap className={`${iconClass} text-yellow-400`} />,
  };
  return iconMap[category] || <Activity className={`${iconClass} text-primary`} />;
};

function ProcedureCard({ proc, unlocked, requiredXP, index, userXP }: any) {
  const isLocked = !unlocked;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, rotateY: 10 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, type: "spring", stiffness: 100 }}
      whileHover={{ y: -12, scale: 1.05, rotateY: -5 }}
      className="group relative"
    >
      <Link href={isLocked ? "#" : `/simulation?proc=${proc.id}`}>
        <div className={`relative p-8 rounded-3xl glass-card transition-all duration-500 overflow-hidden ${isLocked ? 'opacity-60' : ''}`}>
          {/* Animated gradient background on hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            animate={{ 
              background: [
                "linear-gradient(135deg, rgba(126,200,227,0) 0%, transparent 50%)",
                "linear-gradient(135deg, rgba(126,200,227,0.15) 0%, transparent 50%)",
                "linear-gradient(135deg, rgba(126,200,227,0) 0%, transparent 50%)"
              ]
            }}
          />
          
          {/* Lock overlay */}
          {isLocked && (
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="w-16 h-16 text-primary mb-4" />
              </motion.div>
              <div className="absolute bottom-8 text-center">
                <p className="text-primary font-bold text-lg">Requires {requiredXP} XP</p>
                <p className="text-muted-foreground text-sm">Complete more procedures to unlock</p>
              </div>
            </motion.div>
          )}

          {/* Icon with rotation */}
          <motion.div 
            className={`w-20 h-20 rounded-2xl ${proc.diffBg} border flex items-center justify-center mb-6 mx-auto group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}
            whileHover={{ scale: 1.3, rotate: 15 }}
          >
            <ProcedureIcon category={proc.category} />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${proc.diffBg} backdrop-blur-sm`} whileHover={{ scale: 1.1 }}>
                {proc.difficulty}
              </motion.span>
              <span className="text-xs text-muted-foreground font-mono-data">{proc.tag}</span>
            </div>

            <motion.h3 
              className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
              whileHover={{ x: 5 }}
            >
              {proc.name}
            </motion.h3>

            <p className="text-muted-foreground text-sm mb-6 line-clamp-2">{proc.description}</p>

            <div className="flex items-center justify-between text-xs font-mono-data">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {proc.time}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-4 h-4" /> {proc.decisions} decisions
                </span>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
          </div>

          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-3xl border-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function ProcedureLibrary() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userXP, setUserXP] = useState(0);
  const [sortBy, setSortBy] = useState("difficulty");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('sessions').select('procedure_id, score, outcome');
      if (data) {
        const totalXP = data.reduce((acc: number, session: any) => {
          if (session.outcome === "Critical") return acc + 50;
          return acc + 100 + Math.floor(session.score / 10);
        }, 0);
        setUserXP(totalXP);
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  };

  const isUnlocked = (proc: any) => {
    if (proc.difficulty === "Beginner") return true;
    if (proc.difficulty === "Intermediate") return userXP >= 500;
    if (proc.difficulty === "Advanced") return userXP >= 2000;
    return true;
  };

  const filtered = PROCEDURES.filter(p => {
    const matchesFilter = activeFilter === "All" || p.difficulty === activeFilter || p.tag === activeFilter || p.category === activeFilter;
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.tag.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7EC8E3 0%, transparent 70%)", top: "-20%", right: "-10%" }}
          animate={{ x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #5DCAA5 0%, transparent 70%)", bottom: "-10%", left: "-5%" }}
          animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <div className="pt-32 pb-12 border-b border-border bg-muted/20 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono-data text-primary">Procedure Library</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Choose Your <span className="text-gradient">Procedure</span>
            </h1>
            <p className="text-muted-foreground text-xl mb-8">
              {PROCEDURES.length} procedures across all difficulty levels
            </p>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div 
                className={`relative flex-1 max-w-sm transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}
                animate={{ scale: isSearchFocused ? 1.05 : 1 }}
              >
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                <input
                  type="text"
                  placeholder="Search procedures..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono-data"
                />
              </motion.div>
              <div className="flex gap-2 flex-wrap">
                {FILTERS.slice(0, 8).map(f => (
                  <motion.button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all font-mono-data uppercase tracking-wide ${
                      activeFilter === f
                        ? "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(126,200,227,0.4)]"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                    }`}
                  >
                    {f}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        {/* XP Progress Banner */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-8 rounded-3xl glass-card relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-teal-400/5 to-primary/5 animate-gradient-shift" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="label-mono text-muted-foreground text-[10px] uppercase tracking-widest">Your Experience</span>
                  <motion.p 
                    className="text-4xl font-bold text-primary mt-2" 
                    style={{ fontFamily: "'Syne', sans-serif" }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    {userXP.toLocaleString()} XP
                  </motion.p>
                </div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {userXP < 500 ? (
                    <div className="flex items-center gap-2 text-amber-400">
                      <Lock className="w-5 h-5" />
                      <span className="text-sm font-semibold">Intermediate at 500 XP</span>
                    </div>
                  ) : userXP < 2000 ? (
                    <div className="flex items-center gap-2 text-red-400">
                      <Lock className="w-5 h-5" />
                      <span className="text-sm font-semibold">Advanced at 2000 XP</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                        <Star className="w-5 h-5" />
                      </motion.div>
                      <span className="text-sm font-semibold">✓ All Unlocked!</span>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="h-3 bg-muted/30 rounded-full overflow-hidden border border-border/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: userXP < 500 ? `${(userXP / 500) * 100}%` : userXP < 2000 ? `${((userXP - 500) / 1500) * 100}%` : '100%'
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full ${userXP >= 2000 ? 'bg-emerald-400' : 'bg-primary'} shadow-[0_0_20px_rgba(126,200,227,0.6)]`}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Procedures Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((proc, i) => (
            <ProcedureCard
              key={proc.id}
              proc={proc}
              unlocked={isUnlocked(proc)}
              requiredXP={proc.difficulty === "Intermediate" ? 500 : proc.difficulty === "Advanced" ? 2000 : 0}
              index={i}
              userXP={userXP}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 text-muted-foreground"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Search className="w-16 h-16 mx-auto mb-6 opacity-30" />
            </motion.div>
            <p className="text-xl font-mono-data">No procedures match your search.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
