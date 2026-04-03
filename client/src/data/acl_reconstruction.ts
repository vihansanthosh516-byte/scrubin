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
        { id: "1", label: "Check tourniquet pressure and inflate if needed", desc: "First-line bloodless field control", correct: true },
        { id: "2", label: "Apply direct pressure with a ray-tec", desc: "Basic hemostasis", correct: true },
        { id: "3", label: "Ignore the bleeding; arthroscopy fluid will wash it out", desc: "Leads to poor visualization and risk of major vessel injury", correct: false }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Abort tunnel drilling and use radiological guidance (C-arm) to confirm position", desc: "Standard safety correction", correct: true },
        { id: "2", label: "Proceed with the tunnel as drilled", desc: "Will cause graft impingement or failure", correct: false },
        { id: "3", label: "Halt the procedure and convert to open knee", desc: "Excessive but safe", correct: true }
      ];
    case "NERVE_DAMAGE":
      return [
        { id: "1", label: "Halt dissection and identify the neurovascular bundle", desc: "Prevents permanent palsy", correct: true },
        { id: "2", label: "Apply a nerve stimulator to check function", desc: "Diagnostic but doesn't prevent further injury", correct: true },
        { id: "3", label: "Finish the incision quickly", desc: "High risk of transecting the nerve", correct: false }
      ];
    case "CARDIAC_INJURY":
      return [
        { id: "1", label: "Deflate tourniquet immediately to restore limb perfusion", desc: "Life-over-limb safety", correct: true },
        { id: "2", label: "Initiate ACLS protocols", desc: "Life saving", correct: true },
        { id: "3", label: "Continue surgery while anesthesiologist manages vitals", desc: "Unsafe; physiological stress must be reduced", correct: false }
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
  // PHASE 1: DIAGNOSIS & PLANNING
  createDecision(1, 1, "Clinical Assessment", "The patient presents 2 days after a soccer non-contact injury. You perform the Lachman test. What constitutes a positive result?",
    { label: "Increased anterior translation of the tibia with a soft end-point", desc: "Classic sign of ACL tear" },
    { label: "Pain with extension", desc: "Nonspecific for ACL", comp: "WRONG_DIAGNOSIS" },
    { label: "Locking of the knee joint", desc: "Suggests meniscal tear, not ACL specifically", comp: "WRONG_DIAGNOSIS" },
    { label: "Increased posterior translation", desc: "Sign of PCL injury", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "MRI Interpretation", "The MRI shows a 'double PCL sign'. What does this typically indicate?",
    { label: "Bucket-handle meniscal tear concurrent with ACL", desc: "Crucial for pre-op planning" },
    { label: "Sprained PCL", desc: "MRI jargon error; PCL sprain doesn't show a double sign", comp: "WRONG_DIAGNOSIS" },
    { label: "Total tendon rupture", desc: "Indicates pathology but is less specific", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal anatomy", desc: "Anatomically impossible in presence of a double PCL sign", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Graft Selection", "The patient is a high-level 22-year-old athlete. Which autograft is generally preferred for the lowest re-tear rate?",
    { label: "Bone-Patellar Tendon-Bone (BTB) or Quadriceps tendon", desc: "Highest stability and osseous integration" },
    { label: "Hamstring (Gracilis/Semitendinosus)", desc: "Good, but higher laxity in young athletes", comp: "WRONG_DIAGNOSIS" },
    { label: "Allograft (Cadaver)", desc: "Highest failure rate in active young patients", comp: "WRONG_DIAGNOSIS" },
    { label: "Artificial Synthetic Graft", desc: "Historically poor long-term outcomes", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(4, 1, "Surgical Timing", "Why is it often recommended to wait 2-4 weeks after injury before operating?",
    { label: "To allow inflammation to settle and regain ROM (prevents arthrofibrosis)", desc: "Clinical gold standard" },
    { label: "Because the surgeon is busy", desc: "Non-clinical; the surgery is usually delayed deliberately for better outcomes", comp: "WRONG_DIAGNOSIS" },
    { label: "To let the ACL heal naturally first", desc: "The intra-articular ACL does not heal spontaneously", comp: "WRONG_DIAGNOSIS" },
    { label: "To increase the risk of more injury", desc: "Counter-productive", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(5, 1, "Pre-Op Risks", "During the consent process, you must mention 'Cyclops Lesion'. What is this?",
    { label: "Arthrofibrosis in the notch that prevents full extension", desc: "A common complication requiring revision" },
    { label: "An extra eye appearing on the knee", desc: "Anatomically impossible", comp: "WRONG_DIAGNOSIS" },
    { label: "Infection of the skin", desc: "Unconnected to the name 'Cyclops'", comp: "WRONG_DIAGNOSIS" },
    { label: "Breaking of the tibial bone", desc: "Incorrect description", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(6, 1, "Anesthesia Choice", "The patient wants to be awake but feel nothing. What is your recommendation?",
    { label: "Spinal anesthesia with a femoral nerve block", desc: "Excellent regional control" },
    { label: "General anesthesia only", desc: "Patient specified they want to be awake", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "Local Lidocaine in the skin", desc: "Insufficient for intra-articular bone drilling", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "General anesthesia + heavy sedation", desc: "Does not meet the 'awake' requirement", comp: "ANESTHESIA_UNDERDOSE" }
  ),

  // PHASE 2: ACCESS & CLEARANCE
  createDecision(7, 2, "Tourniquet Placement", "Where should the tourniquet be placed and what is the standard pressure for an adult male thigh?",
    { label: "Upper thigh, 250-300 mmHg", desc: "Ensures bloodless field without nerve injury" },
    { label: "Directly on the knee, 100 mmHg", desc: "Will leak blood and obstruct surgical view", comp: "HEMORRHAGE" },
    { label: "Upper thigh, 600 mmHg", desc: "Dangerously high, likely to cause nerve palsy", comp: "NERVE_DAMAGE" },
    { label: "No tourniquet, use ice", desc: "Will cause excessive bleeding during bone drilling", comp: "HEMORRHAGE" }
  ),
  createDecision(8, 2, "Patient Positioning", "How should the knee be positioned for the start of the arthroscopy?",
    { label: "Flexed to 90 degrees in a leg holder", desc: "Optimal for accessing the portals" },
    { label: "Straight (Full Extension)", desc: "Makes portal entry difficult and risky to articular cartilage", comp: "WRONG_INCISION_SITE" },
    { label: "Bent backwards (Hyperextension)", desc: "Risks neurovascular injury in the popliteal fossa", comp: "NERVE_DAMAGE" },
    { label: "Patient lying on their side (Lateral Decubitus)", desc: "Difficult to manipulate both knees if needed", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(9, 2, "Standard Portals", "You are creating the Anterolateral (AL) and Anteromedial (AM) portals. Which one is the viewing portal typically?",
    { label: "Anterolateral (AL) portal", desc: "Primary viewing port" },
    { label: "Posterior portal", desc: "Rarely used unless for specific posterior pathology", comp: "WRONG_INCISION_SITE" },
    { label: "Directly into the patella", desc: "Destructive and serves no function", comp: "WRONG_INCISION_SITE" },
    { label: "Inside the femur bone", desc: "Impossible for portal access", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(10, 2, "Fluid Management", "The arthroscopy pump is set. What is the target pressure to maintain a clear view?",
    { label: "40-60 mmHg", desc: "Standard level for knee arthroscopy" },
    { label: "200 mmHg", desc: "Can cause severe fluid extravasation into the tissues", comp: "WRONG_DIAGNOSIS" },
    { label: "5 mmHg", desc: "Inadequate view, field will be bloody", comp: "HEMORRHAGE" },
    { label: "500 mmHg", desc: "Immediate tissue damage and compartment risk", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(11, 2, "Diagnostic Sweep", "You see a grade II chondral defect on the medial femoral condyle. How do you manage this during the ACL procedure?",
    { label: "Perform gentle debridement (chondroplasty) with a shaver", desc: "Cleans the joint surface" },
    { label: "Drill a large bone hole (Microfracture) immediately", desc: "Too aggressive for Grade II unless symptomatic", comp: "WRONG_DIAGNOSIS" },
    { label: "Ignore the cartilage to save time", desc: "Misses opportunity to improve long-term outcomes", comp: "WRONG_DIAGNOSIS" },
    { label: "Remove the condyle", desc: "Absurdly destructive", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(12, 2, "The ACL Remnant", "What do you do with the torn native ACL fibers?",
    { label: "Careful debridement of central fibers, leaving the sheath for biological healing if possible", desc: "Current best practice" },
    { label: "Remove every single fiber until the bone is bare", desc: "Loses propreoceptive nerve endings", comp: "NERVE_DAMAGE" },
    { label: "Tie them together with wire", desc: "ACL will not heal and wire creates loose bodies", comp: "WRONG_DIAGNOSIS" },
    { label: "Leave the whole thing floating", desc: "May catch in the joint (Cyclops lesion risk)", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(13, 2, "Notchplasty", "The intercondylar notch is narrow (stenotic). Why do you perform a Notchplasty?",
    { label: "To prevent the new graft from being pinched (impingement) in extension", desc: "Prevents graft failure" },
    { label: "To make the femur look better", desc: "Aesthetic concern is not the goal", comp: "WRONG_DIAGNOSIS" },
    { label: "To collect bone for a transplant", desc: "Not the primary reason", comp: "WRONG_DIAGNOSIS" },
    { label: "To cause pain", desc: "Unethical", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 3: GRAFT PREPARATION
  createDecision(14, 3, "Tendon Harvest", "You are harvesting the Patellar Tendon (BTB). How wide should the graft be?",
    { label: "9mm to 11mm width", desc: "Optimal balance of strength and donor site safety" },
    { label: "25mm", desc: "Too wide; will fracture the patella", comp: "WRONG_INCISION_SITE" },
    { label: "2mm", desc: "Too thin; will snap under load", comp: "WRONG_DIAGNOSIS" },
    { label: "The entire tendon", desc: "Total loss of extensor mechanism", comp: "CARDIAC_INJURY" }
  ),
  createDecision(15, 3, "Bone Plug Harvesting", "The bone plugs from the patella and tibia should be approximately what length?",
    { label: "20mm to 25mm", desc: "Allows secure screw fixation in the tunnels" },
    { label: "100mm", desc: "Will hit the joint surface or skin", comp: "WRONG_INCISION_SITE" },
    { label: "5mm", desc: "Too small for screw to catch", comp: "WRONG_DIAGNOSIS" },
    { label: "Remove the whole patella", desc: "Catastrophic donor site morbidity", comp: "CARDIAC_INJURY" }
  ),
  createDecision(16, 3, "Graft Denudation", "You have the graft on the back table. What is the next step to allow it to fit through the tunnels?",
    { label: "Remove excess fat and muscle tissue and measure its diameter", desc: "Ensures tunnel-graft size match" },
    { label: "File it down with sandpaper", desc: "Damages the delicate collagen fibers", comp: "WRONG_DIAGNOSIS" },
    { label: "Soak it in absolute alcohol", desc: "Kills the cells and compromises strength", comp: "WRONG_DIAGNOSIS" },
    { label: "Stretch it manually for 30 minutes", desc: "Pre-tensioning is good, but 30m manual is impractical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(17, 3, "Graft Protection", "While you work on the tunnels, where should the graft be kept?",
    { label: "Wrapped in a saline-soaked gauze on the back table", desc: "Prevents desiccation" },
    { label: "On the floor", desc: "Immediate contamination and surgical site infection risk", comp: "BOWEL_PERFORATION" },
    { label: "In the sink", desc: "Contamination risk", comp: "BOWEL_PERFORATION" },
    { label: "In your pocket", desc: "Grossly unsterile", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(18, 3, "The 'Pre-Tension'", "Why do we apply tension to the graft on the back table workstation?",
    { label: "To 'take the stretch out' of the fibers before it's fixed in the knee", desc: "Reduces post-op laxity" },
    { label: "To see if it breaks", desc: "Testing is good, but not the primary reason for pre-tensioning", comp: "WRONG_DIAGNOSIS" },
    { label: "To make it longer", desc: "Does not meaningfully change length", comp: "WRONG_DIAGNOSIS" },
    { label: "For fun", desc: "Non-clinical", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 4: TUNNEL DRILLING
  createDecision(19, 4, "Tibial Positioning", "The Tibial guide is set. Where should the center of the tibial tunnel be located?",
    { label: "Posterior to the intersection of the ACL and medial meniscus", desc: "Anatomic placement for stability" },
    { label: "At the very front of the tibia bone", desc: "Causes graft impingement in extension", comp: "WRONG_INCISION_SITE" },
    { label: "Directly through the PCL", desc: "Destroys correct anatomy and stability", comp: "WRONG_INCISION_SITE" },
    { label: "Into the fibula bone", desc: "Wrong bone", comp: "NERVE_DAMAGE" }
  ),
  createDecision(20, 4, "Femoral Clock Face", "You are drilling the femoral tunnel in a right knee via the AM portal. What 'time' on the clock represents a stable anatomic position?",
    { label: "10:00 to 10:30 o'clock", desc: "Standard anatomic location for rotational stability" },
    { label: "12:00 o'clock (Top)", desc: "Causes a 'vertical graft' which fails to control rotation", comp: "WRONG_DIAGNOSIS" },
    { label: "6:00 o'clock (Bottom)", desc: "Violates the posterior femur", comp: "WRONG_INCISION_SITE" },
    { label: "9:00 o'clock", desc: "Too low, likely to blow out the posterior wall", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(21, 4, "Posterior Wall Blowout", "You are drilling the femur and realize the back wall of the bone is too thin ( < 2mm). What do you do?",
    { label: "Stop drilling and use an over-the-top guide or different tunnel angle", desc: "Prevents total loss of femoral fixation" },
    { label: "Keep drilling anyway", desc: "The screw will have nothing to hold on to (Immediate failure)", comp: "WRONG_INCISION_SITE" },
    { label: "Fill the hole with wax", desc: "Surgical wax is for bone bleeding, not structural repair", comp: "WRONG_DIAGNOSIS" },
    { label: "Glue the graft to the skin", desc: "Grossly incorrect", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(22, 4, "Tunnel-Graft Match", "The graft is 9mm in diameter. What size drill should you use?",
    { label: "9mm drill", desc: "Allows for a precise 'press-fit'", },
    { label: "11mm drill", desc: "Tunnel is too wide; screw fixation will be weak", comp: "WRONG_DIAGNOSIS" },
    { label: "5mm drill", desc: "Graft will not fit through the hole", comp: "WRONG_DIAGNOSIS" },
    { label: "Hammer it through without drilling", desc: "Fractures the femur", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(23, 4, "Protecting the Popliteal fossa", "While drilling the tibial tunnel, how do you prevent the drill bit from hitting the artery in the back of the knee?",
    { label: "Keep the knee in 90 degrees flexion and use a depth stop/blunt guide", desc: "Separates bone from the artery" },
    { label: "Push as hard as possible", desc: "Likely to plunge into the popliteal artery", comp: "HEMORRHAGE" },
    { label: "Drill while the patient's leg is straight", desc: "Pushes the artery closer to the bone", comp: "NERVE_DAMAGE" },
    { label: "Close your eyes while drilling", desc: "Fatal negligence", comp: "HEMORRHAGE" }
  ),
  createDecision(24, 4, "Tunnel Debridement", "Bone slurry from the drilling is floating in the joint. What is the priority?",
    { label: "Copious irrigation and thorough suctioning", desc: "Prevents later loose bodies or stiffness" },
    { label: "Leave it, it will grow into new bone", desc: "Will cause arthrofibrosis and pain", comp: "WRONG_DIAGNOSIS" },
    { label: "Pour cement into the joint", desc: "Permanent loss of joint function", comp: "WRONG_DIAGNOSIS" },
    { label: "Stop the CO2 flow", desc: "Non-existent; arthroscopy uses saline, not CO2", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 5: FIXATION & TENSIONING
  createDecision(25, 5, "Passing the Graft", "You are pulling the graft through the tunnels. It gets stuck. What do you check first?",
    { label: "If the bone plugs are caught on an soft tissue or a mismatch in diameter", desc: "Common technical holdup" },
    { label: "Pull harder with a winch", desc: "Will snap the passing sutures or tear the graft", comp: "WRONG_DIAGNOSIS" },
    { label: "Cut the graft", desc: "Now the procedure cannot be completed", comp: "WRONG_DIAGNOSIS" },
    { label: "Drill through the graft", desc: "Destroys the structural integrity of the ACL", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(26, 5, "Femoral Fixation", "You are using an interference screw for the femur. Where should it be placed relative to the bone plug?",
    { label: "Anterior or lateral to the bone plug to avoid posterior wall damage", desc: "Safest screw orientation" },
    { label: "Posterior to the plug", desc: "Risks blowing out the thin posterior femoral wall", comp: "WRONG_INCISION_SITE" },
    { label: "In the middle of the plug", desc: "Splits the bone and loses fixation strength", comp: "WRONG_DIAGNOSIS" },
    { label: "In the muscle", desc: "Screw must be in bone to work", comp: "NERVE_DAMAGE" }
  ),
  createDecision(27, 5, "Knee Position for Tensioning", "At what knee angle should the graft be tensioned and fixed to the tibia?",
    { label: "Near full extension (20 to 30 degrees of flexion)", desc: "Ensures no 'capture' of the knee which prevents extension" },
    { label: "Flexed to 90 degrees", desc: "Will result in a 'captured' knee that cannot straighten", comp: "WRONG_DIAGNOSIS" },
    { label: "Maximum hyperextension", desc: "Will lead to a loose graft when the knee is flexed", comp: "WRONG_DIAGNOSIS" },
    { label: "Bent into a circle", desc: "Anatomically impossible", comp: "NERVE_DAMAGE" }
  ),
  createDecision(28, 5, "The Posterior Drawer", "While fixing the graft, you apply a 'posterior drawer' force to the tibia. Why?",
    { label: "To restore the anatomic relationship of the tibia to the femur before locking it in", desc: "Standard clinical maneuver" },
    { label: "To push the knee back together", desc: "Too simplistic; the goal is anatomic reduction", comp: "WRONG_DIAGNOSIS" },
    { label: "To see if the patient is asleep", desc: "Irrelevant use of the maneuver", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "To pop the joint", desc: "Avoid popping/cracking; focus on reduction", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(29, 5, "Tibial Fixation", "You are placing a bio-absorbable screw in the tibia. It cracks during insertion. What is the cause?",
    { label: "The tunnel was under-dapped or the screw was over-torqued", desc: "Requires careful removal and replacement" },
    { label: "The bone is too hard", desc: "Unlikely in a 22y athlete to break a screw without other factors", comp: "WRONG_DIAGNOSIS" },
    { label: "The patient moved", desc: "Paralytics should prevent this", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "The screw is made of sugar", desc: "Absurd", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(30, 5, "Secondary Fixation", "The tibial screw feels a bit loose. How can you augment the fixation?",
    { label: "Tie the passing sutures over a 'post' (small screw) or a backup staple", desc: "Mechanical backup" },
    { label: "Fill the hole with gravel", desc: "Dangerous infection risk and loose bodies", comp: "WRONG_DIAGNOSIS" },
    { label: "Tell the patient to be careful", desc: "Does not fix the immediate mechanical issue", comp: "WRONG_DIAGNOSIS" },
    { label: "Use superglue", desc: "Not biopsy compatible/unsterile", comp: "BOWEL_PERFORATION" }
  ),

  // PHASE 6: CLOSURE & REHAB
  createDecision(31, 6, "Final Lachman Check", "With the graft fixed, you perform an intra-operative Lachman test. What should you feel?",
    { label: "A 'rock hard' end-point with zero anterior translation", desc: "Success indicator" },
    { label: "A soft end-point", desc: "The graft is too loose (Failure)", comp: "WRONG_DIAGNOSIS" },
    { label: "The knee won't move at all", desc: "Graft is too tight or malpositioned (Failure)", comp: "WRONG_DIAGNOSIS" },
    { label: "The bones have shifted", desc: "Indicates fracture or failure", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(32, 6, "Tourniquet Release", "You have been operating for 100 minutes. You release the tourniquet. What do you monitor?",
    { label: "Reperfusion of the foot and checking for any major bleeding (hematoma)", desc: "Ensures vascular integrity" },
    { label: "Just the clock", desc: "Misses clinical indicators of limb health", comp: "NERVE_DAMAGE" },
    { label: "The ceiling", desc: "Non-clinical", comp: "WRONG_DIAGNOSIS" },
    { label: "The patient's hair color", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(33, 6, "ACL Drainage", "Do you place a drain in the knee joint?",
    { label: "No, typically not used as it increases infection risk and doesn't change outcomes", desc: "Standard orthopedic practice" },
    { label: "Yes, to keep the knee empty", desc: "Knee needs synovial fluid; a drain just collects blood", comp: "WRONG_DIAGNOSIS" },
    { label: "Yes, through the patella", desc: "Nonsensical and destructive", comp: "WRONG_INCISION_SITE" },
    { label: "A drain is for cowards", desc: "Inappropriate dogma", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(34, 6, "Portal Closure", "How do you close the 5mm portals?",
    { label: "Simple interrupted nylon sutures or steri-strips", desc: "Small wounds heal well" },
    { label: "Large staples", desc: "Overkill and scars the patient", comp: "WRONG_INCISION_SITE" },
    { label: "Leave them open for air", desc: "Increased risk of synovial fistula or infection", comp: "BOWEL_PERFORATION" },
    { label: "Glue the entire knee with epoxy", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(35, 6, "The Brace", "At what angle do you lock the post-operative knee brace?",
    { label: "Locked in full extension (0 degrees)", desc: "Protects the graft and prevents extension loss" },
    { label: "Locked at 90 degrees", desc: "Will cause permanent joint stiffness", comp: "WRONG_DIAGNOSIS" },
    { label: "Let the patient choose", desc: "Patient needs guided immobilization", comp: "WRONG_DIAGNOSIS" },
    { label: "Don't use a brace", desc: "Standard practice in some places, but risky for fresh reconstruction", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(36, 6, "Cryotherapy", "What is the primary benefit of a 'Game Ready' or polar care machine?",
    { label: "Reduces post-op swelling and decreases opioid use through localized cooling", desc: "Effective post-op pain management" },
    { label: "It heals the ACL faster", desc: "Does not change the biologic healing rate", comp: "WRONG_DIAGNOSIS" },
    { label: "It makes the patient stronger", desc: "Only exercise does that", comp: "WRONG_DIAGNOSIS" },
    { label: "It stops bleeding through the skin", desc: "Tourniquet/closure does that, not the ice", comp: "HEMORRHAGE" }
  ),
  createDecision(37, 6, "Weight Bearing", "What is the standard weight-bearing status for an isolated ACL reconstruction?",
    { label: "Weight-bearing as tolerated (WBAT) with crutches", desc: "Encourages early mobilization" },
    { label: "Non-weight bearing for 6 weeks", desc: "Causes muscle atrophy and weakens the patient", comp: "CARDIAC_INJURY" },
    { label: "Patient must carry their own crutches with their teeth", desc: "Impossible", comp: "WRONG_DIAGNOSIS" },
    { label: "Absolute bed rest", desc: "Extremely high DVT risk", comp: "CARDIAC_INJURY" }
  ),
  createDecision(38, 6, "DVT Prevention", "How do you prevent blood clots in this young, generally healthy patient?",
    { label: "Early mobilization, foot pumps, and sometimes Aspirin 81mg", desc: "Mechanical + mild chemical prevention" },
    { label: "High dose Heparin drip", desc: "Excessive; risks major bleeding for a low-risk patient", comp: "HEMORRHAGE" },
    { label: "Total immobilization", desc: "Literally causes clots", comp: "CARDIAC_INJURY" },
    { label: "Leg elevation only", desc: "Insufficient alone", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(39, 6, "Pain Crisis", "POD 1: The patient calls with severe, 10/10 knee pain despite taking meds. What is the concern?",
    { label: "Arterial injury (Check pulses) or Compartment syndrome (Check sensation/vitals)", desc: "Immediate rule-out of vascular catastrophe" },
    { label: "The patient is a baby", desc: "Unprofessional and ignores clinical danger signs", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal pain", desc: "10/10 pain after surgery always warrants investigation", comp: "NERVE_DAMAGE" },
    { label: "The bandages are too loose", desc: "Usually tightness causes pain, not looseness", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(40, 6, "The 'Cyclops' Check", "6 weeks post-op: The patient cannot fully straighten the knee despite intense PT. What is next?",
    { label: "MRI to check for a Cyclops Lesion and likely return for debridement", desc: "Common secondary surgery required" },
    { label: "Tell them to try harder", desc: "Mechanical obstruction cannot be 'tried' away", comp: "WRONG_DIAGNOSIS" },
    { label: "Break the knee manually", desc: "Risks fracturing the bone or tearing the graft", comp: "WRONG_DIAGNOSIS" },
    { label: "Assume the graft is too long", desc: "Graft too short/malpositioned is more likely for extension loss", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(41, 6, "Return to Sport", "When can this 22y athlete return to full competitive soccer?",
    { label: "9 to 12 months after passing a 'functional return to sport' series", desc: "Safest window for graft ligamentization" },
    { label: "Tomorrow", desc: "Immediate graft failure", comp: "WRONG_DIAGNOSIS" },
    { label: "One month", desc: "Graft is at its weakest point biologicallly", comp: "WRONG_DIAGNOSIS" },
    { label: "Never", desc: "ACL reconstruction is designed to allow return to sport", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(42, 6, "Final Pearl", "What is the most important factor in a successful ACL reconstruction?",
    { label: "Anatomic placement of the tunnels", desc: "The foundation of surgical success" },
    { label: "Using the most expensive screws", desc: "Price does not dictate stability", comp: "WRONG_DIAGNOSIS" },
    { label: "Having a fast surgeon", desc: "Technique beats speed", comp: "WRONG_DIAGNOSIS" },
    { label: "The color of the knee brace", desc: "Non-clinical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(43, 6, "Case Graduation", "The patient is jogging at 4 months with full ROM. What have you demonstrated?",
    { label: "Clinical competence in ligamentous reconstruction and rehab planning", desc: "Goal of the simulation" },
    { label: "How to fix a robot", desc: "This is a human patient", comp: "WRONG_DIAGNOSIS" },
    { label: "The knee is just a hinge", desc: "Oversimplifies complex biomechanics", comp: "WRONG_DIAGNOSIS" },
    { label: "Surgeons are better than physical therapists", desc: "Success requires a collaborative team", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(44, 6, "Post-Op Sensation", "Patient reports numbness on the lateral side of the tibia incision. What is the cause?",
    { label: "Injury to the infrapatellar branch of the saphenous nerve", desc: "Common and usually minor during harvesting" },
    { label: "Brain damage", desc: "Incorrect; this is a localized nerve issue", comp: "NERVE_DAMAGE" },
    { label: "Loss of blood flow", desc: "Would show cold/pale foot, not isolated numbness near incision", comp: "CARDIAC_INJURY" },
    { label: "The patient is lying", desc: "Dismissive of clinical symptoms", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(45, 6, "Infection Signs", "POD 14: The incision is red with a greenish discharge. What is the first action?",
    { label: "Joint aspiration and cultures followed by likely I&D", desc: "Management of post-op septic arthritis" },
    { label: "Apply lotion", desc: "Ineffective against internal infection", comp: "BOWEL_PERFORATION" },
    { label: "Wait and see", desc: "Septic arthritis destroys cartilage in hours", comp: "BOWEL_PERFORATION" },
    { label: "Give oral Tylenol", desc: "Does not treat the infection", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(46, 6, "Graft Strength", "At 3 months, the graft is actually at its weakest. Why?",
    { label: "Ligamentization process where the graft tissue dies back before being repopulated by cells", desc: "Key biologic principle" },
    { label: "The screws dissolve", desc: "Screw dissolution is much slower", comp: "WRONG_DIAGNOSIS" },
    { label: "The patient stops exercising", desc: "Does not explain the biologic strength drop", comp: "WRONG_DIAGNOSIS" },
    { label: "The SALINE in the joint is acidic", desc: "Incorrect", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(47, 6, "The Pivot Shift", "In your 6-month check, a 'Negative Pivot Shift' indicates what?",
    { label: "Successful restoration of rotational stability", desc: "Excellent clinical sign" },
    { label: "The knee is still torn", desc: "A positive test would mean it's still lax", comp: "WRONG_DIAGNOSIS" },
    { label: "The patient is a good dancer", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "Need for a wheelchair", desc: "Inappropriate", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(48, 6, "Clinical Conclusion", "Final case summary: 22yo athlete, anatomic BTB ACL reconstruction, full recovery. Case status?",
    { label: "Case Completed Successfully", desc: "Patient returns to soccer" },
    { label: "Case Failed - Patient becomes an accountant", desc: "Choice of career is not a surgical failure", comp: "WRONG_DIAGNOSIS" },
    { label: "Case Stalled - Surgery never ends", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" },
    { label: "Case Restarted", desc: "Already finished", comp: "WRONG_DIAGNOSIS" }
  )
];

export const PATIENT = {
  name: "Marcus T.",
  age: 22,
  gender: "Male",
  weight: "82 kg",
  bloodType: "O+",
  admission: "Knee injury during soccer, positive Lachman test and anterior drawer test.",
  mood: "Determined",
  comorbidities: ["none"], 
  procedureCategory: "orthopedic"
};

export const PHASES = [
  { id: 1, name: "Evaluation", icon: "🦵", short: "Exam" },
  { id: 2, name: "Access", icon: "🎥", short: "Arthroscopy" },
  { id: 3, name: "Graft Harvesting", icon: "✂️", short: "Graft" },
  { id: 4, name: "Tunnel Drilling", icon: "⚙️", short: "Drilling" },
  { id: 5, name: "Fixation", icon: "🔩", short: "Fixation" },
  { id: 6, name: "Recovery", icon: "🏆", short: "Rehab" },
];

export const aclReconstructionData = { PATIENT, PHASES, DECISIONS };
