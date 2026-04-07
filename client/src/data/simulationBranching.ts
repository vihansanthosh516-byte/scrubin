import type { ComplicationType } from "../lib/vitals";

/** Returned from consequence decisions to resume the main case line after a correct fix. */
export type ResumeNext = "resume";

export type BranchingOption = {
  id: string;
  label: string;
  desc: string;
  correct: boolean;
  consequence?: string;
  complicationType?: ComplicationType;
  nextDecisionIfCorrect?: number | ResumeNext;
  nextDecisionIfWrong?: number;
};

export type BranchingDecision = {
  id: number;
  phase: number;
  question: string;
  context: string;
  options: BranchingOption[];
};

/**
 * Unique consequence branch id per complication (10_001–10_010).
 * Implemented as a switch so production bundles cannot drop “unused” object keys
 * when the only reads are dynamic (e.g. obj[complicationType]).
 */
export function getConsequenceDecisionIdForComplication(
  type: ComplicationType | string | undefined | null
): number | undefined {
  if (type == null || type === "" || type === "NONE") return undefined;
  switch (type as ComplicationType) {
    case "HEMORRHAGE":
      return 10_001;
    case "ANESTHESIA_OVERDOSE":
      return 10_002;
    case "ANESTHESIA_UNDERDOSE":
      return 10_003;
    case "BOWEL_PERFORATION":
      return 10_004;
    case "NERVE_DAMAGE":
      return 10_005;
    case "PNEUMOTHORAX":
      return 10_006;
    case "CARDIAC_INJURY":
      return 10_007;
    case "WRONG_INCISION_SITE":
      return 10_008;
    case "MALIGNANT_HYPERTHERMIA":
      return 10_009;
    case "WRONG_DIAGNOSIS":
      return 10_010;
    default:
      return undefined;
  }
}

const RESUME: ResumeNext = "resume";

function consequenceDecisionDetailed(
  id: number,
  complication: ComplicationType,
  question: string,
  context: string,
  correct: { label: string; desc: string },
  wrong1: { label: string; desc: string },
  wrong2: { label: string; desc: string },
  wrong3: { label: string; desc: string }
): BranchingDecision {
  return {
    id,
    phase: 0,
    question,
    context,
    options: [
      { id: "a", label: correct.label, desc: correct.desc, correct: true, nextDecisionIfCorrect: RESUME },
      { id: "b", label: wrong1.label, desc: wrong1.desc, correct: false, complicationType: complication },
      { id: "c", label: wrong2.label, desc: wrong2.desc, correct: false, complicationType: complication },
      { id: "d", label: wrong3.label, desc: wrong3.desc, correct: false, complicationType: complication }
    ]
  };
}

