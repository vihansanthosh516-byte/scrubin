import { describe, it, expect } from "vitest";
import type { ProcedureBank, StepDef } from "./stockSteps/stepBuilder";
import { startCase, currentStep, chooseCorrect, chooseWrong, afterRescue, defaultPath, projectedLength, type CaseState } from "./caseRunner";

const spec = {
  approach: "a", wrongApproaches: ["b", "c"], landmark: "l", wrongLandmarks: ["m", "n"], vessel: "v", wrongVessels: ["w", "x"],
  nerve: "n", wrongNerves: ["o", "p"], structure: "s", wrongStructures: ["t", "u"], test: "t", wrongTests: ["y", "z"],
  risks: ["hemorrhage", "infection"], instrument: "i", position: "p", wrongPositions: ["q", "r"], detail: "d",
};
const step = (title: string, extra: Partial<StepDef> = {}): StepDef => ({
  kind: "core",
  title,
  description: title,
  choices: [`${title} right`, `${title} wrong1`, `${title} wrong2`],
  feedback: ["ok", "bad1", "bad2"],
  wrongComps: ["hemorrhage", "infection"],
  ...extra,
});

const BANK: ProcedureBank = {
  id: "demo",
  spec,
  steps: [
    step("Open"),
    step("Cut", { effects: [null, { repair: "tear", set: ["torn"] }, { repair: "bleed" }] }),
    step("Tie base", { when: { none: ["resected"] } }),
    step("Check anastomosis", { when: { all: ["resected"] } }),
    step("Close"),
  ],
  repairs: {
    tear: {
      title: "Repair a tear",
      then: "next",
      done: { set: ["resected"] },
      steps: [step("Clamp the tear"), step("Resect", { effects: [null, { repair: "bleed" }, null] })],
    },
    bleed: { title: "Control bleeding", then: "redo", steps: [step("Press"), step("Tie vessel")] },
  },
};

const title = (s: CaseState) => currentStep(BANK, s)?.step.title;
const pick = (s: CaseState, which: 0 | 1 | 2) => {
  const choices = currentStep(BANK, s)!.step.choices;
  const texts = choices.map((c) => c.text);
  const t = texts.find((x) => new RegExp(`\\b${which === 0 ? "right" : which === 1 ? "wrong1" : "wrong2"}\\b`).test(x))!;
  return choices.find((c) => c.text === t)!;
};

