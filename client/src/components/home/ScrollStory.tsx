// Apple-style scroll story for Home: each chapter pins to the screen while scrolling drives it.
// Every effect has a still fallback for reduced motion.
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Activity, ListChecks, Mic, Stethoscope, Syringe } from "lucide-react";
import { PatientMonitor } from "@/components/or/PatientMonitor";
import type { MonitorReadout } from "@/engine/types";
import { CtaLink } from "@/components/scrubin";
import { CountUp } from "@/components/game";

/** Pinned chapter: `height` of scroll, the child stays in view and gets the 0→1 progress. */
function Pinned({ height = "300vh", children }: { height?: string; children: (p: MotionValue<number>) => React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section ref={ref} style={{ height }} className="relative">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] items-center overflow-hidden">{children(scrollYProgress)}</div>
    </section>
  );
}

/** 1. Hero: a giant headline that shrinks and fades as the page starts to move. */
export function HeroChapter({ greeting, title, lead, actions }: { greeting: React.ReactNode; title: React.ReactNode; lead: React.ReactNode; actions: React.ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.86]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  return (
    <section ref={ref} className="relative flex min-h-[calc(100vh-4rem)] items-center px-4 pt-16">
      <motion.div style={{ scale, opacity, y }} className="mx-auto w-full max-w-6xl">
        {greeting}
        <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.92]">{title}</h1>
        <p className="mt-6 max-w-2xl text-xl text-muted-foreground md:text-2xl">{lead}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">{actions}</div>
      </motion.div>
    </section>
  );
}

// The scripted crisis the monitor plays as you scroll: stable → desaturating → alarm → recovered.
function readoutAt(p: number): { r: MonitorReadout; alarms: string[] } {
  const k = (a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const drop = k(0.3, 0.55);
  const recover = k(0.7, 0.92);
  const spo2 = Math.round(99 - 17 * drop + 16 * recover);
  const hr = Math.round(78 + 34 * drop - 30 * recover);
  const alarms = spo2 < 90 ? ["spo2_low"] : [];
  if (hr > 105) alarms.push("hr_high");
  return {
    alarms,
    r: {
      attached: p < 0.08 ? [] : ["ecg", "spo2", "nibp", "etco2", "temp"],
      hr,
      rhythm: hr > 100 ? "sinus_tach" : "sinus",
      spo2,
      pulse_rate: hr,
      nibp: { sbp: 124 - Math.round(14 * drop), dbp: 78 - Math.round(8 * drop), map: 93 - Math.round(10 * drop) },
      nibp_age_s: 40,
      etco2: 36,
      rr: 14,
      capno_shape: "normal",
      temp: 36.8,
    },
  };
}

const MONITOR_CAPTIONS = [
  { at: 0, title: "The patient is real.", body: "A physiological model runs underneath every case: heart, lungs, blood and drugs." },
  { at: 0.28, title: "Then something goes wrong.", body: "Saturation falls. The heart speeds up. The alarm goes off, and nobody tells you why." },
  { at: 0.55, title: "You make the call.", body: "“Bag-mask ventilate, 100% oxygen.” Say it out loud or type it. The team does what you order." },
  { at: 0.78, title: "And the patient answers.", body: "Saturation climbs back. Every decision, and every one you don't make, changes what happens." },
];

/** 2. The pinned monitor: the real PatientMonitor plays a desaturation and recovery as you scroll. */
export function MonitorChapter() {
  const reduce = useReducedMotion();
  const [p, setP] = useState(reduce ? 0.95 : 0);
  return (
    <Pinned height={reduce ? "auto" : "400vh"}>
      {(progress) => <MonitorScene progress={progress} p={p} setP={setP} reduce={!!reduce} />}
    </Pinned>
  );
}

function MonitorScene({ progress, p, setP, reduce }: { progress: MotionValue<number>; p: number; setP: (n: number) => void; reduce: boolean }) {
  useMotionValueEvent(progress, "change", (v) => !reduce && setP(v));
  const { r, alarms } = readoutAt(p);
  const caption = [...MONITOR_CAPTIONS].reverse().find((c) => p >= c.at) ?? MONITOR_CAPTIONS[0];
  const scale = useTransform(progress, [0, 0.12], [reduce ? 1 : 0.88, 1]);
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 lg:grid-cols-[1fr_1.4fr]">
      <div aria-live="polite">
        <p className="section-tag mb-4">Inside the OR</p>
        <motion.h2 key={caption.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl leading-[1] md:text-6xl">
          {caption.title}
        </motion.h2>
        <motion.p key={caption.body} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-5 text-lg text-muted-foreground">
          {caption.body}
        </motion.p>
        {p >= 0.55 && p < 0.8 && (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-semibold">
            <Mic className="h-4 w-4 text-primary" aria-hidden="true" /> “Bag-mask ventilate, 100% oxygen”
          </motion.p>
        )}
        {/* Scroll position, as a thin track */}
        <div className="mt-8 hidden h-1 w-40 overflow-hidden rounded-full bg-muted md:block" aria-hidden="true">
          <motion.div className="h-full origin-left bg-primary" style={{ scaleX: progress }} />
        </div>
      </div>
      <motion.div style={{ scale }} className="overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
        <PatientMonitor readout={r} alarms={alarms} paused={false} muted />
      </motion.div>
    </div>
  );
}

const ROLES = [
  { icon: Syringe, title: "Anaesthesiologist", body: "Induce, secure the airway and keep the patient stable while the AI surgeon operates." },
  { icon: Stethoscope, title: "Surgeon", body: "Run the operation step by step with an AI anaesthesiologist keeping the patient alive." },
  { icon: ListChecks, title: "Multiple choice", body: "The classic case: one of three moves at each step, with real complications for mistakes." },
];

/** 3. Roles slide sideways as you scroll down. */
export function RolesChapter() {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        <RolesHeading />
        <div className="mt-10 grid gap-5 md:grid-cols-3">{ROLES.map((r) => <RoleCard key={r.title} {...r} />)}</div>
      </section>
    );
  }
  return (
    <Pinned height="250vh">
      {(progress) => <RolesTrack progress={progress} />}
    </Pinned>
  );
}

