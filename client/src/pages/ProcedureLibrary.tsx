/**
 * ScrubIn Procedure Library — Clinical Precision Design
 * Filter bar, procedure cards with difficulty badges, anatomical illustrations
 */
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Lock, Clock, Shuffle, Star, ArrowRight, Search } from "lucide-react";

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced", "Emergency", "Cardiovascular", "Neurological"];

const PROCEDURES = [
  {
    id: "appendectomy",
    name: "Appendectomy",
    tag: "Emergency",
    difficulty: "Beginner",
    diffColor: "text-emerald-400",
    diffBg: "bg-emerald-400/10 border-emerald-400/20",
    icon: "🫀",
    time: "25 min",
    decisions: 42,
    description: "The most common emergency surgery. Navigate acute appendicitis from diagnosis to wound closure.",
    unlocked: true,
    bestScore: 94,
  },
  {
    id: "cabg",
    name: "Heart Bypass (CABG)",
    tag: "Cardiovascular",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    icon: "❤️",
    time: "55 min",
    decisions: 78,
    description: "High-stakes coronary artery bypass grafting. Complex decision tree with cardiopulmonary bypass.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "craniotomy",
    name: "Craniotomy",
    tag: "Neurological",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    icon: "🧠",
    time: "60 min",
    decisions: 85,
    description: "Brain surgery basics with neuroscience focus. Navigate anatomy, ICP management, and closure.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "cholecystectomy",
    name: "Cholecystectomy",
    tag: "Laparoscopic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    icon: "🫁",
    time: "30 min",
    decisions: 51,
    description: "Laparoscopic gallbladder removal. Critical anatomy identification and bile duct safety.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "acl",
    name: "ACL Reconstruction",
    tag: "Orthopedic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    icon: "🦴",
    time: "35 min",
    decisions: 48,
    description: "Sports medicine-focused knee reconstruction. Graft selection, tunnel placement, fixation.",
    unlocked: true,
    bestScore: null,
  },
  {
    id: "csection",
    name: "C-Section",
    tag: "OB/GYN",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    icon: "👶",
    time: "28 min",
    decisions: 44,
    description: "Cesarean delivery with maternal and fetal safety focus. Uterine incision and repair.",
    unlocked: false,
    requiredRank: "Resident",
    bestScore: null,
  },
  {
    id: "kidney",
    name: "Kidney Transplant",
    tag: "Transplant",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    icon: "🫘",
    time: "65 min",
    decisions: 92,
    description: "Organ transplant mechanics, vascular anastomosis, and immunosuppression management.",
    unlocked: false,
    requiredRank: "Attending",
    bestScore: null,
  },
];

export default function ProcedureLibrary() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = PROCEDURES.filter(p => {
    const matchesFilter =
      activeFilter === "All" ||
      p.difficulty === activeFilter ||
      p.tag === activeFilter;
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Choose Your Procedure
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Every case is different. Every decision matters.
            </p>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search procedures..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-mono-data"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all font-mono-data uppercase tracking-wide ${
                      activeFilter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proc, i) => (
            <motion.div
              key={proc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={proc.unlocked ? { y: -5 } : {}}
              className={`relative glass-card-light rounded-2xl border overflow-hidden transition-all duration-300 ${
                proc.unlocked
                  ? "border-border hover:border-primary/40 hover:baby-blue-glow cursor-pointer"
                  : "border-border opacity-70"
              }`}
            >
              {/* Illustration Area */}
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663492570043/KFxREKjUwBni37ALGkPJdZ/scrubin-procedure-cards-bg-HaZ4FXRRzrU3VFauehtyWN.webp)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <span className="relative text-5xl">{proc.icon}</span>
                {/* Difficulty badge */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border ${proc.diffBg} ${proc.diffColor} font-mono-data`}>
                  {proc.difficulty}
                </div>
                {/* Lock overlay */}
                {!proc.unlocked && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono-data">
                      Reach {proc.requiredRank}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="text-lg font-bold text-foreground"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {proc.name}
                  </h3>
                </div>
                <span className="label-mono text-muted-foreground block mb-3">{proc.tag}</span>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{proc.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono-data mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {proc.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shuffle className="w-3 h-3" /> {proc.decisions} decisions
                  </span>
                  {proc.bestScore && (
                    <span className="flex items-center gap-1 text-primary">
                      <Star className="w-3 h-3 fill-primary" /> {proc.bestScore}%
                    </span>
                  )}
                </div>

                {proc.unlocked ? (
                  <Link href={`/simulation?proc=${proc.id}`}>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Enter OR <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="w-full rounded-xl opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1.5" /> Locked
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-mono-data">No procedures match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
