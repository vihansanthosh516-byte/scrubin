/**
 * Event and phase text from the engines still carries emoji markers ("✅ Correct Step: …"),
 * which the timeline and debrief parse. The UI never shows emoji: this strips them and draws a
 * lucide icon for the marker instead.
 */
import type { ComponentType } from "react";
import {
  Activity, AlertTriangle, Brain, CheckCircle2, ClipboardList, HeartPulse, Scissors, Stethoscope,
  TrendingDown, Wrench, XCircle, Droplet, Skull, BarChart3, Syringe, Bone, Baby, Camera, Cog, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

const EMOJI = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍(?:\p{Extended_Pictographic})️?|[\u{1F3FB}-\u{1F3FF}])*/gu;

/** The text with every emoji removed and spacing tidied. */
export function stripEmoji(text: string): string {
  return String(text ?? "").replace(EMOJI, "").replace(/\s{2,}/g, " ").trim();
}

const MARKERS: [RegExp, Icon, string][] = [
  [/^✅/u, CheckCircle2, "text-success"],
  [/^❌/u, XCircle, "text-destructive"],
  [/^⚠️?/u, AlertTriangle, "text-warning"],
  [/^🧠/u, Brain, "text-info"],
  [/^🔧/u, Wrench, "text-warning"],
  [/^(🔴|💀)/u, Skull, "text-destructive"],
  [/^📉/u, TrendingDown, "text-destructive"],
  [/^💓/u, HeartPulse, "text-destructive"],
  [/^🩸/u, Droplet, "text-destructive"],
];

/** A line of engine text: its leading marker as an icon, the rest as plain text. */
export function EventText({ text, className, iconClassName }: { text: unknown; className?: string; iconClassName?: string }) {
  const raw = typeof text === "string" ? text : String((text as any)?.description ?? text ?? "");
  const hit = MARKERS.find(([re]) => re.test(raw.trimStart()));
  const body = stripEmoji(raw);
  if (!hit) return <span className={className}>{body}</span>;
  const [, Icon, tone] = hit;
  return (
    <span className={cn("inline-flex items-start gap-1.5", className)}>
      <Icon className={cn("mt-[0.2em] h-[1em] w-[1em] shrink-0", tone, iconClassName)} aria-hidden="true" />
      <span>{body}</span>
    </span>
  );
}

const PHASE_ICONS: [RegExp, Icon][] = [
  [/intake|evaluation|exam|assessment/i, Stethoscope],
  [/pre-?op|planning|stabili[sz]ation/i, ClipboardList],
  [/incision|access|entry|dissection|graft|harvest/i, Scissors],
  [/drill|fixation|tunnel|implant/i, Cog],
  [/arthroscop|camera|scope/i, Camera],
  [/bone|ortho/i, Bone],
  [/labor|delivery|baby/i, Baby],
  [/anesth|induction|airway/i, Syringe],
  [/clos|suture|hemostasis/i, Activity],
  [/post-?op|debrief|recovery|rehab/i, BarChart3],
  [/complet|win|done/i, Trophy],
];

/** A lucide icon for a procedure phase, chosen from its name (the registry still stores emoji). */
export function PhaseIcon({ name, className }: { name: string; className?: string }) {
  const Icon = PHASE_ICONS.find(([re]) => re.test(name))?.[1] ?? Activity;
  return <Icon className={cn("h-3.5 w-3.5 shrink-0", className)} aria-hidden="true" />;
}
