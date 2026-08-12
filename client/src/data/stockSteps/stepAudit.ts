// Content audit for the authored procedure banks, run as a CI check.
//
// Two detectors:
//  1. template_mismatch — a template step (`f:` config) whose generated
//     correct choice shares almost no content with the step's own title or
//     description. This is the class of bug where the lavage step offered
//     verbatim dissection options, and seven more steps were found with it.
//  2. duplicate_option — an explicit-choice step with two identical choices,
//     or a wrong choice that duplicates the correct one.
//
// The template-mismatch detector is deliberately conservative: many template
// steps are *intended* to reuse a generic clinical response (the closure
// template, the bleed template, the exposure template), so its output is
// allowlisted in stepAudit.test.ts. The duplicate-option detector is strict —
// duplicates are always bugs.

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

export interface AuditFlag {
  bankId: string;
  stepIndex: number; // 1-based, for easy reference to the source data
  kind: string;
  title: string;
  reason: "template_mismatch" | "duplicate_option";
  detail: string;
}

export function auditBank(bank: ProcedureBank): AuditFlag[] {
  const flags: AuditFlag[] = [];
  const steps = buildStockSteps(bank);

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
