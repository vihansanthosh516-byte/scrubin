import { ComplicationType } from "../lib/vitals";

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
        { id: "1", label: "Apply direct pressure and identify bleeding source", desc: "Standard bleeding control", correct: true },
        { id: "2", label: "Use bipolar cautery on low setting", desc: "Direct surgical control", correct: true },
        { id: "3", label: "Continue without intervention", desc: "Blood accumulates in surgical field", correct: false }
      ];
    case "ANESTHESIA_OVERDOSE":
      return [
        { id: "1", label: "Reduce anesthetic agents and hyperventilate", desc: "Clear the system", correct: true },
        { id: "2", label: "Administer reversal agents if appropriate", desc: "Specific antidotes", correct: true },
        { id: "3", label: "Continue current anesthetic", desc: "Prolongs CNS depression", correct: false }
      ];
    case "ANESTHESIA_UNDERDOSE":
      return [
        { id: "1", label: "Increase anesthetic agent concentration", desc: "Achieve adequate depth", correct: true },
        { id: "2", label: "Administer additional propofol bolus", desc: "Rapid deepening", correct: true },
        { id: "3", label: "Ignore and continue surgery", desc: "Patient may wake up", correct: false }
      ];
    case "NERVE_DAMAGE":
      return [
        { id: "1", label: "Halt dissection and identify the nerve structure", desc: "Prevents further injury", correct: true },
        { id: "2", label: "Use nerve monitoring to assess function", desc: "Diagnostic assessment", correct: true },
        { id: "3", label: "Continue surgery and hope for recovery", desc: "Permanent deficit risk", correct: false }
      ];
    case "BOWEL_PERFORATION":
      return [
        { id: "1", label: "Primary repair with sutures", desc: "Standard closure", correct: true },
        { id: "2", label: "Copious irrigation and antibiotics", desc: "Control contamination", correct: true },
        { id: "3", label: "Apply drain only without repair", desc: "Inadequate source control", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Stop and reassess anatomy with landmarks", desc: "Re-orient safely", correct: true },
        { id: "2", label: "Call for attending supervision", desc: "Safe approach", correct: true },
        { id: "3", label: "Continue deeper", desc: "Compounds error", correct: false }
      ];
    case "WRONG_DIAGNOSIS":
      return [
        { id: "1", label: "Halt procedure and reassess with imaging", desc: "Re-evaluate", correct: true },
        { id: "2", label: "Consult senior surgeon", desc: "Safe approach", correct: true },
        { id: "3", label: "Proceed blindly", desc: "Exacerbates error", correct: false }
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
  // PHASE 1 - Patient Intake
  createDecision(1, 1, "Initial Presentation", "Patient presents with right groin bulge that increases with coughing and is reducible. What is your first step?",
    { label: "Perform physical exam of the groin and assess reducibility", desc: "Standard clinical assessment" },
    { label: "Order CT scan immediately", desc: "Unnecessary for uncomplicated hernia", comp: "WRONG_DIAGNOSIS" },
    { label: "Schedule surgery without examination", desc: "Skips vital assessment", comp: "WRONG_DIAGNOSIS" },
    { label: "Tell patient it is not a hernia", desc: "Misses the diagnosis", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "Hernia Classification", "Exam reveals a reducible bulge above the inguinal ligament, emerging lateral to the epigastric vessels. What type of hernia is this?",
    { label: "Indirect inguinal hernia", desc: "Correct anatomical classification" },
    { label: "Direct inguinal hernia", desc: "Direct hernias are medial to epigastric vessels", comp: "WRONG_DIAGNOSIS" },
    { label: "Femoral hernia", desc: "Femoral hernias are below the inguinal ligament", comp: "WRONG_DIAGNOSIS" },
    { label: "Incisional hernia", desc: "No prior incision present", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Strangulation Assessment", "What findings indicate a strangulated hernia requiring emergency surgery?",
    { label: "Tender, non-reducible mass with overlying skin changes and systemic signs", desc: "Signs of ischemia" },
    { label: "Soft, reducible mass with no pain", desc: "Not strangulated", comp: "WRONG_DIAGNOSIS" },
    { label: "Mass that disappears when lying down", desc: "Uncomplicated reducible hernia", comp: "WRONG_DIAGNOSIS" },
    { label: "Small bulge only visible with Valsalva", desc: "Early hernia, not strangulated", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(4, 1, "Surgical Approach Selection", "The hernia is reducible and uncomplicated. What surgical approach do you recommend?",
    { label: "Lichtenstein tension-free mesh repair", desc: "Gold standard open repair" },
    { label: "Watchful waiting forever", desc: "Hernias do not resolve spontaneously", comp: "WRONG_DIAGNOSIS" },
    { label: "Truss only without surgery", desc: "Does not treat the defect", comp: "WRONG_DIAGNOSIS" },
    { label: "Emergency surgery for elective case", desc: "Unnecessary urgency", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(5, 1, "Pre-op Labs", "Patient is 45 years old with no medical history. What preoperative testing is needed?",
    { label: "Basic metabolic panel and CBC based on age and comorbidities", desc: "Appropriate screening" },
    { label: "No testing at all", desc: "Minimum baseline needed", comp: "WRONG_DIAGNOSIS" },
    { label: "Extensive cardiac workup", desc: "Unnecessary for healthy patient", comp: "WRONG_DIAGNOSIS" },
    { label: "CT scan of abdomen", desc: "Unnecessary radiation for uncomplicated hernia", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(6, 1, "Informed Consent", "During consent, patient asks about recurrence rates. What do you tell them?",
    { label: "Approximately 1-5% recurrence rate with mesh repair", desc: "Accurate statistics" },
    { label: "Zero chance of recurrence with mesh", desc: "Dishonest guarantee", comp: "WRONG_DIAGNOSIS" },
    { label: "50% chance of recurrence", desc: "Overstates risk significantly", comp: "WRONG_DIAGNOSIS" },
    { label: "Refuse to discuss recurrence", desc: "Inadequate consent", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2 - Pre-Op Planning
  createDecision(7, 2, "Anesthesia Selection", "What anesthesia is appropriate for open inguinal hernia repair?",
    { label: "Local anesthesia with sedation, spinal, or general based on patient preference", desc: "Multiple acceptable options" },
    { label: "Only general anesthesia acceptable", desc: "Limits patient choice unnecessarily", comp: "ANESTHESIA_OVERDOSE" },
    { label: "No anesthesia needed", desc: "Surgery requires anesthesia", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Epidural only for groin surgery", desc: "Spinal or local are better options", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(8, 2, "Local Anesthesia Dosing", "If using local anesthesia, what is the maximum safe dose of lidocaine with epinephrine?",
    { label: "7 mg/kg with epinephrine", desc: "Safe maximum dose" },
    { label: "15 mg/kg with epinephrine", desc: "Exceeds safe limits", comp: "ANESTHESIA_OVERDOSE" },
    { label: "3 mg/kg with epinephrine", desc: "Underdosing, inadequate anesthesia", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "No maximum limit exists", desc: "Dangerous misconception", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(9, 2, "Positioning", "How do you position the patient for inguinal hernia repair?",
    { label: "Supine with arms tucked, slight Trendelenburg if needed for exposure", desc: "Standard positioning" },
    { label: "Lateral decubitus position", desc: "Wrong position for inguinal approach", comp: "WRONG_INCISION_SITE" },
    { label: "Prone position", desc: "Completely incorrect", comp: "WRONG_INCISION_SITE" },
    { label: "Lithotomy position", desc: "Unnecessary for hernia repair", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(10, 2, "Prophylactic Antibiotics", "Does this patient need prophylactic antibiotics?",
    { label: "Single dose of cefazolin for mesh repair is reasonable", desc: "Standard practice for mesh placement" },
    { label: "No antibiotics ever needed for hernia", desc: "Mesh increases infection risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Multiple days of postoperative antibiotics", desc: "Unnecessary prolonged course", comp: "WRONG_DIAGNOSIS" },
    { label: "Oral antibiotics only", desc: "Inadequate for surgical prophylaxis", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(11, 2, "Timeout", "Before incision, what must be verified?",
    { label: "Patient identity, procedure, site (right or left), allergies", desc: "Complete verification" },
    { label: "Only confirm patient name", desc: "Incomplete timeout", comp: "WRONG_INCISION_SITE" },
    { label: "Skip timeout for minor surgery", desc: "Never acceptable", comp: "WRONG_INCISION_SITE" },
    { label: "Only check consent form", desc: "More than consent needed", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 3 - Incision & Dissection
  createDecision(12, 3, "Incision Location", "Where do you make your incision for open inguinal hernia repair?",
    { label: "1cm above and parallel to the inguinal ligament, from pubic tubercle to internal ring", desc: "Standard incision" },
    { label: "Transverse incision below the inguinal ligament", desc: "Wrong location for inguinal approach", comp: "WRONG_INCISION_SITE" },
    { label: "Midline incision", desc: "Wrong anatomical location", comp: "WRONG_INCISION_SITE" },
    { label: "Incision directly over the hernia bulge only", desc: "May miss key anatomy", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(13, 3, "Landmark Identification", "What key landmark do you identify first after opening the external oblique aponeurosis?",
    { label: "Ilioinguinal nerve", desc: "Critical structure to protect" },
    { label: "Femoral artery immediately", desc: "Not yet visible in dissection plane", comp: "NERVE_DAMAGE" },
    { label: "Spermatic cord without identifying nerve", desc: "Misses critical anatomy", comp: "NERVE_DAMAGE" },
    { label: "Continue without identifying landmarks", desc: "Increases injury risk", comp: "NERVE_DAMAGE" }
  ),
  createDecision(14, 3, "Nerve Identification", "You have identified the ilioinguinal nerve. What do you do with it?",
    { label: "Gently mobilize and protect it throughout the case", desc: "Nerve preservation" },
    { label: "Divide the nerve routinely", desc: "Unnecessary sacrifice, causes numbness", comp: "NERVE_DAMAGE" },
    { label: "Cauterize the nerve", desc: "Causes neuroma and chronic pain", comp: "NERVE_DAMAGE" },
    { label: "Ignore it and proceed", desc: "Risk of traction injury", comp: "NERVE_DAMAGE" }
  ),
  createDecision(15, 3, "Hernia Sac Dissection", "You have isolated the hernia sac. How do you handle it?",
    { label: "Reduce the sac and high ligation for indirect hernia, or reduce for direct hernia", desc: "Standard technique" },
    { label: "Excise all sac tissue without reduction", desc: "Unnecessary tissue loss", comp: "BOWEL_PERFORATION" },
    { label: "Leave the sac completely untouched", desc: "Does not address the defect", comp: "WRONG_DIAGNOSIS" },
    { label: "Open the sac routinely", desc: "Unnecessary unless contents need inspection", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(16, 3, "Cord Structure Identification", "What structures must be identified within the spermatic cord?",
    { label: "Testicular artery, pampiniform plexus, vas deferens", desc: "Critical cord structures" },
    { label: "Only the hernia sac matters", desc: "Misses vital anatomy", comp: "NERVE_DAMAGE" },
    { label: "No need to identify individual structures", desc: "Increases injury risk", comp: "NERVE_DAMAGE" },
    { label: "The cord is just one structure", desc: "Incorrect anatomy understanding", comp: "NERVE_DAMAGE" }
  ),
  createDecision(17, 3, "Direct vs Indirect Hernia", "How do you distinguish direct from indirect hernia intraoperatively?",
    { label: "Relation to inferior epigastric vessels and direct sac location in Hesselbach's triangle", desc: "Anatomical distinction" },
    { label: "Size of the hernia determines type", desc: "Unreliable method", comp: "WRONG_DIAGNOSIS" },
    { label: "Patient age determines type", desc: "Incorrect correlation", comp: "WRONG_DIAGNOSIS" },
    { label: "It does not matter for repair", desc: "Different approaches may be needed", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(18, 3, "Bleeding During Dissection", "You encounter bleeding from the cremasteric vessels. What do you do?",
    { label: "Apply pressure, identify the vessel, and use bipolar cautery or ligate", desc: "Standard hemostasis" },
    { label: "Ignore small bleeding", desc: "Hematoma risk", comp: "HEMORRHAGE" },
    { label: "Cauterize blindly in the field", desc: "Risk of testicular artery injury", comp: "NERVE_DAMAGE" },
    { label: "Abort the procedure", desc: "Overreaction to manageable bleeding", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 4 - Mesh Placement
  createDecision(19, 4, "Mesh Selection", "What type of mesh do you use for Lichtenstein repair?",
    { label: "Polypropylene mesh, approximately 7x12cm", desc: "Standard mesh choice" },
    { label: "Absorbable mesh only", desc: "Higher recurrence rate", comp: "WRONG_DIAGNOSIS" },
    { label: "No mesh for primary repair", desc: "Higher recurrence without mesh", comp: "WRONG_DIAGNOSIS" },
    { label: "Biological mesh for all cases", desc: "Unnecessary expense for clean case", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(20, 4, "Mesh Size and Shape", "How do you tailor the mesh?",
    { label: "Trim to extend 2-3cm beyond the defect edges with a slit for the cord", desc: "Adequate coverage" },
    { label: "Use smallest possible mesh", desc: "Risk of recurrence", comp: "WRONG_DIAGNOSIS" },
    { label: "No trimming needed, use as is", desc: "May not fit anatomy", comp: "WRONG_INCISION_SITE" },
    { label: "Use mesh piece smaller than defect", desc: "Guaranteed recurrence", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(21, 4, "Mesh Fixation - Medial", "How do you secure the mesh medially?",
    { label: "Suture to pubic tubercle and overlying rectus sheath with absorbable suture", desc: "Secure fixation" },
    { label: "No fixation medially needed", desc: "Mesh will migrate", comp: "WRONG_DIAGNOSIS" },
    { label: "Staples only without sutures", desc: "Inadequate on bone", comp: "WRONG_DIAGNOSIS" },
    { label: "Glue only without sutures", desc: "May not hold adequately", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(22, 4, "Mesh Fixation - Inferior", "How do you secure the mesh inferiorly?",
    { label: "Continuous suturing to the inguinal ligament", desc: "Strong inferior fixation" },
    { label: "No inferior fixation needed", desc: "Mesh will lift", comp: "WRONG_DIAGNOSIS" },
    { label: "Suture to the spermatic cord", desc: "Incorrect anatomy", comp: "NERVE_DAMAGE" },
    { label: "Leave inferior edge free", desc: "Recurrence risk", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(23, 4, "Cord Sparing Technique", "How do you create the slit in the mesh for the cord?",
    { label: "Create a lateral slit, wrap the tails around the cord, and suture them together", desc: "Key step for cord passage" },
    { label: "Make a hole in the center of the mesh", desc: "Incorrect technique", comp: "NERVE_DAMAGE" },
    { label: "No slit needed, place mesh flat", desc: "Constricts the cord", comp: "NERVE_DAMAGE" },
    { label: "Divide the cord to place mesh", desc: "Catastrophic error", comp: "NERVE_DAMAGE" }
  ),
  createDecision(24, 4, "Avoiding Recurrence", "What is the most important factor in preventing recurrence?",
    { label: "Adequate mesh overlap beyond the defect with secure fixation", desc: "Key principle" },
    { label: "Using the smallest mesh possible", desc: "Increases recurrence", comp: "WRONG_DIAGNOSIS" },
    { label: "Tight suturing of the tissues", desc: "Causes tension and failure", comp: "WRONG_DIAGNOSIS" },
    { label: "No activity restrictions", desc: "Early stress on repair", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(25, 4, "External Oblique Closure", "How do you close the external oblique aponeurosis?",
    { label: "Running absorbable suture, ensuring the cord exits naturally", desc: "Standard closure" },
    { label: "Non-absorbable heavy suture", desc: "Unnecessary and painful", comp: "WRONG_DIAGNOSIS" },
    { label: "Leave external oblique open", desc: "Bulge and recurrence risk", comp: "WRONG_INCISION_SITE" },
    { label: "Close with staples", desc: "Not appropriate for fascia", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 5 - Closure
  createDecision(26, 5, "Hemostasis Check", "Before closing the skin, what do you verify?",
    { label: "No active bleeding, cord structures intact, no hematoma formation", desc: "Complete inspection" },
    { label: "Only check skin edges", desc: "Misses deep bleeding", comp: "HEMORRHAGE" },
    { label: "No verification needed", desc: "Risk of hematoma", comp: "HEMORRHAGE" },
    { label: "Only check wound size", desc: "Misses critical findings", comp: "HEMORRHAGE" }
  ),
  createDecision(27, 5, "Scarpa's Fascia Closure", "Do you close Scarpa's fascia?",
    { label: "Yes, with interrupted absorbable sutures to reduce dead space", desc: "Standard practice" },
    { label: "No, leave all layers open", desc: "Increased seroma risk", comp: "WRONG_INCISION_SITE" },
    { label: "Only if there is bleeding", desc: "Always close to reduce space", comp: "WRONG_DIAGNOSIS" },
    { label: "Use permanent suture", desc: "Unnecessary for superficial layer", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(28, 5, "Skin Closure", "How do you close the skin?",
    { label: "Subcuticular 4-0 Monocryl with dermabond or steri-strips", desc: "Cosmetic closure" },
    { label: "Staples only", desc: "Poor cosmesis for groin", comp: "WRONG_INCISION_SITE" },
    { label: "Leave wound open", desc: "Never appropriate", comp: "WRONG_INCISION_SITE" },
    { label: "Heavy nylon sutures", desc: "Poor cosmetic outcome", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(29, 5, "Local Anesthetic Injection", "Do you inject local anesthetic at the end?",
    { label: "Yes, infiltrate wound edges with bupivacaine for postoperative analgesia", desc: "Enhanced recovery" },
    { label: "No, general anesthesia is enough", desc: "Misses analgesia benefit", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Only if patient requests it", desc: "Should be standard practice", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Inject into the cord structures", desc: "Risk of nerve damage", comp: "NERVE_DAMAGE" }
  ),

  // PHASE 6 - Post-Op
  createDecision(30, 6, "Post-Op Pain Management", "What is your postoperative analgesia regimen?",
    { label: "Scheduled acetaminophen and NSAIDs with opioid rescue PRN", desc: "Multimodal analgesia" },
    { label: "Opioids only", desc: "Unnecessary opioid exposure", comp: "ANESTHESIA_OVERDOSE" },
    { label: "No pain medication", desc: "Inadequate analgesia", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "IV PCA morphine", desc: "Excessive for ambulatory surgery", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(31, 6, "Activity Restrictions", "What activity restrictions do you give?",
    { label: "Avoid heavy lifting (>20 lbs) for 2-4 weeks, normal activities as tolerated", desc: "Standard restrictions" },
    { label: "Bed rest for 2 weeks", desc: "Unnecessary, increases DVT risk", comp: "WRONG_DIAGNOSIS" },
    { label: "No restrictions, return to full activity immediately", desc: "Risk of recurrence", comp: "WRONG_DIAGNOSIS" },
    { label: "No walking for 1 week", desc: "Outdated and harmful", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(32, 6, "Wound Care", "What wound care instructions do you give?",
    { label: "Keep incision dry for 24-48 hours, then shower and pat dry, no soaking", desc: "Standard instructions" },
    { label: "No wound care needed", desc: "Misses infection prevention", comp: "WRONG_DIAGNOSIS" },
    { label: "Soak in bathtub daily", desc: "Increases infection risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Remove dressing only at clinic", desc: "Unnecessary clinic visit", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(33, 6, "Return Precautions", "What return precautions do you give?",
    { label: "Return for fever >101, increasing pain, wound drainage, or scrotal swelling", desc: "Complete precautions" },
    { label: "Return only for severe bleeding", desc: "Misses infection signs", comp: "WRONG_DIAGNOSIS" },
    { label: "No return needed unless wound opens", desc: "Misses complications", comp: "WRONG_DIAGNOSIS" },
    { label: "Call only if unable to walk", desc: "Too restrictive", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(34, 6, "Scrotal Swelling", "Patient calls on post-op day 3 with scrotal swelling. What do you do?",
    { label: "Evaluate for hematoma or seroma; small collections often resolve spontaneously", desc: "Appropriate assessment" },
    { label: "Immediate return to OR", desc: "Overreaction for common finding", comp: "WRONG_INCISION_SITE" },
    { label: "Ignore, will resolve", desc: "May miss expanding hematoma", comp: "HEMORRHAGE" },
    { label: "Prescribe antibiotics", desc: "Not infection related typically", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(35, 6, "Follow-Up Timing", "When do you schedule follow-up?",
    { label: "2 weeks postoperatively to check wound and assess recovery", desc: "Standard timing" },
    { label: "No follow-up needed", desc: "Misses complications", comp: "WRONG_DIAGNOSIS" },
    { label: "6 months postoperatively", desc: "Too late to catch early issues", comp: "WRONG_DIAGNOSIS" },
    { label: "Phone call only", desc: "Cannot assess wound properly", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(36, 6, "Recurrence Discussion", "Patient asks about long-term outcomes at follow-up. What do you discuss?",
    { label: "Recurrence rate of 1-5%, chronic pain risk <5%, return to normal activity within 2-4 weeks", desc: "Complete counseling" },
    { label: "Guaranteed no recurrence", desc: "Dishonest guarantee", comp: "WRONG_DIAGNOSIS" },
    { label: "50% chance of problems", desc: "Overstates risks", comp: "WRONG_DIAGNOSIS" },
    { label: "No discussion of outcomes", desc: "Inadequate counseling", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(37, 6, "Work Return", "When can the patient return to work?",
    { label: "Desk work within a few days, physical labor 2-4 weeks based on job demands", desc: "Individualized approach" },
    { label: "6 weeks off regardless of job type", desc: "Unnecessary for desk workers", comp: "WRONG_DIAGNOSIS" },
    { label: "Return next day for all jobs", desc: "May be premature for physical labor", comp: "WRONG_DIAGNOSIS" },
    { label: "Never return to physical work", desc: "Excessive restriction", comp: "WRONG_DIAGNOSIS" }
  ),
];

export const PATIENT = {
  name: "Michael R.",
  age: 45,
  gender: "Male",
  weight: "82 kg",
  bloodType: "O+",
  admission: "Right groin bulge for 6 months, increasing with straining, fully reducible",
  mood: "Anxious",
  comorbidities: [],
  procedureCategory: "elective"
};

export const PHASES = [
  { id: 1, name: "Patient Intake", short: "Intake" },
  { id: 2, name: "Pre-Op Planning", short: "Pre-Op" },
  { id: 3, name: "Incision & Dissection", short: "Dissection" },
  { id: 4, name: "Mesh Placement", short: "Mesh" },
  { id: 5, name: "Closure", short: "Closing" },
  { id: 6, name: "Post-Op", short: "Post-Op" },
];

export const inguinalHerniaData = { PATIENT, PHASES, DECISIONS };
