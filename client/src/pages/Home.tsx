/**
 * ScrubIn Home: the signed-in landing page. A greeting with the one next action, the student's
 * real numbers, how a case works, and the beginner cases to start with. No invented stats.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Activity, ArrowRight, BookOpen, Play, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api";
import { getLeaderboard, getUserSessions, type PersistedSession } from "@/lib/leaderboard";
import { ENGINE_SCENARIO } from "@/engine/scenarios";
import { CtaLink, Pill } from "@/components/scrubin";
import { PatientMonitor } from "@/components/or/PatientMonitor";
import type { MonitorReadout } from "@/engine/types";
import bundledCatalog from "@/data/procedureCatalog.json";

// The four Beginner cases (unlocked below 500 XP). Ids match the registry; times and decision
// counts are the engine's own estimates.
const STARTER_CASES = [
  { id: "appendectomy", name: "Appendectomy", tag: "General Surgery", time: "34 min", decisions: 34 },
  { id: "inguinal-hernia", name: "Inguinal Hernia Repair", tag: "General Surgery", time: "32 min", decisions: 32 },
  { id: "thyroidectomy", name: "Thyroidectomy", tag: "ENT", time: "32 min", decisions: 32 },
  { id: "carpal-tunnel-release", name: "Carpal Tunnel Release", tag: "Orthopedic", time: "30 min", decisions: 30 },
];

// A steady, healthy patient on the monitor: what the bedside screen looks like at the start of a case.
const DEMO_READOUT: MonitorReadout = {
  attached: ["ecg", "spo2", "nibp", "etco2"],
  hr: 78, rhythm: "sinus", spo2: 98, pulse_rate: 78, perfusion_index: 3.1,
  nibp: { sbp: 124, dbp: 78, map: 93 }, nibp_age_s: 40, etco2: 36, rr: 14, temp: 36.8, capno_shape: "normal",
};

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

  const record = [
    { label: "Your XP", value: mine ? mine.xp.toLocaleString() : "0" },
    { label: "Cases completed", value: mine ? String(mine.cases) : "0" },
    { label: "Leaderboard rank", value: mine?.rank ? `#${mine.rank}` : "None" },
    { label: "Procedures available", value: procedureCount != null ? String(procedureCount) : String((bundledCatalog as any).procedures.length) },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* First screen: the headline and the one next action beside the live bedside monitor */}
      <section>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:pt-36">
          <div className="min-w-0">
            <h1 className="text-5xl leading-[1.02] sm:text-6xl lg:text-[4.25rem]">
              {isNew ? <>Your first surgery starts here.</> : <>{greeting()}, {firstName}.</>}
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              {isNew
                ? "Make the calls yourself on fictional patients, with zero real risk."
                : lastCase
                  ? `Last case: ${lastCase.procedure_name}, ${lastCase.score}%. Pick it up or try another.`
                  : "Pick a procedure, read the briefing, and scrub in."}
            </p>
            <div className="mt-10 flex flex-col flex-wrap gap-3 sm:flex-row">
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
          </div>

          <figure className="min-w-0">
            <div className="overflow-hidden rounded-[min(2vw,var(--radius-card))] shadow-[var(--shadow-lift)] outline outline-1 -outline-offset-1 outline-border">
              <PatientMonitor readout={DEMO_READOUT} alarms={[]} paused={false} muted showAlarmChips={false} />
            </div>
            <figcaption className="mt-3 text-sm text-muted-foreground">The bedside monitor from inside a case. Every order you give moves these numbers.</figcaption>
          </figure>
        </div>
      </section>

      {/* The student's own record, as figures on one smoked band */}
      <section aria-labelledby="stats-heading" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="stats-heading" className="font-sans text-sm text-muted-foreground">Your record</h2>
          <dl className="mt-6 grid grid-cols-2 gap-y-8 md:grid-cols-4">
            {record.map((r) => (
              <div key={r.label} className="min-w-0 border-l border-border pl-5 first:border-l-0 first:pl-0 md:[&:nth-child(3)]:border-l md:[&:nth-child(3)]:pl-5 [&:nth-child(3)]:border-l-0 [&:nth-child(3)]:pl-0">
                <dt className="text-sm text-muted-foreground">{r.label}</dt>
                <dd className="mt-2 font-display text-4xl leading-none sm:text-5xl">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Starter cases, set as an index: one row per case, the whole row is the link */}
      <section aria-labelledby="starter-heading">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <h2 id="starter-heading" className="text-4xl sm:text-5xl">Beginner cases</h2>
              <p className="mt-3 text-muted-foreground">Open to everyone. Start with any of these four.</p>
            </div>
            <CtaLink href="/learn" variant="outline">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Read the briefings
            </CtaLink>
          </div>
          <ul className="border-t border-foreground">
            {STARTER_CASES.map((c) => (
              <li key={c.id} className="border-b border-border">
                <Link
                  href={`/simulation?proc=${c.id}`}
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 py-6 transition-colors hover:bg-muted/60 sm:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,3fr)_auto] sm:px-3"
                >
                  <span className="min-w-0">
                    <h3 className="font-display text-3xl font-normal leading-tight group-hover:text-foreground">{c.name}</h3>
                    {ENGINE_SCENARIO[c.id] && <Pill tone="terracotta" className="mt-2">Real-time OR</Pill>}
                  </span>
                  <span className="hidden text-sm text-muted-foreground sm:block">{c.tag}</span>
                  <span className="hidden font-mono-data text-sm text-muted-foreground sm:block">
                    {c.time}, {c.decisions} decisions
                  </span>
                  <ArrowRight className="h-5 w-5 text-foreground transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How a case works: three columns on hairlines, no cards */}
      <section className="border-t border-border bg-muted/50" aria-labelledby="how-heading">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <h2 id="how-heading" className="max-w-2xl text-4xl sm:text-5xl">How a case works</h2>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t border-foreground py-6 md:border-l md:border-t-0 md:border-border md:px-8 md:first:border-l-0 md:first:pl-0">
                <span className="font-mono-data text-sm text-foreground">Step {i + 1}</span>
                <h3 className="mt-3 font-display text-3xl font-normal">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
