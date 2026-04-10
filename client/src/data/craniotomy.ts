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
        { id: "1", label: "Apply direct pressure with surgical patties and identify bleeding source", desc: "Standard bleeding control", correct: true },
        { id: "2", label: "Use bipolar cautery on low setting to control vessel", desc: "Direct surgical control", correct: true },
        { id: "3", label: "Ignore bleeding and continue", desc: "Blood accumulates in surgical field", correct: false }
      ];
    case "CARDIAC_INJURY":
      return [
        { id: "1", label: "Initiate ACLS and treat arrhythmias", desc: "Life-saving intervention", correct: true },
        { id: "2", label: "Administer appropriate vasopressors", desc: "Hemodynamic support", correct: true },
        { id: "3", label: "Wait for spontaneous recovery", desc: "Brain herniation imminent", correct: false }
      ];
    case "ANESTHESIA_OVERDOSE":
      return [
        { id: "1", label: "Reduce anesthetic agents and hyperventilate", desc: "Clear volatile anesthetics", correct: true },
        { id: "2", label: "Administer reversal agents if appropriate", desc: "Specific antidotes", correct: true },
        { id: "3", label: "Continue current anesthetic", desc: "Prolongs CNS depression", correct: false }
      ];
    case "ANESTHESIA_UNDERDOSE":
      return [
        { id: "1", label: "Increase anesthetic agent concentration", desc: "Achieve adequate depth", correct: true },
        { id: "2", label: "Administer additional propofol bolus", desc: "Rapid deepening", correct: true },
        { id: "3", label: "Ignore and continue surgery", desc: "Patient may wake up intra-op", correct: false }
      ];
    case "NERVE_DAMAGE":
      return [
        { id: "1", label: "Halt dissection and identify the nerve structure", desc: "Prevents further injury", correct: true },
        { id: "2", label: "Use nerve monitoring to assess function", desc: "Diagnostic assessment", correct: true },
        { id: "3", label: "Continue dissection", desc: "Permanent deficit risk", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Abort and reassess anatomical landmarks with navigation", desc: "Prevents wrong location", correct: true },
        { id: "2", label: "Consult with senior surgeon", desc: "Safe intra-op consultation", correct: true },
        { id: "3", label: "Continue with current trajectory", desc: "Wrong brain area accessed", correct: false }
      ];
    case "PNEUMOTHORAX":
      return [
        { id: "1", label: "Needle decompression followed by chest tube", desc: "Definitive treatment", correct: true },
        { id: "2", label: "High-flow oxygen and monitor", desc: "Insufficient for tension pneumothorax", correct: false },
        { id: "3", label: "Call thoracic surgery consult", desc: "Neurosurgery can place chest tube", correct: true }
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
  createDecision(1, 1, "Initial Presentation", "A 41-year-old female presents with severe headache, left-sided weakness, and confusion. MRI shows a 4cm right frontal mass. What is the first diagnostic priority?",
    { label: "Determine lesion type via imaging characteristics and rule out metastatic workup", desc: "Essential surgical planning" },
    { label: "Proceed directly to surgery without imaging", desc: "Cannot plan approach", comp: "WRONG_INCISION_SITE" },
    { label: "Only check blood glucose", desc: "Incomplete neurological workup", comp: "WRONG_DIAGNOSIS" },
    { label: "Discharge home with pain medications", desc: "Mass lesion requires intervention", comp: "CARDIAC_INJURY" }
  ),
  createDecision(2, 1, "Neurological Exam", "On exam, patient has left hemiparesis (3/5 strength) and left homonymous hemianopsia. What does this indicate?",
    { label: "Right frontal/parietal mass effect causing contralateral deficits", desc: "Classic neuroanatomy" },
    { label: "Left hemisphere lesion", desc: "Wrong - deficits are contralateral", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal findings for brain mass", desc: "Significant neurological deficits present", comp: "CARDIAC_INJURY" },
    { label: "Spinal cord compression", desc: "Brain mass, not spinal issue", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Imaging Review", "MRI shows a 4cm enhancing mass with surrounding edema and 5mm midline shift. What type of craniotomy is indicated?",
    { label: "Right frontal craniotomy for tumor resection", desc: "Correct approach for right frontal mass" },
    { label: "Left frontal craniotomy", desc: "Wrong side - lesion is on right", comp: "WRONG_INCISION_SITE" },
    { label: "Posterior fossa craniotomy", desc: "Wrong location for frontal lesion", comp: "WRONG_INCISION_SITE" },
    { label: "No surgery needed", desc: "Symptomatic mass requires resection", comp: "CARDIAC_INJURY" }
  ),
  createDecision(4, 1, "ICP Management", "Patient has papilledema on fundoscopy. What does this indicate?",
    { label: "Elevated intracranial pressure requiring urgent intervention", desc: "Critical finding" },
    { label: "Normal finding", desc: "Papilledema indicates increased ICP", comp: "CARDIAC_INJURY" },
    { label: "Eye infection", desc: "Unrelated to neurological findings", comp: "WRONG_DIAGNOSIS" },
    { label: "Benign condition", desc: "Requires urgent treatment", comp: "CARDIAC_INJURY" }
  ),
  createDecision(5, 1, "Pre-Op Medications", "What medications should be started pre-operatively for brain edema?",
    { label: "Dexamethasone to reduce vasogenic edema", desc: "Standard neurosurgical protocol" },
    { label: "No medications needed", desc: "Edema will worsen without treatment", comp: "CARDIAC_INJURY" },
    { label: "Only Tylenol", desc: "Insufficient for cerebral edema", comp: "CARDIAC_INJURY" },
    { label: "Aspirin", desc: "Increases bleeding risk", comp: "HEMORRHAGE" }
  ),
  createDecision(6, 1, "Seizure Prophylaxis", "Should anti-epileptic medication be started?",
    { label: "Yes, levetiracetam for seizure prophylaxis in supratentorial tumor", desc: "Standard prophylaxis" },
    { label: "No, wait for seizure to occur", desc: "Prophylaxis is standard", comp: "CARDIAC_INJURY" },
    { label: "Only if patient has history of seizures", desc: "Prophylaxis indicated for all", comp: "CARDIAC_INJURY" },
    { label: "Use sedatives instead", desc: "Not anti-epileptic", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(7, 1, "Consent Discussion", "What risks must be discussed for craniotomy?",
    { label: "Bleeding, infection, stroke, seizure, neurological deficit, and possible need for further surgery", desc: "Complete risk disclosure" },
    { label: "Only mention anesthesia risks", desc: "Incomplete consent", comp: "WRONG_DIAGNOSIS" },
    { label: "Say there are no major risks", desc: "Unethical and factually wrong", comp: "WRONG_DIAGNOSIS" },
    { label: "Only discuss cosmetic outcome", desc: "Misses life-threatening risks", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2: ANESTHESIA & POSITIONING
  createDecision(8, 2, "Anesthesia Goals", "What are the primary anesthesia goals for craniotomy?",
    { label: "Maintain CPP >60mmHg, avoid increased ICP, ensure brain relaxation, prevent coughing/bucking", desc: "Neuroanesthesia principles" },
    { label: "Only focus on blood pressure", desc: "Multiple parameters critical", comp: "CARDIAC_INJURY" },
    { label: "Light anesthesia for faster wake-up", desc: "Risk of awareness and coughing", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Deep anesthesia only", desc: "Must also consider ICP and CPP", comp: "CARDIAC_INJURY" }
  ),
  createDecision(9, 2, "ICP Reduction", "Before incision, what maneuvers reduce ICP?",
    { label: "Elevate head 30 degrees, hyperventilation to PaCO2 25-30, mannitol, and avoid hypotension", desc: "Standard ICP reduction" },
    { label: "Flat positioning", desc: "Increases ICP", comp: "CARDIAC_INJURY" },
    { label: "Hypercapnia (high CO2)", desc: "Increases cerebral blood flow and ICP", comp: "CARDIAC_INJURY" },
    { label: "No ICP management needed", desc: "Essential for safe surgery", comp: "CARDIAC_INJURY" }
  ),
  createDecision(10, 2, "Mannitol Dosing", "What is the typical mannitol dose for brain relaxation?",
    { label: "0.25-1 g/kg IV over 20 minutes before dural opening", desc: "Standard osmotic diuresis" },
    { label: "0.05 g/kg", desc: "Insufficient for brain relaxation", comp: "CARDIAC_INJURY" },
    { label: "No mannitol needed", desc: "Standard for tumor surgery", comp: "CARDIAC_INJURY" },
    { label: "Oral mannitol", desc: "IV route required", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(11, 2, "Positioning", "How is the patient positioned for right frontal craniotomy?",
    { label: "Supine with head turned 30-45 degrees left, Mayfield pins for fixation", desc: "Standard positioning" },
    { label: "Prone position", desc: "Wrong for frontal approach", comp: "WRONG_INCISION_SITE" },
    { label: "Lateral decubitus right side down", desc: "Wrong positioning", comp: "WRONG_INCISION_SITE" },
    { label: "Sitting position", desc: "Not used for frontal craniotomy", comp: "CARDIAC_INJURY" }
  ),
  createDecision(12, 2, "Mayfield Pinning", "What is critical during Mayfield head holder application?",
    { label: "Avoid pin placement in skull fractures, previous craniotomy sites, or thin temporal bone", desc: "Prevents skull penetration" },
    { label: "Place pins anywhere on skull", desc: "Can penetrate thin bone", comp: "CARDIAC_INJURY" },
    { label: "No pins needed", desc: "Head fixation essential", comp: "WRONG_INCISION_SITE" },
    { label: "Only one pin needed", desc: "Three-point fixation required", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(13, 2, "Neuro Monitoring", "What monitoring is used during craniotomy?",
    { label: "EEG, MEP, SSEP, and cranial nerve monitoring as appropriate for lesion location", desc: "Comprehensive neuromonitoring" },
    { label: "No monitoring needed", desc: "Essential for safe surgery", comp: "NERVE_DAMAGE" },
    { label: "Only ECG", desc: "Insufficient neuro monitoring", comp: "NERVE_DAMAGE" },
    { label: "Only blood pressure", desc: "Need neurological monitoring", comp: "NERVE_DAMAGE" }
  ),
  createDecision(14, 2, "Pre-Op Antibiotics", "What is the appropriate antibiotic prophylaxis?",
    { label: "Cefazolin 2g IV within 60 minutes before incision", desc: "Standard neurosurgical prophylaxis" },
    { label: "No antibiotics needed", desc: "Increases infection risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Only after surgery", desc: "Must be given before incision", comp: "WRONG_DIAGNOSIS" },
    { label: "Oral antibiotics only", desc: "IV route required", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 3: INCISION & CRANIOTOMY
  createDecision(15, 3, "Scalp Incision", "What incision is used for right frontal craniotomy?",
    { label: "Question mark or bicoronal scalp incision to access frontal bone", desc: "Standard approach" },
    { label: "Midline vertical incision only", desc: "Insufficient exposure", comp: "WRONG_INCISION_SITE" },
    { label: "Occipital incision", desc: "Wrong location for frontal lesion", comp: "WRONG_INCISION_SITE" },
    { label: "No incision needed", desc: "Cannot access brain without incision", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(16, 3, "Scalp Bleeding", "Profuse bleeding from scalp edges. What is the management?",
    { label: "Raney clips applied to scalp edges for hemostasis", desc: "Standard hemostasis" },
    { label: "Ignore scalp bleeding", desc: "Significant blood loss occurs", comp: "HEMORRHAGE" },
    { label: "Cauterize entire scalp edge", desc: "Causes tissue necrosis", comp: "WRONG_DIAGNOSIS" },
    { label: "Abort procedure", desc: "Raney clips control bleeding easily", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(17, 3, "Pericranial Flap", "Why is pericranial flap preserved?",
    { label: "For vascularized coverage of dura and closure augmentation", desc: "Useful for wound healing" },
    { label: "No need to preserve", desc: "Important for closure", comp: "CARDIAC_INJURY" },
    { label: "It is discarded", desc: "Preserved for reconstruction", comp: "CARDIAC_INJURY" },
    { label: "Only for cosmetic reasons", desc: "Functional purpose in closure", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(18, 3, "Craniotomy Burr Holes", "Where are burr holes placed for frontal craniotomy?",
    { label: "Keyhole region, temporal region, and along the planned bone flap margin", desc: "Standard burr hole placement" },
    { label: "Only one burr hole", desc: "Insufficient for bone flap", comp: "WRONG_INCISION_SITE" },
    { label: "Posterior fossa", desc: "Wrong location for frontal lesion", comp: "WRONG_INCISION_SITE" },
    { label: "No burr holes needed", desc: "Cannot create bone flap without burr holes", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(19, 3, "Dural Separation", "How is dura separated from bone before craniotomy?",
    { label: "Use a Penfield dissector carefully around the bone flap margins", desc: "Prevents dural tear" },
    { label: "Forceful separation with finger", desc: "Tears dura and cortex", comp: "NERVE_DAMAGE" },
    { label: "No separation needed", desc: "Dura adheres and tears", comp: "NERVE_DAMAGE" },
    { label: "Use craniotome directly", desc: "Blade can cut dura", comp: "CARDIAC_INJURY" }
  ),
  createDecision(20, 3, "Craniotome Use", "What precaution is critical when using the craniotome?",
    { label: "Keep footplate between bone and dura to prevent dural/cortical injury", desc: "Essential safety measure" },
    { label: "Push craniotome deeply", desc: "Can cut brain", comp: "NERVE_DAMAGE" },
    { label: "No footplate needed", desc: "Footplate protects dura", comp: "NERVE_DAMAGE" },
    { label: "Craniotome is not used", desc: "Standard craniotomy tool", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(21, 3, "Bone Flap Elevation", "The bone flap is stuck. What do you do?",
    { label: "Use blunt dissection and check for remaining bone attachments, gentle elevation", desc: "Safe bone removal" },
    { label: "Forcefully pull the bone", desc: "Tears dura and cortex", comp: "NERVE_DAMAGE" },
    { label: "Abort bone removal", desc: "Can safely complete with technique", comp: "WRONG_DIAGNOSIS" },
    { label: "Cut through the bone with saw", desc: "Cannot use saw on elevated flap", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(22, 3, "Bone Bleeding", "Bleeding from bone edges. What is the treatment?",
    { label: "Apply bone wax to diploic bleeding points", desc: "Standard hemostasis" },
    { label: "Ignore bone bleeding", desc: "Continued blood loss", comp: "HEMORRHAGE" },
    { label: "Cauterize bone", desc: "Bone wax is appropriate", comp: "HEMORRHAGE" },
    { label: "No treatment available", desc: "Bone wax is standard", comp: "HEMORRHAGE" }
  ),

  // PHASE 4: DURAL OPENING & BRAIN EXPOSURE
  createDecision(23, 4, "Dural Opening", "How is the dura opened?",
    { label: "Gentle incision with scalpel blade, avoiding underlying cortex", desc: "Safe dural opening" },
    { label: "Cut deeply into brain", desc: "Causes cortical injury", comp: "NERVE_DAMAGE" },
    { label: "Tear with forceps", desc: "Uncontrolled opening", comp: "NERVE_DAMAGE" },
    { label: "No dural opening needed", desc: "Must open dura to access tumor", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(24, 4, "Dural Retraction", "How are dural edges managed?",
    { label: "Suture the dura to the periosteum or hold with forceps for retraction", desc: "Maintains exposure" },
    { label: "Let dura fall back", desc: "Obstructs view", comp: "WRONG_INCISION_SITE" },
    { label: "Cut away the dura", desc: "Dura is needed for closure", comp: "CARDIAC_INJURY" },
    { label: "No management needed", desc: "Retraction essential", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(25, 4, "Brain Relaxation", "Brain is bulging through dural opening. What is the first step?",
    { label: "Check hyperventilation, mannitol effect, and ensure no hypertension", desc: "ICP management" },
    { label: "Push brain back with forceps", desc: "Causes severe injury", comp: "NERVE_DAMAGE" },
    { label: "Ignore bulging brain", desc: "Herniation risk", comp: "CARDIAC_INJURY" },
    { label: "Close immediately without tumor removal", desc: "Address ICP first", comp: "CARDIAC_INJURY" }
  ),
  createDecision(26, 4, "Microscope Positioning", "Why use an operating microscope?",
    { label: "Magnified view for precise tumor dissection and preservation of neural structures", desc: "Essential microsurgery" },
    { label: "Only for resident teaching", desc: "Critical surgical tool", comp: "NERVE_DAMAGE" },
    { label: "No microscope needed", desc: "Cannot see fine detail without", comp: "NERVE_DAMAGE" },
    { label: "Only for documentation", desc: "Essential for surgery", comp: "NERVE_DAMAGE" }
  ),
  createDecision(27, 4, "Cortical Incision", "Where should cortical incision be made?",
    { label: "Over non-eloquent cortex, usually middle frontal gyrus for frontal tumors", desc: "Safe entry point" },
    { label: "Directly over motor cortex", desc: "Causes hemiplegia", comp: "NERVE_DAMAGE" },
    { label: "Any location is fine", desc: "Eloquent areas must be avoided", comp: "NERVE_DAMAGE" },
    { label: "Through speech area", desc: "Causes aphasia", comp: "NERVE_DAMAGE" }
  ),
  createDecision(28, 4, "Neuro Navigation", "How is navigation used during surgery?",
    { label: "Register patient, confirm approach trajectory, and periodically verify tumor location", desc: "Standard navigation use" },
    { label: "No navigation needed", desc: "Essential for tumor localization", comp: "WRONG_INCISION_SITE" },
    { label: "Only use at beginning", desc: "Must periodically verify", comp: "WRONG_INCISION_SITE" },
    { label: "Navigation is unreliable", desc: "Proven accuracy when registered", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(29, 4, "Brain Shift", "During tumor resection, navigation shows significant brain shift. What do you do?",
    { label: "Update navigation registration or use ultrasound for real-time guidance", desc: "Compensate for shift" },
    { label: "Ignore navigation errors", desc: "Can resect wrong tissue", comp: "WRONG_INCISION_SITE" },
    { label: "Stop using navigation", desc: "Update or use adjuncts", comp: "WRONG_INCISION_SITE" },
    { label: "Brain shift does not occur", desc: "Common phenomenon", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 5: TUMOR RESECTION
  createDecision(30, 5, "Tumor Identification", "How is tumor distinguished from normal brain?",
    { label: "Different color/texture, abnormal consistency, navigation guidance, and sometimes fluorescence", desc: "Multiple modalities" },
    { label: "All tissue looks the same", desc: "Tumor has distinct features", comp: "NERVE_DAMAGE" },
    { label: "Only use navigation", desc: "Tissue characteristics important", comp: "NERVE_DAMAGE" },
    { label: "Random tissue removal", desc: "Must identify tumor margins", comp: "NERVE_DAMAGE" }
  ),
  createDecision(31, 5, "Internal Debulking", "What technique is used for large tumors?",
    { label: "Internal debulking with ultrasonic aspirator or suction/cautery before separating margins", desc: "Standard technique" },
    { label: "Remove tumor in one piece", desc: "Large tumors require debulking", comp: "NERVE_DAMAGE" },
    { label: "Only remove surface", desc: "Must remove entire tumor", comp: "CARDIAC_INJURY" },
    { label: "No debulking needed", desc: "Large tumors need internal debulking", comp: "NERVE_DAMAGE" }
  ),
  createDecision(32, 5, "Ultrasonic Aspirator", "What is the purpose of CUSA (ultrasonic aspirator)?",
    { label: "Emulsify and aspirate tumor tissue while preserving vessels and nerves", desc: "Selective tumor removal" },
    { label: "Cut bone", desc: "Not designed for bone", comp: "WRONG_INCISION_SITE" },
    { label: "No specific purpose", desc: "Essential tumor tool", comp: "NERVE_DAMAGE" },
    { label: "Only for biopsy", desc: "Used for resection", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(33, 5, "Tumor Margins", "How are tumor margins defined?",
    { label: "Use navigation, tissue characteristics, and frozen section if needed", desc: "Comprehensive margin assessment" },
    { label: "Remove until normal tissue appears", desc: "Need histology for confirmation", comp: "NERVE_DAMAGE" },
    { label: "Remove predetermined volume", desc: "Must identify actual tumor margins", comp: "WRONG_INCISION_SITE" },
    { label: "Margins are not important", desc: "Critical for outcome", comp: "CARDIAC_INJURY" }
  ),
  createDecision(34, 5, "Vessel Handling", "You encounter a vessel in the tumor bed. What do you do?",
    { label: "Determine if vessel is tumor feeder or traversing normal vessel before deciding to divide", desc: "Preserves normal vasculature" },
    { label: "Cauterize all vessels", desc: "May be normal vessels", comp: "CARDIAC_INJURY" },
    { label: "Ignore vessels", desc: "Bleeding will occur", comp: "HEMORRHAGE" },
    { label: "Clip without inspection", desc: "May occlude normal vessel", comp: "CARDIAC_INJURY" }
  ),
  createDecision(35, 5, "Bleeding Control", "Tumor bed is bleeding. What is the management?",
    { label: "Bipolar cautery, surgical patties with thrombin, and gentle pressure", desc: "Standard hemostasis" },
    { label: "Ignore bleeding", desc: "Hematoma formation risk", comp: "HEMORRHAGE" },
    { label: "Monopolar cautery at high power", desc: "Damages surrounding brain", comp: "NERVE_DAMAGE" },
    { label: "Pack with gauze", desc: "Use brain-safe materials", comp: "NERVE_DAMAGE" }
  ),
  createDecision(36, 5, "Frozen Section", "What is the purpose of intraoperative frozen section?",
    { label: "Preliminary diagnosis to guide surgical decision-making", desc: "Immediate pathology" },
    { label: "No purpose", desc: "Guides extent of resection", comp: "WRONG_DIAGNOSIS" },
    { label: "Only for research", desc: "Standard clinical practice", comp: "WRONG_DIAGNOSIS" },
    { label: "Replace permanent pathology", desc: "Only preliminary result", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(37, 5, "Eloquent Area", "Tumor extends near motor cortex. How do you proceed?",
    { label: "Use neuro monitoring, stimulation mapping, and stop at functional boundaries", desc: "Preserves function" },
    { label: "Continue resection through motor cortex", desc: "Causes permanent hemiplegia", comp: "NERVE_DAMAGE" },
    { label: "Abort resection entirely", desc: "Can safely approach with monitoring", comp: "WRONG_DIAGNOSIS" },
    { label: "No special precautions needed", desc: "Motor mapping essential", comp: "NERVE_DAMAGE" }
  ),
  createDecision(38, 5, "Motor Mapping", "How is motor mapping performed?",
    { label: "Direct electrical stimulation of cortex while observing for motor response", desc: "Standard mapping" },
    { label: "Visual inspection only", desc: "Cannot identify functional tissue", comp: "NERVE_DAMAGE" },
    { label: "No mapping available", desc: "Standard technique", comp: "NERVE_DAMAGE" },
    { label: "Only for spinal surgery", desc: "Used in brain surgery", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(39, 5, "Gross Total Resection", "What is the goal for this tumor?",
    { label: "Gross total resection when safely achievable without neurological deficit", desc: "Optimal outcome" },
    { label: "Biopsy only", desc: "Resection is indicated", comp: "CARDIAC_INJURY" },
    { label: "Partial resection always", desc: "Maximal safe resection goal", comp: "CARDIAC_INJURY" },
    { label: "No resection goal", desc: "Clear surgical objective", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(40, 5, "Resection Cavity", "After tumor removal, what is inspected?",
    { label: "Cavity walls for residual tumor, hemostasis, and CSF leakage", desc: "Complete assessment" },
    { label: "Only check bleeding", desc: "Must also check for residual", comp: "CARDIAC_INJURY" },
    { label: "Close immediately", desc: "Must inspect cavity", comp: "CARDIAC_INJURY" },
    { label: "No inspection needed", desc: "Essential safety step", comp: "CARDIAC_INJURY" }
  ),

  // PHASE 6: CLOSURE
  createDecision(41, 6, "Hemostasis", "What ensures complete hemostasis before closure?",
    { label: "Irrigation, bipolar cautery, hemostatic agents, and Valsalva maneuver to check for bleeding", desc: "Comprehensive hemostasis" },
    { label: "Only visual inspection", desc: "Must challenge with Valsalva", comp: "HEMORRHAGE" },
    { label: "No hemostasis needed", desc: "Post-op hemorrhage is devastating", comp: "HEMORRHAGE" },
    { label: "Pack cavity with gauze", desc: "Hemostatic agents preferred", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(42, 6, "Dural Closure", "How is the dura closed?",
    { label: "Watertight closure with 4-0 Nurolon or similar suture", desc: "Prevents CSF leak" },
    { label: "Leave dura open", desc: "CSF leak and infection risk", comp: "CARDIAC_INJURY" },
    { label: "Close with staples", desc: "Cannot close dura with staples", comp: "CARDIAC_INJURY" },
    { label: "Glue only", desc: "Suture closure essential", comp: "CARDIAC_INJURY" }
  ),
  createDecision(43, 6, "Dural Substitute", "When is dural substitute used?",
    { label: "When primary dura cannot be closed without tension, or duraplasty is needed", desc: "Augments closure" },
    { label: "Never used", desc: "Commonly needed", comp: "CARDIAC_INJURY" },
    { label: "Always use substitute", desc: "Use when needed", comp: "WRONG_DIAGNOSIS" },
    { label: "Only for spine", desc: "Used in cranial surgery", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(44, 6, "Bone Flap Replacement", "How is the bone flap secured?",
    { label: "Titanium plates and screws at multiple points around craniotomy", desc: "Standard fixation" },
    { label: "Glue only", desc: "Insufficient fixation", comp: "WRONG_INCISION_SITE" },
    { label: "Leave bone off", desc: "Only for decompression", comp: "WRONG_INCISION_SITE" },
    { label: "One screw", desc: "Inadequate fixation", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(45, 6, "Bone Flap Storage", "If bone flap cannot be replaced, where is it stored?",
    { label: "In the patient's abdomen or bone bank for later cranioplasty", desc: "Standard storage" },
    { label: "Discard the bone", desc: "Cannot perform cranioplasty later", comp: "WRONG_INCISION_SITE" },
    { label: "Leave on table", desc: "Will become contaminated", comp: "CARDIAC_INJURY" },
    { label: "Return to sterile field", desc: "Cannot be stored indefinitely", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(46, 6, "Drain Placement", "When is a subgaleal drain placed?",
    { label: "When significant oozing or dead space is anticipated", desc: "Selective use" },
    { label: "Always place drain", desc: "Selective placement", comp: "WRONG_DIAGNOSIS" },
    { label: "Never place drain", desc: "Sometimes needed", comp: "HEMORRHAGE" },
    { label: "Only for cosmetic reasons", desc: "For fluid collection", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(47, 6, "Scalp Closure", "How is the scalp closed?",
    { label: "Galeal layer with absorbable suture, skin with staples or sutures", desc: "Layered closure" },
    { label: "Staples only through all layers", desc: "Poor scalp healing", comp: "CARDIAC_INJURY" },
    { label: "Leave open", desc: "Infection risk", comp: "CARDIAC_INJURY" },
    { label: "Glue only", desc: "Galeal closure essential", comp: "CARDIAC_INJURY" }
  ),
  createDecision(48, 6, "Head Wrap", "Why is a head dressing applied?",
    { label: "Compression for hemostasis and wound protection", desc: "Standard post-op dressing" },
    { label: "Only for cosmetic", desc: "Functional purpose", comp: "WRONG_DIAGNOSIS" },
    { label: "No dressing needed", desc: "Standard to apply", comp: "HEMORRHAGE" },
    { label: "Replace with band-aid", desc: "Full head wrap needed", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 7: POST-OP CARE
  createDecision(49, 7, "Immediate Post-Op", "What is monitored in PACU after craniotomy?",
    { label: "Neurological exam, vital signs, ICP if monitor placed, and surgical site", desc: "Complete monitoring" },
    { label: "Only blood pressure", desc: "Must check neuro exam", comp: "CARDIAC_INJURY" },
    { label: "No monitoring needed", desc: "Critical post-op period", comp: "CARDIAC_INJURY" },
    { label: "Only surgical site", desc: "Neuro status essential", comp: "CARDIAC_INJURY" }
  ),
  createDecision(50, 7, "Neuro Check Frequency", "How often should neurological exams be performed?",
    { label: "Every hour for first 24 hours, then per clinical status", desc: "Frequent monitoring" },
    { label: "Once per shift", desc: "Too infrequent", comp: "CARDIAC_INJURY" },
    { label: "Only if patient complains", desc: "May miss deterioration", comp: "CARDIAC_INJURY" },
    { label: "No neuro checks needed", desc: "Essential post-craniotomy", comp: "CARDIAC_INJURY" }
  ),
  createDecision(51, 7, "Post-Op Imaging", "When should post-op MRI be obtained?",
    { label: "Within 24-48 hours to assess extent of resection", desc: "Standard timing" },
    { label: "No post-op imaging needed", desc: "Cannot assess resection", comp: "CARDIAC_INJURY" },
    { label: "Wait one month", desc: "Need to know resection status", comp: "CARDIAC_INJURY" },
    { label: "Only if symptoms worsen", desc: "Standard to obtain", comp: "CARDIAC_INJURY" }
  ),
  createDecision(52, 7, "Steroid Taper", "How are post-op steroids managed?",
    { label: "Taper dexamethasone over 1-2 weeks depending on edema", desc: "Prevents adrenal suppression" },
    { label: "Stop immediately", desc: "Risk of adrenal crisis", comp: "CARDIAC_INJURY" },
    { label: "Continue indefinitely", desc: "Must taper", comp: "CARDIAC_INJURY" },
    { label: "No steroids given", desc: "Standard post-op to give", comp: "CARDIAC_INJURY" }
  ),
  createDecision(53, 7, "Anticonvulsant Duration", "How long should anticonvulsants be continued?",
    { label: "At least 1 week post-op, longer if seizure occurred or high-risk pathology", desc: "Standard duration" },
    { label: "Stop immediately", desc: "Risk of post-op seizure", comp: "CARDIAC_INJURY" },
    { label: "Continue for life", desc: "Usually can stop after healing", comp: "WRONG_DIAGNOSIS" },
    { label: "No anticonvulsants given", desc: "Standard prophylaxis", comp: "CARDIAC_INJURY" }
  ),
  createDecision(54, 7, "DVT Prophylaxis", "When should DVT prophylaxis begin?",
    { label: "Mechanical prophylaxis immediately, pharmacologic when bleeding risk acceptable (usually post-op day 1-2)", desc: "Balanced approach" },
    { label: "No DVT prophylaxis", desc: "High risk of PE", comp: "CARDIAC_INJURY" },
    { label: "Start before surgery", desc: "Increases bleeding risk", comp: "HEMORRHAGE" },
    { label: "Only if prior DVT history", desc: "All craniotomy patients at risk", comp: "CARDIAC_INJURY" }
  ),
  createDecision(55, 7, "Fever Workup", "Patient develops fever post-op day 1. What is the workup?",
    { label: "Check surgical site, blood cultures, chest X-ray, urine analysis, and consider meningitis", desc: "Complete infectious workup" },
    { label: "Only give Tylenol", desc: "Must identify source", comp: "CARDIAC_INJURY" },
    { label: "Ignore fever", desc: "May indicate meningitis", comp: "CARDIAC_INJURY" },
    { label: "Wait 3 days", desc: "Meningitis can be fatal", comp: "CARDIAC_INJURY" }
  ),
  createDecision(56, 7, "Wound Infection", "How is wound infection treated?",
    { label: "Antibiotics and possible surgical debridement for deep infection", desc: "Aggressive treatment" },
    { label: "Oral antibiotics only", desc: "May need IV and surgery", comp: "CARDIAC_INJURY" },
    { label: "Ignore infection", desc: "Can spread to bone and brain", comp: "CARDIAC_INJURY" },
    { label: "Wait for spontaneous resolution", desc: "Will worsen without treatment", comp: "CARDIAC_INJURY" }
  ),
  createDecision(57, 7, "CSF Leak", "Clear fluid from incision. What do you suspect?",
    { label: "CSF leak requiring evaluation and possible lumbar drain or re-exploration", desc: "Serious complication" },
    { label: "Normal wound drainage", desc: "CSF is not normal", comp: "CARDIAC_INJURY" },
    { label: "Ignore it", desc: "Risk of meningitis", comp: "CARDIAC_INJURY" },
    { label: "Apply pressure dressing only", desc: "May need surgical repair", comp: "CARDIAC_INJURY" }
  ),
  createDecision(58, 7, "Hydrocephalus", "Patient develops worsening headache and confusion. CT shows hydrocephalus. What is the treatment?",
    { label: "External ventricular drain or ventriculoperitoneal shunt", desc: "CSF diversion" },
    { label: "No treatment", desc: "Herniation risk", comp: "CARDIAC_INJURY" },
    { label: "Only medications", desc: "Surgical treatment needed", comp: "CARDIAC_INJURY" },
    { label: "Wait and observe", desc: "Urgent intervention needed", comp: "CARDIAC_INJURY" }
  ),
  createDecision(59, 7, "New Neurological Deficit", "Patient wakes with worse left hemiparesis. What is the concern?",
    { label: "Post-operative edema, hemorrhage, or stroke - obtain CT immediately", desc: "Urgent evaluation" },
    { label: "Normal after surgery", desc: "Worse deficit is concerning", comp: "CARDIAC_INJURY" },
    { label: "Wait 24 hours", desc: "Urgent imaging needed", comp: "CARDIAC_INJURY" },
    { label: "Give more sedation", desc: "Cannot assess neuro status", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(60, 7, "Post-Op Hematoma", "CT shows 2cm hematoma at resection site with mass effect. What is the treatment?",
    { label: "Return to OR for evacuation if symptomatic or deteriorating", desc: "Surgical management" },
    { label: "Observe only", desc: "Mass effect is dangerous", comp: "CARDIAC_INJURY" },
    { label: "Wait one week", desc: "May herniate", comp: "CARDIAC_INJURY" },
    { label: "No treatment available", desc: "Evacuation is standard", comp: "CARDIAC_INJURY" }
  ),
  createDecision(61, 7, "Pathology Results", "Pathology shows glioblastoma. What additional treatment is indicated?",
    { label: "Oncology referral for radiation and temozolomide chemotherapy (Stupp protocol)", desc: "Standard adjuvant therapy" },
    { label: "No further treatment", desc: "Requires adjuvant therapy", comp: "CARDIAC_INJURY" },
    { label: "Repeat surgery immediately", desc: "Adjuvant therapy first", comp: "WRONG_DIAGNOSIS" },
    { label: "Only supportive care", desc: "Chemotherapy and radiation extend survival", comp: "CARDIAC_INJURY" }
  ),
  createDecision(62, 7, "Discharge Criteria", "When can the patient be discharged?",
    { label: "Stable neurological exam, controlled pain, ambulating, and tolerating diet", desc: "Standard criteria" },
    { label: "Day 1 post-op", desc: "Too early for craniotomy", comp: "CARDIAC_INJURY" },
    { label: "Only when pathology returns", desc: "Can discharge before pathology", comp: "WRONG_DIAGNOSIS" },
    { label: "Keep for 2 weeks minimum", desc: "Usually 3-5 days sufficient", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(63, 7, "Follow-Up Timing", "When is the first post-op follow-up?",
    { label: "2 weeks for wound check, 4-6 weeks for oncology discussion", desc: "Standard timing" },
    { label: "6 months later", desc: "Too long", comp: "CARDIAC_INJURY" },
    { label: "No follow-up needed", desc: "Critical for monitoring", comp: "CARDIAC_INJURY" },
    { label: "Next day", desc: "Patient still in hospital", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(64, 7, "Radiation Planning", "When does radiation typically begin after craniotomy?",
    { label: "2-4 weeks post-surgery to allow wound healing", desc: "Standard timing" },
    { label: "Immediately post-op", desc: "Wound must heal first", comp: "CARDIAC_INJURY" },
    { label: "3 months later", desc: "Earlier is better for tumor control", comp: "CARDIAC_INJURY" },
    { label: "No radiation needed", desc: "Standard for glioblastoma", comp: "CARDIAC_INJURY" }
  ),
  createDecision(65, 7, "Chemotherapy", "What is standard chemotherapy for glioblastoma?",
    { label: "Temozolomide oral chemotherapy concurrent with radiation, then maintenance cycles", desc: "Stupp protocol" },
    { label: "No chemotherapy", desc: "Standard of care includes chemo", comp: "CARDIAC_INJURY" },
    { label: "IV chemotherapy inpatient", desc: "Temozolomide is oral", comp: "WRONG_DIAGNOSIS" },
    { label: "Only experimental treatments", desc: "Temozolomide is standard", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(66, 7, "Tumor Board", "Why is tumor board discussion important?",
    { label: "Multidisciplinary review to determine optimal treatment plan", desc: "Standard of care" },
    { label: "Only for academic purposes", desc: "Direct patient benefit", comp: "WRONG_DIAGNOSIS" },
    { label: "Not needed", desc: "Standard practice", comp: "CARDIAC_INJURY" },
    { label: "Only for difficult cases", desc: "All cases benefit", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(67, 7, "Prognosis Discussion", "How should prognosis be discussed with family?",
    { label: "Honest discussion with statistics, treatment options, and support resources", desc: "Ethical communication" },
    { label: "Give no information", desc: "Family needs to understand", comp: "WRONG_DIAGNOSIS" },
    { label: "Provide false hope", desc: "Dishonest and harmful", comp: "WRONG_DIAGNOSIS" },
    { label: "Say nothing can be done", desc: "Treatment options exist", comp: "CARDIAC_INJURY" }
  ),
  createDecision(68, 7, "Rehabilitation", "What rehabilitation is recommended post-craniotomy?",
    { label: "Physical therapy, occupational therapy, and speech therapy as needed for deficits", desc: "Comprehensive rehab" },
    { label: "No rehabilitation needed", desc: "Important for recovery", comp: "CARDIAC_INJURY" },
    { label: "Only for severe deficits", desc: "Even mild deficits benefit", comp: "CARDIAC_INJURY" },
    { label: "Wait 6 months to start", desc: "Earlier is better", comp: "CARDIAC_INJURY" }
  ),
  createDecision(69, 7, "Return Precautions", "What symptoms warrant immediate return?",
    { label: "Severe headache, new weakness, vision changes, seizure, fever, or wound problems", desc: "Emergency signs" },
    { label: "Only bleeding", desc: "Multiple concerning symptoms", comp: "CARDIAC_INJURY" },
    { label: "No return instructions", desc: "Critical safety information", comp: "CARDIAC_INJURY" },
    { label: "Come back for any pain", desc: "Specific concerning symptoms", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(70, 7, "Seizure Post-Op", "Patient has a seizure 1 week after surgery. What is the management?",
    { label: "IV lorazepam, load with levetiracetam, and obtain CT head", desc: "Standard seizure management" },
    { label: "Wait for seizure to stop", desc: "May not stop spontaneously", comp: "CARDIAC_INJURY" },
    { label: "No treatment needed", desc: "Seizures require treatment", comp: "CARDIAC_INJURY" },
    { label: "Only oral medications", desc: "Acute seizure needs IV", comp: "CARDIAC_INJURY" }
  ),
  createDecision(71, 7, "Driving Restrictions", "When can the patient drive after craniotomy?",
    { label: "After seizure-free period and neurological clearance, typically 3-6 months", desc: "Safety restriction" },
    { label: "Immediately", desc: "Seizure risk exists", comp: "CARDIAC_INJURY" },
    { label: "Never drive again", desc: "Can drive after clearance", comp: "WRONG_DIAGNOSIS" },
    { label: "After 1 week", desc: "Too soon, need seizure-free period", comp: "CARDIAC_INJURY" }
  ),
  createDecision(72, 7, "Cognitive Changes", "Family reports memory and personality changes. What is the cause?",
    { label: "Frontal lobe surgery effects, tumor location, or treatment effects", desc: "Expected changes" },
    { label: "Patient is faking", desc: "Real neurological effects", comp: "WRONG_DIAGNOSIS" },
    { label: "Only medication side effects", desc: "Multiple possible causes", comp: "WRONG_DIAGNOSIS" },
    { label: "Will never improve", desc: "May improve with therapy", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(73, 7, "Support Resources", "What support resources should be offered?",
    { label: "Support groups, counseling, social work, and palliative care consultation", desc: "Comprehensive support" },
    { label: "No support needed", desc: "Essential for patient and family", comp: "CARDIAC_INJURY" },
    { label: "Only medical treatment", desc: "Psychosocial support essential", comp: "WRONG_DIAGNOSIS" },
    { label: "Support groups are not helpful", desc: "Proven benefit for patients", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(74, 7, "Advance Directives", "Why discuss advance directives?",
    { label: "To understand patient wishes for future care and end-of-life decisions", desc: "Essential planning" },
    { label: "Not needed", desc: "Critical for serious illness", comp: "CARDIAC_INJURY" },
    { label: "Only for terminal patients", desc: "All patients should discuss", comp: "WRONG_DIAGNOSIS" },
    { label: "Family makes all decisions", desc: "Patient preferences matter", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(75, 7, "Case Closure", "Patient discharged home with outpatient therapy scheduled. What is the outcome?",
    { label: "Successful tumor resection with appropriate follow-up planned", desc: "Complete surgical course" },
    { label: "Failed surgery", desc: "Tumor was resected", comp: "WRONG_DIAGNOSIS" },
    { label: "Incomplete procedure", desc: "Gross total resection achieved", comp: "WRONG_DIAGNOSIS" },
    { label: "Need immediate reoperation", desc: "No indication given", comp: "CARDIAC_INJURY" }
  ),
  createDecision(76, 7, "Final Pearl", "What is the most important principle in brain tumor surgery?",
    { label: "Maximal safe resection preserving neurological function", desc: "Surgical philosophy" },
    { label: "Remove as much as possible regardless of function", desc: "Causes deficit", comp: "NERVE_DAMAGE" },
    { label: "Biopsy only", desc: "Resection is goal when safe", comp: "CARDIAC_INJURY" },
    { label: "Speed over technique", desc: "Safety is paramount", comp: "NERVE_DAMAGE" }
  ),
  createDecision(77, 7, "Recurrence Monitoring", "How is tumor recurrence monitored?",
    { label: "MRI every 2-3 months initially, then less frequently if stable", desc: "Standard surveillance" },
    { label: "No monitoring needed", desc: "High recurrence rate", comp: "CARDIAC_INJURY" },
    { label: "Only when symptomatic", desc: "Asymptomatic recurrence common", comp: "CARDIAC_INJURY" },
    { label: "Weekly MRI", desc: "Too frequent", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(78, 7, "Second Surgery", "When is re-operation considered?",
    { label: "Symptomatic recurrence with good performance status and feasible tumor", desc: "Selective re-operation" },
    { label: "Never re-operate", desc: "Re-operation is option", comp: "WRONG_DIAGNOSIS" },
    { label: "Immediately after first surgery", desc: "No indication", comp: "CARDIAC_INJURY" },
    { label: "Only if patient demands", desc: "Medical indications drive decision", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(79, 7, "Clinical Trials", "Should clinical trials be discussed?",
    { label: "Yes, discuss eligible trials as part of treatment options", desc: "Standard of care" },
    { label: "No trials needed", desc: "Trials are standard option", comp: "WRONG_DIAGNOSIS" },
    { label: "Only for terminal patients", desc: "Trials at all stages", comp: "WRONG_DIAGNOSIS" },
    { label: "Trials are experimental only", desc: "Many are standard options", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(80, 7, "Quality of Life", "What quality of life measures are important?",
    { label: "Functional status, cognitive function, symptom control, and family support", desc: "Comprehensive assessment" },
    { label: "Only survival time", desc: "QOL equally important", comp: "WRONG_DIAGNOSIS" },
    { label: "Only patient perspective", desc: "Family and caregiver too", comp: "WRONG_DIAGNOSIS" },
    { label: "QOL is not relevant", desc: "Central to care", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(81, 7, "Palliative Care", "When should palliative care be involved?",
    { label: "Early in the disease course for symptom management and goals discussion", desc: "Integrated approach" },
    { label: "Only at end of life", desc: "Early involvement beneficial", comp: "CARDIAC_INJURY" },
    { label: "Never involve palliative care", desc: "Improves outcomes", comp: "CARDIAC_INJURY" },
    { label: "Only for hospice", desc: "Broader role than hospice", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(82, 7, "Caregiver Support", "What support should caregivers receive?",
    { label: "Education, respite care, counseling, and connection to resources", desc: "Comprehensive caregiver support" },
    { label: "No support needed", desc: "Caregiving is demanding", comp: "CARDIAC_INJURY" },
    { label: "Only financial support", desc: "Multiple needs exist", comp: "WRONG_DIAGNOSIS" },
    { label: "Caregivers are always fine", desc: "High burnout and stress", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(83, 7, "Survivorship", "What is the concept of survivorship in brain tumors?",
    { label: "Living with and beyond cancer, focusing on quality of life and follow-up", desc: "Holistic approach" },
    { label: "Only for cured patients", desc: "Applies to all cancer patients", comp: "WRONG_DIAGNOSIS" },
    { label: "No survivorship concept", desc: "Increasingly important", comp: "WRONG_DIAGNOSIS" },
    { label: "Only survival statistics", desc: "Broader than statistics", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(84, 7, "Research Participation", "Why is research participation important?",
    { label: "Advances treatment options and improves outcomes for future patients", desc: "Scientific progress" },
    { label: "Only for desperate cases", desc: "Many trials for all stages", comp: "WRONG_DIAGNOSIS" },
    { label: "Research is dangerous", desc: "Carefully monitored", comp: "WRONG_DIAGNOSIS" },
    { label: "No benefit to patient", desc: "May benefit current patient", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(85, 7, "Case Completion", "Final summary: 41-year-old female, right frontal glioblastoma, gross total resection, undergoing Stupp protocol. Case status?",
    { label: "Successful surgical treatment with comprehensive oncologic plan", desc: "Complete care pathway" },
    { label: "Case failed", desc: "Tumor was successfully resected", comp: "WRONG_DIAGNOSIS" },
    { label: "Incomplete treatment", desc: "Full treatment plan in place", comp: "WRONG_DIAGNOSIS" },
    { label: "Need immediate reoperation", desc: "No indication for reoperation", comp: "CARDIAC_INJURY" }
  )
];

export const PATIENT = {
  name: "Elena S.",
  age: 41,
  gender: "Female",
  weight: "65 kg",
  bloodType: "B+",
  admission: "Severe headache, left-sided weakness, 4cm right frontal mass on MRI",
  mood: "Confused",
  comorbidities: ["none"],
  procedureCategory: "neurological"
};

export const PHASES = [
  { id: 1, name: "Pre-Op Evaluation", icon: "🩺", short: "Pre-Op" },
  { id: 2, name: "Anesthesia & Positioning", icon: "💉", short: "Setup" },
  { id: 3, name: "Incision & Craniotomy", icon: "🔪", short: "Craniotomy" },
  { id: 4, name: "Dural Opening & Exposure", icon: "🧠", short: "Exposure" },
  { id: 5, name: "Tumor Resection", icon: "⚕️", short: "Resection" },
  { id: 6, name: "Closure", icon: "🪡", short: "Closure" },
  { id: 7, name: "Post-Op Care", icon: "🏥", short: "Recovery" },
];

export const craniotomyData = { PATIENT, PHASES, DECISIONS };
