// Duolingo-style learning path: every procedure as a node on a winding path, grouped into units
// by difficulty. Done nodes show stars from the best score; the next case bounces; locked tiers
// show how much XP is left. A node opens a card with Start and the briefing.
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Check, Lock, Play, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CtaLink } from "@/components/scrubin";
import type { PersistedSession } from "@/lib/leaderboard";
import { TIERS } from "@/lib/game";
import { cn } from "@/lib/utils";

export interface PathProcedure {
  id: string;
  name: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  specialty: string;
  time: string;
}

const UNIT_STYLE = {
  beginner: { band: "bg-success", text: "text-success-foreground", node: "bg-success text-success-foreground", ledge: "color-mix(in srgb, var(--success) 60%, black)" },
  intermediate: { band: "bg-primary", text: "text-primary-foreground", node: "bg-primary text-primary-foreground", ledge: "var(--primary-shadow)" },
  advanced: { band: "bg-foreground", text: "text-background", node: "bg-foreground text-background", ledge: "color-mix(in srgb, var(--foreground) 55%, black)" },
} as const;

// Horizontal offsets (px) that make the path wind left and right.
const WIND = [0, 56, 84, 56, 0, -56, -84, -56];

const stars = (score: number) => (score >= 90 ? 3 : score >= 70 ? 2 : score > 0 ? 1 : 0);

export function LearningPath({ procedures, sessions, xp, devUnlocked }: { procedures: PathProcedure[]; sessions: PersistedSession[]; xp: number; devUnlocked?: boolean }) {
  const best = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sessions) m.set(s.procedure_id, Math.max(m.get(s.procedure_id) ?? 0, s.score));
    return m;
  }, [sessions]);

  // The current node: the first unlocked procedure not yet done.
  const order = TIERS.flatMap((t) => procedures.filter((p) => p.difficulty === t.id));
  const unlocked = (p: PathProcedure) => devUnlocked || xp >= (TIERS.find((t) => t.id === p.difficulty)?.at ?? 0);
  const currentId = order.find((p) => unlocked(p) && !best.has(p.id))?.id;

  let n = 0;
  return (
    <div className="mx-auto max-w-xl space-y-14 pb-16">
      {TIERS.map((tier, u) => {
        const items = procedures.filter((p) => p.difficulty === tier.id);
        if (!items.length) return null;
        const style = UNIT_STYLE[tier.id];
        const tierOpen = devUnlocked || xp >= tier.at;
        const doneCount = items.filter((p) => best.has(p.id)).length;
        return (
          <section key={tier.id} aria-labelledby={`unit-${tier.id}`}>
            <div className={cn("flex items-center justify-between gap-4 rounded-2xl px-6 py-5", style.band, style.text)}>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em]">Unit {u + 1}</p>
                <h2 id={`unit-${tier.id}`} className="text-2xl font-extrabold">{tier.label}</h2>
              </div>
              <p className="text-right text-sm font-bold">
                {tierOpen ? `${doneCount} / ${items.length} done` : <>Unlocks at {tier.at.toLocaleString()} XP</>}
              </p>
            </div>
            <ol className="mt-10 flex flex-col items-center gap-6">
              {items.map((p) => {
                const offset = WIND[n++ % WIND.length];
                const score = best.get(p.id);
                return (
                  <li key={p.id} style={{ transform: `translateX(${offset}px)` }}>
                    <PathNode p={p} score={score} locked={!unlocked(p)} current={p.id === currentId} ledge={style.ledge} nodeClass={style.node} needXp={tier.at - xp} />
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function PathNode({ p, score, locked, current, ledge, nodeClass, needXp }: { p: PathProcedure; score?: number; locked: boolean; current: boolean; ledge: string; nodeClass: string; needXp: number }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const done = score !== undefined;
  const s = stars(score ?? 0);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex flex-col items-center">
        {current && (
          <motion.span
            className="absolute -top-11 whitespace-nowrap rounded-xl border-2 border-border bg-card px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-primary shadow-[var(--shadow-raised)]"
            animate={reduce ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            Start
          </motion.span>
        )}
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`${p.name}: ${locked ? "locked" : done ? `done, best ${score}%` : "not started"}`}
            className={cn(
              "pressable relative flex h-[72px] w-[72px] items-center justify-center rounded-full transition-transform",
              locked ? "bg-muted text-label [--ledge:var(--border)]" : nodeClass,
              current && "ring-[6px] ring-primary/25",
            )}
            style={locked ? undefined : ({ ["--ledge" as string]: ledge } as React.CSSProperties)}
          >
            {locked ? <Lock className="h-7 w-7" /> : done ? <Check className="h-8 w-8" strokeWidth={3} /> : <Play className="h-7 w-7 fill-current" />}
          </button>
        </PopoverTrigger>
        <span className="mt-3 max-w-[160px] text-center text-sm font-bold leading-tight">{p.name}</span>
        {done && (
          <span className="mt-1 flex gap-0.5" aria-label={`${s} of 3 stars`}>
            {[0, 1, 2].map((i) => (
              <Star key={i} className={cn("h-4 w-4", i < s ? "fill-xp text-xp" : "text-border")} aria-hidden="true" />
            ))}
          </span>
        )}
      </div>
      <PopoverContent className="w-72 rounded-2xl border-2 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-label">{p.specialty}</p>
        <p className="mt-1 text-lg font-extrabold leading-tight">{p.name}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {locked ? `Locked. Earn ${needXp.toLocaleString()} more XP to unlock this unit.` : done ? `Best score ${score}%. Beat it for more XP.` : `About ${p.time}. Your next case on the path.`}
        </p>
        <div className="mt-4 grid gap-2">
          {!locked && (
            <CtaLink href={`/simulation?proc=${p.id}`} className="w-full">
              <Play className="h-4 w-4" aria-hidden="true" /> {done ? "Practise again" : "Start case"}
            </CtaLink>
          )}
          <CtaLink href={`/learn/${p.id}`} variant="outline" className="w-full">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Read the briefing
          </CtaLink>
        </div>
      </PopoverContent>
    </Popover>
  );
}
