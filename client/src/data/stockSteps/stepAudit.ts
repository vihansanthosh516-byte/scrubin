// Content audit for the authored procedure banks, run as a CI check.
//
// Detectors:
//  1. template_mismatch — a template step (`f:` config) whose generated
//     correct choice shares almost no content with the step's own title or
//     description. This is the class of bug where the lavage step offered
//     verbatim dissection options, and seven more steps were found with it.
//  2. duplicate_option — an explicit-choice step with two identical choices,
//     or a wrong choice that duplicates the correct one.
//  3. complication_invalid — a wrong choice names a complication that is not
//     in the engine's canonical set (catches typos like "cardiac_arrythmia").
//  4. complication_not_in_risks — a wrong choice names a complication the
//     bank's own `spec.risks` list does not declare. The bank risk lists are
//     kept in sync with what the steps actually trigger.
//  5. complication_duplicate — both wrong choices trigger the same
//     complication, which makes the choice meaningless.
//  6. phase_descent — a step's kind belongs to an earlier surgical phase than
//     a step already seen in the bank (e.g. a post-op step appearing before
//     the closure). Template steps with a generic response are exempt from
//     the template-mismatch check via the allowlist in stepAudit.test.ts; the
//     other detectors are strict.

import { ProcedureBank, StepDef, buildStockSteps } from "./stepBuilder";
import { STOCK_STEP_BANKS } from "./index";

const STOP = new Set(
  "the a an and or of to in on at by up out off over under with without into from for as is are was were be been being it its this that these those but so then than more most some any all each few both which who whom whose can could may might must shall should will would do does did done before after during within around toward away".split(" ")
);

const contentWords = (s: string): string[] => {
  const raw = s
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w));
  return [...new Set(raw)];
};

const INTRINSICALLY_GENERIC_KINDS = new Set(["closure", "bleed", "vitals", "dvt", "postop", "preop", "antibiotic", "position"]);

// The engine's canonical complication set (server/engine/state/models.ts).
// Complications any operation can cause (an allergen, a contaminated wound, a
// positioning palsy, an airway problem, a DVT) — valid even when a bank's risk list
// only names its procedure-specific dangers.
export const UNIVERSAL_COMPS = new Set(["anaphylaxis", "infection", "nerve_injury", "hypoxia", "thrombosis"]);

export const VALID_COMPLICATIONS = new Set([
  "hypoxia",
  "hemorrhage",
  "infection",
  "thrombosis",
  "cardiac_arrhythmia",
  "anaphylaxis",
  "nerve_injury",
  "fluid_overload",
]);

// Surgical phase each step kind belongs to, in clinical order. A bank's
// steps must not descend to an earlier phase after a later one has started.
// `landmark` is intentionally phase-agnostic: identifying a structure is
// legitimate at every operative stage (from pre-op imaging through the
// dissection), so those steps never trigger a descent.
export const KIND_PHASE: Record<string, number> = {
  preop: 0,
  antibiotic: 0,
  position: 0,
  access: 1,
  exposure: 1,
  dissect: 2,
  core: 2,
  vessel: 2,
  nerve: 2,
  bleed: 2,
  verify: 2,
  closure: 3,
  postop: 4,
  dvt: 4,
};

export interface AuditFlag {
  bankId: string;
  stepIndex: number; // 1-based, for easy reference to the source data
  kind: string;
  title: string;
  reason:
    | "template_mismatch"
    | "duplicate_option"
    | "duplicate_title"
    | "complication_invalid"
    | "complication_not_in_risks"
    | "complication_duplicate"
    | "phase_descent"
    | "not_authored"
    | "length_tell"
    | "tell_phrase"
    | "complication_kind_mismatch"
    | "repair_missing"
    | "repair_unreachable"
    | "repair_too_short"
    | "flag_unreachable";
  detail: string;
}

// Banks rewritten so every step is hand-authored with causal complications,
// visible consequences, and no giveaway wording. auditTailoredBank() holds
// these to the stricter bar; the set grows until it covers every bank.
export const TAILORED_BANKS = new Set<string>(["appendectomy", "cholecystectomy"]);

