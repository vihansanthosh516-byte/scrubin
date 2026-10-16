// The parts of the OR screen around the stations: alarms, the team's pending question, what to do
// next, the startup progress and the keyboard-shortcut sheet.
import { useEffect, useRef } from "react";
import { AlertTriangle, Check, CircleDot, Loader2, MessageCircleQuestion } from "lucide-react";
import type { CaseState, DrugInfo } from "@/engine/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

/** Alarms that mean the patient is dying now. */
export const CRITICAL_ALARMS = ["asystole", "vf", "pea", "apnea"];
export const isCritical = (a: string) => CRITICAL_ALARMS.includes(a) || a.startsWith("spo2_low");

const ALARM_LABELS: Record<string, string> = {
  asystole: "Asystole",
  vf: "Ventricular fibrillation",
  pea: "PEA",
  apnea: "Apnoea",
  spo2_low: "SpO₂ low",
  spo2_high: "SpO₂ high",
  spo2_no_signal: "SpO₂ no signal",
  hr_low: "Heart rate low",
  hr_high: "Heart rate high",
  map_low: "MAP low",
  map_high: "MAP high",
  sbp_low: "Systolic low",
  sbp_high: "Systolic high",
  etco2_low: "EtCO₂ low",
  etco2_high: "EtCO₂ high",
  peak_pressure_low: "Airway pressure low",
  peak_pressure_high: "Airway pressure high",
  temp_low: "Temperature low",
  temp_high: "Temperature high",
};

export const alarmLabel = (a: string) => ALARM_LABELS[a] ?? a.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Every active alarm in words, announced as it appears. Critical ones lead, filled in carmine. */
export function AlarmBar({ alarms }: { alarms: string[] }) {
  if (!alarms.length) return null;
  const sorted = [...alarms].sort((a, b) => Number(isCritical(b)) - Number(isCritical(a)));
  return (
    <div role="alert" aria-label="Monitor alarms" className="flex flex-wrap items-center gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2">
      <AlertTriangle className="h-5 w-5 shrink-0 text-destructive motion-safe:animate-pulse" aria-hidden="true" />
      {sorted.map((a) => (
        <span
          key={a}
          className={cn(
            "rounded-sm px-2.5 py-1 font-mono-data text-xs font-semibold uppercase tracking-wide",
            isCritical(a) ? "bg-destructive text-destructive-foreground" : "border border-destructive/40 text-destructive",
          )}
        >
          {alarmLabel(a)}
        </span>
      ))}
    </div>
  );
}

/** A teammate is waiting for an answer: a focused prompt, not a banner that's easy to miss. */
export function PendingPrompt({ pending, onAnswer }: { pending: NonNullable<CaseState["pending"]>; onAnswer: (accept: boolean) => void }) {
  const yesRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    yesRef.current?.focus({ preventScroll: true });
  }, [pending.question]);
  const who = pending.name ?? (pending.from === "circulator" ? "Circulator" : pending.from === "surgeon" ? "Surgeon" : "Anaesthesia");
  return (
    <div role="alertdialog" aria-labelledby="pending-q" className="flex flex-wrap items-center justify-between gap-3 rounded-sm border-2 border-warning bg-card px-4 py-3 shadow-[var(--shadow-raised)]">
      <p id="pending-q" className="flex items-start gap-2 text-sm">
        <MessageCircleQuestion className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <span>
          <span className="font-semibold">{who} asks:</span> {pending.question}
        </span>
      </p>
      <div className="flex gap-2">
        <Button ref={yesRef} size="sm" onClick={() => onAnswer(true)}>
          Yes, proceed
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAnswer(false)}>
          No
        </Button>
      </div>
    </div>
  );
}

type Check = { label: string; done: boolean };

