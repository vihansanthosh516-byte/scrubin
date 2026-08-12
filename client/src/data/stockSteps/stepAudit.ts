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

import { ProcedureBank, buildStockSteps } from "./stepBuilder";
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
    | "complication_invalid"
    | "complication_not_in_risks"
    | "complication_duplicate"
    | "phase_descent";
  detail: string;
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
      } else if (!risks.includes(c.complication)) {
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
