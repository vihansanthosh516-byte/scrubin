/**
 * ScrubIn Home Page — Clinical Precision Design
 * Hero with OR lamp effect, ECG flatline→heartbeat, stats, procedures preview
 * Baby blue accents, Space Grotesk display, glassmorphism cards
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  ChevronRight,
  Play,
  Heart,
  Brain,
  Scissors,
  Shield,
  Star,
  Users,
  TrendingUp,
  BookOpen,
  Activity,
  Zap,
  Award,
  ArrowRight,
} from "lucide-react";

const PROCEDURES = [
  { name: "Appendectomy", tag: "Emergency", difficulty: "Beginner", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: "🫀", time: "25 min", decisions: 42 },
  { name: "Heart Bypass", tag: "Cardiovascular", difficulty: "Advanced", color: "text-red-400", bg: "bg-red-400/10", icon: "❤️", time: "55 min", decisions: 78 },
  { name: "Craniotomy", tag: "Neurological", difficulty: "Advanced", color: "text-red-400", bg: "bg-red-400/10", icon: "🧠", time: "60 min", decisions: 85 },
  { name: "Cholecystectomy", tag: "Laparoscopic", difficulty: "Intermediate", color: "text-amber-400", bg: "bg-amber-400/10", icon: "🫁", time: "30 min", decisions: 51 },
  { name: "ACL Reconstruction", tag: "Orthopedic", difficulty: "Intermediate", color: "text-amber-400", bg: "bg-amber-400/10", icon: "🦴", time: "35 min", decisions: 48 },
  { name: "C-Section", tag: "OB/GYN", difficulty: "Intermediate", color: "text-amber-400", bg: "bg-amber-400/10", icon: "👶", time: "28 min", decisions: 44 },
];

const STATS = [
  { value: 7, label: "Procedures", suffix: "" },
  { value: 200, label: "Decision Points", suffix: "+" },
  { value: 14000, label: "Students Trained", suffix: "+" },
  { value: 0, label: "Real Patients Harmed", suffix: "" },
];

const TESTIMONIALS = [
  {
    name: "Maya Chen",
    role: "Pre-Med Junior, UCLA",
    quote: "ScrubIn made anatomy click in a way no textbook ever could. I ran the appendectomy 4 times before I got it right — and I learned something new every single time.",
    badge: "🎓 Pre-Med Student",
  },
  {
    name: "Dr. James Okafor",
    role: "AP Biology Teacher",
    quote: "I use ScrubIn as a capstone project for my anatomy unit. Students are more engaged than I've ever seen. The 'What Went Wrong' system is pedagogically brilliant.",
    badge: "🏫 Educator",
  },
  {
    name: "Priya Nair",
    role: "MS-2, Johns Hopkins",
    quote: "As a medical student, I was skeptical. But the decision trees are genuinely realistic. The Attending's Notes after each case feel like real feedback from a senior surgeon.",
    badge: "🩺 Medical Student",
  },
];

// Animated counter hook
function useCounter(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ value, label, suffix, index }: { value: number; label: string; suffix: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(value, 2000, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <div
        className="text-4xl md:text-5xl font-bold text-baby-blue mb-1"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {value === 0 ? "0" : count.toLocaleString()}{suffix}
      </div>
      <div className="label-mono">{label}</div>
    </motion.div>
  );
}

// ECG SVG Animation
function EcgLine({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-full h-8 ${className}`}
      viewBox="0 0 800 32"
      preserveAspectRatio="none"
    >
      <path
        d="M0,16 L150,16 L160,16 L165,4 L170,28 L175,4 L180,16 L195,16 L205,10 L210,22 L215,16 L350,16 L360,16 L365,4 L370,28 L375,4 L380,16 L395,16 L405,10 L410,22 L415,16 L550,16 L560,16 L565,4 L570,28 L575,4 L580,16 L595,16 L605,10 L610,22 L615,16 L800,16"
        fill="none"
        stroke="#7EC8E3"
        strokeWidth="1.5"
        opacity="0.5"
        strokeDasharray="1200"
        style={{ animation: "ecg-scroll 4s linear infinite" }}
      />
    </svg>
  );
}

export default function Home() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true });

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663492570043/KFxREKjUwBni37ALGkPJdZ/scrubin-hero-bg-PZxPz49NEX2NFmuZiGXe4K.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for light mode readability */}
        <div className="absolute inset-0 bg-background/70 dark:bg-background/50" />

        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(126,200,227,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(126,200,227,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-transparent to-background/60 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="label-mono">Surgery Simulator for Students</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="label-mono text-muted-foreground">v1.0 — Beta</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight text-foreground mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Your First Surgery
            <br />
            <span className="text-baby-blue">Starts Here.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-mono-data"
          >
            Step into the OR. Make real decisions. See real consequences.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <Link href="/procedures">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl baby-blue-glow-strong text-base"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Enter the OR
              </Button>
            </Link>
            <Link href="/procedures">
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:border-primary/50 hover:bg-primary/5 font-semibold px-8 py-3 rounded-xl text-base"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Play className="w-4 h-4 mr-2" />
                View Procedures
              </Button>
            </Link>
          </motion.div>

          {/* Stat bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={heroLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="font-mono-data text-xs text-muted-foreground tracking-widest uppercase"
          >
            14,000+ students trained · 7 procedures · 0 real patients harmed
          </motion.div>
        </div>

        {/* ECG flatline at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <EcgLine />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-background relative" ref={featuresRef}>
        <div className="section-divider mb-16" />
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="label-mono block mb-3">How It Works</span>
            <h2
              className="text-3xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Three Steps to the OR
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            {[
              {
                num: "01",
                title: "Choose Your Procedure",
                desc: "Browse 7 real surgical cases from appendectomy to craniotomy. Each one is a different challenge.",
                icon: <Scissors className="w-5 h-5" />,
              },
              {
                num: "02",
                title: "Make Every Decision",
                desc: "From diagnosis to closing, every step is yours. No shortcuts. No hand-holding. Real consequences.",
                icon: <Brain className="w-5 h-5" />,
              },
              {
                num: "03",
                title: "Learn From Everything",
                desc: "Right or wrong, you'll know exactly why. Animated consequences, medical explanations, attending feedback.",
                icon: <BookOpen className="w-5 h-5" />,
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative glass-card-light rounded-2xl p-8 hover:baby-blue-glow transition-all duration-300 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span
                    className="text-5xl font-bold text-primary/20 leading-none"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/25 transition-colors mt-1">
                    {step.icon}
                  </div>
                </div>
                <h3
                  className="text-xl font-semibold text-foreground mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMULATION PREVIEW ── */}
      <section className="py-20 bg-muted/30 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="label-mono block mb-4">Live Simulation</span>
              <h2
                className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                The OR Is
                <br />
                <span className="text-baby-blue">Waiting for You</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Every surgery is broken into 6 phases. Real-time vitals respond to your decisions.
                Make a mistake? The simulation shows you exactly what went wrong — with animated
                consequences and medical explanations from real references.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <Heart className="w-4 h-4" />, label: "Live Vitals Monitor" },
                  { icon: <Zap className="w-4 h-4" />, label: "Real-Time Consequences" },
                  { icon: <Shield className="w-4 h-4" />, label: "6 Surgery Phases" },
                  { icon: <Award className="w-4 h-4" />, label: "Attending's Feedback" },
                ].map((feat) => (
                  <div key={feat.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="text-primary">{feat.icon}</div>
                    <span>{feat.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/procedures">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Try Appendectomy Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden baby-blue-glow-strong border border-primary/20">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663492570043/KFxREKjUwBni37ALGkPJdZ/scrubin-simulation-preview-5KrDvpFwXfdrcajFMuzucV.webp"
                  alt="ScrubIn Simulation Interface"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating vitals badge */}
              <div className="absolute -bottom-4 -left-4 glass-card rounded-xl px-4 py-3 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="font-mono-data text-xs text-muted-foreground">PATIENT STABLE</div>
                    <div className="font-mono-data text-sm font-semibold text-foreground">HR 88 · SpO₂ 98%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCEDURES PREVIEW ── */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="label-mono block mb-3">Procedure Library</span>
              <h2
                className="text-3xl md:text-5xl font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                The OR Is Ready
              </h2>
            </div>
            <Link href="/procedures">
              <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium hidden md:flex">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROCEDURES.map((proc, i) => (
              <motion.div
                key={proc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass-card-light rounded-2xl p-6 border border-border hover:border-primary/40 hover:baby-blue-glow transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-3xl ${proc.bg} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    {proc.icon}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${proc.bg} ${proc.color} font-mono-data`}>
                    {proc.difficulty}
                  </span>
                </div>
                <h3
                  className="text-lg font-bold text-foreground mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {proc.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 font-mono-data uppercase tracking-wider">{proc.tag}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono-data">
                  <span>⏱ {proc.time}</span>
                  <span>🔀 {proc.decisions} decisions</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Link href="/procedures">
                    <span className="text-xs font-semibold text-primary group-hover:text-primary/80 flex items-center gap-1">
                      Enter OR <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section className="py-20 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(126,200,227,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(126,200,227,0.8) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} {...stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="label-mono block mb-3">Who It's For</span>
            <h2
              className="text-3xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Built for Future Doctors
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="glass-card-light rounded-2xl p-7 border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {t.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-5 pt-4 border-t border-border/50">
                  <span className="label-mono text-muted-foreground">{t.badge}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(126,200,227,0.08) 0%, rgba(91,168,201,0.05) 100%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="label-mono block mb-4">Ready?</span>
          <h2
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            The Patient Is
            <br />
            <span className="text-baby-blue">On the Table.</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            No experience required. No real risk. Just real learning.
          </p>
          <Link href="/procedures">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-4 rounded-xl baby-blue-glow-strong text-lg"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Activity className="w-5 h-5 mr-2" />
              Start Your First Surgery
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-background/80">
        <EcgLine className="opacity-30" />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Scrub<span className="text-baby-blue">In</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/procedures"><span className="hover:text-foreground transition-colors">Procedures</span></Link>
              <Link href="/learn"><span className="hover:text-foreground transition-colors">Learn Hub</span></Link>
              <Link href="/leaderboard"><span className="hover:text-foreground transition-colors">Leaderboard</span></Link>
              <Link href="/profile"><span className="hover:text-foreground transition-colors">Profile</span></Link>
            </div>
            <div className="font-mono-data text-xs text-muted-foreground">
              © 2026 ScrubIn · For educational use only
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
