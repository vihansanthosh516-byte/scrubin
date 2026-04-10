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
        { id: "1", label: "Apply direct pressure with a peanut or gauze and call for vascular control", desc: "Standard bleeding protocol", correct: true },
        { id: "2", label: "Attempt to clip blindly", desc: "Risks injury to common bile duct", correct: false },
        { id: "3", label: "Suction vigorously to visualize the source", desc: "Masks the rate of loss", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Abort primary maneuver and reassess anatomical landmarks", desc: "Prevents ductal injury", correct: true },
        { id: "2", label: "Continue with the current plane", desc: "Will cause permanent biliary damage", correct: false },
        { id: "3", label: "Call for a second attending surgeon", desc: "Safe intra-operative consultation", correct: true }
      ];
    case "BOWEL_PERFORATION":
      return [
        { id: "1", label: "Identify the injury and perform primary repair with silk sutures", desc: "Immediate source control", correct: true },
        { id: "2", label: "Copious irrigation and broad-spectrum antibiotics", desc: "Mitigates contamination", correct: true },
        { id: "3", label: "Ignore small serosal tears", desc: "Risks delayed perforation", correct: false }
      ];
    case "ANESTHESIA_OVERDOSE":
      return [
        { id: "1", label: "Reduce anesthetic depth and increase ventilation", desc: "Standard reversal protocol", correct: true },
        { id: "2", label: "Administer reversal agents like Sugammadex", desc: "Specific for paralytics", correct: true },
        { id: "3", label: "Apply cooling blankets", desc: "Does not address the pharmacologic over-sedation", correct: false }
      ];
    case "CARDIAC_INJURY":
      return [
        { id: "1", label: "Initiate ACLS protocols and manage arrhythmias", desc: "Life-saving stabilization", correct: true },
        { id: "2", label: "Defibrillate if in a shockable rhythm", desc: "Restores sinus rhythm", correct: true },
        { id: "3", label: "Wait and monitor vitals", desc: "Leads to cardiac arrest", correct: false }
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
  createDecision(1, 1, "Initial Presentation", "A 45-year-old female presents with persistent right upper quadrant pain, nausea, and a positive Murphy's sign. What is your first diagnostic step?",
    { label: "Order an abdominal ultrasound", desc: "Gold standard for suspected cholelithiasis" },
    { label: "Take the patient directly to the OR", desc: "Surgical intervention without confirmation is high risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Prescribe oral antibiotics and discharge", desc: "Misses acute cholecystitis with potential complications", comp: "WRONG_DIAGNOSIS" },
    { label: "Request a head CT", desc: "Anatomically irrelevant for abdominal pain", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "Ultrasound Results", "Ultrasound shows gallstones, a 5mm gallbladder wall shadow, and pericholecystic fluid. What does this indicate?",
    { label: "Acute cholecystitis", desc: "Classic ultrasound triad for inflammation" },
    { label: "Normal finding", desc: "Ignores the wall thickening and fluid", comp: "WRONG_DIAGNOSIS" },
    { label: "Biliary dyskinesia", desc: "Requires HIDA scan for diagnosis", comp: "WRONG_DIAGNOSIS" },
    { label: "Metastatic liver disease", desc: "Unfounded without further imaging", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Laboratory Workup", "Which lab result would be most concerning for a concurrent common bile duct stone (choledocholithiasis)?",
    { label: "Elevated Bilirubin and Alkaline Phosphatase", desc: "Indicators of biliary obstruction" },
    { label: "Isolated elevated WBC count", desc: "Suggests infection/inflammation but not necessarily obstruction", comp: "WRONG_DIAGNOSIS" },
    { label: "Elevated Lipase", desc: "Suggests pancreatitis, which can be secondary but isn't the primary marker", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal LFTs", desc: "Does not explain a potential obstruction", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(4, 1, "Pre-Op Evaluation", "The patient reports a history of post-operative nausea and vomiting (PONV). What is your management plan?",
    { label: "Administer prophylactic Dexamethasone pre-induction and Ondansetron intra-op", desc: "Standard multi-modal anti-emetic therapy" },
    { label: "Use only opioids for pain management", desc: "Opioids significantly worsen PONV", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Ignore the history as it's common", desc: "Increases risk of post-op aspiration", comp: "WRONG_DIAGNOSIS" },
    { label: "Cancel the surgery", desc: "Excessive response to a manageable side effect", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(5, 1, "Antibiotics", "When is the most critical time to administer prophylactic antibiotics for this procedure?",
    { label: "Within 60 minutes before the first incision", desc: "Ensures peak tissue concentration" },
    { label: "Immediately after the surgery is completed", desc: "Too late to prevent initial contamination", comp: "BOWEL_PERFORATION" },
    { label: "24 hours before the surgery", desc: "Concentration will fall before the procedure", comp: "WRONG_DIAGNOSIS" },
    { label: "Only if the gallbladder is found to be gangrenous", desc: "Does not follow prophylactic standards for high-risk patients", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(6, 1, "Consent Discussion", "During consent, the patient asks about the risk of 'Open Conversion'. What factors increase this risk?",
    { label: "Male gender, elderly age, obese BMI, and acute cholecystitis presentation", desc: "Documented risk factors for conversion" },
    { label: "The color of the gallbladder", desc: "Subjective and not a quantitative risk factor", comp: "WRONG_DIAGNOSIS" },
    { label: "Patient's blood type", desc: "No correlation with surgical difficulty", comp: "WRONG_DIAGNOSIS" },
    { label: "Choice of laparoscopic camera brand", desc: "Equipment brand does not dictate anatomical difficulty", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(7, 1, "Emergency Triage", "Patient begins to experience severe radiating pain and a fever of 102.5. CT shows gas in the gallbladder wall. What is the diagnosis?",
    { label: "Emphysematous cholecystitis", desc: "Surgical emergency requiring immediate intervention" },
    { label: "Biliary colic", desc: "Pain is transient and does not cause gas in the wall", comp: "WRONG_DIAGNOSIS" },
    { label: "Porcelain gallbladder", desc: "Chronic calcification, not an acute gaseous infection", comp: "WRONG_DIAGNOSIS" },
    { label: "Fitz-Hugh-Curtis syndrome", desc: "Perihepatitis from PID, not gallbladder wall gas", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2: PRE-OP PLANNING
  createDecision(8, 2, "Anesthesia Induction", "The anesthesiologist prepares for rapid sequence induction (RSI). Which paralytic is preferred for its rapid onset?",
    { label: "Succinylcholine", desc: "Fastest onset paralytic for emergency airway control" },
    { label: "Pancuronium", desc: "Too slow for RSI", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Atracurium", desc: "Medium acting, not ideal for rapid induction", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Low dose Rocuronium", desc: "Under-dosing will fail to paralyze for intubation", comp: "ANESTHESIA_UNDERDOSE" }
  ),
  createDecision(9, 2, "Patient Positioning", "How should the patient be positioned to allow gravity to shift the bowel away from the gallbladder?",
    { label: "Reverse Trendelenburg with slight right-side up tilt", desc: "Standard 'French' or 'American' positioning" },
    { label: "Trendelenburg (Head Down)", desc: "Shifts bowel *toward* the surgical site", comp: "WRONG_INCISION_SITE" },
    { label: "Prone (Face Down)", desc: "Impossible for abdominal surgery", comp: "WRONG_INCISION_SITE" },
    { label: "Strict Supine", desc: "Makes gallbladder visualization nearly impossible laparoscopicly", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(10, 2, "Safety Checklist", "The timeout is performed. Which item must be verified specifically for this procedure?",
    { label: "Confirmation of CO2 insufflation availability and backup tank", desc: "Critical for maintaining pneumoperitoneum" },
    { label: "Patient's favorite music", desc: "Irrelevant to surgical safety", comp: "WRONG_DIAGNOSIS" },
    { label: "Verification of hair removal method", desc: "Less critical than site/identity", comp: "WRONG_DIAGNOSIS" },
    { label: "Nurse's lunch break schedule", desc: "Administrative, not clinical safety", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(11, 2, "Equipment Check", "You test the laparoscopic camera and notice it is fogging immediately upon entry. What do you do?",
    { label: "Use Fred anti-fog solution or warm the scope in saline", desc: "Standard scope preparation" },
    { label: "Wipe with a paper towel and continue", desc: "Will scratch the lens", comp: "WRONG_INCISION_SITE" },
    { label: "Increase the CO2 flow", desc: "Does not address the temperature differential", comp: "WRONG_INCISION_SITE" },
    { label: "Proceed with poor vision", desc: "Risks injury to bile ducts", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(12, 2, "Initial Insufflation", "You use the Veress needle at the umbilicus. After two 'pops', you check the initial pressure. It reads 8 mmHg. What does this indicate?",
    { label: "Successful intraperitoneal placement", desc: "Initial pressure should be low (<10 mmHg)" },
    { label: "Needle is in the pre-peritoneal space", desc: "Pressure would be high (>15 mmHg)", comp: "WRONG_INCISION_SITE" },
    { label: "Needle is in a vessel", desc: "Would see blood return", comp: "HEMORRHAGE" },
    { label: "The CO2 tank is empty", desc: "Would show 0 pressure and flow", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(13, 2, "Target Pressure", "What is the standard intra-abdominal pressure used during the procedure?",
    { label: "12 - 15 mmHg", desc: "Balances visualization with cardiovascular safety" },
    { label: "25 mmHg", desc: "Dangerously high, impairs venous return", comp: "CARDIAC_INJURY" },
    { label: "5 mmHg", desc: "Insufficient workspace", comp: "WRONG_INCISION_SITE" },
    { label: "50 mmHg", desc: "Immediate cardiac collapse", comp: "CARDIAC_INJURY" }
  ),

  // PHASE 3: INCISION & ACCESS
  createDecision(14, 3, "Primary Trocar", "Where do you place the 10mm primary camera port?",
    { label: "Umbilicus via Hasson or optical entry", desc: "Standard entry point" },
    { label: "Directly over the gallbladder", desc: "Too close for camera visualization", comp: "WRONG_INCISION_SITE" },
    { label: "Suprapubic", desc: "Too far from the target organ", comp: "WRONG_INCISION_SITE" },
    { label: "Right lower quadrant", desc: "Angle is poor for dissection", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(15, 3, "Working Ports", "Which of these is the most common configuration for working ports?",
    { label: "Epigastric 10mm and two 5mm ports in the right flank", desc: "American standard triangulation" },
    { label: "A single 20mm port at the sternum", desc: "Anatomically impossible", comp: "WRONG_INCISION_SITE" },
    { label: "Four ports placed in the left flank", desc: "Gallbladder is on the right", comp: "WRONG_INCISION_SITE" },
    { label: "No other ports, proceed with single umbilicus port", desc: "Requires specialized SILS equipment", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(16, 3, "Adhesion Management", "Upon entry, you see the Omentum is stuck to the gallbladder wall. How do you Proceed?",
    { label: "Gentle blunt dissection and careful use of cautery on the gallbladder side", desc: "Safely reveals anatomy" },
    { label: "Pull the omentum forcefully", desc: "Risks tearing the liver or bowel", comp: "BOWEL_PERFORATION" },
    { label: "Cut through the omentum blindly", desc: "Risks bleeding as omentum is vascular", comp: "HEMORRHAGE" },
    { label: "Cancel the laparoscopic approach immediately", desc: "Excessive; adhesions are common", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(17, 3, "Gallbladder Retraction", "You grasp the gallbladder fundus. Which direction do you retract to reveal the cystic duct area?",
    { label: "Cephalad (toward the head)", desc: "Stretches out the gallbladder anatomy" },
    { label: "Caudad (toward the feet)", desc: "Obscures the hilum", comp: "WRONG_INCISION_SITE" },
    { label: "Medially (toward the midline)", desc: "Kinks the ducts", comp: "WRONG_INCISION_SITE" },
    { label: "Laterally (toward the right)", desc: "Insufficient for seeing Calot's triangle", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(18, 3, "Calot's Triangle", "What are the anatomical boundaries of Calot's Triangle?",
    { label: "Cystic duct, Common hepatic duct, and the inferior edge of the liver", desc: "The critical surgical waypoint" },
    { label: "Aorta, Vena Cava, and Duodenum", desc: "Major vascular components far from gallbladder", comp: "HEMORRHAGE" },
    { label: "The stomach wall and the spleen", desc: "Left sided anatomy", comp: "WRONG_INCISION_SITE" },
    { label: "Superior and inferior mesenteric arteries", desc: "Vascular supply to the gut", comp: "HEMORRHAGE" }
  ),
  createDecision(19, 3, "The Critical View", "You are dissecting Calot's triangle. What two structures must be definitively identified before clipping?",
    { label: "Cystic duct and Cystic artery", desc: "The 'Critical View of Safety' requirement" },
    { label: "Common bile duct and Portal vein", desc: "NEVER clip these", comp: "WRONG_INCISION_SITE" },
    { label: "Hepatic artery and renal vein", desc: "Anatomically far from the triangle", comp: "HEMORRHAGE" },
    { label: "Gallbladder wall and liver parenchyma", desc: "Insufficient for safe ligation", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(20, 3, "Arterial Variance", "You find a 'Moynihan's hump' (caterpillar turn) of the Right Hepatic Artery. What is the risk?",
    { label: "Mistaking the main Right Hepatic Artery for the Cystic Artery and clipping it", desc: "Can cause liver ischemia" },
    { label: "Bleeding from the Gallbladder wall", desc: "Minor concern compared to RHA injury", comp: "HEMORRHAGE" },
    { label: "Bile leak", desc: "Associated with ducts, not arteries", comp: "WRONG_INCISION_SITE" },
    { label: "The patient will wake up mid-surgery", desc: "Surgical anatomy has no effect on anesthesia depth", comp: "ANESTHESIA_UNDERDOSE" }
  ),

  // PHASE 4: CORE PROCEDURE
  createDecision(21, 4, "Cystic Artery Ligation", "The Cystic Artery is isolated. How do you secure it?",
    { label: "Two proximal clips and one distal clip, then divide", desc: "Standard surgical practice" },
    { label: "Single clip prox and distal", desc: "Clip can slip off with pressure", comp: "HEMORRHAGE" },
    { label: "Monopolar cautery alone", desc: "Vessel can re-open once char falls off", comp: "HEMORRHAGE" },
    { label: "Use a heavy silk tie manually", desc: "Impossible for laparoscopic without endoloops", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(22, 4, "Vascular Hemorrhage", "A clip slips off the cystic artery and it starts bleeding profusely. What is your first step?",
    { label: "Apply direct pressure with a grasper and call for a 'peanut' gauze sponge", desc: "Immediate control before clipping" },
    { label: "Fire clips into the pool of blood", desc: "Risks clipping the Right Hepatic Artery", comp: "WRONG_INCISION_SITE" },
    { label: "Suction the blood and hope it stops", desc: "Will not stop an arterial bleed", comp: "HEMORRHAGE" },
    { label: "Convert to open immediately", desc: "Wait—attempt laparoscopic control first unless unstable", comp: "HEMORRHAGE" }
  ),
  createDecision(23, 4, "Cystic Duct Clips", "You are ready to clip the Cystic Duct. Where do you place the 'stay' clip?",
    { label: "Near the junction of the gallbladder infundibulum and the duct", desc: "Safest point away from the CBD" },
    { label: "Flush against the common bile duct", desc: "High risk of ductal narrowing or injury", comp: "WRONG_INCISION_SITE" },
    { label: "On the liver surface", desc: "Irrelevant for ductal ligation", comp: "WRONG_INCISION_SITE" },
    { label: "On the cystic artery", desc: "Wrong structure", comp: "HEMORRHAGE" }
  ),
  createDecision(24, 4, "Division of the Duct", "You have clipped the duct. How do you divide it?",
    { label: "Laparoscopic scissors or cold cut", desc: "Prevents thermal spread to the CBD" },
    { label: "Hook cautery on 40 Watts", desc: "Risks thermal injury to the CBD", comp: "WRONG_INCISION_SITE" },
    { label: "Laser", desc: "Unnecessarily expensive and high risk", comp: "WRONG_INCISION_SITE" },
    { label: "Manual tearing", desc: "Traumatic and risks clip displacement", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(25, 4, "Ductal Injury", "You notice a small bile leak from an ambiguous structure near the liver bed. What do you suspect?",
    { label: "Duct of Luschka", desc: "An uncommon but known accessory duct variant" },
    { label: "Major CBD injury", desc: "Would be a massive through-and-through leak", comp: "WRONG_INCISION_SITE" },
    { label: "Cystic artery bleeding", desc: "Bile is green, blood is red", comp: "HEMORRHAGE" },
    { label: "Bowel entry", desc: "Contents would be enteric, not pure bile", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(26, 4, "Liver Bed Dissection", "How do you dissect the gallbladder from the liver bed (fossa)?",
    { label: "Use hook or spatula cautery in the sub-serosal plane", desc: "Ensures the liver is not entered" },
    { label: "Dissect deeply into the liver parenchyma", desc: "Causes massive liver bleeding", comp: "HEMORRHAGE" },
    { label: "Use a sharp scalpel", desc: "Impossible to control depth/hemostasis laparoscopicly", comp: "HEMORRHAGE" },
    { label: "Tear it off by hand", desc: "Lacerates the liver capsule", comp: "HEMORRHAGE" }
  ),
  createDecision(27, 4, "Gallbladder Perforation", "The gallbladder wall tears and stones spill into the abdomen. What is the priority?",
    { label: "Retrieve all stones using a grasper or endobag to prevent post-op abscess", desc: "Standard contamination cleanup" },
    { label: "Ignore them since they are sterile", desc: "Will cause severe infection/abscess later", comp: "BOWEL_PERFORATION" },
    { label: "Suction the stones out", desc: "Will clog the suction line immediately", comp: "WRONG_INCISION_SITE" },
    { label: "Irrigate the stones into the deep pelvis", desc: "Hides the source of infection", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(28, 4, "Biliary Crisis", "You accidentally clip the Common Bile Duct. What is the immediate consequence?",
    { label: "Obstruction of the entire biliary tree and potential liver failure", desc: "Catastrophic error" },
    { label: "Nothing, the other ducts compensate", desc: "Wrong; CBD is the only exit", comp: "WRONG_INCISION_SITE" },
    { label: "Temporary jaundice that resolves", desc: "Will require complex reconstructive surgery", comp: "WRONG_INCISION_SITE" },
    { label: "Improved digestion", desc: "Impossible", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(29, 4, "Liver Hemorrhage", "Venous oozing from the liver bed is preventing visualization. How do you control it?",
    { label: "Argon beam coagulator or pressure with a warm lap sponge", desc: "Effective for parenchymal surface bleeding" },
    { label: "Apply a vascular clip to the liver", desc: "Will not work on diffuse parenchymal oozing", comp: "HEMORRHAGE" },
    { label: "Increase the room temperature", desc: "Slows the surgeon, not the bleeding", comp: "HEMORRHAGE" },
    { label: "Pour Betadine into the fossa", desc: "Toxic and ineffective hemostasis", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(30, 4, "Final Inspection", "The gallbladder is completely detached. What do you inspect before extraction?",
    { label: "Check clips on the cystic duct and artery, and ensure the liver bed is dry", desc: "Safety verification" },
    { label: "Count the number of teeth on the patient", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "Only check the camera lens", desc: "Misses internal bleeding/leaks", comp: "HEMORRHAGE" },
    { label: "Verify the anesthesia machine settings", desc: "Anesthesiologist's primary duty, not the final surgical check", comp: "ANESTHESIA_OVERDOSE" }
  ),

  // PHASE 5: CLOSING
  createDecision(31, 5, "Gallbladder Extraction", "How do you remove the specimen from the abdomen?",
    { label: "Place in an Endobag and withdraw through the umbilical port", desc: "Prevents wound port infection" },
    { label: "Pull it out through the 5mm flank port", desc: "Too small, will tear the gallbladder and spill contents", comp: "BOWEL_PERFORATION" },
    { label: "Leave it in the abdomen", desc: "Becomes a nidus for infection", comp: "BOWEL_PERFORATION" },
    { label: "Crush it intra-abdominally to make it smaller", desc: "Guaranteed biliary contamination", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(32, 5, "Irrigation", "You irrigate the RUQ. The fluid comes back tinged with bile. What do you do?",
    { label: "Pause and systematically re-examine the ductal clips and liver bed", desc: "Rules out an unrecognized leak" },
    { label: "Suck it out and close anyway", desc: "Misses a potentially lethal ductal injury", comp: "WRONG_INCISION_SITE" },
    { label: "Flush with 5 liters of water", desc: "Excessive, does not find the source", comp: "WRONG_INCISION_SITE" },
    { label: "Apply more cautery blindly", desc: "Risks additional injury", comp: "HEMORRHAGE" }
  ),
  createDecision(33, 5, "Drain Placement", "Decision: Do you place a Jackson-Pratt (JP) drain?",
    { label: "Yes, if there was significant inflammation or concern about the liver bed", desc: "Safety measure for high-risk cases" },
    { label: "No, a drain is never used in gallbladder surgery", desc: "Incorrect; used for complex cases", comp: "WRONG_DIAGNOSIS" },
    { label: "Yes, place it through the umbilicus", desc: "Drains must exit through separate small incisions", comp: "WRONG_INCISION_SITE" },
    { label: "A drain is a substitute for good surgery", desc: "Dangerous dogma", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(34, 5, "Desufflation", "What is the priority during desufflation?",
    { label: "Slowly release CO2 and visualize port sites for any 'last-look' bleeding", desc: "Prevents post-op hemorrhage from port sites" },
    { label: "Open the valves as fast as possible", desc: "Can cause rapid shift in diaphragm levels", comp: "CARDIAC_INJURY" },
    { label: "Keep the instruments inside while deflating", desc: "Instruments could hit organs in a collapsing field", comp: "WRONG_INCISION_SITE" },
    { label: "Inject air into the ports", desc: "Counter-productive", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(35, 5, "Fascial Closure", "Which port sites require fascial closure?",
    { label: "The 10mm or 12mm umbilical and epigastric ports", desc: "Prevents port-site hernias" },
    { label: "None, laparoscopic ports are too small", desc: "High risk of hernia in 10mm+ sites", comp: "WRONG_INCISION_SITE" },
    { label: "Only the 5mm ports", desc: "Backwards; large sites are high risk", comp: "WRONG_INCISION_SITE" },
    { label: "All sites including 5mm with heavy wire", desc: "Overkill for 5mm sites", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(36, 5, "Skin Closure", "The surgery is over. How do you close the skin?",
    { label: "Subcuticular absorbable sutures with steri-strips or glue", desc: "Standard for best cosmetic result" },
    { label: "Staples on all 5mm ports", desc: "Unnecessarily scarring", comp: "WRONG_INCISION_SITE" },
    { label: "Silk ties around the outside", desc: "Outdated, will leave 'railroad' scars", comp: "WRONG_INCISION_SITE" },
    { label: "Leave all sites open with no coverage", desc: "High infection and dehiscence risk", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(37, 5, "Pain Control", "You choose to perform a TAP block before the patient wakes up. What is the benefit?",
    { label: "Significant reduction in post-operative opioid requirements", desc: "Modern ERAS (Enhanced Recovery) protocol" },
    { label: "It makes the patient wake up faster", desc: "Does not affect anesthetic clearance", comp: "ANESTHESIA_OVERDOSE" },
    { label: "It prevents gallstones from returning", desc: "Absurd", comp: "WRONG_DIAGNOSIS" },
    { label: "There is no benefit to local blocks", desc: "Ignores years of clinical evidence", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(38, 5, "Anesthesia Reversal", "The patient is not waking up as expected. The CO2 level is 65 mmHg. What is the cause?",
    { label: "Hypercapnic narcosis from retained CO2", desc: "Common post-laparoscopic finding requiring ventilation" },
    { label: "The patient is faking it", desc: "Extremely unlikely", comp: "ANESTHESIA_OVERDOSE" },
    { label: "The anesthesia machine is broken", desc: "Check patient first", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Malignant hyperthermia", desc: "Fever and rigidity would also be present", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(39, 5, "Post-Op Vitals", "In the recovery room (PACU), the patient's BP is 100/60. She was 128/82 pre-op. What do you order?",
    { label: "Bolus of 500ml Normal Saline and reassess", desc: "First line for post-op hypotension" },
    { label: "Immediate return to OR for suspected bleeding", desc: "Premature; check fluid status and vitals trend first", comp: "HEMORRHAGE" },
    { label: "Ignore it unless it drops below 90", desc: "Misses early compensated shock", comp: "HEMORRHAGE" },
    { label: "Administer high dose vasopressors", desc: "Over-management of a common fluid shift", comp: "CARDIAC_INJURY" }
  ),

  // PHASE 6: POST-OP
  createDecision(40, 6, "Post-Op Diet", "When can the patient begin oral intake?",
    { label: "Start with clear liquids as soon as they are fully awake and not nauseated", desc: "Standard laparoscopic protocol" },
    { label: "NPO for 48 hours", desc: "Unnecessarily delays recovery", comp: "WRONG_DIAGNOSIS" },
    { label: "Full steak dinner immediately", desc: "Will cause vomiting in post-op stomach", comp: "WRONG_DIAGNOSIS" },
    { label: "Only IV nutrition (TPN) for one week", desc: "Grossly inappropriate for common surgery", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(41, 6, "Shoulder Pain", "The patient complains of severe right shoulder pain 3 hours post-op. What is the likely cause?",
    { label: "Diaphragmatic irritation from retained CO2", desc: "Classic referred pain in laparoscopy" },
    { label: "Myocardial Infarction", desc: "Wait; check location and nature first; usually CO2 in this case", comp: "CARDIAC_INJURY" },
    { label: "Shoulder dislocation from positioning", desc: "Possible but rare compared to CO2", comp: "WRONG_DIAGNOSIS" },
    { label: "The patient had a previous shoulder injury", desc: "Does not explain acute post-op onset", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(42, 6, "Post-Op Fever", "The patient develops a temperature of 100.2 on post-op day (POD) 1. What is the most likely cause?",
    { label: "Atelectasis (lung collapse) or inflammatory response to surgery", desc: "Most common early post-op fever cause" },
    { label: "Abdominal abscess", desc: "Usually takes 5-7 days to develop", comp: "WRONG_DIAGNOSIS" },
    { label: "Urinary tract infection", desc: "Possible if catheterized, but atelectasis is more common", comp: "WRONG_DIAGNOSIS" },
    { label: "Deep Vein Thrombosis", desc: "Usually presents with leg pain, not just a low fever on day 1", comp: "CARDIAC_INJURY" }
  ),
  createDecision(43, 6, "Jaundice", "On POD 2, the patient's eyes (sclera) appear yellow. Bilirubin is 4.5. What is the next step?",
    { label: "Order an MRCP or ERCP to check for a retained common bile duct stone", desc: "Diagnosis of obstructive jaundice" },
    { label: "Reassure patient it's a bruise", desc: "Yellow sclera is jaundice, not a bruise", comp: "WRONG_DIAGNOSIS" },
    { label: "Give fluids and wait", desc: "Does not fix an obstruction", comp: "WRONG_INCISION_SITE" },
    { label: "Remove the patient's liver", desc: "Drastic and incorrect", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(44, 6, "Activity Restrictions", "What are the common restrictions for this patient upon discharge?",
    { label: "No heavy lifting (>10 lbs) for 2 to 4 weeks", desc: "Protects port site fascial closure" },
    { label: "Strict bed rest for one month", desc: "Increases risk of DVT and pneumonia", comp: "CARDIAC_INJURY" },
    { label: "Marathon training can begin tomorrow", desc: "Will cause hernias at port sites", comp: "WRONG_INCISION_SITE" },
    { label: "No driving for 6 months", desc: "Excessive; usually restricted only while on narcotics", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(45, 6, "Discharge Meds", "What is the standard pain regimen to reduce opioid dependency at home?",
    { label: "Scheduled Tylenol (Acetaminophen) and Ibuprofen every 6 hours", desc: "Effective multi-modal home care" },
    { label: "Only high-dose Oxycodone", desc: "Risks addiction and severe constipation", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Aspirin only", desc: "Ineffective for deep surgical pain", comp: "WRONG_DIAGNOSIS" },
    { label: "No pain medication", desc: "Unnecessarily cruel", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(46, 6, "Emergency Return", "The patient calls 5 days later with severe abdominal pain and a 102 fever. What do you suspect?",
    { label: "Intra-abdominal abscess or missed bile leak", desc: "Typical timing for infectious complications" },
    { label: "Heartburn", desc: "Pain/fever indicate much more serious pathology", comp: "WRONG_DIAGNOSIS" },
    { label: "Sore throat", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "Need for more exercise", desc: "Inappropriate for acute symptoms", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(47, 6, "Follow-Up Timing", "When should the patient see you in the clinic for the first post-op check?",
    { label: "2 weeks post-surgery", desc: "Standard time for wound check and pathology review" },
    { label: "A year later", desc: "Too long to catch early complications", comp: "WRONG_DIAGNOSIS" },
    { label: "Tomorrow", desc: "Wounds have not begun meaningful healing yet", comp: "WRONG_DIAGNOSIS" },
    { label: "Never, unless there's a problem", desc: "Best practice requires at least one post-op visit", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(48, 6, "Pathology Review", "The final pathology report shows 'Chronic Cholecystitis with Incidental Gallbladder Cancer' at Stage T1a. What is the plan?",
    { label: "Cholecystectomy is curative for T1a cancer; continue observation", desc: "Correct oncological staging management" },
    { label: "Immediate total liver resection", desc: "Too aggressive for T1a", comp: "WRONG_DIAGNOSIS" },
    { label: "Chemotherapy for life", desc: "Inappropriate for early stage isolated to the mucosa", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Discard the report as it must be a mistake", desc: "Clinical negligence", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(49, 6, "Wound Infection", "The umbilical port is red and draining a small amount of pus. What is the diagnosis?",
    { label: "Superficial Surgical Site Infection (SSI)", desc: "Requires drainage and local care" },
    { label: "Bowel evisceration", desc: "This is skin redness, not organs falling out", comp: "WRONG_INCISION_SITE" },
    { label: "Normal healing", desc: "Pus is never normal", comp: "WRONG_DIAGNOSIS" },
    { label: "Allergic reaction to the bed sheets", desc: "Unfounded given the surgical site focus", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(50, 6, "Final Graduation", "The patient is fully recovered, no cancer spread, and is back to a normal diet. What is your 'Clinical Pearl' for the student?",
    { label: "Always achieve the 'Critical View of Safety' before clipping the ducts", desc: "The number one rule to prevent biliary tragedy" },
    { label: "Surgeries should be as fast as possible", desc: "Speed leads to missed anatomy/errors", comp: "WRONG_DIAGNOSIS" },
    { label: "Anesthesia is the only hard part", desc: "Dismisses surgical technical skill", comp: "WRONG_DIAGNOSIS" },
    { label: "Never use ultrasound", desc: "Nonsensical given its gold standard status", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(51, 6, "Case Closure", "The case is closed. What have you demonstrated?",
    { label: "Safe laparoscopic technique and systematic complication avoidance", desc: "The goal of the ScrubIn simulator" },
    { label: "How to operate while asleep", desc: "Dangerous", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Luck is the most important surgical tool", desc: "Undermines preparation and skill", comp: "WRONG_DIAGNOSIS" },
    { label: "Gallbladders are optional organs", desc: "Technically true but a poor educational takeaway", comp: "WRONG_DIAGNOSIS" }
  )
];

export const PATIENT = {
  name: "Sarah J.",
  age: 42,
  gender: "Female",
  weight: "78 kg",
  bloodType: "B+",
  admission: "Right upper quadrant pain, Murphy's sign positive, history of gallstones.",
  mood: "Anxious but cooperative",
  comorbidities: ["obese"], 
  procedureCategory: "elective"
};

export const PHASES = [
  { id: 1, name: "Evaluation", icon: "🩺", short: "Intake" },
  { id: 2, name: "Stabilization", icon: "📋", short: "Pre-Op" },
  { id: 3, name: "Laparoscopic Entry", icon: "🔪", short: "Access" },
  { id: 4, name: "Gallbladder Removal", icon: "⚕️", short: "Removal" },
  { id: 5, name: "Hemostasis & Closure", icon: "🪡", short: "Closing" },
  { id: 6, name: "Post-Op Debrief", icon: "📊", short: "Post-Op" },
];

export const cholecystectomyData = { PATIENT, PHASES, DECISIONS };
