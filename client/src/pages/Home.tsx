/**
 * ScrubIn Home: the signed-in landing page. A greeting with the one next action, the student's
 * real numbers, how a case works, and the beginner cases to start with. No invented stats.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Activity, ArrowRight, BookOpen, Play, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api";
import { springSoft } from "@/lib/motion";
import { getLeaderboard, getUserSessions, type PersistedSession } from "@/lib/leaderboard";
import { ENGINE_SCENARIO } from "@/engine/scenarios";
import { CtaLink, DifficultyPill, Eyebrow, Pill, StatCard } from "@/components/scrubin";

const REVEAL = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: springSoft,
} as const;

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

  return (
    <div className="bg-background text-foreground">
      {/* Greeting and the one next action */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 md:pb-20 md:pt-36">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={springSoft}>
            <Eyebrow variant="hero" className="mb-6">{greeting()}</Eyebrow>
            <h1 className="font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">
              {isNew ? <>Your first surgery starts <span className="text-primary">here</span>, {firstName}.</> : <>Welcome back, <span className="text-primary">{firstName}</span>.</>}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {isNew
                ? "Step into the OR, make the calls yourself, and see the consequences, with fictional patients and zero real risk."
                : lastCase
                  ? `Your last case was ${lastCase.procedure_name} (${lastCase.score}%). Pick up where you left off or try something new.`
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
          </motion.div>
        </div>
      </section>

      {/* Real numbers only */}
      <section className="border-b border-border bg-muted/50" aria-labelledby="stats-heading">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="stats-heading" className="sr-only">Your progress</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard value={mine ? mine.xp.toLocaleString() : "—"} label="Your XP" />
            <StatCard value={mine ? mine.cases : "—"} label="Cases completed" />
            <StatCard value={mine?.rank ? `#${mine.rank}` : "—"} label="Leaderboard rank" />
            <StatCard value={procedureCount ?? "—"} label="Procedures available" />
          </div>
        </div>
      </section>

      {/* How a case works */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <motion.div {...REVEAL} className="mb-12 max-w-2xl">
            <Eyebrow className="mb-4 block">How a case works</Eyebrow>
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              Three steps to the <span className="text-primary">OR</span>
            </h2>
          </motion.div>
          <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.li key={step.title} {...REVEAL} transition={{ ...springSoft, delay: i * 0.08 }} className="surface p-7">
                <span className="font-mono-data text-sm font-semibold text-primary">0{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Starter cases */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <motion.div {...REVEAL} className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow className="mb-4 block">Start here</Eyebrow>
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
                Beginner <span className="text-primary">cases</span>
              </h2>
            </div>
            <CtaLink href="/learn" variant="outline">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Read the briefings
            </CtaLink>
          </motion.div>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STARTER_CASES.map((c, i) => (
              <motion.li key={c.id} {...REVEAL} transition={{ ...springSoft, delay: i * 0.06 }}>
                <Link href={`/simulation?proc=${c.id}`} className="procedure-card group flex h-full flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <DifficultyPill difficulty="Beginner" />
                    {ENGINE_SCENARIO[c.id] && <Pill tone="terracotta">Real-time OR</Pill>}
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">{c.name}</h3>
                  <p className="label-mono">{c.tag}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4 font-mono-data text-xs text-label">
                    <span>
                      {c.time} · {c.decisions} decisions
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
