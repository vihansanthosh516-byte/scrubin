import { describe, it, expect } from "vitest";
import { ARCHETYPE_INTERVENTIONS } from "../../../../server/engine/decision/engine";
import { STOCK_STEP_BANKS } from "../stockSteps";
import {
  TAILORED_BANKS,
  DISTRACTOR_TELLS,
  CORRECT_TELLS,
  TELL_MIN_RATIO,
  TELL_MAX_RATIO,
  MAX_CORRECT_LONGEST_SHARE,
  MIN_CORRECT_LONGEST_SHARE,
} from "../stockSteps/stepAudit";
import { CORE_INTERVENTIONS } from "./treats";
import { RESCUE_BANKS, tailorRescue } from "./index";

// Option ids exactly as production Scrubin-Core offered them for a
// cholecystectomy hemorrhage (captured from /api/sim/complicate).
const CORE_HEMORRHAGE_OPTIONS = ["packing", "cautery", "call_anesthesia", "intubate", "ligation", "imaging"].map((id) => ({ id }));
// ...and for an appendectomy anaphylaxis.
const CORE_ANAPHYLAXIS_OPTIONS = ["labs", "imaging", "oxygen_therapy", "call_anesthesia", "consult_specialist", "cricothyroidotomy", "intubate"].map((id) => ({ id }));

describe("Core intervention mirror", () => {
  it("matches the server's intervention table exactly", () => {
    const server = Object.fromEntries(
      Object.values(ARCHETYPE_INTERVENTIONS)
        .flat()
        .map((iv) => [iv.id, { treats: [...iv.treats], correctFeedback: iv.correctFeedback, wrongFeedback: iv.wrongFeedback }])
    );
    expect(CORE_INTERVENTIONS).toEqual(server);
  });
});

describe("tailored rescue content", () => {
  it("covers every complication each tailored surgery can trigger, with at least two rounds", () => {
    const gaps: string[] = [];
    for (const id of TAILORED_BANKS) {
      const risks: string[] = STOCK_STEP_BANKS[id].spec.risks;
      for (const comp of risks) {
        const rounds = RESCUE_BANKS[id]?.[comp];
        if (!rounds || rounds.length < 2) gaps.push(`${id}: ${comp} has ${rounds?.length ?? 0} rounds`);
      }
    }
    expect(gaps).toEqual([]);
  });

  it("resolves every mistake-specific rescue scenario a tailored step names", () => {
    const missing: string[] = [];
    for (const id of TAILORED_BANKS) {
      const bank = STOCK_STEP_BANKS[id];
      const all = [
        ...bank.steps.map((step) => ["main", step] as const),
        ...Object.entries(bank.repairs ?? {}).flatMap(([k, r]) => r.steps.map((step) => [k, step] as const)),
      ];
      for (const [where, step] of all) {
        step.rescueVariants?.forEach((variant, w) => {
          if (!variant) return;
          const key = `${step.wrongComps![w]}:${variant}`;
          const rounds = RESCUE_BANKS[id]?.[key];
          if (!rounds || rounds.length < 2) missing.push(`${id} [${where}] "${step.title}" → ${key}`);
        });
      }
    }
    expect(missing).toEqual([]);
  });

  it("keys every rescue scenario by a real engine complication", () => {
    const valid = new Set(Object.values(CORE_INTERVENTIONS).flatMap((iv) => iv.treats));
    const bad = Object.entries(RESCUE_BANKS).flatMap(([p, bank]) =>
      Object.keys(bank).filter((k) => !valid.has(k.split(":")[0])).map((k) => `${p}: ${k}`)
    );
    expect(bad).toEqual([]);
  });

  it("has no giveaway wording or length tells", () => {
    const flags: string[] = [];
    for (const [procId, bank] of Object.entries(RESCUE_BANKS)) {
      let bestLongest = 0;
      let total = 0;
      for (const [comp, rounds] of Object.entries(bank)) {
        rounds.forEach((r, i) => {
          const at = `${procId} ${comp} round ${i + 1}`;
          total++;
          const decoyLens = r.decoys.map((d) => d.text.length);
          const ratio = r.best.text.length / (decoyLens.reduce((a, b) => a + b, 0) / decoyLens.length);
          if (ratio < TELL_MIN_RATIO || ratio > TELL_MAX_RATIO) flags.push(`${at}: best is ${ratio.toFixed(2)}× the decoy length`);
          if (decoyLens.every((l) => r.best.text.length > l)) bestLongest++;
          r.decoys.forEach((d) => {
            const hit = DISTRACTOR_TELLS.find((re) => re.test(d.text));
            if (hit) flags.push(`${at}: decoy "${d.text.slice(0, 60)}" matches ${hit}`);
          });
          const hit = CORRECT_TELLS.find((re) => re.test(r.best.text));
          if (hit) flags.push(`${at}: best option matches ${hit}`);
          const texts = [r.best.text, ...r.decoys.map((d) => d.text)];
          if (new Set(texts).size !== texts.length) flags.push(`${at}: duplicate option text`);
        });
      }
      const share = bestLongest / total;
      if (share > MAX_CORRECT_LONGEST_SHARE || share < MIN_CORRECT_LONGEST_SHARE) {
        flags.push(`${procId}: best option is longest in ${(share * 100).toFixed(0)}% of rounds`);
      }
    }
    expect(flags).toEqual([]);
  });
});

