/**
 * ScrubIn Leaderboard — Clinical Precision Design
 * Global rankings, top 3 podium, weekly reset
 */
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Trophy, Medal, Star, TrendingUp, Activity } from "lucide-react";

const TABS = ["Global", "This Week", "By Procedure"];

const TOP_SURGEONS = [
  { rank: 1, name: "Aisha Patel", title: "Chief of Surgery", surgeries: 142, avgScore: 97.3, successRate: "99.3%", badge: "🥇" },
  { rank: 2, name: "Marcus Chen", title: "Attending", surgeries: 118, avgScore: 95.1, successRate: "98.1%", badge: "🥈" },
  { rank: 3, name: "Sofia Rodriguez", title: "Fellow", surgeries: 89, avgScore: 93.8, successRate: "97.4%", badge: "🥉" },
];

const LEADERBOARD = [
  { rank: 4, name: "James Okafor", title: "Resident", surgeries: 76, avgScore: 91.2, successRate: "96.1%", isYou: false },
  { rank: 5, name: "Priya Nair", title: "Resident", surgeries: 71, avgScore: 90.5, successRate: "95.8%", isYou: false },
  { rank: 6, name: "Tyler Brooks", title: "Intern", surgeries: 58, avgScore: 88.9, successRate: "94.2%", isYou: false },
  { rank: 7, name: "Mei Lin", title: "Intern", surgeries: 54, avgScore: 87.4, successRate: "93.7%", isYou: false },
  { rank: 8, name: "Alex Kim", title: "Medical Student", surgeries: 43, avgScore: 84.1, successRate: "91.2%", isYou: false },
  { rank: 9, name: "Jordan Walsh", title: "Medical Student", surgeries: 38, avgScore: 82.6, successRate: "90.5%", isYou: false },
  { rank: 247, name: "You", title: "Medical Student", surgeries: 3, avgScore: 74.0, successRate: "66.7%", isYou: true },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Global");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
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

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[TOP_SURGEONS[1], TOP_SURGEONS[0], TOP_SURGEONS[2]].map((surgeon, i) => {
            const heights = ["h-28", "h-36", "h-24"];
            const isFirst = surgeon.rank === 1;
            return (
              <motion.div
                key={surgeon.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass-card-light rounded-2xl p-5 border text-center ${
                  isFirst ? "border-primary/40 baby-blue-glow" : "border-border"
                }`}
              >
                <div className="text-3xl mb-2">{surgeon.badge}</div>
                <div
                  className="font-bold text-foreground text-sm mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {surgeon.name}
                </div>
                <div className="label-mono text-muted-foreground mb-3">{surgeon.title}</div>
                <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {surgeon.avgScore}
                </div>
                <div className="label-mono text-muted-foreground">avg score</div>
              </motion.div>
            );
          })}
        </div>

        {/* Table */}
        <div className="glass-card-light rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 text-xs font-mono-data text-muted-foreground uppercase tracking-wider px-5 py-3 border-b border-border bg-muted/30">
            <span className="w-10">#</span>
            <span>Surgeon</span>
            <span className="w-20 text-right">Surgeries</span>
            <span className="w-20 text-right">Avg Score</span>
            <span className="w-20 text-right">Success</span>
          </div>
          {LEADERBOARD.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 px-5 py-4 border-b border-border/50 last:border-0 transition-colors ${
                entry.isYou
                  ? "bg-primary/10 border-primary/20"
                  : "hover:bg-muted/30"
              }`}
            >
              <span className={`w-10 font-bold text-sm ${entry.isYou ? "text-primary" : "text-muted-foreground"} font-mono-data`}>
                {entry.rank}
              </span>
              <div>
                <div
                  className={`font-semibold text-sm ${entry.isYou ? "text-primary" : "text-foreground"}`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {entry.name} {entry.isYou && <span className="text-xs text-primary/70 font-mono-data">(you)</span>}
                </div>
                <div className="label-mono text-muted-foreground">{entry.title}</div>
              </div>
              <span className="w-20 text-right font-mono-data text-sm text-foreground">{entry.surgeries}</span>
              <span className={`w-20 text-right font-mono-data text-sm font-semibold ${entry.isYou ? "text-primary" : "text-foreground"}`}>
                {entry.avgScore}%
              </span>
              <span className="w-20 text-right font-mono-data text-sm text-emerald-400">{entry.successRate}</span>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: <Trophy className="w-5 h-5" />, label: "Your Rank", value: "#247" },
            { icon: <Activity className="w-5 h-5" />, label: "Surgeries Done", value: "3" },
            { icon: <Star className="w-5 h-5" />, label: "Avg Score", value: "74%" },
          ].map(stat => (
            <div key={stat.label} className="glass-card-light rounded-xl p-4 border border-border text-center">
              <div className="text-primary mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </div>
              <div className="label-mono text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
