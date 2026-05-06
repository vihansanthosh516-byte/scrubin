import {
  type Vitals,
  type ComplicationType,
  type DecisionArchetypeType,
  type EscalationPhase,
  type TickDecision,
  type DecisionOption,
  type ProcedureDefinition,
  ARCHETYPE_COMPLICATION_MAP,
  COMPLICATION_VITAL_EFFECTS,
  DECISION_ARCHETYPES,
} from "../state/models.js";
import { DeterministicRNG } from "../rng.js";

const ARCHETYPE_PROMPTS: Record<DecisionArchetypeType, { prompt: string; context: string }> = {
  AIRWAY_STABILITY: {
    prompt: "Airway stability is compromised. What intervention do you choose?",
    context: "The patient is showing signs of airway difficulty. SpO2 is trending down. You must act to secure the airway.",
  },
  HEMODYNAMIC_CONTROL: {
    prompt: "Hemodynamic instability detected. How do you respond?",
    context: "Blood pressure and heart rate are outside safe parameters. Hemodynamic control is critical.",
  },
  BLEEDING_CONTROL: {
    prompt: "Active bleeding identified. What is your next step?",
    context: "Surgical bleeding is observed. Immediate hemostasis is required to prevent exsanguination.",
  },
  INFECTION_MANAGEMENT: {
    prompt: "Signs of infection are present. What do you do?",
    context: "The patient is developing signs of surgical site infection or sepsis. Timely intervention is essential.",
  },
  PAIN_MANAGEMENT: {
    prompt: "The patient is in significant pain. How do you manage it?",
    context: "Pain levels are elevated and may interfere with recovery. Choose an appropriate analgesic strategy.",
  },
  DIAGNOSTIC_STEP: {
    prompt: "A diagnostic decision is needed. What do you order?",
    context: "The clinical picture is unclear. You need more information before proceeding. Choose the right diagnostic step.",
  },
  SURGICAL_DECISION: {
    prompt: "A critical surgical decision point. Which approach do you take?",
    context: "You've reached a key surgical decision point. The wrong choice could lead to serious complications.",
  },
  POST_OP_MONITORING: {
    prompt: "Post-operative monitoring required. What do you check first?",
    context: "The patient is in the post-operative period. Early detection of complications saves lives.",
  },
};

interface ArchetypeIntervention {
  id: string;
  label: string;
  treats: ComplicationType[];
  vitalsEffect: Partial<Vitals>;
  riskIfWrong: Partial<Vitals>;
  correctFeedback: string;
  wrongFeedback: string;
}