// Coarse sanity net: which complications a mistake at each kind of step can
// plausibly cause. Real causality comes from authoring; this only catches
// pairings that cannot be right (e.g. a DVT-prophylaxis mistake → nerve injury).
export const KIND_COMPLICATIONS: Record<string, string[]> = {
  preop: ["anaphylaxis", "hypoxia", "infection", "thrombosis", "hemorrhage", "cardiac_arrhythmia", "fluid_overload"],
  antibiotic: ["infection", "anaphylaxis"],
  position: ["nerve_injury", "hypoxia", "thrombosis"],
  access: ["hemorrhage", "infection", "hypoxia", "nerve_injury", "cardiac_arrhythmia"],
  exposure: ["hemorrhage", "infection", "hypoxia", "nerve_injury", "cardiac_arrhythmia"],
  landmark: ["hemorrhage", "nerve_injury", "infection"],
  dissect: ["hemorrhage", "nerve_injury", "infection"],
  core: ["hemorrhage", "infection", "nerve_injury", "thrombosis"],
  vessel: ["hemorrhage", "thrombosis"],
  nerve: ["nerve_injury"],
  bleed: ["hemorrhage", "fluid_overload", "infection", "cardiac_arrhythmia"],
  verify: ["infection", "hemorrhage", "nerve_injury", "thrombosis"],
  vitals: ["hypoxia", "cardiac_arrhythmia", "fluid_overload", "anaphylaxis", "hemorrhage", "thrombosis"],
  closure: ["infection", "hemorrhage", "nerve_injury"],
  postop: ["infection", "hypoxia", "fluid_overload", "cardiac_arrhythmia", "thrombosis", "hemorrhage", "anaphylaxis"],
  dvt: ["thrombosis", "hemorrhage"],
};

// Wording that marks an option as the "obviously wrong" shortcut.
export const DISTRACTOR_TELLS: RegExp[] = [
  /\bskip(s|ping|ped)?\b/i,
  /\bblind(ly)?\b/i,
  /\bproceed straight\b/i,
  /\btrust the\b/i,
  /\bimprovis/i,
  /\bsave time\b/i,
  /\bimmediately\b/i,
  /\bjust\b/i,
  /\bquickly\b/i,
  /\bspeed (up|the)\b/i,
  /\baggressive(ly)?\b/i,
  /\bforceful(ly)?\b/i,
  /\bmaximum force\b/i,
  /\bwithout (checking|confirming|testing|verifying|looking)\b/i,
  /\bno need to\b/i,
  // Absolutes a tester found reliably marked the wrong option.
  /\bin one (push|go|pass|bolus)\b/i,
  /\bwhatever\b/i,
  /\bno end date\b/i,
  /\bwithout doing anything else\b/i,
  /\ball at once\b/i,
  /\bno matter\b/i,
  /\bat once\b/i,
  /\bwide open\b/i,
  /\bindefinitely\b/i,
  /\bfor good\b/i,
];

// Wording that marks an option as the "obviously right" careful one.
export const CORRECT_TELLS: RegExp[] = [/\b(safely|carefully|gently|precisely|appropriately|properly|correctly)\b/i];

export const TELL_MIN_RATIO = 0.75;
export const TELL_MAX_RATIO = 1.3;
export const MAX_CORRECT_LONGEST_SHARE = 0.4;
// A bank where the correct option is almost never longest has the reverse tell.
export const MIN_CORRECT_LONGEST_SHARE = 0.15;