describe("caseRunner", () => {
  it("plays the main operation in order, skipping steps whose condition fails", () => {
    expect(defaultPath(BANK)).toEqual(["Open", "Cut", "Tie base", "Close"]);
  });

  it("a major mistake runs its repair after the rescue, then the rest of the case follows the new state", () => {
    let s = startCase(BANK, "t");
    s = chooseCorrect(BANK, s, pick(s, 0));
    expect(title(s)).toBe("Cut");
    s = chooseWrong(BANK, s, pick(s, 1));
    expect(title(s)).toBe("Cut"); // still waiting on the rescue
    s = afterRescue(BANK, s, { spontaneous: false });
    expect(s.notes).toEqual(["🔧 Emergency repair: Repair a tear"]);
    expect(currentStep(BANK, s)!.repairTitle).toBe("Repair a tear");
    expect(title(s)).toBe("Clamp the tear");
    s = chooseCorrect(BANK, s, pick(s, 0));
    s = chooseCorrect(BANK, s, pick(s, 0));
    expect(s.notes).toEqual(["✅ Repair complete: Repair a tear"]);
    expect(s.flags).toEqual(expect.arrayContaining(["torn", "resected"]));
    // "next": moves past Cut; "Tie base" no longer applies after a resection.
    expect(title(s)).toBe("Check anastomosis");
  });

  it('"redo" repairs return to the step that went wrong', () => {
    let s = startCase(BANK, "t");
    s = chooseCorrect(BANK, s, pick(s, 0));
    s = chooseWrong(BANK, s, pick(s, 2));
    s = afterRescue(BANK, s, { spontaneous: false });
    expect(title(s)).toBe("Press");
    s = chooseCorrect(BANK, s, pick(s, 0));
    s = chooseCorrect(BANK, s, pick(s, 0));
    expect(title(s)).toBe("Cut");
    expect(currentStep(BANK, s)!.depth).toBe(0);
  });

  it("mistakes inside a repair open nested repairs, which unwind back into the outer repair", () => {
    let s = startCase(BANK, "t");
    s = chooseCorrect(BANK, s, pick(s, 0));
    s = chooseWrong(BANK, s, pick(s, 1));
    s = afterRescue(BANK, s, { spontaneous: false });
    s = chooseCorrect(BANK, s, pick(s, 0)); // Clamp the tear
    expect(title(s)).toBe("Resect");
    s = chooseWrong(BANK, s, pick(s, 1)); // bleeds during the resection
    s = afterRescue(BANK, s, { spontaneous: false });
    expect(currentStep(BANK, s)!.depth).toBe(2);
    expect(title(s)).toBe("Press");
    s = chooseCorrect(BANK, s, pick(s, 0));
    s = chooseCorrect(BANK, s, pick(s, 0));
    expect(title(s)).toBe("Resect"); // redo inside the outer repair
    expect(currentStep(BANK, s)!.repairTitle).toBe("Repair a tear");
  });

  it("minor mistakes move on after the rescue; spontaneous deterioration keeps the step", () => {
    let s = startCase(BANK, "t");
    s = chooseWrong(BANK, s, pick(s, 1));
    s = afterRescue(BANK, s, { spontaneous: false });
    expect(title(s)).toBe("Cut");
    s = afterRescue(BANK, s, { spontaneous: true });
    expect(title(s)).toBe("Cut");
  });

  it("finishes after the last step and counts every step answered", () => {
    let s = startCase(BANK, "t");
    let n = 0;
    while (!s.finished) {
      s = chooseCorrect(BANK, s, pick(s, 0));
      n++;
    }
    expect(n).toBe(4);
    expect(s.played).toBe(4);
    expect(currentStep(BANK, s)).toBeNull();
  });

  it("projects the case length from the current state", () => {
    let s = startCase(BANK, "t");
    expect(projectedLength(BANK, s)).toBe(4);
    s = chooseCorrect(BANK, s, pick(s, 0));
    s = chooseWrong(BANK, s, pick(s, 1)); // opens the 2-step tear repair, which removes "Tie base" and adds "Check anastomosis"
    expect(projectedLength(BANK, s)).toBe(2 + 2 + 2);
    s = afterRescue(BANK, s, { spontaneous: false });
    expect(projectedLength(BANK, s)).toBe(6);
  });

  it("shows the same option order for a step throughout a case", () => {
    const s = startCase(BANK, "seed-1");
    const a = currentStep(BANK, s)!.step.choices.map((c) => c.text);
    const b = currentStep(BANK, s)!.step.choices.map((c) => c.text);
    expect(a).toEqual(b);
    expect(currentStep(BANK, s)!.step.choices[0].isCorrect).toBe(false);
  });
});

describe("caseRunner — branches opened by a correct call", () => {
  const B: ProcedureBank = {
    ...BANK,
    steps: [step("Diagnose", { effects: [{ repair: "manage" }, null, null] }), step("Discharge")],
    repairs: { manage: { title: "Manage the leak", label: "Complication management", then: "next", steps: [step("Drain"), step("Stent")] } },
  };
  it("enters the pathway right away and returns to the main case after it", () => {
    let s = startCase(B, "t");
    const correct = currentStep(B, s)!.step.choices.find((c) => c.isCorrect)!;
    s = chooseCorrect(B, s, correct);
    expect(currentStep(B, s)!.step.title).toBe("Drain");
    expect(currentStep(B, s)!.repairLabel).toBe("Complication management");
    expect(s.notes).toEqual(["🔧 Complication management: Manage the leak"]);
    const next = (st: CaseState) => chooseCorrect(B, st, currentStep(B, st)!.step.choices.find((c) => c.isCorrect)!);
    s = next(next(s));
    expect(currentStep(B, s)!.step.title).toBe("Discharge");
    expect(s.notes).toEqual(["✅ Complication management complete: Manage the leak"]);
  });
});