const ARCHETYPE_INTERVENTIONS: Record<DecisionArchetypeType, ArchetypeIntervention[]> = {
  AIRWAY_STABILITY: [
    {
      id: "intubate",
      label: "Intubate & secure airway",
      treats: ["hypoxia", "anaphylaxis"],
      vitalsEffect: { spo2: +8, heart_rate: -3, respiratory_rate: -4 },
      riskIfWrong: { spo2: -5, heart_rate: +10 },
      correctFeedback: "Airway secured successfully. SpO2 improving.",
      wrongFeedback: "Intubation was unnecessary — caused mild trauma and temporary desaturation.",
    },
    {
      id: "oxygen_therapy",
      label: "Administer supplemental O₂",
      treats: ["hypoxia"],
      vitalsEffect: { spo2: +4, respiratory_rate: -2 },
      riskIfWrong: { spo2: -2 },
      correctFeedback: "Oxygen therapy effective. Saturation improving.",
      wrongFeedback: "O₂ alone is insufficient for this severity. Delayed proper intervention.",
    },
    {
      id: "cricothyroidotomy",
      label: "Emergency cricothyroidotomy",
      treats: ["anaphylaxis", "hypoxia"],
      vitalsEffect: { spo2: +12, heart_rate: -5 },
      riskIfWrong: { spo2: -8, heart_rate: +15 },
      correctFeedback: "Surgical airway established. Patient stabilized.",
      wrongFeedback: "Cricothyroidotomy was overly aggressive. Unnecessary surgical trauma inflicted.",
    },
    {
      id: "call_anesthesia",
      label: "Call for anesthesia support",
      treats: [],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +3 },
      correctFeedback: "Anesthesia team consulted. Additional expertise on the way.",
      wrongFeedback: "Waiting for anesthesia support delayed critical intervention.",
    },
  ],
  HEMODYNAMIC_CONTROL: [
    {
      id: "fluid_resuscitation",
      label: "IV fluid bolus",
      treats: ["hemorrhage", "fluid_overload"],
      vitalsEffect: { bp_systolic: +10, heart_rate: -8 },
      riskIfWrong: { bp_systolic: -5, heart_rate: +5 },
      correctFeedback: "Fluid resuscitation restoring intravascular volume. BP stabilizing.",
      wrongFeedback: "Fluid bolus inappropriate — may be worsening the situation.",
    },
    {
      id: "vasopressor",
      label: "Start vasopressor drip",
      treats: ["cardiac_arrhythmia", "hemorrhage"],
      vitalsEffect: { bp_systolic: +15, heart_rate: +5 },
      riskIfWrong: { heart_rate: +20, bp_systolic: +25 },
      correctFeedback: "Vasopressor support effective. Perfusion improving.",
      wrongFeedback: "Vasopressor started unnecessarily. Causing hypertensive episode.",
    },
    {
      id: "blood_transfusion",
      label: "Transfuse packed RBCs",
      treats: ["hemorrhage"],
      vitalsEffect: { bp_systolic: +12, heart_rate: -10, spo2: +2 },
      riskIfWrong: { bp_systolic: -3, temperature: +0.5 },
      correctFeedback: "Transfusion restoring oxygen-carrying capacity. Vitals improving.",
      wrongFeedback: "Transfusion was not indicated. Risk of transfusion reaction.",
    },
    {
      id: "cardioversion",
      label: "Electrical cardioversion",
      treats: ["cardiac_arrhythmia"],
      vitalsEffect: { heart_rate: -30, bp_systolic: +10 },
      riskIfWrong: { heart_rate: +15, bp_systolic: -10 },
      correctFeedback: "Sinus rhythm restored. Hemodynamics stabilizing.",
      wrongFeedback: "Cardioversion was not the right intervention. Cardiac irritability increased.",
    },
  ],
  BLEEDING_CONTROL: [
    {
      id: "cautery",
      label: "Electrocautery of bleeders",
      treats: ["hemorrhage"],
      vitalsEffect: { bp_systolic: +5, heart_rate: -5 },
      riskIfWrong: { temperature: +0.3 },
      correctFeedback: "Bleeders cauterized. Surgical field is dry.",
      wrongFeedback: "Cautery caused thermal spread to adjacent tissue.",
    },
    {
      id: "ligation",
      label: "Suture ligation of vessel",
      treats: ["hemorrhage"],
      vitalsEffect: { bp_systolic: +8, heart_rate: -8 },
      riskIfWrong: { bp_systolic: -5 },
      correctFeedback: "Vessel ligated securely. Hemostasis achieved.",
      wrongFeedback: "Ligation was unnecessary — no active bleeding vessel found.",
    },
    {
      id: "packing",
      label: "Pack wound temporarily",
      treats: ["hemorrhage"],
      vitalsEffect: { bp_systolic: +3, heart_rate: -3 },
      riskIfWrong: { temperature: +0.5 },
      correctFeedback: "Packing applied. Bleeding controlled for now.",
      wrongFeedback: "Packing introduced without active hemorrhage — infection risk increased.",
    },
    {
      id: "observe_hemostasis",
      label: "Observe for hemostasis",
      treats: [],
      vitalsEffect: {},
      riskIfWrong: { bp_systolic: -8, heart_rate: +8 },
      correctFeedback: "Observation confirms hemostasis. No active bleeding.",
      wrongFeedback: "Observation delayed intervention. Bleeding worsened.",
    },
  ],
  INFECTION_MANAGEMENT: [
    {
      id: "antibiotics_iv",
      label: "IV broad-spectrum antibiotics",
      treats: ["infection"],
      vitalsEffect: { temperature: -0.8, heart_rate: -5 },
      riskIfWrong: { temperature: +0.3 },
      correctFeedback: "Antibiotics initiated. Inflammatory markers should begin improving.",
      wrongFeedback: "Antibiotics given without clear indication. Unnecessary exposure.",
    },
    {
      id: "wound_irrigation",
      label: "Irrigate & debride wound",
      treats: ["infection"],
      vitalsEffect: { temperature: -0.5, heart_rate: -3 },
      riskIfWrong: { bp_systolic: -5 },
      correctFeedback: "Wound thoroughly irrigated. Source control achieved.",
      wrongFeedback: "Irrigation disrupted a clean wound bed unnecessarily.",
    },
    {
      id: "source_control",
      label: "Surgical source control",
      treats: ["infection"],
      vitalsEffect: { temperature: -1.2, heart_rate: -8, bp_systolic: +5 },
      riskIfWrong: { bp_systolic: -10, heart_rate: +10 },
      correctFeedback: "Source control obtained. Sepsis should begin resolving.",
      wrongFeedback: "Surgical exploration was premature. No infectious source found.",
    },
    {
      id: "cultures_first",
      label: "Draw cultures before treating",
      treats: [],
      vitalsEffect: {},
      riskIfWrong: { temperature: +0.5, heart_rate: +5 },
      correctFeedback: "Cultures drawn. Targeted therapy can begin once sensitivities return.",
      wrongFeedback: "Delaying treatment for cultures allowed infection to progress.",
    },
  ],
  PAIN_MANAGEMENT: [
    {
      id: "iv_opioid",
      label: "IV opioid analgesic",
      treats: ["nerve_injury"],
      vitalsEffect: { heart_rate: -8, bp_systolic: -3, respiratory_rate: -2 },
      riskIfWrong: { spo2: -3, respiratory_rate: -4 },
      correctFeedback: "Pain controlled. Patient comfortable and vitals stabilizing.",
      wrongFeedback: "Opioid caused respiratory depression. SpO2 dropping.",
    },
    {
      id: "regional_block",
      label: "Regional nerve block",
      treats: ["nerve_injury"],
      vitalsEffect: { heart_rate: -10, bp_systolic: -5 },
      riskIfWrong: { heart_rate: +5, bp_systolic: -8 },
      correctFeedback: "Regional block effective. Pain well-controlled with minimal systemic effect.",
      wrongFeedback: "Block caused unintended sympathetic blockade. Hypotension developing.",
    },
    {
      id: "nsaid",
      label: "IV NSAID (ketorolac)",
      treats: ["nerve_injury"],
      vitalsEffect: { heart_rate: -4, temperature: -0.2 },
      riskIfWrong: { bp_systolic: +5 },
      correctFeedback: "NSAID providing adjunct pain relief. Anti-inflammatory effect helpful.",
      wrongFeedback: "NSAID contraindicated in this scenario. May worsen bleeding risk.",
    },
    {
      id: "non_pharmacologic",
      label: "Non-pharmacologic pain management",
      treats: [],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +5 },
      correctFeedback: "Non-pharmacologic measures adequate for current pain level.",
      wrongFeedback: "Pain too severe for non-pharmacologic measures alone. Patient distress increasing.",
    },
  ],
  DIAGNOSTIC_STEP: [
    {
      id: "imaging",
      label: "Order imaging (CT/X-ray)",
      treats: ["thrombosis", "nerve_injury"],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +3 },
      correctFeedback: "Imaging reveals the key finding. Diagnosis clarified.",
      wrongFeedback: "Imaging was non-contributory. Time and resources wasted.",
    },
    {
      id: "labs",
      label: "Draw stat labs (ABG, CBC, CMP)",
      treats: ["infection", "thrombosis"],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +2 },
      correctFeedback: "Lab results confirm the clinical suspicion. Appropriate treatment can begin.",
      wrongFeedback: "Labs were unnecessary at this point. No actionable findings.",
    },
    {
      id: "exploration",
      label: "Surgical exploration",
      treats: ["infection", "nerve_injury"],
      vitalsEffect: { heart_rate: +5, bp_systolic: -3 },
      riskIfWrong: { bp_systolic: -8, heart_rate: +10 },
      correctFeedback: "Exploration reveals the problem. Direct visualization confirms diagnosis.",
      wrongFeedback: "Exploration was premature. No pathology found, and surgical trauma added.",
    },
    {
      id: "consult_specialist",
      label: "Consult specialist for opinion",
      treats: [],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +2 },
      correctFeedback: "Specialist input clarifies the diagnosis. Correct pathway identified.",
      wrongFeedback: "Waiting for consult delayed critical decision-making.",
    },
  ],
  SURGICAL_DECISION: [
    {
      id: "proceed",
      label: "Proceed with planned approach",
      treats: ["hemorrhage", "nerve_injury"],
      vitalsEffect: { heart_rate: +3 },
      riskIfWrong: { heart_rate: +8, bp_systolic: -5 },
      correctFeedback: "Planned approach is appropriate. Proceeding safely.",
      wrongFeedback: "The planned approach is not safe given current conditions. Complication risk rising.",
    },
    {
      id: "modify",
      label: "Modify surgical approach",
      treats: ["thrombosis", "nerve_injury"],
      vitalsEffect: { heart_rate: -2 },
      riskIfWrong: { heart_rate: +5, bp_systolic: -3 },
      correctFeedback: "Modified approach avoids the danger zone. Good surgical judgment.",
      wrongFeedback: "Modification was unnecessary. The original approach was safer.",
    },
    {
      id: "abort",
      label: "Abort / staged procedure",
      treats: ["hemorrhage", "thrombosis"],
      vitalsEffect: { heart_rate: -5, bp_systolic: +5 },
      riskIfWrong: { heart_rate: +10, bp_systolic: -5 },
      correctFeedback: "Correct call to abort. Patient safety prioritized over completing the case.",
      wrongFeedback: "Aborting was premature. The case could have been completed safely.",
    },
    {
      id: "request_assistance",
      label: "Request senior surgeon assistance",
      treats: [],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +5 },
      correctFeedback: "Senior assistance improves outcome. Second opinion confirms approach.",
      wrongFeedback: "Waiting for assistance consumed critical time.",
    },
  ],
  POST_OP_MONITORING: [
    {
      id: "vitals_check",
      label: "Close vitals monitoring (q15min)",
      treats: ["infection", "fluid_overload"],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +5 },
      correctFeedback: "Close monitoring detected the change early. Intervention initiated promptly.",
      wrongFeedback: "Over-monitoring is tying up resources. Standard frequency is sufficient.",
    },
    {
      id: "doppler",
      label: "Doppler ultrasound for DVT",
      treats: ["thrombosis"],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +3 },
      correctFeedback: "Doppler caught the clot early. Anticoagulation started.",
      wrongFeedback: "Doppler was negative. Unnecessary study performed.",
    },
    {
      id: "serial_labs",
      label: "Serial labs (q6h Hgb, lactate)",
      treats: ["infection", "fluid_overload", "hemorrhage"],
      vitalsEffect: {},
      riskIfWrong: { temperature: +0.2 },
      correctFeedback: "Serial labs trending in the right direction. Continue current management.",
      wrongFeedback: "Serial labs show no change. Unnecessary blood draws.",
    },
    {
      id: "icu_transfer",
      label: "Transfer to ICU for monitoring",
      treats: [],
      vitalsEffect: {},
      riskIfWrong: { heart_rate: +3 },
      correctFeedback: "ICU transfer appropriate for this risk level. Close observation initiated.",
      wrongFeedback: "ICU transfer was unnecessary. Floor monitoring is sufficient.",
    },
  ],
};