/** Stricter audit for tailored banks: fully authored, causal, and giveaway-free. */
export function auditTailoredBank(bank: ProcedureBank): AuditFlag[] {
  const flags: AuditFlag[] = [];
  const risks: string[] = (bank.spec as any).risks || [];
  const repairs = bank.repairs ?? {};
  // Main-line steps plus every repair operation's steps, audited to the same bar.
  const all: { step: StepDef; at: number; where: string }[] = [
    ...bank.steps.map((step, i) => ({ step, at: i + 1, where: "" })),
    ...Object.entries(repairs).flatMap(([id, r]) => r.steps.map((step, i) => ({ step, at: i + 1, where: `[repair ${id}] ` }))),
  ];
  let correctLongest = 0;
  const titleCount = new Map<string, number>();
  for (const { step } of all) titleCount.set(step.title, (titleCount.get(step.title) ?? 0) + 1);
  all.forEach(({ step, at, where }) => {
    const flag = (reason: AuditFlag["reason"], detail: string) =>
      flags.push({ bankId: bank.id, stepIndex: at, kind: step.kind, title: `${where}${step.title}`, reason, detail });

    // The timeline and repair badge identify steps by title, so each must be unique.
    if (titleCount.get(step.title)! > 1) flag("duplicate_title", "another step in this bank has the same title");

    if (!step.choices || !step.feedback || !step.wrongComps || !step.consequences) {
      flag("not_authored", "tailored steps need choices, feedback, wrongComps and consequences");
      return;
    }
    const [correct, ...wrongs] = step.choices;
    const meanWrong = (wrongs[0].length + wrongs[1].length) / 2;
    const ratio = correct.length / meanWrong;
    if (ratio < TELL_MIN_RATIO || ratio > TELL_MAX_RATIO) {
      flag("length_tell", `correct option is ${ratio.toFixed(2)}× the distractor length (allowed ${TELL_MIN_RATIO}–${TELL_MAX_RATIO})`);
    }
    if (correct.length > wrongs[0].length && correct.length > wrongs[1].length) correctLongest++;

    wrongs.forEach((w, j) => {
      const hit = DISTRACTOR_TELLS.find((re) => re.test(w));
      if (hit) flag("tell_phrase", `distractor ${j + 1} contains giveaway wording ${hit}: "${w.slice(0, 80)}"`);
    });
    const correctHit = CORRECT_TELLS.find((re) => re.test(correct));
    if (correctHit) flag("tell_phrase", `correct option contains giveaway wording ${correctHit}: "${correct.slice(0, 80)}"`);
    if (new Set(step.choices.map((c) => c.trim())).size !== 3) flag("duplicate_option", "two options are identical");

    const allowed = KIND_COMPLICATIONS[step.kind] || [];
    step.wrongComps.forEach((c) => {
      if (!VALID_COMPLICATIONS.has(c)) flag("complication_invalid", `unknown complication "${c}"`);
      else if (!risks.includes(c)) flag("complication_not_in_risks", `"${c}" is not in the bank's risks`);
      if (!allowed.includes(c)) {
        flag("complication_kind_mismatch", `a "${step.kind}" mistake cannot plausibly cause "${c}" (allowed: ${allowed.join(", ")})`);
      }
    });
    if (step.wrongComps[0] === step.wrongComps[1]) flag("complication_duplicate", "both wrong choices trigger the same complication");

    step.effects?.forEach((e) => {
      if (e?.repair && !repairs[e.repair]) flag("repair_missing", `a choice demands repair "${e.repair}", which does not exist`);
    });
  });

  // Every flag a step waits on must be settable by some choice or finished repair.
  const settable = new Set<string>([
    ...all.flatMap(({ step }) => (step.effects ?? []).flatMap((e) => e?.set ?? [])),
    ...Object.values(repairs).flatMap((r) => r.done?.set ?? []),
  ]);
  all.forEach(({ step, at, where }) => {
    const used = [...(step.when?.all ?? []), ...(step.when?.any ?? []), ...(step.when?.none ?? [])];
    used.filter((f) => !settable.has(f)).forEach((f) =>
      flags.push({ bankId: bank.id, stepIndex: at, kind: step.kind, title: `${where}${step.title}`, reason: "flag_unreachable", detail: `condition uses flag "${f}", which nothing ever sets` })
    );
  });
  // Every repair operation must be reachable and a real operation.
  const demanded = new Set(all.flatMap(({ step }) => (step.effects ?? []).map((e) => e?.repair).filter(Boolean) as string[]));
  for (const [id, r] of Object.entries(repairs)) {
    if (!demanded.has(id)) flags.push({ bankId: bank.id, stepIndex: 0, kind: "repair", title: r.title, reason: "repair_unreachable", detail: `no mistake leads to repair "${id}"` });
    if (r.steps.length < 2) flags.push({ bankId: bank.id, stepIndex: 0, kind: "repair", title: r.title, reason: "repair_too_short", detail: "a repair needs at least two steps" });
  }

  const share = correctLongest / Math.max(all.length, 1);
  if (share > MAX_CORRECT_LONGEST_SHARE || share < MIN_CORRECT_LONGEST_SHARE) {
    flags.push({
      bankId: bank.id,
      stepIndex: 0,
      kind: "bank",
      title: "(whole bank)",
      reason: "length_tell",
      detail: `the correct option is the longest in ${(share * 100).toFixed(0)}% of steps (allowed ${MIN_CORRECT_LONGEST_SHARE * 100}–${MAX_CORRECT_LONGEST_SHARE * 100}%)`,
    });
  }
  return flags;
}

