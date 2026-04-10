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
        { id: "3", label: "Pack the abdomen and reassess", desc: "Damage control", correct: true }
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
    case "BOWEL_PERFORATION":
      return [
        { id: "1", label: "Over-sew the perforation", desc: "Primary repair", correct: true },
        { id: "2", label: "Copious irrigation and broad antibiotics", desc: "Control contamination", correct: true },
        { id: "3", label: "Close with a drain only", desc: "Sepsis risk remains", correct: false }
      ];
    case "PNEUMOTHORAX":
      return [
        { id: "1", label: "Needle decompression", desc: "Evacuate air immediately", correct: true },
        { id: "2", label: "High flow oxygen only", desc: "Not definitive treatment", correct: false },
        { id: "3", label: "Chest tube placement", desc: "Definitive airway control", correct: true }
      ];
    case "CARDIAC_INJURY":
      return [
        { id: "1", label: "ACLS Protocol - CPR & Defibrillate", desc: "Restore rhythm", correct: true },
        { id: "2", label: "Epinephrine 1mg push", desc: "Restart cardiac output", correct: true },
        { id: "3", label: "Wait to see if it recovers naturally", desc: "Brain death impending", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Abort primary incision, assess anatomy", desc: "Re-orient", correct: true },
        { id: "2", label: "Continue deeper", desc: "Will hit wrong organs", correct: false },
        { id: "3", label: "Call for help/supervising attending", desc: "Safe bet", correct: true }
      ];
    case "MALIGNANT_HYPERTHERMIA":
      return [
        { id: "1", label: "Administer Dantrolene rapidly", desc: "Only specific antidote", correct: true },
        { id: "2", label: "Stop volatile anesthetics & hyperventilate with 100% O2", desc: "Remove trigger", correct: true },
        { id: "3", label: "Give Tylenol and cool with ice", desc: "Insufficient alone", correct: false }
      ];
    case "WRONG_DIAGNOSIS":
      return [
        { id: "1", label: "Halt procedure and consult imagery/labs", desc: "Re-evaluate", correct: true },
        { id: "2", label: "Proceed blindly", desc: "Exacerbates error", correct: false }
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
  // PHASE 1
  createDecision(1, 1, "Initial Diagnosis", "Patient presents with right lower quadrant pain, fever of 101.2, and nausea for 18 hours. What is your first step?", 
    { label: "Order CBC and CMP blood work", desc: "Assess infection and electrolytes" },
    { label: "Send patient home with antacids", desc: "Misses acute event", comp: "WRONG_DIAGNOSIS" },
    { label: "Immediately take to OR without workup", desc: "Skipping vital checks", comp: "WRONG_INCISION_SITE" },
    { label: "Order only a urine pregnancy test", desc: "Inadequate male workup", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "Lab Analysis", "CBC results show WBC of 14,500 with left shift. What does this indicate?",
    { label: "Bacterial infection consistent with appendicitis", desc: "Classic presentation" },
    { label: "Normal finding no concern", desc: "Dismisses leukocytosis", comp: "WRONG_DIAGNOSIS" },
    { label: "Viral infection surgery not needed", desc: "Left shifts are bacterial", comp: "WRONG_DIAGNOSIS" },
    { label: "Leukemia requires oncology consult", desc: "Incorrect assumption", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Imaging", "What imaging do you order to confirm diagnosis?",
    { label: "CT scan of abdomen and pelvis with contrast", desc: "Gold standard imaging" },
    { label: "Chest X-ray only", desc: "Irrelevant for RLQ pain", comp: "WRONG_DIAGNOSIS" },
    { label: "No imaging proceed straight to surgery", desc: "Reckless without confirmation", comp: "WRONG_INCISION_SITE" },
    { label: "MRI brain", desc: "Completely irrelevant", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(4, 1, "CT Interpretation", "CT scan shows a dilated appendix at 9mm with periappendiceal fat stranding and no perforation. What is your diagnosis?",
    { label: "Acute appendicitis without perforation", desc: "Accurate read" },
    { label: "Normal appendix patient has Crohn's disease", desc: "Misses surgical emergency", comp: "WRONG_DIAGNOSIS" },
    { label: "Perforated appendicitis", desc: "Misread the intact wall", comp: "WRONG_DIAGNOSIS" },
    { label: "Ovarian cyst", desc: "Anatomically impossible (male)", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(5, 1, "Prophylaxis", "Patient has a documented penicillin allergy. What prophylactic antibiotic do you order pre-op?",
    { label: "Clindamycin plus gentamicin", desc: "Safe alternatives" },
    { label: "Amoxicillin-clavulanate", desc: "Contraindicated (allergy)", comp: "ANESTHESIA_OVERDOSE" }, // Using overdose as a proxy for anaphylaxis response per user instruction wrapper if not exact
    { label: "Cefazolin", desc: "Cross-reactivity risk", comp: "ANESTHESIA_OVERDOSE" },
    { label: "No antibiotics needed", desc: "Standard of care breach", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(6, 1, "Pre-Op Vitals", "Patient's blood pressure is 88/60 on arrival. What do you do before surgery?",
    { label: "Administer IV fluid bolus of normal saline and reassess", desc: "Treat hypotension" },
    { label: "Proceed immediately to OR without stabilization", desc: "Risks intra-op shock", comp: "HEMORRHAGE" },
    { label: "Give oral fluids and wait", desc: "NPO violation", comp: "HEMORRHAGE" },
    { label: "Start vasopressors immediately", desc: "Premature escalation", comp: "CARDIAC_INJURY" }
  ),
  createDecision(7, 1, "Informed Consent", "Informed consent is being obtained. Patient asks about risks. Which risk is most important to discuss for this procedure?",
    { label: "Wound infection, bleeding, injury, open conversion", desc: "Standard appendectomy risks" },
    { label: "Risk of developing cancer post surgery", desc: "Factually incorrect", comp: "WRONG_DIAGNOSIS" },
    { label: "Only mention anesthesia risk", desc: "Incomplete consent", comp: "WRONG_DIAGNOSIS" },
    { label: "Tell patient there are no significant risks", desc: "Unethical reassurance", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2
  createDecision(8, 2, "Anesthesia Selection", "What type of anesthesia is appropriate for laparoscopic appendectomy?",
    { label: "General endotracheal anesthesia", desc: "Required for abdominal insufflation" },
    { label: "Local anesthesia only", desc: "Impossible for laparoscopy", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Spinal anesthesia", desc: "Inadequate for intra-abdominal pressure", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Sedation only without intubation", desc: "Airway unprotected during insufflation", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(9, 2, "Induction Agents", "Patient weighs 95kg. What is the correct intubation dose of succinylcholine?",
    { label: "1.5mg per kg so approximately 140mg IV", desc: "Proper weight-based dosing" },
    { label: "50mg flat dose", desc: "Sub-therapeutic underdose", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "500mg IV", desc: "Massive overdose", comp: "ANESTHESIA_OVERDOSE" },
    { label: "No succinylcholine use rocuronium only", desc: "Slows induction significantly", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(10, 2, "Positioning", "How do you position the patient for laparoscopic appendectomy?",
    { label: "Supine with left lateral tilt and Trendelenburg positioning", desc: "Shifts bowel away from RLQ" },
    { label: "Prone position", desc: "Wrong side up", comp: "WRONG_INCISION_SITE" },
    { label: "Lithotomy position", desc: "Unnecessary for this case", comp: "WRONG_INCISION_SITE" },
    { label: "Sitting position", desc: "Impossible for laparoscopy", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(11, 2, "Safety Timeout", "Before making any incision, what critical safety step must be completed?",
    { label: "Surgical timeout confirming patient identity, procedure, site, allergies, and antibiotic administration", desc: "Universal protocol" },
    { label: "Skip timeout to save time patient is stable", desc: "Never skip timeout", comp: "WRONG_INCISION_SITE" },
    { label: "Only confirm patient name", desc: "Incomplete checklist", comp: "WRONG_INCISION_SITE" },
    { label: "Have nurse confirm while you prep the patient", desc: "Surgeon must participate", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(12, 2, "Insufflation", "You are about to insufflate the abdomen with CO2. What pressure do you set?",
    { label: "12 to 15 mmHg", desc: "Standard pneumoperitoneum" },
    { label: "5 mmHg insufficient visualization", desc: "Too low to see", comp: "WRONG_INCISION_SITE" },
    { label: "25 mmHg dangerously high", desc: "Impairs venous return", comp: "CARDIAC_INJURY" },
    { label: "30 mmHg extreme pressure", desc: "Causes immediate cardiovascular collapse", comp: "CARDIAC_INJURY" }
  ),
  createDecision(13, 2, "Primary Access", "Where do you place your first trocar for laparoscopic appendectomy?",
    { label: "Umbilicus for the camera port using Hasson open technique", desc: "Safest entry method" },
    { label: "Right lower quadrant directly", desc: "Blind entry risks bowel", comp: "HEMORRHAGE" },
    { label: "Left upper quadrant", desc: "Poor triangulation", comp: "WRONG_INCISION_SITE" },
    { label: "Epigastric region", desc: "Angle is too steep", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 3
  createDecision(14, 3, "Vascular Encounter", "Upon entering the peritoneum you see a large vessel directly beneath your trocar entry point. What do you do?",
    { label: "Stop immediately, apply pressure, call for vascular surgery consult", desc: "Safe escalation" },
    { label: "Continue inserting trocar", desc: "Lacerates major vessel", comp: "HEMORRHAGE" },
    { label: "Cauterize blindly", desc: "Ineffective on major vessels", comp: "HEMORRHAGE" },
    { label: "Ignore it and proceed", desc: "Causes exsanguination soon after", comp: "HEMORRHAGE" }
  ),
  createDecision(15, 3, "Retraction", "You are exploring the abdomen. The bowel appears to be in the way of your view. How do you move it?",
    { label: "Use atraumatic graspers and gentle retraction with patient in Trendelenburg", desc: "Safe handling" },
    { label: "Use cautery to push bowel aside", desc: "Thermal injury to bowel", comp: "BOWEL_PERFORATION" },
    { label: "Forcefully retract with standard graspers", desc: "Tears serosa", comp: "BOWEL_PERFORATION" },
    { label: "Make an additional incision", desc: "Unnecessary and risks bleeding", comp: "HEMORRHAGE" }
  ),
  createDecision(16, 3, "Gross Evaluation", "You identify the appendix. It appears more inflamed than the CT suggested. What do you assess before proceeding?",
    { label: "Check for perforation, assess the base of the appendix, and evaluate surrounding tissue involvement", desc: "Complete assessment" },
    { label: "Immediately clamp and cut without assessment", desc: "Misses base involvement", comp: "BOWEL_PERFORATION" },
    { label: "Decide it looks fine and proceed quickly", desc: "Misses gangrenous spots", comp: "WRONG_DIAGNOSIS" },
    { label: "Call it a normal appendix and close", desc: "Misses the obvious pathology", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(17, 3, "Anatomical Landmarks", "You notice a structure that could be either the appendix or the terminal ileum. How do you confirm which is which?",
    { label: "Trace the taenia coli of the cecum to its convergence point which always leads to the appendix base", desc: "Reliable landmark" },
    { label: "Cut the structure closest to you", desc: "Reckless, might cut bowel", comp: "WRONG_INCISION_SITE" },
    { label: "Guess based on size", desc: "Unreliable in inflammation", comp: "WRONG_INCISION_SITE" },
    { label: "Ask the scrub tech", desc: "Surgeon is responsible", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(18, 3, "Artery Dissection", "You are dissecting the mesoappendix. You encounter the appendicular artery. What instrument do you use to divide it?",
    { label: "Ultrasonic shears or clip and divide technique", desc: "Secures hemostasis" },
    { label: "Blind cautery without visualization", desc: "Causes vessel retraction", comp: "HEMORRHAGE" },
    { label: "Sharp scissors without securing hemostasis first", desc: "Immediate bleeding", comp: "HEMORRHAGE" },
    { label: "Leave it and work around it", desc: "Tears eventually", comp: "HEMORRHAGE" }
  ),
  createDecision(19, 3, "Bleeding Crisis", "After dividing the mesoappendix, unexpected bright red arterial bleeding begins. What is your immediate response?",
    { label: "Apply direct pressure immediately, identify the bleeding vessel, clip or ligate it", desc: "Standard damage control" },
    { label: "Increase suction and hope it stops", desc: "Ineffective, masks problem", comp: "HEMORRHAGE" },
    { label: "Continue with the procedure", desc: "Ignores active bleeding", comp: "HEMORRHAGE" },
    { label: "Convert to open immediately without attempting laparoscopic control", desc: "Drastic, loses time", comp: "HEMORRHAGE" }
  ),
  createDecision(20, 3, "Hypotension", "The bleeding is controlled. You reassess the field. The anesthesiologist reports BP has dropped to 82 systolic. What do you do?",
    { label: "Pause the procedure, communicate with anesthesia, allow resuscitation with IV fluids before continuing", desc: "Team coordination" },
    { label: "Ignore the BP and continue operating", desc: "Risks ischemic injury", comp: "HEMORRHAGE" },
    { label: "Ask anesthesia to deal with it and keep going", desc: "Lack of situational awareness", comp: "HEMORRHAGE" },
    { label: "Immediately close without completing the appendectomy", desc: "Leaves source of infection", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 4
  createDecision(21, 4, "Stump Ligation", "You are ready to divide the appendix. What do you place at the base?",
    { label: "Two endoloops or a stapler with an adequate cuff of healthy cecal tissue", desc: "Secure closure" },
    { label: "Single clip only", desc: "Insecure for lumen", comp: "BOWEL_PERFORATION" },
    { label: "Cautery alone at the base", desc: "Tissue necrosis leads to leak", comp: "BOWEL_PERFORATION" },
    { label: "Nothing just cut it", desc: "Open bowel spill", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(22, 4, "Staple Line Check", "You fire the endostapler at the appendix base. The staple line looks pale and thin. What do you do?",
    { label: "Reinforce with an additional endoloop and inspect carefully before proceeding", desc: "Double secure" },
    { label: "Accept it and continue", desc: "Risks post-op leak", comp: "BOWEL_PERFORATION" },
    { label: "Fire a second stapler on top of the first", desc: "Crushes tissue causing necrosis", comp: "BOWEL_PERFORATION" },
    { label: "Cauterize the staple line", desc: "Melts staples or burns tissue", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(23, 4, "Extraction", "The appendix is divided. How do you remove it from the abdomen?",
    { label: "Place it in an endobag before withdrawing through the trocar to prevent wound contamination", desc: "Prevents surgical site infection" },
    { label: "Pull it directly through the trocar site", desc: "Infects the wound tract", comp: "BOWEL_PERFORATION" },
    { label: "Leave it in the abdomen temporarily", desc: "Gets lost or causes abscess", comp: "BOWEL_PERFORATION" },
    { label: "Cut it into pieces to fit through the port", desc: "Spills infected contents", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(24, 4, "Cecum Defect", "Upon inspection of the stump you notice a small 2mm defect in the cecum wall. What do you do?",
    { label: "Repair primarily with intracorporeal sutures and irrigate the field thoroughly", desc: "Fixes the leak directly" },
    { label: "Apply a single clip and hope it seals", desc: "Insecure repair", comp: "BOWEL_PERFORATION" },
    { label: "Leave it since it is small", desc: "Guarantees peritonitis", comp: "BOWEL_PERFORATION" },
    { label: "Pack with gauze and close", desc: "Doesn't seal the bowel", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(25, 4, "Irrigation", "You need to irrigate the peritoneal cavity. What fluid and volume do you use?",
    { label: "Warm normal saline, at least one liter, until return is clear", desc: "Standard washout" },
    { label: "Cold saline 100ml only", desc: "Causes hypothermia, inadequate volume", comp: "BOWEL_PERFORATION" },
    { label: "Betadine solution directly into the cavity", desc: "Toxic to peritoneum", comp: "BOWEL_PERFORATION" },
    { label: "No irrigation needed", desc: "Leaves bacteria load", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(26, 4, "Pelvic Fluid", "After irrigation you notice a small amount of turbid fluid in the pelvis. What does this indicate?",
    { label: "Localized contamination from the inflamed appendix — irrigate further and consider a drain", desc: "Manage local peritonitis" },
    { label: "Normal post operative finding ignore it", desc: "Misses abscess risk", comp: "WRONG_DIAGNOSIS" },
    { label: "The patient has a new perforation", desc: "Overreaction, usually just local fluid", comp: "WRONG_DIAGNOSIS" },
    { label: "Bladder injury requires urology", desc: "Unlikely presentation", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(27, 4, "Drains", "Do you place a drain?",
    { label: "Yes, place a closed suction drain in the pelvis given the turbid fluid", desc: "Prevents abscess" },
    { label: "No drain needed close immediately", desc: "Risks intra-abdominal abscess", comp: "BOWEL_PERFORATION" },
    { label: "Place three drains throughout the abdomen", desc: "Overkill, increases infection risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Pack the pelvis with gauze", desc: "Outdated and dangerous", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(28, 4, "Intra-op Fever", "The anesthesiologist reports the patient has developed a temperature of 102.1 during the case. What is the most dangerous thing you need to rule out immediately?",
    { label: "Malignant hyperthermia — stop all triggering agents, give dantrolene, call for help", desc: "Rapidly lethal if missed" },
    { label: "It is just a fever from the infection continue operating", desc: "Misses lethal MH", comp: "WRONG_DIAGNOSIS" },
    { label: "Give acetaminophen and continue", desc: "Ineffective for MH", comp: "WRONG_DIAGNOSIS" },
    { label: "Ignore it and finish quickly", desc: "Patient dies of hypermetabolic state", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(29, 4, "Hypoxia", "The malignant hyperthermia is ruled out — temperature was from the infection. You continue. SpO2 has dropped to 91 percent. What do you do?",
    { label: "Ask anesthesia to increase FiO2, check for pneumothorax, assess ventilation", desc: "Systematic troubleshooting" },
    { label: "Ignore it and keep operating", desc: "Hypoxia worsens", comp: "PNEUMOTHORAX" },
    { label: "Assume it is the pulse oximeter malfunctioning", desc: "Denial of clinical signs", comp: "PNEUMOTHORAX" },
    { label: "Decrease the anesthetic depth", desc: "Patient wakes up paralyzed", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(30, 4, "Adhesions", "SpO2 recovers to 96. You complete inspection of the abdomen. You notice the right ureter is slightly adherent to the inflammatory mass. What do you do?",
    { label: "Carefully dissect it free with sharp dissection staying on the ureter and place a ureteral stent if concerned", desc: "Protects ureter" },
    { label: "Clip the structure and move on", desc: "Ligations of ureter causes kidney loss", comp: "NERVE_DAMAGE" }, // NERVE_DAMAGE acts as systemic silent damage
    { label: "Cut through the adhesion quickly", desc: "Transects ureter", comp: "NERVE_DAMAGE" },
    { label: "Ignore it and close", desc: "Inflammation causes ureteral stricture", comp: "NERVE_DAMAGE" }
  ),
  createDecision(31, 4, "Sponge Count", "You have completed the procedure. Before closing you perform a final count with the scrub tech. The count is off by one sponge. What do you do?",
    { label: "Do not close. Perform a thorough systematic search of the entire abdominal cavity until the sponge is found", desc: "Prevents retained foreign body" },
    { label: "Close anyway the count is probably wrong", desc: "Retained sponge causes massive sepsis", comp: "WRONG_DIAGNOSIS" },
    { label: "Close and order an X-ray post op", desc: "Necessitates second surgery", comp: "WRONG_DIAGNOSIS" },
    { label: "Ask the circulator to recount and close if they say it is fine", desc: "Abdication of responsibility", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(32, 4, "Trocars", "The sponge is found. You are now ready to desufflate and close. What is the correct order?",
    { label: "Remove all instruments under direct vision, desufflate completely, remove trocars under vision, then close", desc: "Standard safe exit" },
    { label: "Remove trocars first then desufflate", desc: "Risks port-site bleeding unrecognized", comp: "HEMORRHAGE" },
    { label: "Desufflate with instruments still inside", desc: "Can damage organs on collapse", comp: "HEMORRHAGE" },
    { label: "Remove camera last but leave other trocars in", desc: "Leaves holes open", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(33, 4, "Port Hematoma", "Upon removing the last trocar you notice a small hematoma forming at the umbilical port site. What do you do?",
    { label: "Apply direct pressure, inspect the site, place a figure of eight suture if needed", desc: "Direct hemostasis" },
    { label: "Apply a bandage and ignore it", desc: "Hematoma expands", comp: "HEMORRHAGE" },
    { label: "Pack it open", desc: "Terrible cosmetic and healing outcome", comp: "HEMORRHAGE" },
    { label: "Take patient back to OR immediately", desc: "Unnecessary overreaction", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(34, 4, "Fascial Closure", "Hematoma controlled. You are closing the fascial defect at the umbilical port. What suture do you use?",
    { label: "0-Vicryl in a figure of eight pattern to close the fascia", desc: "Strong absorbable suture" },
    { label: "4-0 Monocryl skin suture on the fascia", desc: "Too weak, hernia develops", comp: "WRONG_INCISION_SITE" },
    { label: "Staples on the fascia", desc: "Ineffective on deep fascia layer", comp: "WRONG_INCISION_SITE" },
    { label: "No fascial closure needed for a 12mm port", desc: "Guarantees port-site hernia", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 5
  createDecision(35, 5, "Skin Closure", "How do you close the skin at the port sites?",
    { label: "4-0 Monocryl subcuticular suture with dermabond on top", desc: "Clean cosmetic closure" },
    { label: "Staples at all sites", desc: "Bad cosmetics on small ports", comp: "WRONG_INCISION_SITE" },
    { label: "Leave open to heal by secondary intention", desc: "Unnecessary infection risk", comp: "WRONG_INCISION_SITE" },
    { label: "Steri-strips only without subcuticular suture", desc: "Wound dehiscence", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(36, 5, "Post-Op Meds", "What are your post-operative antibiotic orders?",
    { label: "Continue IV antibiotics for 24 hours then switch to oral if tolerating diet", desc: "Standard step-down therapy" },
    { label: "Stop all antibiotics immediately post op", desc: "Infection rebounds", comp: "BOWEL_PERFORATION" }, // Proxy for severe infection
    { label: "Continue IV antibiotics for 2 weeks", desc: "Overuse generates resistance", comp: "WRONG_DIAGNOSIS" },
    { label: "No antibiotics needed post op", desc: "Inadequate coverage", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(37, 5, "Diet", "What are your diet orders for the first 6 hours post-op?",
    { label: "Clear liquids and advance as tolerated if no nausea", desc: "Standard post-appendectomy diet" },
    { label: "NPO for 48 hours", desc: "Delays recovery", comp: "WRONG_DIAGNOSIS" },
    { label: "Full regular diet immediately", desc: "Causes vomiting and aspiration", comp: "BOWEL_PERFORATION" }, // Proxy for aspiration/severe GI
    { label: "IV nutrition only for 3 days", desc: "Unnecessary TPN", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(38, 5, "Analgesia", "Patient reports pain of 8 out of 10 in recovery. What is your pain management order?",
    { label: "Scheduled acetaminophen and ketorolac with opioid rescue only as needed", desc: "Multi-modal pain control" },
    { label: "Morphine PCA with no limit", desc: "Causes respiratory depression", comp: "ANESTHESIA_OVERDOSE" }, // Equivalent respiratory effect
    { label: "No pain medication bowel function must return first", desc: "Cruel, causes tachycardia", comp: "WRONG_DIAGNOSIS" },
    { label: "Discharge with only ibuprofen", desc: "Inadequate for severe pain", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(39, 5, "Discharge Planning", "When do you plan to discharge the patient?",
    { label: "Same day or 23 hour observation if pain controlled, tolerating liquids, ambulating, and afebrile", desc: "Standard criteria" },
    { label: "Mandatory 5 day admission", desc: "Wastes resources, hospital acquired risks", comp: "WRONG_DIAGNOSIS" },
    { label: "Discharge immediately from OR", desc: "Unsafe no observation", comp: "WRONG_DIAGNOSIS" },
    { label: "Keep until bowel sounds return which takes 3 to 5 days", desc: "Outdated dogma", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 6
  createDecision(40, 6, "Post-Op Complications", "On post-op day 1 the patient develops a fever of 100.8. What is your first step?",
    { label: "Encourage ambulation, incentive spirometry, and reassess in 4 hours — atelectasis is most common cause of early post-op fever", desc: "Correct first-pass management" },
    { label: "Start broad spectrum antibiotics immediately", desc: "Knee-jerk reaction", comp: "WRONG_DIAGNOSIS" },
    { label: "Order a CT scan immediately", desc: "Too early for abscess", comp: "WRONG_DIAGNOSIS" },
    { label: "Discharge despite the fever", desc: "Unsafe discharge", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(41, 6, "Wound Care", "The wound at the umbilical port site appears slightly erythematous on post-op day 2. What do you do?",
    { label: "Open the wound slightly to assess for infection, culture any fluid, start antibiotics if purulent", desc: "Rule out superficial SSI" },
    { label: "Prescribe oral antibiotics without opening", desc: "Misses source control", comp: "WRONG_DIAGNOSIS" },
    { label: "Reassure the patient it is normal", desc: "Ignores progressing infection", comp: "WRONG_DIAGNOSIS" },
    { label: "Take immediately back to OR", desc: "Massive overreaction", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(42, 6, "Discharge Instructions", "Patient is ready for discharge. What critical information must be included in discharge instructions?",
    { label: "Return precautions including fever above 101, increasing pain, redness or drainage at incision, inability to tolerate liquids, follow up in 2 weeks", desc: "Complete instructions" },
    { label: "Tell patient to call only if there is severe bleeding", desc: "Incomplete misses infection", comp: "WRONG_DIAGNOSIS" },
    { label: "No specific instructions needed", desc: "Dangerous negligence", comp: "WRONG_DIAGNOSIS" },
    { label: "Tell patient they are cured and no follow up needed", desc: "Breaches standard of care", comp: "WRONG_DIAGNOSIS" }
  )
];

export const PATIENT = {
  name: "Marcus T.",
  age: 28,
  gender: "Male",
  weight: "95 kg",
  bloodType: "O+",
  admission: "Acute right lower quadrant pain, rebound tenderness, fever 101.2°F",
  mood: "Anxious",
  comorbidities: ["obese"], 
  procedureCategory: "emergency"
};

export const PHASES = [
  { id: 1, name: "Patient Intake", icon: "🩺", short: "Intake" },
  { id: 2, name: "Pre-Op Planning", icon: "📋", short: "Pre-Op" },
  { id: 3, name: "Incision & Access", icon: "🔪", short: "Incision" },
  { id: 4, name: "Core Procedure", icon: "⚕️", short: "Procedure" },
  { id: 5, name: "Closing", icon: "🪡", short: "Closing" },
  { id: 6, name: "Post-Op", icon: "📊", short: "Post-Op" },
];

export const appendectomyData = { PATIENT, PHASES, DECISIONS };

