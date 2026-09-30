// ─────────────────────────────────────────────────────────────────────────────
// Stock-step builder for the ScrubIn simulation.
//
// Each surgery ships an authored step bank (30-40 science-based steps) in
// `beginner.ts` / `intermediate.ts` / `advanced.ts`. This module turns a bank
// into `StockStep[]`:
//   - builds 1 correct + 2 plausible, tonally-neutral distractors per step
//   - hand-authored `choices` (used for the surgery's key decision points)
//     take priority over kind templates
//   - shuffles choice order so the correct answer is never fixed in position 0
// ─────────────────────────────────────────────────────────────────────────────

import type { StockChoice, StockStep } from "../stockProcedures";

export interface StepSpec {
  /** Correct approach/incision, e.g. "a transverse McBurney's point incision" */
  approach: string;
  /** Plausible-but-wrong approaches */
  wrongApproaches: string[];
  /** Key anatomical landmark to confirm */
  landmark: string;
  wrongLandmarks: string[];
  /** Key vessel that must be controlled */
  vessel: string;
  wrongVessels: string[];
  /** Nerve at risk that must be preserved */
  nerve: string;
  wrongNerves: string[];
  /** The principal structure being operated on */
  structure: string;
  wrongStructures: string[];
  /** Key intraoperative verification test */
  test: string;
  wrongTests: string[];
  /** Complication ids this procedure can trigger (subset of the 8 engine types) */
  risks: string[];
  /** Signature instrument used in the case */
  instrument: string;
  /** Correct patient position */
  position: string;
  wrongPositions: string[];
  /** Case-specific context, e.g. "obese 95 kg", "markedly inflamed" */
  detail: string;
}

export type StepKind =
  | "preop"
  | "antibiotic"
  | "position"
  | "access"
  | "exposure"
  | "landmark"
  | "vessel"
  | "nerve"
  | "dissect"
  | "core"
  | "verify"
  | "bleed"
  | "vitals"
  | "closure"
  | "postop"
  | "dvt";

export interface StepDef {
  /** Optional explicit id; defaults to `${bankId}_s${index}` */
  id?: string;
  kind: StepKind;
  title: string;
  /** Several variants: each case picks one (seeded), so repeat cases don't read identically. */
  description: string | string[];
  /** Per-step focus overrides (e.g. a different vessel at a later step) */
  f?: Partial<StepSpec>;
  /** Hand-authored choices: [correct, wrong1, wrong2] — overrides kind template */
  choices?: [string, string, string];
  /** Hand-authored feedback for the 3 choices */
  feedback?: [string, string, string];
  /** Complications triggered by wrong1/wrong2 */
  wrongComps?: [string, string];
  /** What the team sees right after wrong1/wrong2 — shown on the complication banner */
  consequences?: [string, string];
  /**
   * Rescue scenario for wrong1/wrong2 when the general one for that complication
   * would not fit — e.g. "arterial" turns thrombosis into bowel ischemia instead
   * of a DVT. Resolves to the rescue bank key `${complication}:${variant}`.
   */
  rescueVariants?: [string | null, string | null];
  /** Only play this step when the case state matches (see caseRunner). */
  when?: Cond;
  /** Case-state effects of [correct, wrong1, wrong2]. */
  effects?: [ChoiceEffect | null, ChoiceEffect | null, ChoiceEffect | null];
}

/** A condition on the case's flags. Every listed clause must hold. */
export interface Cond {
  all?: string[];
  any?: string[];
  none?: string[];
}

export interface ChoiceEffect {
  /** Flags this choice adds to the case state. */
  set?: string[];
  /** Flags this choice removes. */
  clear?: string[];
  /** A major mistake: after the rescue, run this repair branch before going on. */
  repair?: string;
}

/**
 * The extra operation a major mistake forces on the surgeon (e.g. repairing a
 * torn cecum). Its steps play after the rescue; mistakes inside it can open
 * further repairs. `then` decides where the case resumes: "redo" replays the
 * step that went wrong, "next" moves past it.
 */
