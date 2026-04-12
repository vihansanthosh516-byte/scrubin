import type { ComplicationType } from "../lib/vitals";

/**
 * Severity levels - determines recovery complexity
 */
export type ComplicationSeverity = "minor" | "moderate" | "critical";

/**
 * Recovery phase types
 */
export type RecoveryPhase = "discover" | "stabilize" | "repair" | "verify" | "replan";

/**
 * Step count based on severity and error type
 */
export function getRecoveryStepCount(severity: ComplicationSeverity, type: ComplicationType): number {
  // Major diagnostic errors need discovery + re-plan
  if (type === "WRONG_DIAGNOSIS") return 4;
  if (type === "WRONG_INCISION_SITE") return 3;

  // Critical technical errors need full A-B-C
  if (severity === "critical") return 4;
  if (severity === "moderate") return 3;
  return 2;
}

/**
 * Maps complication types to severity
 */
export function getComplicationSeverity(type: ComplicationType): ComplicationSeverity {
  switch (type) {
    case "CARDIAC_INJURY":
    case "PNEUMOTHORAX":
    case "MALIGNANT_HYPERTHERMIA":
    case "WRONG_DIAGNOSIS":
      return "critical";
    case "HEMORRHAGE":
    case "BOWEL_PERFORATION":
    case "ANESTHESIA_OVERDOSE":
    case "ANESTHESIA_UNDERDOSE":
    case "WRONG_INCISION_SITE":
      return "moderate";
    case "NERVE_DAMAGE":
    default:
      return "minor";
  }
}

/**
 * Escalation when first recovery attempt fails
 */
export interface EscalationMessage {
  title: string;
  description: string;
  clinicalSign: string;
}

export function getEscalationMessage(type: ComplicationType): EscalationMessage {
  const messages: Record<ComplicationType, EscalationMessage> = {
    HEMORRHAGE: {
      title: "Bleeding Uncontrolled",
      description: "The vessel continues to bleed. Blood is now pooling in the dependent recesses. Suction cannot keep up with the rate of loss.",
      clinicalSign: "BP: 85/50 | HR: 118 | Est. blood loss: 800mL"
    },
    ANESTHESIA_OVERDOSE: {
      title: "Respiratory Depression Deepening",
      description: "SpO2 continues to fall despite increased FiO2. The patient's respiratory drive is profoundly depressed.",
      clinicalSign: "SpO2: 88% | EtCO2: 52 | RR: 4"
    },
    ANESTHESIA_UNDERDOSE: {
      title: "Patient Awareness Risk",
      description: "The patient is now visibly grimacing and tearing. Blood pressure is spiking dangerously. Movement during dissection could cause catastrophic injury.",
      clinicalSign: "BP: 185/110 | HR: 105 | Patient movement detected"
    },
    BOWEL_PERFORATION: {
      title: "Contamination Spreading",
      description: "Feculent material is now visible throughout the peritoneal cavity. The spill is extending beyond the operative field.",
      clinicalSign: "Temp: 38.8°C | WBC: 22,000 | Diffuse peritoneal signs"
    },
    NERVE_DAMAGE: {
      title: "Neurologic Deficit Persisting",
      description: "The neuromonitoring continues to show signal loss. Time to intervention is critical for recovery potential.",
      clinicalSign: "Signal amplitude: 0.2 mV (baseline: 1.8 mV) | No improvement after 3 minutes"
    },
    PNEUMOTHORAX: {
      title: "Tension Physiology Developing",
      description: "JVD is now visible. Tracheal deviation suspected. This is progressing to obstructive shock.",
      clinicalSign: "BP: 72/40 | SpO2: 84% | JVD present | Peak pressures: 48 cmH2O"
    },
    CARDIAC_INJURY: {
      title: "Rhythm Deteriorating",
      description: "The rhythm is unstable with poor perfusion. Cardiac output is critically compromised.",
      clinicalSign: "BP: 65/35 | SpO2: 82% | Rhythm: Polymorphic VT"
    },
    WRONG_INCISION_SITE: {
      title: "Anatomy Unrecognizable",
      description: "You're in unfamiliar territory. The structures here don't match expected anatomy. Deeper dissection risks major injury.",
      clinicalSign: "Unable to identify key landmarks | Time elapsed: 15 min without progress"
    },
    MALIGNANT_HYPERTHERMIA: {
      title: "Hypermetabolic Crisis Accelerating",
      description: "Core temperature continues to rise despite initial measures. Metabolic acidosis is worsening.",
      clinicalSign: "Temp: 40.2°C | EtCO2: 65 | pH: 7.18 | K+: 6.2"
    },
    WRONG_DIAGNOSIS: {
      title: "Pathology Does Not Match",
      description: "The intraoperative findings fundamentally contradict your preoperative diagnosis. The planned procedure may not address the actual pathology.",
      clinicalSign: "Expected: [Planned finding] | Found: [Unexpected finding] | Time pressure: OR schedule"
    },
    NONE: {
      title: "Situation Worsening",
      description: "The patient's condition continues to deteriorate. Reassessment is needed.",
      clinicalSign: "Vital signs trending unstable"
    }
  };
  return messages[type] || messages.NONE;
}

