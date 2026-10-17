// Duolingo-style game widgets: streak flame, daily-goal ring, level bar, and the celebration
// shown after a case. They live around the cases (home, path, navbar, debrief), never in the OR.
import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Flame, Star, Trophy, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { burst, chime } from "@/lib/celebrate";
import { levelFor, rankFor } from "@/lib/game";
import { cn } from "@/lib/utils";

/** Number that counts up to `value`. */
export function CountUp({ value, duration = 1.1, className }: { value: number; duration?: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [value, duration, reduce, mv]);
  return <motion.span className={cn("tabular-nums", className)}>{text}</motion.span>;
}

/** The streak flame: lit when today's case is done, outlined (and nudging) when it isn't yet. */
export function StreakChip({ streak, doneToday, className }: { streak: number; doneToday: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums",
        doneToday ? "bg-streak text-streak-foreground" : "border-2 border-streak/50 text-streak",
        className,
      )}
      title={doneToday ? `${streak}-day streak. Today's done.` : streak ? `${streak}-day streak. Do a case today to keep it.` : "Start a streak: do a case today"}
    >
      <Flame className={cn("h-4 w-4", doneToday && "fill-current")} aria-hidden="true" />
      {streak}
      <span className="sr-only">day streak{doneToday ? ", today done" : ", not yet today"}</span>
    </span>
  );
}

/** Daily XP goal as a ring. */
export function GoalRing({ value, goal, size = 64 }: { value: number; goal: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / goal);
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Daily goal: ${Math.min(value, goal)} of ${goal} XP`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={8} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={pct >= 1 ? "var(--success)" : "var(--xp)"}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {pct >= 1 ? <Star className="h-5 w-5 fill-xp text-xp" aria-hidden="true" /> : <Zap className="h-5 w-5 text-xp" aria-hidden="true" />}
      </span>
    </div>
  );
}

/** Level and progress to the next one. */
export function LevelBar({ xp, className }: { xp: number; className?: string }) {
  const l = levelFor(xp);
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-bold">
          Level {l.level} <span className="font-medium text-muted-foreground">· {rankFor(l.level)}</span>
        </span>
        <span className="font-mono-data text-xs text-muted-foreground">
          {l.into} / {l.need} XP
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`Level ${l.level} progress`} aria-valuemin={0} aria-valuemax={l.need} aria-valuenow={l.into}>
        <motion.div className="h-full rounded-full bg-xp" initial={{ width: 0 }} animate={{ width: `${l.progress * 100}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
  );
}

/**
 * Shown over the debrief when a case is recorded: XP earned counts up, the level bar fills,
 * and a level-up or streak gets its own beat.
 */
export function CaseCelebration({ open, onClose, earned, xpBefore, streakBefore, streakAfter }: { open: boolean; onClose: () => void; earned: number; xpBefore: number; streakBefore: number; streakAfter: number }) {
  const before = levelFor(xpBefore);
  const after = levelFor(xpBefore + earned);
  const levelUp = after.level > before.level;
  const streakUp = streakAfter > streakBefore;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!open) return;
    setStage(0);
    burst(levelUp ? "big" : "small");
    chime(levelUp ? "level" : "xp");
    const t = window.setTimeout(() => {
      setStage(1);
      if (streakUp) chime("streak");
    }, 1400);
    return () => window.clearTimeout(t);
  }, [open, levelUp, streakUp]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Case complete"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[var(--shadow-lift)]"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 260 }}
          >
            <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.1, damping: 10, stiffness: 200 }} className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-xp text-xp-foreground">
              {levelUp ? <Trophy className="h-10 w-10" aria-hidden="true" /> : <Zap className="h-10 w-10 fill-current" aria-hidden="true" />}
            </motion.div>
            <p className="font-display text-3xl">{levelUp ? `Level ${after.level}!` : "Case complete!"}</p>
            {levelUp && <p className="mt-1 font-semibold text-primary">You're now a {rankFor(after.level)}</p>}
            <p className="mt-4 font-display text-6xl text-xp">
              +<CountUp value={earned} /> <span className="text-3xl">XP</span>
            </p>
            <LevelBar xp={xpBefore + earned} className="mt-6 text-left" />
            <AnimatePresence>
              {stage >= 1 && streakAfter > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-streak/10 px-4 py-3 font-bold text-streak">
                  <Flame className="h-6 w-6 fill-current" aria-hidden="true" />
                  {streakUp ? `${streakAfter}-day streak!` : `${streakAfter}-day streak kept`}
                </motion.div>
              )}
            </AnimatePresence>
            <Button size="lg" className="mt-8 w-full" onClick={onClose}>
              See my debrief
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