export interface RepairBranch {
  title: string;
  /** Badge shown while it runs; defaults to "Emergency repair". */
  label?: string;
  steps: StepDef[];
  done?: { set?: string[]; clear?: string[] };
  then: "redo" | "next";
}

export interface ProcedureBank {
  id: string;
  spec: StepSpec;
  steps: StepDef[];
  /** Repair branches keyed by id, referenced from ChoiceEffect.repair. */
  repairs?: Record<string, RepairBranch>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Choice templates (1 correct + 2 plausible distractors per step kind).
// All options are written with neutral tone and comparable length so the
// correct answer is not identifiable by phrasing.
// ─────────────────────────────────────────────────────────────────────────────

const CHOICE_TEMPLATES: Record<StepKind, (s: StepSpec) => [string, string, string]> = {
  preop: (s) => [
    `Verify the identity band, confirm the marked site, and review the signed consent for ${s.structure}.`,
    `Proceed straight to induction — the team completed the checklist earlier this morning.`,
    `Confirm consent verbally with the circulator but skip the formal time-out.`,
  ],
  antibiotic: (s) => [
    `Infuse the ordered prophylactic antibiotic within 60 minutes of incision.`,
    `Hold antibiotics — this case carries a low contamination risk.`,
    `Start the infusion without re-checking the allergy record — it was reviewed in clinic.`,
  ],
  position: (s) => [
    `Position the patient ${s.position} and pad every pressure point before prepping.`,
    `Position the patient ${s.wrongPositions[0]} to open up the surgical field.`,
    `Skip the extra padding — the operative time is expected to be short.`,
  ],
  access: (s) => [
    `Make ${s.approach} to reach ${s.structure}.`,
    `Make ${s.wrongApproaches[0]} instead for a wider view of the field.`,
    `Start with ${s.wrongApproaches[1]} to keep the scar smaller.`,
  ],
  exposure: (s) => [
    `Place gentle retraction on ${s.landmark} and bring ${s.structure} into view.`,
    `Set self-retaining retractors at full tension to open the field widely.`,
    `Pull firmly on a deep retractor until the anatomy comes into view.`,
  ],
  landmark: (s) => [
    `Confirm ${s.landmark} before dividing anything.`,
    `Use ${s.wrongLandmarks[0]} as the reference and move on.`,
    `Rely on the preoperative imaging to locate it and proceed.`,
  ],
  vessel: (s) => [
    `Isolate, ligate, and divide ${s.vessel} after tracing its full course.`,
    `Run cautery across ${s.wrongVessels[0]} to control it quickly.`,
    `Clip ${s.vessel} as soon as it is seen, before its course is traced.`,
  ],
  nerve: (s) => [
    `Bluntly dissect and preserve ${s.nerve}, keeping it under direct vision.`,
    `Retract ${s.wrongNerves[0]} with a self-retaining retractor for exposure.`,
    `Divide the fascial bands over the nerve without functional testing.`,
  ],
  dissect: (s) => [
    `Dissect in the avascular plane along ${s.landmark}.`,
    `Sweep through the adjacent tissue with cautery to speed the dissection.`,
    `Develop the plane with blunt finger dissection to save time.`,
  ],
  core: (s) => [
    `Proceed with the planned technique on ${s.structure} as rehearsed.`,
    `Switch to a larger, more invasive approach to be safe.`,
    `Adapt the technique to how the tissue looks as you go.`,
  ],
  verify: (s) => [
    `Perform ${s.test} to confirm the repair before closing.`,
    `Trust the visual inspection and move straight to closure.`,
    `Close now and check ${s.test} on the post-op ward round.`,
  ],
  bleed: (s) => [
    `Apply direct pressure, identify the source, and control ${s.vessel} precisely.`,
    `Pack the field and wait for pressure to tamponade the bleeding.`,
    `Spray-coagulate the oozing area until the field is dry.`,
  ],
  vitals: (s) => [
    `Pause the dissection, inform the anesthesia team, and reassess before continuing.`,
    `Continue operating — the vitals will normalize once the step is complete.`,
    `Ask the team to push fluids immediately while you keep dissecting.`,
  ],
  closure: (s) => [
    `Irrigate, confirm hemostasis, and close in layers with the fascia reapproximated.`,
    `Close the skin only — it shortens the case and the wound looks clean.`,
    `Close the layers without irrigating or re-checking hemostasis — the field looked dry.`,
  ],
  postop: (s) => [
    `Order serial monitoring of vitals and ${s.test} per protocol.`,
    `Standard floor monitoring is enough — the case went smoothly.`,
    `Order intensive monitoring for 48 hours regardless of stability.`,
  ],
  dvt: (s) => [
    `Start sequential compression devices and scheduled chemoprophylaxis as ordered.`,
    `Hold DVT prophylaxis — the patient is at low risk for this case.`,
    `Defer prophylaxis until the patient is ambulating.`,
  ],
};

const FEEDBACK_TEMPLATES: Record<StepKind, [string, string, string]> = {
  preop: [
    "Time-out completed; identity, site, and consent verified.",
    "Skipping the checklist misses the allergy review — an unflagged allergen reaches the patient at induction.",
    "Without the formal time-out nobody confirms the prophylactic antibiotic was given, and the wound goes unprotected.",
  ],
  antibiotic: [
    "Prophylactic antibiotic delivered within the 60-minute window.",
    "Holding prophylaxis exposes the wound to avoidable infection.",
    "Skipping the allergy re-check lets an unflagged allergen reach the patient — anaphylaxis follows.",
  ],
  position: [
    "Positioning and padding completed; pressure points protected.",
    "That position compromises exposure or ventilation and risks pressure injury.",
    "Inadequate padding invites preventable positional nerve injury.",
  ],
  access: [
    "The incision provides direct, low-risk access to the target.",
    "That approach violates tissue planes and increases vascular injury risk.",
    "A cosmetic-first incision sacrifices the exposure needed for a safe case.",
  ],
  exposure: [
    "Exposure obtained without trauma to surrounding structures.",
    "Retractors at full tension crush the nerves and vessels under their blades.",
    "Pulling before the anatomy is seen tears vascular attachments out of view.",
  ],
  landmark: [
    "Landmark confirmed; dissection is now safe to proceed.",
    "Using the wrong reference structure invites injury to adjacent anatomy.",
    "Skipping in-field confirmation risks operating on the wrong structure.",
  ],
  vessel: [
    "The vessel is securely ligated with the course fully identified.",
    "Cautery across the wrong vessel risks thermal or hemorrhagic injury.",
    "Blind clipping can injure adjacent structures or incompletely control the vessel.",
  ],
  nerve: [
    "The nerve is preserved under direct vision.",
    "Retraction injury to the nerve risks permanent dysfunction.",
    "Dividing un-tested bands risks irreversible nerve damage.",
  ],
  dissect: [
    "The avascular plane was followed; dissection is clean.",
    "Aggressive cautery through fat risks thermal injury and bleeding.",
    "Finger dissection tears vessels and nerves instead of identifying them.",
  ],
  core: [
    "The planned technique is appropriate for the current anatomy.",
    "Escalating to a larger approach adds morbidity without benefit here.",
    "Changing technique mid-step without a plan increases error risk.",
  ],
  verify: [
    "Verification confirms the repair is sound before closure.",
    "Skipping verification risks discovering a failure after closure.",
    "A failure found on the ward means a return to theater; the check belongs before closure.",
  ],
  bleed: [
    "The bleeding source is controlled precisely.",
    "Packing alone delays definitive control and allows continued loss.",
    "Spray coagulation spreads heat to nearby structures, and the source re-bleeds.",
  ],
  vitals: [
    "The team is aligned and the situation reassessed before proceeding.",
    "Ignoring intraoperative vital changes can allow silent deterioration.",
    "Treating blindly without reassessment risks the wrong intervention.",
  ],
  closure: [
    "Layered closure restores the integrity of each tissue plane.",
    "Skin-only closure leaves dead space and risks dehiscence and infection.",
    "An oozer left unchecked under a closed wound collects into a hematoma and keeps bleeding.",
  ],
  postop: [
    "Post-operative monitoring matches the procedure's risk profile.",
    "Insufficient monitoring can miss early complications.",
    "Excessive monitoring adds cost and delays recovery without benefit.",
  ],
  dvt: [
    "DVT prophylaxis is in place for the operative and recovery period.",
    "Withholding prophylaxis in the perioperative window invites thromboembolism.",
    "Deferring prophylaxis until ambulation misses the highest-risk window — a clot can embolize to the lungs.",
  ],
};

// What each template distractor actually does to the patient, per step kind
// (e.g. "retract the nerve for exposure" injures a nerve, "hold antibiotics"
// infects), most fitting first. The first one the procedure declares in its
// risks wins; the two wrong options never share a complication. Kinds with no
// single mechanism fall back to the procedure's risk list.
const KIND_COMPS: Partial<Record<StepKind, [string[], string[]]>> = {
  preop: [["anaphylaxis"], ["infection"]],
  antibiotic: [["infection"], ["anaphylaxis"]],
  position: [["hypoxia"], ["nerve_injury"]],
  access: [["hemorrhage", "nerve_injury"], ["nerve_injury", "hemorrhage", "infection"]],
  exposure: [["nerve_injury", "hemorrhage"], ["hemorrhage", "nerve_injury"]],
  landmark: [["hemorrhage", "nerve_injury"], ["nerve_injury", "hemorrhage"]],
  vessel: [["hemorrhage"], ["nerve_injury", "thrombosis"]],
  nerve: [["nerve_injury"], ["hemorrhage"]],
  dissect: [["hemorrhage", "nerve_injury"], ["nerve_injury", "hemorrhage"]],
  verify: [["infection", "hemorrhage"], ["hemorrhage", "infection"]],
  bleed: [["hemorrhage"], ["nerve_injury", "thrombosis", "infection"]],
  vitals: [["cardiac_arrhythmia", "hemorrhage", "hypoxia"], ["fluid_overload", "cardiac_arrhythmia", "hypoxia"]],
  closure: [["infection"], ["hemorrhage"]],
  dvt: [["thrombosis"], ["hypoxia"]],
};

function templateComps(kind: StepKind, risks: string[], stepIndex: number): [string, string] {
  // Each template option has a fixed meaning, so its complication comes from
  // the kind's preference list — never a random bank risk (a random draw paired
  // "defer antibiotics" with an arrhythmia and pre-incision steps with bleeding).
  const [prefs1, prefs2] = KIND_COMPS[kind] ?? [[], []];
  const c1 = prefs1.find((c) => risks.includes(c)) ?? prefs1[0] ?? pick(risks, stepIndex);
  const c2 =
    prefs2.find((c) => risks.includes(c) && c !== c1) ??
    prefs2.find((c) => c !== c1) ??
    risks.map((_, i) => pick(risks, stepIndex + 1 + i)).find((c) => c !== c1) ??
    c1;
  return [c1, c2];
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder
// ─────────────────────────────────────────────────────────────────────────────

function mergeSpec(base: StepSpec, overrides?: Partial<StepSpec>): StepSpec {
  return { ...base, ...overrides };
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

// The engine only knows eight complication types, so a ureteric, dural, or
// bladder injury runs as the infection or bleed it leads to. Name the actual
// injury in the crisis banner so the trainee sees what they did.
const NAMED_INJURIES: [RegExp, string, string][] = [
  [/ureter/i, "infection", "Ureteric injury — urine is leaking into the pelvis and an infected urinoma is forming."],
  [/\b(CSF|dural?)\b/i, "infection", "Dural tear with a CSF leak — the leak is tracking out and meningitis is the danger."],
  [/bladder|cystotomy|vesico/i, "infection", "Bladder injury — urine is leaking into the pelvis and the field is contaminated."],
  [/\b(rectum|rectal|bowel|enterotomy|fecal)\b/i, "infection", "Bowel injury — enteric contents are spilling and peritonitis is developing."],
];

function namedInjury(feedback: string, comp: string): string | undefined {
  const hit = NAMED_INJURIES.find(([re, c]) => c === comp && re.test(feedback));
  return hit?.[2];
}

function buildStepChoices(
  step: StepDef,
  spec: StepSpec,
  stepIndex: number,
  stepId: string
): StockChoice[] {
  const s = mergeSpec(spec, step.f);
  const [correct, wrong1, wrong2] = step.choices
    ? step.choices
    : CHOICE_TEMPLATES[step.kind](s);
  // Template steps inherit per-kind feedback, which is identical for every
  // step of that kind in a bank. Prefixing the step's title makes each step's
  // feedback read uniquely in the timeline ("✅ Correct Step: Close the skin —
  // Layered closure restores…") instead of repeating the same line several
  // times per case. Steps with hand-authored feedback are untouched.
  const isTemplate = !step.feedback;
  const [fbCorrect, fbWrong1, fbWrong2] = step.feedback
    ? step.feedback
    : FEEDBACK_TEMPLATES[step.kind];
  const prefix = (fb: string) => `${step.title} — ${fb}`;
  const [comp1, comp2] = step.wrongComps
    ?? (step.choices ? [pick(s.risks, stepIndex), pick(s.risks, stepIndex + 1)] : templateComps(step.kind, s.risks, stepIndex));

  return [
    {
      id: `${stepId}_a`,
      text: correct,
      isCorrect: true,
      complication: "",
      feedback: isTemplate ? prefix(fbCorrect) : fbCorrect,
      effect: step.effects?.[0] ?? undefined,
    },
    {
      id: `${stepId}_b`,
      text: wrong1,
      isCorrect: false,
      complication: comp1,
      feedback: isTemplate ? prefix(fbWrong1) : fbWrong1,
      consequence: step.consequences?.[0] ?? namedInjury(fbWrong1, comp1),
      rescueKey: step.rescueVariants?.[0] ? `${comp1}:${step.rescueVariants[0]}` : undefined,
      effect: step.effects?.[1] ?? undefined,
    },
    {
      id: `${stepId}_c`,
      text: wrong2,
      isCorrect: false,
      complication: comp2,
      feedback: isTemplate ? prefix(fbWrong2) : fbWrong2,
      consequence: step.consequences?.[1] ?? namedInjury(fbWrong2, comp2),
      rescueKey: step.rescueVariants?.[1] ? `${comp2}:${step.rescueVariants[1]}` : undefined,
      effect: step.effects?.[2] ?? undefined,
    },
  ];
}

/** Fisher-Yates shuffle on a copy; guarantees the correct choice is not first. */
function shuffleChoices(choices: StockChoice[], rand: () => number = Math.random): StockChoice[] {
  const arr = [...choices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // The correct answer must never be locked into position 0.
  const correctIdx = arr.findIndex((c) => c.isCorrect);
  if (correctIdx === 0 && arr.length > 1) {
    const swapIdx = 1 + Math.floor(rand() * (arr.length - 1));
    [arr[0], arr[swapIdx]] = [arr[swapIdx], arr[0]];
  }
  return arr;
}

/** Seeded PRNG so a step shows the same option order every render of a case. */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build one step (main-line or repair) with a deterministic option order. */
function pickDescription(d: string | string[], seed: string): string {
  if (typeof d === "string") return d;
  return d[Math.floor(seededRandom(seed)() * d.length)];
}

export function buildStep(bank: ProcedureBank, def: StepDef, stepId: string, stepIndex: number, seed: string): StockStep {
  return {
    id: stepId,
    title: def.title,
    description: pickDescription(def.description, `${seed}:${stepId}:desc`),
    choices: shuffleChoices(buildStepChoices(def, bank.spec, stepIndex, stepId), seededRandom(`${seed}:${stepId}`)),
  };
}

export function buildStockSteps(bank: ProcedureBank): StockStep[] {
  return bank.steps.map((step, i) => {
    const stepId = step.id || `${bank.id}_s${i + 1}`;
    return {
      id: stepId,
      title: step.title,
      description: pickDescription(step.description, `${stepId}:desc`),
      choices: shuffleChoices(buildStepChoices(step, bank.spec, i, stepId)),
    };
  });
}
