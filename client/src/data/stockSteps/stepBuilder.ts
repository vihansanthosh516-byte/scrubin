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
  description: string;
  /** Per-step focus overrides (e.g. a different vessel at a later step) */
  f?: Partial<StepSpec>;
  /** Hand-authored choices: [correct, wrong1, wrong2] — overrides kind template */
  choices?: [string, string, string];
  /** Hand-authored feedback for the 3 choices */
  feedback?: [string, string, string];
  /** Complications triggered by wrong1/wrong2 */
  wrongComps?: [string, string];
}

export interface ProcedureBank {
  id: string;
  spec: StepSpec;
  steps: StepDef[];
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
    `Defer antibiotics until after closure to avoid an intraoperative reaction.`,
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
    `Use deep, forceful retractors to open the field as wide as possible.`,
    `Retract blindly until the anatomy becomes visible.`,
  ],
  landmark: (s) => [
    `Confirm ${s.landmark} before dividing anything.`,
    `Use ${s.wrongLandmarks[0]} as the reference and move on.`,
    `Rely on the preoperative imaging and skip in-field landmark confirmation.`,
  ],
  vessel: (s) => [
    `Isolate, ligate, and divide ${s.vessel} after tracing its full course.`,
    `Run cautery across ${s.wrongVessels[0]} to control it quickly.`,
    `Clip ${s.vessel} without full dissection to save time.`,
  ],
  nerve: (s) => [
    `Bluntly dissect and preserve ${s.nerve}, keeping it under direct vision.`,
    `Retract ${s.wrongNerves[0]} with a self-retaining retractor for exposure.`,
    `Divide the fascial bands over the nerve without functional testing.`,
  ],
  dissect: (s) => [
    `Dissect in the avascular plane along ${s.landmark}.`,
    `Sweep through the adjacent tissue with cautery to speed the dissection.`,
    `Bluntly push through the tissue planes to keep moving.`,
  ],
  core: (s) => [
    `Proceed with the planned technique on ${s.structure} as rehearsed.`,
    `Switch to a larger, more invasive approach to be safe.`,
    `Improvise the approach based on how the tissue looks right now.`,
  ],
  verify: (s) => [
    `Perform ${s.test} to confirm the repair before closing.`,
    `Trust the visual inspection and move straight to closure.`,
    `Order ${s.wrongTests[0]} — it provides more definitive information.`,
  ],
  bleed: (s) => [
    `Apply direct pressure, identify the source, and control ${s.vessel} precisely.`,
    `Pack the field and wait for pressure to tamponade the bleeding.`,
    `Cauterize broadly across the oozing area to dry the field.`,
  ],
  vitals: (s) => [
    `Pause the dissection, inform the anesthesia team, and reassess before continuing.`,
    `Continue operating — the vitals will normalize once the step is complete.`,
    `Ask the team to push fluids immediately while you keep dissecting.`,
  ],
  closure: (s) => [
    `Irrigate, confirm hemostasis, and close in layers with the fascia reapproximated.`,
    `Close the skin only — it shortens the case and the wound looks clean.`,
    `Apply skin adhesive over the deeper layers without separate fascial closure.`,
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
    "Skipping the safety check risks wrong-site surgery and protocol violations.",
    "A verbal-only check leaves the formal safety barrier incomplete.",
  ],
  antibiotic: [
    "Prophylactic antibiotic delivered within the 60-minute window.",
    "Holding prophylaxis exposes the wound to avoidable infection.",
    "Post-incision antibiotics are less effective for prophylaxis.",
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
    "Forceful retraction risks crush injury to nerves and vessels.",
    "Blind retraction can tear vascular attachments out of view.",
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
    "Blunt sweeping tears vessels and nerves instead of identifying them.",
  ],
  core: [
    "The planned technique is appropriate for the current anatomy.",
    "Escalating to a larger approach adds morbidity without benefit here.",
    "Improvising mid-case without a clear plan increases error risk.",
  ],
  verify: [
    "Verification confirms the repair is sound before closure.",
    "Skipping verification risks discovering a failure after closure.",
    "The wrong test wastes time and does not answer the surgical question.",
  ],
  bleed: [
    "The bleeding source is controlled precisely.",
    "Packing alone delays definitive control and allows continued loss.",
    "Blind cautery across the field can injure structures and re-bleed.",
  ],
  vitals: [
    "The team is aligned and the situation reassessed before proceeding.",
    "Ignoring intraoperative vital changes can allow silent deterioration.",
    "Treating blindly without reassessment risks the wrong intervention.",
  ],
  closure: [
    "Layered closure restores the integrity of each tissue plane.",
    "Skin-only closure leaves dead space and risks dehiscence and infection.",
    "Adhesive over open deeper layers risks a fascial defect and herniation.",
  ],
  postop: [
    "Post-operative monitoring matches the procedure's risk profile.",
    "Insufficient monitoring can miss early complications.",
    "Excessive monitoring adds cost and delays recovery without benefit.",
  ],
  dvt: [
    "DVT prophylaxis is in place for the operative and recovery period.",
    "Withholding prophylaxis in the perioperative window invites thromboembolism.",
    "Deferring prophylaxis until ambulation misses the highest-risk window.",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Builder
// ─────────────────────────────────────────────────────────────────────────────

function mergeSpec(base: StepSpec, overrides?: Partial<StepSpec>): StepSpec {
  return { ...base, ...overrides };
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
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
  const [fbCorrect, fbWrong1, fbWrong2] = step.feedback
    ? step.feedback
    : FEEDBACK_TEMPLATES[step.kind];
  const [comp1, comp2] = step.wrongComps
    ? step.wrongComps
    : [pick(s.risks, stepIndex), pick(s.risks, stepIndex + 1)];

  return [
    {
      id: `${stepId}_a`,
      text: correct,
      isCorrect: true,
      complication: "",
      feedback: fbCorrect,
    },
    {
      id: `${stepId}_b`,
      text: wrong1,
      isCorrect: false,
      complication: comp1,
      feedback: fbWrong1,
    },
    {
      id: `${stepId}_c`,
      text: wrong2,
      isCorrect: false,
      complication: comp2,
      feedback: fbWrong2,
    },
  ];
}

/** Fisher-Yates shuffle on a copy; guarantees the correct choice is not first. */
function shuffleChoices(choices: StockChoice[]): StockChoice[] {
  const arr = [...choices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // The correct answer must never be locked into position 0.
  const correctIdx = arr.findIndex((c) => c.isCorrect);
  if (correctIdx === 0 && arr.length > 1) {
    const swapIdx = 1 + Math.floor(Math.random() * (arr.length - 1));
    [arr[0], arr[swapIdx]] = [arr[swapIdx], arr[0]];
  }
  return arr;
}

export function buildStockSteps(bank: ProcedureBank): StockStep[] {
  return bank.steps.map((step, i) => {
    const stepId = step.id || `${bank.id}_s${i + 1}`;
    return {
      id: stepId,
      title: step.title,
      description: step.description,
      choices: shuffleChoices(buildStepChoices(step, bank.spec, i, stepId)),
    };
  });
}
