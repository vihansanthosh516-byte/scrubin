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

  const record = [
    { label: "Your XP", value: mine ? mine.xp.toLocaleString() : "Not yet" },
    { label: "Cases completed", value: mine ? String(mine.cases) : "Not yet" },
    { label: "Leaderboard rank", value: mine?.rank ? `#${mine.rank}` : "Unranked" },
    { label: "Procedures available", value: procedureCount != null ? String(procedureCount) : "Loading" },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* First screen: the greeting, the one next action, and the student's own record beside it */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pb-16 pt-28 md:pt-36 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <h1 className="text-5xl leading-[0.98] sm:text-6xl md:text-7xl">
              {isNew ? <>{greeting()}, {firstName}. Your first surgery starts here.</> : <>{greeting()}, {firstName}.</>}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {isNew
                ? "Make the calls yourself on fictional patients, with zero real risk."
                : lastCase
                  ? `Last case: ${lastCase.procedure_name}, ${lastCase.score}%. Pick it up or try another.`
                  : "Pick a procedure, read the briefing, and scrub in."}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {lastCase ? (
                <CtaLink href={`/simulation?proc=${lastCase.procedure_id}`} size="lg" className="px-8 text-base font-semibold">
                  <RotateCcw className="h-5 w-5" aria-hidden="true" /> Practise {lastCase.procedure_name} again
                </CtaLink>
              ) : (
                <CtaLink href="/simulation?proc=appendectomy" size="lg" className="px-8 text-base font-semibold">
                  <Activity className="h-5 w-5" aria-hidden="true" /> Start with an appendectomy
                </CtaLink>
              )}
              <CtaLink href="/procedures" size="lg" variant="outline" className="px-8 text-base font-semibold">
                <Play className="h-5 w-5" aria-hidden="true" /> Browse all procedures
              </CtaLink>
            </div>
          </div>

          <div aria-labelledby="stats-heading" role="region" className="min-w-0">
            <h2 id="stats-heading" className="text-2xl">Your record</h2>
            <dl className="mt-4 border-t border-foreground">
              {record.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-border py-3">
                  <dt className="text-sm text-muted-foreground">{r.label}</dt>
                  <dd className="font-mono-data text-2xl text-foreground">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
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
                    <h3 className="font-display text-3xl font-normal leading-tight group-hover:text-primary">{c.name}</h3>
                    {ENGINE_SCENARIO[c.id] && <Pill tone="terracotta" className="mt-2">Real-time OR</Pill>}
                  </span>
                  <span className="hidden text-sm text-muted-foreground sm:block">{c.tag}</span>
                  <span className="hidden font-mono-data text-sm text-muted-foreground sm:block">
                    {c.time}, {c.decisions} decisions
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
                <span className="font-mono-data text-sm text-primary">Step {i + 1}</span>
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
