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
import { ProcedureCard } from "@/components/ui/scrubin-card";

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
    id: "acl-reconstruction",
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
    id: "c-section",
    name: "C-Section",
    tag: "OB/GYN",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    icon: "👶",
    time: "28 min",
    decisions: 50,
    description: "Cesarean delivery with maternal and fetal safety focus. Uterine incision and repair.",
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
    icon: "🦴",
    time: "45 min",
    decisions: 65,
    description: "Multi-level spinal stabilization. Navigate pedicle screw placement and dural protection.",
    unlocked: true,
    requiredRank: "Fellow",
    bestScore: null,
  },
  {
    id: "total-knee-replacement",
    name: "Total Knee Replacement",
    tag: "Orthopedic",
    difficulty: "Intermediate",
    diffColor: "text-amber-400",
    diffBg: "bg-amber-400/10 border-amber-400/20",
    icon: "🔩",
    time: "40 min",
    decisions: 55,
    description: "Degenerative osteoarthritis treatment. Critical alignment, bone cuts, and component sizing.",
    unlocked: true,
    requiredRank: "Resident",
    bestScore: null,
  },
  {
    id: "exploratory-laparotomy",
    name: "Emergency Exploratory Laparotomy",
    tag: "Trauma and Emergency",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    diffBg: "bg-red-400/10 border-red-400/20",
    icon: "🚨",
    time: "50 min",
    decisions: 60,
    description: "High-acuity trauma control. Rapidly identify and ligate hemorrhage in an unstable patient.",
    unlocked: true,
    requiredRank: "Resident",
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
              style={{ fontFamily: "'Syne', sans-serif" }}
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
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-mono-data"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all font-mono-data uppercase tracking-wide ${
                      activeFilter === f
                        ? "bg-primary text-primary-foreground shadow-sm"
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
            <Link key={proc.id} href={proc.unlocked ? `/simulation?proc=${proc.id}` : "#"}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <ProcedureCard
                  {...proc}
                  onClick={proc.unlocked ? () => {} : undefined}
                />
              </motion.div>
            </Link>
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
