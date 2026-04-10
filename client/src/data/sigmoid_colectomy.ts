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
        { id: "1", label: "Apply direct pressure and call for blood products", desc: "Standard bleeding control", correct: true },
        { id: "2", label: "Identify vessel and apply surgical clips", desc: "Direct control", correct: true },
        { id: "3", label: "Pack and hope it stops", desc: "Insufficient for arterial bleed", correct: false }
      ];
    case "ANESTHESIA_OVERDOSE":
      return [
        { id: "1", label: "Reduce anesthetic agents and hyperventilate with 100% O2", desc: "Clear the system", correct: true },
        { id: "2", label: "Administer reversal agents", desc: "Specific antidotes", correct: true },
        { id: "3", label: "Continue current anesthetic depth", desc: "Worsens depression", correct: false }
      ];
    case "ANESTHESIA_UNDERDOSE":
      return [
        { id: "1", label: "Increase anesthetic concentration", desc: "Achieve adequate depth", correct: true },
        { id: "2", label: "Administer additional propofol bolus", desc: "Rapid deepening", correct: true },
        { id: "3", label: "Ignore and continue surgery", desc: "Patient may wake up", correct: false }
      ];
    case "BOWEL_PERFORATION":
      return [
        { id: "1", label: "Primary repair with sutures", desc: "Standard closure", correct: true },
        { id: "2", label: "Copious irrigation and antibiotics", desc: "Control contamination", correct: true },
        { id: "3", label: "Apply drain only without repair", desc: "Inadequate source control", correct: false }
      ];
    case "PNEUMOTHORAX":
      return [
        { id: "1", label: "Needle decompression at 2nd intercostal space", desc: "Immediate relief", correct: true },
        { id: "2", label: "Chest tube placement", desc: "Definitive treatment", correct: true },
        { id: "3", label: "High flow oxygen only", desc: "Not definitive", correct: false }
      ];
    case "CARDIAC_INJURY":
      return [
        { id: "1", label: "Initiate ACLS protocol", desc: "Standard resuscitation", correct: true },
        { id: "2", label: "Epinephrine 1mg IV push", desc: "Restart cardiac output", correct: true },
        { id: "3", label: "Wait for spontaneous recovery", desc: "Brain death imminent", correct: false }
      ];
    case "NERVE_DAMAGE":
      return [
        { id: "1", label: "Halt dissection and identify the nerve", desc: "Prevent further injury", correct: true },
        { id: "2", label: "Use nerve monitoring to assess function", desc: "Diagnostic assessment", correct: true },
        { id: "3", label: "Continue surgery and hope for recovery", desc: "Permanent deficit risk", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Stop and reassess anatomy with imaging", desc: "Re-orient safely", correct: true },
        { id: "2", label: "Call for attending supervision", desc: "Safe approach", correct: true },
        { id: "3", label: "Continue deeper to find familiar structures", desc: "Compounds error", correct: false }
      ];
    case "MALIGNANT_HYPERTHERMIA":
      return [
        { id: "1", label: "Administer dantrolene immediately", desc: "Specific antidote", correct: true },
        { id: "2", label: "Stop triggering agents and hyperventilate", desc: "Remove cause", correct: true },
        { id: "3", label: "Give acetaminophen and ice packs", desc: "Insufficient alone", correct: false }
      ];
    case "WRONG_DIAGNOSIS":
      return [
        { id: "1", label: "Halt procedure and reassess with imaging/labs", desc: "Re-evaluate", correct: true },
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
  createDecision(1, 1, "Initial Presentation", "Patient presents with sudden-onset severe left lower quadrant pain, fever, and nausea for 12 hours. What is your first step?",
    { label: "Order CBC, CMP, and CT abdomen/pelvis", desc: "Complete workup for acute abdomen" },
    { label: "Send patient home with antacids", desc: "Misses surgical emergency", comp: "WRONG_DIAGNOSIS" },
    { label: "Proceed directly to OR without imaging", desc: "Skipping vital assessment", comp: "WRONG_INCISION_SITE" },
    { label: "Order only abdominal X-ray", desc: "Insufficient for diverticulitis", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "CT Interpretation", "CT shows sigmoid diverticulitis with a 4cm pericolonic abscess. No free air. What is the diagnosis?",
    { label: "Acute complicated diverticulitis with abscess", desc: "Accurate diagnosis" },
    { label: "Simple appendicitis", desc: "Wrong anatomical location", comp: "WRONG_DIAGNOSIS" },
    { label: "Bowel obstruction", desc: "No obstruction signs on CT", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal finding, no surgery needed", desc: "Misses the abscess", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Treatment Decision", "Hinchey II diverticulitis with abscess. What is the initial management?",
    { label: "CT-guided percutaneous drainage plus antibiotics", desc: "Standard for abscess >3cm" },
    { label: "Immediate surgery without drainage attempt", desc: "Unnecessary for stable abscess", comp: "WRONG_INCISION_SITE" },
    { label: "Oral antibiotics only", desc: "Insufficient for abscess", comp: "WRONG_DIAGNOSIS" },
    { label: "Observation without intervention", desc: "Abscess will not resolve", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(4, 1, "Drainage Failure", "After 48 hours of drainage, patient develops increasing pain and fever. Repeat CT shows abscess persistence. What now?",
    { label: "Proceed to sigmoid resection", desc: "Surgical intervention indicated" },
    { label: "Continue conservative management", desc: "Worsening infection", comp: "WRONG_DIAGNOSIS" },
    { label: "Place a second drain", desc: "Delaying definitive treatment", comp: "WRONG_DIAGNOSIS" },
    { label: "Discharge patient on oral antibiotics", desc: "Dangerous delay", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(5, 1, "Pre-Op Antibiotics", "Patient needs surgery. What prophylactic antibiotics do you order?",
    { label: "Ceftriaxone plus metronidazole", desc: "Covers colonic flora" },
    { label: "Cephalexin alone", desc: "Insufficient anaerobic coverage", comp: "BOWEL_PERFORATION" },
    { label: "No antibiotics needed", desc: "Standard of care breach", comp: "BOWEL_PERFORATION" },
    { label: "Vancomycin only", desc: "Wrong coverage for GI", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(6, 1, "Informed Consent", "During consent discussion, patient asks about risks. What are key risks to discuss?",
    { label: "Anastomotic leak, bleeding, infection, possible colostomy", desc: "Complete disclosure" },
    { label: "Tell patient there are no significant risks", desc: "Unethical", comp: "WRONG_DIAGNOSIS" },
    { label: "Only mention infection risk", desc: "Incomplete consent", comp: "WRONG_DIAGNOSIS" },
    { label: "Skip consent due to urgency", desc: "Consent always required", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2 - Pre-Op Planning
  createDecision(7, 2, "Anesthesia Type", "What anesthesia is appropriate for sigmoid colectomy?",
    { label: "General endotracheal anesthesia", desc: "Standard for abdominal surgery" },
    { label: "Spinal anesthesia alone", desc: "Cannot tolerate pneumoperitoneum", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Local anesthesia with sedation", desc: "Inadequate for major surgery", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Epidural alone without general", desc: "Insufficient for peritoneal stimulation", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(8, 2, "Positioning", "How do you position the patient for laparoscopic sigmoid colectomy?",
    { label: "Supine with legs in stirrups, steep Trendelenburg with right tilt", desc: "Optimal exposure" },
    { label: "Prone position", desc: "Wrong position entirely", comp: "WRONG_INCISION_SITE" },
    { label: "Supine flat without tilt", desc: "Poor visualization of pelvis", comp: "WRONG_INCISION_SITE" },
    { label: "Lateral decubitus", desc: "Incorrect for midline approach", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(9, 2, "Port Placement", "Where do you place ports for laparoscopic sigmoid colectomy?",
    { label: "Umbilical camera port, left upper quadrant, right lower quadrant, suprapubic", desc: "Standard triangulation" },
    { label: "Single port at umbilicus only", desc: "Cannot perform complex surgery", comp: "WRONG_INCISION_SITE" },
    { label: "All ports on right side", desc: "Wrong triangulation", comp: "WRONG_INCISION_SITE" },
    { label: "Ports in upper abdomen only", desc: "Cannot reach pelvis", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(10, 2, "Surgical Timeout", "Before incision, what must be verified during timeout?",
    { label: "Patient identity, procedure, site, allergies, antibiotics given", desc: "Universal protocol" },
    { label: "Only confirm patient name", desc: "Incomplete checklist", comp: "WRONG_INCISION_SITE" },
    { label: "Skip timeout to save time", desc: "Never acceptable", comp: "WRONG_INCISION_SITE" },
    { label: "Have nurse do timeout alone", desc: "Surgeon must participate", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 3 - Incision & Access
  createDecision(11, 3, "Initial Inspection", "Upon entering the abdomen, you see inflamed sigmoid colon with abscess cavity. What is your first step?",
    { label: "Mobilize the left colon and identify ureter", desc: "Safe anatomical approach" },
    { label: "Immediately resect the sigmoid", desc: "Skipping ureter identification", comp: "NERVE_DAMAGE" },
    { label: "Drain the abscess without mobilization", desc: "Incomplete approach", comp: "BOWEL_PERFORATION" },
    { label: "Convert to open immediately", desc: "Unnecessary conversion", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(12, 3, "Ureter Identification", "During mobilization, you cannot clearly identify the left ureter. What do you do?",
    { label: "Stop dissection, open the retroperitoneum, trace ureter from pelvic brim", desc: "Safe identification" },
    { label: "Continue dissection without seeing ureter", desc: "High risk of injury", comp: "NERVE_DAMAGE" },
    { label: "Assume ureter is out of the way", desc: "Dangerous assumption", comp: "NERVE_DAMAGE" },
    { label: "Clip all structures in the field", desc: "Will ligate ureter", comp: "NERVE_DAMAGE" }
  ),
  createDecision(13, 3, "Vessel Ligation", "You have identified the inferior mesenteric artery. How do you divide it?",
    { label: "High ligation with energy device or stapler, preserving left colic branch", desc: "Standard oncologic approach" },
    { label: "Low ligation without identifying origin", desc: "Inadequate vascular control", comp: "HEMORRHAGE" },
    { label: "Cautery only without securing", desc: "Vessel retracts and bleeds", comp: "HEMORRHAGE" },
    { label: "Leave vessel intact", desc: "Cannot mobilize colon", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(14, 3, "Splenic Flexure Takedown", "You need to mobilize the splenic flexure. How do you proceed?",
    { label: "Enter lesser sac, mobilize along Gerota's fascia away from spleen", desc: "Safe technique" },
    { label: "Pull colon down forcefully", desc: "Tears splenic capsule", comp: "HEMORRHAGE" },
    { label: "Leave splenic flexure attached", desc: "Cannot bring colon to pelvis", comp: "WRONG_INCISION_SITE" },
    { label: "Divide omentum blindly", desc: "Risks middle colic vessels", comp: "HEMORRHAGE" }
  ),
  createDecision(15, 3, "Bowel Division", "Time to divide the proximal sigmoid. What do you use?",
    { label: "Linear stapler with vascular load", desc: "Standard division" },
    { label: "Bipolar cautery without stapling", desc: "Incomplete closure", comp: "BOWEL_PERFORATION" },
    { label: "Scissors without securing edges", desc: "Open bowel contamination", comp: "BOWEL_PERFORATION" },
    { label: "Suture ligation only", desc: "High leak risk", comp: "BOWEL_PERFORATION" }
  ),

  // PHASE 4 - Core Procedure
  createDecision(16, 4, "Anastomosis Technique", "You are performing the colorectal anastomosis. What technique do you use?",
    { label: "Double-stapled end-to-end anastomosis with circular stapler", desc: "Standard technique" },
    { label: "Hand-sewn anastomosis without stapler", desc: "Higher leak rate", comp: "BOWEL_PERFORATION" },
    { label: "Side-to-side stapled anastomosis", desc: "Wrong orientation for sigmoid", comp: "WRONG_INCISION_SITE" },
    { label: "No anastomosis, end colostomy", desc: "Unnecessary diversion", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(17, 4, "Doughnut Inspection", "After firing the circular stapler, you inspect the donuts. What are you looking for?",
    { label: "Complete rings of tissue indicating full thickness closure", desc: "Critical quality check" },
    { label: "Only check if stapler fired", desc: "Misses incomplete donuts", comp: "BOWEL_PERFORATION" },
    { label: "Discard donuts without inspection", desc: "Misses technical failure", comp: "BOWEL_PERFORATION" },
    { label: "Only count the staples", desc: "Visual inspection required", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(18, 4, "Leak Test", "Should you perform an intraoperative leak test?",
    { label: "Yes, insufflate rectum with air while submerged in saline", desc: "Standard safety check" },
    { label: "No, test is unnecessary if stapling was good", desc: "Misses occult leak", comp: "BOWEL_PERFORATION" },
    { label: "Only test if patient is high risk", desc: "All patients should be tested", comp: "BOWEL_PERFORATION" },
    { label: "Defer to postoperative imaging", desc: "Too late if leak present", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(19, 4, "Leak Detected", "Air leak test shows bubbles at the anastomosis. What do you do?",
    { label: "Reinforce with sutures, retest, consider diverting ileostomy if large", desc: "Appropriate response" },
    { label: "Ignore small leaks, they seal", desc: "Guaranteed postoperative leak", comp: "BOWEL_PERFORATION" },
    { label: "Take down anastomosis and do colostomy", desc: "Overreaction for small leak", comp: "WRONG_INCISION_SITE" },
    { label: "Apply glue to the outside", desc: "Inadequate repair", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(20, 4, "Drain Placement", "Do you place a drain near the anastomosis?",
    { label: "Yes, closed suction drain in the pelvis near anastomosis", desc: "Standard practice" },
    { label: "No drain, anastomosis is perfect", desc: "Cannot monitor for leak", comp: "WRONG_DIAGNOSIS" },
    { label: "Place drain in upper abdomen", desc: "Wrong location", comp: "WRONG_INCISION_SITE" },
    { label: "Pack abdomen with gauze", desc: "Outdated and dangerous", comp: "BOWEL_PERFORATION" }
  ),

  // PHASE 5 - Closing
  createDecision(21, 5, "Specimen Extraction", "How do you remove the specimen?",
    { label: "Through protected extraction site or Pfannenstiel incision in a bag", desc: "Prevents wound contamination" },
    { label: "Pull directly through port site", desc: "Wound contamination and tumor seeding", comp: "WRONG_INCISION_SITE" },
    { label: "Leave specimen in abdomen", desc: "Foreign body, abscess risk", comp: "BOWEL_PERFORATION" },
    { label: "Morcellate and extract piecemeal", desc: "Loses pathological assessment", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(22, 5, "Fascial Closure", "How do you close the extraction site fascia?",
    { label: "Running 0-PDS with 4:1 suture to wound length ratio", desc: "Strong closure" },
    { label: "Simple interrupted 3-0 Vicryl", desc: "Too weak, risk of hernia", comp: "WRONG_INCISION_SITE" },
    { label: "Staples only", desc: "Cannot close fascia with staples", comp: "WRONG_INCISION_SITE" },
    { label: "Leave fascia open to granulate", desc: "Guaranteed hernia", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(23, 5, "Port Site Closure", "Do you close the 5mm port site fascia?",
    { label: "No, 5mm ports do not require fascial closure", desc: "Standard practice" },
    { label: "Close all ports regardless of size", desc: "Unnecessary additional sutures", comp: "WRONG_DIAGNOSIS" },
    { label: "Leave all ports open", desc: "Risk of port site hernia", comp: "WRONG_INCISION_SITE" },
    { label: "Close skin only on all ports", desc: "Fascia needs closure for 10mm+", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(24, 5, "Post-Op Orders", "What are your postoperative antibiotic orders?",
    { label: "Continue IV antibiotics for 24-48 hours, then stop", desc: "Standard prophylaxis" },
    { label: "No postoperative antibiotics", desc: "Inadequate for contaminated case", comp: "BOWEL_PERFORATION" },
    { label: "IV antibiotics for 2 weeks", desc: "Unnecessarily prolonged", comp: "WRONG_DIAGNOSIS" },
    { label: "Oral antibiotics only", desc: "Insufficient absorption postop", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(25, 5, "Diet Advancement", "When do you advance the patient's diet?",
    { label: "Clear liquids postop day 1, advance as tolerated with return of bowel function", desc: "Standard ERAS protocol" },
    { label: "NPO until flatus, typically day 3-5", desc: "Outdated, delays recovery", comp: "WRONG_DIAGNOSIS" },
    { label: "Full regular diet immediately", desc: "Risk of vomiting and aspiration", comp: "ANESTHESIA_OVERDOSE" },
    { label: "NPO for 7 days", desc: "Unnecessary starvation", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 6 - Post-Op
  createDecision(26, 6, "Post-Op Fever", "On postop day 2, patient develops fever to 101.5F. What is your first step?",
    { label: "Encourage ambulation, incentive spirometry, examine wounds and drain output", desc: "Systematic approach" },
    { label: "Immediately start broad-spectrum antibiotics", desc: "Premature without evaluation", comp: "WRONG_DIAGNOSIS" },
    { label: "Order CT scan immediately", desc: "Too early for abscess, high radiation", comp: "WRONG_DIAGNOSIS" },
    { label: "Ignore, fever is expected", desc: "Misses evolving infection", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(27, 6, "Drain Output", "The pelvic drain is putting out feculent fluid. What does this indicate?",
    { label: "Anastomotic leak requiring CT confirmation and possible intervention", desc: "Critical finding" },
    { label: "Normal postoperative drainage", desc: "Feculent fluid is never normal", comp: "BOWEL_PERFORATION" },
    { label: "Drain erosion, will resolve", desc: "Misses surgical emergency", comp: "BOWEL_PERFORATION" },
    { label: "Remove the drain", desc: "Will allow intraabdominal sepsis", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(28, 6, "Anastomotic Leak Management", "CT confirms contained anastomotic leak. Patient is stable. What is the treatment?",
    { label: "CT-guided drainage, IV antibiotics, NPO, close monitoring", desc: "Conservative management for stable patient" },
    { label: "Immediate return to OR for diversion", desc: "Unnecessary for contained leak", comp: "WRONG_INCISION_SITE" },
    { label: "Oral antibiotics and discharge", desc: "Inadequate treatment", comp: "BOWEL_PERFORATION" },
    { label: "Ignore and continue diet", desc: "Will progress to sepsis", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(29, 6, "DVT Prophylaxis", "What DVT prophylaxis do you order?",
    { label: "Heparin 5000 units TID plus sequential compression devices", desc: "Standard prophylaxis" },
    { label: "Sequential compression devices only", desc: "Insufficient for abdominal surgery", comp: "WRONG_DIAGNOSIS" },
    { label: "No prophylaxis needed", desc: "High DVT risk in surgery", comp: "WRONG_DIAGNOSIS" },
    { label: "Full anticoagulation with heparin drip", desc: "Excessive bleeding risk", comp: "HEMORRHAGE" }
  ),
  createDecision(30, 6, "Discharge Criteria", "When can patient be discharged?",
    { label: "Tolerating diet, pain controlled with oral meds, ambulating, afebrile, stable drain output", desc: "Complete criteria" },
    { label: "Discharge on postop day 3 regardless", desc: "May not meet criteria", comp: "WRONG_DIAGNOSIS" },
    { label: "Keep until drain removed day 7+", desc: "Unnecessary prolongation", comp: "WRONG_DIAGNOSIS" },
    { label: "Discharge when bowel movement occurs", desc: "Outdated criterion", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(31, 6, "Follow-Up", "What is appropriate follow-up?",
    { label: "Office visit in 2 weeks, pathology review, discuss surveillance if malignancy found", desc: "Standard follow-up" },
    { label: "No follow-up needed", desc: "Misses complications and pathology", comp: "WRONG_DIAGNOSIS" },
    { label: "Follow-up in 6 months", desc: "Too late for wound issues", comp: "WRONG_DIAGNOSIS" },
    { label: "Phone call only, no visit", desc: "Cannot assess healing", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(32, 6, "Pathology Report", "Pathology shows diverticulitis with no malignancy. What is the follow-up recommendation?",
    { label: "Routine postoperative care, colonoscopy in 6 months to rule out missed lesion", desc: "Standard recommendation" },
    { label: "Immediate colonoscopy postop", desc: "Anastomosis not healed", comp: "BOWEL_PERFORATION" },
    { label: "No colonoscopy needed ever", desc: "Misses colorectal cancer screening", comp: "WRONG_DIAGNOSIS" },
    { label: "Repeat CT scan in 1 month", desc: "Unnecessary imaging", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(33, 6, "Wound Infection", "The extraction site wound is erythematous and draining purulent fluid on postop day 5. What do you do?",
    { label: "Open wound, culture, irrigate, pack, start antibiotics", desc: "Standard SSI management" },
    { label: "Oral antibiotics only without opening", desc: "Inadequate source control", comp: "WRONG_DIAGNOSIS" },
    { label: "Apply topical antibiotic ointment", desc: "Cannot treat deep infection", comp: "WRONG_DIAGNOSIS" },
    { label: "Return to OR for washout", desc: "Overreaction for superficial SSI", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(34, 6, "Return Precautions", "What instructions do you give for return precautions?",
    { label: "Fever >101, increasing pain, wound drainage, inability to tolerate fluids, abdominal distension", desc: "Complete instructions" },
    { label: "Return only for severe bleeding", desc: "Misses infection and leak", comp: "WRONG_DIAGNOSIS" },
    { label: "No return precautions needed", desc: "Dangerous omission", comp: "WRONG_DIAGNOSIS" },
    { label: "Return only if wound opens completely", desc: "Misses early signs", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(35, 6, "Ileus", "Patient has not passed flatus by postop day 4. What is your approach?",
    { label: "Continue supportive care, encourage ambulation, limit opioids, consider NGT if vomiting", desc: "Conservative management" },
    { label: "Immediate return to OR", desc: "Unnecessary without obstruction", comp: "WRONG_INCISION_SITE" },
    { label: "Force oral intake", desc: "Will cause vomiting", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Start prokinetics immediately", desc: "Not first-line treatment", comp: "WRONG_DIAGNOSIS" }
  ),
];

export const PATIENT = {
  name: "Robert J.",
  age: 58,
  gender: "Male",
  weight: "88 kg",
  bloodType: "A+",
  admission: "Left lower quadrant pain, fever 102F, CT showing sigmoid diverticulitis with abscess",
  mood: "Concerned",
  comorbidities: ["hypertension", "diabetes"],
  procedureCategory: "elective"
};

export const PHASES = [
  { id: 1, name: "Patient Intake", icon: "Stethoscope", short: "Intake" },
  { id: 2, name: "Pre-Op Planning", icon: "Clipboard", short: "Pre-Op" },
  { id: 3, name: "Incision & Access", icon: "Scalpel", short: "Incision" },
  { id: 4, name: "Core Procedure", icon: "Surgery", short: "Procedure" },
  { id: 5, name: "Closing", icon: "Suture", short: "Closing" },
  { id: 6, name: "Post-Op", icon: "Monitor", short: "Post-Op" },
];

export const sigmoidColectomyData = { PATIENT, PHASES, DECISIONS };
