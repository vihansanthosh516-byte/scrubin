/**
 * ScrubIn Procedure Library v3.0 — Anthropic Editorial
 * Warm cream layout, sharp white cards, sage/amber/terracotta difficulty pills.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Clock, Search, ArrowRight, XCircle, Activity, Heart, Brain, Bone, Baby, Scissors, Stethoscope, Shield, Zap, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useProcedureStore } from "@/state/procedureStore";

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced", "Emergency", "Cardiovascular", "Neurological", "Orthopedic", "General", "OB/GYN", "Thoracic", "Urologic", "Plastic", "ENT"];

const EASE = [0.25, 1, 0.5, 1] as const;

// Editorial difficulty pills
const DIFF_PILL: Record<string, string> = {
  Beginner: "pill-sage",
  Intermediate: "pill-amber",
  Advanced: "pill-terracotta",
};

const ProcedureIcon = ({ category }: { category: string }) => {
  const iconClass = "h-6 w-6";
  const iconMap: Record<string, React.ReactNode> = {
    "Emergency": <Activity className={`${iconClass} text-[#A32A2A]`} />,
    "Cardiovascular": <Heart className={`${iconClass} text-[#CC553D]`} />,
    "Neurological": <Brain className={`${iconClass} text-[#C27820]`} />,
    "Orthopedic": <Bone className={`${iconClass} text-[#C27820]`} />,
    "OB/GYN": <Baby className={`${iconClass} text-[#A37A5A]`} />,
    "General": <Scissors className={`${iconClass} text-[#CC553D]`} />,
    "Thoracic": <Activity className={`${iconClass} text-[#5A7A8A]`} />,
    "Urologic": <Shield className={`${iconClass} text-[#2E6B4B]`} />,
    "Plastic": <Star className={`${iconClass} text-[#C27820]`} />,
    "ENT": <Stethoscope className={`${iconClass} text-[#8A5A5A]`} />,
    "Laparoscopic": <Zap className={`${iconClass} text-[#C27820]`} />,
  };
  return iconMap[category] || <Activity className={`${iconClass} text-[#CC553D]`} />;
};

function ProcedureCard({ proc, unlocked, requiredXP, index }: any) {
  const isLocked = !unlocked;
  const pill = DIFF_PILL[proc.difficulty] || "pill-neutral";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: EASE }}
      className="relative"
    >
      {isLocked ? (
        <div className={`procedure-card h-full p-6 opacity-60 select-none cursor-not-allowed`}>
          {/* Lock overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#FBF9F5]/80 backdrop-blur-[2px] dark:bg-[#161310]/80">
            <Lock className="h-8 w-8 text-[#8C827A]" />
            <p className="text-sm font-semibold text-[#191919] dark:text-[#EDEAE4]">Requires {requiredXP} XP</p>
            <p className="text-xs text-[#666059] dark:text-[#A89F95]">Complete more procedures to unlock</p>
          </div>

          {/* Icon + difficulty pill */}
          <div className="mb-5 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#E2DDD1] bg-[#FBF9F5] dark:border-[#3A342C] dark:bg-[#26211B]">
              <ProcedureIcon category={proc.category} />
            </div>
            <span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${pill}`}>
              {proc.difficulty}
            </span>
          </div>

          <h3 className="mb-2 text-lg font-semibold leading-snug tracking-tight text-[#191919] dark:text-[#EDEAE4]">
            {proc.name}
          </h3>
          <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-[#666059] dark:text-[#A89F95]">
            {proc.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center justify-between border-t border-[#E2DDD1] pt-4 font-mono-data text-xs text-[#8C827A]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {proc.time}
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" /> {proc.decisions} decisions
              </span>
            </div>
            <Lock className="h-4 w-4 text-[#8C827A]" />
          </div>
        </div>
      ) : (
        <Link href={`/simulation?proc=${proc.id}`}>
          <div className="procedure-card h-full p-6">
          {/* Icon + difficulty pill */}
          <div className="mb-5 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#E2DDD1] bg-[#FBF9F5] dark:border-[#3A342C] dark:bg-[#26211B]">
              <ProcedureIcon category={proc.category} />
            </div>
            <span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${pill}`}>
              {proc.difficulty}
            </span>
          </div>

          <h3 className="mb-2 text-lg font-semibold leading-snug tracking-tight text-[#191919] dark:text-[#EDEAE4]">
            {proc.name}
          </h3>
          <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-[#666059] dark:text-[#A89F95]">
            {proc.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center justify-between border-t border-[#E2DDD1] pt-4 font-mono-data text-xs text-[#8C827A]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {proc.time}
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" /> {proc.decisions} decisions
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-[#CC553D]" />
          </div>
          </div>
        </Link>
      )}
    </motion.div>
  );
}

