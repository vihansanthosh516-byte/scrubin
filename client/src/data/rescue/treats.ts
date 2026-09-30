// Mirror of Scrubin-Core's rescue interventions (server/engine/decision/engine.ts
// ARCHETYPE_INTERVENTIONS). Core sends only ids and labels, so the client needs
// this to know which offered option actually treats the active complication.
// treats.test.ts keeps it in sync with the server copy.

export interface CoreIntervention {
  treats: string[];
  correctFeedback: string;
  wrongFeedback: string;
}

export const CORE_INTERVENTIONS: Record<string, CoreIntervention> = {
  intubate: { treats: ["hypoxia"], correctFeedback: "Airway secured successfully. SpO2 improving.", wrongFeedback: "Intubation was unnecessary — caused mild trauma and temporary desaturation." },
  oxygen_therapy: { treats: [], correctFeedback: "Oxygen therapy effective. Saturation improving.", wrongFeedback: "Supplemental O₂ cannot get past an obstructed or failing airway — the airway has to be secured." },
  cricothyroidotomy: { treats: ["hypoxia"], correctFeedback: "Surgical airway established. Patient stabilized.", wrongFeedback: "Cricothyroidotomy was overly aggressive. Unnecessary surgical trauma inflicted." },
  call_anesthesia: { treats: [], correctFeedback: "Anesthesia team consulted. Additional expertise on the way.", wrongFeedback: "Waiting for anesthesia support delayed critical intervention." },
  fluid_resuscitation: { treats: ["hemorrhage"], correctFeedback: "Fluid resuscitation restoring intravascular volume. BP stabilizing.", wrongFeedback: "Fluid bolus in a volume-overloaded patient worsens pulmonary edema." },
  vasopressor: { treats: [], correctFeedback: "Vasopressor support effective. Perfusion improving.", wrongFeedback: "Vasopressors do not control hemorrhage or fix an arrhythmia — surgical control and rhythm management do." },
  blood_transfusion: { treats: ["hemorrhage"], correctFeedback: "Transfusion restoring oxygen-carrying capacity. Vitals improving.", wrongFeedback: "Transfusion was not indicated. Risk of transfusion reaction." },
  cardioversion: { treats: ["cardiac_arrhythmia"], correctFeedback: "Sinus rhythm restored. Hemodynamics stabilizing.", wrongFeedback: "Cardioversion was not the right intervention. Cardiac irritability increased." },
  diuretic: { treats: ["fluid_overload"], correctFeedback: "Diuresis offloads the lungs. SpO2 and work of breathing improving.", wrongFeedback: "Diuresis in a volume-depleted patient caused hypotension." },
  epinephrine: { treats: ["anaphylaxis"], correctFeedback: "Epinephrine reverses anaphylactic vasodilation and bronchospasm.", wrongFeedback: "Epinephrine without anaphylaxis caused dangerous tachycardia and hypertension." },
  cautery: { treats: ["hemorrhage"], correctFeedback: "Bleeders cauterized. Surgical field is dry.", wrongFeedback: "Cautery caused thermal spread to adjacent tissue." },
  ligation: { treats: ["hemorrhage"], correctFeedback: "Vessel ligated securely. Hemostasis achieved.", wrongFeedback: "Ligation was unnecessary — no active bleeding vessel found." },
  packing: { treats: ["hemorrhage"], correctFeedback: "Packing applied. Bleeding controlled for now.", wrongFeedback: "Packing introduced without active hemorrhage — infection risk increased." },
  observe_hemostasis: { treats: [], correctFeedback: "Observation confirms hemostasis. No active bleeding.", wrongFeedback: "Observation delayed intervention. Bleeding worsened." },
  antibiotics_iv: { treats: ["infection"], correctFeedback: "Antibiotics initiated. Inflammatory markers should begin improving.", wrongFeedback: "Antibiotics given without clear indication. Unnecessary exposure." },
  wound_irrigation: { treats: ["infection"], correctFeedback: "Wound thoroughly irrigated. Source control achieved.", wrongFeedback: "Irrigation disrupted a clean wound bed unnecessarily." },
  source_control: { treats: ["infection"], correctFeedback: "Source control obtained. Sepsis should begin resolving.", wrongFeedback: "Surgical exploration was premature. No infectious source found." },
  cultures_first: { treats: [], correctFeedback: "Cultures drawn. Targeted therapy can begin once sensitivities return.", wrongFeedback: "Delaying treatment for cultures allowed infection to progress." },
  iv_opioid: { treats: [], correctFeedback: "Pain controlled. Patient comfortable and vitals stabilizing.", wrongFeedback: "Opioid caused respiratory depression. SpO2 dropping." },
  regional_block: { treats: [], correctFeedback: "Regional block effective. Pain well-controlled with minimal systemic effect.", wrongFeedback: "Block caused unintended sympathetic blockade. Hypotension developing." },
  nsaid: { treats: [], correctFeedback: "NSAID providing adjunct pain relief. Anti-inflammatory effect helpful.", wrongFeedback: "NSAID contraindicated in this scenario. May worsen bleeding risk." },
  non_pharmacologic: { treats: [], correctFeedback: "Non-pharmacologic measures adequate for current pain level.", wrongFeedback: "Pain too severe for non-pharmacologic measures alone. Patient distress increasing." },
  imaging: { treats: [], correctFeedback: "Imaging reveals the key finding. Diagnosis clarified.", wrongFeedback: "Imaging was non-contributory. Time and resources wasted." },
  labs: { treats: [], correctFeedback: "Lab results confirm the clinical suspicion. Appropriate treatment can begin.", wrongFeedback: "Labs were unnecessary at this point. No actionable findings." },
  exploration: { treats: ["infection", "nerve_injury"], correctFeedback: "Exploration reveals the problem. Direct visualization confirms diagnosis.", wrongFeedback: "Exploration was premature. No pathology found, and surgical trauma added." },
  consult_specialist: { treats: [], correctFeedback: "Specialist input clarifies the diagnosis. Correct pathway identified.", wrongFeedback: "Waiting for consult delayed critical decision-making." },
  proceed: { treats: [], correctFeedback: "Planned approach is appropriate. Proceeding safely.", wrongFeedback: "The planned approach is not safe given current conditions. Complication risk rising." },
  modify: { treats: ["thrombosis", "nerve_injury"], correctFeedback: "Modified approach avoids the danger zone. Good surgical judgment.", wrongFeedback: "Modification was unnecessary. The original approach was safer." },
  abort: { treats: ["hemorrhage", "thrombosis"], correctFeedback: "Correct call to abort. Patient safety prioritized over completing the case.", wrongFeedback: "Aborting was premature. The case could have been completed safely." },
  release_traction: { treats: ["nerve_injury"], correctFeedback: "Traction released and the tissues repositioned — nerve signals recovering.", wrongFeedback: "Releasing retraction cost time without addressing the real problem." },
  request_assistance: { treats: [], correctFeedback: "Senior assistance improves outcome. Second opinion confirms approach.", wrongFeedback: "Waiting for assistance consumed critical time." },
  vitals_check: { treats: [], correctFeedback: "Close monitoring detected the change early. Intervention initiated promptly.", wrongFeedback: "Over-monitoring is tying up resources. Standard frequency is sufficient." },
  doppler: { treats: [], correctFeedback: "Doppler caught the clot early. Anticoagulation started.", wrongFeedback: "Doppler was negative. Unnecessary study performed." },
  anticoagulation: { treats: ["thrombosis"], correctFeedback: "Anticoagulation halts clot propagation. Clinical status stabilizing.", wrongFeedback: "Full anticoagulation in a bleeding-risk patient caused hemorrhage." },
  serial_labs: { treats: [], correctFeedback: "Serial labs trending in the right direction. Continue current management.", wrongFeedback: "Serial labs show no change. Unnecessary blood draws." },
  icu_transfer: { treats: [], correctFeedback: "ICU transfer appropriate for this risk level. Close observation initiated.", wrongFeedback: "ICU transfer was unnecessary. Floor monitoring is sufficient." },
};

/** Core's generic feedback lines, so tailored feedback can replace them in the event log. */
export const CORE_GENERIC_FEEDBACK = new Set(
  Object.values(CORE_INTERVENTIONS).flatMap((iv) => [iv.correctFeedback, iv.wrongFeedback])
);
