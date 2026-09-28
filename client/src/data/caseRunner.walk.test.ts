import { describe, it, expect } from "vitest";
import { STOCK_STEP_BANKS } from "./stockSteps";
import { TAILORED_BANKS } from "./stockSteps/stepAudit";
import { seededRandom } from "./stockSteps/stepBuilder";
import { startCase, currentStep, chooseCorrect, chooseWrong, afterRescue } from "./caseRunner";

// Plays thousands of random cases through each tailored surgery, making
// mistakes at random, the way a struggling trainee would. Every case must end,
// and every repair and every state-dependent step must be reachable.
const RUNS = 3000;
const MAX_STEPS = 400;

describe.each([...TAILORED_BANKS])("random playthroughs: %s", (id) => {
  const bank = STOCK_STEP_BANKS[id];
  const rand = seededRandom(`walk-${id}`);
  const seenRepairs = new Set<string>();
  const seenTitles = new Set<string>();
  let longest = 0;
  let deepest = 0;
  let unfinished = 0;
  const timeTravel = new Set<string>();
  // "Day 2", "on day 4", "day-3" in a description pin the step to a post-op day.
  const dayOf = (text: string) => {
    const m = text.match(/\bday[\s-]?(\d+)\b/i);
    return m ? Number(m[1]) : null;
  };

  for (let run = 0; run < RUNS; run++) {
    // Vary how error-prone the trainee is from run to run.
    const errorRate = [0.05, 0.2, 0.4, 0.7][run % 4];
    let s = startCase(bank, `run-${run}`);
    let n = 0;
    let day = 0;
    let dayStep = "";
    while (!s.finished && n < MAX_STEPS) {
      const cur = currentStep(bank, s)!;
      seenTitles.add(cur.step.title);
      const d = dayOf(cur.step.description);
      if (d !== null) {
        if (d < day) timeTravel.add(`"${dayStep}" (day ${day}) → "${cur.step.title}" (day ${d})`);
        day = d;
        dayStep = cur.step.title;
      }
      deepest = Math.max(deepest, cur.depth);
      const choices = cur.step.choices;
      if (rand() < errorRate) {
        const wrong = choices.filter((c) => !c.isCorrect);
        s = chooseWrong(bank, s, wrong[Math.floor(rand() * wrong.length)]);
        s = afterRescue(bank, s, { spontaneous: false });
      } else {
        s = chooseCorrect(bank, s, choices.find((c) => c.isCorrect)!);
      }
      for (const note of s.notes) {
        const title = note.replace(/^🔧 [^:]+: /, "");
        const key = Object.entries(bank.repairs ?? {}).find(([, r]) => r.title === title)?.[0];
        if (note.startsWith("🔧") && key) seenRepairs.add(key);
      }
      n++;
    }
    if (!s.finished) unfinished++;
    longest = Math.max(longest, n);
  }

  it("every case finishes", () => {
    expect(unfinished).toBe(0);
    expect(longest).toBeLessThan(MAX_STEPS);
  });

  it("every repair can be reached", () => {
    expect([...seenRepairs].sort()).toEqual(Object.keys(bank.repairs ?? {}).sort());
  });

  it("every step, including state-dependent variants, can be reached", () => {
    const all = [...bank.steps, ...Object.values(bank.repairs ?? {}).flatMap((r) => r.steps)].map((s) => s.title);
    expect(all.filter((t) => !seenTitles.has(t))).toEqual([]);
  });

  it("never goes back in time from one step to the next", () => {
    expect([...timeTravel]).toEqual([]);
  });

  it("mistakes cascade into nested repairs", () => {
    expect(deepest).toBeGreaterThanOrEqual(2);
  });
});