export class DecisionEngine {
  private rng: DeterministicRNG;
  private procedure: ProcedureDefinition;
  private decisionCounter = 0;

  constructor(rng: DeterministicRNG, procedure: ProcedureDefinition) {
    this.rng = rng;
    this.procedure = procedure;
  }

  generateDecision(
    tick: number,
    vitals: Vitals,
    escalationPhase: EscalationPhase,
    activeComplication: ComplicationType | null,
    procedurePhase: string
  ): TickDecision {
    const archetypes = this.procedure.decisionArchetypes;
    const archetype = activeComplication
      ? this.pickArchetypeForComplication(archetypes, activeComplication)
      : this.rng.pick(archetypes);

    const promptData = ARCHETYPE_PROMPTS[archetype];
    const interventions = ARCHETYPE_INTERVENTIONS[archetype];

    const options: DecisionOption[] = interventions.map((iv) => ({
      id: iv.id,
      label: iv.label,
      archetype,
      correctForComplications: iv.treats,
      effectOnVitals: iv.vitalsEffect,
      riskIfWrong: iv.riskIfWrong,
      feedback: { correct: iv.correctFeedback, wrong: iv.wrongFeedback },
    }));

    if (options.length !== 4) {
      throw new Error(`DecisionEngine: archetype ${archetype} produced ${options.length} options, expected exactly 4`);
    }

    this.shuffleArray(options);

    const urgency = this.computeUrgency(vitals, activeComplication, escalationPhase);

    this.decisionCounter++;
    const id = `decision_${this.procedure.id}_${this.decisionCounter}`;

    return {
      id,
      tick,
      phase: escalationPhase,
      phaseLabel: this.getEscalationLabel(escalationPhase),
      procedurePhase,
      archetype,
      prompt: this.contextualizePrompt(promptData.prompt, vitals, activeComplication),
      context: promptData.context,
      options,
      urgency,
    };
  }

