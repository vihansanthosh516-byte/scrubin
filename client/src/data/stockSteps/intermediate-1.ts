// ─────────────────────────────────────────────────────────────────────────────
// Intermediate surgery step banks (1 of 2) — 30-40 science-based steps each.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProcedureBank } from "./stepBuilder";

export const INTERMEDIATE_BANKS_1: ProcedureBank[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // CHOLECYSTECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "cholecystectomy",
    spec: {
      approach: "four-port laparoscopic access with the patient supine or split-leg",
      wrongApproaches: ["a single midline laparotomy", "a right flank retroperitoneal approach"],
      landmark: "the cystic duct and cystic artery at Calot's triangle",
      wrongLandmarks: ["the common bile duct", "the gastroduodenal artery"],
      vessel: "the cystic artery",
      wrongVessels: ["the right hepatic artery", "the portal vein"],
      nerve: "the structures of the hepatoduodenal ligament",
      wrongNerves: ["the phrenic nerve", "the vagus nerve"],
      structure: "the gallbladder and the critical view of safety",
      wrongStructures: ["the duodenum", "the transverse colon"],
      test: "the critical view of safety before clipping",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["infection", "hemorrhage", "hypoxia", "nerve_injury"],
      instrument: "a 30° laparoscope and clip applier",
      position: "supine with the right upper quadrant exposed",
      wrongPositions: ["prone", "left lateral decubitus"],
      detail: "42-year-old, Murphy's sign positive, gallstones, obese",
    },
    steps: [
      { kind: "preop", title: "Confirm the indication", description: "Review the ultrasound findings and the Murphy's sign before induction." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Give prophylaxis within 60 minutes of incision." },
      { kind: "position", title: "Position and prep", description: "Supine with the right upper quadrant and umbilicus exposed." },
      {
        kind: "access", title: "Establish pneumoperitoneum", description: "Gain safe peritoneal access for the laparoscope.",
        choices: [
          "Insert the Veress needle at the umbilicus and confirm low-pressure insufflation before entry.",
          "Blindly insert the first trocar with maximum force to speed access.",
          "Insufflate to high pressure immediately to maximize working space.",
        ],
        feedback: [
          "Access is confirmed safe before the first trocar is placed.",
          "Blind forceful trocar entry risks major vessel or bowel injury.",
          "Excessive pressure compromises venous return and ventilation.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      { kind: "exposure", title: "Place the working ports", description: "Position the ports to triangulate on the gallbladder.", f: { structure: "the gallbladder", landmark: "the subcostal line" } },
      { kind: "landmark", title: "Identify the gallbladder", description: "The fundus must be clearly identified before retraction.", f: { landmark: "the gallbladder fundus and liver edge", wrongLandmarks: ["the hepatic flexure", "the stomach"] } },
      {
        kind: "dissect", title: "Retract the fundus and infundibulum", description: "Set up the exposure of Calot's triangle.",
        choices: [
          "Retract the fundus cephalad and the infundibulum laterally to open Calot's triangle.",
          "Retract the gallbladder toward the liver and pull the duodenum down.",
          "Grasp the gallbladder wall firmly and pull it out of the liver bed.",
        ],
        feedback: [
          "The dual retraction opens the triangle and aligns the cystic duct with the CBD.",
          "That retraction collapses the triangle and obscures the ductal anatomy.",
          "Pulling the wall tears the gallbladder and spills bile and stones.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "dissect", title: "Clear the triangle of fat", description: "Expose the cystic duct and artery.",
        choices: [
          "Dissect the peritoneum and fat of Calot's triangle with blunt hooks and minimal cautery.",
          "Sweep the fat away aggressively with the suction tip.",
          "Cauterize broadly across the triangle to clear the tissue.",
        ],
        feedback: [
          "The triangle is cleared, exposing both duct and artery.",
          "Aggressive sweeping can strip the tissue off the CBD.",
          "Broad cautery in the triangle risks thermal injury to the duct.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "landmark", title: "Achieve the critical view of safety", description: "Two structures must be seen entering the gallbladder.",
        choices: [
          "Expose the lower third of the gallbladder so only the cystic duct and artery enter it.",
          "Stop once the cystic duct is visible, even if the artery is buried.",
          "Clip the first tubular structure you can identify confidently.",
        ],
        feedback: [
          "The critical view confirms only two structures enter the gallbladder — safe to clip.",
          "Clipping with the artery unidentified risks mistaking the CBD for the duct.",
          "Clipping before the critical view is the classic cause of CBD injury.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "vessel", title: "Clip and divide the cystic artery", description: "Control the artery before the duct.",
        choices: [
          "Clip the cystic artery close to the gallbladder and divide it.",
          "Clip the right hepatic artery where it crosses the triangle.",
          "Divide the artery with cautery and observe for bleeding.",
        ],
        feedback: [
          "The cystic artery is controlled at the gallbladder — the correct site.",
          "Clipping the right hepatic artery devascularizes part of the liver.",
          "Cautery division of an artery invites delayed hemorrhage.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vessel", title: "Clip and divide the cystic duct", description: "Secure the duct at the gallbladder side.",
        choices: [
          "Clip the cystic duct near the gallbladder, leaving a margin from the CBD, then divide it.",
          "Clip the duct flush with the common bile duct to avoid a stump.",
          "Tie the duct with a suture ligature close to the CBD.",
        ],
        feedback: [
          "The duct is divided with a safe margin from the CBD.",
          "Clipping flush with the CBD risks narrowing or injuring it.",
          "Suture ligation near the CBD risks catching its wall.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Dissect the gallbladder off the liver bed", description: "Remove the gallbladder from the liver.",
        choices: [
          "Dissect the gallbladder off the liver bed in the avascular plane with cautery.",
          "Pull the gallbladder sharply off the liver to speed the removal.",
          "Dissect deep into the liver parenchyma to ensure complete removal.",
        ],
        feedback: [
          "The avascular plane is followed; the liver bed stays dry.",
          "Sharp avulsion tears the liver bed and causes bleeding.",
          "Deep dissection into the liver risks major venous bleeding and bile leak.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "bleed", title: "Control liver bed bleeding", description: "Venous oozing from the bed is obscuring the field.",
        choices: [
          "Apply pressure, then control the point with targeted cautery or a hemostatic agent.",
          "Cauterize the entire liver bed broadly.",
          "Place clips across the liver bed blindly.",
        ],
        feedback: [
          "The bed is controlled with minimal thermal spread.",
          "Broad cautery risks deep hepatic necrosis and delayed bleeding.",
          "Blind clipping risks the middle hepatic vein.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "verify", title: "Check for bile leak", description: "Inspect the clips and the bed for bile before removal.",
        choices: [
          "Inspect the cystic duct stump and liver bed for bile staining; irrigate and re-check.",
          "Trust the clips and remove the specimen immediately.",
          "Run a cholangiogram through the cystic duct stump as routine.",
        ],
        feedback: [
          "The field is dry and bile-free — safe to remove the specimen.",
          "A missed bile leak will present as postoperative biloma.",
          "Routine cholangiography is not indicated in every case.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "exposure", title: "Extract the gallbladder", description: "Deliver the specimen through the umbilical port.", f: { structure: "the gallbladder specimen", landmark: "the umbilical port site" } },
      { kind: "verify", title: "Inspect the clips under tension", description: "Re-inflate the abdomen and check the clips under tension.", f: { test: "the cystic duct and artery clips under pneumoperitoneum", wrongTests: ["a routine cholangiogram", "an on-table MRI"] } },
      { kind: "exposure", title: "Check the liver bed once more", description: "Re-inspect the bed for delayed oozing before final closure.", f: { structure: "the liver bed", landmark: "the middle hepatic vein plane" } },
      { kind: "bleed", title: "Manage a port-site bleeder", description: "A port site is bleeding on removal.", f: { vessel: "the epigastric vessels at the port site", wrongVessels: ["the iliac artery", "the femoral artery"] } },
      { kind: "verify", title: "Count the instruments and sponges", description: "Confirm the counts are correct before closure.", f: { test: "the instrument and sponge count", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "closure", title: "Close the port sites", description: "Close the fascia at the larger port sites.", f: { structure: "the port site fascia" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for a laparoscopic case." },
      { kind: "postop", title: "Watch for port-site infection", description: "The port sites are a common source of surgical site infection.", f: { test: "the port sites for erythema and drainage", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Post-op diet progression", description: "Advance from clear liquids to a regular diet as tolerated.", f: { test: "the dietary tolerance", wrongTests: ["a routine X-ray", "a blood panel"] } },
      { kind: "postop", title: "Biliary symptoms warning", description: "Teach the patient to report jaundice, dark urine, or new right upper quadrant pain.", f: { test: "the biliary symptom warning signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Return to activity", description: "Define the lifting and activity restrictions after laparoscopy.", f: { test: "the activity tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
      { kind: "postop", title: "Review the pathology", description: "The gallbladder specimen goes to pathology — plan the result discussion.", f: { test: "the gallbladder pathology result", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the post-operative visit to review recovery and the result.", f: { test: "the recovery and the pathology at follow-up", wrongTests: ["a routine MRI", "a blood panel"] } },
      { kind: "postop", title: "Plan for gallstone-related symptoms", description: "Discuss the risk of retained stones and when to seek care.", f: { test: "the recurrent biliary symptom signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Weight and diet counseling", description: "Discuss the long-term dietary changes after cholecystectomy.", f: { test: "the dietary plan", wrongTests: ["a routine blood panel", "an ultrasound"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the wound care, medication, and when to call.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      {
        kind: "postop", title: "Post-op pain and recovery", description: "Plan analgesia and discharge.",
        choices: [
          "Use multimodal analgesia and plan same-day or next-day discharge.",
          "Admit for 48 hours of observation routinely.",
          "Prescribe high-dose opioids for the first week.",
        ],
        feedback: [
          "Multimodal analgesia supports early discharge and recovery.",
          "Routine admission adds cost and risk without benefit after a routine case.",
          "High-dose opioids delay recovery and invite side effects.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      { kind: "postop", title: "Monitor for jaundice or pain", description: "These warn of a bile duct problem.", f: { test: "liver enzymes and bilirubin if symptoms appear", wrongTests: ["a routine CT scan", "a chest X-ray"] } },
      {
        kind: "postop", title: "Diet and follow-up", description: "Define the diet progression and clinic plan.",
        choices: [
          "Start clear liquids, advance as tolerated, and arrange a 2-week follow-up.",
          "Keep the patient fasting until the first bowel movement.",
          "No follow-up is needed after an uncomplicated cholecystectomy.",
        ],
        feedback: [
          "Early diet and structured follow-up are appropriate.",
          "Prolonged fasting is unnecessary after laparoscopic surgery.",
          "Skipping follow-up misses late complications like bile leak.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ACL RECONSTRUCTION
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "acl-reconstruction",
    spec: {
      approach: "arthroscopic portals with a hamstring or patellar tendon autograft",
      wrongApproaches: ["an open arthrotomy through the patella", "a posteromedial approach alone"],
      landmark: "the femoral footprint and the tibial footprint of the ACL",
      wrongLandmarks: ["the posterior cruciate ligament origin", "the meniscal roots"],
      vessel: "the geniculate vessels around the posterior capsule",
      wrongVessels: ["the popliteal artery", "the femoral artery"],
      nerve: "the infrapatellar branch of the saphenous nerve",
      wrongNerves: ["the common peroneal nerve", "the tibial nerve"],
      structure: "the ACL graft and its tunnels",
      wrongStructures: ["the PCL", "the articular cartilage"],
      test: "probing the graft for tension and isometry",
      wrongTests: ["an on-table MRI", "a stress radiograph"],
      risks: ["hemorrhage", "nerve_injury", "infection", "thrombosis"],
      instrument: "an arthroscope and a tunnel reamer",
      position: "supine with a lateral post and a foot support",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "22-year-old soccer player, positive Lachman test",
    },
    steps: [
      { kind: "preop", title: "Confirm the diagnosis and plan", description: "Confirm the Lachman test and imaging findings before induction." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Bone tunnels make infection prophylaxis critical." },
      { kind: "position", title: "Position the knee", description: "A lateral post and foot support allow a 90° flexed knee." },
      { kind: "access", title: "Establish the portals", description: "Place the anterolateral viewing and anteromedial working portals.", f: { wrongApproaches: ["a high suprapatellar portal", "a posterolateral portal only"] } },
      {
        kind: "landmark", title: "Diagnostic arthroscopy", description: "Survey the joint and confirm the ACL tear.",
        choices: [
          "Systematically inspect the patellofemoral joint, medial and lateral compartments, and the ACL.",
          "Move straight to the notch and start drilling.",
          "Confirm the ACL tear and close the case without checking the menisci.",
        ],
        feedback: [
          "A complete survey identifies all pathology before reconstruction.",
          "Skipping the survey misses meniscal and cartilage injuries.",
          "Missing a meniscal tear leaves it untreated in the same case.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "core", title: "Harvest the graft", description: "Take the graft without damaging the donor site.",
        choices: [
          "Harvest the semitendinosus and gracilis tendons, protecting the saphenous nerve branches.",
          "Harvest the tendons with a blind, aggressive stripper pass.",
          "Harvest the patellar tendon with a wide central-third block.",
        ],
        feedback: [
          "The tendons are harvested with the nerve branches protected.",
          "A blind stripper can transect the saphenous nerve branches.",
          "A wide patellar block risks patellar fracture and anterior knee pain.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "nerve", title: "Protect the saphenous nerve", description: "Its infrapatellar branches cross the harvest site.", f: { nerve: "the infrapatellar branches of the saphenous nerve", wrongNerves: ["the common peroneal nerve", "the tibial nerve"] } },
      {
        kind: "core", title: "Prepare the graft", description: "Prepare a strong, appropriately sized graft.",
        choices: [
          "Trim and whip-stitch the graft to a uniform diameter and mark its length.",
          "Leave the graft bulky to maximize strength.",
          "Keep the graft as short as possible to ease passage.",
        ],
        feedback: [
          "A uniform, well-stitched graft passes smoothly and fills the tunnel.",
          "A bulky graft jams in the tunnel and risks graft damage.",
          "An undersized graft leaves laxity and tunnel mismatch.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "core", title: "Prepare the notch", description: "Expose the femoral footprint.",
        choices: [
          "Clear the remnants from the femoral footprint while preserving the posterior wall.",
          "Widen the notch aggressively to improve visualization.",
          "Remove the entire posterior wall to see the back of the femur.",
        ],
        feedback: [
          "The footprint is exposed with an intact posterior wall.",
          "Over-resection weakens the notch and risks fracture.",
          "Removing the posterior wall causes posterior blowout.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Drill the femoral tunnel", description: "Position the tunnel anatomically.",
        choices: [
          "Drill the femoral tunnel through the anteromedial portal at the native footprint.",
          "Drill the tunnel high in the notch to avoid the cartilage.",
          "Drill the tunnel straight down the notch midline.",
        ],
        feedback: [
          "An anatomical footprint tunnel restores rotational stability.",
          "A high, non-anatomical tunnel causes vertical graft and residual pivot shift.",
          "A midline tunnel is non-anatomical and places the graft off-axis.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Drill the tibial tunnel", description: "Place the tibial tunnel within the footprint.",
        choices: [
          "Drill the tibial tunnel inside the native tibial footprint, avoiding the posterior cruciate ligament.",
          "Drill the tibial tunnel as far anterior as possible for a vertical graft.",
          "Drill the tibial tunnel through the medial collateral ligament.",
        ],
        feedback: [
          "The tibial tunnel sits in the footprint, clear of the PCL.",
          "An anterior tunnel causes graft impingement and extension loss.",
          "Tunneling through the MCL damages the ligament and the tunnel.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "verify", title: "Check the tunnel positions", description: "Confirm the tunnels before passing the graft.", f: { test: "probing both tunnel apertures and the notch", wrongTests: ["an on-table X-ray", "a CT scan"] } },
      {
        kind: "core", title: "Pass and fix the graft", description: "Deliver and secure the graft.",
        choices: [
          "Pass the graft and fix it with the knee in flexion on the femoral side and full extension on the tibial side.",
          "Fix the graft with the knee fully extended on both sides.",
          "Tension the graft maximally before tibial fixation.",
        ],
        feedback: [
          "The graft is fixed at the correct flexion angles with physiological tension.",
          "Femoral fixation in extension can displace the tunnel and graft.",
          "Overtensioning the graft causes loss of extension and early failure.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "verify", title: "Test the reconstruction", description: "Confirm stability before closing.",
        choices: [
          "Probe the graft for tension, perform a Lachman test, and check full range of motion.",
          "Confirm the graft is in place and close.",
          "Test the graft with forceful valgus stress.",
        ],
        feedback: [
          "The graft is tensioned, stable, and the knee moves fully.",
          "Skipping the test misses a lax or impinging graft.",
          "Forceful stress testing can damage a fresh graft.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "verify", title: "Confirm the graft tension in flexion", description: "Re-check the graft tension with the knee in flexion.", f: { test: "the graft tension through flexion and extension", wrongTests: ["an on-table X-ray", "a stress radiograph"] } },
      { kind: "exposure", title: "Check the posterior horn", description: "Re-inspect the posterior horn of the menisci before closing.", f: { structure: "the posterior horn of the menisci", landmark: "the posterior cruciate ligament" } },
      { kind: "bleed", title: "Control a graft harvest-site bleeder", description: "The harvest site is oozing.", f: { vessel: "the vessels at the harvest site", wrongVessels: ["the popliteal artery", "the femoral artery"] } },
      { kind: "verify", title: "Wash out the joint", description: "Irrigate the joint to remove debris before closure.", f: { test: "the joint washout", wrongTests: ["a routine MRI", "an X-ray"] } },
      { kind: "closure", title: "Close the portals", description: "Close the skin and apply the dressing.", f: { structure: "the portal sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Knee surgery carries a measurable thrombosis risk." },
      { kind: "postop", title: "Cryotherapy and elevation", description: "Define the early swelling-control plan.", f: { test: "the swelling and effusion", wrongTests: ["a routine X-ray", "an ultrasound"] } },
      { kind: "postop", title: "Watch for deep infection", description: "Knee infections after reconstruction are serious.", f: { test: "the knee for warmth, swelling, and fever", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Muscle activation exercises", description: "Start quadriceps activation on day one.", f: { test: "the quadriceps activation", wrongTests: ["a routine X-ray", "a nerve study"] } },
      { kind: "postop", title: "Brace and crutch plan", description: "Define the brace setting and the crutch use.", f: { test: "the brace and crutch protocol", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Return-to-work guidance", description: "Plan the return to school and sport-specific activities.", f: { test: "the functional milestones", wrongTests: ["a routine MRI", "a stress test"] } },
      { kind: "postop", title: "Long-term graft protection", description: "Discuss the graft protection strategies in sport.", f: { test: "the sport-specific readiness", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange follow-up to review motion, strength, and the rehab plan.", f: { test: "the range of motion and strength at follow-up", wrongTests: ["a routine MRI", "a blood panel"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the wound care, medications, and when to call.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Plan for the second knee", description: "Discuss prevention and screening for the contralateral knee.", f: { test: "the contralateral knee assessment", wrongTests: ["a routine MRI", "a bone scan"] } },
      {
        kind: "postop", title: "Plan rehabilitation", description: "Set the recovery pathway.",
        choices: [
          "Begin early range-of-motion and a phased rehabilitation protocol.",
          "Immobilize the knee in a cast for six weeks.",
          "Allow weight-bearing as tolerated with no therapy plan.",
        ],
        feedback: [
          "Early motion and structured rehab are the standard of care.",
          "Prolonged casting causes stiffness and muscle atrophy.",
          "No rehab plan risks stiffness, weakness, and graft failure.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      { kind: "postop", title: "Monitor for effusion and infection", description: "Watch for signs of joint infection.", f: { test: "the joint for warmth, swelling, and fever", wrongTests: ["a routine CT scan", "a bone scan"] } },
      {
        kind: "postop", title: "Return-to-sport guidance", description: "Define when the athlete can return.",
        choices: [
          "Base return to sport on strength, symmetry, and functional testing, usually 9-12 months.",
          "Allow return to sport at 6 weeks once the wounds heal.",
          "Advise a permanent change of sport to protect the knee.",
        ],
        feedback: [
          "Criteria-based return reduces the re-injury rate.",
          "Early return before strength returns risks graft failure and re-tear.",
          "Permanent restriction is unnecessarily pessimistic for a good reconstruction.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CESAREAN SECTION
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "c-section",
    spec: {
      approach: "a Pfannenstiel incision with a low transverse uterine incision",
      wrongApproaches: ["a midline vertical skin incision as routine", "a laparoscopic approach"],
      landmark: "the bladder flap and the lower uterine segment",
      wrongLandmarks: ["the fundus", "the round ligaments"],
      vessel: "the uterine artery and its venous plexus",
      wrongVessels: ["the ovarian vessels", "the internal iliac artery"],
      nerve: "the structures around the bladder dissection",
      wrongNerves: ["the sciatic nerve", "the femoral nerve"],
      structure: "the uterus and the baby",
      wrongStructures: ["the bladder", "the small bowel"],
      test: "a check of the uterine incision and the placenta",
      wrongTests: ["an on-table ultrasound", "a CT scan"],
      risks: ["hemorrhage", "hypoxia", "cardiac_arrhythmia", "infection", "thrombosis"],
      instrument: "a bladder blade and ring forceps",
      position: "supine with left uterine displacement",
      wrongPositions: ["supine without displacement", "prone"],
      detail: "31-year-old G2P1, 39 weeks, non-reassuring fetal tracing",
    },
    steps: [
      { kind: "preop", title: "Confirm the indication", description: "Non-reassuring fetal tracing — time matters; confirm the plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Give cefazolin before skin incision." },
      { kind: "position", title: "Position with left uterine displacement", description: "Supine positioning can compress the vena cava.", f: { wrongPositions: ["supine without displacement", "Trendelenburg"] } },
      { kind: "access", title: "Make the skin incision", description: "Choose the entry for this urgent delivery.", f: { wrongApproaches: ["a midline vertical incision as routine", "a transverse incision above the umbilicus"] } },
      { kind: "exposure", title: "Divide the subcutaneous tissue and fascia", description: "Open the rectus sheath and separate the rectus muscles.", f: { structure: "the rectus sheath", landmark: "the linea alba" } },
      {
        kind: "access", title: "Enter the peritoneum", description: "Open the peritoneum carefully at the upper extent.",
        choices: [
          "Open the peritoneum under direct vision at the upper extent of the incision, protecting the underlying bowel.",
          "Push through the peritoneum bluntly with a finger at the bladder dome.",
          "Open the peritoneum laterally toward the pelvic sidewall.",
        ],
        feedback: [
          "The peritoneum is opened safely away from the bladder, at the upper extent.",
          "Entry at the dome risks bladder injury and bleeding.",
          "A lateral entry endangers the uterine vessels and the pelvic sidewall.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "landmark", title: "Create the bladder flap", description: "Reflect the bladder off the lower uterine segment.",
        choices: [
          "Incise the vesicouterine peritoneum and gently reflect the bladder downward.",
          "Push the bladder down with a sponge without opening the peritoneum.",
          "Incise directly over the bladder dome to start the flap.",
        ],
        feedback: [
          "The bladder flap is developed safely off the lower segment.",
          "Blunt pushing can tear the bladder wall or its veins.",
          "Incising over the dome risks bladder injury.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "core", title: "Incision in the lower uterine segment", description: "Enter the uterus at the correct site.",
        choices: [
          "Make a small transverse incision in the lower uterine segment and extend it laterally with blunt dissection.",
          "Make a midline vertical incision in the fundus as routine.",
          "Enter the uterus with scissors at the cervical os.",
        ],
        feedback: [
          "The low transverse incision is safe and heals well.",
          "A routine fundal vertical incision is reserved for specific indications and bleeds more.",
          "Entering at the os risks injury to the cervix and bladder.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "core", title: "Deliver the baby", description: "Deliver the head and body smoothly.",
        choices: [
          "Deliver the head with a hand, clear the airway, and deliver the shoulders and body.",
          "Pull firmly on the head to expedite delivery.",
          "Use forceps on the head before it is engaged.",
        ],
        feedback: [
          "A controlled, atraumatic delivery is achieved.",
          "Firm traction risks uterine extension tears and fetal injury.",
          "Forceps on a high, unengaged head is dangerous.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "verify", title: "Deliver the placenta", description: "Complete the third stage.",
        choices: [
          "Deliver the placenta by controlled cord traction once it separates, then inspect it.",
          "Pull the cord forcefully until the placenta comes away.",
          "Leave the placenta in place and close the uterus.",
        ],
        feedback: [
          "The placenta is delivered intact and inspected.",
          "Forceful cord traction can invert the uterus.",
          "A retained placenta causes hemorrhage and infection.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "bleed", title: "Manage uterine bleeding", description: "The uterus is atonic and bleeding briskly.",
        choices: [
          "Massage the fundus, give uterotonics, and reassess the bleeding.",
          "Close the uterus immediately and observe.",
          "Place a clamp across the uterine arteries blindly.",
        ],
        feedback: [
          "Fundal massage and uterotonics restore uterine tone.",
          "Closing over an atonic uterus leaves the hemorrhage to continue.",
          "Blind clamping risks the ureters and the uterine vessels.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "core", title: "Close the uterine incision", description: "Repair the hysterotomy.",
        choices: [
          "Close the uterine incision in two layers with a continuous locking suture.",
          "Close the uterine incision with a single interrupted layer.",
          "Close the uterus including the bladder edge in the same stitch.",
        ],
        feedback: [
          "A two-layer closure restores uterine integrity.",
          "A single layer may leave the closure weak and bleeding.",
          "Including the bladder in the closure is a catastrophic error.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      { kind: "exposure", title: "Inspect the adnexa and pelvis", description: "Check for bleeding and injury before closure.", f: { structure: "the adnexa and the broad ligament", landmark: "the uterine vessels" } },
      { kind: "verify", title: "Confirm the uterine tone", description: "Re-check the fundal tone after the closure.", f: { test: "the uterine tone and the estimated blood loss", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "exposure", title: "Check the bladder and the ureters", description: "Inspect the bladder and confirm the ureters are intact.", f: { structure: "the bladder and the pelvic sidewalls", landmark: "the ureteral course" } },
      { kind: "bleed", title: "Control a broad-ligament bleeder", description: "A venous bleeder is seen at the uterine vessels.", f: { vessel: "the uterine vein at the broad ligament", wrongVessels: ["the ovarian artery", "the internal iliac artery"] } },
      { kind: "verify", title: "Confirm the sponge and instrument counts", description: "Complete the counts before closing the uterus.", f: { test: "the sponge and instrument count", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "closure", title: "Close the peritoneum and fascia", description: "Close the layers in order.", f: { structure: "the peritoneum and rectus sheath" } },
      { kind: "closure", title: "Close the skin", description: "Subcuticular skin closure." },
      { kind: "dvt", title: "DVT prophylaxis", description: "Pregnancy and surgery are both prothrombotic." },
      { kind: "postop", title: "Monitor the lochia and the tone", description: "Watch for heavy lochia and a soft uterus.", f: { test: "the lochia and the fundal tone", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Antibiotic plan", description: "Define the postoperative antibiotic course.", f: { test: "the infection markers", wrongTests: ["a routine blood panel", "an ultrasound"] } },
      { kind: "postop", title: "Breastfeeding and analgesia", description: "Plan analgesia compatible with breastfeeding.", f: { test: "the analgesia plan", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Wound care", description: "Define the incision care for the postpartum period.", f: { test: "the wound for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Thromboembolism education", description: "Teach the signs of DVT and pulmonary embolism.", f: { test: "the DVT warning signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Contraception counseling", description: "Discuss the postpartum contraception options.", f: { test: "the contraception plan", wrongTests: ["a routine ultrasound", "a blood panel"] } },
      { kind: "postop", title: "Baby care coordination", description: "Coordinate the neonatal care and feeding support.", f: { test: "the neonatal transition", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the postpartum visit and the wound check.", f: { test: "the recovery at the postpartum visit", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, wound care, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      {
        kind: "postop", title: "Monitor the mother", description: "Watch for postpartum hemorrhage and vitals.",
        choices: [
          "Monitor vitals, lochia, and uterine tone closely for the first 24 hours.",
          "Check vitals once and discharge from recovery.",
          "Monitor the baby only — the mother is stable.",
        ],
        feedback: [
          "Postpartum monitoring catches delayed hemorrhage.",
          "A single check misses late atonic bleeding.",
          "Ignoring maternal monitoring risks missing a postpartum complication.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Neonatal assessment", description: "Confirm the baby's transition.",
        choices: [
          "Confirm the neonatal team is present for the delivery and reassessment.",
          "Hand the baby to the family immediately.",
          "Defer the neonatal check until the mother is closed.",
        ],
        feedback: [
          "The neonate is assessed by the team during the delivery.",
          "Immediate handover without assessment risks missing respiratory distress.",
          "Delaying neonatal care risks a deteriorating transition.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Pain and mobilization", description: "Plan analgesia and early mobility.",
        choices: [
          "Use multimodal analgesia and mobilize early.",
          "Keep the patient on bed rest for 24 hours.",
          "Rely on opioid-only analgesia.",
        ],
        feedback: [
          "Multimodal analgesia and early mobility speed recovery.",
          "Prolonged bed rest increases thrombosis risk.",
          "Opioid-only analgesia delays recovery and breastfeeding comfort.",
        ],
        wrongComps: ["thrombosis", "hypoxia"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Plan the postpartum visit.",
        choices: [
          "Arrange a 2-week postpartum visit and wound check.",
          "No follow-up is needed after an uncomplicated cesarean.",
          "Schedule a routine ultrasound of the uterus.",
        ],
        feedback: [
          "Postpartum follow-up is the standard of care.",
          "Skipping follow-up misses wound infection and postpartum depression.",
          "Routine imaging adds no value.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TOTAL KNEE REPLACEMENT
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "total-knee-replacement",
    spec: {
      approach: "a medial parapatellar approach with a midline skin incision",
      wrongApproaches: ["a lateral parapatellar approach as routine", "a posterior approach"],
      landmark: "the tibial tubercle and the joint line",
      wrongLandmarks: ["the fibular head", "the adductor tubercle"],
      vessel: "the geniculate arteries and the popliteal vessels",
      wrongVessels: ["the femoral artery", "the great saphenous vein"],
      nerve: "the common peroneal nerve",
      wrongNerves: ["the saphenous nerve", "the sciatic nerve"],
      structure: "the distal femur, proximal tibia, and patella",
      wrongStructures: ["the fibula", "the posterior capsule"],
      test: "a trial reduction with range-of-motion and stability testing",
      wrongTests: ["an on-table MRI", "a bone scan"],
      risks: ["thrombosis", "infection", "nerve_injury", "hemorrhage"],
      instrument: "an alignment guide and a saw",
      position: "supine with a tourniquet on the thigh",
      wrongPositions: ["lateral decubitus", "prone"],
      detail: "68-year-old, bone-on-bone medial OA, hypertension and diabetes",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan and implant", description: "Review the templating and the consent." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Implant surgery demands timely prophylaxis." },
      { kind: "position", title: "Position the leg and tourniquet", description: "Set up the leg with a thigh tourniquet.", f: { wrongPositions: ["lateral decubitus", "prone"] } },
      { kind: "access", title: "Make the skin incision", description: "Choose the approach for exposure.", f: { wrongApproaches: ["a lateral approach as routine", "a posterior approach"] } },
      { kind: "exposure", title: "Develop the medial parapatellar arthrotomy", description: "Enter the joint and evert the patella.", f: { structure: "the quadriceps tendon and patella", landmark: "the medial border of the patella" } },
      {
        kind: "nerve", title: "Protect the common peroneal nerve", description: "Positioning and retraction threaten the peroneal nerve.",
        choices: [
          "Confirm the leg is positioned without external rotation pressure and keep retractors off the posterolateral corner.",
          "Place a self-retaining retractor deep in the posterolateral corner.",
          "Apply a tight lateral retractor for the entire case.",
        ],
        feedback: [
          "The peroneal nerve is protected by positioning and retractor placement.",
          "A deep posterolateral retractor crushes the peroneal nerve.",
          "Prolonged lateral retraction causes a foot drop.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "core", title: "Prepare the distal femur", description: "Make the distal femoral cut.",
        choices: [
          "Set the distal femoral resection using the intramedullary alignment guide at the templated valgus angle.",
          "Cut the distal femur freehand at a neutral angle.",
          "Resect extra distal femur to guarantee flexion.",
        ],
        feedback: [
          "The distal cut is aligned to the mechanical axis.",
          "Freehand cuts introduce varus-valgus error.",
          "Over-resection destabilizes the joint in extension.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Size and rotate the femur", description: "Choose the femoral component size and rotation.",
        choices: [
          "Size the femur anteriorly and set rotation from the epicondylar axis and the tensioned gaps.",
          "Downsize the femur to make flexion easier.",
          "Set rotation parallel to the posterior condylar line regardless of anatomy.",
        ],
        feedback: [
          "Correct sizing and rotation balance the flexion and extension gaps.",
          "Oversizing or undersizing causes instability or tightness.",
          "Fixed posterior-condyle rotation malrotates the component in valgus knees.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "core", title: "Prepare the proximal tibia", description: "Make the tibial cut.",
        choices: [
          "Cut the tibia perpendicular to its mechanical axis with an extramedullary guide at the templated slope.",
          "Cut the tibia with an intramedullary guide from the femoral entry.",
          "Remove more tibia to improve the flexion gap.",
        ],
        feedback: [
          "The tibial cut is perpendicular with the appropriate posterior slope.",
          "An intramedullary tibial guide is not standard and risks malalignment.",
          "Over-resection of the tibia compromises the collateral origins.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "vessel", title: "Protect the posterior structures", description: "The popliteal vessels sit just behind the tibia.", f: { vessel: "the popliteal vessels behind the posterior capsule", wrongVessels: ["the femoral artery", "the great saphenous vein"] } },
      {
        kind: "core", title: "Balance the gaps", description: "Achieve balanced flexion and extension.",
        choices: [
          "Release tight structures sequentially and re-check both gaps until balanced.",
          "Accept the imbalance — it will settle with time.",
          "Cut more bone from the tight side to loosen the gap.",
        ],
        feedback: [
          "The knee is balanced in flexion and extension.",
          "Leaving imbalance causes instability and stiffness.",
          "Bone resection cannot substitute for soft-tissue balancing.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      { kind: "core", title: "Prepare the patella", description: "Resurface the patella appropriately.", f: { structure: "the patellar articular surface" } },
      {
        kind: "verify", title: "Perform the trial reduction", description: "Test the components before cementing.",
        choices: [
          "Reduce the trial components and test stability, alignment, and range of motion.",
          "Skip the trial and cement the final components directly.",
          "Test the knee only in extension.",
        ],
        feedback: [
          "The trial confirms correct sizing, balance, and tracking.",
          "Skipping the trial risks cementing a malaligned knee.",
          "Testing only in extension misses flexion instability.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "core", title: "Cement the components", description: "Fix the final implants.",
        choices: [
          "Cement the components with the knee in the correct position, removing all excess cement.",
          "Cement the components with the knee fully extended and leave the posterior cement.",
          "Press-fit the femoral component without cement.",
        ],
        feedback: [
          "The components are cemented with all excess removed.",
          "Retained posterior cement can injure the popliteal vessels.",
          "Press-fit femoral fixation is not standard for this implant system.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check the patellar tracking", description: "Confirm the patella tracks in the groove.",
        choices: [
          "Observe patellar tracking through flexion and release the lateral retinaculum only if needed.",
          "Perform a routine lateral release on every knee.",
          "Ignore tracking — the component design self-corrects.",
        ],
        feedback: [
          "Tracking is confirmed; a selective release is made only if needed.",
          "Routine lateral release devascularizes the patella.",
          "Ignoring maltracking causes anterior knee pain and dislocation.",
        ],
        wrongComps: ["thrombosis", "nerve_injury"],
      },
      { kind: "bleed", title: "Control bleeding before closure", description: "Deflate the tourniquet and control the bleeding.", f: { vessel: "the geniculate vessels in the wound", wrongVessels: ["the femoral artery", "the popliteal vein"] } },
      { kind: "verify", title: "Confirm the alignment once more", description: "Re-check the mechanical alignment with the trial still in.", f: { test: "the mechanical alignment and the joint line", wrongTests: ["an on-table MRI", "a CT scan"] } },
      { kind: "exposure", title: "Check the posterior capsule", description: "Ensure no cement or debris sits behind the knee.", f: { structure: "the posterior capsule", landmark: "the popliteal fossa" } },
      { kind: "bleed", title: "Control the lateral geniculate bleeder", description: "A vessel at the lateral edge is bleeding.", f: { vessel: "the lateral geniculate vessels", wrongVessels: ["the popliteal artery", "the femoral artery"] } },
      { kind: "verify", title: "Confirm the patellar tracking again", description: "Re-check the tracking with the tourniquet released.", f: { test: "the patellar tracking through the range", wrongTests: ["an on-table X-ray", "a CT scan"] } },
      { kind: "closure", title: "Close the arthrotomy and skin", description: "Close in layers over a drain if used.", f: { structure: "the arthrotomy and the subcutaneous layer" } },
      { kind: "postop", title: "Cryotherapy and elevation", description: "Define the swelling-control plan for the first days.", f: { test: "the knee swelling", wrongTests: ["a routine X-ray", "an ultrasound"] } },
      { kind: "postop", title: "Watch for wound ooze", description: "Monitor the dressing for excessive drainage.", f: { test: "the wound for drainage", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Quadriceps activation", description: "Start quad sets and ankle pumps on day one.", f: { test: "the quadriceps activation", wrongTests: ["a routine X-ray", "a nerve study"] } },
      { kind: "postop", title: "Drain management", description: "Define when the drain is removed.", f: { test: "the drain output", wrongTests: ["a routine X-ray", "a blood panel"] } },
      { kind: "postop", title: "Blood glucose control", description: "Optimize the diabetes control to protect the wound.", f: { test: "the blood glucose levels", wrongTests: ["a routine CT scan", "an ultrasound"] } },
      { kind: "postop", title: "Home exercise program", description: "Provide the exercises to perform at home.", f: { test: "the home exercise compliance", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Fall precautions", description: "Review the fall risks with the new knee.", f: { test: "the gait safety", wrongTests: ["a routine X-ray", "a balance test"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the 6-week review with an X-ray.", f: { test: "the X-ray and the range of motion at 6 weeks", wrongTests: ["a routine MRI", "a CT scan"] } },
      {
        kind: "postop", title: "Plan mobilization", description: "Start the recovery pathway.",
        choices: [
          "Begin early range-of-motion, weight-bearing as tolerated, and physiotherapy on day one.",
          "Keep the knee immobilized for two weeks.",
          "Start therapy only after the wound is fully healed.",
        ],
        feedback: [
          "Early motion and weight-bearing optimize the outcome.",
          "Prolonged immobilization causes stiffness and weakness.",
          "Delaying therapy allows adhesions to form.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      { kind: "postop", title: "DVT prophylaxis", description: "Knee arthroplasty has a high thrombosis risk." },
      {
        kind: "postop", title: "Monitor the wound", description: "Watch for infection and wound complications.",
        choices: [
          "Inspect the wound daily and monitor for erythema, drainage, and fever.",
          "Discharge home without wound review.",
          "Change the dressing only at the clinic visit in two weeks.",
        ],
        feedback: [
          "Daily wound review catches infection early.",
          "No review risks missing a deep infection until it is established.",
          "Delayed dressing changes hide early wound breakdown.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Discharge criteria and follow-up", description: "Define when the patient goes home.",
        choices: [
          "Discharge when the patient is safe with crutches, pain is controlled, and the wound is clean.",
          "Discharge on the day of surgery.",
          "Keep the patient admitted until the incision is healed.",
        ],
        feedback: [
          "Criteria-based discharge is safe and standard.",
          "Same-day discharge is unsafe for a cemented TKA.",
          "Prolonged admission increases thrombosis and infection risk.",
        ],
        wrongComps: ["thrombosis", "infection"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TOTAL HYSTERECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "total-hysterectomy",
    spec: {
      approach: "a transverse (Pfannenstiel) incision for abdominal hysterectomy",
      wrongApproaches: ["a midline vertical incision as routine", "a posterior colpotomy as routine"],
      landmark: "the ureters at the pelvic brim and the uterine vessels",
      wrongLandmarks: ["the round ligaments", "the ovarian vessels"],
      vessel: "the uterine artery at its origin from the internal iliac",
      wrongVessels: ["the ovarian artery", "the external iliac artery"],
      nerve: "the ureter and the pelvic autonomic nerves",
      wrongNerves: ["the sciatic nerve", "the obturator nerve"],
      structure: "the uterus, cervix, and adnexa",
      wrongStructures: ["the bladder", "the sigmoid colon"],
      test: "palpation of the ureters and a check of the cuff",
      wrongTests: ["an on-table cystoscopy as routine", "a CT scan"],
      risks: ["hemorrhage", "infection", "nerve_injury", "thrombosis"],
      instrument: "a self-retaining retractor and Heaney clamps",
      position: "supine with a slight Trendelenburg tilt",
      wrongPositions: ["prone", "steep reverse Trendelenburg"],
      detail: "46-year-old with large fibroids causing menorrhagia and anemia",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the imaging, the consent, and the ovarian decision." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Hysterectomy is a clean-contaminated case — prophylaxis matters." },
      { kind: "position", title: "Position the patient", description: "Supine with a modest Trendelenburg tilt for pelvic access.", f: { wrongPositions: ["prone", "steep reverse Trendelenburg"] } },
      { kind: "access", title: "Make the incision", description: "Choose the entry for pelvic exposure.", f: { wrongApproaches: ["a midline vertical incision as routine", "a lumbar approach"] } },
      { kind: "exposure", title: "Open the fascia and peritoneum", description: "Divide the rectus sheath and enter the peritoneum.", f: { structure: "the rectus sheath and peritoneum", landmark: "the bladder peritoneum" } },
      { kind: "landmark", title: "Identify the ureters", description: "Palpate the ureters at the pelvic brim before any clamping.", f: { landmark: "the ureters at the pelvic brim", wrongLandmarks: ["the uterine vessels", "the ovarian vessels"] } },
      {
        kind: "vessel", title: "Clamp the round ligaments", description: "Divide the round ligaments and open the broad ligament.",
        choices: [
          "Clamp, divide, and ligate the round ligaments, then open the broad ligament parallel to the ureter.",
          "Clamp the round ligament with the ureter in the clamp.",
          "Cut the round ligament without ligation and rely on cautery.",
        ],
        feedback: [
          "The round ligament is divided safely and the broad ligament opened in the avascular window.",
          "Including the ureter in the clamp is the classic ureteric injury.",
          "Unligated division invites bleeding from the round ligament vessels.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Divide the ovarian vessels", description: "Decide the adnexal management.",
        choices: [
          "Clamp, divide, and ligate the infundibulopelvic ligament at the pelvic brim, clear of the ureter.",
          "Clamp the infundibulopelvic ligament low near the ovary.",
          "Cut the ovarian vessels with cautery only.",
        ],
        feedback: [
          "The infundibulopelvic ligament is secured with the ureter visualized.",
          "Clamping low risks tearing the ovarian vessels and leaving the ovary behind.",
          "Cautery alone on these vessels risks delayed hemorrhage.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "dissect", title: "Develop the bladder flap", description: "Reflect the bladder off the cervix and vagina.",
        choices: [
          "Sharply dissect the vesicouterine fold and push the bladder below the vaginal cuff line.",
          "Sweep the bladder down with a sponge only.",
          "Leave the bladder attached and clamp through it.",
        ],
        feedback: [
          "The bladder is reflected safely below the cuff.",
          "Sponge-only reflection can tear the bladder wall.",
          "Clamping through the bladder is a catastrophic injury.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vessel", title: "Secure the uterine arteries", description: "Control the main blood supply at the cervix.",
        choices: [
          "Clamp the uterine arteries at the level of the internal os, lateral to the cervix, and ligate.",
          "Clamp the uterine arteries at the pelvic brim.",
          "Clamp the uterine arteries with the ureter included.",
        ],
        feedback: [
          "The uterine arteries are secured at the cervical level where they are safe.",
          "Clamping at the brim is unnecessary and risks the ureter.",
          "Including the ureter causes silent hydronephrosis.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Clamp the cardinal and uterosacral ligaments", description: "Complete the parametrial dissection.",
        choices: [
          "Clamp, divide, and ligate the cardinal and uterosacral ligaments sequentially, staying on the cervix.",
          "Clamp all the parametrial tissue en masse.",
          "Divide the parametrium with a stapler across the cervix.",
        ],
        feedback: [
          "The parametrium is taken in safe, sequential bites on the cervix.",
          "Mass clamping risks the ureter and the venous plexus.",
          "Stapling across the parametrium can include the ureter.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Open the vagina and remove the uterus", description: "Complete the hysterectomy.",
        choices: [
          "Open the vagina anteriorly, cut the lateral attachments under vision, and remove the specimen.",
          "Pull the uterus firmly through the vagina to expedite removal.",
          "Close the vagina before removing the uterus.",
        ],
        feedback: [
          "The cuff is opened and the specimen removed under direct vision.",
          "Forceful traction can tear the vaginal angles and the ureters.",
          "Closing the cuff first traps the uterus.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "verify", title: "Check the ureters and hemostasis", description: "Confirm the ureters are intact and the pelvis is dry.",
        choices: [
          "Palpate both ureters for a pulse and inspect the pelvic sidewalls for bleeding.",
          "Trust the clamps and close the cuff.",
          "Open the retroperitoneum on both sides as routine.",
        ],
        feedback: [
          "The ureters are confirmed intact and the pelvis is dry.",
          "Skipping the check misses a silent ureteric injury.",
          "Routine retroperitoneal opening adds risk without benefit.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "bleed", title: "Control a pelvic venous bleeder", description: "The uterine venous plexus is oozing.", f: { vessel: "the uterine venous plexus", wrongVessels: ["the external iliac artery", "the ovarian artery"] } },
      { kind: "verify", title: "Confirm the ureters again", description: "Re-check both ureters for a pulse before closure.", f: { test: "the ureteral pulses", wrongTests: ["a routine cystoscopy", "a CT scan"] } },
      { kind: "exposure", title: "Inspect the pelvic sidewalls", description: "Look for venous bleeding along the sidewalls.", f: { structure: "the pelvic sidewalls", landmark: "the internal iliac vessels" } },
      { kind: "bleed", title: "Control a cuff-angle bleeder", description: "The vaginal angle is bleeding.", f: { vessel: "the vaginal angle vessels", wrongVessels: ["the external iliac artery", "the obturator artery"] } },
      { kind: "verify", title: "Complete the sponge count", description: "Confirm the counts are correct before the abdomen is closed.", f: { test: "the sponge and instrument count", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "closure", title: "Close the vaginal cuff", description: "Suture the cuff with the angles incorporated.", f: { structure: "the vaginal cuff" } },
      { kind: "closure", title: "Close the abdomen", description: "Close the fascia and skin in layers.", f: { structure: "the rectus sheath" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Pelvic surgery carries a significant thrombosis risk." },
      { kind: "postop", title: "Watch for cuff infection", description: "Vaginal cuff cellulitis can develop after hysterectomy.", f: { test: "the cuff for discharge and tenderness", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Manage the catheter", description: "Define the catheter removal timing.", f: { test: "the voiding trial", wrongTests: ["a routine ultrasound", "a blood panel"] } },
      { kind: "postop", title: "Hormonal considerations", description: "Review the hormonal implications of the ovarian decision.", f: { test: "the hormonal plan", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Wound care", description: "Define the abdominal wound care.", f: { test: "the wound for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Activity restrictions", description: "Define the lifting and activity limits during recovery.", f: { test: "the activity tolerance", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Watch for bleeding", description: "Monitor the vaginal bleeding as the cuff heals.", f: { test: "the vaginal bleeding", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Pelvic floor therapy", description: "Discuss pelvic floor exercises during recovery.", f: { test: "the pelvic floor function", wrongTests: ["a routine ultrasound", "a nerve study"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the 6-week pelvic review.", f: { test: "the cuff and the recovery at 6 weeks", wrongTests: ["a routine MRI", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, wound care, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      {
        kind: "postop", title: "Monitor the urine output", description: "Oliguria can signal a ureteric injury.",
        choices: [
          "Track urine output and investigate if it is unexpectedly low.",
          "Ignore urine output — it is not relevant here.",
          "Place a Foley only if the patient asks.",
        ],
        feedback: [
          "Urine output is monitored and investigated if low.",
          "Ignoring oliguria can delay detection of a ureteric injury.",
          "A Foley catheter is standard for the first 24 hours.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "postop", title: "Plan recovery", description: "Define activity and follow-up.",
        choices: [
          "Advance diet as tolerated, mobilize early, and arrange a 6-week review.",
          "Restrict activity and delay mobilization for a week.",
          "No follow-up is needed after a hysterectomy.",
        ],
        feedback: [
          "Early recovery and a 6-week review are standard.",
          "Delayed mobilization increases thrombosis risk.",
          "Skipping follow-up misses cuff and wound complications.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Hormone and surveillance plan", description: "Plan post-operative hormone and screening if indicated.",
        choices: [
          "Discuss hormone replacement if the ovaries were removed and arrange routine surveillance.",
          "Start hormones for every patient.",
          "Skip surveillance — the surgery was curative.",
        ],
        feedback: [
          "The hormone and surveillance plan matches the surgery performed.",
          "Blanket hormone therapy is not indicated for every patient.",
          "Skipping surveillance can miss recurrence in malignant cases.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SIGMOID COLECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "sigmoid-colectomy",
    spec: {
      approach: "laparoscopic sigmoid resection with a medial-to-lateral dissection",
      wrongApproaches: ["a right hemicolectomy approach", "a transanal approach"],
      landmark: "the left ureter and the inferior mesenteric artery",
      wrongLandmarks: ["the right ureter", "the superior mesenteric artery"],
      vessel: "the inferior mesenteric artery and sigmoid branches",
      wrongVessels: ["the middle colic artery", "the iliac artery"],
      nerve: "the left ureter and the pelvic autonomic nerves",
      wrongNerves: ["the femoral nerve", "the sciatic nerve"],
      structure: "the sigmoid colon and the proximal rectum",
      wrongStructures: ["the small bowel", "the bladder"],
      test: "an air-leak test of the anastomosis",
      wrongTests: ["a routine colonoscopy", "an on-table MRI"],
      risks: ["infection", "hemorrhage", "nerve_injury"],
      instrument: "a stapler and a laparoscopic camera",
      position: "modified lithotomy with left tilt",
      wrongPositions: ["prone", "supine flat"],
      detail: "58-year-old, diverticulitis with abscess, hypertensive and diabetic",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the CT, the abscess, and the bowel preparation plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "This is a clean-contaminated case with an abscess." },
      { kind: "position", title: "Position with left tilt", description: "Modified lithotomy with a left-side-up tilt opens the left colon.", f: { wrongPositions: ["prone", "supine flat"] } },
      {
        kind: "access", title: "Establish access", description: "Enter the abdomen and place ports.",
        choices: [
          "Insert the Veress needle or use an open Hasson entry, confirm insufflation, then place the working ports under vision.",
          "Enter the abdomen through the abscess cavity to save time.",
          "Place all ports blindly in a single pass.",
        ],
        feedback: [
          "Access is confirmed and the ports are placed under vision, clear of the abscess.",
          "Entering through the abscess spreads contamination and can seed the wound.",
          "Blind port placement risks major vessel or bowel injury.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "landmark", title: "Identify the left ureter", description: "Find the ureter before dividing any vessels.",
        choices: [
          "Identify the left ureter crossing the iliac vessels before starting the vascular dissection.",
          "Start the vascular dissection and look for the ureter afterwards.",
          "Trust the CT and skip ureteric identification.",
        ],
        feedback: [
          "The ureter is identified and traced before any division.",
          "Dividing vessels before finding the ureter risks a silent ureteric injury.",
          "Skipping identification makes a ureteric injury almost certain eventually.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "vessel", title: "Divide the inferior mesenteric artery", description: "Control the blood supply at the correct level.",
        choices: [
          "Divide the inferior mesenteric artery close to its origin, preserving the left colic artery if feasible.",
          "Divide the inferior mesenteric artery flush with the aorta in every case.",
          "Divide the sigmoid branches individually without the main trunk.",
        ],
        feedback: [
          "The vessel is divided at the appropriate level for the pathology.",
          "High ligation at the aorta adds risk without oncologic benefit here.",
          "Leaving the main trunk risks ischemia of the proximal limb.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "vessel", title: "Divide the inferior mesenteric vein", description: "Control the venous drainage.", f: { vessel: "the inferior mesenteric vein", wrongVessels: ["the superior mesenteric vein", "the splenic vein"] } },
      {
        kind: "dissect", title: "Mobilize the left colon", description: "Take down the splenic flexure as needed.",
        choices: [
          "Mobilize the left colon medial-to-lateral in the avascular plane, taking down the flexure for length.",
          "Mobilize the colon laterally first, dividing the white line of Toldt aggressively.",
          "Pull the colon medially with force to release the adhesions.",
        ],
        feedback: [
          "The colon is mobilized in the correct plane with adequate length.",
          "Lateral-first dissection risks the ureter and the spleen.",
          "Forceful traction tears the mesentery and the spleen capsule.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "nerve", title: "Protect the pelvic nerves", description: "Dissection near the presacral fascia risks the autonomic nerves.",
        choices: [
          "Stay anterior to the presacral fascia and avoid wide lateral dissection.",
          "Dissect widely along the pelvic sidewall to ensure clear margins.",
          "Cauterize the presacral venous plexus to improve visibility.",
        ],
        feedback: [
          "The presacral plane is respected, protecting sexual and bladder function.",
          "Wide sidewall dissection injures the autonomic nerves.",
          "Cauterizing the presacral plexus causes catastrophic venous bleeding.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Divide the sigmoid and proximal rectum", description: "Set the resection margins.",
        choices: [
          "Divide the proximal colon and the rectum at the level appropriate for the disease.",
          "Divide the rectum at the pelvic floor in every case.",
          "Divide the colon at the descending-sigmoid junction.",
        ],
        feedback: [
          "The margins match the pathology — the correct resection.",
          "Routine low division is unnecessary and risks anastomotic complications.",
          "A high proximal division may leave diseased bowel behind.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Resect the specimen", description: "Remove the diseased segment.",
        choices: [
          "Extract the specimen through a protected wound, divide it, and prepare the anastomosis.",
          "Pull the specimen through the anus with traction.",
          "Divide the specimen inside the abdomen and close the wound over it.",
        ],
        feedback: [
          "The specimen is removed with wound protection.",
          "Anal traction risks tearing the rectum and sphincter.",
          "Leaving the specimen in the wound invites infection and hernia.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Create the anastomosis", description: "Join the colon to the rectum.",
        choices: [
          "Create a tension-free colorectal anastomosis with a circular stapler, checking the doughnuts.",
          "Suture the anastomosis by hand through the anus.",
          "Staple the colon to the rectum under tension.",
        ],
        feedback: [
          "A tension-free, well-vascularized anastomosis is created and the doughnuts are intact.",
          "A transanal hand-sewn anastomosis is not standard for this case.",
          "Tension on the anastomosis invites a leak.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "verify", title: "Test the anastomosis", description: "Check for a leak before closing.",
        choices: [
          "Perform an air-leak test with the anastomosis submerged and repair any leak.",
          "Trust the stapler and close without testing.",
          "Test the anastomosis only if the patient had radiation.",
        ],
        feedback: [
          "The air-leak test confirms a sealed anastomosis.",
          "Skipping the test risks a silent leak presenting as sepsis.",
          "Testing is standard regardless of radiation history.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "verify", title: "Confirm hemostasis and perfusion", description: "Check the anastomotic limbs and the field.", f: { test: "perfusion of the anastomotic limbs and pelvic hemostasis", wrongTests: ["a routine colonoscopy", "an on-table MRI"] } },
      { kind: "verify", title: "Re-check the anastomotic limbs", description: "Confirm the perfusion of both limbs once more.", f: { test: "the perfusion of the anastomotic limbs", wrongTests: ["a routine colonoscopy", "an on-table MRI"] } },
      { kind: "exposure", title: "Inspect the splenic flexure take-down", description: "Confirm no splenic capsular tear from the mobilization.", f: { structure: "the splenic capsule", landmark: "the splenocolic ligament" } },
      { kind: "bleed", title: "Control a mesenteric bleeder", description: "A mesenteric vessel is bleeding at the resection line.", f: { vessel: "the mesenteric vessels at the resection", wrongVessels: ["the iliac artery", "the aorta"] } },
      { kind: "verify", title: "Confirm the doughnuts", description: "Check both stapler doughnuts are intact and complete.", f: { test: "the stapler doughnuts", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "closure", title: "Close the mesenteric defect and ports", description: "Close the defects and the port sites.", f: { structure: "the mesenteric defect and port sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Pelvic colorectal surgery is high-risk for thrombosis." },
      { kind: "postop", title: "Watch for bleeding", description: "Monitor the hemoglobin and the vitals for delayed bleeding.", f: { test: "the hemoglobin and the vitals", wrongTests: ["a routine CT scan", "an ultrasound"] } },
      { kind: "postop", title: "Manage the nasogastric tube", description: "Define the NG tube plan for the recovery.", f: { test: "the nasogastric output", wrongTests: ["a routine X-ray", "a blood panel"] } },
      { kind: "postop", title: "Pain control plan", description: "Plan the multimodal analgesia.", f: { test: "the pain scores", wrongTests: ["a routine CT scan", "a blood panel"] } },
      { kind: "postop", title: "Wound care", description: "Define the wound and drain care.", f: { test: "the wounds and the drains", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Watch for ileus", description: "Monitor for prolonged ileus after the resection.", f: { test: "the bowel function and the distension", wrongTests: ["a routine CT scan", "a blood panel"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology result.", f: { test: "the pathology and the recovery at follow-up", wrongTests: ["a routine CT scan", "a colonoscopy"] } },
      { kind: "postop", title: "Colon cancer surveillance", description: "Define the surveillance colonoscopy schedule.", f: { test: "the surveillance schedule", wrongTests: ["a routine CT scan", "a blood panel"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, diet, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Return to activity", description: "Define the lifting and activity restrictions.", f: { test: "the activity tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
      {
        kind: "postop", title: "Monitor for anastomotic leak", description: "Fever and tachycardia can signal a leak.",
        choices: [
          "Follow serial exams, vitals, and inflammatory markers; investigate any deterioration promptly.",
          "Discharge on day one without monitoring.",
          "Only investigate symptoms if they are severe.",
        ],
        feedback: [
          "Early detection of a leak is possible with structured monitoring.",
          "Early discharge without monitoring risks missing a developing leak.",
          "Waiting for severe symptoms delays intervention.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Diet and mobilization", description: "Plan the recovery pathway.",
        choices: [
          "Start a clear liquid diet when tolerated and mobilize early.",
          "Keep the patient fasting until flatus.",
          "Start a full diet on day one.",
        ],
        feedback: [
          "Early feeding and mobilization are the enhanced-recovery standard.",
          "Fasting until flatus is outdated.",
          "A full diet on day one risks distension after colorectal surgery.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the follow-up and pathology plan.",
        choices: [
          "Discharge when tolerating diet and arrange follow-up with the pathology result.",
          "No follow-up is needed after a resection.",
          "Schedule a routine CT scan before discharge.",
        ],
        feedback: [
          "Structured follow-up reviews pathology and recovery.",
          "Skipping follow-up misses the pathology result and late complications.",
          "A routine pre-discharge CT adds no value.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LAPAROSCOPIC CHOLECYSTECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "lap-cholecystectomy",
    spec: {
      approach: "four-port laparoscopic access with a 30° scope",
      wrongApproaches: ["a single-port suprapubic approach", "an open midline approach as routine"],
      landmark: "the critical view of safety and the Rouviere's sulcus",
      wrongLandmarks: ["the cystic duct alone", "the duodenum"],
      vessel: "the cystic artery",
      wrongVessels: ["the right hepatic artery", "the gastroduodenal artery"],
      nerve: "the bile duct structures of the hepatoduodenal ligament",
      wrongNerves: ["the vagus nerve", "the phrenic nerve"],
      structure: "the gallbladder and the extrahepatic bile ducts",
      wrongStructures: ["the duodenum", "the right kidney"],
      test: "the critical view of safety and cholangiography when indicated",
      wrongTests: ["a routine liver biopsy", "an on-table ultrasound of the kidney"],
      risks: ["hemorrhage", "infection", "nerve_injury", "hypoxia"],
      instrument: "a 30° laparoscope and a clip applier",
      position: "supine with the patient in reverse Trendelenburg with left tilt",
      wrongPositions: ["prone", "steep Trendelenburg"],
      detail: "42-year-old, gallstones, obese, Murphy's sign positive",
    },
    steps: [
      { kind: "preop", title: "Confirm the indication", description: "Review the ultrasound and the liver function tests." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Timely prophylaxis for a contaminated biliary case." },
      { kind: "position", title: "Position with reverse Trendelenburg and left tilt", description: "This position lets the liver fall away from the field.", f: { wrongPositions: ["prone", "steep Trendelenburg"] } },
      {
        kind: "access", title: "Establish pneumoperitoneum", description: "Safe entry at the umbilicus.",
        choices: [
          "Insert the Veress needle at the umbilicus and confirm low-pressure insufflation before entry.",
          "Enter with the first trocar at the left subcostal margin.",
          "Insufflate to high pressure immediately to maximize working space.",
        ],
        feedback: [
          "Access is confirmed safe before the first trocar is placed.",
          "A subcostal entry misses the umbilicus and risks injury to the liver or vessels.",
          "Excessive pressure compromises venous return and ventilation.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      { kind: "exposure", title: "Place the working ports", description: "Triangulate on the gallbladder bed.", f: { structure: "the gallbladder", landmark: "the subcostal margin" } },
      {
        kind: "landmark", title: "Identify Rouviere's sulcus", description: "This sulcus marks the plane of the common bile duct.",
        choices: [
          "Identify Rouviere's sulcus and keep the dissection lateral to it.",
          "Dissect directly over the presumed bile duct plane.",
          "Use the duodenum as the guide for the ductal plane.",
        ],
        feedback: [
          "Rouviere's sulcus keeps the dissection away from the CBD.",
          "Dissecting over the duct plane risks a CBD injury.",
          "The duodenum is an unreliable guide for the ductal plane.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "dissect", title: "Retract the infundibulum laterally", description: "Open the triangle of Calot.",
        choices: [
          "Retract the infundibulum laterally and cephalad to open the triangle without tenting the duct.",
          "Retract the infundibulum medially toward the liver.",
          "Grasp the fundus and pull it straight down.",
        ],
        feedback: [
          "Lateral retraction opens the triangle and aligns the cystic duct with the CBD.",
          "Medial retraction tents the CBD and makes it look like the cystic duct.",
          "Fundal retraction collapses the triangle.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Dissect the triangle of Calot", description: "Expose the cystic duct and artery.",
        choices: [
          "Dissect the peritoneum off the triangle, exposing the cystic duct and artery with the critical view in mind.",
          "Sweep the tissue off the triangle with the suction tip.",
          "Divide the tissue between the duct and artery with cautery.",
        ],
        feedback: [
          "The triangle is dissected to expose the critical view.",
          "Suction sweeping strips tissue off the CBD.",
          "Cautery between the duct and artery risks a thermal bile duct injury.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "verify", title: "Confirm the critical view of safety", description: "Only two structures should enter the gallbladder.",
        choices: [
          "Confirm that only the cystic duct and artery enter the lower third of the gallbladder before clipping.",
          "Clip the first structure you identify as the duct.",
          "Proceed once the duct is seen, without freeing the artery.",
        ],
        feedback: [
          "The critical view is confirmed — clipping is now safe.",
          "Clipping before the critical view is the leading cause of CBD injury.",
          "Clipping with the artery buried risks mistaking the CBD for the duct.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "vessel", title: "Clip and divide the cystic artery", description: "Control the artery at the gallbladder.", f: { vessel: "the cystic artery at the gallbladder", wrongVessels: ["the right hepatic artery", "the portal vein"] } },
      { kind: "vessel", title: "Clip and divide the cystic duct", description: "Secure the duct with a margin from the CBD.", f: { vessel: "the cystic duct near the gallbladder", wrongVessels: ["the common bile duct", "the common hepatic duct"] } },
      {
        kind: "core", title: "Dissect the gallbladder off the liver", description: "Remove the gallbladder from its bed.",
        choices: [
          "Dissect the gallbladder off the liver in the avascular subserosal plane.",
          "Pull the gallbladder sharply off the liver bed.",
          "Dissect deep into the liver parenchyma.",
        ],
        feedback: [
          "The avascular plane is followed and the bed stays dry.",
          "Sharp avulsion tears the liver bed and bleeds.",
          "Deep dissection risks the middle hepatic vein.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "bleed", title: "Control a cystic artery bleeder", description: "The artery retracted and is bleeding at the clip line.",
        choices: [
          "Apply pressure, identify the bleeding point, and clip or suture it precisely.",
          "Cauterize the area broadly to stop the bleeding.",
          "Place clips blindly across the bleeding field.",
        ],
        feedback: [
          "The bleeder is controlled precisely with the anatomy identified.",
          "Broad cautery risks thermal injury to the duct and liver.",
          "Blind clipping risks the right hepatic artery.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "verify", title: "Check for bile leak", description: "Inspect the clips and the bed before removal.", f: { test: "inspection of the clips and liver bed for bile", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      { kind: "exposure", title: "Extract the gallbladder", description: "Remove the specimen safely.", f: { structure: "the gallbladder specimen", landmark: "the umbilical port" } },
      { kind: "verify", title: "Re-check the clips under tension", description: "Re-inflate the abdomen and confirm the clips hold.", f: { test: "the cystic duct and artery clips under tension", wrongTests: ["a routine cholangiogram", "an on-table MRI"] } },
      { kind: "exposure", title: "Re-inspect the liver bed", description: "Confirm the bed is dry before removal.", f: { structure: "the liver bed", landmark: "the gallbladder fossa" } },
      { kind: "bleed", title: "Control a port-site bleeder", description: "A port site is bleeding on removal.", f: { vessel: "the epigastric vessels at the port site", wrongVessels: ["the iliac artery", "the femoral artery"] } },
      { kind: "verify", title: "Confirm the sponge count", description: "Complete the counts before closure.", f: { test: "the instrument and sponge count", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "closure", title: "Close the port sites", description: "Close the fascia at the larger sites.", f: { structure: "the port site fascia" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for laparoscopy." },
      { kind: "postop", title: "Watch for port-site infection", description: "Monitor the port sites for erythema and drainage.", f: { test: "the port sites", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Post-op diet progression", description: "Advance the diet as tolerated.", f: { test: "the dietary tolerance", wrongTests: ["a routine X-ray", "a blood panel"] } },
      { kind: "postop", title: "Biliary symptom warning", description: "Teach the warning signs of a bile duct problem.", f: { test: "the biliary warning signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Return to activity", description: "Define the lifting restrictions after laparoscopy.", f: { test: "the activity tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
      { kind: "postop", title: "Review the pathology", description: "Plan the gallbladder pathology discussion.", f: { test: "the gallbladder pathology", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the post-operative review.", f: { test: "the recovery at follow-up", wrongTests: ["a routine MRI", "a blood panel"] } },
      { kind: "postop", title: "Retained stone risk", description: "Discuss the risk of retained common duct stones and the signs.", f: { test: "the recurrent biliary signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the wound care and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Long-term dietary advice", description: "Discuss the long-term dietary changes after cholecystectomy.", f: { test: "the dietary plan", wrongTests: ["a routine blood panel", "an ultrasound"] } },
      {
        kind: "postop", title: "Plan recovery", description: "Plan analgesia and discharge.",
        choices: [
          "Use multimodal analgesia and plan same-day or next-day discharge.",
          "Admit for routine overnight monitoring.",
          "Prescribe strong opioids for the first week.",
        ],
        feedback: [
          "Multimodal analgesia supports a rapid recovery.",
          "Routine admission is unnecessary after an uncomplicated case.",
          "High-dose opioids delay recovery.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      { kind: "postop", title: "Watch for jaundice and pain", description: "These suggest a duct injury.", f: { test: "liver enzymes and bilirubin if symptoms develop", wrongTests: ["a routine chest X-ray", "a blood culture"] } },
      {
        kind: "postop", title: "Diet and follow-up", description: "Plan the diet and clinic visit.",
        choices: [
          "Advance the diet as tolerated and arrange a 2-week follow-up.",
          "Keep the patient fasting until the first bowel movement.",
          "No follow-up is needed.",
        ],
        feedback: [
          "Early diet and follow-up are appropriate.",
          "Prolonged fasting is unnecessary.",
          "Skipping follow-up misses late bile leaks.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // RADICAL NEPHRECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "radical-nephrectomy",
    spec: {
      approach: "a transperitoneal or flank approach to the retroperitoneum",
      wrongApproaches: ["a transanal approach", "a thoracic approach as routine"],
      landmark: "the renal hilum and the ureter",
      wrongLandmarks: ["the aorta", "the iliac vessels"],
      vessel: "the renal artery and renal vein",
      wrongVessels: ["the superior mesenteric artery", "the celiac trunk"],
      nerve: "the duodenum and the adrenal gland on the right",
      wrongNerves: ["the phrenic nerve", "the sciatic nerve"],
      structure: "the kidney, adrenal gland, and Gerota's fascia",
      wrongStructures: ["the pancreas", "the spleen"],
      test: "a check of the renal vein for tumor thrombus",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["hemorrhage", "cardiac_arrhythmia", "infection", "nerve_injury"],
      instrument: "a Satinsky clamp and a vascular stapler",
      position: "flank position for a retroperitoneal approach",
      wrongPositions: ["prone", "supine flat"],
      detail: "58-year-old, right renal mass, hematuria, weight loss, hypertensive",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the staging CT, the renal function, and the thrombus status." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "A major resection warrants timely prophylaxis." },
      { kind: "position", title: "Position for the approach", description: "Flank position opens the retroperitoneum.", f: { wrongPositions: ["prone", "supine flat"] } },
      { kind: "access", title: "Choose the approach", description: "Transperitoneal or flank — both must reach the hilum.", f: { wrongApproaches: ["a transanal approach", "a thoracic approach as routine"] } },
      { kind: "exposure", title: "Reflect the colon and identify the retroperitoneum", description: "Enter the correct plane.", f: { structure: "the retroperitoneum", landmark: "the white line of Toldt" } },
      {
        kind: "landmark", title: "Identify the ureter and gonadal vein", description: "The ureter crosses the iliac vessels — find it early.",
        choices: [
          "Identify the ureter crossing the iliac vessels and trace it to the renal hilum.",
          "Start at the renal hilum and look for the ureter later.",
          "Use the gonadal vein as the ureter and divide it.",
        ],
        feedback: [
          "The ureter is identified and traced safely.",
          "Dissecting the hilum without the ureter risks the duodenum and the vena cava.",
          "Dividing the gonadal vein instead of the ureter injures the urinary tract.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "vessel", title: "Control the renal artery", description: "Secure the arterial inflow first.",
        choices: [
          "Isolate the renal artery posterior to the vein and ligate it with a vascular stapler.",
          "Ligate the renal vein first to reduce congestion.",
          "Divide the artery flush with the aorta.",
        ],
        feedback: [
          "The artery is controlled first — the correct sequence.",
          "Ligating the vein first engorges the kidney and increases bleeding.",
          "Dividing flush with the aorta risks an aortic injury.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "vessel", title: "Control the renal vein", description: "Secure the venous outflow.",
        choices: [
          "Ligate the renal vein at the vena cava with a vascular stapler, checking for a thrombus.",
          "Ligate the renal vein without checking for a tumor thrombus.",
          "Clamp the vena cava broadly to control the vein.",
        ],
        feedback: [
          "The vein is controlled at the cava with the thrombus assessed.",
          "Missing a thrombus can embolize during manipulation.",
          "Clamping the cava broadly risks caval injury and hypotension.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Mobilize the kidney within Gerota's fascia", description: "Dissect the kidney with its envelope.",
        choices: [
          "Mobilize the kidney within Gerota's fascia, keeping the adrenal on the specimen for a radical nephrectomy.",
          "Open Gerota's fascia and dissect the kidney bare.",
          "Mobilize the kidney bluntly with the fingers.",
        ],
        feedback: [
          "The kidney is mobilized within Gerota's fascia as a radical resection requires.",
          "Dissecting the kidney bare risks tumor spillage and incomplete resection.",
          "Blunt finger mobilization risks the hilum and the vena cava.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "nerve", title: "Protect the duodenum on the right", description: "The duodenum overlies the right renal hilum.",
        choices: [
          "Kocherize the duodenum and reflect it medially off the vena cava.",
          "Retract the duodenum with a metal retractor forcefully.",
          "Dissect through the duodenum to reach the hilum.",
        ],
        feedback: [
          "The duodenum is reflected safely off the cava.",
          "Forceful retraction risks a duodenal serosal tear.",
          "Dissecting through the duodenum is a catastrophic injury.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "bleed", title: "Control a caval tear", description: "The vena cava is bleeding during hilar dissection.",
        choices: [
          "Apply pressure, obtain proximal and distal control, and repair the tear with fine sutures.",
          "Pack the area and close the abdomen.",
          "Apply clips across the tear.",
        ],
        feedback: [
          "The caval injury is controlled and repaired.",
          "Packing alone allows continued venous bleeding.",
          "Clipping a caval tear is ineffective and can worsen it.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "verify", title: "Check the renal vein for thrombus", description: "Confirm the vein is clear before dividing it.",
        choices: [
          "Inspect and palpate the renal vein for tumor thrombus before stapling.",
          "Staple the vein and check the specimen later.",
          "Assume the imaging was accurate and skip the check.",
        ],
        feedback: [
          "The vein is confirmed clear — safe to divide.",
          "Stapling over a thrombus risks embolization.",
          "Imaging cannot substitute for intraoperative assessment.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "core", title: "Divide the ureter", description: "Complete the specimen.",
        choices: [
          "Clip and divide the ureter at an appropriate level and remove the specimen.",
          "Pull the ureter until it snaps.",
          "Leave the ureter attached and close.",
        ],
        feedback: [
          "The ureter is divided cleanly and the specimen removed.",
          "Avulsing the ureter risks a leak and incomplete resection.",
          "Leaving the ureter attached is an incomplete resection.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "verify", title: "Check hemostasis and the contralateral kidney", description: "Confirm the field is dry.", f: { test: "the renal bed and the contralateral kidney function", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      { kind: "verify", title: "Check the renal vein stump", description: "Confirm the staple line is secure and the cava is intact.", f: { test: "the renal vein staple line and the vena cava", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      { kind: "exposure", title: "Inspect the adrenal bed", description: "Check the bed for bleeding after the specimen is out.", f: { structure: "the adrenal bed", landmark: "the diaphragm and the cava" } },
      { kind: "bleed", title: "Control a lumbar bleeder", description: "A lumbar vessel is bleeding in the renal bed.", f: { vessel: "the lumbar vessels in the renal bed", wrongVessels: ["the aorta", "the iliac artery"] } },
      { kind: "verify", title: "Confirm the bowel is intact", description: "Check the colon and the duodenum after the retraction.", f: { test: "the colon and the duodenum for injury", wrongTests: ["a routine liver biopsy", "a CT scan"] } },
      { kind: "closure", title: "Close the wound", description: "Close the fascia and skin in layers.", f: { structure: "the abdominal wall layers" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major abdominal surgery carries thrombosis risk." },
      { kind: "postop", title: "Watch for bleeding", description: "Monitor the hemoglobin and the vitals after the resection.", f: { test: "the hemoglobin and the vitals", wrongTests: ["a routine CT scan", "an ultrasound"] } },
      { kind: "postop", title: "Monitor the urine output", description: "Track the output of the remaining kidney.", f: { test: "the urine output and the creatinine", wrongTests: ["a routine CT scan", "a blood panel"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the flank or abdominal incision.", f: { test: "the pain scores", wrongTests: ["a routine CT scan", "a blood panel"] } },
      { kind: "postop", title: "Wound care", description: "Define the wound care for the incision.", f: { test: "the wound for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Blood pressure management", description: "Tighten the blood pressure control for the single kidney.", f: { test: "the blood pressure readings", wrongTests: ["a routine CT scan", "a blood panel"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the imaging.", f: { test: "the pathology and the surveillance imaging", wrongTests: ["a routine liver biopsy", "a CT scan of the chest"] } },
      { kind: "postop", title: "Surveillance plan", description: "Define the imaging surveillance for recurrence.", f: { test: "the surveillance imaging schedule", wrongTests: ["a routine blood panel", "an ultrasound"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, wound care, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Return to activity", description: "Define the lifting and activity restrictions.", f: { test: "the activity tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
      { kind: "postop", title: "Lifestyle counseling", description: "Review the diet, fluids, and renal-protective habits.", f: { test: "the renal-protective habits", wrongTests: ["a routine blood panel", "a CT scan"] } },
      {
        kind: "postop", title: "Monitor renal function", description: "The remaining kidney must compensate.",
        choices: [
          "Monitor urine output and creatinine closely in the first 48 hours.",
          "Check creatinine only at the clinic visit.",
          "Discharge without monitoring the remaining kidney.",
        ],
        feedback: [
          "Renal function is monitored as the remaining kidney compensates.",
          "Delayed checks can miss acute kidney injury.",
          "No monitoring risks missing silent renal failure.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan recovery and follow-up", description: "Define the surveillance plan.",
        choices: [
          "Arrange follow-up with the pathology result and a surveillance imaging plan.",
          "No follow-up is needed after nephrectomy.",
          "Schedule a biopsy of the remaining kidney.",
        ],
        feedback: [
          "Surveillance matches the pathology and staging.",
          "Skipping follow-up misses recurrence.",
          "A biopsy of the remaining kidney is not indicated.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Blood pressure and lifestyle", description: "Address the hypertension and lifestyle factors.",
        choices: [
          "Optimize blood pressure control and discuss lifestyle modifications.",
          "Discontinue all antihypertensives after the nephrectomy.",
          "No lifestyle discussion is needed.",
        ],
        feedback: [
          "Blood pressure and renal protection are optimized.",
          "Stopping antihypertensives can cause rebound hypertension.",
          "Missing the discussion loses a renal-protection opportunity.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      }
    ],
  },
];