function anaesthesiaChecks(state: CaseState, drugs: DrugInfo[]): { phase: string; next: string; checks: Check[] } {
  const attached = new Set(state.monitor.attached);
  const antibiotics = new Set(drugs.filter((d) => d.class === "antibiotic").map((d) => d.id));
  const gaveAntibiotic = state.drug_log.some((d) => antibiotics.has(d.drug));
  const secured = state.airway.device === "ett" || state.airway.device === "lma";
  const checks: Check[] = [
    { label: "Standard monitors", done: ["ecg", "spo2", "nibp", "etco2"].every((m) => attached.has(m)) },
    { label: "Airway secured", done: secured },
    { label: "Ventilator set", done: secured && state.machine.mode !== "manual" },
    { label: "Antibiotic given", done: gaveAntibiotic },
  ];
  switch (state.status) {
    case "pre_induction":
      return { phase: "Before induction", next: "Monitors on, preoxygenate, then induce and secure the airway.", checks };
    case "anesthetized":
      return { phase: "Maintenance", next: "The patient is asleep. Keep them oxygenated, still and stable.", checks };
    case "emergence":
      return { phase: "Emergence", next: "Reverse, wake the patient and extubate when they meet the criteria.", checks };
    default:
      return { phase: "Case over", next: "Open the debrief to see how it went.", checks };
  }
}

/** What's happening and what's next, from the engine's own state (never the answer to a decision). */
export function GuidanceStrip({ state, role, drugs }: { state: CaseState; role: "anesthesia" | "surgeon"; drugs: DrugInfo[] }) {
  if (role === "surgeon" && state.surgery) {
    const s = state.surgery;
    const required = s.tasks.filter((t) => !t.optional);
    const doneCount = required.filter((t) => t.done).length;
    const nextRequired = required.find((t) => !t.done);
    const ready = s.tasks.filter((t) => !t.done && t.available);
    return (
      <div className="flex flex-col gap-3 rounded-sm border border-border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between" aria-label="Case progress">
        <div className="min-w-0">
          <p className="section-tag">
            Operation · {doneCount} of {required.length} required steps done
          </p>
          <p className="mt-1 text-sm">
            {s.running ? (
              <>
                <span className="font-semibold">In progress:</span> {s.running.name} ({Math.round(s.running.progress * 100)}%)
              </>
            ) : nextRequired?.blocked ? (
              <>
                <span className="font-semibold">Next:</span> {nextRequired.name}. <span className="text-warning">Blocked: {nextRequired.blocked}</span>
              </>
            ) : nextRequired ? (
              <>
                <span className="font-semibold">Next:</span> {nextRequired.name}
              </>
            ) : (
              "All required steps are done. Close up and hand over."
            )}
          </p>
        </div>
        <p className="shrink-0 font-mono-data text-xs text-muted-foreground">
          {ready.length} {ready.length === 1 ? "step" : "steps"} ready now
        </p>
      </div>
    );
  }
  const g = anaesthesiaChecks(state, drugs);
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between" aria-label="Case progress">
      <div className="min-w-0">
        <p className="section-tag">{g.phase}</p>
        <p className="mt-1 text-sm">{g.next}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {g.checks.map((c) => (
          <li key={c.label} className={cn("flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs", c.done ? "pill-sage" : "border-border text-muted-foreground")}>
            {c.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />}
            {c.label}
            <span className="sr-only">{c.done ? "done" : "not done"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STAGES = ["Downloading the simulator", "Loading medical models", "Loading the simulator"];

/** The in-browser engine's three startup stages, with the one in progress marked. */
export function StartupProgress({ stage }: { stage: string }) {
  const i = stage.startsWith("Loading medical") ? 1 : stage.startsWith("Loading the sim") ? 2 : 0;
  return (
    <div role="status" className="surface p-5">
      <ol className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        {STAGES.map((label, k) => (
          <li key={label} className={cn("flex items-center gap-2 text-sm", k < i ? "text-success" : k === i ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {k < i ? <Check className="h-4 w-4" aria-hidden="true" /> : k === i ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CircleDot className="h-4 w-4" aria-hidden="true" />}
            {label}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">The first visit downloads about 10 MB. After that it's cached and starts in seconds.</p>
    </div>
  );
}

const SHORTCUTS: [string[], string][] = [
  [["Space"], "Hold to talk to the team"],
  [["/"], "Type an order"],
  [["P"], "Pause or resume the clock"],
  [["1", "2", "3", "4"], "Anaesthesia: Drugs, Airway, Machine, Fluids"],
  [["?"], "Show this list"],
  [["Esc"], "Leave the order box"],
];

export function ShortcutHelp({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>They work anywhere in the OR except while you're typing.</DialogDescription>
        </DialogHeader>
        <dl className="divide-y divide-border">
          {SHORTCUTS.map(([keys, what]) => (
            <div key={what} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <dt className="flex gap-1">
                {keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </dt>
              <dd className="text-muted-foreground">{what}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