export function auditBank(bank: ProcedureBank): AuditFlag[] {
  const flags: AuditFlag[] = [];
  const steps = buildStockSteps(bank);
  const risks: string[] = (bank.spec as any).risks || [];
  let maxPhase = -1;

  steps.forEach((step, i) => {
    const raw = bank.steps[i] as any;
    const kind = raw?.kind || "?";
    const isTemplate = raw && typeof raw.f === "object" && raw.f !== null;

    if (isTemplate) {
      // Template steps whose generic response is a deliberate, kind-appropriate
      // action (closure/bleed/vitals/…) are exempt.
      if (INTRINSICALLY_GENERIC_KINDS.has(kind)) return;

      const correct = step.choices.find((c) => c.isCorrect);
      if (!correct) return;

      const tw = contentWords(`${step.title} ${step.description || ""}`);
      const cw = contentWords(correct.text);
      const overlap = tw.filter((w) => cw.includes(w));
      if (tw.length >= 2 && overlap.length <= 1) {
        flags.push({
          bankId: bank.id,
          stepIndex: i + 1,
          kind,
          title: step.title,
          reason: "template_mismatch",
          detail: `correct choice "${correct.text.slice(0, 90)}" shares only [${overlap.join(", ")}] content words with the step's title/description`,
        });
      }
      return;
    }

    // Every wrong choice must name a valid complication declared by the bank.
    for (const c of step.choices.filter((c) => !c.isCorrect)) {
      if (!c.complication) continue;
      if (!VALID_COMPLICATIONS.has(c.complication)) {
        flags.push({
          bankId: bank.id,
          stepIndex: i + 1,
          kind,
          title: step.title,
          reason: "complication_invalid",
          detail: `wrong choice triggers unknown complication "${c.complication}"`,
        });
      } else if (!risks.includes(c.complication) && !UNIVERSAL_COMPS.has(c.complication)) {
        flags.push({
          bankId: bank.id,
          stepIndex: i + 1,
          kind,
          title: step.title,
          reason: "complication_not_in_risks",
          detail: `wrong choice triggers "${c.complication}" but the bank's risks are [${risks.join(", ")}] — add it or fix the choice`,
        });
      }
    }
    const wrongComps = step.choices.filter((c) => !c.isCorrect).map((c) => c.complication).filter(Boolean);
    if (wrongComps.length === 2 && wrongComps[0] === wrongComps[1]) {
      flags.push({
        bankId: bank.id,
        stepIndex: i + 1,
        kind,
        title: step.title,
        reason: "complication_duplicate",
        detail: `both wrong choices trigger the same complication "${wrongComps[0]}" — make the choice meaningful`,
      });
    }

    // The step's surgical phase must not go backwards.
    const phase = KIND_PHASE[kind];
    if (phase !== undefined) {
      if (phase < maxPhase) {
        flags.push({
          bankId: bank.id,
          stepIndex: i + 1,
          kind,
          title: step.title,
          reason: "phase_descent",
          detail: `kind "${kind}" (phase ${phase}) appears after a phase-${maxPhase} step — out of surgical order`,
        });
      } else {
        maxPhase = Math.max(maxPhase, phase);
      }
    }

    // Explicit-choice steps: all options must be distinct, and a wrong option
    // must not duplicate the correct one.
    const texts = step.choices.map((c) => c.text.trim());
    const seen = new Map<string, number>();
    texts.forEach((t, j) => {
      const prev = seen.get(t);
      if (prev !== undefined) {
        flags.push({
          bankId: bank.id,
          stepIndex: i + 1,
          kind,
          title: step.title,
          reason: "duplicate_option",
          detail: `choices ${prev + 1} and ${j + 1} are identical: "${t.slice(0, 80)}"`,
        });
      } else {
        seen.set(t, j);
      }
    });
    const correct = step.choices.find((c) => c.isCorrect);
    if (correct) {
      const wrongDup = step.choices.find((c) => !c.isCorrect && c.text.trim() === correct.text.trim());
      if (wrongDup) {
        flags.push({
          bankId: bank.id,
          stepIndex: i + 1,
          kind,
          title: step.title,
          reason: "duplicate_option",
          detail: `a wrong option duplicates the correct one: "${correct.text.slice(0, 80)}"`,
        });
      }
    }
  });

  return flags;
}

export function auditAllBanks(): AuditFlag[] {
  return Object.values(STOCK_STEP_BANKS).flatMap((bank) => auditBank(bank as ProcedureBank));
}

export function auditAllTailoredBanks(): AuditFlag[] {
  return Object.values(STOCK_STEP_BANKS)
    .filter((bank) => TAILORED_BANKS.has(bank.id))
    .flatMap((bank) => auditTailoredBank(bank as ProcedureBank));
}