  evaluateDecision(
    decision: TickDecision,
    optionId: string,
    vitals: Vitals,
    activeComplication: ComplicationType | null
  ): {
    wasCorrect: boolean;
    complicationTriggered: ComplicationType | null;
    vitalsEffect: Partial<Vitals>;
    feedback: string;
    scoreDelta: number;
  } {
    const option = decision.options.find((o) => o.id === optionId);
    if (!option) {
      return {
        wasCorrect: false,
        complicationTriggered: null,
        vitalsEffect: {},
        feedback: "Invalid option selected.",
        scoreDelta: -5,
      };
    }

    let wasCorrect = false;
    if (activeComplication) {
      wasCorrect = option.correctForComplications.includes(activeComplication);
    } else {
      const isLowRisk = Object.values(option.riskIfWrong).every(
        (v) => v === undefined || Math.abs(v) < 8
      );
      wasCorrect = isLowRisk;
    }

    if (wasCorrect) {
      return {
        wasCorrect: true,
        complicationTriggered: null,
        vitalsEffect: option.effectOnVitals,
        feedback: option.feedback.correct,
        scoreDelta: this.computeScoreDelta(decision.urgency, true),
      };
    }

    const possibleComplications = ARCHETYPE_COMPLICATION_MAP[option.archetype];
    const triggerComp = activeComplication
      ? null
      : this.rng.next() < 0.4
        ? this.rng.pick(possibleComplications)
        : null;

    return {
      wasCorrect: false,
      complicationTriggered: triggerComp,
      vitalsEffect: option.riskIfWrong,
      feedback: option.feedback.wrong,
      scoreDelta: this.computeScoreDelta(decision.urgency, false),
    };
  }

