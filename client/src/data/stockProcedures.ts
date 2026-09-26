import { STOCK_STEP_BANKS, buildStockSteps } from "./stockSteps";

export interface StockChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  complication: string; // Complication to trigger if incorrect choice selected
  feedback: string;
}

export interface StockStep {
  id: string;
  title: string;
  description: string;
  choices: StockChoice[];
}

/**
 * Every registry procedure now ships a 30-40 step authored bank
 * (see ./stockSteps/*). The banks are built with:
 *   - surgery-specific, science-based steps (title/description per step)
 *   - harder, tonally-neutral choices (1 correct + 2 plausible distractors)
 *   - shuffled choice order — the correct answer is never fixed in position 0
 */
export function getStockStepsForProcedure(procId: string, scenario: any): StockStep[] {
  const bank = STOCK_STEP_BANKS[procId];
  if (bank) {
    return buildStockSteps(bank);
  }

  // Fallback for any procedure missing a bank: derive steps from the
  // scenario's phases, with the same correct-answer-not-first guarantee.
  const phases = scenario?.phases || [];
  const generated = phases.length === 0 ? fallbackSteps(procId) : phaseSteps(procId, phases);
  return generated.map((step) => ({ ...step, choices: shuffleChoices(step.choices) }));
}

function fallbackSteps(procId: string): StockStep[] {
  return [
    {
      id: `${procId}_step_1`,
      title: "Intake & Preparation",
      description: "Verify patient information and set up the sterile field.",
      choices: [
        {
          id: `${procId}_1_correct`,
          text: "Perform a time-out safety check and verify the surgical site.",
          isCorrect: true,
          complication: "",
          feedback: "Time-out completed successfully.",
        },
        {
          id: `${procId}_1_wrong`,
          text: "Proceed directly to the procedure without verification.",
          isCorrect: false,
          complication: "infection",
          feedback: "Protocol violation: Sterile and check steps skipped, inducing early site infection.",
        },
      ],
    },
    {
      id: `${procId}_step_2`,
      title: "Access & Main Phase",
      description: "Gain access and perform the core surgical steps.",
      choices: [
        {
          id: `${procId}_2_correct`,
          text: "Identify landmarks and proceed with a structured technique.",
          isCorrect: true,
          complication: "",
          feedback: "Procedure steps completed carefully.",
        },
        {
          id: `${procId}_2_wrong`,
          text: "Cut deep tissue blindly without identifying anatomical landmarks.",
          isCorrect: false,
          complication: "hemorrhage",
          feedback: "Vascular damage: Blind incision severed a major branch, triggering acute hemorrhage.",
        },
      ],
    },
    {
      id: `${procId}_step_3`,
      title: "Wound Closure",
      description: "Irrigate the field and close the surgical layers.",
      choices: [
        {
          id: `${procId}_3_correct`,
          text: "Verify hemostasis, irrigate, and close fascia and skin.",
          isCorrect: true,
          complication: "",
          feedback: "Layered closure completed successfully.",
        },
        {
          id: `${procId}_3_wrong`,
          text: "Close skin only, leaving the deep layers un-sutured.",
          isCorrect: false,
          complication: "infection",
          feedback: "Wound dehiscence: Skin closed over dead space, leading to deep space infection.",
        },
      ],
    },
  ];
}

function phaseSteps(procId: string, phases: any[]): StockStep[] {
  return phases.map((phase: any, index: number) => {
    const isFirst = index === 0;
    const isLast = index === phases.length - 1;

    let choices: StockChoice[] = [];
    if (isFirst) {
      choices = [
        {
          id: `${procId}_${index}_correct`,
          text: `Perform full surgical check-in and verify parameters for ${phase.name}.`,
          isCorrect: true,
          complication: "",
          feedback: `Time-out and prep completed for ${phase.name}.`,
        },
        {
          id: `${procId}_${index}_wrong_inf`,
          text: `Skip check-in and proceed directly to make the incision for ${phase.name}.`,
          isCorrect: false,
          complication: "infection",
          feedback: `Surgical site safety breached. Bacterial contamination risks infection.`,
        },
        {
          id: `${procId}_${index}_wrong_hyp`,
          text: `Induce deep sedation immediately before establishing IV access.`,
          isCorrect: false,
          complication: "hypoxia",
          feedback: `Respiratory depression: Deep sedation without IV backup risks hypoxia.`,
        },
      ];
    } else if (isLast) {
      choices = [
        {
          id: `${procId}_${index}_correct`,
          text: `Perform final hemostasis inspection, irrigate, and perform layered closure.`,
          isCorrect: true,
          complication: "",
          feedback: `Successfully closed the surgical site for ${phase.name}.`,
        },
        {
          id: `${procId}_${index}_wrong_inf`,
          text: `Close the skin with skin glue quickly, ignoring the fascia.`,
          isCorrect: false,
          complication: "infection",
          feedback: `Fascial dehiscence: Dead space left open, leading to deep wound infection.`,
        },
        {
          id: `${procId}_${index}_wrong_thromb`,
          text: `Close layers tightly without checking distal pulses.`,
          isCorrect: false,
          complication: "thrombosis",
          feedback: `Tight closure constricted blood flow, triggering deep venous thrombosis.`,
        },
      ];
    } else {
      choices = [
        {
          id: `${procId}_${index}_correct`,
          text: `Follow normal anatomical landmarks and dissect carefully for ${phase.name}.`,
          isCorrect: true,
          complication: "",
          feedback: `Completed the ${phase.name} phase safely.`,
        },
        {
          id: `${procId}_${index}_wrong_hem`,
          text: `Dissect surrounding tissues rapidly using blind electrocautery.`,
          isCorrect: false,
          complication: "hemorrhage",
          feedback: `Vascular injury: Electrocautery spread burned a hidden arteriole, causing hemorrhage.`,
        },
        {
          id: `${procId}_${index}_wrong_nerve`,
          text: `Apply deep retraction clamps without identifying the nerve courses.`,
          isCorrect: false,
          complication: "nerve_injury",
          feedback: `Nerve neuropraxia: Retraction pressure crushed the nerve bundle.`,
        },
      ];
    }

    return {
      id: `${procId}_step_${index}`,
      title: phase.name,
      description: `Execute the surgical steps for: ${phase.name} (${phase.short} phase).`,
      choices,
    };
  });
}

/** Fisher-Yates shuffle on a copy; guarantees the correct choice is not first. */
function shuffleChoices(choices: StockChoice[]): StockChoice[] {
  const arr = [...choices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const correctIdx = arr.findIndex((c) => c.isCorrect);
  if (correctIdx === 0 && arr.length > 1) {
    const swapIdx = 1 + Math.floor(Math.random() * (arr.length - 1));
    [arr[0], arr[swapIdx]] = [arr[swapIdx], arr[0]];
  }
  return arr;
}