/** Medically specific follow-up decisions per complication type (shared across procedures). */
export function getConsequenceDecisions(): BranchingDecision[] {
  return [
    consequenceDecisionDetailed(
      10_001,
      "HEMORRHAGE",
      "Arterial bleeding on the field",
      "You have nicked a visceral artery — brisk, pulsatile, bright-red bleeding is pooling faster than suction clears. Heart rate is climbing and the blood pressure is drifting down.",
      {
        label: "Direct pressure with lap pads, announce blood loss, activate massive transfusion if indicated, and widen exposure before any clip attempt",
        desc: "Stabilize perfusion first, then obtain visualization for a controlled repair or ligation."
      },
      {
        label: "Attempt to blindly clamp or blindly stick a clip “where it looks red”",
        desc: "High risk of collateral injury, incomplete hemostasis, and worsening blood loss."
      },
      {
        label: "Ignore it and continue the planned dissection to “save time”",
        desc: "Uncontrolled hemorrhage will progress to shock and arrest."
      },
      {
        label: "Close the fascia and plan to “observe in PACU”",
        desc: "Leaving the OR without source control in active hemorrhage is catastrophic."
      }
    ),
    consequenceDecisionDetailed(
      10_002,
      "ANESTHESIA_OVERDOSE",
      "Hypoventilation / anesthetic over-depth",
      "End-tidal agent is high, tidal volumes are shallow, and SpO2 is trending down with a slowing respiratory rate — pattern consistent with excessive anesthetic depth and inadequate ventilation.",
      {
        label: "Reduce volatile/sevoflurane (or propofol rate), hand-ventilate with 100% O2, and communicate with anesthesia for reversal adjuncts if benzodiazepine/opioid-related",
        desc: "Treat hypoventilation and remove precipitants; prepare for airway support escalation if needed."
      },
      {
        label: "Give only a crystalloid bolus and continue the same anesthetic depth",
        desc: "Fluids do not reverse respiratory depression from anesthetic overdose."
      },
      {
        label: "Deepen anesthesia further to “relax” the patient",
        desc: "Worsens apnea, hypercapnia, and cardiovascular collapse."
      },
      {
        label: "Extubate emergently in the middle of instability",
        desc: "Loss of airway control during respiratory failure is life-threatening."
      }
    ),
    consequenceDecisionDetailed(
      10_003,
      "ANESTHESIA_UNDERDOSE",
      "Light anesthesia / sympathetic surge",
      "The patient is coughing against the ventilator, hypertensive, and tearing — movement risks injury while you are in a critical step.",
      {
        label: "Communicate with anesthesia to deepen anesthetic, ensure adequate paralysis if appropriate, and pause the surgical maneuver until conditions are safe",
        desc: "Restore depth and immobility before continuing sharp or energy-based steps."
      },
      {
        label: "Extubate to “let them breathe on their own” mid-case",
        desc: "Unsafe during general anesthesia with an open field."
      },
      {
        label: "Paralyze without addressing anesthetic depth",
        desc: "Paralysis without amnesia/analgesia risks awareness and hemodynamic swings."
      },
      {
        label: "Proceed with cautery dissection while the patient is bucking",
        desc: "Movement during energy device use risks massive soft-tissue or vascular injury."
      }
    ),
    consequenceDecisionDetailed(
      10_004,
      "BOWEL_PERFORATION",
      "Enteric spill / feculent contamination",
      "You suspect full-thickness enterotomy or stool contamination — the field smells feculent and there is succus or stool visible.",
      {
        label: "Isolate the injury, control spillage, copiously irrigate, take cultures if indicated, and start broad-spectrum antibiotics with source-control planning",
        desc: "Standard intra-abdominal contamination response to reduce sepsis risk."
      },
      {
        label: "Close fascia over the injury without identifying or repairing it",
        desc: "Traps contamination and guarantees intra-abdominal sepsis."
      },
      {
        label: "Irrigate briefly but skip antibiotics “until cultures return”",
        desc: "Delays coverage in gross contamination increases septic shock risk."
      },
      {
        label: "Apply a drain alone and continue without repair discussion",
        desc: "Drains do not substitute for enteric repair and source control."
      }
    ),
    consequenceDecisionDetailed(
      10_005,
      "NERVE_DAMAGE",
      "Neural structure at risk",
      "There is unexpected neural tissue in the plane, altered motor response, or stimulator feedback suggesting proximity to a major nerve trunk.",
      {
        label: "Stop the maneuver, reassess anatomy, lighten traction, consider neuromonitoring or imaging guidance, and involve senior help if needed",
        desc: "Prevent permanent neurologic deficit before continuing."
      },
      {
        label: "Cauterize through the tissue plane to “get hemostasis quickly”",
        desc: "Thermal injury can transect or permanently injure the nerve."
      },
      {
        label: "Inject local anesthetic into an unclear plane to “see if it stops hurting”",
        desc: "Does not fix injury and may mask evolving deficit."
      },
      {
        label: "Forcefully retract harder to improve exposure",
        desc: "Stretch injury can produce permanent palsy."
      }
    ),
    consequenceDecisionDetailed(
      10_006,
      "PNEUMOTHORAX",
      "Tension physiology / ventilatory failure",
      "Peak pressures are high, breath sounds are diminished on one side, SpO2 is falling, and blood pressure may be unstable — concerning for pneumothorax under positive pressure.",
      {
        label: "Stop nitrous if used, deliver 100% O2, decompress with needle or finger thoracostomy as indicated, and prepare tube thoracostomy",
        desc: "Relieve tension physiology and restore ventilation/perfusion."
      },
      {
        label: "Only increase PEEP aggressively",
        desc: "Can worsen air leak and hemodynamic collapse in tension pneumothorax."
      },
      {
        label: "Delay intervention to complete one more anastomotic throw",
        desc: "Minutes matter; delay risks PEA arrest."
      },
      {
        label: "Give only IV fluid without addressing pleural pressure",
        desc: "Does not treat obstructive shock from tension physiology."
      }
    ),
    consequenceDecisionDetailed(
      10_007,
      "CARDIAC_INJURY",
      "Hemodynamic collapse / unstable rhythm",
      "The rhythm is non-perfusing or unstable with poor pulses — you need coordinated resuscitation immediately.",
      {
        label: "Call for help, start CPR if pulseless, defibrillate if shockable, follow ACLS, and identify reversible causes while preparing advanced support",
        desc: "Standard cardiac emergency response."
      },
      {
        label: "Wait to see if it self-resolves for two minutes",
        desc: "Unacceptable delay during arrest physiology."
      },
      {
        label: "Give a fluid challenge only without addressing rhythm",
        desc: "May help hypovolemia but does not treat VT/VF or complete heart block."
      },
      {
        label: "Resume surgery while CPR is ongoing without coordinating airway/pressors",
        desc: "Divided attention without a resuscitation leader worsens outcomes."
      }
    ),
    consequenceDecisionDetailed(
      10_008,
      "WRONG_INCISION_SITE",
      "Wrong plane / landmarks do not match",
      "The anatomy you see does not match the planned approach — you may be off midline, wrong level, or confusing structures.",
      {
        label: "Stop progression, re-identify surface landmarks, correlate with imaging, and re-orient before any deep dissection",
        desc: "Prevents wrong-level or wrong-structure injury."
      },
      {
        label: "Continue deeper to “find something familiar”",
        desc: "Compounds wrong-plane dissection and risks catastrophic injury."
      },
      {
        label: "Ask the circulator to guess the level while you dissect",
        desc: "Unsafe substitute for surgeon confirmation and imaging."
      },
      {
        label: "Convert to a larger incision blindly without reassessment",
        desc: "More exposure without correcting orientation increases harm."
      }
    ),
    consequenceDecisionDetailed(
      10_009,
      "MALIGNANT_HYPERTHERMIA",
      "Hypermetabolic crisis pattern",
      "Temperature, ETCO2, and heart rate are rising together after volatile anesthetic exposure — think MH until proven otherwise.",
      {
        label: "Stop all triggering agents, hyperventilate with high fresh gas flow, call for dantrolene, treat hyperkalemia/arrhythmias, and cool as indicated",
        desc: "Time-critical MH protocol."
      },
      {
        label: "Give acetaminophen only and continue sevoflurane",
        desc: "Does not stop MH; continued trigger worsens crisis."
      },
      {
        label: "Deepen volatile anesthesia to relax the patient",
        desc: "Additional trigger worsens uncontrolled hypermetabolism."
      },
      {
        label: "Ignore rising ETCO2 as “faulty capnography” without verification",
        desc: "Misses the earliest reliable intraoperative sign."
      }
    ),
    consequenceDecisionDetailed(
      10_010,
      "WRONG_DIAGNOSIS",
      "Clinical picture does not fit the working diagnosis",
      "Objective data and intraoperative findings conflict with your pre-test diagnosis — proceeding risks wrong-site or wrong-patient-level harm.",
      {
        label: "Pause irreversible steps, broaden the differential, obtain targeted labs/imaging/consults, and reassess before continuing",
        desc: "Prevents compounding diagnostic error with surgical error."
      },
      {
        label: "Proceed because the schedule is tight",
        desc: "Expediency over safety — high medicolegal and patient harm risk."
      },
      {
        label: "Ignore conflicting findings as “artifact” without verification",
        desc: "Classic pathway to wrong-procedure outcomes."
      },
      {
        label: "Discharge the concern mentally and commit to the original plan",
        desc: "Anchoring bias in the face of disconfirming evidence."
      }
    )
  ];
}

