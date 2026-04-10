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

// Generic Rescue profiles for when a wrong option hits a specific complication
const getRescueOptions = (type: ComplicationType): RescueOption[] | undefined => {
  switch (type) {
    case "HEMORRHAGE":
      return [
        { id: "1", label: "Apply direct pressure & call for transfusion", desc: "Standard bleeding protocol", correct: true },
        { id: "2", label: "Attempt to clamp vessel blindly", desc: "Risks collateral damage", correct: false },
        { id: "3", label: "Pack the surgical site and reassess", desc: "Damage control", correct: true }
      ];
    case "ANESTHESIA_OVERDOSE":
      return [
        { id: "1", label: "Reduce anesthetic agent and increase ventilation", desc: "Flush lungs", correct: true },
        { id: "2", label: "Administer reversal agent", desc: "Flumazenil or Naloxone", correct: true },
        { id: "3", label: "Increase IV fluids", desc: "Raise pressure only doesn't fix resp", correct: false }
      ];
    case "ANESTHESIA_UNDERDOSE":
      return [
        { id: "1", label: "Increase anesthetic depth", desc: "More agent/propofol", correct: true },
        { id: "2", label: "Administer paralytic", desc: "Rocuronium", correct: true },
        { id: "3", label: "Ignore agitation", desc: "Patient fights ventilator", correct: false }
      ];
    case "NERVE_DAMAGE":
      return [
        { id: "1", label: "Immediately release retraction and reposition", desc: "Remove pressure on nerve", correct: true },
        { id: "2", label: "Administer steroids and document", desc: "Reduce inflammation", correct: true },
        { id: "3", label: "Continue surgery, nerve will recover", desc: "Prolonged compression worsens injury", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Abort primary incision, assess anatomy", desc: "Re-orient", correct: true },
        { id: "2", label: "Continue deeper", desc: "Will hit wrong structures", correct: false },
        { id: "3", label: "Call for help/supervising attending", desc: "Safe bet", correct: true }
      ];
    case "WRONG_DIAGNOSIS":
      return [
        { id: "1", label: "Halt procedure and consult imagery/labs", desc: "Re-evaluate", correct: true },
        { id: "2", label: "Proceed blindly", desc: "Exacerbates error", correct: false }
      ];
    case "BOWEL_PERFORATION":
      return [
        { id: "1", label: "Over-sew the perforation", desc: "Primary repair", correct: true },
        { id: "2", label: "Copious irrigation and broad antibiotics", desc: "Control contamination", correct: true },
        { id: "3", label: "Close with a drain only", desc: "Sepsis risk remains", correct: false }
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
  // PHASE 1: Patient Intake
  createDecision(1, 1, "Initial Presentation", "A 68-year-old patient presents with progressive right hip pain over 3 years, now interfering with daily activities. X-rays show advanced osteoarthritis. What is your first step?",
    { label: "Obtain detailed history and perform comprehensive hip examination", desc: "Standard orthopedic workup" },
    { label: "Schedule surgery immediately without workup", desc: "Skipping essential evaluation", comp: "WRONG_DIAGNOSIS" },
    { label: "Order MRI of the hip only", desc: "Unnecessary for OA diagnosis", comp: "WRONG_DIAGNOSIS" },
    { label: "Refer to pain management only", desc: "Definitive treatment needed", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "Pain Assessment", "Patient describes groin pain that worsens with weight bearing and limits walking to one block. What examination finding confirms hip pathology?",
    { label: "Limited internal rotation and flexion with groin pain on movement", desc: "Classic hip OA findings" },
    { label: "Pain isolated to the lateral thigh only", desc: "May be trochanteric bursitis", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal range of motion with pain", desc: "Unusual for hip OA", comp: "WRONG_DIAGNOSIS" },
    { label: "Pain only with knee flexion", desc: "Unrelated to hip", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Radiographic Evaluation", "X-rays show joint space narrowing, osteophytes, and subchondral sclerosis. What additional imaging is routinely needed before THA?",
    { label: "AP pelvis and lateral hip views are sufficient for standard OA cases", desc: "Standard imaging protocol" },
    { label: "MRI hip with contrast for all patients", desc: "Unnecessary for routine OA", comp: "WRONG_DIAGNOSIS" },
    { label: "CT scan of entire femur", desc: "Reserved for complex deformities", comp: "WRONG_DIAGNOSIS" },
    { label: "Bone scan to rule out metastasis", desc: "Not indicated without suspicion", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(4, 1, "Templating", "You are performing pre-operative templating on X-rays. What is the primary goal of templating?",
    { label: "Determine appropriate implant size and restore leg length and offset", desc: "Essential planning step" },
    { label: "Only estimate implant size roughly", desc: "Insufficient planning", comp: "WRONG_INCISION_SITE" },
    { label: "Skip templating, size intra-op only", desc: "Increases malposition risk", comp: "WRONG_INCISION_SITE" },
    { label: "Template only the acetabulum", desc: "Incomplete preparation", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(5, 1, "Medical Clearance", "Patient has hypertension and type 2 diabetes. What pre-operative medical assessment is required?",
    { label: "Cardiac clearance, HbA1c, and optimize all medical conditions", desc: "Standard pre-op evaluation" },
    { label: "Proceed without cardiac workup", desc: "Misses cardiac risk factors", comp: "WRONG_DIAGNOSIS" },
    { label: "Only check basic metabolic panel", desc: "Incomplete for comorbidities", comp: "WRONG_DIAGNOSIS" },
    { label: "Defer all medical optimization", desc: "Increases peri-op risk", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(6, 1, "Blood Management", "Patient's hemoglobin is 13.2 g/dL. What blood management strategy do you plan?",
    { label: "Type and screen, consider tranexamic acid use, and discuss transfusion threshold", desc: "Multimodal blood conservation" },
    { label: "No pre-op blood work needed", desc: "Misses anemia risk", comp: "HEMORRHAGE" },
    { label: "Order autologous donation only", desc: "Often unnecessary with TXA", comp: "WRONG_DIAGNOSIS" },
    { label: "Proceed without any blood planning", desc: "Unprepared for blood loss", comp: "HEMORRHAGE" }
  ),
  createDecision(7, 1, "Patient Education", "What critical information must be discussed during informed consent for THA?",
    { label: "Infection, dislocation, leg length discrepancy, nerve injury, DVT, implant loosening", desc: "Standard THA risks" },
    { label: "Only mention that surgery fixes the hip", desc: "Incomplete consent", comp: "WRONG_DIAGNOSIS" },
    { label: "Tell patient there are minimal risks", desc: "Understates major risks", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip detailed risk discussion", desc: "Unethical consent process", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(8, 1, "DVT Prophylaxis Planning", "What DVT prophylaxis protocol do you plan for this patient?",
    { label: "Mechanical compression devices plus chemical prophylaxis (aspirin or anticoagulants)", desc: "Standard VTE prevention" },
    { label: "No prophylaxis needed for short cases", desc: "High DVT risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Mechanical compression only", desc: "Insufficient alone", comp: "WRONG_DIAGNOSIS" },
    { label: "Wait until post-op to decide", desc: "Prophylaxis should start pre-op", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(9, 1, "Pre-op Skin Preparation", "Patient is being prepared for surgery. What skin preparation protocol reduces infection risk?",
    { label: "Chlorhexidine gluconate shower night before and morning of surgery", desc: "Evidence-based skin prep" },
    { label: "No special skin prep needed", desc: "Increases infection risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Shave the operative site pre-op", desc: "Increases infection vs clipping", comp: "WRONG_DIAGNOSIS" },
    { label: "Only prep in the OR", desc: "Misses colonization reduction", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2: Pre-Op Planning
  createDecision(10, 2, "Anesthesia Selection", "What type of anesthesia is preferred for total hip arthroplasty?",
    { label: "Neuraxial anesthesia (spinal or epidural) with sedation", desc: "Preferred for THA, reduces DVT and blood loss" },
    { label: "General anesthesia only", desc: "Higher blood loss and DVT risk", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Local anesthesia with minimal sedation", desc: "Inadequate for major orthopedic surgery", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "No anesthesia preference, any is fine", desc: "Neuraxial has proven benefits", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(11, 2, "Spinal Anesthesia Dosing", "You are performing spinal anesthesia. What is the appropriate level of blockade for THA?",
    { label: "T10 to T12 sensory level is adequate for hip surgery", desc: "Appropriate blockade level" },
    { label: "High thoracic T4 level required", desc: "Excessive blockade, causes hypotension", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Lumbar only block", desc: "Insufficient coverage for hip", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "No specific level target needed", desc: "Inadequate planning", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(12, 2, "Patient Positioning", "How do you position the patient for a posterolateral approach THA?",
    { label: "Lateral decubitus position with pelvic stabilization device and all bony prominences padded", desc: "Standard positioning" },
    { label: "Supine position for posterior approach", desc: "Wrong position for posterolateral", comp: "WRONG_INCISION_SITE" },
    { label: "Lateral without padding prominences", desc: "Pressure injury risk", comp: "NERVE_DAMAGE" },
    { label: "Prone position for hip surgery", desc: "Wrong position entirely", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(13, 2, "Sciatic Nerve Protection", "During positioning, what measure protects the sciatic nerve?",
    { label: "Ensure no excessive hip flexion and pad all pressure points in lateral position", desc: "Prevents nerve compression" },
    { label: "No special precautions needed", desc: "Misses preventable injury", comp: "NERVE_DAMAGE" },
    { label: "Hyperflex the hip for exposure", desc: "Causes sciatic stretch injury", comp: "NERVE_DAMAGE" },
    { label: "Only worry about positioning after incision", desc: "Positioning injury occurs early", comp: "NERVE_DAMAGE" }
  ),
  createDecision(14, 2, "Surgical Approach Selection", "Which surgical approach are you planning for this primary THA?",
    { label: "Posterolateral or anterolateral approach based on surgeon expertise and patient factors", desc: "Standard approaches" },
    { label: "Only anterior approach is acceptable", desc: "Multiple valid approaches exist", comp: "WRONG_INCISION_SITE" },
    { label: "Choose approach without considering anatomy", desc: "Individual anatomy matters", comp: "WRONG_INCISION_SITE" },
    { label: "Make incision based on skin marks only", desc: "Requires anatomical planning", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(15, 2, "Antibiotic Prophylaxis", "What is the appropriate antibiotic prophylaxis timing for THA?",
    { label: "Cefazolin 2g IV within 60 minutes before incision (30 min for cefuroxime)", desc: "Standard prophylaxis timing" },
    { label: "Give antibiotics after incision is made", desc: "Inadequate tissue levels at incision", comp: "WRONG_DIAGNOSIS" },
    { label: "No antibiotics needed for clean cases", desc: "Prosthetic joint requires prophylaxis", comp: "WRONG_DIAGNOSIS" },
    { label: "Oral antibiotics are sufficient", desc: "Inadequate coverage", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(16, 2, "Surgical Safety Checklist", "Before making incision, what must be confirmed during the timeout?",
    { label: "Correct patient, procedure, site, implants available, antibiotic given, positioning verified", desc: "Complete surgical timeout" },
    { label: "Only confirm patient name", desc: "Incomplete checklist", comp: "WRONG_INCISION_SITE" },
    { label: "Skip timeout to save time", desc: "Never acceptable", comp: "WRONG_INCISION_SITE" },
    { label: "Have nurse do timeout alone", desc: "Requires full team participation", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(17, 2, "Implant Selection", "What factors guide your implant selection for this patient?",
    { label: "Patient age, activity level, bone quality, and templated size requirements", desc: "Evidence-based selection" },
    { label: "Use largest implants available", desc: "Oversizing causes fracture", comp: "WRONG_INCISION_SITE" },
    { label: "Select implants without templating", desc: "Increases sizing errors", comp: "WRONG_INCISION_SITE" },
    { label: "Use same implant for all patients", desc: "Individual anatomy varies", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 3: Incision & Access
  createDecision(18, 3, "Incision Planning", "For a posterolateral approach, where do you mark your incision?",
    { label: "Centered over the greater trochanter, extending proximal and distal in line with the femoral shaft", desc: "Standard posterolateral landmark" },
    { label: "Anterior to the anterior superior iliac spine", desc: "Wrong landmark for posterolateral", comp: "WRONG_INCISION_SITE" },
    { label: "Mid-thigh incision", desc: "Too far distal", comp: "WRONG_INCISION_SITE" },
    { label: "Posterior thigh incision", desc: "Wrong anatomical location", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(19, 3, "Skin Incision", "You are about to make the skin incision. What technique is appropriate?",
    { label: "Single smooth incision through skin and subcutaneous tissue to fascia", desc: "Clean surgical technique" },
    { label: "Multiple small stabbing incisions", desc: "Poor exposure", comp: "WRONG_INCISION_SITE" },
    { label: "Incision without checking landmarks again", desc: "Reckless technique", comp: "WRONG_INCISION_SITE" },
    { label: "Make incision shorter than templated", desc: "Inadequate exposure", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(20, 3, "Deep Dissection", "After incising the skin, you encounter the iliotibial band. How do you proceed?",
    { label: "Incise the iliotibial band in line with the skin incision over the greater trochanter", desc: "Standard deep dissection" },
    { label: "Cut through the tensor fascia anteriorly", desc: "Wrong plane, muscle damage", comp: "WRONG_INCISION_SITE" },
    { label: "Dissect without identifying layers", desc: "Increases tissue trauma", comp: "HEMORRHAGE" },
    { label: "Abandon approach if IT band is thick", desc: "Normal anatomy", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(21, 3, "Short External Rotators", "You have exposed the hip capsule. What do you do with the short external rotators?",
    { label: "Tag and detach the short external rotators close to their insertion on the femur", desc: "Standard exposure technique" },
    { label: "Cut without tagging for later repair", desc: "Makes repair difficult", comp: "WRONG_DIAGNOSIS" },
    { label: "Leave external rotators intact", desc: "Inadequate exposure", comp: "WRONG_INCISION_SITE" },
    { label: "Excise the entire rotator cuff", desc: "Excessive tissue destruction", comp: "NERVE_DAMAGE" }
  ),
  createDecision(22, 3, "Capsule Management", "The hip capsule is now visible. How do you manage it?",
    { label: "Incise the capsule in a T-shaped fashion, tag edges for later repair", desc: "Preserves capsule for closure" },
    { label: "Excise the entire capsule", desc: "Reduces stability, impairs healing", comp: "WRONG_DIAGNOSIS" },
    { label: "Do not open the capsule", desc: "Cannot access joint", comp: "WRONG_INCISION_SITE" },
    { label: "Cauterize through capsule without visualization", desc: "Risk to surrounding structures", comp: "NERVE_DAMAGE" }
  ),
  createDecision(23, 3, "Hip Dislocation", "You are ready to dislocate the hip. What technique minimizes femoral fracture risk?",
    { label: "Flexion, adduction, and gentle internal rotation with controlled force", desc: "Safe dislocation technique" },
    { label: "Forceful internal rotation without flexion", desc: "High femoral fracture risk", comp: "WRONG_INCISION_SITE" },
    { label: "Maximum leverage with instruments", desc: "Causes fracture", comp: "WRONG_INCISION_SITE" },
    { label: "Dislocate quickly without control", desc: "Uncontrolled force causes injury", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(24, 3, "Sciatic Nerve Identification", "During posterior approach, how do you protect the sciatic nerve?",
    { label: "Identify the nerve posteriorly and ensure retraction does not put pressure on it", desc: "Direct nerve protection" },
    { label: "Assume nerve is out of the field without checking", desc: "Blind retraction causes injury", comp: "NERVE_DAMAGE" },
    { label: "Retract aggressively in the posterior aspect", desc: "Direct sciatic injury", comp: "NERVE_DAMAGE" },
    { label: "Only check for nerve after dissection complete", desc: "Protection should be proactive", comp: "NERVE_DAMAGE" }
  ),
  createDecision(25, 3, "Exposure Assessment", "The hip is dislocated. How do you assess adequate exposure?",
    { label: "Verify visualization of the entire femoral head and acetabulum with appropriate retractors", desc: "Complete exposure check" },
    { label: "Proceed with limited visualization", desc: "Inadequate exposure risks error", comp: "WRONG_INCISION_SITE" },
    { label: "Do not reassess exposure quality", desc: "May miss inadequate field", comp: "WRONG_INCISION_SITE" },
    { label: "Assume exposure is adequate without looking", desc: "Fails to verify", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 4: Core Procedure
  createDecision(26, 4, "Femoral Head Removal", "The hip is dislocated. How do you remove the femoral head?",
    { label: "Perform femoral neck osteotomy at the templated level using an oscillating saw", desc: "Standard neck osteotomy" },
    { label: "Cut the neck without templated measurement", desc: "Incorrect cut level", comp: "WRONG_INCISION_SITE" },
    { label: "Excise the entire proximal femur", desc: "Massive over-resection", comp: "WRONG_INCISION_SITE" },
    { label: "Remove head without cutting neck", desc: "Impossible technique", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(27, 4, "Femoral Head Extraction", "After osteotomy, the femoral head is loose. How do you extract it?",
    { label: "Use a corkscrew or threaded pin extractor to remove the head intact", desc: "Standard extraction technique" },
    { label: "Crush the head to remove it", desc: "Bone debris contamination", comp: "WRONG_DIAGNOSIS" },
    { label: "Leave head fragments in joint", desc: "Retained loose body", comp: "WRONG_DIAGNOSIS" },
    { label: "Pull with excessive force without proper tool", desc: "Socket or acetabular damage", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(28, 4, "Acetabular Exposure", "With the femoral head removed, how do you expose the acetabulum?",
    { label: "Place retractors anteriorly, posteriorly, and inferiorly to visualize the entire acetabulum", desc: "Complete acetabular exposure" },
    { label: "Retract only anteriorly", desc: "Incomplete exposure", comp: "WRONG_INCISION_SITE" },
    { label: "Do not use retractors", desc: "Poor visualization", comp: "WRONG_INCISION_SITE" },
    { label: "Retract directly on sciatic nerve", desc: "Causes nerve injury", comp: "NERVE_DAMAGE" }
  ),
  createDecision(29, 4, "Acetabular Debridement", "What is your first step in acetabular preparation?",
    { label: "Remove osteophytes and remaining labrum to identify the true acetabular margins", desc: "Essential for proper cup placement" },
    { label: "Ream immediately without debridement", desc: "Poor cup positioning", comp: "WRONG_INCISION_SITE" },
    { label: "Leave osteophytes intact", desc: "Impedes proper cup sizing", comp: "WRONG_INCISION_SITE" },
    { label: "Remove only central osteophytes", desc: "Inadequate debridement", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(30, 4, "Acetabular Reaming", "You begin reaming the acetabulum. What is the correct technique?",
    { label: "Ream sequentially in 1-2mm increments until bleeding subchondral bone is achieved", desc: "Sequential reaming technique" },
    { label: "Ream with largest size immediately", desc: "Over-reaming causes loosening", comp: "WRONG_INCISION_SITE" },
    { label: "Ream without sequential sizing", desc: "Poor fit assessment", comp: "WRONG_INCISION_SITE" },
    { label: "Skip reaming, place cup directly", desc: "Poor bone contact", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(31, 4, "Acetabular Cup Positioning - Angle", "What is the target acetabular cup position?",
    { label: "40-45 degrees of abduction and 15-20 degrees of anteversion", desc: "Safe zone positioning" },
    { label: "60 degrees of abduction", desc: "Excessive abduction, impingement risk", comp: "WRONG_INCISION_SITE" },
    { label: "Neutral version (0 degrees)", desc: "Causes posterior instability", comp: "WRONG_INCISION_SITE" },
    { label: "Retroversion placement", desc: "High dislocation risk", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(32, 4, "Cup Impaction", "You are impacting the acetabular component. What confirms proper seating?",
    { label: "Cup seats fully against bone with no gaps visible, impaction sound changes", desc: "Confirm complete seating" },
    { label: "Stop when cup is partially seated", desc: "Incomplete seating causes loosening", comp: "WRONG_INCISION_SITE" },
    { label: "Force cup past resistance", desc: "May fracture acetabulum", comp: "HEMORRHAGE" },
    { label: "Accept any position that looks close", desc: "Imprecise placement", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(33, 4, "Cup Fixation", "What adjunct fixation do you use for the acetabular component?",
    { label: "Use supplemental screws if bone quality is poor or cup stability is questionable", desc: "Augment fixation when needed" },
    { label: "Never use screws for acetabular cup", desc: "May need in poor bone", comp: "WRONG_INCISION_SITE" },
    { label: "Place screws blindly", desc: "Risk to neurovascular structures", comp: "NERVE_DAMAGE" },
    { label: "Use excessive number of screws", desc: "Unnecessary without benefit", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(34, 4, "Liner Placement", "What liner do you select for this active 68-year-old?",
    { label: "Cross-linked polyethylene liner appropriate for activity level and cup design", desc: "Standard bearing surface" },
    { label: "Metal-on-metal bearing for all patients", desc: "High wear and systemic metal ions", comp: "WRONG_DIAGNOSIS" },
    { label: "Ceramic liner without cup compatibility check", desc: "May not fit cup design", comp: "WRONG_INCISION_SITE" },
    { label: "Skip liner, place head directly", desc: "Component mismatch", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(35, 4, "Femoral Exposure", "Now turning to the femur, how do you expose the canal?",
    { label: "Flex, adduct, and internally rotate the leg to deliver the femur into the wound", desc: "Standard femoral exposure" },
    { label: "Leave leg in neutral position", desc: "Cannot access canal", comp: "WRONG_INCISION_SITE" },
    { label: "Externally rotate forcefully", desc: "Wrong exposure technique", comp: "WRONG_INCISION_SITE" },
    { label: "Hyperextend the hip", desc: "Increases sciatic tension", comp: "NERVE_DAMAGE" }
  ),
  createDecision(36, 4, "Femoral Canal Preparation", "How do you begin femoral canal preparation?",
    { label: "Start with a box osteotome or canal finder at the correct entry point in the piriformis fossa", desc: "Correct canal entry technique" },
    { label: "Ream from lateral cortex", desc: "Wrong entry point causes varus", comp: "WRONG_INCISION_SITE" },
    { label: "Enter canal without identifying landmarks", desc: "Malposition risk", comp: "WRONG_INCISION_SITE" },
    { label: "Broach before opening canal", desc: "Incorrect sequence", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(37, 4, "Femoral Broaching", "You begin sequential broaching. What indicates adequate fit?",
    { label: "Broach achieves rotational stability with good cortical contact and no subsidence", desc: "Proper stem fit" },
    { label: "Stop at smallest broach size", desc: "Undersized stem, unstable", comp: "WRONG_INCISION_SITE" },
    { label: "Force largest broach in all cases", desc: "Causes femoral fracture", comp: "WRONG_INCISION_SITE" },
    { label: "Broach without assessing stability", desc: "Misses loose fit", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(38, 4, "Femoral Stem Sizing", "What is the target stem position?",
    { label: "Centralized in canal with neutral alignment, filling metaphysis appropriately", desc: "Optimal stem positioning" },
    { label: "Varus positioning is acceptable", desc: "Increases loosening and fracture risk", comp: "WRONG_INCISION_SITE" },
    { label: "Leave stem proud intentionally", desc: "Affects leg length", comp: "WRONG_INCISION_SITE" },
    { label: "Seat stem without considering offset", desc: "Affects stability and biomechanics", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(39, 4, "Trial Reduction", "After placing trial components, what do you assess?",
    { label: "Range of motion, stability throughout arc, leg length, and offset", desc: "Comprehensive trial assessment" },
    { label: "Only check if hip reduces", desc: "Misses instability", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip trial reduction", desc: "Cannot assess final result", comp: "WRONG_INCISION_SITE" },
    { label: "Check stability in one position only", desc: "Incomplete assessment", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(40, 4, "Leg Length Assessment", "How do you assess leg length during trial reduction?",
    { label: "Compare to pre-operative templating marks and perform direct comparison of knee levels", desc: "Multi-method assessment" },
    { label: "Estimate by visual inspection only", desc: "Inaccurate assessment", comp: "WRONG_DIAGNOSIS" },
    { label: "Do not measure leg length", desc: "Misses significant LLD", comp: "WRONG_DIAGNOSIS" },
    { label: "Accept any length discrepancy", desc: "Patient dissatisfaction risk", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(41, 4, "Stability Testing", "What positions do you test for hip stability?",
    { label: "Test flexion-adduction-internal rotation for posterior instability and extension-abduction for anterior", desc: "Comprehensive stability testing" },
    { label: "Only test one position", desc: "Misses direction-specific instability", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip stability testing", desc: "Cannot adjust for instability", comp: "WRONG_DIAGNOSIS" },
    { label: "Test only deep flexion", desc: "Incomplete stability assessment", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(42, 4, "Impingement Check", "During range of motion testing, you feel crepitus. What do you do?",
    { label: "Assess for impingement from osteophytes or component positioning and address as needed", desc: "Identify and correct impingement" },
    { label: "Ignore crepitus as normal", desc: "Impingement causes wear and instability", comp: "WRONG_DIAGNOSIS" },
    { label: "Proceed without investigation", desc: "Misses correctable issue", comp: "WRONG_DIAGNOSIS" },
    { label: "Assume crepitus is from soft tissue only", desc: "May be component contact", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(43, 4, "Femoral Head Selection", "What femoral head size do you select?",
    { label: "Select head size based on stability requirements and liner compatibility, typically 32-36mm", desc: "Individualized head selection" },
    { label: "Use smallest head in all cases", desc: "May compromise stability", comp: "WRONG_INCISION_SITE" },
    { label: "Choose head without stability consideration", desc: "May cause dislocation", comp: "WRONG_INCISION_SITE" },
    { label: "Skip head size selection, use default", desc: "Suboptimal for patient anatomy", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(44, 4, "Final Stem Impaction", "You are impacting the final femoral stem. What technique prevents fracture?",
    { label: "Controlled impaction with careful attention to seating and no unusual resistance", desc: "Safe impaction technique" },
    { label: "Maximum force on all stems", desc: "Calcar or femur fracture", comp: "WRONG_INCISION_SITE" },
    { label: "Impact without checking alignment", desc: "Causes malposition", comp: "WRONG_INCISION_SITE" },
    { label: "Ignore crepitus during impaction", desc: "May indicate fracture", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(45, 4, "Final Reduction", "The final components are in place. How do you reduce the hip?",
    { label: "Gentle traction and internal rotation with the femoral head aligned in the acetabulum", desc: "Controlled reduction" },
    { label: "Forceful reduction with maximum leverage", desc: "Causes fracture or component damage", comp: "WRONG_INCISION_SITE" },
    { label: "Reduce without checking alignment", desc: "May cause liner damage", comp: "WRONG_INCISION_SITE" },
    { label: "Reduce with leg in wrong position", desc: "Difficult reduction, injury risk", comp: "NERVE_DAMAGE" }
  ),

  // PHASE 5: Closing
  createDecision(46, 5, "Post-Reduction Stability", "Hip is reduced. What is your immediate assessment?",
    { label: "Recheck stability through full range of motion and verify leg length equality", desc: "Final verification" },
    { label: "Close immediately without rechecking", desc: "Misses instability", comp: "WRONG_DIAGNOSIS" },
    { label: "Assume stability from earlier trial", desc: "Final components may differ", comp: "WRONG_DIAGNOSIS" },
    { label: "Check only one motion plane", desc: "Incomplete stability check", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(47, 5, "Capsule Repair", "How do you manage the hip capsule during closure?",
    { label: "Repair the capsule to enhance posterior stability, using strong absorbable sutures", desc: "Standard capsule repair" },
    { label: "Leave capsule completely open", desc: "Reduces stability, increases dislocation", comp: "WRONG_DIAGNOSIS" },
    { label: "Excise remaining capsule", desc: "Destroys stabilizing tissue", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip capsule repair for all approaches", desc: "Posterior approach needs repair", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(48, 5, "External Rotator Repair", "How do you repair the short external rotators?",
    { label: "Repair external rotators through drill holes in greater trochanter or direct tendon repair", desc: "Anatomic repair for stability" },
    { label: "Leave external rotators unrepaired", desc: "Impairs healing and stability", comp: "WRONG_DIAGNOSIS" },
    { label: "Only close skin over rotator defect", desc: "No deep layer repair", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip rotator repair in all cases", desc: "Best practice is repair", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(49, 5, "Hemostasis", "Before closing, what do you check?",
    { label: "Inspect for bleeding, achieve hemostasis with cautery or hemostatic agents as needed", desc: "Thorough hemostasis" },
    { label: "Close without checking bleeding", desc: "Post-op hematoma risk", comp: "HEMORRHAGE" },
    { label: "Ignore active bleeding if small", desc: "Hematoma formation", comp: "HEMORRHAGE" },
    { label: "Assume hemostasis from earlier", desc: "New bleeding may have occurred", comp: "HEMORRHAGE" }
  ),
  createDecision(50, 5, "Irrigation", "What irrigation protocol do you use before closure?",
    { label: "Pulsatile lavage with antibiotic solution or sterile saline, minimum 1 liter", desc: "Thorough debridement" },
    { label: "No irrigation needed", desc: "Increases infection risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Minimal splash of saline", desc: "Inadequate irrigation", comp: "WRONG_DIAGNOSIS" },
    { label: "Irrigate with povidone-iodine into joint", desc: "May affect healing", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(51, 5, "Fascia Closure", "How do you close the fascial layer?",
    { label: "Close fascia lata with strong absorbable suture in running or interrupted fashion", desc: "Standard fascial closure" },
    { label: "Close skin only, skip fascia", desc: "Risk of fascial dehiscence", comp: "WRONG_INCISION_SITE" },
    { label: "Leave fascia open to drain", desc: "Incorrect closure technique", comp: "WRONG_INCISION_SITE" },
    { label: "Use staples on fascia", desc: "Inadequate fascial repair", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(52, 5, "Skin Closure", "What is your preferred skin closure method?",
    { label: "Subcuticular absorbable suture with skin adhesive or staples", desc: "Cosmetic and secure closure" },
    { label: "Leave wound open to air", desc: "Increases infection risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Close with loose sutures only", desc: "Poor wound apposition", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip subcutaneous layer closure", desc: "Increases wound complications", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 6: Post-Op
  createDecision(53, 6, "Immediate Post-Op X-ray", "What radiographic evaluation do you order post-operatively?",
    { label: "AP pelvis and lateral hip to confirm component position and assess for complications", desc: "Standard post-op imaging" },
    { label: "No post-op X-ray needed", desc: "Cannot verify component position", comp: "WRONG_DIAGNOSIS" },
    { label: "Only obtain lateral view", desc: "Incomplete assessment", comp: "WRONG_DIAGNOSIS" },
    { label: "Delay X-ray until discharge", desc: "Misses immediate complications", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(54, 6, "Weight Bearing Protocol", "What weight bearing status do you prescribe?",
    { label: "Weight bearing as tolerated with assistive devices, progress as comfort allows", desc: "Standard THA protocol" },
    { label: "Strict non-weight bearing for 6 weeks", desc: "Unnecessarily restrictive", comp: "WRONG_DIAGNOSIS" },
    { label: "No weight bearing instructions given", desc: "Patient safety risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Full weight bearing without assistive device immediately", desc: "Fall risk", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(55, 6, "Dislocation Precautions", "What dislocation precautions do you teach the patient?",
    { label: "Avoid hip flexion beyond 90 degrees, crossing legs, and internal rotation for 6-12 weeks", desc: "Standard posterior precautions" },
    { label: "No precautions needed after THA", desc: "High dislocation risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Only restriction is no running", desc: "Misses critical motions", comp: "WRONG_DIAGNOSIS" },
    { label: "Precautions apply for only 1 week", desc: "Too short a precaution period", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(56, 6, "DVT Prophylaxis", "What DVT prophylaxis do you prescribe post-operatively?",
    { label: "Aspirin 325mg twice daily for 4-6 weeks with mechanical compression devices", desc: "Standard VTE prophylaxis" },
    { label: "No DVT prophylaxis", desc: "High VTE risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Mechanical compression only, no medication", desc: "Insufficient for THA", comp: "WRONG_DIAGNOSIS" },
    { label: "Warfarin without monitoring", desc: "Requires INR monitoring", comp: "HEMORRHAGE" }
  ),
  createDecision(57, 6, "Pain Management", "What is your multimodal pain management protocol?",
    { label: "Scheduled acetaminophen, NSAID if appropriate, with opioid rescue for breakthrough", desc: "Multimodal approach" },
    { label: "Opioids only for all pain", desc: "High side effect profile", comp: "ANESTHESIA_OVERDOSE" },
    { label: "No pain medication prescription", desc: "Inadequate pain control", comp: "WRONG_DIAGNOSIS" },
    { label: "Only prescribe IV narcotics", desc: "Poor transition to home", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(58, 6, "Physical Therapy", "When do you initiate physical therapy?",
    { label: "Day of surgery or post-op day 1 with gait training and hip strengthening exercises", desc: "Early mobilization" },
    { label: "Delay PT until 2 weeks post-op", desc: "Delays recovery", comp: "WRONG_DIAGNOSIS" },
    { label: "No PT needed after THA", desc: "Optimal recovery requires therapy", comp: "WRONG_DIAGNOSIS" },
    { label: "PT only for inpatient, no home therapy", desc: "Incomplete rehabilitation plan", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(59, 6, "Wound Care", "What wound care instructions do you provide?",
    { label: "Keep incision clean and dry, no soaking, observe for signs of infection", desc: "Standard wound care" },
    { label: "Remove dressing immediately at home", desc: "Premature dressing removal", comp: "WRONG_DIAGNOSIS" },
    { label: "Soak incision in bath water", desc: "Increases infection risk", comp: "WRONG_DIAGNOSIS" },
    { label: "No wound care instructions given", desc: "Patient safety risk", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(60, 6, "Follow-up Schedule", "When is the first post-operative follow-up?",
    { label: "2-6 weeks for wound check, then routine surveillance at 3 months, 1 year, and periodically", desc: "Standard follow-up schedule" },
    { label: "No follow-up needed unless problems", desc: "Misses surveillance opportunity", comp: "WRONG_DIAGNOSIS" },
    { label: "Follow-up only at 1 year", desc: "Too long without assessment", comp: "WRONG_DIAGNOSIS" },
    { label: "Only call if emergency", desc: "No routine surveillance planned", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(61, 6, "Signs of Infection", "What signs of infection do you teach the patient to watch for?",
    { label: "Fever over 101°F, increasing redness, drainage, severe pain, or wound opening", desc: "Complete infection signs" },
    { label: "Only mention fever as concern", desc: "Incomplete patient education", comp: "WRONG_DIAGNOSIS" },
    { label: "Tell patient infection is not a concern", desc: "False reassurance", comp: "WRONG_DIAGNOSIS" },
    { label: "No infection warning signs discussed", desc: "Misses early detection", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(62, 6, "Return Precautions", "What symptoms require immediate return to emergency department?",
    { label: "Chest pain, shortness of breath, calf swelling, severe hip pain, inability to bear weight, fever", desc: "Critical warning signs" },
    { label: "Only return for uncontrolled bleeding", desc: "Misses PE, dislocation, infection", comp: "WRONG_DIAGNOSIS" },
    { label: "No return instructions given", desc: "Patient safety risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Call clinic for all emergencies", desc: "Delays critical care", comp: "WRONG_DIAGNOSIS" }
  )
];

export const PATIENT = {
  name: "Robert J.",
  age: 68,
  gender: "Male",
  weight: "82 kg",
  bloodType: "A+",
  admission: "Right hip osteoarthritis with progressive pain and functional limitation",
  mood: "Hopeful",
  comorbidities: ["hypertension", "diabetes"],
  procedureCategory: "orthopedic"
};

export const PHASES = [
  { id: 1, name: "Patient Intake", icon: "🩺", short: "Intake" },
  { id: 2, name: "Pre-Op Planning", icon: "📋", short: "Pre-Op" },
  { id: 3, name: "Incision & Access", icon: "🔪", short: "Incision" },
  { id: 4, name: "Core Procedure", icon: "⚕️", short: "Procedure" },
  { id: 5, name: "Closing", icon: "🪡", short: "Closing" },
  { id: 6, name: "Post-Op", icon: "📊", short: "Post-Op" },
];

export const hipReplacementData = { PATIENT, PHASES, DECISIONS };