export default function ProcedureLibrary() {
  const { user } = useAuth();
  const [userXP, setUserXP] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const {
    procedures, loading, error, query, difficulty, tag, category,
    setProcedures, setLoading, setError, setQuery, setDifficulty, setCategory
  } = useProcedureStore();

  const fetchProcedures = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (difficulty && difficulty !== "All") params.append("difficulty", difficulty);
      if (category && category !== "All") params.append("category", category);

      const res = await fetch(`/api/procedures/search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch procedures');

      const data = await res.json();
      const list = (Array.isArray(data) ? data : data.procedures || data.scenarios || []).map((p: any) => {
        // The registry API reports difficulty as `category` (e.g. "beginner");
        // accept both sources so badges, colors, and XP locking work everywhere.
        const rawDifficulty = String(p.difficulty || p.category || "").toLowerCase();
        const difficulty =
          rawDifficulty === "beginner" || rawDifficulty === "intermediate" || rawDifficulty === "advanced"
            ? rawDifficulty
            : "beginner";
        const displayDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        return {
          id: p.id,
          name: p.name,
          tag: p.specialty || (Array.isArray(p.tags) && p.tags.length > 0 ? p.tags[0] : "") || p.tag || "",
          difficulty: displayDifficulty,
          category: p.specialty || p.category,
          time: p.estimated_time || `${p.totalTicks ?? 0} min`,
          decisions: p.phases?.length ?? 0,
          description: p.description,
          thumbnail: p.thumbnail,
          anatomy_regions: p.anatomy_regions,
          learning_objectives: p.learning_objectives,
          required_instruments: p.required_instruments,
          unlocked: true,
        };
      });
      setProcedures(list);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProcedures();
    }, 300);
    return () => clearTimeout(handler);
  }, [query, difficulty, category]);

  useEffect(() => {
    setMounted(true);
    if (user) loadUserProgress();
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
    if (proc.difficulty?.toLowerCase() === "beginner") return true;
    if (proc.difficulty?.toLowerCase() === "intermediate") return userXP >= 500;
    if (proc.difficulty?.toLowerCase() === "advanced") return userXP >= 2000;
    return true;
  };

  const handleFilterClick = (f: string) => {
    setActiveFilter(f);
    if (f === "All") {
      setDifficulty("");
      setCategory("");
    } else if (["Beginner", "Intermediate", "Advanced"].includes(f)) {
      setDifficulty(f.toLowerCase());
      setCategory("");
    } else {
      setCategory(f);
      setDifficulty("");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#191919] dark:bg-[#161310] dark:text-[#EDEAE4]">
      {/* Header */}
      <header className="border-b border-[#E2DDD1] bg-background/60 pt-24 pb-10 backdrop-blur-sm dark:border-[#3A342C]">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CC553D] dark:bg-[#D95338]" />
              <span className="font-mono-data text-xs uppercase tracking-[0.16em] text-[#8C827A] dark:text-[#C2BBB0]">Procedure Library</span>
            </div>
            <h1 className="font-display text-4xl leading-[1.02] tracking-tight text-[#191919] sm:text-5xl md:text-6xl dark:text-[#EDEAE4]">
              Choose your <span className="text-[#CC553D] dark:text-[#D95338]">procedure</span>
            </h1>
            <p className="mt-3 text-lg text-[#666059] dark:text-[#A89F95]">
              {procedures.length} procedures across all difficulty levels
            </p>

            {/* Search + Filters */}
            <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-start">
              <motion.div
                className={`relative w-full max-w-sm transition-all duration-300 ${isSearchFocused ? "scale-[1.02]" : ""}`}
              >
                <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${isSearchFocused ? "text-[#CC553D]" : "text-[#8C827A]"}`} />
                <input
                  type="text"
                  placeholder="Search procedures..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full rounded-sm border border-[#E2DDD1] bg-white py-3 pl-12 pr-4 text-sm text-[#191919] placeholder:text-[#8C827A] transition-all focus:border-[#CC553D]/60 focus:outline-none focus:ring-2 focus:ring-[#CC553D]/15 dark:border-[#3A342C] dark:bg-[#1E1A16] dark:text-[#EDEAE4]"
                />
              </motion.div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => handleFilterClick(f)}
                    className={`rounded-sm px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                      activeFilter === f
                        ? "bg-[#CC553D] text-white"
                        : "border border-[#E2DDD1] bg-white text-[#666059] hover:border-[#CC553D]/40 hover:text-[#191919] dark:border-[#3A342C] dark:bg-[#1E1A16] dark:text-[#A89F95]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* XP Progress Banner */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-12 border border-[#E2DDD1] bg-white p-6 md:p-8 dark:border-[#3A342C] dark:bg-[#1E1A16]"
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="label-mono mb-2">Your Experience</div>
                <p className="font-mono-data text-4xl font-semibold tracking-tight text-[#191919] dark:text-[#EDEAE4]">
                  {userXP.toLocaleString()}<span className="ml-1 text-xl font-bold text-[#CC553D]">XP</span>
                </p>
              </div>
              <div className="text-sm font-medium">
                {userXP < 500 ? (
                  <span className="flex items-center gap-2 text-[#C27820]">
                    <Lock className="h-4 w-4" /> Intermediate unlocks at 500 XP
                  </span>
                ) : userXP < 2000 ? (
                  <span className="flex items-center gap-2 text-[#A32A2A]">
                    <Lock className="h-4 w-4" /> Advanced unlocks at 2000 XP
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-[#2E6B4B]">
                    <Star className="h-4 w-4" /> All procedures unlocked
                  </span>
                )}
              </div>
            </div>

            {/* Progress line — terracotta fill, amber when close to next tier */}
            <div className="h-1.5 w-full bg-[#EAE3D2] dark:bg-[#3A342C]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: userXP < 500 ? `${Math.min((userXP / 500) * 100, 100)}%` : userXP < 2000 ? `${Math.min(((userXP - 500) / 1500) * 100, 100)}%` : "100%"
                }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: EASE }}
                className={`h-full ${userXP >= 2000 ? "bg-[#2E6B4B]" : userXP >= 500 ? "bg-[#C27820]" : "bg-[#CC553D]"}`}
              />
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mb-8 flex items-center justify-between border border-[#A32A2A]/40 bg-[#A32A2A]/5 p-4 text-sm text-[#A32A2A]">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
            <Button variant="ghost" onClick={() => fetchProcedures()} className="text-[#A32A2A] hover:text-[#8B2323]">
              Retry
            </Button>
          </div>
        )}

        {/* Procedures Grid or Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="h-72 animate-pulse border border-[#E2DDD1] bg-[#F4F0E8] dark:border-[#3A342C] dark:bg-[#26211B]" />
            ))}
          </div>
        ) : procedures.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {procedures.map((proc, i) => (
              <ProcedureCard
                key={proc.id}
                proc={proc}
                unlocked={isUnlocked(proc)}
                requiredXP={proc.difficulty?.toLowerCase() === "intermediate" ? 500 : proc.difficulty?.toLowerCase() === "advanced" ? 2000 : 0}
                index={i}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-32 text-center"
          >
            <Search className="mb-6 h-14 w-14 text-[#8C827A] opacity-40" />
            <p className="mb-4 font-mono-data text-lg text-[#666059] dark:text-[#A89F95]">No procedures found.</p>
            <Button onClick={() => { setQuery(""); handleFilterClick("All"); }} className="rounded-sm bg-[#CC553D] hover:bg-[#B94A35]">
              Clear Filters
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
