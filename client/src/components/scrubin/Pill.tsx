import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PillTone = "sage" | "amber" | "terracotta" | "carmine" | "neutral";

const DIFFICULTY_TONE: Record<string, PillTone> = {
  beginner: "sage",
  intermediate: "amber",
  advanced: "terracotta",
};

/** Small uppercase status label. Always carries a word, so colour is never the only signal. */
export function Pill({ tone = "neutral", icon, children, className }: { tone?: PillTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", `pill-${tone}`, className)}>
      {icon}
      {children}
    </span>
  );
}

/** Beginner = sage, Intermediate = amber, Advanced = terracotta. */
export function DifficultyPill({ difficulty, className }: { difficulty: string; className?: string }) {
  return (
    <Pill tone={DIFFICULTY_TONE[difficulty?.toLowerCase()] ?? "neutral"} className={className}>
      {difficulty}
    </Pill>
  );
}
