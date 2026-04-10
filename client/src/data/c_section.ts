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
        { id: "1", label: "Perform bimanual uterine massage and administer Bakri balloon", desc: "Mechanical control of atony", correct: true },
        { id: "2", label: "Increase Pitocin (Oxytocin) infusion and add Carboprost", desc: "Chemical control of atony", correct: true },
        { id: "3", label: "Wait for the uterus to contract naturally", desc: "Will result in hypovolemic shock (Failure)", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Inspect the bladder for injury and repair with 3-0 Vicryl", desc: "Repairs the common bladder injury", correct: true },
        { id: "2", label: "Fill the bladder with methylene blue to check for leaks", desc: "Diagnostic verification", correct: true },
        { id: "3", label: "Close the abdomen without checking", desc: "Fistula risk (Failure)", correct: false }
      ];
    case "ANESTHESIA_OVERDOSE":
      return [
        { id: "1", label: "Inform pediatrics and prepare for neonatal resuscitation/bag-mask ventilation", desc: "Manages depressed neonate", correct: true },
        { id: "2", label: "Give mother caffeine", desc: "Ineffective for neonatal depression", correct: false },
        { id: "3", label: "Perform chest compressions on the mother", desc: "Only if she is in cardiac arrest, not just sedated", correct: false }
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
  // PHASE 1: PRE-OP & INDUCTION
  createDecision(1, 1, "Triage & Indication", "Maria is 39 weeks, 4cm dilated, and has been stuck for 8 hours. Fetal monitoring shows category II tracings (late decelerations). What is the indication?",
    { label: "Failure to progress and non-reassuring fetal heart tones", desc: "Standard clinical reasoning" },
    { label: "Planned elective C-section", desc: "This is an unplanned/urgent procedure based on labor events", comp: "WRONG_DIAGNOSIS" },
    { label: "Maternal request", desc: "Secondary factor compared to the medical urgency", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal labor", desc: "Labor is no longer progressing", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "Anesthesia Choice", "What is the preferred anesthesia for a non-emergent C-section to allow maternal contact?",
    { label: "Spinal or Epidural (Neuraxial) block", desc: "Safe and allows mother to stay awake" },
    { label: "General Anesthesia (Intubation)", desc: "Reserved for true 'crash' emergencies due to airway risks", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Local Lidocaine in the skin only", desc: "Insufficient for major abdominal/uterine surgery", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Oral Tylenol", desc: "Absurd", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(3, 1, "Patient Positioning", "You place a wedge under Maria's right hip. Why?",
    { label: "To relieve Aortocaval compression (Supine Hypotensive Syndrome)", desc: "Improves blood flow to the placenta" },
    { label: "To make her more comfortable", desc: "Secondary to the physiologic goal", comp: "WRONG_DIAGNOSIS" },
    { label: "To prevent her from rolling over", desc: "Incorrect; it's a vascular safety measure", comp: "WRONG_DIAGNOSIS" },
    { label: "To elevate the baby", desc: "No effect on fetal position in the uterus", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(4, 1, "Fetal Monitor Check", "Baseline fetal heart rate is 145 bpm with moderate variability. Is this reassuring?",
    { label: "Yes, Category I tracing", desc: "Normal fetal status" },
    { label: "No, fetal tachycardia", desc: "Tachycardia is >160 bpm", comp: "WRONG_DIAGNOSIS" },
    { label: "No, fetal bradycardia", desc: "Bradycardia is <110 bpm", comp: "WRONG_DIAGNOSIS" },
    { label: "Patient is having a heart attack", desc: "Fetal monitor is not maternal EKG", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(5, 1, "Catheterization", "A Foley catheter is placed. Why is this critical specifically for C-sections?",
    { label: "To decompress the bladder and protect it from injury during incision", desc: "Mandatory safety step" },
    { label: "To measure blood pressure", desc: "Catheters measure urine output, not BP", comp: "WRONG_DIAGNOSIS" },
    { label: "To keep the mother from peeing", desc: "Functional but doesn't capture the surgical safety rationale", comp: "WRONG_DIAGNOSIS" },
    { label: "It's optional", desc: "Standard of care requires it", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(6, 1, "Antibiotics & VTE", "Which pre-operative medications are standard for this patient?",
    { label: "Cefazolin (Antibiotic) and SCD boots (VTE Prophylaxis)", desc: "Standard safety protocol" },
    { label: "Heparin IV drip", desc: "Risks major bleeding during surgery", comp: "HEMORRHAGE" },
    { label: "High dose insulin", desc: "Only if diabetic and ordered", comp: "WRONG_DIAGNOSIS" },
    { label: "Strong Morphine pre-induction", desc: "Will suppress neonatal respiratory drive", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(7, 1, "Final Prep", "The abdomen is prepped with Chlorhexidine. How do you ensure the baby isn't affected?",
    { label: "Ensure the prep remains external and does not enter the vagina/uterus pre-incision", desc: "Standard antiseptic practice" },
    { label: "Clean the baby's head with it", desc: "Poisonous/caustic to neonate", comp: "WRONG_INCISION_SITE" },
    { label: "Don't use prep near the baby", desc: "Risks maternal sepsis/SSI", comp: "BOWEL_PERFORATION" },
    { label: "Use soap and water only", desc: "Insufficient for surgical antisepsis", comp: "BOWEL_PERFORATION" }
  ),

  // PHASE 2: ABDOMINAL ENTRY
  createDecision(8, 2, "Skin Incision", "Which incision is standard for modern C-sections?",
    { label: "Pfannenstiel (Low transverse) - 2-3cm above symphysis pubis", desc: "Highest strength and cosmetic result" },
    { label: "Vertical midline", desc: "Reserved for massive trauma or specific placental issues", comp: "WRONG_INCISION_SITE" },
    { label: "McBurney's Point", desc: "Used for appendicitis, not delivery", comp: "WRONG_INCISION_SITE" },
    { label: "Sub-costal (Kocher)", desc: "Used for gallbladder, not delivery", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(9, 2, "Fascial Incision", "The fascia is reached. How do you extend the fascial incision safely?",
    { label: "A small midline nick followed by blunt/sharp lateral extension", desc: "Prevents muscle injury" },
    { label: "Cut blindly across the whole abdomen", desc: "Risks bowel or mesenteric injury", comp: "BOWEL_PERFORATION" },
    { label: "Tear it with your hands", desc: "Fascia is too strong for blunt manual tearing without a nick", comp: "WRONG_INCISION_SITE" },
    { label: "Burn it with a laser", desc: "Excessive thermal damage", comp: "HEMORRHAGE" }
  ),
  createDecision(10, 2, "Muscle Separation", "The Rectus Abdominis muscles are reached. How are they managed?",
    { label: "Separated vertically along the midline raphe", desc: "Muscles are not cut, just pushed aside" },
    { label: "Cut across the muscle fibers (Myotomy)", desc: "Causes massive bleeding and permanent weakness", comp: "HEMORRHAGE" },
    { label: "Remove the muscles", desc: "Absolute surgical catastrophe", comp: "CARDIAC_INJURY" },
    { label: "Ignore them and cut through", desc: "Risks injury to the underlying peritoneum/bowel", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(11, 2, "Peritoneal Entry", "How do you safely enter the peritoneum?",
    { label: "Pick up the peritoneum with forceps to verify it's tented away from the bowel", desc: "Classic safety maneuver" },
    { label: "Push the scalpel deeply", desc: "Guaranteed bowel/bladder injury", comp: "BOWEL_PERFORATION" },
    { label: "Wait for the peritoneum to open itself", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" },
    { label: "Inject CO2", desc: "This is open surgery, not laparoscopy", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(12, 2, "The Bladder Flap", "You see the visceral peritoneum over the uterus. Why do you create a 'Bladder Flap'?",
    { label: "To push the bladder down and away from the intended uterine incision", desc: "Essential bladder protection" },
    { label: "To see the baby better", desc: "Secondary benefit; main goal is bladder safety", comp: "WRONG_INCISION_SITE" },
    { label: "To collect urine for a sample", desc: "The catheter already does this", comp: "WRONG_DIAGNOSIS" },
    { label: "It's optional based on time", desc: "Standard expected practice in primary sections", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(13, 2, "Bladder Injury", "You notice a small leak of yellow fluid from the lower segment. What is it?",
    { label: "Bladder perforation", desc: "Requires immediate repair" },
    { label: "Amniotic fluid", desc: "Possible, but if the uterus isn't open yet, it's the bladder", comp: "WRONG_INCISION_SITE" },
    { label: "Sweat", desc: "Impossible", comp: "WRONG_DIAGNOSIS" },
    { label: "Blood", desc: "Blood is red, not yellow", comp: "HEMORRHAGE" }
  ),

  // PHASE 3: UTERINE INCISION
  createDecision(14, 3, "Uterine Segment", "Where should the hysterotomy be placed?",
    { label: "Lower uterine segment (Transverse)", desc: "Standard Kerr incision for least bleeding and future safety" },
    { label: "Upper Uterine Segment (Classical)", desc: "High risk of rupture in future pregnancies", comp: "HEMORRHAGE" },
    { label: "On the Fallopian Tubes", desc: "Does not deliver the baby", comp: "WRONG_INCISION_SITE" },
    { label: "On the cervix", desc: "Wait; too low", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(15, 3, "Hysterotomy Depth", "How do you perform the initial uterine incision?",
    { label: "Gradual sharp incision until membranes are reached or visible", desc: "Prevents fetal laceration" },
    { label: "One deep plunge of the scalpel", desc: "High risk of cutting the baby's scalp/face", comp: "WRONG_INCISION_SITE" },
    { label: "Punch the uterus", desc: "Grossly traumatic", comp: "CARDIAC_INJURY" },
    { label: "Burn through with cautery", desc: "Risks thermal injury to the baby and poor healing", comp: "HEMORRHAGE" }
  ),
  createDecision(16, 3, "Uterine Extension", "The initial nick is made. How is the incision extended?",
    { label: "Bluntly using finger traction to the sides", desc: "Safest for uterine vessels" },
    { label: "Sharp scissors extension all the way", desc: "Risks cutting the uterine arteries", comp: "HEMORRHAGE" },
    { label: "Leave it small", desc: "The baby's head will not fit (Stuck head)", comp: "WRONG_DIAGNOSIS" },
    { label: "Use a saw", desc: "Inappropriate", comp: "HEMORRHAGE" }
  ),
  createDecision(17, 3, "Membrane Rupture", "The membranes are intact. What is the tool of choice?",
    { label: "Allis clamp or a small nick with a scalpel", desc: "Standard membrane rupture" },
    { label: "A heavy hammer", desc: "Traumatic", comp: "HEMORRHAGE" },
    { label: "Wait for the baby to kick its way out", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" },
    { label: "Suction the membranes away", desc: "Suction is for fluid, not the membrane wall", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(18, 3, "Meconium Check", "The fluid is green and thick. What does this indicate?",
    { label: "Meconium staining (Fetal stress)", desc: "Requires neonatal team for suctioning" },
    { label: "Normal amniotic fluid", desc: "Normal is clear/straw colored", comp: "WRONG_DIAGNOSIS" },
    { label: "Internal bleeding", desc: "Would be red", comp: "HEMORRHAGE" },
    { label: "The baby ate green vegetables", desc: "Wait; neonates don't eat in utero", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(19, 3, "Uterine Hemorrhage", "As you extend, a uterine artery starts pumping. How do you manage?",
    { label: "Clamping with a Heaney or Kelly clamp and ligation", desc: "Standard vascular control" },
    { label: "Ignore it and deliver the baby first", desc: "Risks massive exsanguination", comp: "HEMORRHAGE" },
    { label: "Put a bandage on the outside", desc: "Ineffective for internal arterial bleed", comp: "HEMORRHAGE" },
    { label: "Tell the student to hold their finger in it", desc: "Uncontrolled and unsterile", comp: "HEMORRHAGE" }
  ),

  // PHASE 4: DELIVERY
  createDecision(20, 4, "Head Delivery", "The baby's head is deep in the pelvis. How is it delivered?",
    { label: "Gentle manual elevation and fundal pressure from the assistant", desc: "Standard delivery maneuver" },
    { label: "Pull the legs out first", desc: "Breech conversion is difficult and risky for an cephalic baby", comp: "WRONG_INCISION_SITE" },
    { label: "Use a vacuum extractor inside the uterus", desc: "Risky and difficult compared to manual", comp: "WRONG_INCISION_SITE" },
    { label: "Leave them there", desc: "Does not complete the procedure", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(21, 4, "The 'Suction'", "The head is delivered. What is the priority if there is meconium?",
    { label: "Suction the mouth and nose before the first cry", desc: "Prevents meconium aspiration syndrome" },
    { label: "Squeeze the baby", desc: "Traumatic", comp: "WRONG_DIAGNOSIS" },
    { label: "Wipe with a towel", desc: "Does not clear the airway", comp: "WRONG_DIAGNOSIS" },
    { label: "Ask the baby to cough", desc: "Neonates cannot follow commands", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(22, 4, "Shoulder Delivery", "The head is out, but the shoulders are caught. What maneuver?",
    { label: "Gentle downward traction and clearing the anterior shoulder", desc: "Standard maneuvers" },
    { label: "Yank as hard as possible", desc: "Risks Brachial Plexus injury (Erb's Palsy)", comp: "NERVE_DAMAGE" },
    { label: "Cut the baby's shoulder", desc: "Maiming of the neonate", comp: "NERVE_DAMAGE" },
    { label: "Push the baby back in (Zavanelli)", desc: "Used for vaginal shoulder dystocia, not during C-section", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(23, 4, "Cord Clamping", "How many clamps do you apply to the cord?",
    { label: "Two clamps, then cut between them", desc: "Standard practice" },
    { label: "One clamp", desc: "Cord will bleed from the baby's side", comp: "HEMORRHAGE" },
    { label: "Zero clamps", desc: "Massive cord hemorrhage", comp: "HEMORRHAGE" },
    { label: "Clamp the mother's leg", desc: "Irrelevant", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(24, 4, "Neonatal Handoff", "The baby is not crying and appears blue (cyanotic). What is the protocol?",
    { label: "Hand off to the waiting pediatric/neonatal team immediately", desc: "The standard 'Warm, Dry, Stimulate' protocol" },
    { label: "Wait and see", desc: "Hypoxic brain injury (Failure)", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Shake the baby", desc: "Dangerous, risks intracranial hemorrhage", comp: "CARDIAC_INJURY" },
    { label: "Douse in cold water", desc: "Cold stress makes things worse", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(25, 4, "Cord pH", "The pediatrician asks for cord gases. Where do you sample?",
    { label: "The umbilical artery", desc: "Reflects fetal metabolic status" },
    { label: "The mother's arm", desc: "Reflects maternal status, not fetal", comp: "WRONG_DIAGNOSIS" },
    { label: "The baby's foot", desc: "Capillary sample, not the requested cord gas", comp: "WRONG_DIAGNOSIS" },
    { label: "The amniotic fluid pool", desc: "Not a blood gas", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 5: REPAIR
  createDecision(26, 5, "Placental Delivery", "How is the placenta typically delivered?",
    { label: "Manual extraction or gentle traction on the cord (Brandt-Andrews)", desc: "Standard placental delivery" },
    { label: "Wait for 2 hours", desc: "Increases risk of hemorrhage", comp: "HEMORRHAGE" },
    { label: "Scrape it out with a spoon", desc: "Risks uterine perforation", comp: "HEMORRHAGE" },
    { label: "Leave it inside", desc: "Retained products cause infection/atony", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(27, 5, "Uterine Atony", "The placenta is out, but the uterus is 'boggy' and bleeding heavily. What is the first-line medication?",
    { label: "Oxytocin (Pitocin) infusion/injection", desc: "Standard uterotonic agent" },
    { label: "Morphine", desc: "Does not cause uterine contraction", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Insulin", desc: "No effect on uterine tone", comp: "WRONG_DIAGNOSIS" },
    { label: "Cold water flush", desc: "Ineffective compared to medications", comp: "HEMORRHAGE" }
  ),
  createDecision(28, 5, "Persistent Bleeding", "Pitocin failed. Uterus is still boggy. Next step?",
    { label: "Methergine (unless hypertensive) or Carboprost (Hemabate)", desc: "Secondary uterotonics" },
    { label: "Apply a small bandage", desc: "Ineffective", comp: "HEMORRHAGE" },
    { label: "Tell the mother to relax", desc: "Inappropriate and misses the pathology", comp: "HEMORRHAGE" },
    { label: "Request a total hysterectomy immediately", desc: "Last resort; try other meds and maneuvers first", comp: "HEMORRHAGE" }
  ),
  createDecision(29, 5, "Uterine Closure (Layer 1)", "What suture is used to close the hysterotomy?",
    { label: "Running 0 or 2-0 absorbable (Vicryl or Monocryl)", desc: "Provides high-tension closure that heals well" },
    { label: "Silk ties", desc: "Permanent; not ideal for internal uterine closure", comp: "WRONG_DIAGNOSIS" },
    { label: "Staples", desc: "Internal staples in the uterus are high risk for subsequent pregnancy", comp: "HEMORRHAGE" },
    { label: "Glue", desc: "Insufficient strength for a contracting uterus", comp: "HEMORRHAGE" }
  ),
  createDecision(30, 5, "Uterine Closure (Layer 2)", "Is a second layer of uterine closure required?",
    { label: "Commonly performed to ensure hemostasis and future uterine integrity", desc: "Improves scar strength" },
    { label: "Never", desc: "Standard of care allows for 1 or 2 layers; 2 is safer for future VBA", comp: "WRONG_DIAGNOSIS" },
    { label: "Yes, use metal wire", desc: "Excessive and destructive for future pregnancy", comp: "WRONG_INCISION_SITE" },
    { label: "Only if the mother is young", desc: "Depends on anatomical need, not age", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(31, 5, "Internal Inspection", "What do you inspect before closing the fascia?",
    { label: "Ovaries, tubes, and the bladder flap hemostasis", desc: "Standard internal audit" },
    { label: "The patient's purse", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "The stomach", desc: "Unless symptoms warrant, it's out of the operative field", comp: "WRONG_DIAGNOSIS" },
    { label: "The ceiling lights", desc: "Administrative", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(32, 5, "Count Verification", "The circulator reports the sponge count is incorrect. What do you do?",
    { label: "Halt closure and perform a systematic search, followed by an X-ray if needed", desc: "Prevents retained foreign bodies" },
    { label: "Close anyway and hope for the best", desc: "Retained sponge leads to abscess/fistula (Failure)", comp: "BOWEL_PERFORATION" },
    { label: "Blame the nurse", desc: "Unprofessional and doesn't solve the safety issue", comp: "WRONG_DIAGNOSIS" },
    { label: "Restart the whole surgery", desc: "Excessive; just find the sponge", comp: "HEMORRHAGE" }
  ),

  // PHASE 6: POST-PARTUM
  createDecision(33, 6, "Uterine Massage", "Post-op: The nurse performs 'fundal massage'. What is the purpose?",
    { label: "To ensure the uterus remains contracted and prevent hemorrhage", desc: "Essential post-op care" },
    { label: "To wake up the baby", desc: "Not the purpose", comp: "WRONG_DIAGNOSIS" },
    { label: "To give the mother a spa experience", desc: "Actually very painful", comp: "WRONG_DIAGNOSIS" },
    { label: "To measure the baby's length", desc: "Not the method", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(34, 6, "Mother-Baby Bonding", "The baby is stable (APGAR 8/9). When should skin-to-skin contact begin?",
    { label: "Immediately in the recovery room or even the OR if safe", desc: "Promotes bonding and breastfeeding" },
    { label: "After the baby is 1 week old", desc: "Too late to maximize the 'golden hour'", comp: "WRONG_DIAGNOSIS" },
    { label: "Only if the baby is a boy", desc: "Gender irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "Never", desc: "Antithetical to modern obstetric best practice", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(35, 6, "Pain Management (Lactation)", "The mother wants to breastfeed. Which pain medication class is generally preferred?",
    { label: "NSAIDs (Ibuprofen) and limited Acetaminophen", desc: "Safe for breastfeeding" },
    { label: "High dose Codeine", desc: "Metabolized to morphine, risks neonatal sedation", comp: "ANESTHESIA_OVERDOSE" },
    { label: "No meds at all", desc: "Increases stress and inhibits milk let-down", comp: "WRONG_DIAGNOSIS" },
    { label: "Alcohol", desc: "Dangerous and unprofessional", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(36, 6, "Ambulation", "When should the mother begin walking (ambulating)?",
    { label: "Within 6-12 hours after spinal wears off", desc: "Crucial for DVT prevention" },
    { label: "No movement for 3 days", desc: "High risk of blood clots (DVT/PE)", comp: "CARDIAC_INJURY" },
    { label: "Run a marathon on Day 1", desc: "Will cause wound dehiscence", comp: "WRONG_INCISION_SITE" },
    { label: "Only when she feels 'perfect'", desc: "May never feel perfect, requires clinical guidance", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(37, 6, "The 'VBA' Discussion", "The patient asks if she can have a vaginal birth next time (VBAC). What is the most important factor?",
    { label: "The type of uterine incision (Low Transverse vs Classical)", desc: "Classical incisions are a contraindication to VBAC" },
    { label: "The weight of the baby this time", desc: "Secondary factor", comp: "WRONG_DIAGNOSIS" },
    { label: "The color of her eyes", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "The hospital's lunch menu", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(38, 6, "Case Closure", "Uterus is contracted, baby is feeding well, and wounds are healing. What is your final evaluation?",
    { label: "Success: Healthy mother and healthy baby", desc: "The ultimate goal" },
    { label: "Failure: Surgery took too long", desc: "Time is less important than safety", comp: "WRONG_DIAGNOSIS" },
    { label: "Neutral: Could have been better", desc: "Be more specific with self-evaluation", comp: "WRONG_DIAGNOSIS" },
    { label: "Case abandoned", desc: "The baby is already delivered", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(39, 6, "Bladder Function", "Post-op: The patient cannot void after catheter removal. What is the first step?",
    { label: "Bladder scan and intermittent catheterization (Straight cath)", desc: "Standard urinary retention management" },
    { label: "Assume the bladder is gone", desc: "Catastrophic and likely untrue", comp: "WRONG_INCISION_SITE" },
    { label: "Wait for 24 hours", desc: "Risks bladder over-distension and damage", comp: "WRONG_DIAGNOSIS" },
    { label: "Give a diuretic (Lasix)", desc: "Makes more urine, exacerbating the retention problem", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(40, 6, "Endometritis", "POD 3: Maria has a fever, foul-smelling lochia, and uterine tenderness. What is it?",
    { label: "Post-partum Endometritis (Infection)", desc: "Requires IV Clindamycin and Gentamicin" },
    { label: "Standard healing", desc: "Fever and foul smell are never normal", comp: "BOWEL_PERFORATION" },
    { label: "Gas", desc: "Does not cause high fever and uterine tenderness", comp: "WRONG_DIAGNOSIS" },
    { label: "Stress", desc: "Dismissive of a clinical infection", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(41, 6, "Incidental Cysts", "During the surgery, you found a 4cm simple ovarian cyst. How was it managed?",
    { label: "Observation and charting, as most are physiological", desc: "Standard conservative management" },
    { label: "Remove the ovary entirely", desc: "Excessive for a simple 4cm cyst", comp: "WRONG_INCISION_SITE" },
    { label: "Pop it with a needle", desc: "Can cause chemical peritonitis if not simple", comp: "BOWEL_PERFORATION" },
    { label: "Tell the husband to worry", desc: "Unprofessional", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(42, 6, "Placenta Accreta", "What if the placenta had not detached and instead grown into the uterine wall?",
    { label: "Placenta Accreta - potential for massive hemorrhage and hysterectomy", desc: "The most dangerous placenta complication" },
    { label: "Placenta Previa", desc: "Placenta over the cervix, not invaded into the wall", comp: "HEMORRHAGE" },
    { label: "Placenta Normal", desc: "Invasion is not normal", comp: "WRONG_DIAGNOSIS" },
    { label: "Placenta Small", desc: "Size is irrelevant to invasion depth", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(43, 6, "Neonatal Hypoglycemia", "The baby was large for gestational age (4.2kg). What must be monitored?",
    { label: "Neonatal blood glucose levels", desc: "Large babies are at risk for hypoglycemia" },
    { label: "Neonatal hair color", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "Maternal eyesight", desc: "Not the primary neonatal risk", comp: "WRONG_DIAGNOSIS" },
    { label: "The hospital's Wi-Fi speed", desc: "Administrative", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(44, 6, "Scar Dehiscence", "What is the primary sign of uterine rupture in a subsequent labor?",
    { label: "Abnormal FHR tracings (Bradycardia) and maternal abdominal pain", desc: "Emergency detection signs" },
    { label: "The mother gets a cough", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "The baby gets hiccups", desc: "Hiccups are normal", comp: "WRONG_DIAGNOSIS" },
    { label: "Improved labor speed", desc: "Rupture halts labor and creates disaster", comp: "HEMORRHAGE" }
  ),
  createDecision(45, 6, "Post-Op Wound Care", "The bandage is soaked with blood 2 hours post-op. What is the action?",
    { label: "Reinforce, apply pressure, and check H&H; inspect for hematoma", desc: "Standard wound watch" },
    { label: "Ignore it", desc: "Can hide a massive sub-fascial hematoma", comp: "HEMORRHAGE" },
    { label: "Take the patient for a walk", desc: "Will exacerbate bleeding", comp: "HEMORRHAGE" },
    { label: "Apply a heating pad", desc: "Causes vasodilation and worsens bleeding", comp: "HEMORRHAGE" }
  ),
  createDecision(46, 6, "Breastfeeding Benefits", "Why do we encourage breastfeeding in the immediate post-op period for uterine health?",
    { label: "Causes endogenous oxytocin release, which helps the uterus contract", desc: "Natural atony prevention" },
    { label: "It makes the mother tired", desc: "Not the clinical benefit", comp: "WRONG_DIAGNOSIS" },
    { label: "It has no effect", desc: "Ignores the hormonal reflex loop", comp: "WRONG_DIAGNOSIS" },
    { label: "It helps with the budget", desc: "Economic, not clinical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(47, 6, "Discharge Criteria", "When is Maria safe to go home?",
    { label: "Stable vitals, clear diet, voiding, and pain controlled on orals", desc: "Standard discharge triad" },
    { label: "Day 1", desc: "Usually too soon for major abdominal recovery", comp: "WRONG_DIAGNOSIS" },
    { label: "When she learns to code", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" },
    { label: "Only after 3 months", desc: "Excessive length of stay", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(48, 6, "Clinical Pearl: Closure", "Final Pearl: Why do we always close the uterus with an absorbable suture?",
    { label: "To allow for future expansion during pregnancy without permanent wire injury", desc: "Essential for uterine biology" },
    { label: "Because it's cheaper", desc: "Economics is secondary to safety", comp: "WRONG_DIAGNOSIS" },
    { label: "It looks nicer", desc: "Cosmetics doesn't apply to internal organs", comp: "WRONG_DIAGNOSIS" },
    { label: "There is no reason", desc: "Ignores physiologic principles", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(49, 6, "The 'Final Call'", "The team is finishing. APGARs were 8 and 9. Mother lost 800ml blood. Is this success?",
    { label: "Yes, 800ml is within normal Range for a routine C-section", desc: "Acceptable blood loss metrics" },
    { label: "No, 800ml is a catastrophe", desc: "C-sections lose significantly more than vaginal births", comp: "HEMORRHAGE" },
    { label: "Yes, any blood loss is good", desc: "Nonsensical; less is always better", comp: "HEMORRHAGE" },
    { label: "I don't know", desc: "Be decisive", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(50, 6, "Procedure Complete", "Case status: Maria L., C-Section complete. What have you demonstrated?",
    { label: "Surgical competence and crisis management in obstetrics", desc: "Final verification" },
    { label: "How to deliver a pizza", desc: "Inappropriate", comp: "WRONG_DIAGNOSIS" },
    { label: "Obstetrics is easy", desc: "Undermines complexity", comp: "WRONG_DIAGNOSIS" },
    { label: "Case failed", desc: "Mother and baby are safe", comp: "WRONG_DIAGNOSIS" }
  )
];

export const PATIENT = {
  name: "Maria L.",
  age: 31,
  gender: "Female (Pregnant)",
  weight: "92 kg",
  bloodType: "A+",
  admission: "39 weeks gestation, failure to progress in labor, non-reassuring fetal tracing.",
  mood: "Exhausted but determined",
  comorbidities: ["none"], 
  procedureCategory: "obgyn"
};

export const PHASES = [
  { id: 1, name: "Evaluation", icon: "🤰", short: "Labor" },
  { id: 2, name: "Intake", icon: "💉", short: "Epidural" },
  { id: 3, name: "Abdominal Entry", icon: "⚗️", short: "Pfannenstiel" },
  { id: 4, name: "Delivery", icon: "👶", short: "Delivery" },
  { id: 5, name: "Closure", icon: "🪡", short: "Repair" },
  { id: 6, name: "Post-Partum", icon: "👩‍🍼", short: "Recovery" },
];

export const cSectionData = { PATIENT, PHASES, DECISIONS };