function RolesTrack({ progress }: { progress: MotionValue<number> }) {
  // The track is as wide as its cards (w-max), so -38% slides the last card in from the right.
  const x = useTransform(progress, [0.05, 0.95], ["0%", "-38%"]);
  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl px-4">
        <RolesHeading />
      </div>
      <motion.div style={{ x }} className="mt-10 flex w-max gap-6 pl-[max(1rem,calc((100vw-72rem)/2+1rem))] pr-[20vw]">
        {ROLES.map((r) => (
          <RoleCard key={r.title} {...r} wide />
        ))}
      </motion.div>
    </div>
  );
}

function RolesHeading() {
  return (
    <>
      <p className="section-tag mb-4">Three ways to scrub in</p>
      <h2 className="font-display text-4xl leading-[1] md:text-6xl">Pick your side of the drape.</h2>
    </>
  );
}

function RoleCard({ icon: Icon, title, body, wide }: { icon: typeof Syringe; title: string; body: string; wide?: boolean }) {
  return (
    <div className={`surface shrink-0 p-8 ${wide ? "w-[min(80vw,520px)]" : ""}`}>
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-lg text-muted-foreground">{body}</p>
    </div>
  );
}

/** 4. The debrief: the score counts up and the bars draw in as the section arrives. */
export function DebriefChapter() {
  const bars = [
    { label: "Airway", v: 92 },
    { label: "Haemodynamics", v: 78 },
    { label: "Drugs", v: 85 },
    { label: "Communication", v: 70 },
  ];
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-32 lg:grid-cols-2">
      <div>
        <p className="section-tag mb-4">After every case</p>
        <h2 className="font-display text-4xl leading-[1] md:text-6xl">A debrief that teaches.</h2>
        <p className="mt-5 text-lg text-muted-foreground">What you did well, what you missed, what you couldn't see, and a frame-by-frame replay of any moment.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ type: "spring", damping: 22 }} className="surface-raised p-8">
        <p className="section-tag">Score</p>
        <p className="mt-1 font-display text-7xl text-primary">
          <CountUp value={84} /> <span className="text-2xl text-muted-foreground">/ 100</span>
        </p>
        <div className="mt-8 space-y-4">
          {bars.map((b, i) => (
            <div key={b.label}>
              <div className="mb-1 flex justify-between text-sm font-semibold">
                <span>{b.label}</span>
                <span className="font-mono-data text-muted-foreground">{b.v}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} whileInView={{ width: `${b.v}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Example debrief</p>
      </motion.div>
    </section>
  );
}

/** 5. The closing call. */
export function FinalChapter() {
  return (
    <section className="px-4 py-40 text-center">
      <motion.h2 initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ type: "spring", damping: 20 }} className="font-display mx-auto max-w-4xl text-5xl leading-[0.95] md:text-8xl">
        The patient is on the table.
      </motion.h2>
      <div className="mt-12 flex justify-center">
        <CtaLink href="/procedures" size="lg" className="px-10">
          <Activity className="h-5 w-5" aria-hidden="true" /> Scrub in
        </CtaLink>
      </div>
    </section>
  );
}
