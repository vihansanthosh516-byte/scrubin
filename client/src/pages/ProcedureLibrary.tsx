/**
 * ScrubIn Procedure Library — Clinical Precision Design
 * All procedures ordered by difficulty (Beginner → Intermediate → Advanced)
 * NO EMOJIS - clean text-only interface
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Clock, Shuffle, Star, ArrowRight, Search, Activity, Heart, Brain, Bone, Baby, Scissors, Stethoscope, Shield, Zap } from "lucide-react";
import { ProcedureCard } from "@/components/ui/scrubin-card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced", "Emergency", "Cardiovascular", "Neurological", "Orthopedic", "General", "OB/GYN", "Thoracic", "Urologic", "Plastic", "ENT"];

// Icon component to replace emojis
const ProcedureIcon = ({ category }: { category: string }) => {
  const iconClass = "w-8 h-8";
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

const PROCEDURES = [
  // ═══ BEGINNER ═══
  {
    id: "appendectomy",
    name: "Appendectomy",
    tag: "Emergency",
    difficulty: "Beginner",
    diffColor: "text-emerald-400",
    diffBg: "bg-emerald-400/10 border-emerald-400/20",
    category: "General",
    time: "25 min",
    decisions: 42,
    description: "The most common emergency surgery. Navigate acute appendicitis from diagnosis to wound closure.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "inguinal-hernia",
    name: "Inguinal Hernia Repair",
    tag: "General",
    difficulty: "Beginner",
    diffColor: "text-emerald-400",
    diffBg: "bg-emerald-400/10 border-emerald-400/20",
    category: "General",
    time: "30 min",
    decisions: 38,
    description: "Mesh repair of inguinal hernia. Identify anatomy, avoid nerve injury, secure mesh placement.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "thyroidectomy",
    name: "Thyroidectomy",
    tag: "ENT",
    difficulty: "Beginner",
    diffColor: "text-emerald-400",
    diffBg: "bg-emerald-400/10 border-emerald-400/20",
    category: "ENT",
    time: "45 min",
    decisions: 40,
    description: "Partial or total thyroid removal. Identify recurrent laryngeal nerve, preserve parathyroids.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "carpal-tunnel",
    name: "Carpal Tunnel Release",
    tag: "Orthopedic",
    difficulty: "Beginner",
    diffColor: "text-emerald-400",
    diffBg: "bg-emerald-400/10 border-emerald-400/20",
    category: "Orthopedic",
    time: "20 min",
    decisions: 32,
    description: "Release of transverse carpal ligament. Identify median nerve, prevent injury, ensure complete release.",
    unlocked: false,
    bestScore: null,
  },

  // ═══ INTERMEDIATE ═══
  {
    id: "cholecystectomy",
    name: "Cholecystectomy",
    tag: "Laparoscopic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "General",
    time: "30 min",
    decisions: 51,
    description: "Laparoscopic gallbladder removal. Critical anatomy identification and bile duct safety.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "acl-reconstruction",
    name: "ACL Reconstruction",
    tag: "Orthopedic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "Orthopedic",
    time: "35 min",
    decisions: 48,
    description: "Sports medicine-focused knee reconstruction. Graft selection, tunnel placement, fixation.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "c-section",
    name: "Cesarean Section",
    tag: "OB/GYN",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "OB/GYN",
    time: "28 min",
    decisions: 50,
    description: "Cesarean delivery with maternal and fetal safety focus. Uterine incision and repair.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "total-knee-replacement",
    name: "Total Knee Replacement",
    tag: "Orthopedic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "Orthopedic",
    time: "40 min",
    decisions: 55,
    description: "Degenerative osteoarthritis treatment. Critical alignment, bone cuts, and component sizing.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "hysterectomy",
    name: "Total Hysterectomy",
    tag: "OB/GYN",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "OB/GYN",
    time: "45 min",
    decisions: 52,
    description: "Removal of uterus and cervix. Identify ureters, ligate uterine vessels, vaginal cuff closure.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "sigmoid-colectomy",
    name: "Sigmoid Colectomy",
    tag: "General",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "General",
    time: "50 min",
    decisions: 35,
    description: "Resection for diverticulitis. Mobilize colon, identify ureter, perform anastomosis safely.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "lap-cholecystectomy",
    name: "Laparoscopic Cholecystectomy",
    tag: "Laparoscopic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "General",
    time: "35 min",
    decisions: 48,
    description: "Minimally invasive gallbladder removal. Critical view of safety, manage Calot's triangle.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "nephrectomy",
    name: "Radical Nephrectomy",
    tag: "Urologic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "Urologic",
    time: "55 min",
    decisions: 50,
    description: "Removal of kidney for tumor. Mobilize kidney, control renal hilum, avoid adrenal injury.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "hip-replacement",
    name: "Total Hip Replacement",
    tag: "Orthopedic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "Orthopedic",
    time: "50 min",
    decisions: 54,
    description: "Hip arthroplasty for arthritis. Approach, femoral preparation, acetabular placement, reduce hip.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "breast-lumpectomy",
    name: "Breast Lumpectomy",
    tag: "General",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "General",
    time: "40 min",
    decisions: 38,
    description: "Breast-conserving surgery for cancer. Achieve negative margins, sentinel node biopsy, cosmesis.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "tympanoplasty",
    name: "Tympanoplasty",
    tag: "ENT",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "ENT",
    time: "60 min",
    decisions: 42,
    description: "Eardrum repair surgery. Graft placement, ossicular reconstruction, canalplasty.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "femoral-nailing",
    name: "Femoral Nail Fixation",
    tag: "Orthopedic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "Orthopedic",
    time: "45 min",
    decisions: 46,
    description: "Intramedullary nailing for femur fracture. Entry point, reaming, nail placement, locking screws.",
    unlocked: false,
    bestScore: null,
  },

  // ═══ ADVANCED ═══
  {
    id: "cabg",
    name: "Heart Bypass (CABG)",
    tag: "Cardiovascular",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Cardiovascular",
    time: "55 min",
    decisions: 78,
    description: "High-stakes coronary artery bypass grafting. Complex decision tree with cardiopulmonary bypass.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "craniotomy",
    name: "Craniotomy for Tumor",
    tag: "Neurological",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Neurological",
    time: "60 min",
    decisions: 85,
    description: "Brain surgery basics with neuroscience focus. Navigate anatomy, ICP management, and closure.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "spinal-fusion",
    name: "Spinal Fusion (L4-L5)",
    tag: "Neurosurgery",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Neurological",
    time: "45 min",
    decisions: 65,
    description: "Multi-level spinal stabilization. Navigate pedicle screw placement and dural protection.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "exploratory-laparotomy",
    name: "Emergency Exploratory Laparotomy",
    tag: "Trauma and Emergency",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "General",
    time: "50 min",
    decisions: 60,
    description: "High-acuity trauma control. Rapidly identify and ligate hemorrhage in an unstable patient.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "lobectomy",
    name: "Pulmonary Lobectomy",
    tag: "Thoracic",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Thoracic",
    time: "65 min",
    decisions: 72,
    description: "Removal of lung lobe for cancer. Isolate pulmonary vessels, divide bronchus, manage air leak.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "whipple",
    name: "Whipple Procedure",
    tag: "General",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "General",
    time: "90 min",
    decisions: 88,
    description: "Pancreaticoduodenectomy for cancer. Complex reconstruction, manage pancreatic leak risk.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "aortic-aneurysm",
    name: "AAA Repair",
    tag: "Cardiovascular",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Cardiovascular",
    time: "70 min",
    decisions: 75,
    description: "Abdominal aortic aneurysm repair. Cross-clamp, graft placement, manage ischemia.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "prostatectomy",
    name: "Radical Prostatectomy",
    tag: "Urologic",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Urologic",
    time: "60 min",
    decisions: 68,
    description: "Removal of prostate for cancer. Preserve neurovascular bundles, vesicourethral anastomosis.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "esophagectomy",
    name: "Esophagectomy",
    tag: "Thoracic",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Thoracic",
    time: "80 min",
    decisions: 82,
    description: "Removal of esophagus for cancer. Gastric pull-up, cervical anastomosis, manage leak risk.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "liver-resection",
    name: "Hepatic Lobectomy",
    tag: "General",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "General",
    time: "75 min",
    decisions: 70,
    description: "Liver resection for tumor. Vascular control, parenchymal transection, manage bleeding.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "microdiscectomy",
    name: "Lumbar Microdiscectomy",
    tag: "Neurological",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Neurological",
    time: "40 min",
    decisions: 55,
    description: "Disc herniation surgery. Identify nerve root, remove disc fragment, protect dura.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "cabg-opcab",
    name: "Off-Pump CABG",
    tag: "Cardiovascular",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    category: "Cardiovascular",
    time: "60 min",
    decisions: 80,
    description: "Beating heart bypass surgery. Stabilize heart, perform anastomosis without cardiopulmonary bypass.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "rotator-cuff",
    name: "Rotator Cuff Repair",
    tag: "Orthopedic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "Orthopedic",
    time: "45 min",
    decisions: 44,
    description: "Arthroscopic repair of rotator cuff. Anchor placement, tendon mobilization, knot tying.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "rhinoplasty",
    name: "Rhinoplasty",
    tag: "Plastic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "Plastic",
    time: "90 min",
    decisions: 58,
    description: "Nose reshaping surgery. Osteotomies, cartilage grafting, achieve aesthetic goals.",
    unlocked: false,
    bestScore: null,
  },
  {
    id: "parathyroidectomy",
    name: "Parathyroidectomy",
    tag: "ENT",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    category: "ENT",
    time: "35 min",
    decisions: 40,
    description: "Remove parathyroid adenoma. Identify all glands, preserve recurrent laryngeal nerve.",
    unlocked: false,
    bestScore: null,
  },
];

export default function ProcedureLibrary() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userXP, setUserXP] = useState(0);
  const [completedProcedures, setCompletedProcedures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("difficulty"); // difficulty, duration, popularity
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // XP thresholds to unlock procedures
  // Beginner: 0 XP (always unlocked)
  // Intermediate: 500 XP (complete ~4 beginner surgeries)
  // Advanced: 2000 XP (complete ~16 surgeries or several intermediate)

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('procedure_id, score')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to load progress:', error);
        return;
      }

      // Calculate total XP: 50 for failed (Critical), 100 + bonus for others
      const totalXP = (data || []).reduce((acc: number, session: any) => {
        if (session.outcome === "Critical") {
          return acc + 50; // 50 XP for failed surgeries
        }
        return acc + 100 + Math.floor(session.score / 10);
      }, 0);
      setUserXP(totalXP);

      // Track completed procedures
      const completed = (data || []).map((s: any) => s.procedure_id);
      setCompletedProcedures(completed);
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  };

  // Check if procedure is unlocked based on XP
  const isProcedureUnlocked = (proc: typeof PROCEDURES[0]) => {
    // Beginner procedures always unlocked
    if (proc.difficulty === "Beginner") return true;

    // Intermediate requires 500 XP
    if (proc.difficulty === "Intermediate") {
      return userXP >= 500;
    }

    // Advanced requires 2000 XP
    if (proc.difficulty === "Advanced") {
      return userXP >= 2000;
    }

    return true;
  };

  const filtered = PROCEDURES.filter(p => {
    const matchesFilter =
      activeFilter === "All" ||
      p.difficulty === activeFilter ||
      p.tag === activeFilter ||
      p.category === activeFilter;
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="pt-24 pb-8 border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="label-mono block mb-3">Procedure Library</span>
            <h1
              className="text-4xl md:text-6xl font-bold text-foreground mb-3"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Choose Your Procedure
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              {PROCEDURES.length} procedures available — from beginner to advanced
            </p>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className={`relative flex-1 max-w-sm transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
            <input
              type="text"
              placeholder="Search procedures..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-mono-data"
            />
            {/* Search glow effect */}
            {isSearchFocused && (
              <div className="absolute inset-0 rounded-xl border-2 border-primary/20 pointer-events-none" />
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.slice(0, 8).map(f => (
              <motion.button
                key={f}
                onClick={() => setActiveFilter(f)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all font-mono-data uppercase tracking-wide ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(126,200,227,0.3)]"
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Enhanced XP Progress Banner */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-xl relative overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-teal-400/5 to-primary/5 animate-gradient-shift" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="label-mono text-muted-foreground text-[10px] uppercase tracking-widest">Your Experience</span>
                  <p className="text-3xl font-bold text-primary mt-1" style={{ fontFamily: "'Syne', sans-serif" }}>{userXP.toLocaleString()} XP</p>
                </div>
                <motion.div 
                  className="text-right"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {userXP < 500 ? (
                    <div className="flex items-center gap-2 text-amber-400">
                      <span className="text-sm font-semibold">🔒 Intermediate at 500 XP</span>
                    </div>
                  ) : userXP < 2000 ? (
                    <div className="flex items-center gap-2 text-red-400">
                      <span className="text-sm font-semibold">🔒 Advanced at 2000 XP</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="text-sm font-semibold">✓ All Unlocked!</span>
                    </div>
                  )}
                </motion.div>
              </div>
              
              {/* Progress bar to next level */}
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden border border-border/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: userXP < 500 ? `${(userXP / 500) * 100}%` : userXP < 2000 ? `${((userXP - 500) / 1500) * 100}%` : '100%'
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${userXP >= 2000 ? 'bg-emerald-400' : 'bg-primary'} shadow-[0_0_10px_rgba(126,200,227,0.5)]`}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proc, i) => {
            const unlocked = isProcedureUnlocked(proc);
            const requiredXP = proc.difficulty === "Beginner" ? 0 : proc.difficulty === "Intermediate" ? 500 : 2000;
            return (
              <Link key={proc.id} href={unlocked ? `/simulation?proc=${proc.id}` : "#"}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProcedureCard
                    {...proc}
                    unlocked={unlocked}
                    requiredXP={requiredXP}
                    icon={<ProcedureIcon category={proc.category} />}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-mono-data">No procedures match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