const CONSEQUENCE_MIN_ID = 10_001;
const CONSEQUENCE_MAX_ID = 10_010;

export function isConsequenceDecisionId(id: number): boolean {
  return id >= CONSEQUENCE_MIN_ID && id <= CONSEQUENCE_MAX_ID;
}

/**
 * Clones main decisions, wires nextDecisionIfCorrect along the original linear order,
 * wires nextDecisionIfWrong to shared consequence IDs, and appends consequence decisions.
 */
export function buildBranchingDecisions(mainInput: BranchingDecision[]): {
  decisions: BranchingDecision[];
  mainlineIds: number[];
} {
  const main: BranchingDecision[] = mainInput.map((d) => ({
    ...d,
    options: d.options.map((o) => ({ ...o }))
  }));
  const mainlineIds = main.map((d) => d.id);

  for (let i = 0; i < main.length; i++) {
    const nextMain = main[i + 1];
    for (const opt of main[i].options) {
      if (opt.correct) {
        opt.nextDecisionIfCorrect = nextMain ? nextMain.id : undefined;
      } else if (opt.complicationType && opt.complicationType !== "NONE") {
        const cid = getConsequenceDecisionIdForComplication(opt.complicationType);
        if (cid != null) {
          opt.nextDecisionIfWrong = cid;
        }
      }
    }
  }

  return {
    decisions: [...main, ...getConsequenceDecisions()],
    mainlineIds
  };
}
