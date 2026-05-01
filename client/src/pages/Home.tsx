/**
 * ScrubIn Home Page — Redesigned
 * Clean, modern design with smooth animations
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Heart,
  Brain,
  Scissors,
  BookOpen,
  User,
  Trophy,
  ChevronRight,
  Play,
  ArrowRight,
  Zap,
  Target,
  Award,
} from "lucide-react";

// Animated background gradient
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #7EC8E3 0%, transparent 70%)",
          top: "-20%",
          right: "-10%",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #5DCAA5 0%, transparent 70%)",
          bottom: "-10%",
          left: "-5%",
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(126,200,227,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(126,200,227,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// Floating icons
function FloatingIcon({ icon, delay, x, y }: { icon: React.ReactNode; delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute text-primary/20"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
      >
        {icon}
      </motion.div>
    </motion.div>
  );
}

// Stat counter with animation
function StatItem({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="text-5xl md:text-6xl font-bold text-baby-blue mb-2"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {count.toLocaleString()}{suffix}
      </motion.div>
      <div className="text-sm text-muted-foreground font-mono-data uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Feature card
function FeatureCard({ icon, title, description, index }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative"
    >
      <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm
                    hover:border-primary/30 hover:bg-card/80 transition-all duration-500
                    hover:shadow-[0_0_40px_rgba(126,200,227,0.1)]">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20
                      flex items-center justify-center mb-6 text-primary
                      group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
        {/* Content */}
        <h3 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Procedure preview card
function ProcedurePreview({ name, tag, difficulty, color }: {
  name: string;
  tag: string;
  difficulty: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30
               transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
          {difficulty}
        </span>
        <span className="text-xs text-muted-foreground">{tag}</span>
      </div>
      <h4 className="font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
        {name}
      </h4>
    </motion.div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const procedures = [
    { name: "Appendectomy", tag: "Emergency", difficulty: "Beginner", color: "text-emerald-400 bg-emerald-400/10" },
    { name: "Heart Bypass", tag: "Cardiovascular", difficulty: "Advanced", color: "text-red-400 bg-red-400/10" },
    { name: "Craniotomy", tag: "Neurological", difficulty: "Advanced", color: "text-red-400 bg-red-400/10" },
    { name: "Cholecystectomy", tag: "Laparoscopic", difficulty: "Intermediate", color: "text-amber-400 bg-amber-400/10" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AnimatedBackground />

        {/* Floating medical icons - enhanced with interactivity */}
        <motion.div 
          className="absolute z-20 tooltip-base"
          style={{ left: "10%", top: "20%" }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Activity className="w-8 h-8 text-primary/30 hover:text-primary/60 transition-colors cursor-pointer" />
        </motion.div>
        <motion.div 
          className="absolute z-20"
          style={{ left: "85%", top: "25%" }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <Heart className="w-6 h-6 text-primary/30 hover:text-primary/60 transition-colors cursor-pointer" />
        </motion.div>
        <motion.div 
          className="absolute z-20"
          style={{ left: "15%", top: "70%" }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        >
          <Brain className="w-7 h-7 text-primary/30 hover:text-primary/60 transition-colors cursor-pointer" />
        </motion.div>
        <motion.div 
          className="absolute z-20"
          style={{ left: "80%", top: "75%" }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
        >
          <Scissors className="w-6 h-6 text-primary/30 hover:text-primary/60 transition-colors cursor-pointer" />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Enhanced Headline with gradient text */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight
            text-foreground mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="text-gradient bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              ScrubIn
            </span>
            <br />
            <span className="text-foreground">
              Your First Surgery Starts Here.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Put ScrubIn on top of your first surgery.
          </motion.p>

          {/* Enhanced CTAs with glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/procedures">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground
                  font-semibold px-8 py-6 rounded-xl text-lg
                  shadow-[0_0_30px_rgba(126,200,227,0.3)] hover:shadow-[0_0_50px_rgba(126,200,227,0.4)]
                  transition-all duration-300"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  <Activity className="w-5 h-5 mr-2" />
                  Enter the OR
                </Button>
              </motion.div>
            </Link>
            <Link href="/procedures">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:border-primary/50 hover:bg-primary/5
                  font-semibold px-8 py-6 rounded-xl text-lg transition-all duration-300"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  View Procedures
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Enhanced Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2 bg-card/50 backdrop-blur-sm">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(126,200,227,0.8)]"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══ STATS SECTION ═══ */}
      <section className="py-20 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="label-mono text-center mb-12 uppercase tracking-widest"
          >
            Trusted by Medical Students Worldwide
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <StatItem value={7} label="Procedures" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StatItem value={200} label="Decision Points" suffix="+" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StatItem value={14000} label="Students Trained" suffix="+" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StatItem value={0} label="Patients Harmed" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-24 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-mono-data text-primary uppercase tracking-wider mb-4 block">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
              Three Steps to the OR
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Scissors className="w-6 h-6" />}
              title="Choose Your Procedure"
              description="Browse real surgical cases from appendectomy to craniotomy. Each one presents unique challenges."
              index={0}
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Make Every Decision"
              description="From diagnosis to closing, every step is yours. No shortcuts. Real consequences for every choice."
              index={1}
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Learn From Everything"
              description="Right or wrong, you'll know exactly why. Animated consequences and medical explanations."
              index={2}
            />
          </div>
        </div>
      </section>

      {/* ═══ PROCEDURES PREVIEW ═══ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-mono-data text-primary uppercase tracking-wider mb-4 block">
              Available Now
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Start Your Training
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Choose from our growing library of surgical simulations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {procedures.map((proc, i) => (
              <motion.div
                key={proc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProcedurePreview {...proc} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/procedures">
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 hover:border-primary hover:bg-primary/10
                         font-semibold px-8 py-6 rounded-xl transition-all duration-300"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                View All Procedures
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES BANNER ═══ */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                Real-Time Vitals
              </h3>
              <p className="text-muted-foreground text-sm">
                Watch patient vitals respond to your decisions in real-time
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6"
            >
              <Award className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                XP & Rankings
              </h3>
              <p className="text-muted-foreground text-sm">
                Earn experience and climb the global leaderboard
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6"
            >
              <Trophy className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                Zero Risk
              </h3>
              <p className="text-muted-foreground text-sm">
                Make mistakes, learn, and try again without any real-world consequences
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-teal-400/10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto px-4 text-center"
        >
          <span className="text-sm font-mono-data text-primary uppercase tracking-wider mb-6 block">
            Ready to Begin?
          </span>
          <h2
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            The Patient Is
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">
              On the Table.
            </span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            No experience required. No real risk. Just real learning.
          </p>
          <Link href="/procedures">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground
                       font-bold px-12 py-7 rounded-xl text-xl
                       shadow-[0_0_40px_rgba(126,200,227,0.3)]
                       hover:shadow-[0_0_60px_rgba(126,200,227,0.5)]
                       transition-all duration-300"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Activity className="w-6 h-6 mr-3" />
              Start Your First Surgery
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border bg-background/80 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                Scrub<span className="text-baby-blue">In</span>
              </span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/procedures"><span className="hover:text-foreground transition-colors">Procedures</span></Link>
              <Link href="/learn"><span className="hover:text-foreground transition-colors">Learn Hub</span></Link>
              <Link href="/leaderboard"><span className="hover:text-foreground transition-colors">Leaderboard</span></Link>
              <Link href="/profile"><span className="hover:text-foreground transition-colors">Profile</span></Link>
            </div>
            <div className="text-sm text-muted-foreground font-mono-data">
              © 2026 ScrubIn · For educational use only
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
