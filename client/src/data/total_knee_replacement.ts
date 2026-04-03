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
        { id: "1", label: "Check the tourniquet and inflate if needed", desc: "First-line bloodless field control", correct: true },
        { id: "2", label: "Cauterize the genicular arteries", desc: "Standard hemostasis", correct: true },
        { id: "3", label: "Ignore the oozing bone", desc: "Will cause massive post-op hematoma and stiffness", correct: false }
      ];
    case "NERVE_DAMAGE":
      return [
        { id: "1", label: "Immediately relax the lateral retractor and check peroneal nerve tension", desc: "Reduces traction neuropathy", correct: true },
        { id: "2", label: "Halt the procedure and call for a neurologist", desc: "Too late for intra-op palsy avoidance; fix the traction first", correct: false },
        { id: "3", label: "Flex the knee slightly", desc: "Can reduce tension on the nerve bundle", correct: true }
      ];
    case "WRONG_INCISION_SITE":
      return [
        { id: "1", label: "Re-position the cutting guide and use a spacer block to verify alignment", desc: "Standard correction for mal-alignment", correct: true },
        { id: "2", label: "Leave the bone cut as-is", desc: "Permanent limb mal-alignment and early component failure", correct: false },
        { id: "3", label: "Glue the bone back on", desc: "Impossible for orthopedic stabilization", correct: false }
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
  // PHASE 1: PRE-OP
  createDecision(1, 1, "Radiological Review", "Evelyn's X-rays show bone-on-bone contact in the medial compartment and a 10-degree varus deformity. What does this mean?",
    { label: "Bow-legged alignment with severe osteoarthritis", desc: "Classic TKA indication" },
    { label: "Knock-kneed alignment", desc: "Valgus deformity is knock-kneed; she has varus", comp: "WRONG_DIAGNOSIS" },
    { label: "Normal joint space", desc: "Bone-on-bone contact means loss of joint space", comp: "WRONG_DIAGNOSIS" },
    { label: "A bone tumor", desc: "Not supported by standard OA findings", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(2, 1, "Template Planning", "Using digital templates, you see that her femoral size is likely a #5. Why is template sizing important?",
    { label: "To anticipate the equipment needs and identify potential bone loss or unusual anatomy", desc: "Standard pre-op planning step" },
    { label: "To see if she needs a new heart", desc: "Irrelevant", comp: "CARDIAC_INJURY" },
    { label: "To choose the color of the sutures", desc: "Sutures aren't templated", comp: "WRONG_DIAGNOSIS" },
    { label: "It's just a guess", desc: "It should be an informed clinical estimate", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(3, 1, "Consent Discussion", "You must mention the risk of 'Peroneal Nerve Palsy'. What is a symptom of this?",
    { label: "Foot drop and numbness on the top of the foot", desc: "Caused by traction on the peroneal nerve during deformity correction" },
    { label: "Blindness", desc: "Not a peroneal nerve function", comp: "NERVE_DAMAGE" },
    { label: "Loss of hearing", desc: "Irrelevant", comp: "NERVE_DAMAGE" },
    { label: "Shoulder pain", desc: "Anatomically disconnected", comp: "NERVE_DAMAGE" }
  ),
  createDecision(4, 1, "Antibiotics Choice", "Which antibiotic is the standard of care for a primary TKR?",
    { label: "Cefazolin (Ancef) given within 60 minutes of incision", desc: "Gold standard for orthopedic prophylaxis" },
    { label: "Penicillin tablets orally", desc: "Insufficient tissue concentration", comp: "BOWEL_PERFORATION" },
    { label: "Topical alcohol", desc: "Cannot prevent deep infection", comp: "BOWEL_PERFORATION" },
    { label: "Strong Morphine", desc: "Not an antibiotic", comp: "ANESTHESIA_OVERDOSE" }
  ),
  createDecision(5, 1, "Pre-Op Range of Motion", "Evelyn cannot fully straighten her knee (Fixed Flexion Deformity). How does this affect your plan?",
    { label: "Requires specific bone cuts (distal femoral resection) to restore full extension", desc: "Essential for functional success" },
    { label: "The surgery will fix it automatically", desc: "Wait; specific steps are needed to address the deformity", comp: "WRONG_DIAGNOSIS" },
    { label: "It doesn't matter", desc: "Range of motion is the primary goal of the procedure", comp: "WRONG_DIAGNOSIS" },
    { label: "She needs more rest", desc: "Rest won't fix a mechanical deformity", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 2: EXPOSURE
  createDecision(6, 2, "Skin Incision", "What is the standard skin incision for a TKR?",
    { label: "Longitudinal midline incision over the patella", desc: "Versatile and heals well" },
    { label: "Horizontal (Transverse)", desc: "Does not allow adequate visualization for TKR", comp: "WRONG_INCISION_SITE" },
    { label: "Spiral incision", desc: "Destructive to the blood supply", comp: "WRONG_INCISION_SITE" },
    { label: "Behind the knee", desc: "Reserved for specific vascular cases, not TKR", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(7, 2, "Deep Approach", "The 'Medial Parapatellar' approach involves cutting which structure?",
    { label: "The medial retinaculum and the vastus medialis obliquus (VMO) tendon", desc: "Standard deep entry" },
    { label: "The Patellar Tendon", desc: "NEVER cut this (Fail)", comp: "WRONG_INCISION_SITE" },
    { label: "The Popliteal Artery", desc: "Fatal (Fail)", comp: "HEMORRHAGE" },
    { label: "The Femur Bone", desc: "Bone is cut later, not for the approach", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(8, 2, "Patella Eversion", "You are everting the patella (flipping it over). It feels very tight. What is the priority?",
    { label: "Careful 'sub-periosteal' dissection of the lateral gutters and possible lateral release", desc: "Prevents patellar tendon rupture" },
    { label: "Pull as hard as possible", desc: "Risks immediate patellar tendon avulsion (Fail)", comp: "WRONG_INCISION_SITE" },
    { label: "Cut the patella in half", desc: "Destructive", comp: "WRONG_INCISION_SITE" },
    { label: "Close the skin", desc: "Premature", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(9, 2, "Synovectomy", "You see significant inflammatory tissue (pannus) in the joint. What do you do?",
    { label: "Perform a sub-total synovectomy", desc: "Reduces post-op inflammation and bleeding" },
    { label: "Leave it alone", desc: "Increases risk of post-op swelling and pain", comp: "WRONG_DIAGNOSIS" },
    { label: "Burn it all with fire", desc: "Thermal injury to bone/cartilage", comp: "HEMORRHAGE" },
    { label: "Drink the synovial fluid", desc: "Grossly unprofessional", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(10, 2, "Osteophyte Removal", "Large bone spurs (osteophytes) are visible around the femur. Why remove them?",
    { label: "They block the cutting guides and cause ligamentous imbalance", desc: "Critical for accurate alignment" },
    { label: "For the patient to keep as a souvenir", desc: "Non-clinical", comp: "WRONG_DIAGNOSIS" },
    { label: "They are soft", desc: "Osteophytes are hard bone", comp: "WRONG_DIAGNOSIS" },
    { label: "To make the surgery longer", desc: "Inappropriate", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 3: BONE PREPARATION
  createDecision(11, 3, "Intramedullary Rod (IM Rod)", "You insert the IM rod into the femur bone. Where is the entry point?",
    { label: "Ideally 1cm superior to the PCL origin in the midline of the notch", desc: "Sets the reference for the femoral cuts" },
    { label: "Directly into the hip joint", desc: "Too high", comp: "WRONG_INCISION_SITE" },
    { label: "Out the side of the thigh", desc: "Breaches the cortex", comp: "HEMORRHAGE" },
    { label: "Through the kneecap", desc: "Obstructs access", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(12, 3, "Femoral Valgus Angle", "What is the standard 'valgus cut' angle set on the femoral guide for most patients?",
    { label: "5 to 7 degrees", desc: "Compensates for the anatomic axis difference" },
    { label: "90 degrees", desc: "Destroys the limb alignment", comp: "WRONG_INCISION_SITE" },
    { label: "0 degrees", desc: "Leaves the patient in varus (bow-legged)", comp: "WRONG_DIAGNOSIS" },
    { label: "30 degrees", desc: "Severe mal-alignment", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(13, 3, "Distal Femoral Cut", "The cutting block is pinned. How do you protect the skin from the saw blade?",
    { label: "Use a wide retractor (e.g. Army-Navy or Senn) and maintain clear visualization", desc: "Standard saw safety" },
    { label: "Don't use a saw, use a hammer", desc: "Too imprecise for bone cuts", comp: "WRONG_DIAGNOSIS" },
    { label: "Saw blindly", desc: "Will cut the skin or surgical assistants", comp: "HEMORRHAGE" },
    { label: "Close your eyes", desc: "Fatal negligence", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(14, 3, "Tibial Resection", "What is the priority for the tibial cut in a varus knee?",
    { label: "Removing less bone on the medial (shorter) side and more on the lateral side to level the joint", desc: "Standard deformity correction" },
    { label: "Removing 20cm of bone", desc: "Leg length discrepancy", comp: "WRONG_INCISION_SITE" },
    { label: "Cutting the tibia at an angle", desc: "Requires precise level cut", comp: "WRONG_DIAGNOSIS" },
    { label: "Not cutting the tibia", desc: "TKR requires both surfaces be managed", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(15, 3, "Soft Tissue Balancing", "After the bone cuts, the medial side is still too tight (varus). What is the next step?",
    { label: "Perform a sequential medial release of the MCL fibers from the tibia", desc: "Balances the joint space" },
    { label: "Cut more lateral bone", desc: "Will not fix the medial tightness", comp: "WRONG_DIAGNOSIS" },
    { label: "Snap the medial ligament", desc: "Destabilizes the knee permanently", comp: "WRONG_INCISION_SITE" },
    { label: "Hope it stretches with exercise", desc: "Intra-op balance is critical", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 4: COMPONENT TRIALS
  createDecision(16, 4, "Selecting Trial Size", "The trials are placed. How do you check for the correct 'femoral rotation'?",
    { label: "Parallel to the transepicondylar axis and perpendicular to Whiteside's line", desc: "Crucial for patellar tracking" },
    { label: "By eyeballing the skin", desc: "Inaccurate", comp: "WRONG_DIAGNOSIS" },
    { label: "Using a compass", desc: "Non-standard", comp: "WRONG_DIAGNOSIS" },
    { label: "Checking the patient's shoes", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(17, 4, "Patellar Tracking", "With the trials in, you flex the knee. The patella 'tilts' laterally. What do you do?",
    { label: "Perform a lateral retinacular release (from the inside)", desc: "Improves patellar track and reduces wear" },
    { label: "Yank it back medial by hand", desc: "Will tilt back laterally once released", comp: "WRONG_DIAGNOSIS" },
    { label: "Remove the patella", desc: "Permanent extensor dysfunction", comp: "WRONG_INCISION_SITE" },
    { label: "Glue the patella to the femur", desc: "Knee will not move", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(18, 4, "Extension Gap check", "The knee won't fully straighten with the 10mm trial spacer. What is the diagnosis?",
    { label: "Tight extension gap; requires either more femoral bone cut or a smaller spacer", desc: "Mechanical holdup identification" },
    { label: "The patient is awake", desc: "Anesthesia monitors this", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "The spacers are made of lead", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "The knee is happy", desc: "Non-clinical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(19, 4, "The 'Popliteus' Shadow", "You see a pulsating shadow at the back of the knee. What structure is this?",
    { label: "Popliteal Artery", desc: "CRITICAL: Do not saw or drill near this (Fail if hit)" },
    { label: "A ghost", desc: "Inappropriate", comp: "WRONG_DIAGNOSIS" },
    { label: "Venous oozing", desc: "Does not pulsate", comp: "HEMORRHAGE" },
    { label: "Water", desc: "Does not pulsate", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(20, 4, "Stability Check", "You apply a 'varus stress' at full extension. The joint opens 5mm laterally. Is this okay?",
    { label: "No, the joint should be stable in full extension; check for lateral ligament injury", desc: "Failure of stability" },
    { label: "Yes, 5mm is fine", desc: "Too much laxity in extension is unstable", comp: "WRONG_DIAGNOSIS" },
    { label: "It's perfect", desc: "Laxity in extension is a problem", comp: "WRONG_DIAGNOSIS" },
    { label: "The patient will adapt", desc: "Patient will have instability and pain", comp: "WRONG_DIAGNOSIS" }
  ),

  // PHASE 5: CEMENTING & PLACEMENT
  createDecision(21, 5, "Bone Washing", "Before cementing, you use a pulse-lavage system (squirt gun). Why?",
    { label: "To remove blood, fat, and bone marrow for better cement penetration (interdigitation)", desc: "Essential for long-term implant survival" },
    { label: "To clean the room", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "To cool the patient down", desc: "Can actually cause hypothermia if cold saline is used excessively", comp: "WRONG_DIAGNOSIS" },
    { label: "For fun", desc: "Non-clinical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(22, 5, "Cement Mixing", "The nurse begins mixing the PMMA bone cement. It is 'sticky' and strings to your glove. Is it ready?",
    { label: "No, wait for the 'doughy' phase where it no longer sticks to the glove", desc: "Optimal time for hand-packing" },
    { label: "Yes, use it now", desc: "Premature; cement will not hold shape well", comp: "WRONG_DIAGNOSIS" },
    { label: "Throw it away", desc: "Expensive; just wait a few more seconds", comp: "WRONG_DIAGNOSIS" },
    { label: "Add water to speed it up", desc: "Will destroy the chemical set", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(23, 5, "Antibiotic Cement", "Why is it common to add Vancomycin or Tobramycin powder to the cement?",
    { label: "To provide localized high-dose antibiotic coverage directly at the implant site", desc: "Prevents periprosthetic joint infection (PJI)" },
    { label: "To make the cement stronger", desc: "Actually weakens the cement slightly, but for a positive benefit", comp: "WRONG_DIAGNOSIS" },
    { label: "To change the color", desc: "Secondary", comp: "WRONG_DIAGNOSIS" },
    { label: "It's a secret ingredient", desc: "Non-clinical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(24, 5, "Tibial Baseplate Placement", "You seat the tibial component. What is the critical reference for its rotation?",
    { label: "Align with the medial third of the tibial tubercle", desc: "Ensures correct rotational alignment with the foot" },
    { label: "Align with the little toe", desc: "Foot can pivot independently", comp: "WRONG_INCISION_SITE" },
    { label: "Align with the belly button", desc: "Anatomically disconnected", comp: "WRONG_INCISION_SITE" },
    { label: "No reference, just push it on", desc: "Leads to stiffness and patellar pain", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(25, 5, "The Cement Squeeze", "Excess cement is squeezing out of the edges. What do you do?",
    { label: "Carefully remove all loose cement before it hardens", desc: "Prevents loose bodies and abrasive wear" },
    { label: "Leaf it there as extra support", desc: "Loose bits of hard cement act like sandpaper in the joint", comp: "WRONG_DIAGNOSIS" },
    { label: "Suck it into the suction", desc: "Will clog the suction line for good", comp: "WRONG_DIAGNOSIS" },
    { label: "Push it deeper into the bone", desc: "Ineffective", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(26, 5, "Leg Holding during Setting", "While the cement hardens (10-12 minutes), how should the leg be held?",
    { label: "In full extension with constant axial pressure", desc: "Ensures maximum compression and correct alignment" },
    { label: "Moving it around to test it", desc: "Disrupts the cement bond during its critical setting phase", comp: "WRONG_DIAGNOSIS" },
    { label: "Let the patient hold it", desc: "Patient is asleep", comp: "ANESTHESIA_UNDERDOSE" },
    { label: "In 90 degrees flexion", desc: "Can lead to cement pooling in the posterior joint", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(27, 5, "Patellar Resurfacing", "The patella is severely arthritic. How much bone should remain after the cut?",
    { label: "At least 12mm to 15mm of patellar thickness", desc: "Prevents patellar fracture" },
    { label: "0.5mm", desc: "Will fracture immediately", comp: "WRONG_INCISION_SITE" },
    { label: "100mm", desc: "Patella is not that thick normally", comp: "WRONG_DIAGNOSIS" },
    { label: "Remove the whole patella", desc: "Permanent loss of function", comp: "WRONG_INCISION_SITE" }
  ),

  // PHASE 6: FINALIZATION
  createDecision(28, 6, "Final ROM Check", "The components are in. What is the target range of motion before closing?",
    { label: "0 degrees (full extension) to 120+ degrees (flexion)", desc: "High-quality outcome" },
    { label: "45 degrees only", desc: "A failure of the surgery", comp: "WRONG_DIAGNOSIS" },
    { label: "The knee shouldn't move at all", desc: "Wait; it's a joint", comp: "WRONG_DIAGNOSIS" },
    { label: "It should only move sideways", desc: "Wrong joint mechanics", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(29, 6, "Hemostasis (Tourniquet Release)", "The tourniquet is released after 90 minutes. You see heavy oozing from the back of the knee. Action?",
    { label: "Check for backwall injury and use cautery or pressure", desc: "Manages post-tourniquet bleeding" },
    { label: "Ignore it and close quickly", desc: "Will form a massive hematoma that requires re-operation", comp: "HEMORRHAGE" },
    { label: "Tell the patient to be calm", desc: "Patient is asleep", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Turn the tourniquet back on and never leave the room", desc: "Impossible", comp: "CARDIAC_INJURY" }
  ),
  createDecision(30, 6, "Wound Closure: Deep Layer", "Which layer is closed first after hemostasis?",
    { label: "The medial parapatellar arthrotomy (retinaculum)", desc: "Restores the extensor mechanism" },
    { label: "The skin only", desc: "Will result in a deep space infection and dehiscence", comp: "BOWEL_PERFORATION" },
    { label: "The bone", desc: "Bone is already capped by the implant", comp: "WRONG_DIAGNOSIS" },
    { label: "The muscle in the hip", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(31, 6, "Local Anesthetic Infiltration (LIA)", "Where do you inject the cocktail of Marcaine, Morphine, and Epinephrine?",
    { label: "Deep into the joint capsule, patellar fat pad, and subcutaneous tissues", desc: "Significantly reduces post-op pain" },
    { label: "Only into the air", desc: "Ineffective", comp: "WRONG_DIAGNOSIS" },
    { label: "Into the artery", desc: "Fatal (Fail)", comp: "CARDIAC_INJURY" },
    { label: "Into the bone marrow", desc: "Ineffective", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(32, 6, "Staples vs Sutures", "The skin is long. Many surgeons use staples for speed. What is the risk?",
    { label: "Occasionally less comfortable for the patient to remove and slightly higher SSI risk compared to glue", desc: "Standard clinical debate" },
    { label: "Staples will melt", desc: "Staples are metal; they don't melt at body temp", comp: "WRONG_DIAGNOSIS" },
    { label: "Staples will zap the patient", desc: "They are non-conductive if high quality stainless", comp: "WRONG_DIAGNOSIS" },
    { label: "Staples are the only way", desc: "Many alternatives exist (Glue, Subcuticular)", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(33, 6, "Post-Op X-rays", "Evelyn is in the recovery room. PACU X-rays show a small gap in the lateral joint space. Is this normal?",
    { label: "Yes, this is typical as the plastic insert is translucent on X-ray and creates a gap appearance", desc: "Standard radiological interpretation" },
    { label: "No, the knee is falling apart", desc: "Wait; interpret the translucent plastic first", comp: "WRONG_DIAGNOSIS" },
    { label: "No, the patient had a stroke", desc: "X-ray doesn't monitor for stroke", comp: "CARDIAC_INJURY" },
    { label: "Yes, she should have a gap", desc: "Correct, but need to understand the 'plastic' reason why", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(34, 6, "Ambulation", "When can Evelyn begin walking with physical therapy?",
    { label: "Same day (POD 0) or early Day 1", desc: "Ensures best outcomes and prevents clots" },
    { label: "In 3 months", desc: "Will result in total joint stiffness (Arthrofibrosis)", comp: "WRONG_DIAGNOSIS" },
    { label: "Only in a wheelchair", desc: "Goal is return to independent walking", comp: "WRONG_DIAGNOSIS" },
    { label: "Never", desc: "Counter-productive", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(35, 6, "CPM Machine", "Is a Continuous Passive Motion (CPM) machine mandatory?",
    { label: "No longer considered mandatory; early active mobilization is more effective", desc: "Modern orthopedic shift" },
    { label: "Yes, it must run at 100% speed", desc: "Would be traumatic", comp: "WRONG_DIAGNOSIS" },
    { label: "It is for cowards", desc: "Inappropriate dogma", comp: "WRONG_DIAGNOSIS" },
    { label: "It heals the bone", desc: "It only moves the joint; bone heals through stability", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(36, 6, "DVT Prevention", "Evelyn is 68y. What is the standard DVT prophylaxis?",
    { label: "Sequential Compression Devices (SCDs) and often Aspirin 81mg or Xarelto", desc: "Standard prevention" },
    { label: "Absolute bed rest", desc: "Causes DVT (Fail)", comp: "CARDIAC_INJURY" },
    { label: "No fluids", desc: "Dehydration increases clot risk", comp: "WRONG_DIAGNOSIS" },
    { label: "Dancing", desc: "Too soon", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(37, 6, "Post-Op Fever", "POD 2: 101.4 Fever. Action?",
    { label: "Check for atelectasis and order incentive spirometry", desc: "Most common post-op causes" },
    { label: "Amputate the leg", desc: "Excessive", comp: "WRONG_INCISION_SITE" },
    { label: "Tell her to be quiet", desc: "Unprofessional and medically dangerous", comp: "WRONG_DIAGNOSIS" },
    { label: "Ice cream", desc: "Patient comfort, not clinical management", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(38, 6, "Pain Control", "She is having severe 'breakthrough' pain. Do you increase the Morphine?",
    { label: "Try ice/elevation and add regional blocks like Adductor Canal first", desc: "Modern multi-modal approach" },
    { label: "Yes, quadruple the dose", desc: "Risks respiratory depression", comp: "ANESTHESIA_OVERDOSE" },
    { label: "Tell her pain is expected", desc: "Dismissive; management is required", comp: "WRONG_DIAGNOSIS" },
    { label: "Remove the implants", desc: "Implants aren't causing acute post-op 10/10 pain", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(39, 6, "Discharge Planning", "Where do most TKR patients go for recovery today?",
    { label: "Home with outpatient physical therapy", desc: "Modern standard for primary TKR" },
    { label: "A skilled nursing facility for 6 months", desc: "Excessive and increases infection risk for healthy patients", comp: "WRONG_DIAGNOSIS" },
    { label: "The morgue", desc: "Inappropriate", comp: "CARDIAC_INJURY" },
    { label: "A luxury hotel", desc: "Non-clinical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(40, 6, "Wound Drain Removal", "If a drain was used, when is it usually removed?",
    { label: "POD 1 once output is low (<100ml/24h)", desc: "Standard timing" },
    { label: "After a month", desc: "Infection/Fistula risk", comp: "BOWEL_PERFORATION" },
    { label: "Pull it out immediately while they are wake", desc: "Can be painful but Day 1 is better than Day 0", comp: "WRONG_DIAGNOSIS" },
    { label: "Never remove it", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(41, 6, "Late Complication: PJI", "Evelyn visits 2 years later. Joint is red/swollen. Fever 102. Action?",
    { label: "Joint aspiration and cultures for suspected Periprosthetic Joint Infection", desc: "Standard diagnostic baseline" },
    { label: "Apply a band-aid", desc: "Ineffective for deep infection", comp: "BOWEL_PERFORATION" },
    { label: "Wait and see", desc: "Will destroy the bone-implant interface", comp: "WRONG_DIAGNOSIS" },
    { label: "Rub dirt on it", desc: "Clinical negligence", comp: "BOWEL_PERFORATION" }
  ),
  createDecision(42, 6, "The 'Final Call'", "Case status: Evelyn W., TKR complete. Alignment: Neutral. ROM: 0-115. Case ranking?",
    { label: "Case Completed Successfully", desc: "A top-tier orthopedic result" },
    { label: "Case Failed - Leg is too long", desc: "Wait; check measurement first; usually success if stats match", comp: "WRONG_DIAGNOSIS" },
    { label: "Case Stalled - Surgery never ends", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" },
    { label: "Case Deleted", desc: "Incorrect", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(43, 6, "Clinical Pearl: Patellar tracking", "What was the single most important factor for her post-op knee-cap comfort?",
    { label: "External rotation of the femoral component and a lateral release if needed", desc: "The foundation of patellar tracking" },
    { label: "The brand of oxygen used", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "The number of screws in her room", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" },
    { label: "The carpet color in the hall", desc: "Irrelevant", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(44, 6, "Stiffness Management", "Six weeks later, Evelyn cannot bend past 70 degrees. This is 'Stiffness'. What is the plan?",
    { label: "Manipulation Under Anesthesia (MUA)", desc: "Standard forceful manipulation to break adhesions" },
    { label: "Give up", desc: "Patient deserves a functional result", comp: "WRONG_DIAGNOSIS" },
    { label: "Cut the leg off", desc: "Absolute surgical catastrophe", comp: "WRONG_INCISION_SITE" },
    { label: "More ice", desc: "Ice helps swelling but won't break 70-degree hardware-stiffness alone", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(45, 6, "Metal Sensitivity", "She notices a rash over the metal area. What is the likely metal she is sensitive to?",
    { label: "Nickel (Found in Cobalt-Chrome alloys)", desc: "Common metal allergy" },
    { label: "Gold", desc: "Not used in standard TKR", comp: "WRONG_DIAGNOSIS" },
    { label: "Copper", desc: "Not used in standard TKR", comp: "WRONG_DIAGNOSIS" },
    { label: "Aluminum", desc: "Usually found in instruments, not the implant itself", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(46, 6, "Gait Training", "How does TKR change her walking long-term?",
    { label: "Restores normal mechanical axis and allows pain-free weight-bearing", desc: "The primary success metric" },
    { label: "Makes her walk like a duck", desc: "Inappropriate", comp: "WRONG_DIAGNOSIS" },
    { label: "She will never walk again", desc: "The point was to make her walk *better*", comp: "WRONG_DIAGNOSIS" },
    { label: "She will jump higher", desc: "Usually focus is on walking, not jumping", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(47, 6, "Revision TKR", "If this TKR fails in 15 years, what is that called?",
    { label: "Revision Total Knee Arthroplasty", desc: "More complex surgery involving removal of original hardware" },
    { label: "Surgery 2: Electric Boogaloo", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" },
    { label: "A total success", desc: "Failure requires revision; therefore not success", comp: "WRONG_DIAGNOSIS" },
    { label: "The end of her life", desc: "Inappropriate", comp: "CARDIAC_INJURY" }
  ),
  createDecision(48, 6, "Final Scrubber Out", "Final check: Evelyn is home, walking 2 blocks, and pain is 2/10. What have you demonstrated?",
    { label: "Mastery of primary arthroplasty techniques and management", desc: "Final verification" },
    { label: "How to fix a toaster", desc: "Inappropriate", comp: "WRONG_DIAGNOSIS" },
    { label: "TKR is a simple plumbing job", desc: "Dismisses biological complexity", comp: "WRONG_DIAGNOSIS" },
    { label: "Case failed", desc: "Patient is walking and pain-free", comp: "WRONG_DIAGNOSIS" }
  ),
  // Additional decisions to reach 55
  createDecision(49, 6, "Polyethylene Wear", "What is the plastic insert made of?",
    { label: "Ultra-High-Molecular-Weight Polyethylene (UHMWPE)", desc: "Highly durable material for articulating surfaces" },
    { label: "Standard Legos", desc: "Non-medical grade and brittle", comp: "WRONG_DIAGNOSIS" },
    { label: "Glass", desc: "Will shatter immediately", comp: "WRONG_DIAGNOSIS" },
    { label: "Rubber", desc: "Too soft for bone-on-bone loading", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(50, 6, "Patellar Sizing", "The patellar button is too large and 'overhangs' the bone. What's the problem?",
    { label: "Causes impingement and lateral soft tissue pain", desc: "Mechanical misfit" },
    { label: "Makes it look premium", desc: "Function first", comp: "WRONG_DIAGNOSIS" },
    { label: "Protects the bone", desc: "Actually irritates the tissue", comp: "WRONG_DIAGNOSIS" },
    { label: "Nothing", desc: "It is a complication", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(51, 6, "Screw Fixation in Tibia", "Is a screw in the tibial baseplate mandatory?",
    { label: "Optional; depends on bone quality and implant type (cemented vs cementless)", desc: "Surgical judgment call" },
    { label: "Yes, at least 50 screws", desc: "Would destroy the tibia bone", comp: "WRONG_INCISION_SITE" },
    { label: "Never", desc: "Many revision or primary systems allow for optional screws", comp: "WRONG_DIAGNOSIS" },
    { label: "Only if the patient is tall", desc: "Depends on stability, not height", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(52, 6, "Popliteal Artery Check", "You feel the foot after the surgery. It is cold and pulseless. What happened?",
    { label: "Popliteal Artery Injury or Vasospasm during the procedure", desc: "Immediate vascular emergency" },
    { label: "She's just cold from the AC", desc: "Pulselessness is NEVER normal", comp: "CARDIAC_INJURY" },
    { label: "The foot is sleeping", desc: "Dismissive and dangerous", comp: "NERVE_DAMAGE" },
    { label: "She has thick socks", desc: "Check pulses regardless", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(53, 6, "Wound Tension", "The skin is too tight during closure. What do you do?",
    { label: "Use deep tension-relieving sutures or adjust the knee angle (flexion) for closure", desc: "Prevents wound dehiscence" },
    { label: "Pull as hard as possible", desc: "Skin will die from ischemia", comp: "WRONG_INCISION_SITE" },
    { label: "Ignore the tension", desc: "Wound will pop open POD 5", comp: "WRONG_INCISION_SITE" },
    { label: "Cut more skin off", desc: "Worsens the tension", comp: "WRONG_INCISION_SITE" }
  ),
  createDecision(54, 6, "Final Score", "Case ranking: Resident Level Achievement.",
    { label: "Case Completed Successfully", desc: "Patient is back to gardening" },
    { label: "Try again", desc: "Already success", comp: "WRONG_DIAGNOSIS" },
    { label: "Abort", desc: "Too late", comp: "WRONG_DIAGNOSIS" },
    { label: "N/A", desc: "Incorrect", comp: "WRONG_DIAGNOSIS" }
  ),
  createDecision(55, 6, "The End", "Scrubbing out. Take-away?",
    { label: "Precision in bone cuts and soft tissue balance is key", desc: "Final conclusion" },
    { label: "Hammering is the only skill needed", desc: "Undermines alignment science", comp: "WRONG_DIAGNOSIS" },
    { label: "Patients are optional", desc: "Nonsensical", comp: "WRONG_DIAGNOSIS" },
    { label: "Case deleted", desc: "Already finished", comp: "WRONG_DIAGNOSIS" }
  )
];

export const PATIENT = {
  name: "Evelyn W.",
  age: 68,
  gender: "Female",
  weight: "74 kg",
  bloodType: "A-",
  admission: "Severe right knee osteoarthritis, bone-on-bone medial joint space, failed conservative physical therapy.",
  mood: "Determined to walk again",
  comorbidities: ["hypertension", "diabetes"], 
  procedureCategory: "orthopedic"
};

export const PHASES = [
  { id: 1, name: "Consultation", icon: "📐", short: "Template" },
  { id: 2, name: "Approach", icon: "🔪", short: "Entry" },
  { id: 3, name: "Osteotomy", icon: "🪚", short: "Cuts" },
  { id: 4, name: "Trialing", icon: "👟", short: "Sizing" },
  { id: 5, name: "Fixation", icon: "🧱", short: "Cement" },
  { id: 6, name: "Closure", icon: "🪡", short: "Closing" },
];

export const totalKneeReplacementData = { PATIENT, PHASES, DECISIONS };
