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
        { id: "1", label: "Apply direct pressure with gauze and identify the bleeding vessel", desc: "Standard bleeding control", correct: true },
        { id: "2", label: "Ligate or clip the identified vessel under direct vision", desc: "Definitive hemostasis", correct: true },
        { id: "3", label: "Pack the wound and wait for spontaneous cessation", desc: "Inadequate for arterial bleeding", correct: false }
      ];
    case "ANESTHESIA_OVERDOSE":
      return [
        { id: "1", label: "Reduce anesthetic agents and support ventilation", desc: "Standard overdose management", correct: true },
        { id: "2", label: "Administer reversal agents if applicable", desc: "Flumazenil or Naloxone", correct: true },
        { id: "3", label: "Continue current anesthetic depth", desc: "Will worsen the overdose", correct: false }
      ];
    case "ANESTHESIA_UNDERDOSE":
      return [
        { id: "1", label: "Deepen anesthetic with propofol bolus or increased gas", desc: "Corrects awareness risk", correct: true },
        { id: "2", label: "Administer additional paralytic", desc: "Prevents movement but not awareness", correct: true },
        { id: "3", label: "Ignore the signs and continue", desc: "Patient may recall surgery", correct: false }
      ];
    case "NERVE_DAMAGE":
      return [
        { id: "1", label: "Immediately identify the nerve injury and assess severity", desc: "Documentation and planning", correct: true },
        { id: "2", label: "Consult ENT for intraoperative nerve assessment", desc: "Specialist evaluation", correct: true },
        { id: "3", label: "Ignore it - nerves regenerate on their own", desc: "Permanent hoarseness can result", correct: false }
      ];
    case "BOWEL_PERFORATION":
      return [
        { id: "1", label: "Identify and repair the perforation primarily", desc: "Standard surgical repair", correct: true },
        { id: "2", label: "Copious irrigation and broad-spectrum antibiotics", desc: "Contamination control", correct: true },
        { id: "3", label: "Close without repair", desc: "Causes peritonitis", correct: false }
      ];
    case "PNEUMOTHORAX":
      return [
        { id: "1", label: "Needle decompression followed by chest tube", desc: "Definitive treatment", correct: true },
        { id: "2", label: "High flow oxygen and monitor", desc: "Temporary measure only", correct: false },
        { id: "3", label: "Chest tube placement in the 5th intercostal space", desc: "Standard tube thoracostomy", correct: true }
      ];
    case "CARDIAC_INJURY":
      return [
        { id: "1", label: "Initiate ACLS protocols with CPR if needed", desc: "Life-saving stabilization", correct: true },
        { id: "2", label: "Epinephrine 1mg IV push for arrhythmia", desc: "Standard cardiac resuscitation", correct: true },
        { id: "3", label: "Wait for spontaneous recovery", desc: "Patient will deteriorate", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Stop and reassess anatomical landmarks", desc: "Prevents wrong-site surgery", correct: true },
        { id: "2", label: "Continue with current incision", desc: "Risks wrong anatomy", correct: false },
        { id: "3", label: "Call attending surgeon for guidance", desc: "Safe escalation", correct: true }
      ];
    case "MALIGNANT_HYPERTHERMIA":
      return [
        { id: "1", label: "Administer Dantrolene immediately", desc: "Specific antidote for MH", correct: true },
        { id: "2", label: "Stop all triggering agents and hyperventilate with 100% O2", desc: "Remove the trigger", correct: true },
        { id: "3", label: "Give acetaminophen and ice packs", desc: "Inadequate for MH crisis", correct: false }
      ];
    case "WRONG_DIAGNOSIS":
      return [
        { id: "1", label: "Halt procedure and review all imaging and pathology", desc: "Re-evaluate diagnosis", correct: true },
        { id: "2", label: "Proceed without verification", desc: "Exacerbates the error", correct: false }
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
  // PHASE 1: PATIENT INTAKE
  createDecision(1, 1, "Initial Presentation", "A 38-year-old female presents with a palpable thyroid nodule discovered on routine physical exam. She is asymptomatic. What is your first diagnostic step?",
    { label: "Order thyroid function tests (TSH, Free T4) and neck ultrasound", desc: "Standard initial workup for thyroid nodule" },
    { label: "Immediately schedule for thyroidectomy", desc: "Surgery without workup is inappropriate", comp: "WRONG_DIAGNOSIS" },
    { label: "Order a CT scan of the head", desc: "Anatomically irrelevant for thyroid", comp: "WRONG_DIAGNOSIS" },
    { label: "Prescribe thyroid hormone suppression therapy", desc: "Outdated management without diagnosis", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "Ultrasound Findings", "Ultrasound shows a 2.5cm solid, hypoechoic nodule in the right lobe with microcalcifications and irregular margins. What do these features suggest?",
    { label: "Suspicious features warranting Fine Needle Aspiration Cytology (FNAC)", desc: "TI-RADS 4 or 5 classification" },
    { label: "Benign nodule requiring observation only", desc: "Misses high-risk sonographic features", comp: "WRONG_DIAGNOSIS" },
    { label: "Simple cyst needing drainage", desc: "Solid nodule, not cystic", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal thyroid requiring no follow-up", desc: "Ignores concerning nodule characteristics", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "FNAC Procedure", "You are performing fine needle aspiration cytology (FNAC). What is the correct technique?",
    { label: "Use a 25-27 gauge needle with ultrasound guidance, make multiple passes", desc: "Standard FNAC technique" },
    { label: "Use a large bore 18G needle without imaging", desc: "Unnecessarily traumatic and blind", comp: "NERVE_DAMAGE" },
    { label: "Perform only one pass and send to pathology", desc: "Insufficient sampling for diagnosis", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip FNAC and proceed directly to surgery", desc: "Deprives patient of pre-op diagnosis", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(4, 1, "FNAC Results", "FNAC returns as 'Bethesda IV - Follicular neoplasm'. What does this mean for surgical planning?",
    { label: "Diagnostic lobectomy is required as malignancy cannot be ruled out on cytology", desc: "Standard management for Bethesda IV" },
    { label: "Benign finding - no surgery needed", desc: "Bethesda IV has 15-30% malignancy risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Total thyroidectomy is mandatory", desc: "Overtreatment for indeterminate nodules", comp: "WRONG_DIAGNOSIS" },
    { label: "Repeat FNAC in 6 months", desc: "Does not resolve diagnostic uncertainty", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(5, 1, "Additional Workup", "The patient mentions progressive hoarseness over the past 2 months. What additional evaluation is required?",
    { label: "Direct or indirect laryngoscopy to assess vocal cord mobility", desc: "Evaluate for recurrent laryngeal nerve involvement" },
    { label: "No additional workup needed", desc: "Misses potential nerve involvement by malignancy", comp: "NERVE_DAMAGE" },
    { label: "Order a chest X-ray only", desc: "Does not assess vocal cords", comp: "WRONG_DIAGNOSIS" },
    { label: "Prescribe voice rest and recheck in 3 months", desc: "Delays diagnosis of potential malignancy", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(6, 1, "Laryngoscopy Finding", "Laryngoscopy shows normal vocal cord mobility bilaterally. The patient asks about the risk of voice changes after surgery. What do you tell her?",
    { label: "There is a 1-2% risk of temporary hoarseness and rare permanent nerve injury; we use nerve monitoring", desc: "Accurate informed consent" },
    { label: "Voice changes never occur after thyroid surgery", desc: "False reassurance, misleading consent", comp: "WRONG_DIAGNOSIS" },
    { label: "Everyone loses their voice permanently", desc: "Excessive and inaccurate", comp: "WRONG_DIAGNOSIS" },
    { label: "Only smokers have voice problems after surgery", desc: "Incorrect risk factor identification", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(7, 1, "Pre-Op Labs", "What pre-operative laboratory values are most critical before thyroidectomy?",
    { label: "Serum calcium and PTH levels as baseline", desc: "Establishes baseline for post-op comparison" },
    { label: "Only a CBC is needed", desc: "Misses calcium/PTH baseline", comp: "WRONG_DIAGNOSIS" },
    { label: "Liver function tests only", desc: "Not primary concern for thyroid surgery", comp: "WRONG_DIAGNOSIS" },
    { label: "No labs are needed for thyroid surgery", desc: "Standard of care requires baseline labs", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2: PRE-OP PLANNING
  createDecision(8, 2, "Anesthesia Planning", "What type of anesthesia is appropriate for thyroidectomy?",
    { label: "General endotracheal anesthesia with a nerve-monitoring ET tube", desc: "Standard for thyroid surgery with nerve monitoring" },
    { label: "Local anesthesia with sedation only", desc: "Inadequate for neck dissection", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Spinal anesthesia", desc: "Not appropriate for neck surgery", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "No anesthesia needed - it's a minor procedure", desc: "Thyroidectomy requires general anesthesia", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(9, 2, "Nerve Monitoring Setup", "Why is intraoperative nerve monitoring (IONM) used in thyroidectomy?",
    { label: "To identify and preserve the recurrent laryngeal nerve and reduce injury risk", desc: "Standard adjunct for nerve safety" },
    { label: "Only for teaching purposes with no clinical benefit", desc: "Disproven; has clinical utility", comp: "NERVE_DAMAGE" },
    { label: "To monitor the anesthesia depth", desc: "Incorrect use of nerve monitoring", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Nerve monitoring is never used in thyroid surgery", desc: "Many surgeons use it routinely", comp: "NERVE_DAMAGE" }
  ),
  createDecision(10, 2, "Patient Positioning", "How should the patient be positioned for thyroidectomy?",
    { label: "Supine with neck extended using a shoulder roll and head supported in slight extension", desc: "Classic 'Rose' position for neck exposure" },
    { label: "Prone position", desc: "Wrong position for anterior neck approach", comp: "WRONG_INCISION_SITE" },
    { label: "Sitting upright at 90 degrees", desc: "Does not allow proper surgical access", comp: "WRONG_INCISION_SITE" },
    { label: "Lateral decubitus position", desc: "Used for thoracic surgery, not thyroid", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(11, 2, "Incision Planning", "Where should the skin incision be placed for optimal cosmetic outcome?",
    { label: "Kocher transverse cervical incision in a natural skin crease 2cm above the sternal notch", desc: "Standard thyroidectomy incision" },
    { label: "Vertical midline incision from chin to sternum", desc: "Poor cosmetic result and excessive exposure", comp: "WRONG_INCISION_SITE" },
    { label: "Incision directly over the nodule regardless of skin creases", desc: "Results in visible scarring", comp: "WRONG_INCISION_SITE" },
    { label: "Incision in the posterior neck", desc: "Wrong anatomical approach", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(12, 2, "Safety Timeout", "What specific items must be verified during the surgical timeout for thyroidectomy?",
    { label: "Correct side (if hemithyroidectomy), laryngoscopy results, nerve monitoring equipment functional", desc: "Thyroid-specific safety checks" },
    { label: "Only the patient's name", desc: "Incomplete timeout", comp: "WRONG_INCISION_SITE" },
    { label: "Verify the patient's dietary preferences", desc: "Irrelevant for surgical safety", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip timeout to save time", desc: "Never acceptable", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(13, 2, "Antibiotic Prophylaxis", "When should prophylactic antibiotics be administered for thyroidectomy?",
    { label: "Within 60 minutes before incision for clean-contaminated surgery", desc: "Standard timing for prophylaxis" },
    { label: "After the surgery is completed", desc: "Too late to prevent infection", comp: "WRONG_DIAGNOSIS" },
    { label: "Antibiotics are never needed for thyroid surgery", desc: "Controversial but often given", comp: "WRONG_DIAGNOSIS" },
    { label: "Start 24 hours post-operatively", desc: "Inappropriate timing", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 3: INCISION & ACCESS
  createDecision(14, 3, "Skin Incision", "You are making the Kocher incision. What is the correct depth and direction?",
    { label: "Transverse incision through skin and subcutaneous tissue, then platysma", desc: "Standard layered approach" },
    { label: "Vertical incision from thyroid cartilage to sternum", desc: "Wrong orientation for thyroid exposure", comp: "WRONG_INCISION_SITE" },
    { label: "Incise deeply in one stroke to the trachea", desc: "Risks injury to underlying structures", comp: "NERVE_DAMAGE" },
    { label: "Make multiple small stab incisions", desc: "Inadequate exposure for thyroidectomy", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(15, 3, "Flap Elevation", "How do you elevate the subplatysmal flaps?",
    { label: "Sharply dissect in the subplatysmal plane superiorly to the thyroid cartilage and inferiorly to the sternal notch", desc: "Creates adequate surgical exposure" },
    { label: "Dissect deeply into the strap muscles", desc: "Wrong plane, increases bleeding", comp: "HEMORRHAGE" },
    { label: "Skip flap elevation and go directly to the thyroid", desc: "Inadequate exposure", comp: "WRONG_INCISION_SITE" },
    { label: "Elevate flaps laterally only", desc: "Does not provide thyroid exposure", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(16, 3, "Strap Muscles", "You encounter the strap muscles (sternohyoid and sternothyroid). How do you proceed?",
    { label: "Divide the strap muscles vertically in the midline and retract laterally", desc: "Standard exposure technique" },
    { label: "Transversely cut through the strap muscles", desc: "Unnecessarily divides muscles", comp: "WRONG_INCISION_SITE" },
    { label: "Remove the strap muscles entirely", desc: "Overtreatment, functional loss", comp: "WRONG_INCISION_SITE" },
    { label: "Dissect around the strap muscles without opening", desc: "Poor visualization of thyroid", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(17, 3, "Middle Thyroid Vein", "During lateral retraction, you encounter the middle thyroid vein. How do you manage it?",
    { label: "Ligate and divide the middle thyroid vein to mobilize the lobe", desc: "Standard step for thyroid mobilization" },
    { label: "Leave it intact and work around it", desc: "Limits mobilization and risks avulsion", comp: "HEMORRHAGE" },
    { label: "Cauterize without ligation", desc: "Middle thyroid vein can retract and bleed", comp: "HEMORRHAGE" },
    { label: "Apply clips only without division", desc: "Clips may slip off vein", comp: "HEMORRHAGE" }
  ),
  createDecision(18, 3, "Thyroid Lobe Mobilization", "How do you begin mobilizing the thyroid lobe?",
    { label: "Gentle medial retraction of the lobe to expose the lateral aspect and identify landmarks", desc: "Systematic dissection approach" },
    { label: "Grasp the lobe forcefully and pull upward", desc: "Can avulse vessels and nerves", comp: "NERVE_DAMAGE" },
    { label: "Use cautery extensively without identifying anatomy", desc: "High risk of nerve injury", comp: "NERVE_DAMAGE" },
    { label: "Remove the entire gland in one piece without dissection", desc: "Extremely dangerous blind technique", comp: "NERVE_DAMAGE" }
  ),

  // PHASE 4: CORE PROCEDURE
  createDecision(19, 4, "Superior Thyroid Artery", "You identify the superior thyroid artery. What is the correct management?",
    { label: "Ligate the superior thyroid artery close to the thyroid capsule to preserve the external branch of the superior laryngeal nerve", desc: "Capsular dissection technique" },
    { label: "Ligate as high as possible away from the thyroid", desc: "Risks injury to the superior laryngeal nerve", comp: "NERVE_DAMAGE" },
    { label: "Cauterize without ligation", desc: "Superior thyroid artery is a named vessel needing ligation", comp: "HEMORRHAGE" },
    { label: "Leave it intact", desc: "Will bleed during dissection", comp: "HEMORRHAGE" }
  ),
  createDecision(20, 4, "Recurrent Laryngeal Nerve Identification", "What is the critical landmark for identifying the recurrent laryngeal nerve (RLN)?",
    { label: "The RLN runs in the tracheoesophageal groove, posterior to the inferior thyroid artery branches", desc: "Classic anatomical relationship" },
    { label: "The RLN is anterior to the inferior thyroid artery", desc: "Usually posterior but can vary", comp: "NERVE_DAMAGE" },
    { label: "The RLN runs through the thyroid parenchyma", desc: "Incorrect; it is external to the gland", comp: "NERVE_DAMAGE" },
    { label: "The RLN does not exist on the right side", desc: "Anatomically incorrect", comp: "NERVE_DAMAGE" }
  ),
  createDecision(21, 4, "Nerve Monitoring Signal", "The nerve monitor shows a strong signal (amplitude >500 microV) on initial identification. What does this indicate?",
    { label: "The nerve is intact and functional - continue with careful dissection", desc: "Baseline nerve function confirmed" },
    { label: "The nerve is damaged", desc: "Strong signal indicates healthy nerve", comp: "NERVE_DAMAGE" },
    { label: "The monitor is malfunctioning", desc: "Strong signal is normal finding", comp: "WRONG_DIAGNOSIS" },
    { label: "Ignore the signal and proceed blindly", desc: "Wastes the safety benefit of monitoring", comp: "NERVE_DAMAGE" }
  ),
  createDecision(22, 4, "Inferior Thyroid Artery", "How do you manage the inferior thyroid artery during thyroidectomy?",
    { label: "Ligate branches close to the thyroid capsule to preserve parathyroid blood supply", desc: "Capsular ligation preserves parathyroids" },
    { label: "Ligate the main trunk of the inferior thyroid artery", desc: "Devascularizes the parathyroid glands", comp: "WRONG_DIAGNOSIS" },
    { label: "Cauterize all branches indiscriminately", desc: "Risks parathyroid and nerve injury", comp: "NERVE_DAMAGE" },
    { label: "Leave the artery intact", desc: "Will bleed during gland mobilization", comp: "HEMORRHAGE" }
  ),
  createDecision(23, 4, "Parathyroid Identification", "You see a small, tan-brown structure adjacent to the thyroid. What is this likely to be?",
    { label: "A parathyroid gland - preserve it with its blood supply", desc: "Classic appearance of parathyroid" },
    { label: "A lymph node - remove it", desc: "Could be a parathyroid; preserve first", comp: "WRONG_DIAGNOSIS" },
    { label: "Fat tissue - excise it", desc: "Parathyroids can look like fat", comp: "WRONG_DIAGNOSIS" },
    { label: "Thyroid tissue - include in specimen", desc: "Parathyroids must be preserved", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(24, 4, "Parathyroid Preservation", "A parathyroid gland appears devascularized after dissection. What do you do?",
    { label: "Auto-transplant the parathyroid into the sternocleidomastoid muscle or forearm", desc: "Standard salvage technique" },
    { label: "Discard it as unnecessary tissue", desc: "Patient will develop hypocalcemia", comp: "WRONG_DIAGNOSIS" },
    { label: "Leave it in place and hope for recovery", desc: "Devascularized gland will not function", comp: "WRONG_DIAGNOSIS" },
    { label: "Return it to the operative field without revascularization", desc: "Will not restore function", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(25, 4, "Berry's Ligament", "You encounter Berry's ligament (the posterior suspensory ligament). What is the significance?",
    { label: "The RLN passes deep to Berry's ligament; careful division is required", desc: "Critical area for nerve injury" },
    { label: "Berry's ligament has no relationship to the RLN", desc: "Most common site of RLN injury", comp: "NERVE_DAMAGE" },
    { label: "Cut through Berry's ligament quickly without visualization", desc: "High risk of nerve transection", comp: "NERVE_DAMAGE" },
    { label: "Leave Berry's ligament intact", desc: "Cannot remove thyroid without dividing it", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(26, 4, "RLN Course Variation", "The nerve monitor signal drops suddenly while dissecting near the ligament. What do you do?",
    { label: "Stop immediately, reassess anatomy, and check for nerve compression or injury", desc: "Immediate response to signal change" },
    { label: "Continue dissection rapidly", desc: "Will worsen nerve injury", comp: "NERVE_DAMAGE" },
    { label: "Ignore the signal change", desc: "Misses potentially reversible injury", comp: "NERVE_DAMAGE" },
    { label: "Assume the monitor is broken", desc: "Verify equipment but assume nerve issue first", comp: "NERVE_DAMAGE" }
  ),
  createDecision(27, 4, "Thyroid Lobe Removal", "The right thyroid lobe is mobilized with the RLN visualized and preserved. How do you complete the lobectomy?",
    { label: "Divide the isthmus and remove the lobe, ensuring the RLN is under direct vision throughout", desc: "Safe completion of lobectomy" },
    { label: "Pull the lobe off without securing vessels", desc: "Causes hemorrhage and nerve injury", comp: "HEMORRHAGE" },
    { label: "Use staplers across the thyroid without identifying anatomy", desc: "Cannot verify nerve position", comp: "NERVE_DAMAGE" },
    { label: "Leave the posterior thyroid capsule in place blindly", desc: "Misses residual disease, may include parathyroids", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(28, 4, "Contralateral Side", "If performing total thyroidectomy, when do you address the contralateral lobe?",
    { label: "Complete one side with hemostasis and nerve visualization, then proceed to the other side", desc: "Systematic approach" },
    { label: "Work on both sides simultaneously", desc: "Risks confusion and inadequate hemostasis", comp: "HEMORRHAGE" },
    { label: "Remove the contralateral lobe without identifying its RLN", desc: "Each RLN must be individually identified", comp: "NERVE_DAMAGE" },
    { label: "Leave one lobe in situ and close", desc: "Incomplete total thyroidectomy", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(29, 4, "Bleeding from Thyroid Bed", "After gland removal, there is oozing from the thyroid bed. What is your approach?",
    { label: "Achieve meticulous hemostasis with bipolar cautery or clips, avoiding the RLN course", desc: "Careful hemostasis technique" },
    { label: "Pack and wait without identifying bleeding sources", desc: "Inadequate for definitive control", comp: "HEMORRHAGE" },
    { label: "Cauterize broadly in the thyroid bed", desc: "High risk of thermal nerve injury", comp: "NERVE_DAMAGE" },
    { label: "Close immediately and hope bleeding stops", desc: "Risks post-op hematoma", comp: "HEMORRHAGE" }
  ),
  createDecision(30, 4, "Specimen Inspection", "What do you look for on the thyroid specimen after removal?",
    { label: "Inspect for parathyroid glands inadvertently removed; if found, auto-transplant", desc: "Salvage accidentally removed parathyroids" },
    { label: "Discard the specimen immediately", desc: "Pathology is essential and parathyroids may be present", comp: "WRONG_DIAGNOSIS" },
    { label: "Only check specimen size", desc: "Misses inadvertently removed parathyroids", comp: "WRONG_DIAGNOSIS" },
    { label: "Return the specimen to the patient", desc: "Nonsensical and dangerous", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 5: CLOSING
  createDecision(31, 5, "Final Hemostasis", "Before closing, what is the critical final step regarding hemostasis?",
    { label: "Have the anesthesiologist perform a Valsalva maneuver to check for venous bleeding", desc: "Increases venous pressure to reveal bleeding" },
    { label: "Close immediately without further inspection", desc: "Misses potential bleeding sources", comp: "HEMORRHAGE" },
    { label: "Only check arterial bleeding", desc: "Venous bleeding can cause life-threatening hematoma", comp: "HEMORRHAGE" },
    { label: "Irrigate with cold saline and close", desc: "Inadequate hemostasis verification", comp: "HEMORRHAGE" }
  ),
  createDecision(32, 5, "Drain Placement", "Is a drain routinely required after thyroidectomy?",
    { label: "Not routinely; drains are placed only for extensive dissection or concern for bleeding", desc: "Modern practice minimizes drain use" },
    { label: "Always place multiple drains", desc: "No evidence of benefit in routine cases", comp: "WRONG_DIAGNOSIS" },
    { label: "Never place a drain under any circumstances", desc: "May be needed in complex cases", comp: "WRONG_DIAGNOSIS" },
    { label: "Place a drain through the incision", desc: "Should exit through separate stab incision if used", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(33, 5, "Strap Muscle Closure", "How do you close the strap muscles?",
    { label: "Re-approximate in the midline with interrupted absorbable sutures", desc: "Restores normal anatomy" },
    { label: "Leave the strap muscles completely open", desc: "Can lead to adhesions to skin", comp: "WRONG_INCISION_SITE" },
    { label: "Over-sew the strap muscles tightly", desc: "May compromise breathing if hematoma occurs", comp: "HEMORRHAGE" },
    { label: "Excise the strap muscles", desc: "No indication for muscle excision", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(34, 5, "Platysma Closure", "What layer is closed after the strap muscles?",
    { label: "Platysma is closed with interrupted absorbable sutures in the subcutaneous plane", desc: "Standard layer closure" },
    { label: "Close skin directly without platysma closure", desc: "Increases risk of wound dehiscence", comp: "WRONG_INCISION_SITE" },
    { label: "Leave the platysma open", desc: "Poor cosmetic outcome", comp: "WRONG_INCISION_SITE" },
    { label: "Use permanent sutures on platysma", desc: "Unnecessary and requires removal", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(35, 5, "Skin Closure", "What is the preferred skin closure for optimal cosmetic outcome?",
    { label: "Subcuticular running absorbable suture with surgical glue", desc: "Best cosmetic result for neck incision" },
    { label: "Staples on neck skin", desc: "Poor cosmetic outcome for visible area", comp: "WRONG_INCISION_SITE" },
    { label: "Interrupted silk sutures", desc: "Leaves visible railroad track marks", comp: "WRONG_INCISION_SITE" },
    { label: "Leave the wound open to heal secondarily", desc: "Inappropriate for clean thyroidectomy", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(36, 5, "Extubation Considerations", "The patient is being extubated. What complication must be anticipated?",
    { label: "Post-extubation stridor from laryngeal edema or RLN injury", desc: "Airway assessment is critical" },
    { label: "No airway concerns after thyroid surgery", desc: "Neck hematoma and nerve injury are risks", comp: "NERVE_DAMAGE" },
    { label: "Extubate while patient is deeply asleep", desc: "Cannot assess vocal cord function", comp: "NERVE_DAMAGE" },
    { label: "Skip extubation and keep patient intubated", desc: "Unnecessary unless airway concern exists", comp: "ANESTHESIA_OVERDOSE" }
  ),

  // PHASE 6: POST-OP
  createDecision(37, 6, "Immediate Post-Op Assessment", "In the PACU, the patient develops stridor and difficulty breathing. What is your first action?",
    { label: "Evaluate for neck hematoma and be prepared for immediate wound exploration", desc: "Life-threatening emergency recognition" },
    { label: "Wait and observe for spontaneous improvement", desc: "Stridor after thyroidectomy is an emergency", comp: "HEMORRHAGE" },
    { label: "Prescribe cough syrup", desc: "Does not address airway obstruction", comp: "WRONG_DIAGNOSIS" },
    { label: "Discharge the patient", desc: "Absolutely contraindicated", comp: "HEMORRHAGE" }
  ),
  createDecision(38, 6, "Calcium Monitoring", "When should post-operative calcium be checked after total thyroidectomy?",
    { label: "Check serum calcium at 6, 12, and 24 hours post-op, or when symptomatic", desc: "Standard post-thyroidectomy protocol" },
    { label: "Never check calcium - it's unnecessary", desc: "Misses hypocalcemia", comp: "WRONG_DIAGNOSIS" },
    { label: "Check calcium only if patient complains of symptoms", desc: "May miss asymptomatic hypocalcemia", comp: "WRONG_DIAGNOSIS" },
    { label: "Check calcium only once at discharge", desc: "Inadequate monitoring", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(39, 6, "Hypocalcemia Symptoms", "The patient reports tingling around the mouth and in the fingertips. What do you suspect?",
    { label: "Symptomatic hypocalcemia - check serum calcium and consider supplementation", desc: "Classic hypocalcemia symptoms" },
    { label: "Normal post-operative sensation", desc: "Paresthesias are not normal", comp: "WRONG_DIAGNOSIS" },
    { label: "Anxiety attack", desc: "Physical symptoms indicate metabolic abnormality", comp: "WRONG_DIAGNOSIS" },
    { label: "Reaction to anesthesia", desc: "Tingling is not a typical anesthesia effect", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(40, 6, "Calcium Replacement", "Serum calcium is 7.2 mg/dL (normal 8.5-10.5). The patient is symptomatic. What is the treatment?",
    { label: "IV calcium gluconate for symptomatic hypocalcemia, then oral calcium and vitamin D", desc: "Acute management protocol" },
    { label: "Oral calcium only for severe symptoms", desc: "IV is needed for acute symptoms", comp: "WRONG_DIAGNOSIS" },
    { label: "No treatment needed", desc: "Symptomatic hypocalcemia requires treatment", comp: "WRONG_DIAGNOSIS" },
    { label: "Wait for calcium to normalize on its own", desc: "Can progress to tetany or seizures", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(41, 6, "Voice Assessment", "On post-op day 1, the patient's voice is hoarse. What is the appropriate evaluation?",
    { label: "Bedside laryngoscopy to assess vocal cord function", desc: "Direct assessment of RLN function" },
    { label: "Assume it's from intubation and will resolve", desc: "Must rule out RLN injury", comp: "NERVE_DAMAGE" },
    { label: "Tell the patient to whisper to rest the voice", desc: "Does not evaluate for nerve injury", comp: "NERVE_DAMAGE" },
    { label: "No evaluation needed - hoarseness is expected", desc: "Requires investigation if persistent", comp: "NERVE_DAMAGE" }
  ),
  createDecision(42, 6, "Hematoma Watch", "What is the critical time window for post-thyroidectomy hematoma monitoring?",
    { label: "The first 24 hours are highest risk; monitor neck circumference and breathing", desc: "Critical monitoring period" },
    { label: "Only monitor for 1 hour post-op", desc: "Hematomas can develop up to 24 hours", comp: "HEMORRHAGE" },
    { label: "No monitoring needed after thyroid surgery", desc: "Life-threatening hematoma is a known risk", comp: "HEMORRHAGE" },
    { label: "Monitor for 7 days in the hospital", desc: "Excessive for routine cases", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(43, 6, "Discharge Criteria", "What criteria must be met before discharge after thyroidectomy?",
    { label: "Stable calcium, no neck swelling, able to swallow, voice stable, ambulating", desc: "Comprehensive discharge criteria" },
    { label: "Discharge as soon as patient wakes from anesthesia", desc: "Too early - needs monitoring", comp: "WRONG_DIAGNOSIS" },
    { label: "Keep all patients for 72 hours minimum", desc: "Excessive for uncomplicated cases", comp: "WRONG_DIAGNOSIS" },
    { label: "Discharge based only on pain control", desc: "Misses critical thyroid-specific criteria", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(44, 6, "Discharge Medications", "What medications are prescribed at discharge after total thyroidectomy?",
    { label: "Levothyroxine for thyroid hormone replacement, calcium if hypocalcemic", desc: "Standard post-thyroidectomy regimen" },
    { label: "No medications needed after thyroid surgery", desc: "Total thyroidectomy requires hormone replacement", comp: "WRONG_DIAGNOSIS" },
    { label: "Only pain medications", desc: "Misses thyroid hormone replacement", comp: "WRONG_DIAGNOSIS" },
    { label: "Stop all thyroid medications if patient was on them", desc: "Thyroidectomy patients need replacement", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(45, 6, "Follow-Up Timing", "When should the patient return for post-operative follow-up?",
    { label: "2 weeks for wound check, then 6 weeks for TSH level assessment", desc: "Standard thyroidectomy follow-up" },
    { label: "No follow-up needed", desc: "All surgical patients need follow-up", comp: "WRONG_DIAGNOSIS" },
    { label: "Return only if there is a problem", desc: "Scheduled follow-up is standard of care", comp: "WRONG_DIAGNOSIS" },
    { label: "Return in 1 year", desc: "Too late to adjust thyroid hormone", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(46, 6, "Pathology Results", "Final pathology shows papillary thyroid carcinoma, 1.2cm, classic variant. What is the prognosis?",
    { label: "Excellent prognosis; total thyroidectomy is typically curative for this stage", desc: "Papillary thyroid cancer has excellent outcomes" },
    { label: "Patient will need immediate chemotherapy", desc: "Papillary thyroid cancer is treated surgically", comp: "WRONG_DIAGNOSIS" },
    { label: "Prognosis is very poor", desc: "Papillary thyroid cancer has >95% survival", comp: "WRONG_DIAGNOSIS" },
    { label: "Patient needs extensive radiation therapy", desc: "RAI is selective, not universal", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(47, 6, "Return Precautions", "What return precautions are given to the patient after thyroidectomy?",
    { label: "Return for neck swelling, difficulty breathing or swallowing, severe muscle cramps, or fever", desc: "Critical warning signs" },
    { label: "Return only for incision infection", desc: "Misses hematoma and hypocalcemia", comp: "WRONG_DIAGNOSIS" },
    { label: "No return precautions needed", desc: "All surgical patients need precautions", comp: "WRONG_DIAGNOSIS" },
    { label: "Return only if voice changes occur", desc: "Misses other critical complications", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(48, 6, "Long-Term Monitoring", "What is the long-term follow-up for a patient after thyroidectomy for papillary carcinoma?",
    { label: "Regular TSH suppression, thyroglobulin monitoring, and periodic ultrasound", desc: "Standard thyroid cancer surveillance" },
    { label: "No follow-up needed after surgery", desc: "Thyroid cancer requires long-term monitoring", comp: "WRONG_DIAGNOSIS" },
    { label: "Follow-up only for 6 months", desc: "Lifelong monitoring is standard", comp: "WRONG_DIAGNOSIS" },
    { label: "Only need annual physical exam", desc: "Thyroid-specific markers must be followed", comp: "WRONG_DIAGNOSIS" }
  )
];

export const PATIENT = {
  name: "Emily R.",
  age: 38,
  gender: "Female",
  weight: "68 kg",
  bloodType: "A+",
  admission: "Palpable thyroid nodule, asymptomatic, workup revealing Bethesda IV follicular neoplasm",
  mood: "Anxious but well-informed",
  comorbidities: ["none"],
  procedureCategory: "elective"
};

export const PHASES = [
  { id: 1, name: "Patient Intake", icon: "🩺", short: "Intake" },
  { id: 2, name: "Pre-Op Planning", icon: "📋", short: "Pre-Op" },
  { id: 3, name: "Incision & Access", icon: "🔪", short: "Incision" },
  { id: 4, name: "Core Procedure", icon: "⚕️", short: "Procedure" },
  { id: 5, name: "Closing", icon: "🪡", short: "Closing" },
  { id: 6, name: "Post-Op", icon: "📊", short: "Post-Op" },
];

export const thyroidectomyData = { PATIENT, PHASES, DECISIONS };