/**
 * Recovery step with plausible wrong answers
 */
export interface RecoveryStep {
  id: string;
  stepNumber: number;
  phase: RecoveryPhase;
  question: string;
  context: string;
  options: RecoveryOption[];
}

export interface RecoveryOption {
  id: string;
  label: string;
  correct: boolean;
  consequence?: string;
}

/**
 * SMART RECOVERY SEQUENCES
 * Wrong answers are plausible mistakes a stressed resident might make
 */
export function generateRecoverySequence(
  type: ComplicationType,
  severity: ComplicationSeverity,
  procedureId?: string
): RecoveryStep[] {
  const steps: RecoveryStep[] = [];

  switch (type) {
    case "HEMORRHAGE":
      // Quick stabilization - return to surgery after
      steps.push({
        id: "h1",
        stepNumber: 1,
        phase: "stabilize",
        question: "Bright red blood is filling the field. What is your immediate action?",
        context: "Arterial bleeding is active. Visualization is compromised. BP is starting to drop.",
        options: [
          { id: "a", label: "Pack the field with laparotomy pads and apply direct pressure", correct: true },
          { id: "b", label: "Increase insufflation pressure to tamponade the bleed", correct: false },
          { id: "c", label: "Insert suction and attempt to identify the source now", correct: false },
          { id: "d", label: "Convert to open laparotomy immediately", correct: false }
        ]
      });
      steps.push({
        id: "h2",
        stepNumber: 2,
        phase: "repair",
        question: "Pressure applied. Field clearing. Lacerated vessel visible. How do you control it?",
        context: "The bleeding has slowed. A vessel near the surgical bed is actively bleeding.",
        options: [
          { id: "a", label: "Clear the field, isolate the vessel, apply clips precisely", correct: true },
          { id: "b", label: "Apply bipolar cautery broadly", correct: false },
          { id: "c", label: "Apply Surgicel and hope it stops", correct: false }
        ]
      });
      steps.push({
        id: "h3",
        stepNumber: 3,
        phase: "verify",
        question: "Vessel controlled. Field is dry. What now?",
        context: "Hemostasis achieved. BP is recovering. You can continue.",
        options: [
          { id: "a", label: "Irrigate, inspect for additional bleeding, resume procedure", correct: true },
          { id: "b", label: "Close immediately - you're done", correct: false }
        ]
      });
      break;

    case "WRONG_DIAGNOSIS":
      // Just recognize and pivot - don't do the whole surgery
      steps.push({
        id: "wd1",
        stepNumber: 1,
        phase: "discover",
        question: "The findings don't match your diagnosis. What do you do?",
        context: "You expected one pathology. The anatomy shows something different.",
        options: [
          { id: "a", label: "Pause, reassess the anatomy, identify the actual pathology", correct: true },
          { id: "b", label: "Continue with the planned procedure anyway", correct: false },
          { id: "c", label: "Close and order imaging later", correct: false }
        ]
      });
      steps.push({
        id: "wd2",
        stepNumber: 2,
        phase: "replan",
        question: "You've identified different pathology. How do you proceed?",
        context: "The actual diagnosis requires a different approach than planned.",
        options: [
          { id: "a", label: "Adjust your surgical plan to address the actual findings", correct: true },
          { id: "b", label: "Ignore it and stick to the original plan", correct: false }
        ]
      });
      break;

    case "BOWEL_PERFORATION":
      steps.push({
        id: "bp1",
        stepNumber: 1,
        phase: "stabilize",
        question: "You've entered the bowel. Succus is visible. Immediate action?",
        context: "Full-thickness injury with enteric spillage.",
        options: [
          { id: "a", label: "Control spillage with pads, isolate the area, assess extent", correct: true },
          { id: "b", label: "Close the defect immediately", correct: false },
          { id: "c", label: "Irrigate and hope it seals", correct: false }
        ]
      });
      steps.push({
        id: "bp2",
        stepNumber: 2,
        phase: "repair",
        question: "5mm clean perforation on anti-mesenteric border. How do you repair?",
        context: "Edges are healthy. No thermal injury.",
        options: [
          { id: "a", label: "Close in two layers with absorbable suture, test with air", correct: true },
          { id: "b", label: "Single layer closure", correct: false },
          { id: "c", label: "Apply an endoloop", correct: false }
        ]
      });
      steps.push({
        id: "bp3",
        stepNumber: 3,
        phase: "verify",
        question: "Repair complete and tested. What now?",
        context: "Closure is intact. Contamination was present.",
        options: [
          { id: "a", label: "Copious irrigation, consider drain, resume procedure", correct: true },
          { id: "b", label: "Just close - irrigation takes too long", correct: false }
        ]
      });
      break;

    case "PNEUMOTHORAX":
      steps.push({
        id: "pn1",
        stepNumber: 1,
        phase: "discover",
        question: "Peak pressures jumped to 45. SpO2 falling. Breath sounds diminished on right. What's happening?",
        context: "Sudden desaturation during insufflation.",
        options: [
          { id: "a", label: "Tension pneumothorax - stop nitrous, give 100% O2, prepare decompression", correct: true },
          { id: "b", label: "ETT malposition - pull back on tube", correct: false },
          { id: "c", label: "Bronchospasm - deepen anesthetic", correct: false }
        ]
      });
      steps.push({
        id: "pn2",
        stepNumber: 2,
        phase: "stabilize",
        question: "BP 78/40. SpO2 86%. JVD visible. How do you decompress?",
        context: "Tension physiology. Life-threatening.",
        options: [
          { id: "a", label: "Needle decompression at 2nd intercostal mid-clavicular line, then chest tube", correct: true },
          { id: "b", label: "Wait for chest X-ray to confirm", correct: false },
          { id: "c", label: "Chest tube only, skip needle", correct: false }
        ]
      });
      steps.push({
        id: "pn3",
        stepNumber: 3,
        phase: "verify",
        question: "Needle decompression successful. Chest tube in. Patient stabilizing. Can you continue?",
        context: "SpO2 96%. BP recovering.",
        options: [
          { id: "a", label: "Continue with monitoring, document event, plan post-op CXR", correct: true },
          { id: "b", label: "Abort procedure immediately", correct: false }
        ]
      });
      break;

    case "CARDIAC_INJURY":
      steps.push({
        id: "ci1",
        stepNumber: 1,
        phase: "stabilize",
        question: "Patient lost pulses during dissection. Immediate response?",
        context: "VF arrest. No pulse. You're mid-procedure.",
        options: [
          { id: "a", label: "Clear the field, start CPR, defibrillate, call for ACLS", correct: true },
          { id: "b", label: "Finish this step quickly then resuscitate", correct: false },
          { id: "c", label: "Wait for anesthesia to handle it", correct: false }
        ]
      });
      steps.push({
        id: "ci2",
        stepNumber: 2,
        phase: "stabilize",
        question: "First shock delivered. Still VF. Epinephrine given. Next?",
        context: "CPR ongoing. No ROSC yet.",
        options: [
          { id: "a", label: "Continue ACLS - next shock, amiodarone, identify reversible causes", correct: true },
          { id: "b", label: "Open cardiac massage immediately", correct: false },
          { id: "c", label: "Stop resuscitation", correct: false }
        ]
      });
      steps.push({
        id: "ci3",
        stepNumber: 3,
        phase: "verify",
        question: "ROSC achieved. BP 90/60. What now?",
        context: "Patient is back. Procedure incomplete.",
        options: [
          { id: "a", label: "Stabilize, assess cause, plan rapid completion or abort based on status", correct: true },
          { id: "b", label: "Resume exactly where you left off", correct: false }
        ]
      });
      break;

    case "ANESTHESIA_OVERDOSE":
      steps.push({
        id: "ao1",
        stepNumber: 1,
        phase: "discover",
        question: "SpO2 falling. RR is 4. Anesthesia provider concerned. What's happening?",
        context: "End-tidal agent elevated. Patient hypopneic.",
        options: [
          { id: "a", label: "Stop the infusion, hand-ventilate with 100% O2, verify all infusions", correct: true },
          { id: "b", label: "Intubate immediately without adjusting meds", correct: false },
          { id: "c", label: "Give flumazenil", correct: false }
        ]
      });
      steps.push({
        id: "ao2",
        stepNumber: 2,
        phase: "verify",
        question: "Ventilation supported. SpO2 recovering. Can you continue?",
        context: "Infusion stopped. Hand-ventilating. SpO2 95%.",
        options: [
          { id: "a", label: "Continue with reduced anesthetic, proceed carefully", correct: true },
          { id: "b", label: "Emergently wake patient and cancel", correct: false }
        ]
      });
      break;

    case "ANESTHESIA_UNDERDOSE":
      steps.push({
        id: "au1",
        stepNumber: 1,
        phase: "discover",
        question: "BP 185/110. Patient tearing. You're dissecting near critical structure. Now?",
        context: "Light anesthesia signs. Movement could cause injury.",
        options: [
          { id: "a", label: "Stop dissection, have anesthesia deepen before continuing", correct: true },
          { id: "b", label: "Finish this step quickly then address anesthesia", correct: false },
          { id: "c", label: "Just paralyze the patient", correct: false }
        ]
      });
      steps.push({
        id: "au2",
        stepNumber: 2,
        phase: "verify",
        question: "Anesthesia deepened. BP coming down. When do you resume?",
        context: "Patient no longer moving. Adequate depth.",
        options: [
          { id: "a", label: "Confirm depth, communicate stimulation levels, resume", correct: true },
          { id: "b", label: "Resume immediately", correct: false }
        ]
      });
      break;

    case "NERVE_DAMAGE":
      steps.push({
        id: "nd1",
        stepNumber: 1,
        phase: "discover",
        question: "Neuromonitoring shows sudden signal loss. Immediate action?",
        context: "Signal changed from normal to absent during dissection.",
        options: [
          { id: "a", label: "Stop dissection, release traction, reassess anatomy", correct: true },
          { id: "b", label: "Continue - probably monitor artifact", correct: false },
          { id: "c", label: "Finish the case fast", correct: false }
        ]
      });
      steps.push({
        id: "nd2",
        stepNumber: 2,
        phase: "verify",
        question: "Signal loss confirmed. Nerve appears intact. What now?",
        context: "No return after releasing traction.",
        options: [
          { id: "a", label: "Document, plan post-op EMG, consider consult, resume carefully", correct: true },
          { id: "b", label: "Nothing to do - just close", correct: false }
        ]
      });
      break;

    case "WRONG_INCISION_SITE":
      steps.push({
        id: "wi1",
        stepNumber: 1,
        phase: "discover",
        question: "Anatomy doesn't match your pre-op plan. What do you do?",
        context: "Landmarks wrong. Structures don't match expected anatomy.",
        options: [
          { id: "a", label: "Stop, reassess landmarks and imaging, verify level/side", correct: true },
          { id: "b", label: "Continue - you're already committed", correct: false },
          { id: "c", label: "Make bigger incision to see more", correct: false }
        ]
      });
      steps.push({
        id: "wi2",
        stepNumber: 2,
        phase: "replan",
        question: "Confirmed wrong level. What now?",
        context: "Error identified. Correct location known.",
        options: [
          { id: "a", label: "Close/extend appropriately, re-prep, formal timeout at correct site", correct: true },
          { id: "b", label: "Just work from where you are", correct: false }
        ]
      });
      break;

    case "MALIGNANT_HYPERTHERMIA":
      steps.push({
        id: "mh1",
        stepNumber: 1,
        phase: "discover",
        question: "EtCO2 rising despite increased ventilation. Temp 39.5°C. What's happening?",
        context: "Exposed to sevoflurane. Rising EtCO2, tachycardia, hyperthermia, rigidity.",
        options: [
          { id: "a", label: "Malignant hyperthermia - stop triggers, hyperventilate with 100% O2", correct: true },
          { id: "b", label: "Sepsis - continue anesthesia, give antibiotics", correct: false },
          { id: "c", label: "Light anesthesia - deepen", correct: false }
        ]
      });
      steps.push({
        id: "mh2",
        stepNumber: 2,
        phase: "stabilize",
        question: "MH protocol initiated. Critical intervention?",
        context: "Triggers stopped. Hyperventilation started. Dantrolene being mixed.",
        options: [
          { id: "a", label: "Give dantrolene 2.5mg/kg IV, active cooling, treat hyperkalemia", correct: true },
          { id: "b", label: "Wait for dantrolene before cooling", correct: false },
          { id: "c", label: "Give acetaminophen for fever", correct: false }
        ]
      });
      steps.push({
        id: "mh3",
        stepNumber: 3,
        phase: "verify",
        question: "Temp improving. Patient stabilizing. What now?",
        context: "Dantrolene given. Cooling active.",
        options: [
          { id: "a", label: "Monitor for hyperkalemia/DIC/rhabdo, plan ICU admission, resume if stable", correct: true },
          { id: "b", label: "Just watch the temperature", correct: false }
        ]
      });
      break;

    default:
      // Generic recovery
      steps.push({
        id: "gen1",
        stepNumber: 1,
        phase: "discover",
        question: "A complication has occurred. What is your first step?",
        context: "The patient's condition has changed. You need to assess and respond.",
        options: [
          { id: "a", label: "Stop, assess the situation, communicate with team, develop a plan", correct: true },
          { id: "b", label: "React immediately without assessment", correct: false, consequence: "Acting without assessment can compound errors" }
        ]
      });
  }

  const stepCount = getRecoveryStepCount(severity, type);
  return steps.slice(0, stepCount);
}

/**
 * Check if this is a major diagnostic error requiring full pivot
 */
export function isMajorDiagnosticError(type: ComplicationType): boolean {
  return type === "WRONG_DIAGNOSIS" || type === "WRONG_INCISION_SITE";
}

/**
 * Get the recovery phase label
 */
export function getRecoveryPhaseLabel(phase: RecoveryPhase): string {
  switch (phase) {
    case "discover": return "Discovery";
    case "stabilize": return "Stabilization";
    case "repair": return "Repair";
    case "verify": return "Verification";
    case "replan": return "Re-planning";
    default: return "Recovery";
  }
}
