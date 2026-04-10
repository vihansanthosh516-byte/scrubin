import type { ComplicationType } from "../lib/vitals";

export type RescueOption = { id: string; label: string; desc: string; correct: boolean };

export type Decision = {
  id: number;
  phase: number;
  question: string;
  context: string;
  options: {
    id: string;
    label: string;
    desc: string;
    correct: boolean;
    consequence?: string;
    complicationType?: ComplicationType;
    rescueOptions?: RescueOption[];
  }[];
};

const getRescueOptions = (type: ComplicationType): RescueOption[] | undefined => {
  switch (type) {
    case "HEMORRHAGE":
      return [
        { id: "1", label: "Apply direct pressure with laparotomy pads and call for blood products", desc: "Standard bleeding control", correct: true },
        { id: "2", label: "Identify the bleeding vessel and apply vascular clamp", desc: "Direct surgical control", correct: true },
        { id: "3", label: "Pack the chest and hope it stops", desc: "Insufficient for arterial bleeding", correct: false }
      ];
    case "CARDIAC_INJURY":
      return [
        { id: "1", label: "Initiate ACLS protocol and defibrillate if shockable rhythm", desc: "Life-saving intervention", correct: true },
        { id: "2", label: "Administer epinephrine 1mg IV push", desc: "Standard cardiac arrest medication", correct: true },
        { id: "3", label: "Wait for the heart to recover on its own", desc: "Brain death imminent", correct: false }
      ];
    case "ANESTHESIA_OVERDOSE":
      return [
        { id: "1", label: "Reduce anesthetic agents and hyperventilate with 100% O2", desc: "Clear volatile anesthetics", correct: true },
        { id: "2", label: "Administer vasopressors to support BP", desc: "Hemodynamic support", correct: true },
        { id: "3", label: "Continue current anesthetic depth", desc: "Worsens cardiovascular depression", correct: false }
      ];
    case "ANESTHESIA_UNDERDOSE":
      return [
        { id: "1", label: "Increase anesthetic agent concentration", desc: "Achieve adequate depth", correct: true },
        { id: "2", label: "Administer additional paralytic", desc: "Prevent movement", correct: true },
        { id: "3", label: "Ignore and continue surgery", desc: "Patient may wake up or move", correct: false }
      ];
    case "PNEUMOTHORAX":
      return [
        { id: "1", label: "Needle decompression at 2nd intercostal midclavicular line", desc: "Immediate tension relief", correct: true },
        { id: "2", label: "Chest tube placement", desc: "Definitive air evacuation", correct: true },
        { id: "3", label: "Monitor and observe", desc: "Tension pneumothorax is fatal", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Abort and reassess anatomical landmarks", desc: "Prevents wrong vessel graft", correct: true },
        { id: "2", label: "Consult with senior surgeon", desc: "Safe intra-op consultation", correct: true },
        { id: "3", label: "Continue with current dissection", desc: "Will graft wrong vessel", correct: false }
      ];
    case "BOWEL_PERFORATION":
      return [
        { id: "1", label: "Repair primarily with absorbable suture", desc: "Standard closure", correct: true },
        { id: "2", label: "Copious irrigation and broad-spectrum antibiotics", desc: "Contamination control", correct: true },
        { id: "3", label: "Ignore small perforation", desc: "Sepsis risk", correct: false }
      ];
    default:
      return undefined;
  }
};

const createDecision = (
  id: number, phase: number, question: string, context: string,
  correct: { label: string; desc: string },
  wrong1: { label: string; desc: string, comp: ComplicationType },
  wrong2: { label: string; desc: string, comp: ComplicationType },
  wrong3: { label: string; desc: string, comp: ComplicationType }
): Decision => ({
  id, phase, question, context,
  options: [
    { id: "a", label: correct.label, desc: correct.desc, correct: true },
    { id: "b", label: wrong1.label, desc: wrong1.desc, correct: false, complicationType: wrong1.comp, rescueOptions: getRescueOptions(wrong1.comp) },
    { id: "c", label: wrong2.label, desc: wrong2.desc, correct: false, complicationType: wrong2.comp, rescueOptions: getRescueOptions(wrong2.comp) },
    { id: "d", label: wrong3.label, desc: wrong3.desc, correct: false, complicationType: wrong3.comp, rescueOptions: getRescueOptions(wrong3.comp) },
  ]
});

export const DECISIONS: Decision[] = [
  // PHASE 1: PRE-OP EVALUATION
  createDecision(1, 1, "Initial Assessment", "A 64-year-old male with severe three-vessel coronary artery disease presents for CABG. He has diabetes and hypertension. What is the first priority in pre-op evaluation?",
    { label: "Review cardiac catheterization films and assess left ventricular function", desc: "Essential surgical planning" },
    { label: "Order a screening colonoscopy", desc: "Irrelevant to cardiac surgery", comp: "WRONG_DIAGNOSIS" },
    { label: "Proceed directly to OR without workup", desc: "Misses critical risk assessment", comp: "CARDIAC_INJURY" },
    { label: "Only check blood glucose", desc: "Incomplete pre-op assessment", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "Ejection Fraction", "The echocardiogram shows EF of 35%. How does this affect surgical planning?",
    { label: "Consider intra-aortic balloon pump pre-op and expect longer bypass time", desc: "Appropriate high-risk planning" },
    { label: "Cancel the surgery", desc: "CABG can still be beneficial with low EF", comp: "WRONG_DIAGNOSIS" },
    { label: "No change in surgical approach", desc: "Low EF significantly increases risk", comp: "CARDIAC_INJURY" },
    { label: "Only medical management", desc: "Surgical revascularization is indicated", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Vessel Selection", "Which vessels are typically used for CABG grafts?",
    { label: "Left internal mammary artery (LIMA), saphenous vein, and radial artery", desc: "Standard conduit options" },
    { label: "Femoral artery only", desc: "Not a standard CABG conduit", comp: "WRONG_INCISION_SITE" },
    { label: "Carotid artery", desc: "Supplies brain, cannot be harvested", comp: "CARDIAC_INJURY" },
    { label: "Brachial artery bilateral", desc: "Causes arm ischemia", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(4, 1, "Antiplatelet Management", "The patient is on aspirin and clopidogrel. When should clopidogrel be stopped before surgery?",
    { label: "5-7 days before surgery", desc: "Allows platelet recovery" },
    { label: "Continue through surgery", desc: "Significantly increases bleeding risk", comp: "HEMORRHAGE" },
    { label: "Stop only 1 day before", desc: "Insufficient for platelet recovery", comp: "HEMORRHAGE" },
    { label: "No need to stop", desc: "P2Y12 inhibitors must be held", comp: "HEMORRHAGE" }
  ),
  createDecision(5, 1, "Beta Blocker Continuation", "Should beta-blockers be continued perioperatively?",
    { label: "Yes, continue to prevent perioperative arrhythmias and reduce mortality", desc: "Standard of care" },
    { label: "Stop all beta-blockers 24h before", desc: "Increases risk of perioperative MI", comp: "CARDIAC_INJURY" },
    { label: "Only continue if heart rate is high", desc: "Beta-blockers are protective regardless", comp: "WRONG_DIAGNOSIS" },
    { label: "Switch to calcium channel blocker", desc: "Beta-blockers are preferred", comp: "CARDIAC_INJURY" }
  ),
  createDecision(6, 1, "Statin Therapy", "The patient is on atorvastatin. What is the perioperative recommendation?",
    { label: "Continue statin therapy through surgery to reduce inflammatory response", desc: "Cardioprotective effect" },
    { label: "Hold statin on day of surgery", desc: "Increases post-op complications", comp: "CARDIAC_INJURY" },
    { label: "Double the dose", desc: "No additional benefit from acute loading", comp: "WRONG_DIAGNOSIS" },
    { label: "Stop statin one week prior", desc: "Removes protective effect", comp: "CARDIAC_INJURY" }
  ),
  createDecision(7, 1, "Informed Consent", "Which complication must specifically be discussed for CABG consent?",
    { label: "Stroke, bleeding, infection, arrhythmias, and potential for intra-aortic balloon pump", desc: "Complete risk disclosure" },
    { label: "Only mention anesthesia risks", desc: "Incomplete consent for cardiac surgery", comp: "WRONG_DIAGNOSIS" },
    { label: "Say there are no major risks", desc: "Unethical and factually wrong", comp: "WRONG_DIAGNOSIS" },
    { label: "Only discuss wound infection", desc: "Misses major life-threatening risks", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2: ANESTHESIA & INDUCTION
  createDecision(8, 2, "Monitoring Lines", "What invasive monitoring is required for CABG?",
    { label: "Arterial line, central venous pressure, and pulmonary artery catheter", desc: "Complete hemodynamic monitoring" },
    { label: "Only non-invasive blood pressure cuff", desc: "Insufficient for cardiac surgery", comp: "CARDIAC_INJURY" },
    { label: "Just a peripheral IV", desc: "Cannot manage hemodynamic changes", comp: "CARDIAC_INJURY" },
    { label: "Finger pulse oximeter only", desc: "Grossly inadequate", comp: "CARDIAC_INJURY" }
  ),
  createDecision(9, 2, "Induction Agents", "Which induction agent is preferred for patients with poor LV function?",
    { label: "Etomidate or ketamine for hemodynamic stability", desc: "Minimal cardiac depression" },
    { label: "High-dose propofol bolus", desc: "Causes profound hypotension in low EF", comp: "CARDIAC_INJURY" },
    { label: "Thiopental at standard dose", desc: "Significant myocardial depression", comp: "CARDIAC_INJURY" },
    { label: "No induction agent needed", desc: "Impossible for intubation", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(10, 2, "Airway Management", "After induction, you cannot visualize the vocal cords. What is the next step?",
    { label: "Use video laryngoscope or call for fiberoptic bronchoscope", desc: "Backup airway management" },
    { label: "Forcefully insert the tube blindly", desc: "Esophageal intubation risk", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Cancel the surgery", desc: "Premature before trying advanced airway", comp: "WRONG_DIAGNOSIS" },
    { label: "Wait and retry indefinitely", desc: "Patient will desaturate", comp: "CARDIAC_INJURY" }
  ),
  createDecision(11, 2, "TEE Probe", "Why is transesophageal echocardiography (TEE) used during CABG?",
    { label: "To assess ventricular function, valve function, and detect new wall motion abnormalities", desc: "Essential intra-op monitoring" },
    { label: "Only for research purposes", desc: "TEE is standard of care", comp: "WRONG_DIAGNOSIS" },
    { label: "To visualize the coronary arteries", desc: "TEE cannot see coronaries directly", comp: "WRONG_DIAGNOSIS" },
    { label: "TEE is optional for CABG", desc: "Standard of care includes TEE", comp: "CARDIAC_INJURY" }
  ),
  createDecision(12, 2, "Anticoagulation Initiation", "Before going on cardiopulmonary bypass, what anticoagulation is required?",
    { label: "Heparin 300-400 units/kg to achieve ACT >480 seconds", desc: "Standard CPB anticoagulation" },
    { label: "Aspirin only", desc: "Insufficient for bypass circuit", comp: "CARDIAC_INJURY" },
    { label: "No anticoagulation needed", desc: "Circuit will clot immediately", comp: "CARDIAC_INJURY" },
    { label: "Low molecular weight heparin", desc: "Cannot be rapidly reversed", comp: "HEMORRHAGE" }
  ),
  createDecision(13, 2, "Heparin Resistance", "After heparin administration, ACT is only 350 seconds. What do you do?",
    { label: "Administer additional heparin and consider antithrombin III deficiency", desc: "Proper response to inadequate anticoagulation" },
    { label: "Proceed with bypass anyway", desc: "Risk of circuit clotting", comp: "CARDIAC_INJURY" },
    { label: "Cancel the surgery", desc: "Usually correctable with more heparin", comp: "WRONG_DIAGNOSIS" },
    { label: "Switch to aspirin", desc: "Not an anticoagulant for CPB", comp: "CARDIAC_INJURY" }
  ),

  // PHASE 3: STERNOTOMY & CONDUIT HARVEST
  createDecision(14, 3, "Sternotomy Position", "How is the patient positioned for median sternotomy?",
    { label: "Supine with arms tucked at sides and chest prepped from chin to knees", desc: "Standard cardiac positioning" },
    { label: "Lateral decubitus position", desc: "Wrong position for median sternotomy", comp: "WRONG_INCISION_SITE" },
    { label: "Prone position", desc: "Impossible for cardiac access", comp: "WRONG_INCISION_SITE" },
    { label: "Sitting position", desc: "Not used for cardiac surgery", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(15, 3, "Sternotomy Technique", "During sternotomy, what maneuver protects the heart from injury?",
    { label: "Retract the lungs and deflate partially during sternal split", desc: "Protects underlying structures" },
    { label: "Push the saw deeper into the mediastinum", desc: "Direct cardiac injury", comp: "CARDIAC_INJURY" },
    { label: "No special precautions needed", desc: "Heart can be lacerated", comp: "CARDIAC_INJURY" },
    { label: "Cut through the manubrium only", desc: "Incomplete sternotomy", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(16, 3, "Sternal Bleeding", "Profuse bleeding from the sternum bone marrow. What is the management?",
    { label: "Apply bone wax to the cut edges and electrocautery to periosteal bleeders", desc: "Standard hemostasis" },
    { label: "Ignore it, it will stop", desc: "Significant blood loss occurs", comp: "HEMORRHAGE" },
    { label: "Pack with gauze and continue", desc: "Temporary and insufficient", comp: "HEMORRHAGE" },
    { label: "Abort the procedure", desc: "Bone wax easily controls bleeding", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(17, 3, "LIMA Harvest", "Where is the left internal mammary artery harvested from?",
    { label: "Left subclavian artery, running along the sternal border", desc: "Correct anatomical location" },
    { label: "Directly from the aorta", desc: "LIMA originates from subclavian", comp: "WRONG_INCISION_SITE" },
    { label: "From the femoral artery", desc: "Completely wrong location", comp: "WRONG_INCISION_SITE" },
    { label: "From the carotid artery", desc: "Not a source of LIMA", comp: "CARDIAC_INJURY" }
  ),
  createDecision(18, 3, "LIMA Pedicle", "Why is LIMA harvested with a pedicle of tissue?",
    { label: "To protect the artery and maintain vasa vasorum blood supply", desc: "Preserves graft viability" },
    { label: "For faster harvesting", desc: "Actually takes more time", comp: "WRONG_DIAGNOSIS" },
    { label: "No pedicle is needed", desc: "Skeletonized LIMA has higher spasm risk", comp: "CARDIAC_INJURY" },
    { label: "For cosmetic reasons", desc: "Internal graft, cosmetics irrelevant", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(19, 3, "Saphenous Vein Harvest", "Which leg is preferred for saphenous vein harvest?",
    { label: "Either leg; often the right leg for surgeon convenience (right-handed surgeon standing on right)", desc: "Standard approach" },
    { label: "Only the left leg", desc: "Either leg can be used", comp: "WRONG_INCISION_SITE" },
    { label: "The arm", desc: "Saphenous vein is in the leg", comp: "WRONG_INCISION_SITE" },
    { label: "The neck", desc: "No saphenous vein in neck", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(20, 3, "Vein Graft Handling", "How should the saphenous vein graft be handled to prevent damage?",
    { label: "Gentle handling, avoid over-distension, mark distal end for orientation", desc: "Prevents endothelial damage" },
    { label: "Stretch the vein forcefully", desc: "Damages endothelium", comp: "CARDIAC_INJURY" },
    { label: "Use high-pressure saline to distend", desc: "Causes intimal injury", comp: "CARDIAC_INJURY" },
    { label: "Rough handling is acceptable", desc: "Leads to graft failure", comp: "CARDIAC_INJURY" }
  ),
  createDecision(21, 3, "Radial Artery Harvest", "Why might radial artery be chosen as a conduit?",
    { label: "Better long-term patency than saphenous vein in some studies", desc: "Arterial graft advantage" },
    { label: "Easier to harvest than LIMA", desc: "Both are technically demanding", comp: "WRONG_DIAGNOSIS" },
    { label: "No special handling needed", desc: "Radial artery is prone to spasm", comp: "CARDIAC_INJURY" },
    { label: "Never used in CABG", desc: "Commonly used as third conduit", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(22, 3, "Allen Test", "Before radial artery harvest, what test must be performed?",
    { label: "Allen test to confirm adequate ulnar artery collateral flow", desc: "Prevents hand ischemia" },
    { label: "No testing needed", desc: "Risk of hand ischemia", comp: "WRONG_INCISION_SITE" },
    { label: "Blood glucose test", desc: "Irrelevant to radial harvest", comp: "WRONG_DIAGNOSIS" },
    { label: "ECG", desc: "Does not assess hand perfusion", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 4: CARDIOPULMONARY BYPASS
  createDecision(23, 4, "Cannulation Site", "Where is the arterial cannula typically placed for CPB?",
    { label: "Ascending aorta, away from atherosclerotic plaque", desc: "Standard arterial inflow" },
    { label: "Femoral artery routinely", desc: "Alternative when aorta is diseased", comp: "WRONG_INCISION_SITE" },
    { label: "Directly into the left ventricle", desc: "Not a CPB cannulation site", comp: "CARDIAC_INJURY" },
    { label: "Carotid artery", desc: "Brain blood supply, not for CPB", comp: "CARDIAC_INJURY" }
  ),
  createDecision(24, 4, "Venous Cannulation", "Where is venous return established for CPB?",
    { label: "Right atrium with a single two-stage cannula or bicaval cannulation", desc: "Standard venous drainage" },
    { label: "Pulmonary artery", desc: "Not used for venous return", comp: "CARDIAC_INJURY" },
    { label: "Left atrium", desc: "Oxygenated blood, wrong circuit point", comp: "CARDIAC_INJURY" },
    { label: "Femoral vein only", desc: "Alternative but not primary for standard CABG", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(25, 4, "Aortic Cross-Clamp", "What is the purpose of the aortic cross-clamp?",
    { label: "To isolate the heart and create a bloodless, still operative field", desc: "Essential for anastomosis" },
    { label: "To stop blood flow to the brain", desc: "Brain perfusion continues via CPB", comp: "CARDIAC_INJURY" },
    { label: "No clamp is used in CABG", desc: "Standard cardiac surgery technique", comp: "CARDIAC_INJURY" },
    { label: "Only for valve surgery", desc: "Used in CABG as well", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(26, 4, "Cardioplegia", "What is the purpose of cardioplegia solution?",
    { label: "To arrest the heart in diastole and provide myocardial protection", desc: "Prevents ischemic damage" },
    { label: "To stimulate the heart to beat faster", desc: "Opposite effect", comp: "CARDIAC_INJURY" },
    { label: "No cardioplegia is used", desc: "Standard myocardial protection", comp: "CARDIAC_INJURY" },
    { label: "Only for transfusion", desc: "Not a blood product", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(27, 4, "Cardioplegia Delivery", "How is cardioplegia typically delivered?",
    { label: "Antegrade via aortic root and/or retrograde via coronary sinus", desc: "Comprehensive protection" },
    { label: "Only through the veins", desc: "Venous system not for cardioplegia", comp: "CARDIAC_INJURY" },
    { label: "Oral administration", desc: "Cannot reach heart via GI tract", comp: "WRONG_DIAGNOSIS" },
    { label: "Through the radial artery", desc: "Not connected to coronaries", comp: "CARDIAC_INJURY" }
  ),
  createDecision(28, 4, "Hypothermia", "Why is systemic hypothermia used during CPB?",
    { label: "To reduce metabolic demand and provide organ protection", desc: "Standard CPB technique" },
    { label: "For surgeon comfort", desc: "Not the purpose of hypothermia", comp: "WRONG_DIAGNOSIS" },
    { label: "Hypothermia is avoided", desc: "Standard practice uses cooling", comp: "CARDIAC_INJURY" },
    { label: "Only for brain protection", desc: "Protects all organs", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(29, 4, "Target Temperature", "What is the typical target core temperature during CABG?",
    { label: "32-34 degrees Celsius (mild hypothermia)", desc: "Standard CPB temperature" },
    { label: "Below 20 degrees", desc: "Deep hypothermia reserved for circulatory arrest", comp: "CARDIAC_INJURY" },
    { label: "Normothermia (37 degrees)", desc: "Some centers use, but cooling is standard", comp: "CARDIAC_INJURY" },
    { label: "Above 40 degrees", desc: "Dangerous hyperthermia", comp: "CARDIAC_INJURY" }
  ),
  createDecision(30, 4, "Flow Rates", "What is the target pump flow rate during CPB?",
    { label: "2.2-2.5 L/min/m2 to maintain adequate tissue perfusion", desc: "Standard CPB flow" },
    { label: "Minimal flow to save blood", desc: "Inadequate perfusion causes organ damage", comp: "CARDIAC_INJURY" },
    { label: "Maximum possible flow", desc: "Causes hemolysis and trauma", comp: "HEMORRHAGE" },
    { label: "Flow is not monitored", desc: "Critical perfusion parameter", comp: "CARDIAC_INJURY" }
  ),
  createDecision(31, 4, "AC Maintenance", "Why is the ACT checked every 30 minutes during CPB?",
    { label: "To ensure adequate anticoagulation and prevent circuit clotting", desc: "Safety monitoring" },
    { label: "Only checked once at start", desc: "Heparin levels drop over time", comp: "CARDIAC_INJURY" },
    { label: "ACT is irrelevant", desc: "Critical safety parameter", comp: "CARDIAC_INJURY" },
    { label: "Only for research", desc: "Standard clinical practice", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(32, 4, "Air Embolism Prevention", "How is air embolism prevented during CPB?",
    { label: "Maintain adequate volume in reservoir, avoid negative pressure, de-air maneuvers", desc: "Comprehensive air avoidance" },
    { label: "Air embolism is not a concern", desc: "Fatal complication", comp: "CARDIAC_INJURY" },
    { label: "Only check at end of case", desc: "Prevention throughout is key", comp: "CARDIAC_INJURY" },
    { label: "Let the air circulate", desc: "Air in coronaries causes arrest", comp: "CARDIAC_INJURY" }
  ),

  // PHASE 5: DISTAL ANASTOMOSES
  createDecision(33, 5, "LAD Grafting", "Which vessel is most commonly grafted with the LIMA?",
    { label: "Left anterior descending artery (LAD)", desc: "Gold standard LIMA-LAD graft" },
    { label: "Right coronary artery", desc: "Usually saphenous vein graft", comp: "WRONG_INCISION_SITE" },
    { label: "Circumflex artery", desc: "Usually SVG or radial artery", comp: "WRONG_INCISION_SITE" },
    { label: "Left main", desc: "LIMA usually to LAD", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(34, 5, "Anastomosis Technique", "What suture is used for coronary anastomosis?",
    { label: "7-0 or 8-0 polypropylene (Prolene) continuous suture", desc: "Standard microsurgical technique" },
    { label: "3-0 silk", desc: "Too large for coronary vessels", comp: "CARDIAC_INJURY" },
    { label: "Staples", desc: "Cannot use on coronary vessels", comp: "CARDIAC_INJURY" },
    { label: "Tissue glue only", desc: "Insufficient for vascular anastomosis", comp: "HEMORRHAGE" }
  ),
  createDecision(35, 5, "Anastomosis Site Selection", "Where should the graft be anastomosed on the coronary?",
    { label: "Distal to the stenosis in a relatively disease-free segment", desc: "Optimal flow territory" },
    { label: "Proximal to the stenosis", desc: "No blood flow beyond stenosis", comp: "CARDIAC_INJURY" },
    { label: "At the exact point of stenosis", desc: "Plaque disrupts anastomosis", comp: "CARDIAC_INJURY" },
    { label: "At the origin of the vessel", desc: "Not bypassing the lesion", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(36, 5, "Graft Length", "How should the LIMA graft length be determined?",
    { label: "Allow adequate length without tension or kinking when heart fills", desc: "Prevents graft failure" },
    { label: "Cut as short as possible", desc: "Tension causes anastomotic failure", comp: "CARDIAC_INJURY" },
    { label: "Leave excessively long", desc: "Can kink and thrombose", comp: "CARDIAC_INJURY" },
    { label: "Length is not important", desc: "Critical for graft patency", comp: "CARDIAC_INJURY" }
  ),
  createDecision(37, 5, "Sequential Grafting", "What is sequential grafting in CABG?",
    { label: "Using one conduit to graft multiple coronary arteries with side-to-side anastomoses", desc: "Efficient graft usage" },
    { label: "Grafting the same vessel twice", desc: "Not standard technique", comp: "WRONG_INCISION_SITE" },
    { label: "Only for emergency cases", desc: "Standard technique when appropriate", comp: "WRONG_DIAGNOSIS" },
    { label: "Never used in modern CABG", desc: "Commonly used technique", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(38, 5, "Anastomosis Inspection", "Before tying the suture, what must be verified?",
    { label: "Check for leaks, proper alignment, and graft patency", desc: "Quality assurance" },
    { label: "Tie immediately without checking", desc: "Misses technical errors", comp: "HEMORRHAGE" },
    { label: "Only check the knots", desc: "Leaks and patency critical", comp: "HEMORRHAGE" },
    { label: "Inspection is optional", desc: "Critical quality step", comp: "CARDIAC_INJURY" }
  ),
  createDecision(39, 5, "Hemostasis", "Minor bleeding at the anastomosis. What is the management?",
    { label: "Apply gentle pressure, additional suture if needed, avoid excessive manipulation", desc: "Careful hemostasis" },
    { label: "Ignore minor bleeding", desc: "Can expand to significant hemorrhage", comp: "HEMORRHAGE" },
    { label: "Cauterize the anastomosis", desc: "Damages the graft", comp: "CARDIAC_INJURY" },
    { label: "Replace the entire graft", desc: "Excessive for minor bleeding", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(40, 5, "Vein Graft Preparation", "Before proximal anastomosis, the vein graft is checked. What are you looking for?",
    { label: "Twists, kinks, proper orientation (valve direction), and leaks", desc: "Graft quality assurance" },
    { label: "Only check length", desc: "Orientation critical", comp: "CARDIAC_INJURY" },
    { label: "No preparation needed", desc: "Can cause graft failure", comp: "CARDIAC_INJURY" },
    { label: "Only check for infection", desc: "Sterile field, focus on anatomy", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 6: PROXIMAL ANASTOMOSES & WEANING
  createDecision(41, 6, "Aortic Clamping for Proximal", "How are proximal vein graft anastomoses performed?",
    { label: "Partial aortic clamp (side-biting clamp) with small aortotomies", desc: "Standard technique" },
    { label: "No clamping needed", desc: "Bleeding from aorta is massive", comp: "HEMORRHAGE" },
    { label: "Full aortic cross-clamp", desc: "Unnecessary for proximal grafts", comp: "CARDIAC_INJURY" },
    { label: "Only one proximal anastomosis allowed", desc: "Multiple can be performed", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(42, 6, "Aortotomy", "What is the correct size for aortotomy for vein graft?",
    { label: "Match the vein graft diameter with appropriate punch (4-5mm typically)", desc: "Proper sizing" },
    { label: "Largest possible hole", desc: "Causes bleeding and aneurysm risk", comp: "HEMORRHAGE" },
    { label: "Smallest possible hole", desc: "Restricts graft flow", comp: "CARDIAC_INJURY" },
    { label: "No measurement needed", desc: "Size mismatch causes problems", comp: "CARDIAC_INJURY" }
  ),
  createDecision(43, 6, "Aortic Atherosclerosis", "Severe atherosclerosis in ascending aorta. How do you proceed with proximal anastomosis?",
    { label: "Consider single cross-clamp technique or alternate sites like innominate artery", desc: "Avoid embolic stroke" },
    { label: "Proceed normally", desc: "High risk of atheroembolism and stroke", comp: "CARDIAC_INJURY" },
    { label: "Cancel surgery", desc: "Alternatives exist", comp: "WRONG_DIAGNOSIS" },
    { label: "Only use LIMA", desc: "Limits completeness of revascularization", comp: "CARDIAC_INJURY" }
  ),
  createDecision(44, 6, "Rewarming", "When should rewarming begin?",
    { label: "During the last distal anastomosis to prepare for weaning from CPB", desc: "Timing optimization" },
    { label: "Before any anastomosis", desc: "Too early, wastes time", comp: "WRONG_DIAGNOSIS" },
    { label: "After all anastomoses complete", desc: "Delays weaning", comp: "WRONG_DIAGNOSIS" },
    { label: "No rewarming needed", desc: "Must return to normothermia", comp: "CARDIAC_INJURY" }
  ),
  createDecision(45, 6, "De-airing", "Before releasing cross-clamp, what maneuver is critical?",
    { label: "De-air the heart through the aortic root and left ventricle vent site", desc: "Prevents air embolism" },
    { label: "Open everything immediately", desc: "Air embolism to brain", comp: "CARDIAC_INJURY" },
    { label: "No de-airing needed", desc: "Air in heart causes stroke", comp: "CARDIAC_INJURY" },
    { label: "Only check the aorta", desc: "Air can be in any chamber", comp: "CARDIAC_INJURY" }
  ),
  createDecision(46, 6, "Cross-Clamp Release", "After cross-clamp release, what rhythm is expected?",
    { label: "Variable - may need defibrillation for VF or pacing for bradycardia", desc: "Anticipate arrhythmias" },
    { label: "Immediate normal sinus rhythm", desc: "Often needs intervention", comp: "CARDIAC_INJURY" },
    { label: "Ventricular tachycardia always", desc: "Variable rhythm expected", comp: "WRONG_DIAGNOSIS" },
    { label: "No heart activity", desc: "Heart usually resumes activity", comp: "CARDIAC_INJURY" }
  ),
  createDecision(47, 6, "Defibrillation", "Heart is in ventricular fibrillation after cross-clamp release. What do you do?",
    { label: "Internal defibrillation at 10-20 joules", desc: "Standard treatment" },
    { label: "External defibrillation at 360 joules", desc: "Internal pads preferred", comp: "CARDIAC_INJURY" },
    { label: "Wait for spontaneous conversion", desc: "Prolongs ischemia", comp: "CARDIAC_INJURY" },
    { label: "Give more cardioplegia", desc: "Cardioplegia causes arrest", comp: "CARDIAC_INJURY" }
  ),
  createDecision(48, 6, "Temporary Pacing Wires", "Why are temporary pacing wires placed?",
    { label: "To treat bradycardia or heart block in the postoperative period", desc: "Standard safety measure" },
    { label: "Permanent pacing", desc: "Temporary only", comp: "WRONG_DIAGNOSIS" },
    { label: "Not needed in CABG", desc: "Standard practice", comp: "CARDIAC_INJURY" },
    { label: "For monitoring only", desc: "Active pacing capability", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(49, 6, "Weaning from CPB", "What parameters are assessed before weaning from CPB?",
    { label: "Adequate heart rate, rhythm, blood pressure, and contractility on TEE", desc: "Comprehensive assessment" },
    { label: "Only blood pressure", desc: "Incomplete assessment", comp: "CARDIAC_INJURY" },
    { label: "No assessment needed", desc: "Risk of failed weaning", comp: "CARDIAC_INJURY" },
    { label: "Only ECG", desc: "Need hemodynamic and TEE data", comp: "CARDIAC_INJURY" }
  ),
  createDecision(50, 6, "Inotropic Support", "The heart has poor contractility after weaning. What is the first-line support?",
    { label: "Low-dose epinephrine or dobutamine for inotropic support", desc: "Standard pharmacologic support" },
    { label: "Immediately return to CPB", desc: "Try pharmacologic support first", comp: "WRONG_DIAGNOSIS" },
    { label: "No medications needed", desc: "Low output state is dangerous", comp: "CARDIAC_INJURY" },
    { label: "High-dose beta-blocker", desc: "Further depresses myocardium", comp: "CARDIAC_INJURY" }
  ),
  createDecision(51, 6, "IABP Indication", "When is intra-aortic balloon pump indicated?",
    { label: "Failed weaning from CPB, severe low output syndrome, or pre-op cardiogenic shock", desc: "Mechanical support indication" },
    { label: "Routine use in all CABG", desc: "Selective use", comp: "WRONG_DIAGNOSIS" },
    { label: "Never used", desc: "Important rescue device", comp: "CARDIAC_INJURY" },
    { label: "Only for valve surgery", desc: "Used in CABG when needed", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(52, 6, "Heparin Reversal", "After successful weaning, what is given to reverse heparin?",
    { label: "Protamine sulfate dosed based on heparin given (typically 1mg per 100 units heparin)", desc: "Standard reversal" },
    { label: "More heparin", desc: "Opposite of needed", comp: "HEMORRHAGE" },
    { label: "No reversal needed", desc: "Essential to restore coagulation", comp: "HEMORRHAGE" },
    { label: "Aspirin", desc: "Not a reversal agent", comp: "HEMORRHAGE" }
  ),
  createDecision(53, 6, "Protamine Reaction", "Patient develops hypotension after protamine. What is the cause?",
    { label: "Protamine reaction - histamine release or anaphylactoid reaction", desc: "Known complication" },
    { label: "Normal response", desc: "Hypotension is abnormal", comp: "CARDIAC_INJURY" },
    { label: "Give more protamine", desc: "Worsens reaction", comp: "CARDIAC_INJURY" },
    { label: "Ignore and continue", desc: "Can progress to cardiac arrest", comp: "CARDIAC_INJURY" }
  ),

  // PHASE 7: CLOSURE
  createDecision(54, 7, "Chest Tube Placement", "Where are chest tubes placed?",
    { label: "Anterior and posterior mediastinal tubes, plus pleural tubes if pleura opened", desc: "Standard drainage" },
    { label: "No drainage tubes needed", desc: "Blood accumulates in mediastinum", comp: "CARDIAC_INJURY" },
    { label: "Only one tube", desc: "Insufficient drainage", comp: "CARDIAC_INJURY" },
    { label: "Abdominal drains", desc: "Not the chest cavity", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(55, 7, "Sternal Closure", "How is the sternum closed?",
    { label: "Stainless steel wires (typically 5-7 wires) in figure-of-8 or simple pattern", desc: "Standard technique" },
    { label: "Glue only", desc: "Cannot hold sternum together", comp: "CARDIAC_INJURY" },
    { label: "Absorbable sutures", desc: "Insufficient strength", comp: "CARDIAC_INJURY" },
    { label: "Leave the sternum open", desc: "Only for specific complications", comp: "CARDIAC_INJURY" }
  ),
  createDecision(56, 7, "Wire Tightening", "What technique ensures proper sternal approximation?",
    { label: "Tighten wires sequentially with adequate approximation without overriding edges", desc: "Proper technique" },
    { label: "Maximum tension on all wires", desc: "Can cut through bone", comp: "CARDIAC_INJURY" },
    { label: "Leave wires loose", desc: "Sternal dehiscence risk", comp: "CARDIAC_INJURY" },
    { label: "Only one wire needed", desc: "Inadequate fixation", comp: "CARDIAC_INJURY" }
  ),
  createDecision(57, 7, "Fascial Closure", "How is the fascia closed?",
    { label: "Continuous absorbable suture (0-Vicryl or similar)", desc: "Standard fascial closure" },
    { label: "Leave fascia open", desc: "Hernia and dehiscence risk", comp: "BOWEL_PERFORATION" },
    { label: "Staples on fascia", desc: "Not appropriate for fascia", comp: "CARDIAC_INJURY" },
    { label: "No closure needed", desc: "Layered closure essential", comp: "CARDIAC_INJURY" }
  ),
  createDecision(58, 7, "Skin Closure", "How is the skin closed?",
    { label: "Subcuticular absorbable suture with adhesive strips", desc: "Optimal cosmetic result" },
    { label: "Heavy staples", desc: "Poor cosmetic outcome", comp: "WRONG_DIAGNOSIS" },
    { label: "Leave open to heal", desc: "Increased infection risk", comp: "BOWEL_PERFORATION" },
    { label: "Superglue only", desc: "Insufficient alone", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 8: POST-OP ICU
  createDecision(59, 8, "ICU Monitoring", "What is monitored in the ICU after CABG?",
    { label: "ECG, arterial line, PA catheter, chest tube output, temperature, urine output", desc: "Complete monitoring" },
    { label: "Only ECG", desc: "Misses hemodynamic data", comp: "CARDIAC_INJURY" },
    { label: "No monitoring needed", desc: "Critical post-op period", comp: "CARDIAC_INJURY" },
    { label: "Only chest tubes", desc: "Incomplete monitoring", comp: "CARDIAC_INJURY" }
  ),
  createDecision(60, 8, "Bleeding Threshold", "When is re-exploration for bleeding indicated?",
    { label: "Output >400ml in first hour or >200ml/hour for 2+ hours, or signs of tamponade", desc: "Standard threshold" },
    { label: "Any bleeding", desc: "Too sensitive, most resolve", comp: "WRONG_DIAGNOSIS" },
    { label: "Never re-explore", desc: "Tamponade is fatal", comp: "CARDIAC_INJURY" },
    { label: "Only if BP drops to 50", desc: "Too late, patient in extremis", comp: "CARDIAC_INJURY" }
  ),
  createDecision(61, 8, "Arrhythmia Management", "Patient develops atrial fibrillation post-op. What is first-line treatment?",
    { label: "Rate control with beta-blocker (metoprolol) or amiodarone for rhythm control", desc: "Standard AFib management" },
    { label: "Immediate cardioversion", desc: "Try pharmacologic first if stable", comp: "CARDIAC_INJURY" },
    { label: "No treatment needed", desc: "Can cause hemodynamic instability", comp: "CARDIAC_INJURY" },
    { label: "Digoxin only", desc: "Slower onset, beta-blocker preferred", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(62, 8, "Extubation Timing", "When can the patient be extubated?",
    { label: "When hemodynamically stable, normothermic, following commands, and adequate gas exchange", desc: "Fast-track criteria" },
    { label: "Immediately after surgery", desc: "Too early, patient not stable", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Wait 24 hours minimum", desc: "Fast-track allows earlier extubation", comp: "WRONG_DIAGNOSIS" },
    { label: "Never extubate", desc: "Goal is early extubation", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(63, 8, "Pain Management", "What is optimal post-CABG pain control?",
    { label: "Multimodal: IV acetaminophen, NSAIDs if renal function allows, plus opioid PCA as needed", desc: "Enhanced recovery protocol" },
    { label: "High-dose morphine only", desc: "Side effects limit recovery", comp: "ANESTHESIA_OVERDOSE" },
    { label: "No pain medication", desc: "Pain impairs breathing", comp: "PNEUMOTHORAX" },
    { label: "Only oral medications", desc: "IV needed initially", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(64, 8, "Antiplatelet Initiation", "When is aspirin resumed after CABG?",
    { label: "Within 6 hours post-op, continuing indefinitely", desc: "Graft patency protection" },
    { label: "Never resume aspirin", desc: "Increases graft occlusion", comp: "CARDIAC_INJURY" },
    { label: "Wait 1 week", desc: "Earlier is better for grafts", comp: "CARDIAC_INJURY" },
    { label: "Only if chest pain develops", desc: "Prophylactic use essential", comp: "CARDIAC_INJURY" }
  ),
  createDecision(65, 8, "Statin Resumption", "When are statins resumed?",
    { label: "Immediately post-op, continue indefinitely", desc: "Plaque stabilization" },
    { label: "Discontinue statin", desc: "Increases cardiovascular events", comp: "CARDIAC_INJURY" },
    { label: "Wait one month", desc: "Earlier resumption beneficial", comp: "CARDIAC_INJURY" },
    { label: "Only if cholesterol is high", desc: "Statins are protective regardless", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(66, 8, "Beta-Blocker Resumption", "Why continue beta-blockers after CABG?",
    { label: "Reduces post-op atrial fibrillation and improves long-term outcomes", desc: "Proven benefit" },
    { label: "No benefit post-CABG", desc: "Clearly beneficial", comp: "CARDIAC_INJURY" },
    { label: "Stop at discharge", desc: "Continue long-term", comp: "CARDIAC_INJURY" },
    { label: "Only for hypertension", desc: "Benefit extends beyond BP control", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(67, 8, "Wound Infection Signs", "What indicates sternal wound infection?",
    { label: "Redness, drainage, instability, fever, and increased pain at sternum", desc: "Classic signs" },
    { label: "Only fever", desc: "Multiple signs needed", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal healing always", desc: "Infection can occur", comp: "BOWEL_PERFORATION" },
    { label: "Only check leg wounds", desc: "Sternal infection most serious", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(68, 8, "Mediastinitis", "How is deep sternal wound infection (mediastinitis) managed?",
    { label: "Surgical debridement, antibiotics, and possible muscle flap reconstruction", desc: "Aggressive treatment" },
    { label: "Oral antibiotics only", desc: "Insufficient for mediastinitis", comp: "BOWEL_PERFORATION" },
    { label: "Wait and see", desc: "Highly lethal without treatment", comp: "BOWEL_PERFORATION" },
    { label: "No treatment available", desc: "Requires surgery", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(69, 8, "Leg Wound Care", "Saphenous vein harvest site has serous drainage. What is the management?",
    { label: "Local wound care, elevation, and antibiotics if cellulitis develops", desc: "Conservative management" },
    { label: "Immediate surgical debridement", desc: "Only for severe infection", comp: "WRONG_DIAGNOSIS" },
    { label: "Ignore the drainage", desc: "Can progress to infection", comp: "BOWEL_PERFORATION" },
    { label: "Amputate the leg", desc: "Drastic and unnecessary", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(70, 8, "Rehabilitation", "When should cardiac rehabilitation begin?",
    { label: "In-hospital phase starting POD 1-2, continuing outpatient for 12 weeks", desc: "Proven mortality benefit" },
    { label: "Wait 3 months", desc: "Earlier rehab improves outcomes", comp: "CARDIAC_INJURY" },
    { label: "No rehab needed", desc: "Essential for recovery", comp: "CARDIAC_INJURY" },
    { label: "Only for young patients", desc: "Benefit all ages", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(71, 8, "Discharge Criteria", "When is patient ready for discharge?",
    { label: "Stable vitals, ambulating, tolerating diet, pain controlled, no fevers", desc: "Standard criteria" },
    { label: "Day 1 post-op", desc: "Too early for CABG", comp: "CARDIAC_INJURY" },
    { label: "Only when pain-free", desc: "Pain controlled, not absent", comp: "WRONG_DIAGNOSIS" },
    { label: "Keep for 2 weeks minimum", desc: "Usually 4-7 days sufficient", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(72, 8, "Follow-Up", "When is the first post-op follow-up?",
    { label: "2-4 weeks for wound check and medication adjustment", desc: "Standard timing" },
    { label: "6 months later", desc: "Too long, misses complications", comp: "CARDIAC_INJURY" },
    { label: "No follow-up needed", desc: "Critical for monitoring", comp: "CARDIAC_INJURY" },
    { label: "Next day", desc: "Patient still in hospital", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(73, 8, "Graft Patency", "How is graft patency monitored?",
    { label: "Clinical symptoms, stress testing at 6-12 months, or CT angiography if symptoms develop", desc: "Standard surveillance" },
    { label: "No monitoring needed", desc: "Grafts can occlude", comp: "CARDIAC_INJURY" },
    { label: "Daily angiography", desc: "Invasive and unnecessary", comp: "CARDIAC_INJURY" },
    { label: "Only if chest pain", desc: "Asymptomatic occlusion possible", comp: "CARDIAC_INJURY" }
  ),
  createDecision(74, 8, "Return to Work", "When can the patient return to work?",
    { label: "4-12 weeks depending on job demands and recovery progress", desc: "Individualized timing" },
    { label: "Next day", desc: "Impossible after major surgery", comp: "CARDIAC_INJURY" },
    { label: "Never return to work", desc: "Most patients return", comp: "WRONG_DIAGNOSIS" },
    { label: "6 months minimum", desc: "Usually sooner for most jobs", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(75, 8, "Driving", "When can the patient drive?",
    { label: "4-6 weeks when sternum has healed enough for seat belt safety", desc: "Safety consideration" },
    { label: "Immediately", desc: "Sternal healing needed", comp: "CARDIAC_INJURY" },
    { label: "Never drive again", desc: "Most can drive after healing", comp: "WRONG_DIAGNOSIS" },
    { label: "1 week", desc: "Too soon for sternal healing", comp: "CARDIAC_INJURY" }
  ),
  createDecision(76, 8, "Lifestyle Modification", "What lifestyle changes are essential after CABG?",
    { label: "Smoking cessation, heart-healthy diet, regular exercise, and medication adherence", desc: "Comprehensive approach" },
    { label: "No changes needed", desc: "Disease will progress", comp: "CARDIAC_INJURY" },
    { label: "Only take medications", desc: "Lifestyle is equally important", comp: "CARDIAC_INJURY" },
    { label: "Continue smoking", desc: "Major graft failure risk", comp: "CARDIAC_INJURY" }
  ),
  createDecision(77, 8, "Case Closure", "Patient discharged with LIMA-LAD, SVG-OM1, SVG-PDA grafts. What is the outcome?",
    { label: "Complete revascularization achieved - proceed to cardiac rehabilitation", desc: "Successful outcome" },
    { label: "Partial success", desc: "Three-vessel bypass complete", comp: "WRONG_DIAGNOSIS" },
    { label: "Failed procedure", desc: "Patient discharged successfully", comp: "WRONG_DIAGNOSIS" },
    { label: "Need immediate reoperation", desc: "No indication given", comp: "CARDIAC_INJURY" }
  ),
  createDecision(78, 8, "Final Pearl", "What is the most important factor in long-term CABG success?",
    { label: "Complete revascularization, LIMA to LAD, and aggressive risk factor modification", desc: "Proven determinants" },
    { label: "Fast surgery", desc: "Quality over speed", comp: "WRONG_DIAGNOSIS" },
    { label: "Expensive grafts", desc: "Technique matters more", comp: "WRONG_DIAGNOSIS" },
    { label: "Minimal medications", desc: "Medications are essential", comp: "CARDIAC_INJURY" }
  )
];

export const PATIENT = {
  name: "Robert M.",
  age: 64,
  gender: "Male",
  weight: "88 kg",
  bloodType: "A+",
  admission: "Severe chest pain, multi-vessel coronary artery disease on angiography",
  mood: "Lethargic",
  comorbidities: ["hypertension", "diabetes"],
  procedureCategory: "cardiovascular"
};

export const PHASES = [
  { id: 1, name: "Pre-Op Evaluation", icon: "🩺", short: "Pre-Op" },
  { id: 2, name: "Anesthesia & Induction", icon: "💉", short: "Induction" },
  { id: 3, name: "Sternotomy & Harvest", icon: "🔪", short: "Harvest" },
  { id: 4, name: "Cardiopulmonary Bypass", icon: "🫀", short: "CPB" },
  { id: 5, name: "Distal Anastomoses", icon: "🪡", short: "Distal" },
  { id: 6, name: "Proximal & Weaning", icon: "📈", short: "Proximal" },
  { id: 7, name: "Closure", icon: "🪢", short: "Close" },
  { id: 8, name: "ICU & Recovery", icon: "🏥", short: "ICU" },
];

export const cabgData = { PATIENT, PHASES, DECISIONS };