  private pickArchetypeForComplication(
    archetypes: DecisionArchetypeType[],
    comp: ComplicationType
  ): DecisionArchetypeType {
    const matching = archetypes.filter((a) =>
      ARCHETYPE_COMPLICATION_MAP[a].includes(comp)
    );
    if (matching.length > 0) return this.rng.pick(matching);
    return this.rng.pick(archetypes);
  }

  private computeUrgency(
    vitals: Vitals,
    comp: ComplicationType | null,
    phase: EscalationPhase
  ): "low" | "medium" | "high" | "critical" {
    if (phase === "crisis_management") return "critical";
    if (comp) return "high";
    if (vitals.spo2 < 90 || vitals.heart_rate > 120 || vitals.bp_systolic < 85) return "high";
    if (vitals.spo2 < 94 || vitals.heart_rate > 100 || vitals.bp_systolic < 100) return "medium";
    return "low";
  }

  private computeScoreDelta(urgency: string, correct: boolean): number {
    const base = correct ? 10 : -5;
    const multiplier =
      urgency === "critical" ? 3 :
      urgency === "high" ? 2 :
      urgency === "medium" ? 1.5 :
      1;
    return Math.round(base * multiplier);
  }

  private contextualizePrompt(
    prompt: string,
    vitals: Vitals,
    comp: ComplicationType | null
  ): string {
    if (comp) {
      return `⚠️ ${comp.replace(/_/g, " ").toUpperCase()} — ${prompt}`;
    }
    if (vitals.spo2 < 90) return `📉 SpO2: ${vitals.spo2}% — ${prompt}`;
    if (vitals.heart_rate > 120) return `💓 HR: ${vitals.heart_rate} — ${prompt}`;
    if (vitals.bp_systolic < 90) return `🩸 BP: ${vitals.bp_systolic}/${vitals.bp_diastolic} — ${prompt}`;
    return prompt;
  }

  private getEscalationLabel(phase: EscalationPhase): string {
    const labels: Record<EscalationPhase, string> = {
      stable_workup: "Stable Workup",
      complication_risk: "Complication Risk",
      active_complication: "Active Complication",
      crisis_management: "Crisis Management",
      recovery_or_failure: "Recovery / Failure",
    };
    return labels[phase];
  }

  private shuffleArray<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
