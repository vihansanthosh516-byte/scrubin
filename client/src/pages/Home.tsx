/**
 * ScrubIn Home Page — Anthropic Editorial
 * Warm cream, serif hero, sharp bordered cards, staggered scroll reveals.
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";
import { Activity, Heart, Target, Users, Scissors, BookOpen, ArrowRight, Play, Zap, Award, Trophy } from "lucide-react";

const EASE = [0.25, 1, 0.5, 1] as const;

function StatNumber({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div ref={ref} className="flex items-baseline">
      <span className="font-mono-data text-3xl md:text-4xl font-semibold tracking-tight text-[#191919] dark:text-[#EDEAE4]" style={{ fontVariantNumeric: "tabular-nums" }}>
        {display.toLocaleString()}
      </span>
      {suffix && <span className="ml-1 text-xl font-bold text-[#CC553D]">{suffix}</span>}
    </div>
  );
}

function StatItem({ value, label, suffix = "", icon: Icon, delay = 0 }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="group"
    >
      <div className="stats-card flex h-full flex-col justify-between gap-6 p-6 md:p-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#E2DDD1] bg-[#FBF9F5] dark:border-[#3A342C] dark:bg-[#26211B]">
          <Icon className="h-4 w-4 text-[#CC553D]" />
        </div>
        <div>
          <StatNumber value={value} suffix={suffix} />
          <div className="mt-2 text-xs uppercase tracking-[0.14em] text-[#8C827A]">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description, index }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: EASE }}
      className="group"
    >
      <div className="glass-card flex h-full flex-col items-center gap-5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-[#E2DDD1] bg-[#FBF9F5] transition-colors group-hover:border-[#CC553D]/40 dark:border-[#3A342C] dark:bg-[#26211B]">
          <Icon className="h-6 w-6 text-[#CC553D]" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-[#191919] dark:text-[#EDEAE4]">{title}</h3>
        <p className="text-sm leading-relaxed text-[#666059] dark:text-[#A89F95]">{description}</p>
      </div>
    </motion.div>
  );
}

function ProcedurePreview({ id, name, tag, difficulty, color, time, decisions, index }: any) {
  return (
    <Link href={`/simulation?proc=${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
        className="group cursor-pointer"
      >
        <div className="procedure-card flex h-full flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${color}`}>{difficulty}</span>
            <span className="font-mono-data text-[10px] uppercase tracking-widest text-[#8C827A] dark:text-[#A89F95]">{tag}</span>
          </div>
          <h4 className="text-lg font-bold tracking-tight text-[#191919] transition-colors group-hover:text-[#CC553D] dark:text-[#EDEAE4]">{name}</h4>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#E2DDD1] pt-4 font-mono-data text-[10px] uppercase tracking-widest text-[#8C827A] dark:border-[#3A342C] dark:text-[#A89F95]">
            <span>{time} · {decisions} decisions</span>
            <span className="flex items-center gap-1.5 text-[#CC553D] dark:text-[#D95338]">
              Start Training
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

const SECTION_REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: EASE },
} as const;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [procedureCount, setProcedureCount] = useState(7);
  useEffect(() => { setMounted(true); }, []);
  // Keep the hero stat in sync with the live procedure registry (fallback to 7).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/procedures/search`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.procedures || data.scenarios || []);
        if (!cancelled && list.length > 0) setProcedureCount(list.length);
      } catch {
        /* keep fallback */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // The 4 procedures unlocked below 500 XP — ids must match the core registry
  // so each card boots its own simulation (appendectomy/inguinal-hernia/thyroidectomy/carpal-tunnel-release).
  // Decision counts mirror the engine's real totalTicks (each tick = one decision
  // step); times are the engine's estimated durations, not a generic 6.
  const procedures = [
    { id: "appendectomy", name: "Appendectomy", tag: "General Surgery", difficulty: "Beginner", color: "pill-sage", time: "34 min", decisions: 34 },
    { id: "inguinal-hernia", name: "Inguinal Hernia Repair", tag: "General Surgery", difficulty: "Beginner", color: "pill-sage", time: "32 min", decisions: 32 },
    { id: "thyroidectomy", name: "Thyroidectomy", tag: "ENT", difficulty: "Beginner", color: "pill-sage", time: "32 min", decisions: 32 },
    { id: "carpal-tunnel-release", name: "Carpal Tunnel Release", tag: "Orthopedic", difficulty: "Beginner", color: "pill-sage", time: "30 min", decisions: 30 },
  ];
  const features = [
    { icon: Scissors, title: "Choose Your Procedure", description: "Browse real surgical cases from appendectomy to craniotomy." },
    { icon: Target, title: "Make Every Decision", description: "From diagnosis to closing, every step is yours." },
    { icon: BookOpen, title: "Learn From Everything", description: "Right or wrong, you'll know exactly why." },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#191919] dark:bg-[#161310] dark:text-[#EDEAE4]">
      {/* ── Hero ── */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-clip border-b border-[#E2DDD1] px-4 dark:border-[#3A342C]">
        {/* Subtle warm editorial texture — no neon */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(#8C827A 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-8 flex items-center justify-center gap-2.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#CC553D] dark:bg-[#D95338]" />
            <span className="font-mono-data text-xs uppercase tracking-[0.16em] text-[#8C827A] dark:text-[#C2BBB0]">The Future of Surgical Education</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="font-display text-6xl leading-[0.95] tracking-tight text-[#191919] sm:text-7xl md:text-8xl dark:text-[#EDEAE4]"
          >
            ScrubIn
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            className="mx-auto mt-6 max-w-xl text-xl text-[#666059] dark:text-[#A89F95]"
          >
            Your first surgery starts here. Step into the OR, make real decisions, and see real consequences — with zero real risk.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/simulation">
              <motion.span whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Button size="lg" className="rounded-sm bg-[#CC553D] px-10 py-3.5 text-base font-semibold text-white hover:bg-[#B94A35]">
                  <Activity className="mr-2 h-5 w-5" /> Enter the OR
                </Button>
              </motion.span>
            </Link>
            <Link href="/procedures">
              <motion.span whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Button size="lg" variant="outline" className="rounded-sm border-[#E2DDD1] bg-white px-10 py-3.5 text-base font-semibold text-[#191919] hover:border-[#CC553D]/40 hover:bg-[#FBF9F5] dark:border-[#3A342C] dark:bg-[#1E1A16] dark:text-[#EDEAE4]">
                  <Play className="mr-2 h-5 w-5" /> View Procedures
                </Button>
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-[#E2DDD1] bg-[#F4F0E8]/50 dark:border-[#3A342C] dark:bg-[#1E1A16]/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <motion.p {...SECTION_REVEAL} className="mb-10 text-center font-mono-data text-xs uppercase tracking-[0.16em] text-[#8C827A]">
            Trusted by medical students worldwide
          </motion.p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            <StatItem value={procedureCount} label="Procedures" icon={Activity} delay={0} />
            <StatItem value={200} label="Decision Points" suffix="+" icon={Target} delay={0.08} />
            <StatItem value={14000} label="Students Trained" suffix="+" icon={Users} delay={0.16} />
            <StatItem value={0} label="Patients Harmed" icon={Heart} delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-b border-[#E2DDD1] dark:border-[#3A342C]">
        <div className="mx-auto max-w-6xl px-4 py-24 md:py-32">
          <motion.div {...SECTION_REVEAL} className="mb-16 text-center">
            <span className="section-tag mb-4 block">How it works</span>
            <h2 className="font-display text-5xl tracking-tight sm:text-6xl dark:text-[#EDEAE4]">
              Three steps to the <span className="text-[#CC553D] dark:text-[#D95338]">OR</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((f, i) => <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Procedures preview ── */}
      <section className="border-b border-[#E2DDD1] bg-white/40 dark:border-[#3A342C] dark:bg-[#1E1A16]/30">
        <div className="mx-auto max-w-6xl px-4 py-24 md:py-32">
          <motion.div {...SECTION_REVEAL} className="mb-16 text-center">
            <span className="section-tag mb-4 block">Available now</span>
            <h2 className="font-display text-5xl tracking-tight sm:text-6xl dark:text-[#EDEAE4]">
              Start your <span className="text-[#CC553D] dark:text-[#D95338]">training</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666059] dark:text-[#A89F95]">Choose from our growing library of surgical simulations</p>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {procedures.map((proc, i) => <ProcedurePreview key={proc.name} {...proc} index={i} />)}
          </div>
          <motion.div {...SECTION_REVEAL} className="mt-14 text-center">
            <Link href="/procedures">
              <motion.span whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Button variant="outline" className="rounded-sm border-[#E2DDD1] bg-white px-8 py-3 font-semibold text-[#191919] hover:border-[#CC553D]/40 dark:border-[#3A342C] dark:bg-[#1E1A16] dark:text-[#EDEAE4]">
                  View All Procedures <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Value props ── */}
      <section className="border-b border-[#E2DDD1] dark:border-[#3A342C]">
        <div className="mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="grid grid-cols-1 gap-16 text-center md:grid-cols-3">
            <motion.div {...SECTION_REVEAL}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-sm border border-[#E2DDD1] bg-white dark:bg-[#1E1A16]">
                <Zap className="h-7 w-7 text-[#CC553D]" />
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight">Real-Time Vitals</h3>
              <p className="mx-auto max-w-xs text-sm text-[#666059] dark:text-[#A89F95]">Watch patient vitals respond to your decisions in real time.</p>
            </motion.div>
            <motion.div {...SECTION_REVEAL} transition={{ duration: 0.6, delay: 0.1, ease: EASE }}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-sm border border-[#E2DDD1] bg-white dark:bg-[#1E1A16]">
                <Award className="h-7 w-7 text-[#CC553D]" />
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight">XP & Rankings</h3>
              <p className="mx-auto max-w-xs text-sm text-[#666059] dark:text-[#A89F95]">Earn experience and climb the global leaderboard.</p>
            </motion.div>
            <motion.div {...SECTION_REVEAL} transition={{ duration: 0.6, delay: 0.2, ease: EASE }}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-sm border border-[#E2DDD1] bg-white dark:bg-[#1E1A16]">
                <Trophy className="h-7 w-7 text-[#CC553D]" />
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight">Zero Risk</h3>
              <p className="mx-auto max-w-xs text-sm text-[#666059] dark:text-[#A89F95]">Make mistakes, learn, and try again without any real-world consequences.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-clip">
        <div className="mx-auto max-w-4xl px-4 py-28 text-center md:py-36">
          <motion.div {...SECTION_REVEAL}>
            <span className="section-tag mb-6 block">Ready to begin?</span>
            <h2 className="font-display text-5xl leading-tight tracking-tight sm:text-6xl md:text-7xl dark:text-[#EDEAE4]">
              The patient is on the table
            </h2>
            <p className="mx-auto mt-5 mb-12 max-w-md text-lg text-[#666059] dark:text-[#A89F95]">No experience required. No real risk. Just real learning.</p>
            <Link href="/procedures">
              <motion.span whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Button size="lg" className="rounded-sm bg-[#CC553D] px-12 py-4 text-lg font-semibold text-white hover:bg-[#B94A35]">
                  <Activity className="mr-2 h-5 w-5" /> Start Your First Surgery
                </Button>
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E2DDD1] bg-[#F4F0E8]/60 py-14 dark:bg-[#1E1A16]/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CC553D]" />
            <span className="text-xl font-bold tracking-tight text-[#191919] dark:text-[#EDEAE4]">
              Scrub<span className="text-[#CC553D]">In</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-[#666059] dark:text-[#A89F95]">
            <Link href="/procedures"><span className="transition-colors hover:text-[#CC553D]">Procedures</span></Link>
            <Link href="/learn"><span className="transition-colors hover:text-[#CC553D]">Learn Hub</span></Link>
            <Link href="/my-simulations"><span className="transition-colors hover:text-[#CC553D]">My Simulations</span></Link>
            <Link href="/leaderboard"><span className="transition-colors hover:text-[#CC553D]">Leaderboard</span></Link>
            <Link href="/profile"><span className="transition-colors hover:text-[#CC553D]">Profile</span></Link>
          </div>
          <div className="font-mono-data text-xs text-[#8C827A]">© 2026 ScrubIn · For educational use only</div>
        </div>
      </footer>
    </div>
  );
}
