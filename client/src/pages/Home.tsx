/**
 * ScrubIn Home. The page beats at 78 bpm: a 3D sculpture of a patient's three vital rings carries the
 * first screen and the camera moves in as you scroll. Then the student's own record as rings, the
 * beginner cases, how a case works drawn along an ECG trace, and the way in. No invented stats.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Activity, ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api";
import { getLeaderboard, getUserSessions, type PersistedSession } from "@/lib/leaderboard";
import { ENGINE_SCENARIO } from "@/engine/scenarios";
import { CtaLink } from "@/components/scrubin";
import { VitalRing } from "@/components/home/VitalRing";
import { VITALS } from "@/components/home/vitals";
import bundledCatalog from "@/data/procedureCatalog.json";

// The four Beginner cases (unlocked below 500 XP). Ids match the registry; times and decision
// counts are the engine's own estimates.
const STARTER_CASES = [
  { id: "appendectomy", name: "Appendectomy", tag: "General Surgery", time: "34 min", decisions: 34 },
  { id: "inguinal-hernia", name: "Inguinal Hernia Repair", tag: "General Surgery", time: "32 min", decisions: 32 },
  { id: "thyroidectomy", name: "Thyroidectomy", tag: "ENT", time: "32 min", decisions: 32 },
  { id: "carpal-tunnel-release", name: "Carpal Tunnel Release", tag: "Orthopedic", time: "30 min", decisions: 30 },
];

const STEPS = [
  { title: "Read the briefing", body: "Meet the patient, the indication and the key risks before you scrub in." },
  { title: "Operate in real time", body: "Give orders by voice or keyboard. Vitals, bleeding and the team respond as you go." },
  { title: "Debrief and replay", body: "See what went well, what you missed, and replay any moment of the case." },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const { user } = useAuth();
  const [procedureCount, setProcedureCount] = useState<number | null>(null);
  const [mine, setMine] = useState<{ xp: number; cases: number; rank: number | null } | null>(null);
  const [lastCase, setLastCase] = useState<PersistedSession | null>(null);

  // Live size of the procedure library.
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/procedures/search`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const list = Array.isArray(data) ? data : data.procedures || data.scenarios || [];
        if (!cancelled && list.length) setProcedureCount(list.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // The student's own XP, case count, rank and most recent case.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getLeaderboard().then(({ entries }) => {
      if (cancelled) return;
      const i = entries.findIndex((e) => e.user_id === user.id);
      setMine({ xp: i >= 0 ? entries[i].total_xp : 0, cases: i >= 0 ? entries[i].procedures_completed : 0, rank: i >= 0 ? i + 1 : null });
    });
    getUserSessions(user.id).then((s) => !cancelled && setLastCase(s[0] ?? null));
    return () => {
      cancelled = true;
    };
  }, [user]);

  const firstName = user?.name?.split(" ")[0] || user?.login || "Doctor";
  const isNew = mine !== null && mine.cases === 0;

  const total = procedureCount ?? (bundledCatalog as any).procedures.length;
  const xp = mine?.xp ?? 0;
  const tier = xp < 500 ? { at: 500, name: "Intermediate" } : xp < 2000 ? { at: 2000, name: "Advanced" } : null;

  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const copyFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const reduce = useReducedMotion() ?? false;
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const [hovered, setHovered] = useState(0);

  const trace = useRef<HTMLElement>(null);
  const { scrollYProgress: traceProgress } = useScroll({ target: trace, offset: ["start 75%", "end 60%"] });
  const teamScale = useTransform(traceProgress, [0, 1], [1.15, 1]);


  return (
    <div className="bg-background text-foreground">
      {/* First screen: the operating room itself, full bleed, with the headline set over it */}
      <section ref={hero} className="relative isolate flex min-h-[100svh] items-end overflow-clip bg-black text-white">
        <motion.div style={reduce ? undefined : { scale: heroScale }} className="absolute inset-0 -z-10">
          <video className="h-full w-full object-cover" src="/media/hero.mp4" poster="/media/or-01.webp" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.85),rgb(0_0_0/0.15)_55%,rgb(0_0_0/0.45))]" aria-hidden="true" />
        <motion.div style={reduce ? undefined : { y: copyY, opacity: copyFade }} className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 md:pb-24">
          <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-5 text-sm tracking-wide text-white/70">
            Surgical simulation, in real time
          </motion.p>
          <h1 className="max-w-4xl text-[clamp(3.25rem,9vw,8rem)] font-light leading-[0.94] tracking-tight">
            {(isNew ? "Hold a life steady." : `${greeting()}, ${firstName}.`).split(" ").map((w, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-hidden align-top">
                <motion.span className="inline-block" initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ type: "spring", bounce: 0, duration: 1.1, delay: 0.15 + i * 0.09 }}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            {lastCase ? (
              <CtaLink href={`/simulation?proc=${lastCase.procedure_id}`} size="lg">
                <RotateCcw className="h-5 w-5" aria-hidden="true" /> Practise {lastCase.procedure_name} again
              </CtaLink>
            ) : (
              <CtaLink href="/simulation?proc=appendectomy" size="lg">
                <Activity className="h-5 w-5" aria-hidden="true" /> Start with an appendectomy
              </CtaLink>
            )}
            <Link href="/procedures" className="group inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white">
              Browse all procedures <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-fluid)] group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
          <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-4 text-white">
            {VITALS.map((v) => (
              <div key={v.key}>
                <dt className="flex items-center gap-2 text-xs text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--vital-${v.tone})` }} aria-hidden="true" />
                  {v.label}
                </dt>
                <dd className="mt-1 text-3xl font-light">
                  {v.value}
                  <span className="ml-1 text-sm text-white/60">{v.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </section>

      {/* A statement over the instruments, scrolling against its photograph */}
      <Band src="/media/or-04.webp" height="h-[70svh]" reduce={reduce}>
        <p className="mx-auto max-w-4xl px-4 text-center text-[clamp(1.75rem,4.2vw,3.5rem)] font-light leading-[1.15] tracking-tight text-white">
          {isNew ? "Fictional patients. Real consequences for every call you make." : lastCase ? `Last case: ${lastCase.procedure_name}, ${lastCase.score}%.` : "Pick a procedure, read the briefing, and scrub in."}
        </p>
      </Band>

      {/* The student's own record, as rings that fill on arrival */}
      <section aria-labelledby="stats-heading" className="mx-auto max-w-6xl px-4 py-28 md:py-40">
        <h2 id="stats-heading" className="max-w-xl text-4xl font-light sm:text-6xl">Your record</h2>
        <div className="mt-14 grid grid-cols-1 gap-14 sm:grid-cols-3 sm:gap-8">
          <RecordRing fraction={tier ? xp / tier.at : 1} tone="spo2" figure={xp.toLocaleString()} unit="XP" caption={tier ? `${(tier.at - xp).toLocaleString()} XP until ${tier.name} cases open` : "Every procedure is open"} />
          <RecordRing fraction={Math.min(1, (mine?.cases ?? 0) / Math.max(1, total))} tone="hr" figure={String(mine?.cases ?? 0)} unit="cases" caption={`Completed, out of ${total} procedures in the library`} />
          <RecordRing fraction={mine?.rank ? 1 - Math.min(1, (mine.rank - 1) / 10) : 0} tone="bp" figure={mine?.rank ? `#${mine.rank}` : "None"} unit="" caption={mine?.rank ? "Your place on the all-time leaderboard" : "Finish a case to join the leaderboard"} />
        </div>
      </section>

      {/* Beginner cases: each name is a link, and the photograph behind it changes as you move */}
      <section aria-labelledby="starter-heading" className="relative isolate overflow-clip bg-black text-white">
        {CASE_PHOTOS.map((src, i) => (
          <img key={src} src={src} alt="" aria-hidden="true" loading="lazy" className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-700 ease-[var(--ease-fluid)] ${hovered === i ? "opacity-60" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 py-28 md:py-40">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="starter-heading" className="text-4xl font-light sm:text-6xl">Start with one of these</h2>
            <Link href="/learn" className="group inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Read the briefings first
            </Link>
          </div>
          <ul className="mt-14 space-y-2">
            {STARTER_CASES.map((c, i) => (
              <motion.li
                key={c.id}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: "spring", bounce: 0, duration: 0.9, delay: i * 0.07 }}
              >
                <Link href={`/simulation?proc=${c.id}`} onMouseEnter={() => setHovered(i)} onFocus={() => setHovered(i)} className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 py-3">
                  <span className="text-[clamp(2.25rem,6vw,5.5rem)] font-light leading-none tracking-tight text-white/45 transition-[color,transform] duration-500 ease-[var(--ease-fluid)] group-hover:text-white motion-safe:group-hover:translate-x-3">
                    {c.name}
                  </span>
                  <span className="flex items-center gap-3 text-sm text-white/65">
                    {c.tag}, {c.time}
                    {ENGINE_SCENARIO[c.id] && <span className="text-[var(--ill-22d3ee)]">real-time OR</span>}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-fluid)] group-hover:opacity-100 motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* How a case works: a full-width team photograph, steps on a trace beneath it */}
      <section ref={trace} aria-labelledby="how-heading" className="relative mx-auto max-w-6xl px-4 py-28 md:py-40">
        <h2 id="how-heading" className="max-w-xl text-4xl font-light sm:text-6xl">How a case works</h2>
        <div className="relative mt-14 overflow-hidden rounded-3xl">
          <motion.img src="/media/or-06.webp" alt="A surgical team operating under theatre lights" loading="lazy" style={reduce ? undefined : { scale: teamScale }} className="aspect-[21/9] w-full object-cover" />
        </div>
        <svg viewBox="0 0 1200 120" className="mt-12 h-24 w-full" fill="none" aria-hidden="true" preserveAspectRatio="none">
          <path d={ECG_PATH} stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
          <motion.path d={ECG_PATH} stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength: reduce ? 1 : traceProgress }} />
        </svg>
        <ol className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="text-sm text-muted-foreground">Step {i + 1}</span>
              <h3 className="mt-2 text-3xl font-light">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* The way in: the line and the action over the sterile field */}
      <Band src="/media/or-07.webp" height="min-h-[80svh]" reduce={reduce}>
        <div className="mx-auto max-w-4xl px-4 py-24 text-center text-white">
          <h2 className="text-[clamp(2.75rem,7vw,6rem)] font-light leading-[0.98] tracking-tight">The patient is on the table.</h2>
          <div className="mt-10 flex justify-center">
            <CtaLink href="/simulation?proc=appendectomy" size="lg">
              <Activity className="h-5 w-5" aria-hidden="true" /> Scrub in
            </CtaLink>
          </div>
        </div>
      </Band>
    </div>
  );
}

const CASE_PHOTOS = ["/media/or-02.webp", "/media/or-04.webp", "/media/or-05.webp", "/media/or-08.webp"];

/** A full-width photograph that drifts against the scroll, with centred content over a dark scrim. */
function Band({ src, height, reduce, children }: { src: string; height: string; reduce: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <section ref={ref} className={`relative isolate flex ${height} items-center justify-center overflow-clip bg-black`}>
      <motion.img src={src} alt="" aria-hidden="true" loading="lazy" style={reduce ? undefined : { y }} className="absolute inset-x-0 -top-[15%] -z-10 h-[130%] w-full object-cover opacity-70" />
      <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden="true" />
      {children}
    </section>
  );
}

// One beat-shaped trace across the three steps: flat, P, QRS, T, repeated.
const ECG_PATH = (() => {
  let d = "M0 70";
  for (let x = 0; x < 1200; x += 400) {
    d += ` L${x + 120} 70 L${x + 140} 62 L${x + 160} 70 L${x + 185} 70 L${x + 195} 84 L${x + 210} 12 L${x + 225} 100 L${x + 240} 70 L${x + 280} 70 L${x + 310} 54 L${x + 340} 70 L${x + 400} 70`;
  }
  return d;
})();

function RecordRing({ fraction, tone, figure, unit, caption }: { fraction: number; tone: "hr" | "spo2" | "bp"; figure: string; unit: string; caption: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="relative aspect-square w-44 md:w-52">
        <VitalRing fraction={fraction} tone={tone} stroke={4} animate className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-5xl font-light leading-none">{figure}</span>
          {unit && <span className="mt-2 text-sm text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <p className="mt-6 max-w-[16rem] leading-relaxed text-muted-foreground">{caption}</p>
    </div>
  );
}
