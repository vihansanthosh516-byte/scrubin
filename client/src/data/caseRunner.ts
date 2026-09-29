// ─────────────────────────────────────────────────────────────────────────────
// Case runner for the classic simulation.
//
// A case is no longer a fixed list. It carries state (flags such as
// "cecum_repaired" or "contaminated") that later steps can depend on, and a
// stack of frames: the main operation at the bottom, and any repair operation
// a major mistake forced on top of it. Mistakes inside a repair can push
// further repairs, so bad days cascade the way they do in a real theater.
//
// Flow of a wrong answer:  chooseWrong → (Core runs the rescue) → afterRescue,
// which either enters the repair the mistake demands, or moves on.
// All functions are pure; the UI keeps the returned state.
// ─────────────────────────────────────────────────────────────────────────────

import type { StockChoice, StockStep } from "./stockProcedures";
import { buildStep, type ChoiceEffect, type Cond, type ProcedureBank, type StepDef } from "./stockSteps/stepBuilder";

interface Frame {
  /** null = the main operation; otherwise a key of bank.repairs */
  branch: string | null;
  index: number;
}

export interface CaseState {
  seed: string;
  flags: string[];
  stack: Frame[];
  /** Repair demanded by the last wrong answer, entered once its rescue ends. */
  pendingRepair: string | null;
  /** A wrong answer was recorded and its rescue has not ended yet. */
  awaitingRescue?: boolean;
  /** Steps answered so far, main and repair — reported to Core as step_index. */
  played: number;
  finished: boolean;
  /** Timeline notes produced by the last transition (repair entered/finished). */
  notes: string[];
}

export interface CurrentStep {
  step: StockStep;
  /** Title of the repair in progress, or null on the main operation. */
  repairTitle: string | null;
  /** Badge label for the branch in progress ("Emergency repair" by default). */
  repairLabel: string | null;
  /** 1-based position inside the repair, and its length. */
  repairStep: number;
  repairLength: number;
  /** How many repairs deep we are (0 = main operation). */
  depth: number;
}

export function condHolds(cond: Cond | undefined, flags: string[]): boolean {
  if (!cond) return true;
  if (cond.all && !cond.all.every((f) => flags.includes(f))) return false;
  if (cond.any && !cond.any.some((f) => flags.includes(f))) return false;
  if (cond.none && cond.none.some((f) => flags.includes(f))) return false;
  return true;
}

function stepsOf(bank: ProcedureBank, branch: string | null): StepDef[] {
  if (branch === null) return bank.steps;
  const r = bank.repairs?.[branch];
  if (!r) throw new Error(`caseRunner: unknown repair branch "${branch}" in ${bank.id}`);
  return r.steps;
}

function applyFlags(flags: string[], effect?: { set?: string[]; clear?: string[] } | null): string[] {
  if (!effect) return flags;
  const out = flags.filter((f) => !effect.clear?.includes(f));
  for (const f of effect.set ?? []) if (!out.includes(f)) out.push(f);
  return out;
}

/** Move to the next playable step, unwinding finished repairs. */
function advance(bank: ProcedureBank, s: CaseState): CaseState {
  let flags = s.flags;
  const stack = s.stack.map((f) => ({ ...f }));
  const notes = [...s.notes];
  for (;;) {
    const top = stack[stack.length - 1];
    const steps = stepsOf(bank, top.branch);
    let i = top.index + 1;
    while (i < steps.length && !condHolds(steps[i].when, flags)) i++;
    if (i < steps.length) {
      top.index = i;
      return { ...s, flags, stack, notes };
    }
    if (top.branch === null) {
      top.index = steps.length;
      return { ...s, flags, stack, notes, finished: true };
    }
    const done = bank.repairs![top.branch];
    flags = applyFlags(flags, done.done);
    notes.push(`✅ ${done.label === undefined ? "Repair" : done.label} complete: ${done.title}`);
    stack.pop();
  }
}

export function startCase(bank: ProcedureBank, seed: string, flags: string[] = []): CaseState {
  return advance(bank, {
    seed,
    flags,
    stack: [{ branch: null, index: -1 }],
    pendingRepair: null,
    played: 0,
    finished: false,
    notes: [],
  });
}