describe("tailorRescue", () => {
  it("binds one tailored best answer to a Core option that treats the complication", () => {
    const t = tailorRescue(RESCUE_BANKS, "cholecystectomy", "hemorrhage", 0, CORE_HEMORRHAGE_OPTIONS, "decision_cholecystectomy_1")!;
    expect(t).not.toBeNull();
    expect(t.situation).toBe(RESCUE_BANKS.cholecystectomy.hemorrhage[0].situation);
    const correct = t.options.filter((o) => o.correct);
    expect(correct).toHaveLength(1);
    expect(CORE_INTERVENTIONS[correct[0].id].treats).toContain("hemorrhage");
    for (const o of t.options.filter((o) => !o.correct)) {
      expect(CORE_INTERVENTIONS[o.id].treats).not.toContain("hemorrhage");
    }
    expect(new Set(t.options.map((o) => o.id)).size).toBe(t.options.length);
    expect(t.options).toHaveLength(4);
  });

  it("works for anaphylaxis, where Core offers several treating options", () => {
    const t = tailorRescue(RESCUE_BANKS, "appendectomy", "anaphylaxis", 0, CORE_ANAPHYLAXIS_OPTIONS, "decision_appendectomy_1")!;
    expect(t.options.filter((o) => o.correct)).toHaveLength(1);
    expect(t.options).toHaveLength(4);
    expect(t.options.find((o) => o.correct)!.label).toBe(RESCUE_BANKS.appendectomy.anaphylaxis[0].best.text);
  });

  it("keeps a stable order for the same decision and advances rounds, repeating the last", () => {
    const a = tailorRescue(RESCUE_BANKS, "appendectomy", "hemorrhage", 0, CORE_HEMORRHAGE_OPTIONS, "d1")!;
    const b = tailorRescue(RESCUE_BANKS, "appendectomy", "hemorrhage", 0, CORE_HEMORRHAGE_OPTIONS, "d1")!;
    expect(a.options.map((o) => o.id)).toEqual(b.options.map((o) => o.id));
    const last = RESCUE_BANKS.appendectomy.hemorrhage.length - 1;
    const r9 = tailorRescue(RESCUE_BANKS, "appendectomy", "hemorrhage", 9, CORE_HEMORRHAGE_OPTIONS, "d9")!;
    expect(r9.situation).toBe(RESCUE_BANKS.appendectomy.hemorrhage[last].situation);
  });

  it("falls back (null) when there is no content or nothing to bind", () => {
    expect(tailorRescue(RESCUE_BANKS, "whipple", "hemorrhage", 0, CORE_HEMORRHAGE_OPTIONS, "x")).toBeNull();
    expect(tailorRescue(RESCUE_BANKS, "appendectomy", null, 0, CORE_HEMORRHAGE_OPTIONS, "x")).toBeNull();
    expect(tailorRescue(RESCUE_BANKS, "appendectomy", "hemorrhage", 0, [{ id: "imaging" }], "x")).toBeNull();
    expect(tailorRescue(RESCUE_BANKS, "appendectomy", "hemorrhage", 0, [{ id: "ligation" }], "x")).toBeNull();
  });
});
