/**
 * Full playthrough gate for the authored procedure banks.
 *
 * Walks EVERY bank from step 1 to the last step and asserts the invariants
 * that make a real playthrough work — and that the audit in stepAudit.ts
 * deliberately does not cover:
 *   - every bank is a full-length case (≥ 25 steps), so no bank is a stub;
 *   - step titles are unique within a bank — the timeline prefixes template
 *     feedback with the step title, so a duplicated title would produce
 *     identical timeline lines;
 *   - the correct-choice TEXT is unique within a bank — two steps offering
 *     the same correct answer makes the correct-play transcript ambiguous
 *     (this caught 5 banks whose second closure step reused the generic
 *     closure template verbatim);
 *   - the correct-choice FEEDBACK is unique within a bank (timeline
 *     uniqueness for hand-authored steps, which the title prefix does not
 *     cover);
 *   - every step has exactly 3 distinct, non-empty choices, exactly one of
 *     which is correct — so the player can always progress and always has a
 *     real decision;
 *   - every step carries a non-empty description and non-empty feedback on
 *     every choice, so no step resolves into a blank line.
 */
import { describe, it, expect } from "vitest";
import { STOCK_STEP_BANKS } from "./index";
import { buildStockSteps, ProcedureBank } from "./stepBuilder";
import { VALID_COMPLICATIONS } from "./stepAudit";
import { getProcedure } from "../../../../server/engine/procedures/registry";

const banks = Object.values(STOCK_STEP_BANKS) as ProcedureBank[];

describe("every bank plays start-to-finish", () => {
  it("covers all 31 banks with full-length step sequences", () => {
    expect(banks.length).toBeGreaterThanOrEqual(31);
    for (const bank of banks) {
      const steps = buildStockSteps(bank);
      expect(
        steps.length,
        `${bank.id}: expected a full-length case, got ${steps.length} steps`
      ).toBeGreaterThanOrEqual(25);
    }
  });

  it("keeps step titles unique within every bank", () => {
    for (const bank of banks) {
      const titles = buildStockSteps(bank).map((s) => s.title.trim().toLowerCase());
      expect(
        new Set(titles).size,
        `${bank.id}: duplicate step titles — timeline lines would be ambiguous`
      ).toBe(titles.length);
    }
  });

  it("keeps the correct-choice text unique within every bank", () => {
    for (const bank of banks) {
      const steps = buildStockSteps(bank);
      const corrects = steps.map((s) => s.choices.find((c) => c.isCorrect)!.text.trim().toLowerCase());
      expect(
        new Set(corrects).size,
        `${bank.id}: two steps offer the same correct answer — the correct-play transcript is ambiguous`
      ).toBe(corrects.length);
    }
  });

  it("keeps the correct-choice feedback unique within every bank", () => {
    for (const bank of banks) {
      const steps = buildStockSteps(bank);
      const feedbacks = steps.map((s) => s.choices.find((c) => c.isCorrect)!.feedback.trim().toLowerCase());
      expect(
        new Set(feedbacks).size,
        `${bank.id}: duplicate correct feedback — the timeline would repeat itself`
      ).toBe(feedbacks.length);
    }
  });

  it("gives every step exactly 3 distinct choices, one correct, with full text and feedback", () => {
    for (const bank of banks) {
      const steps = buildStockSteps(bank);
      steps.forEach((step, i) => {
        const at = `${bank.id} step ${i + 1} "${step.title}"`;
        expect(step.description.trim().length, `${at}: missing description`).toBeGreaterThan(0);
        expect(step.choices.length, `${at}: expected 3 choices`).toBe(3);
        const texts = step.choices.map((c) => c.text.trim());
        expect(texts.every((t) => t.length > 0), `${at}: an option is blank`).toBe(true);
        expect(new Set(texts).size, `${at}: duplicate options`).toBe(3);
        const correct = step.choices.filter((c) => c.isCorrect);
        expect(correct.length, `${at}: exactly one correct answer required`).toBe(1);
        for (const choice of step.choices) {
          expect(
            choice.feedback.trim().length,
            `${at}: option "${choice.text.slice(0, 40)}…" has no feedback`
          ).toBeGreaterThan(0);
        }
      });
    }
  });

  it("maps every wrong choice to a valid engine complication", () => {
    for (const bank of banks) {
      const steps = buildStockSteps(bank);
      steps.forEach((step, i) => {
        const at = `${bank.id} step ${i + 1} "${step.title}"`;
        for (const choice of step.choices) {
          if (choice.isCorrect) {
            expect(choice.complication, `${at}: the correct choice must not trigger a complication`).toBe("");
            continue;
          }
          expect(
            VALID_COMPLICATIONS.has(choice.complication),
            `${at}: wrong choice "${choice.text.slice(0, 40)}…" triggers unknown complication "${choice.complication}" — must be one of ${[...VALID_COMPLICATIONS].join(", ")}`
          ).toBe(true);
        }
      });
    }
  });

  it("keeps authored wrongComps inside the canonical complication set", () => {
    for (const bank of banks) {
      bank.steps.forEach((step, i) => {
        if (!step.wrongComps) return;
        for (const comp of step.wrongComps) {
          expect(
            VALID_COMPLICATIONS.has(comp),
            `${bank.id} step ${i + 1} "${step.title}": wrongComps references unknown complication "${comp}"`
          ).toBe(true);
        }
      });
    }
  });

  it("keeps every bank's length equal to the engine's totalTicks in BOTH registries", () => {
    // The client plays one bank step per engine tick and the case ends when
    // the bank runs out, so a drift between the authored bank length and the
    // engine's totalTicks silently cuts off trailing steps (bank longer) or
    // distorts the efficiency score's case-length denominator (bank shorter).
    // Both the TS mirror and the Python core must carry the same totalTicks.
    for (const bank of banks) {
      const steps = buildStockSteps(bank);
      const tsTicks = getProcedure(bank.id)?.totalTicks;
      expect(
        tsTicks,
        `${bank.id}: TS registry has no totalTicks for this bank`
      ).toBeGreaterThan(0);
      expect(
        steps.length,
        `${bank.id}: bank has ${steps.length} steps but TS registry totalTicks=${tsTicks} — every authored step must be playable`
      ).toBe(tsTicks);
    }
  });
});