export function currentStep(bank: ProcedureBank, s: CaseState): CurrentStep | null {
  if (s.finished) return null;
  const top = s.stack[s.stack.length - 1];
  const steps = stepsOf(bank, top.branch);
  const def = steps[top.index];
  if (!def) return null;
  const id = top.branch === null ? def.id || `${bank.id}_s${top.index + 1}` : `${bank.id}_${top.branch}_r${top.index + 1}`;
  const repair = top.branch ? bank.repairs![top.branch] : null;
  return {
    step: buildStep(bank, def, id, top.index, s.seed),
    repairTitle: repair?.title ?? null,
    repairLabel: repair ? repair.label ?? "Emergency repair" : null,
    repairStep: top.index + 1,
    repairLength: steps.length,
    depth: s.stack.length - 1,
  };
}

export function chooseCorrect(bank: ProcedureBank, s: CaseState, choice: Pick<StockChoice, "effect">): CaseState {
  const flags = applyFlags(s.flags, choice.effect);
  const next = { ...s, flags, played: s.played + 1, notes: [] };
  // A right call can open a pathway too (e.g. diagnosing a leak starts its management).
  if (choice.effect?.repair) return enterBranch(bank, next, choice.effect.repair);
  return advance(bank, next);
}

function enterBranch(bank: ProcedureBank, s: CaseState, id: string): CaseState {
  const branch = bank.repairs?.[id];
  if (!branch) throw new Error(`caseRunner: unknown repair branch "${id}" in ${bank.id}`);
  const stack = s.stack.map((f) => ({ ...f }));
  // "redo" re-lands on the current step once the branch unwinds (if it still applies).
  if (branch.then === "redo") stack[stack.length - 1].index -= 1;
  stack.push({ branch: id, index: -1 });
  return advance(bank, {
    ...s,
    stack,
    pendingRepair: null,
    notes: [...s.notes, `🔧 ${branch.label ?? "Emergency repair"}: ${branch.title}`],
  });
}

/** Record a wrong answer. The case waits here until Core's rescue ends. */
export function chooseWrong(bank: ProcedureBank, s: CaseState, choice: Pick<StockChoice, "effect">): CaseState {
  const effect: ChoiceEffect | undefined = choice.effect;
  if (effect?.repair && !bank.repairs?.[effect.repair]) {
    throw new Error(`caseRunner: step demands unknown repair "${effect.repair}" in ${bank.id}`);
  }
  return {
    ...s,
    flags: applyFlags(s.flags, effect),
    pendingRepair: effect?.repair ?? null,
    awaitingRescue: true,
    played: s.played + 1,
    notes: [],
  };
}

/**
 * The rescue is over. A spontaneous deterioration did not fail the step, so
 * the trainee stays on it. A mistake either opens the repair it demands or
 * moves past the failed step.
 */
export function afterRescue(bank: ProcedureBank, s: CaseState, opts: { spontaneous: boolean }): CaseState {
  if (opts.spontaneous) return { ...s, notes: [] };
  const done = { ...s, awaitingRescue: false, notes: [] };
  if (!s.pendingRepair) return advance(bank, done);
  return enterBranch(bank, done, s.pendingRepair);
}

/**
 * How long this case will be if every call from here on is right: the steps
 * answered so far plus the ones still ahead. It grows when a repair opens and
 * shrinks when the state removes steps, so the header can show "step X of N".
 */
export function projectedLength(bank: ProcedureBank, s: CaseState): number {
  // Mid-rescue, the failed step is already counted in `played`; move past it
  // (or into its repair) before projecting, or it is counted twice.
  let cur = s.pendingRepair || s.awaitingRescue ? afterRescue(bank, s, { spontaneous: false }) : s;
  let guard = 0;
  while (!cur.finished && guard++ < 10_000) {
    const step = currentStep(bank, cur);
    if (!step) break;
    cur = chooseCorrect(bank, cur, step.step.choices.find((c) => c.isCorrect)!);
  }
  return cur.played;
}

/** The all-correct path through the main operation, for length checks and tests. */
export function defaultPath(bank: ProcedureBank): string[] {
  let s = startCase(bank, "default");
  const titles: string[] = [];
  let guard = 0;
  while (!s.finished && guard++ < 10_000) {
    const cur = currentStep(bank, s)!;
    titles.push(cur.step.title);
    const correct = cur.step.choices.find((c) => c.isCorrect)!;
    s = chooseCorrect(bank, s, correct);
  }
  return titles;
}
