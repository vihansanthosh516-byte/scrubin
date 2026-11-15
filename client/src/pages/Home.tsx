/**
 * ScrubIn Home. The page beats at 78 bpm: a 3D sculpture of a patient's three vital rings carries the
 * first screen and the camera moves in as you scroll. Then the student's own record as rings, the
 * beginner cases, how a case works drawn along an ECG trace, and the way in. No invented stats.
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Activity, ArrowRight, BookOpen, Play, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api";
import { getLeaderboard, getUserSessions, type PersistedSession } from "@/lib/leaderboard";
import { ENGINE_SCENARIO } from "@/engine/scenarios";
import { CtaLink, Pill } from "@/components/scrubin";
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

const VitalRings3D = lazy(() => import("@/components/home/VitalRings3D"));

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

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
  const [gl, setGl] = useState(false);
  useEffect(() => setGl(webglOk()), []);

  const trace = useRef<HTMLElement>(null);
  const { scrollYProgress: traceProgress } = useScroll({ target: trace, offset: ["start 75%", "end 60%"] });


  return (
    <div className="bg-background text-foreground">
      {/* First screen: the patient's vitals as a sculpture, the headline and the way in */}
      <section ref={hero} className="relative isolate min-h-[100svh] overflow-clip">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_68%_45%,var(--glow),transparent_70%)]" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 opacity-60 lg:left-[42%] lg:opacity-100" aria-hidden="true">
          {gl ? (
            <Suspense fallback={null}>
              <VitalRings3D progress={reduce ? undefined : scrollYProgress} still={reduce} />
            </Suspense>
          ) : (
            <div className="flex h-full items-center justify-center opacity-80">
              <div className="relative h-[60vmin] w-[60vmin]">
                {VITALS.map((v, i) => (
                  <VitalRing key={v.key} fraction={v.fraction} tone={v.tone} size={100 - i * 24} stroke={2.2} className="absolute inset-0 m-auto" style={{ width: `${100 - i * 24}%`, height: `${100 - i * 24}%` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <motion.div style={reduce ? undefined : { y: copyY, opacity: copyFade }} className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 lg:justify-center lg:pb-0">
          <div className="max-w-xl">
            <h1 className="text-[clamp(3rem,7vw,5.75rem)] leading-[0.98]">
              {isNew ? "Hold a life steady." : `${greeting()}, ${firstName}.`}
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              {isNew
                ? "Operate on fictional patients in real time, then see every call you made."
                : lastCase
                  ? `Last case: ${lastCase.procedure_name}, ${lastCase.score}%. Pick it up or try another.`
                  : "Pick a procedure, read the briefing, and scrub in."}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {lastCase ? (
                <CtaLink href={`/simulation?proc=${lastCase.procedure_id}`} size="lg">
                  <RotateCcw className="h-5 w-5" aria-hidden="true" /> Practise {lastCase.procedure_name} again
                </CtaLink>
              ) : (
                <CtaLink href="/simulation?proc=appendectomy" size="lg">
                  <Activity className="h-5 w-5" aria-hidden="true" /> Start with an appendectomy
                </CtaLink>
              )}
              <CtaLink href="/procedures" size="lg" variant="outline">
                <Play className="h-5 w-5" aria-hidden="true" /> Browse all procedures
              </CtaLink>
            </div>
            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6">
              {VITALS.map((v) => (
                <div key={v.key}>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: `var(--vital-${v.tone})` }} aria-hidden="true" />
                    {v.label}
                  </dt>
                  <dd className="mt-1 font-display text-3xl">
                    {v.value}
                    <span className="ml-1 text-sm text-muted-foreground">{v.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">A sample patient at the start of an appendectomy.</p>
          </div>
        </motion.div>
      </section>

      {/* The student's own record, as rings that fill on arrival */}
      <section aria-labelledby="stats-heading" className="mx-auto max-w-6xl px-4 py-24 md:py-32">
        <h2 id="stats-heading" className="max-w-xl text-4xl sm:text-5xl">Your record</h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <RecordRing fraction={tier ? xp / tier.at : 1} tone="spo2" figure={xp.toLocaleString()} unit="XP" caption={tier ? `${(tier.at - xp).toLocaleString()} XP until ${tier.name} cases open` : "Every procedure is open"} />
          <RecordRing fraction={Math.min(1, (mine?.cases ?? 0) / Math.max(1, total))} tone="hr" figure={String(mine?.cases ?? 0)} unit="cases" caption={`Completed, out of ${total} procedures in the library`} />
          <RecordRing fraction={mine?.rank ? 1 - Math.min(1, (mine.rank - 1) / 10) : 0} tone="bp" figure={mine?.rank ? `#${mine.rank}` : "None"} unit="" caption={mine?.rank ? "Your place on the all-time leaderboard" : "Finish a case to join the leaderboard"} />
        </div>
      </section>

      {/* Beginner cases, a row you swipe through */}
      <section aria-labelledby="starter-heading" className="pb-24 md:pb-32">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4">
          <div className="max-w-xl">
            <h2 id="starter-heading" className="text-4xl sm:text-5xl">Beginner cases</h2>
            <p className="mt-3 text-muted-foreground">Open to everyone. Start with any of these four.</p>
          </div>
          <CtaLink href="/learn" variant="outline">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Read the briefings
          </CtaLink>
        </div>
        <ul className="mx-auto mt-10 grid max-w-6xl snap-x snap-mandatory auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none]">
          {STARTER_CASES.map((c, i) => (
            <motion.li
              key={c.id}
              className="snap-start"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: "spring", bounce: 0, duration: 0.7, delay: i * 0.08 }}
            >
              <Link
                href={`/simulation?proc=${c.id}`}
                className="group relative flex h-80 flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-border bg-card p-6 transition-[transform,border-color] duration-500 ease-[var(--ease-fluid)] hover:border-surface-hover-border motion-safe:hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{c.tag}</span>
                  {ENGINE_SCENARIO[c.id] && <Pill tone="terracotta">Real-time OR</Pill>}
                </div>
                <div>
                  <h3 className="font-display text-3xl font-light leading-tight">{c.name}</h3>
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {c.time}, {c.decisions} decisions
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 ease-[var(--ease-fluid)] motion-safe:group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* How a case works, drawn along an ECG trace as you scroll */}
      <section ref={trace} aria-labelledby="how-heading" className="relative mx-auto max-w-6xl px-4 pb-24 md:pb-32">
        <h2 id="how-heading" className="max-w-xl text-4xl sm:text-5xl">How a case works</h2>
        <svg viewBox="0 0 1200 120" className="mt-12 h-24 w-full" fill="none" aria-hidden="true" preserveAspectRatio="none">
          <path d={ECG_PATH} stroke="var(--border)" strokeWidth="2" />
          <motion.path d={ECG_PATH} stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength: reduce ? 1 : traceProgress }} />
        </svg>
        <ol className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="text-sm text-muted-foreground">Step {i + 1}</span>
              <h3 className="mt-2 font-display text-3xl font-light">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* The way in */}
      <section className="mx-auto max-w-6xl px-4 pb-28">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-card px-8 py-16 md:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_85%_50%,var(--glow),transparent_70%)]" aria-hidden="true" />
          <div className="relative flex flex-wrap items-end justify-between gap-8">
            <h2 className="max-w-lg text-4xl sm:text-5xl">The patient is on the table.</h2>
            <CtaLink href="/simulation?proc=appendectomy" size="lg">
              <Activity className="h-5 w-5" aria-hidden="true" /> Scrub in
            </CtaLink>
          </div>
        </div>
      </section>
    </div>
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
    <div className="flex items-center gap-6 rounded-[var(--radius-card)] border border-border bg-card p-6">
      <div className="relative h-28 w-28 shrink-0">
        <VitalRing fraction={fraction} tone={tone} animate className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl leading-none">{figure}</span>
          {unit && <span className="mt-1 text-xs text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{caption}</p>
    </div>
  );
}
