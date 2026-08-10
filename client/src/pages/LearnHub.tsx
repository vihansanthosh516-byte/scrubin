/**
 * ScrubIn Learn Hub v2.0 - Heavy Animations
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Clock, BookOpen, ChevronRight, Tag, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Anatomy", "Procedures", "Pharmacology", "Complications", "Techniques"];

const ARTICLES = [
  { id: 1, title: "Appendectomy: Complete Surgical Guide", category: "Procedures", readTime: "12 min", difficulty: "Beginner", excerpt: "Master the appendectomy from diagnosis to closure." },
  { id: 2, title: "Cholecystectomy: Critical View of Safety", category: "Procedures", readTime: "15 min", difficulty: "Intermediate", excerpt: "The most common abdominal surgery." },
  { id: 3, title: "Coronary Artery Bypass Grafting", category: "Procedures", readTime: "18 min", difficulty: "Advanced", excerpt: "Gold standard for multivessel disease." },
  { id: 4, title: "Craniotomy for Tumor Resection", category: "Procedures", readTime: "20 min", difficulty: "Advanced", excerpt: "Neurosurgical precision at its finest." },
  { id: 5, title: "Cesarean Section: Safe Delivery", category: "Procedures", readTime: "14 min", difficulty: "Intermediate", excerpt: "The most common major surgery worldwide." },
  { id: 6, title: "ACL Reconstruction Principles", category: "Procedures", readTime: "16 min", difficulty: "Intermediate", excerpt: "Restore knee stability with anatomic ACL reconstruction." },
];

export default function LearnHub() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [mounted, setMounted] = useState(true);

  const filtered = ARTICLES.filter(a => activeCategory === "All" || a.category === activeCategory);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle warm editorial texture — no neon */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(#8C827A 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="pt-32 pb-16 relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Link href="/">
                <motion.div whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                </motion.div>
              </Link>
            </div>
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-[#2E6B4B]" />
              <span className="text-sm font-mono-data text-[#2E6B4B]">Knowledge Base</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              Learn <span className="text-[#CC553D] dark:text-[#D95338]">Hub</span>
            </h1>
            <p className="text-muted-foreground text-xl">Comprehensive surgical education</p>
          </motion.div>
        </div>

        {/* Category Filters */}
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <motion.div 
            className="flex gap-3 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-3 rounded-sm text-sm font-semibold transition-all font-mono-data uppercase tracking-wide ${
                  activeCategory === cat
                    ? "bg-[#2E6B4B] text-white shadow-[0_0_30px_rgba(93,202,165,0.5)]"
                    : "bg-muted/50 text-muted-foreground hover:bg-[#2E6B4B]/10 hover:border-[#2E6B4B]/30 border border-border"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -12, scale: 1.05 }}
                className="group"
              >
                <div className="p-8 rounded-sm glass-card cursor-pointer relative overflow-hidden h-full border-[#2E6B4B]/20 hover:border-[#2E6B4B]/40 transition-colors">
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        article.difficulty === "Beginner" ? "bg-[#2E6B4B]/10 text-[#2E6B4B] border border-[#2E6B4B]/20" :
                        article.difficulty === "Intermediate" ? "bg-[#C27820]/10 text-[#C27820] border border-[#C27820]/40/20" :
                        "bg-[#A32A2A]/10 text-[#A32A2A] border border-[#A32A2A]/20"
                      }`}>
                        {article.difficulty}
                      </span>
                      <span className="label-mono text-muted-foreground text-xs">{article.category}</span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-[#2E6B4B] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {article.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-6 italic border-l-2 border-[#2E6B4B]/30 pl-4">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs text-muted-foreground font-mono-data">
                        <Clock className="w-4 h-4" /> {article.readTime} read
                      </span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronRight className="w-5 h-5 text-[#2E6B4B] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
