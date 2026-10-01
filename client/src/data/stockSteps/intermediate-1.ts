// ─────────────────────────────────────────────────────────────────────────────
// Intermediate surgery step banks (1 of 2) — 30-40 science-based steps each.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProcedureBank } from "./stepBuilder";
import { CHOLECYSTECTOMY_BANK } from "./tailored/cholecystectomy";

export const INTERMEDIATE_BANKS_1: ProcedureBank[] = [
  CHOLECYSTECTOMY_BANK,

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
      risks: ["hemorrhage", "nerve_injury", "infection", "thrombosis", "fluid_overload", "cardiac_arrhythmia", "hypoxia", "anaphylaxis"],
      instrument: "an arthroscope and a tunnel reamer",
      position: "supine with a lateral post and a foot support",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "22-year-old soccer player, positive Lachman test",
    },
    steps: [
      { kind: "preop", title: "Confirm the diagnosis and plan", description: "Confirm the Lachman test and imaging findings before induction." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Bone tunnels make infection prophylaxis critical." },
      { kind: "position", title: "Position the knee", description: "A lateral post and foot support allow a 90° flexed knee." },
      {
        kind: "access", title: "Establish the portals", description: "Place the anterolateral viewing and anteromedial working portals.",
        choices: [
          "Place the anterolateral viewing and anteromedial working portals at the patellar margins.",
          "Use a high suprapatellar portal for viewing and skip the working portal.",
          "Make a single posterolateral portal and work through it alone.",
        ],
        feedback: [
          "Standard anterolateral viewing plus anteromedial working portals give full access to the notch.",
          "A high suprapatellar portal angles poorly into the notch and risks the articular cartilage.",
          "A single posterolateral portal cannot instrument the ACL footprint safely.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
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
      {
        kind: "verify", title: "Wash out the joint", description: "Irrigate the joint to remove debris before closure.",
        choices: [
          "Irrigate the joint thoroughly and suction out all bone and graft debris before closure.",
          "Skip the washout — the graft site is clean and the joint will clear on its own.",
          "Close while the tourniquet is still inflated to keep the field dry.",
        ],
        feedback: [
          "A thorough washout removes the debris that would otherwise irritate the joint and seed infection.",
          "Retained debris causes postoperative irritation and can seed infection — always wash out.",
          "Closing under tourniquet hides the bleeding that appears on deflation — release it and confirm a dry field.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "closure", title: "Close the portals", description: "Close the skin and apply the dressing.", f: { structure: "the portal sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Knee surgery carries a measurable thrombosis risk." },
      {
        kind: "postop", title: "Cryotherapy and elevation", description: "Day 1: the knee is swollen and warm.",
        choices: [
          "Use a cryotherapy cuff in 20-minute cycles and elevate the leg above the heart.",
          "Apply ice directly to the skin for hours at a time.",
          "Keep the leg hanging down over the bed edge to ease pain.",
        ],
        feedback: [
          "Cold and elevation reduce swelling and pain safely.",
          "Prolonged direct ice freezes the skin and can injure the superficial nerves.",
          "A dependent leg swells, and venous pooling raises the clot risk.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Watch for deep infection", description: "Day 5: the knee is hot, with fever of 38.5°C.",
        choices: [
          "Aspirate the knee for cell count and culture, and arrange washout if infected.",
          "Start oral antibiotics and review in 2 weeks.",
          "Put the fever down to the anesthetic and ignore it.",
        ],
        feedback: [
          "A septic knee after reconstruction needs aspiration and urgent washout to save the graft.",
          "Oral antibiotics alone let the infection destroy the graft and the cartilage.",
          "Ignoring a hot knee with fever lets septic arthritis progress.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Muscle activation exercises", description: "The quadriceps are inhibited on day 1.",
        choices: [
          "Start quad sets, straight-leg raises, and ankle pumps on day 1.",
          "Rest the leg completely for 2 weeks.",
          "Start heavy open-chain leg extensions with weights now.",
        ],
        feedback: [
          "Early activation prevents quadriceps shutdown and helps venous return.",
          "Complete rest wastes the quadriceps and raises the clot risk.",
          "Heavy open-chain extension early stretches the new graft.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Brace and crutch plan", description: "The patient is going home tomorrow.",
        choices: [
          "Weight-bear as tolerated with crutches and a hinged brace locked straight for walking at first.",
          "No crutches — walk normally without support today.",
          "Stay non-weight-bearing in bed for a month.",
        ],
        feedback: [
          "Protected early walking helps recovery without risking a fall.",
          "Walking unsupported with a weak quad risks a fall onto the fresh knee, bleeding into the joint.",
          "A month in bed invites a DVT.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Return-to-work guidance", description: "The patient is a student and plays competitive soccer.",
        choices: [
          "Back to classes within 1–2 weeks; sport only after criteria-based testing, usually 9–12 months.",
          "Return to soccer training at 6 weeks if the knee feels fine.",
          "Avoid school for 3 months.",
        ],
        feedback: [
          "Criteria-based return lowers re-rupture risk.",
          "Early pivoting sport stresses an immature graft — re-rupture bleeds into the joint.",
          "Long inactivity weakens the leg and raises the clot risk.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Long-term graft protection", description: "The patient asks how to avoid another tear.",
        choices: [
          "Recommend a neuromuscular prevention program focusing on landing and cutting technique.",
          "Recommend a rigid brace for every game forever instead of training.",
          "Tell the patient the new graft is stronger than the original.",
        ],
        feedback: [
          "Prevention programs reduce re-injury rates.",
          "A brace does not replace neuromuscular control — the knee re-injures.",
          "Overconfidence leads to early high-risk activity and graft rupture.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the post-op review.",
        choices: [
          "Review at 2 weeks for the wound and at 6 weeks for motion and strength.",
          "Review only at 1 year.",
          "No review — the physiotherapist will manage everything.",
        ],
        feedback: [
          "Early reviews catch stiffness, infection, and graft problems.",
          "A wound infection or stiff knee goes unnoticed for months.",
          "Complications like infection need a surgeon's review.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "The patient is ready to go home.",
        choices: [
          "Explain wound care, calf pain or swelling, fever, and a hot knee as reasons to return.",
          "Give only the physiotherapy leaflet.",
          "Tell the patient calf pain is normal after knee surgery.",
        ],
        feedback: [
          "Clear warning signs catch infection and DVT early.",
          "Without warning signs, a knee infection is reported late.",
          "Calf pain can be a DVT — dismissing it risks a pulmonary embolus.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Plan for the second knee", description: "The patient worries about the other knee.",
        choices: [
          "Recommend the same neuromuscular program for both legs.",
          "Recommend prophylactic ACL surgery on the healthy knee.",
          "Advise no exercise for the other leg.",
        ],
        feedback: [
          "Prevention training lowers the risk of a contralateral tear.",
          "Operating on a healthy knee adds surgical risks — infection among them — without benefit.",
          "Inactivity weakens the leg and raises the clot risk.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
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
      {
        kind: "postop", title: "Monitor for effusion and infection", description: "The knee has a moderate effusion at 1 week.",
        choices: [
          "Examine the knee; aspirate if tense or if infection is suspected.",
          "Aspirate every post-op knee in clinic as routine.",
          "Ignore the effusion and increase the exercises.",
        ],
        feedback: [
          "Selective aspiration helps diagnosis without adding risk.",
          "Routine aspiration introduces bacteria into the joint.",
          "A tense hemarthrosis needs assessment, not harder exercise.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
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
      risks: ["hemorrhage", "hypoxia", "cardiac_arrhythmia", "infection", "thrombosis", "fluid_overload", "anaphylaxis"],
      instrument: "a bladder blade and ring forceps",
      position: "supine with left uterine displacement",
      wrongPositions: ["supine without displacement", "prone"],
      detail: "31-year-old G2P1, 39 weeks, non-reassuring fetal tracing, mild asthma",
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
          "Blunt entry at the dome perforates the bladder — urine spills into the field and the cavity is contaminated.",
          "A lateral entry tears into the uterine vessels at the pelvic sidewall.",
        ],
        wrongComps: ["infection", "hemorrhage"],
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
          "Incising over the dome opens the bladder — an unrecognized cystotomy leaks urine and becomes infected.",
        ],
        wrongComps: ["hemorrhage", "infection"],
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
          "Entering at the os injures the cervix and bladder base — the missed urinary leak becomes an infected collection.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "core", title: "Deliver the baby", description: "Deliver the head and body smoothly.",
        choices: [
          "Deliver the head with a hand, then the shoulders and body, and start a slow oxytocin infusion.",
          "Pull firmly on the head to expedite delivery.",
          "Ask anesthesia for a 10-unit oxytocin IV push as the shoulders deliver.",
        ],
        feedback: [
          "A controlled, atraumatic delivery is achieved.",
          "Firm traction extends the hysterotomy laterally into the uterine vessels.",
          "A rapid 10-unit oxytocin push causes profound vasodilation, tachycardia, and arrhythmia — oxytocin goes in as a slow bolus or infusion.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
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
          "Blind clamping catches the ureter — the urine leak surfaces days later as an infected collection.",
        ],
        wrongComps: ["hemorrhage", "infection"],
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
          "Stitching the bladder edge into the closure creates a vesicouterine fistula — urine leaks and the pelvis becomes infected.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "verify", title: "Inspect the adnexa and pelvis", description: "Check for bleeding and injury before closure.",
        choices: [
          "Inspect both adnexa, the broad ligaments, and the pelvic sidewalls for bleeding or injury before closure.",
          "Close once the uterine incision looks dry, without examining the adnexa.",
          "Ask for more uterine tone and close — the adnexa can be checked at the six-week visit.",
        ],
        feedback: [
          "A systematic look catches the lateral extension, broad-ligament bleed, or adnexal injury that would otherwise declare later.",
          "A bleed from the broad ligament or adnexa can be silent until the patient is in recovery.",
          "Deferring the adnexal check risks missing an infected or torsed adnexa that will present postoperatively.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "verify", title: "Confirm the uterine tone", description: "Re-check the fundal tone after the closure.", f: { test: "the uterine tone and the estimated blood loss", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      {
        kind: "verify", title: "Check the bladder and the ureters", description: "Inspect the bladder and confirm the ureters are intact.",
        choices: [
          "Trace each ureter along the pelvic sidewall and inspect the bladder dome for injury or suture entrapment.",
          "Inspect only the bladder dome — the ureters are deep and hard to see.",
          "Close once the bladder looks dry, without checking the pelvic sidewalls.",
        ],
        feedback: [
          "Tracing both ureters and the bladder dome confirms no injury or entrapment from the lateral extensions.",
          "A ureteral injury can hide at the pelvic brim — it must be looked for, not assumed away.",
          "A sidewall bleed can sit quietly behind the bladder until the patient is in recovery.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "bleed", title: "Control a broad-ligament bleeder", description: "A venous bleeder is seen at the uterine vessels.", f: { vessel: "the uterine vein at the broad ligament", wrongVessels: ["the ovarian artery", "the internal iliac artery"] } },
      { kind: "verify", title: "Confirm the sponge and instrument counts", description: "Complete the counts before closing the uterus.", f: { test: "the sponge and instrument count", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "closure", title: "Close the peritoneum and fascia", description: "Close the layers in order.", f: { structure: "the peritoneum and rectus sheath" } },
      {
        kind: "closure", title: "Close the skin", description: "Subcuticular skin closure.",
        choices: [
          "Approximate the skin edges and close with a subcuticular stitch.",
          "Close the skin with a running locked suture through the full thickness.",
          "Close the skin before confirming the uterine incision is dry — time is short.",
        ],
        feedback: [
          "A subcuticular closure approximates the skin cleanly with minimal tension.",
          "Full-thickness running sutures catch the subcutaneous fat and increase wound infection risk.",
          "Closing over an oozing uterus hides a hemorrhage that will declare in recovery.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Pregnancy and surgery are both prothrombotic." },
      {
        kind: "postop", title: "Monitor the lochia and the tone", description: "Recovery nurse reports steady lochia; the fundus is at the umbilicus.",
        choices: [
          "Palpate the fundus and weigh the pads every 15 minutes for the first 2 hours, then hourly.",
          "Check the lochia once before transfer to the ward.",
          "Rely on the heart rate alone — a young mother will show bleeding with tachycardia first.",
        ],
        feedback: [
          "Scheduled fundal checks and weighed pads catch atony before she loses a large volume.",
          "A single check misses the uterus that relaxes an hour later.",
          "Young, fit mothers compensate — the heart rate can stay normal until she has lost a large volume.",
        ],
        wrongComps: ["hemorrhage", "fluid_overload"],
      },
      {
        kind: "postop", title: "Postoperative antibiotics", description: "Cefazolin was given before incision; the labor was not prolonged.",
        choices: [
          "No further antibiotics — a single pre-incision dose is enough for an uncomplicated section.",
          "Continue IV antibiotics for 5 days as routine.",
          "Switch to oral amoxicillin for a week, even though she has a penicillin allergy listed.",
        ],
        feedback: [
          "A single pre-incision dose is standard; extra doses add resistance and side effects without benefit.",
          "Prolonged routine antibiotics breed resistant organisms and C. difficile — the infection that follows is harder to treat.",
          "Ignoring a listed penicillin allergy risks an anaphylactic reaction.",
        ],
        wrongComps: ["infection", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Analgesia while breastfeeding", description: "She plans to breastfeed and asks what she can take.",
        choices: [
          "Regular paracetamol and ibuprofen, with short-course oral opioid only for breakthrough pain.",
          "Codeine every 4 hours as the main analgesic.",
          "Paracetamol alone — anything stronger is unsafe while breastfeeding.",
        ],
        feedback: [
          "Paracetamol and NSAIDs are compatible with breastfeeding and cut opioid needs.",
          "Codeine is avoided in breastfeeding — ultra-rapid metabolizers pass morphine to the baby, and the mother's breathing is depressed too.",
          "Undertreated pain keeps her in bed, and immobility after a section raises the clot risk.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "postop", title: "Wound care", description: "The dressing is dry on day 1; her BMI is 38.",
        choices: [
          "Remove the dressing at 24–48 hours, keep the fold clean and dry, and check the wound before discharge.",
          "Leave the dressing on until the 6-week check.",
          "Apply a fresh dressing daily without looking at the wound.",
        ],
        feedback: [
          "Obesity raises wound-infection risk; early inspection catches it.",
          "A dressing left for weeks hides a hematoma collecting under the fold.",
          "Changing dressings without inspecting the wound misses early cellulitis.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Thromboprophylaxis after a section", description: "She had an emergency section and a BMI of 38.",
        choices: [
          "Give LMWH for 10 days after discharge, with stockings and early mobilization.",
          "Stop the LMWH at discharge — she is walking now.",
          "Start LMWH 1 hour after the spinal catheter is removed without checking timing.",
        ],
        feedback: [
          "Emergency section plus obesity puts her in the high-risk group for postpartum VTE; extended LMWH is recommended.",
          "The postpartum clot risk persists for weeks — stopping at discharge leaves her exposed.",
          "LMWH timed too close to the neuraxial catheter removal risks a spinal epidural hematoma.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Blood pressure in recovery", description: "Her BP is 152/98 on two readings; no headache.",
        choices: [
          "Recheck, send preeclampsia labs, and treat if it stays at or above 150/100.",
          "Ignore it — BP rises after surgery from pain.",
          "Give a large IV fluid bolus to protect the kidneys.",
        ],
        feedback: [
          "Postpartum preeclampsia can appear after delivery and needs labs and treatment of severe-range pressures.",
          "Postpartum preeclampsia left untreated can progress to seizures and stroke.",
          "Preeclamptic patients have leaky capillaries — a large bolus causes pulmonary edema.",
        ],
        wrongComps: ["cardiac_arrhythmia", "fluid_overload"],
      },
      {
        kind: "postop", title: "Urinary catheter and voiding", description: "The catheter has been in since the spinal.",
        choices: [
          "Remove the catheter at 12 hours and confirm she voids adequately within 6 hours.",
          "Leave the catheter for 3 days to rest the bladder.",
          "Remove it and discharge without checking that she has voided.",
        ],
        feedback: [
          "Early removal with a voiding check prevents both infection and unrecognized retention.",
          "Each extra catheter day raises the risk of urinary infection.",
          "Unrecognized retention after a spinal overdistends the bladder and blocks uterine contraction — the bleeding picks up.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Anemia check", description: "Estimated blood loss was 1,100 mL.",
        choices: [
          "Check hemoglobin on day 1 and give oral or IV iron if low; transfuse only if symptomatic.",
          "Transfuse two units now to be safe.",
          "Skip the blood count — she looks well.",
        ],
        feedback: [
          "A day-1 count after a large bleed guides iron or transfusion.",
          "Routine transfusion in a stable patient adds volume and transfusion risk — two units into a young mother can overload her.",
          "An unrecognized low hemoglobin leaves her with no reserve if bleeding recurs.",
        ],
        wrongComps: ["fluid_overload", "hemorrhage"],
      },
      {
        kind: "postop", title: "Handover to the ward", description: "She is ready to leave recovery.",
        choices: [
          "Hand over the blood loss, uterotonic plan, BP trend, and LMWH timing to the ward midwife.",
          "Send her with the notes only — the ward will read them.",
          "Hand over the baby's details and skip the mother's surgical issues.",
        ],
        feedback: [
          "A structured handover makes the ward watch for the specific risks of this case.",
          "Unread notes mean nobody watches for bleeding when the oxytocin stops.",
          "Leaving out the mother's BP trend means rising pressures go unnoticed on the ward.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Monitor the mother", description: "Watch for postpartum hemorrhage and vitals.",
        choices: [
          "Monitor vitals, lochia, and uterine tone closely for the first 24 hours.",
          "Check vitals once and discharge from recovery.",
          "Check vitals and lochia, but skip the temperature and wound checks until discharge.",
        ],
        feedback: [
          "Postpartum monitoring catches delayed hemorrhage.",
          "A single check misses late atonic bleeding.",
          "Without temperature and wound checks, early endometritis or wound infection goes unnoticed.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Uterotonic plan in recovery", description: "She had an atonic uterus in theatre and a history of asthma.",
        choices: [
          "Continue the oxytocin infusion for 4–6 hours and reassess the fundal tone and blood loss.",
          "Stop the oxytocin on arrival in recovery — the uterus contracted well at closure.",
          "Add carboprost now as routine prophylaxis against further atony.",
        ],
        feedback: [
          "Continued oxytocin covers the window when a previously atonic uterus is most likely to relax again.",
          "An atonic uterus that firmed up in theatre can relax again once the oxytocin stops — the bleeding returns.",
          "Carboprost causes bronchospasm and is contraindicated in asthma — her saturation falls.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
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
          "Arrange a wound and blood-pressure check within 1–2 weeks and teach the warning signs.",
          "Review at the routine 6-week postnatal check only.",
          "Discharge without teaching the signs of heavy bleeding — the lochia is light today.",
        ],
        feedback: [
          "Early review catches wound infection, bleeding, and mood problems when they are most likely to appear.",
          "Wound infection and endometritis present in the first two weeks — well before a 6-week check.",
          "Secondary postpartum hemorrhage can start days after discharge; she must know when to come back.",
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
      vteHigh: true,
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
      risks: ["thrombosis", "infection", "nerve_injury", "hemorrhage", "fluid_overload", "cardiac_arrhythmia", "hypoxia", "anaphylaxis"],
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
      {
        kind: "vessel", title: "Protect the posterior structures", description: "The popliteal artery and vein lie just behind the posterior capsule.",
        choices: [
          "Keep the knee flexed with a retractor behind the tibia and make the posterior cuts under direct vision, never plunging the saw.",
          "Push the saw through the posterior cortex to finish the tibial cut cleanly.",
          "Strip the posterior capsule off the femur with cautery to gain extra flexion space.",
        ],
        feedback: [
          "A protected, controlled posterior cut keeps the saw away from the popliteal vessels.",
          "Plunging through the posterior cortex can lacerate the popliteal artery — a limb-threatening bleed.",
          "Deep cautery on the posterior capsule can burn the tibial and peroneal nerves just behind it.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
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
      {
        kind: "core", title: "Prepare the patella", description: "Resurface the patella appropriately.",
        f: { structure: "the patellar articular surface" },
        choices: [
          "Evert the patella, resect the articular surface, and resurface with a patellar button tracking neutrally.",
          "Over-resect the patella to a thin shell to gain extra flexion.",
          "Forcefully evert the patella without protecting the patellar tendon origin.",
        ],
        feedback: [
          "The patella is resurfaced and tracks neutrally in the trochlear groove.",
          "Over-resection leaves the patella thin and prone to fracture.",
          "Forceful eversion can avulse the patellar tendon insertion.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
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
      {
        kind: "postop", title: "Cryotherapy and elevation", description: "Day 1: the knee is swollen.",
        choices: [
          "Use a cold-compression device in cycles and elevate the leg.",
          "Keep ice on the bare skin continuously.",
          "Keep the leg dependent to help bending.",
        ],
        feedback: [
          "Cold compression reduces swelling and pain.",
          "Continuous ice on bare skin burns it and can injure the superficial nerves.",
          "A dependent leg swells, and venous pooling raises the clot risk.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Watch for wound ooze", description: "Day 2: the dressing is soaked.",
        choices: [
          "Reinforce the dressing, check the wound and the anticoagulant dose, and review if it keeps oozing.",
          "Change the dressing every hour.",
          "Ignore it — oozing is normal after knee replacement.",
        ],
        feedback: [
          "Persistent ooze after a knee replacement risks deep infection; it needs review.",
          "Frequent dressing changes let bacteria into a draining wound over the implant.",
          "An ooze from a hematoma can hide deeper bleeding.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Quadriceps activation", description: "Day 1 physiotherapy.",
        choices: [
          "Start quad sets, straight-leg raises, and ankle pumps.",
          "Rest the leg until the swelling settles completely.",
          "Push hard into flexion beyond pain on day 1.",
        ],
        feedback: [
          "Early activation restores function and venous return.",
          "Prolonged rest raises the clot risk.",
          "Forced flexion through pain tears the fresh repair and bleeds into the joint.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Drain management", description: "A drain was placed; 200 mL in 24 hours.",
        choices: [
          "Remove the drain at 24 hours.",
          "Leave the drain in for a week.",
          "Clamp the drain and leave it in.",
        ],
        feedback: [
          "Early removal limits infection risk.",
          "A long-standing drain is a route for bacteria into the joint replacement.",
          "A clamped drain lets the blood collect into a hematoma.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Blood glucose control", description: "The patient has diabetes; glucose is 14 mmol/L.",
        choices: [
          "Use a variable insulin plan to keep glucose between 6 and 10 mmol/L.",
          "Stop all diabetes medication until discharge.",
          "Give large insulin boluses to normalize the glucose quickly.",
        ],
        feedback: [
          "Good glucose control protects the wound and lowers infection risk.",
          "Stopping treatment lets glucose soar, which impairs healing and invites infection.",
          "Aggressive insulin causes hypoglycemia and, with low potassium, arrhythmias.",
        ],
        wrongComps: ["infection", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Home exercise program", description: "The patient is going home on day 3.",
        choices: [
          "Give a structured program for knee bending, straightening, and walking with a frame.",
          "Tell the patient to rest the knee until the clinic visit.",
          "Tell the patient to kneel on the new knee to stretch it.",
        ],
        feedback: [
          "A home program maintains motion and prevents stiffness.",
          "Resting at home stiffens the knee and raises the clot risk.",
          "Kneeling early puts pressure on the fresh wound, which can split and bleed.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Fall precautions", description: "The patient lives alone.",
        choices: [
          "Arrange a walking frame, remove loose rugs, and check that the home is safe.",
          "Advise walking without aids as soon as possible.",
          "Advise staying in bed at home to avoid falls.",
        ],
        feedback: [
          "Home safety prevents falls onto the new knee.",
          "A fall onto the new knee can fracture around the implant and bleed.",
          "Staying in bed raises the clot risk.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the review.",
        choices: [
          "Review at 6 weeks with an X-ray to check motion and the implant.",
          "No review unless there is a problem.",
          "Review only at 1 year.",
        ],
        feedback: [
          "The 6-week review checks motion, the wound, and implant position.",
          "Stiffness or low-grade infection goes unnoticed without review.",
          "Waiting a year misses the window to treat stiffness.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
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
      { kind: "dvt", title: "DVT prophylaxis", description: "Knee arthroplasty has a high thrombosis risk." },
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
      risks: ["hemorrhage", "infection", "nerve_injury", "thrombosis", "hypoxia", "fluid_overload"],
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
      {
        kind: "landmark", title: "Identify the ureters", description: "Palpate the ureters at the pelvic brim before any clamping.",
        choices: [
          "Identify each ureter crossing the iliac bifurcation at the brim and follow it down the sidewall.",
          "Rely on the preoperative imaging to locate the ureters and start clamping.",
          "Use the uterine vessels as the reference and clamp lateral to them.",
        ],
        feedback: [
          "Seeing the ureter before clamping is the single best protection against injury.",
          "Fibroids distort the pelvis — the ureter is rarely where the scan suggests, and an unseen ureter gets clamped and leaks.",
          "Clamping lateral to the uterine vessels tears into the venous plexus on the pelvic sidewall.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "vessel", title: "Clamp the round ligaments", description: "Divide the round ligaments and open the broad ligament.",
        choices: [
          "Clamp, divide, and ligate the round ligaments, then open the broad ligament parallel to the ureter.",
          "Clamp the round ligament with the ureter in the clamp.",
          "Cut the round ligament without ligation and rely on cautery.",
        ],
        feedback: [
          "The round ligament is divided safely and the broad ligament opened in the avascular window.",
          "A clamped ureter is the classic hysterectomy injury — the urine leak becomes an infected pelvic collection.",
          "Unligated division invites bleeding from the round ligament vessels.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Divide the ovarian vessels", description: "Decide the adnexal management.",
        choices: [
          "Clamp, divide, and ligate the infundibulopelvic ligament at the pelvic brim, clear of the ureter.",
          "Clamp the infundibulopelvic ligament at the brim before the ureter has been seen.",
          "Cut the ovarian vessels with cautery only.",
        ],
        feedback: [
          "The infundibulopelvic ligament is secured with the ureter visualized.",
          "The ureter crosses right under the IP ligament at the brim — a blind clamp catches it and the leak becomes infected.",
          "Cautery alone on these vessels risks delayed hemorrhage.",
        ],
        wrongComps: ["infection", "hemorrhage"],
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
          "Clamping through the bladder leaves a cystotomy — urine leaks into the pelvis and becomes infected.",
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
          "Clamping at the brim takes a large pedicle away from the cervix, and it slips and bleeds.",
          "A ligated ureter causes silent hydronephrosis and an obstructed, infected kidney.",
        ],
        wrongComps: ["hemorrhage", "infection"],
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
          "Mass clamping pulls the ureter into the pedicle — the injury leaks and becomes infected.",
          "A stapler across the parametrium cuts through the venous plexus, and the plexus bleeds between the staples.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Open the vagina and remove the uterus", description: "Complete the hysterectomy.",
        choices: [
          "Open the vagina anteriorly, cut the lateral attachments under vision, and remove the specimen.",
          "Pull the uterus firmly through the vagina to expedite removal.",
          "Open the vagina posteriorly first, through the rectovaginal space.",
        ],
        feedback: [
          "The cuff is opened and the specimen removed under direct vision.",
          "Forceful traction tears the vaginal angles and their vessels.",
          "The rectum sits right behind the posterior fornix — a posterior entry risks a rectal injury and fecal contamination.",
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
          "Skipping the check misses a silent ureteric injury — the leak declares days later as an infected urinoma.",
          "Routine retroperitoneal opening disturbs the sidewall veins and starts a new bleed.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "bleed", title: "Control a pelvic venous bleeder", description: "The uterine venous plexus is oozing.", f: { vessel: "the uterine venous plexus", wrongVessels: ["the external iliac artery", "the ovarian artery"] } },
      {
        kind: "verify", title: "Confirm the ureters again", description: "Re-check both ureters for a pulse before closure.",
        choices: [
          "Re-trace both ureters to their entry into the bladder and confirm each is uninjured and not angulated.",
          "Trust the initial inspection — the ureters were seen early in the case.",
          "Divide any bands crossing the ureters to confirm they are free.",
        ],
        feedback: [
          "A final trace confirms no clamp, suture, or angulation compromised either ureter during the dissection.",
          "The ureters can be caught late at the vaginal angles — without a second look, the leak becomes an infected urinoma.",
          "Those bands carry small vessels — dividing them starts a bleed on the ureter's surface that is hard to control.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "exposure", title: "Inspect the pelvic sidewalls", description: "Look for venous bleeding along the sidewalls.", f: { structure: "the pelvic sidewalls", landmark: "the internal iliac vessels" } },
      { kind: "bleed", title: "Control a cuff-angle bleeder", description: "The vaginal angle is bleeding.", f: { vessel: "the vaginal angle vessels", wrongVessels: ["the external iliac artery", "the obturator artery"] } },
      { kind: "verify", title: "Complete the sponge count", description: "Confirm the counts are correct before the abdomen is closed.", f: { test: "the sponge and instrument count", wrongTests: ["a routine X-ray", "a CT scan"] } },
      {
        kind: "closure", title: "Close the vaginal cuff", description: "Suture the cuff with the angles incorporated.",
        choices: [
          "Close the cuff with absorbable sutures, securing both angles and incorporating the uterosacral ligaments.",
          "Leave the cuff open to drain — it heals by itself.",
          "Close the middle of the cuff and leave the angles to heal on their own.",
        ],
        feedback: [
          "A secure cuff with supported angles prevents bleeding, infection, and later prolapse.",
          "An open cuff exposes the pelvis to vaginal flora — cuff cellulitis and a pelvic abscess follow.",
          "The angles hold the vaginal artery branches — left unsutured, they bleed.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "closure", title: "Close the abdomen", description: "Close the fascia and skin in layers.",
        choices: [
          "Close the rectus sheath with a running suture, then approximate the skin.",
          "Close the skin only and leave the fascia to close on its own.",
          "Close the rectus sheath with a single layer of full-thickness mattress sutures.",
        ],
        feedback: [
          "Layered closure reapproximates the rectus sheath and skin without tension.",
          "Skin-only closure leaves a fascial gap that can eviscerate or herniate and invites infection.",
          "Full-thickness mattress sutures can catch an epigastric vessel and leave poor cosmesis.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Pelvic surgery carries a significant thrombosis risk." },
      {
        kind: "postop", title: "Watch for cuff infection", description: "Day 2: low-grade fever of 37.9°C and mild pelvic ache.",
        choices: [
          "Examine the abdomen and the cuff, send blood tests and cultures, and image the pelvis if a collection is suspected.",
          "Put the fever down to atelectasis and recheck tomorrow.",
          "Start oral antibiotics without examining her.",
        ],
        feedback: [
          "A structured fever work-up after hysterectomy looks for cuff cellulitis, a pelvic abscess, and urinary sources.",
          "A pelvic collection keeps growing while the fever is written off as atelectasis.",
          "Blind antibiotics can mask a pelvic abscess that needs drainage.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Manage the catheter", description: "The catheter has been in since theatre; the ureters were seen intact.",
        choices: [
          "Remove the catheter the morning after surgery and check a post-void residual.",
          "Leave the catheter for a week to protect the bladder.",
          "Remove it and discharge without confirming she has voided.",
        ],
        feedback: [
          "Early removal with a residual check prevents infection and retention.",
          "Every extra catheter day raises the risk of a urinary tract infection.",
          "Unrecognized retention overstretches the bladder and becomes infected.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Anemia follow-up", description: "Preoperative Hb was 9.1 from menorrhagia; blood loss 600 mL.",
        choices: [
          "Check Hb on day 1 and give IV iron; transfuse only if she is symptomatic or Hb is very low.",
          "Transfuse three units to bring her to normal before discharge.",
          "Skip the count — the bleeding source is gone.",
        ],
        feedback: [
          "A day-1 count guides iron or transfusion; IV iron corrects chronic iron deficiency quickly.",
          "Aggressive transfusion in a stable, euvolemic patient overloads her circulation.",
          "A low Hb after the operation leaves her with no reserve if the cuff bleeds.",
        ],
        wrongComps: ["fluid_overload", "hemorrhage"],
      },
      {
        kind: "postop", title: "Wound care", description: "Pfannenstiel wound; the dressing is dry on day 1.",
        choices: [
          "Remove the dressing at 48 hours, keep the wound dry, and check it before discharge.",
          "Leave the dressing untouched until the 6-week review.",
          "Apply antibiotic ointment daily as routine.",
        ],
        feedback: [
          "Early inspection catches wound infection in the skin fold.",
          "A dressing left for weeks hides a wound hematoma.",
          "Routine topical antibiotics don't prevent infection and breed resistance and contact dermatitis.",
        ],
        wrongComps: ["infection", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Early mobilization", description: "She is comfortable on day 1.",
        choices: [
          "Sit out and walk on day 1 with continued LMWH and stockings.",
          "Bed rest until the drain and catheter are out.",
          "Walk on day 1 but stop the LMWH — mobilizing is enough.",
        ],
        feedback: [
          "Early walking plus prophylaxis is standard after major pelvic surgery.",
          "Bed rest after pelvic surgery is a setup for DVT.",
          "Walking alone does not replace chemoprophylaxis in a high-risk pelvic case — a clot can embolize.",
        ],
        wrongComps: ["thrombosis", "hypoxia"],
      },
      {
        kind: "postop", title: "Watch for bleeding", description: "Day 1: light vaginal spotting; HR 88.",
        choices: [
          "Expect light spotting; review promptly for heavy bleeding, a falling Hb, or a rising heart rate.",
          "Pack the vagina as routine for 24 hours.",
          "Tell her any bleeding is normal and can be ignored.",
        ],
        feedback: [
          "Light spotting is expected; heavy bleeding or tachycardia needs examination of the cuff.",
          "Routine packing is uncomfortable, holds bacteria against the fresh cuff, and hides bleeding.",
          "A cuff-angle bleed can be brisk — dismissing it delays control.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Analgesia plan", description: "She reports pain 6/10 on day 1.",
        choices: [
          "Regular paracetamol and an NSAID, with oral opioid for breakthrough pain.",
          "IV morphine PCA for 5 days with no other analgesia.",
          "Paracetamol only — she should tolerate some pain.",
        ],
        feedback: [
          "Multimodal analgesia controls pain with the least opioid.",
          "Prolonged opioid-only PCA depresses breathing and slows recovery.",
          "Poorly controlled pain keeps her in bed, raising the clot risk.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the post-op review.",
        choices: [
          "Review at 6 weeks to check the cuff and discuss the pathology.",
          "No review needed — fibroids are benign.",
          "Review at 6 months only.",
        ],
        feedback: [
          "The 6-week visit checks cuff healing and confirms benign pathology.",
          "Rarely a fibroid is a sarcoma, and cuff granulation or infection needs an exam.",
          "By 6 months a cuff infection or granulation problem has long declared itself.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "She is ready to go home on day 3.",
        choices: [
          "Teach her to report fever, heavy bleeding, leg swelling, or breathlessness, and to avoid intercourse for 6 weeks.",
          "Tell her to resume intercourse whenever she feels ready.",
          "Give no specific warning signs — she can call if worried.",
        ],
        feedback: [
          "Clear warning signs and pelvic rest protect the healing cuff.",
          "Early intercourse can disrupt the cuff and cause bleeding or dehiscence.",
          "Without warning signs, she won't recognize a clot until she is breathless.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Monitor the urine output", description: "Oliguria can signal a ureteric injury.",
        choices: [
          "Track hourly output; if it falls, check the catheter, give one measured fluid challenge, and image the ureters if it stays low.",
          "Treat low output with repeated large fluid boluses until it picks up.",
          "Accept low output — it is common after pelvic surgery.",
        ],
        feedback: [
          "A stepwise work-up separates dehydration from an obstructed or injured ureter.",
          "Low output from an obstructed ureter will not respond — the extra fluid ends up in her lungs.",
          "Low output can be the first sign of a ureteric injury, which then declares as an infected urinoma.",
        ],
        wrongComps: ["fluid_overload", "infection"],
      },
      {
        kind: "postop", title: "Plan recovery", description: "Define activity and follow-up.",
        choices: [
          "Advance diet as tolerated, mobilize early, and arrange a 6-week review.",
          "Restrict activity and delay mobilization for a week.",
          "Discharge to the GP with no gynecology review.",
        ],
        feedback: [
          "Early recovery and a 6-week review are standard.",
          "Delayed mobilization increases thrombosis risk.",
          "Vaginal cuff problems and the pathology result need gynecology review at about 6 weeks.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Hormone plan", description: "The ovaries were conserved; she is on a combined pill for her heavy periods.",
        choices: [
          "The ovaries were conserved, so no hormone replacement is needed; review the fibroid pathology at clinic.",
          "Start estrogen replacement on day 1 as routine after hysterectomy.",
          "Restart her combined contraceptive pill the day after surgery for cycle control.",
        ],
        feedback: [
          "With conserved ovaries, her own hormones continue; the pathology still needs review to exclude sarcoma.",
          "Estrogen started in the immediate post-op window adds to an already high clot risk.",
          "The combined pill has no role after hysterectomy and raises the clot risk — a pulmonary embolus follows.",
        ],
        wrongComps: ["thrombosis", "hypoxia"],
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
      risks: ["infection", "hemorrhage", "nerve_injury", "thrombosis", "cardiac_arrhythmia"],
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
          "Trusting the CT alone leaves the ureter unseen — the dissection runs into the gonadal vessels beside it.",
        ],
        wrongComps: ["infection", "hemorrhage"],
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
          "Flush ligation at the aorta is an oncologic step — for diverticulitis it only adds bleeding risk and endangers the nerves.",
          "Leaving the main trunk risks ischemia of the proximal limb.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
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
          "Dissect widely along the pelvic sidewall to free the inflamed segment.",
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
        wrongComps: ["hemorrhage", "infection"],
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
      {
        kind: "verify", title: "Confirm hemostasis and perfusion", description: "Check the anastomotic limbs and the field.",
        choices: [
          "Check the mesentery for bleeding and that both limbs are pink with bleeding edges.",
          "Accept a dusky proximal limb, since it will pink up.",
          "Close the mesenteric window with deep stitches through the arcade.",
        ],
        feedback: [
          "A well-perfused, dry field lets the anastomosis heal.",
          "A dusky limb leaks.",
          "Stitching through the arcade can bleed or devascularize the limb.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "verify", title: "Re-check the anastomotic limbs", description: "Confirm the perfusion of both limbs once more.",
        choices: [
          "Confirm tension-free limbs with pulsatile mesenteric flow, and mobilize the splenic flexure if needed.",
          "Pull the colon down to reach, even if it is tight.",
          "Trim the proximal limb back to where it looks healthy without checking its blood supply.",
        ],
        feedback: [
          "Tension-free, perfused limbs are the basis of a sound anastomosis.",
          "Tension on the anastomosis causes a leak.",
          "Trimming without checking the supply can leave an ischemic end.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "verify", title: "Inspect the splenic flexure take-down", description: "Confirm no splenic capsular tear from the mobilization.",
        choices: [
          "Inspect the splenic capsule along the splenocolic ligament for a capsular tear or subcapsular hematoma.",
          "Close once the flexure is mobilized — the spleen was not touched directly.",
          "Close over a drain to monitor the splenic bed for delayed bleeding.",
        ],
        feedback: [
          "A capsular tear from traction on the splenocolic ligament is a classic hidden bleed — look for it specifically.",
          "Traction on the flexure can tear the splenic capsule even when the spleen is never touched.",
          "A drain does not stop a capsular bleed and adds an infection risk — control the source now.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "bleed", title: "Control a mesenteric bleeder", description: "A mesenteric vessel is bleeding at the resection line.", f: { vessel: "the mesenteric vessels at the resection", wrongVessels: ["the iliac artery", "the aorta"] } },
      {
        kind: "verify", title: "Confirm the doughnuts", description: "Check both stapler doughnuts are intact and complete.",
        choices: [
          "Check that both doughnuts are complete and do an air leak test under saline.",
          "Discard the doughnuts without inspecting them.",
          "Accept an incomplete doughnut if the air test shows no bubbles.",
        ],
        feedback: [
          "Complete doughnuts and a negative leak test confirm the staple line.",
          "An incomplete doughnut means a defect in the anastomosis.",
          "An incomplete doughnut needs repair or a diverting stoma even with a negative test.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "closure", title: "Close the mesenteric defect and ports", description: "Close the defects and the port sites.", f: { structure: "the mesenteric defect and port sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Pelvic colorectal surgery is high-risk for thrombosis." },
      {
        kind: "postop", title: "Watch for bleeding", description: "Monitor the hemoglobin and the vitals for delayed bleeding.",
        choices: [
          "Check the hemoglobin on day 1 and watch for bright red blood per rectum or tachycardia.",
          "Put blood per rectum down to the staple line and ignore it.",
          "Start full-dose anticoagulation on day 1.",
        ],
        feedback: [
          "Staple-line bleeding usually settles but needs monitoring.",
          "Ongoing bleeding from the staple line can need endoscopic control.",
          "Full anticoagulation on day 1 raises staple-line bleeding.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Manage the nasogastric tube", description: "Define the NG tube plan for the recovery.",
        choices: [
          "Remove the NG tube at the end of the operation as part of enhanced recovery.",
          "Keep the NG tube until he passes flatus.",
          "Keep the NG tube on free drainage for a week.",
        ],
        feedback: [
          "Routine NG decompression is not needed and delays recovery.",
          "Prolonged NG tubes raise aspiration pneumonia and delay feeding.",
          "A week of NG drainage wastes potassium, which provokes arrhythmias, and delays feeding.",
        ],
        wrongComps: ["infection", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Pain control plan", description: "Plan the multimodal analgesia.",
        choices: [
          "Use multimodal analgesia with paracetamol, regional blocks, and minimal opioid.",
          "Use a morphine PCA alone.",
          "Give regular high-dose NSAIDs.",
        ],
        feedback: [
          "Opioid-sparing analgesia speeds the return of bowel function.",
          "Opioids alone delay the return of bowel function.",
          "High-dose NSAIDs may raise the anastomotic leak rate and bleeding.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Wound care", description: "Define the wound and drain care.",
        choices: [
          "Keep the wound dressed for 48 hours and inspect it for redness or discharge.",
          "Soak the wound in the bath from day 1.",
          "Leave the wound undressed from the end of the operation.",
        ],
        feedback: [
          "Covered wounds and inspection cut surgical site infection.",
          "Soaking a fresh wound raises infection.",
          "An uncovered contaminated wound raises infection.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Watch for ileus", description: "Monitor for prolonged ileus after the resection.",
        choices: [
          "Encourage early feeding and mobilization, and check electrolytes if ileus persists.",
          "Keep him nil by mouth until bowel sounds return.",
          "Give prokinetics routinely from day 0.",
        ],
        feedback: [
          "Early feeding and mobility shorten ileus; low potassium prolongs it.",
          "Starvation does not shorten ileus and delays recovery.",
          "Routine prokinetics do not help, and some prolong the QT interval.",
        ],
        wrongComps: ["infection", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology result.",
        choices: [
          "Review at 2–3 weeks with the pathology, checking the wound and for a late collection.",
          "Review at 3 months once he has recovered.",
          "Discharge to the GP with the pathology to follow.",
        ],
        feedback: [
          "An early review catches a late pelvic collection and confirms the pathology is benign diverticular disease.",
          "A pelvic collection or wound infection can smoulder for weeks before a 3-month visit.",
          "The pathology occasionally shows an unexpected cancer — the surgical team must see it and act, not leave it to chance.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Colonoscopy after recovery", description: "He has not had a colonoscopy; the CT showed complicated diverticulitis.",
        choices: [
          "Arrange a colonoscopy at 6–8 weeks to examine the remaining colon and exclude a hidden cancer.",
          "Scope him on day 3 while he is still an inpatient.",
          "No colonoscopy — the diseased segment has been removed.",
        ],
        feedback: [
          "After complicated diverticulitis, a colonoscopy once healed excludes a cancer the CT could have mimicked.",
          "Insufflating a fresh anastomosis on day 3 risks disrupting it — a leak and peritonitis follow.",
          "Diverticulitis and cancer can look alike on CT, and the rest of the colon has never been examined.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the medications, diet, and the warning signs.",
        choices: [
          "Explain the leak warning signs (fever, worsening pain, tachycardia) and give extended LMWH for 4 weeks.",
          "Advise return only for wound problems.",
          "Stop the LMWH at discharge.",
        ],
        feedback: [
          "Leaks can present after discharge, and major pelvic surgery in an older, obese patient warrants extended clot prophylaxis.",
          "A leak presents with fever and pain, not a wound problem.",
          "Extended LMWH after major pelvic surgery cuts late venous thromboembolism.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Return to activity", description: "Define the lifting and activity restrictions.",
        choices: [
          "Advise walking daily, no heavy lifting for 6 weeks, and driving when he can brake hard without pain.",
          "Allow heavy lifting from 2 weeks.",
          "Advise bed rest for the first week at home.",
        ],
        feedback: [
          "Gradual activity helps recovery and protects the wound.",
          "Early heavy lifting risks an incisional hernia.",
          "Bed rest at home raises clot risk.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
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
          "Discharge to the GP and ask them to chase the pathology result.",
          "Schedule a routine CT scan before discharge.",
        ],
        feedback: [
          "Structured follow-up reviews pathology and recovery.",
          "The pathology decides on further treatment; the surgical team must review it, not a GP chasing results.",
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
      risks: ["hemorrhage", "infection", "nerve_injury", "hypoxia", "fluid_overload", "cardiac_arrhythmia", "thrombosis", "anaphylaxis"],
      instrument: "a 30° laparoscope and a clip applier",
      position: "supine in reverse Trendelenburg with a left tilt",
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
      {
        kind: "verify", title: "Re-inspect the liver bed", description: "Confirm the bed is dry before removal.",
        choices: [
          "Desufflate briefly and re-inspect the gallbladder fossa for oozing before removing the ports.",
          "Trust the earlier inspection and remove the ports once the gallbladder is out.",
          "Close over a subhepatic drain to manage any oozing from the bed.",
        ],
        feedback: [
          "Lowering the pneumoperitoneum uncovers the venous ooze that full insufflation masks.",
          "A bed that is dry only under pressure can bleed after the abdomen is decompressed.",
          "A drain does not stop a bed ooze and adds an infection risk — control the source now.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "bleed", title: "Control a port-site bleeder", description: "A port site is bleeding on removal.", f: { vessel: "the epigastric vessels at the port site", wrongVessels: ["the iliac artery", "the femoral artery"] } },
      { kind: "verify", title: "Confirm the sponge count", description: "Complete the counts before closure.", f: { test: "the instrument and sponge count", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "closure", title: "Close the port sites", description: "Close the fascia at the larger sites.", f: { structure: "the port site fascia" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for laparoscopy." },
      {
        kind: "postop", title: "Watch for port-site infection", description: "Day 5: the umbilical port is red.",
        choices: [
          "Examine the wound, open and drain any pus, and give antibiotics if cellulitis spreads.",
          "Cover it with a new dressing and ignore it.",
          "Start long-term antibiotics for every red port site.",
        ],
        feedback: [
          "Draining pus and treating spreading cellulitis controls port-site infection.",
          "An undrained infection spreads into the abdominal wall.",
          "Blanket antibiotics breed resistance, and each course carries an allergy risk.",
        ],
        wrongComps: ["infection", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Post-op diet progression", description: "The patient is nauseated on day 0.",
        choices: [
          "Start clear fluids and advance as tolerated with antiemetics.",
          "Keep the patient nil by mouth for 3 days.",
          "Give a large fatty meal to test the digestion.",
        ],
        feedback: [
          "Early diet as tolerated is standard after laparoscopy.",
          "Prolonged starvation delays recovery and dehydrates the patient.",
          "A large fatty meal on day 0 triggers vomiting and aspiration risk.",
        ],
        wrongComps: ["fluid_overload", "hypoxia"],
      },
      {
        kind: "postop", title: "Biliary symptom warning", description: "The patient is going home.",
        choices: [
          "Teach that jaundice, fever, or worsening pain need urgent review.",
          "Tell the patient pain always settles by itself.",
          "Tell the patient yellow skin is expected after gallbladder removal.",
        ],
        feedback: [
          "Early review catches a bile leak or retained stone.",
          "Worsening pain can be a bleed from the liver bed — it needs assessment, not waiting.",
          "Jaundice signals bile duct obstruction or injury, which can progress to cholangitis.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Return to activity", description: "The patient asks about lifting.",
        choices: [
          "Normal activity as tolerated; avoid heavy lifting for 2 weeks.",
          "Bed rest for 2 weeks.",
          "Heavy lifting from the next day.",
        ],
        feedback: [
          "Early activity speeds recovery after laparoscopy.",
          "Bed rest raises the clot risk.",
          "Heavy straining early can open a port-site hernia and bleed.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Review the pathology", description: "The gallbladder was sent for histology.",
        choices: [
          "Check the pathology, and review wound and bloods at the same visit.",
          "Skip the visit — gallstone disease is always benign.",
          "Recall the patient only if the pathology is abnormal.",
        ],
        feedback: [
          "One review catches an incidental cancer and any late wound or bile problem.",
          "Without a review, a smouldering collection or port-site infection goes unnoticed.",
          "A pathology-only recall misses a late bile leak presenting with pain and fever.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the review.",
        choices: [
          "Review by phone or clinic at 2–6 weeks to check symptoms and the pathology.",
          "No follow-up at all.",
          "Review at 1 year only.",
        ],
        feedback: [
          "A simple review confirms recovery and the pathology.",
          "A late bile leak or infection goes unnoticed.",
          "A year is too late for early complications.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Retained stone risk", description: "Liver tests were mildly raised before surgery.",
        choices: [
          "Explain that a retained duct stone can cause pain, jaundice, or fever, and needs ERCP.",
          "Say retained stones never happen.",
          "Order routine ERCP for everyone.",
        ],
        feedback: [
          "Knowing the signs allows early ERCP if a stone was left.",
          "A missed retained stone can cause cholangitis.",
          "Routine ERCP adds risks of pancreatitis and bleeding.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Going home the same day.",
        choices: [
          "Give written wound care and warning signs: fever, jaundice, worsening pain, calf swelling.",
          "Give no written advice.",
          "Advise returning only if in severe pain.",
        ],
        feedback: [
          "Clear instructions catch complications early.",
          "Without advice, an early infection is reported late.",
          "Waiting for severe pain delays treatment of a clot or leak.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Long-term dietary advice", description: "The patient asks about diet.",
        choices: [
          "Explain that most people eat normally; reduce fat if loose stools occur.",
          "Advise a strict fat-free diet for life.",
          "Advise fasting for a week to rest the bowel.",
        ],
        feedback: [
          "Most patients need no long-term restrictions.",
          "An unnecessary lifelong diet causes poor nutrition.",
          "Fasting dehydrates and weakens the patient.",
        ],
        wrongComps: ["infection", "fluid_overload"],
      },
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
      {
        kind: "postop", title: "Watch for jaundice and pain", description: "Day 2: new jaundice and upper abdominal pain.",
        choices: [
          "Check LFTs and arrange imaging for a bile leak or duct injury.",
          "Discharge with painkillers.",
          "Put it down to post-op gas pain.",
        ],
        feedback: [
          "Early imaging finds a bile duct injury while it can be repaired.",
          "Painkillers mask a bleed from the cystic artery stump or liver bed.",
          "A duct injury becomes cholangitis if ignored.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Diet and follow-up", description: "Plan the diet and clinic visit.",
        choices: [
          "Advance the diet as tolerated and arrange a 2-week follow-up.",
          "Keep the patient fasting until the first bowel movement.",
          "Tell the patient to return only if the pain or jaundice returns.",
        ],
        feedback: [
          "Early diet and follow-up are appropriate.",
          "Prolonged fasting is unnecessary.",
          "Return-if-worse misses late bile leaks and retained stones that are easier to treat early.",
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
      risks: ["hemorrhage", "cardiac_arrhythmia", "infection", "nerve_injury", "thrombosis"],
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
      {
        kind: "exposure", title: "Reflect the colon and identify the retroperitoneum", description: "Enter the correct plane.",
        choices: [
          "Incise the white line of Toldt and reflect the colon medially to open the retroperitoneum in the avascular plane.",
          "Divide the lateral peritoneal attachments blindly to speed the reflection.",
          "Reflect the colon medially without identifying the ureter and gonadal vein beneath it.",
        ],
        feedback: [
          "The avascular plane along the white line of Toldt exposes the retroperitoneum without trauma.",
          "Blind division of the peritoneum risks the colon, the mesenteric vessels, and the underlying ureter.",
          "The ureter and gonadal vein travel just beneath the reflected colon — they must be identified first.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
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
          "Mistaking the gonadal vein for the ureter leaves the real ureter unseen — it is injured later and leaks urine.",
        ],
        wrongComps: ["hemorrhage", "infection"],
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
          "Ligate the renal vein at the cava straight away to cut the tumor's venous drainage.",
          "Place a side-biting clamp across most of the cava to control the vein.",
        ],
        feedback: [
          "The vein is controlled at the cava with the thrombus assessed.",
          "An unchecked tumor thrombus in the vein can break off during ligation and embolize to the lungs.",
          "A large caval clamp cuts venous return, dropping the pressure and provoking arrhythmia, and risks tearing the cava.",
        ],
        wrongComps: ["thrombosis", "cardiac_arrhythmia"],
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
        wrongComps: ["thrombosis", "hemorrhage"],
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
          "Avulsing the ureter leaves an open stump that leaks urine into the retroperitoneum.",
          "Leaving the ureter attached means pulling the specimen out against it — the gonadal vein alongside tears.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check hemostasis and the contralateral kidney", description: "Confirm the field is dry.",
        choices: [
          "Inspect the renal bed at normal pressure, check the adrenal and lumbar vessels, and confirm urine output.",
          "Close once the bed looks dry at the current low pressure.",
          "Pack the renal fossa and close.",
        ],
        feedback: [
          "Inspection at normal pressure shows bleeders that low pressure hides.",
          "A bed dry at low pressure can bleed as the pressure recovers.",
          "Packs hide an active bleeder and need a second operation.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "verify", title: "Check the renal vein stump", description: "Confirm the staple line is secure and the cava is intact.",
        choices: [
          "Inspect the vein stump and cava for staple-line bleeding and a retained thrombus.",
          "Oversew the stump with a deep running stitch into the cava.",
          "Close without inspecting the stump.",
        ],
        feedback: [
          "A secure stump without thrombus prevents bleeding and embolism.",
          "A deep stitch into the cava can narrow it or tear it.",
          "An unchecked stump can hide bleeding or residual thrombus.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "verify", title: "Inspect the adrenal bed", description: "Check the bed for bleeding after the specimen is out.",
        choices: [
          "Inspect the adrenal bed along the diaphragm and the vena cava for venous oozing after the specimen is out.",
          "Close once the specimen is out — the clips should have controlled the bed.",
          "Close over a drain in the adrenal bed to monitor for delayed bleeding.",
        ],
        feedback: [
          "The adrenal veins are short and fragile — the bed must be provably dry against the cava and diaphragm.",
          "A clip that has slipped from the short adrenal vein bleeds into a space that hides it.",
          "A drain does not control an adrenal vein bleed and adds an infection risk — verify the bed is dry.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "bleed", title: "Control a lumbar bleeder", description: "A lumbar vessel is bleeding in the renal bed.", f: { vessel: "the lumbar vessels in the renal bed", wrongVessels: ["the aorta", "the iliac artery"] } },
      {
        kind: "verify", title: "Confirm the bowel is intact", description: "Check the colon and the duodenum after the retraction.",
        choices: [
          "Inspect the colon, duodenum, and spleen for retraction injury before closing.",
          "Close without inspecting the bowel.",
          "Oversew any serosal tear with a deep stitch through the full wall.",
        ],
        feedback: [
          "A missed bowel or duodenal injury causes peritonitis.",
          "An unrecognized injury leaks after surgery.",
          "Full-thickness stitches on a serosal tear can narrow or perforate the bowel.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "closure", title: "Close the wound", description: "Close the fascia and skin in layers.", f: { structure: "the abdominal wall layers" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major abdominal surgery carries thrombosis risk." },
      {
        kind: "postop", title: "Watch for bleeding", description: "Monitor the hemoglobin and the vitals after the resection.",
        choices: [
          "Check the hemoglobin and drain on day 1 and watch for tachycardia or hypotension.",
          "Put tachycardia down to pain and give more opioid.",
          "Start full-dose anticoagulation on day 1.",
        ],
        feedback: [
          "Early detection of retroperitoneal bleeding allows intervention.",
          "Tachycardia after a nephrectomy can be bleeding.",
          "Full anticoagulation raises bleeding in the renal bed.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Monitor the urine output", description: "Track the output of the remaining kidney.",
        choices: [
          "Track hourly urine output and daily creatinine as the remaining kidney adapts.",
          "Give furosemide if the urine output drops.",
          "Check the creatinine only at discharge.",
        ],
        feedback: [
          "The remaining kidney takes over; monitoring finds acute kidney injury early.",
          "Diuretics hide hypovolemia and stress the single kidney.",
          "A rising creatinine can go unnoticed until discharge.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      },
      {
        kind: "postop", title: "Pain control", description: "Plan the analgesia for the flank or abdominal incision.",
        choices: [
          "Use regional analgesia or a PCA with paracetamol, and avoid NSAIDs with a single kidney.",
          "Give regular NSAIDs for the flank pain.",
          "Use oral opioids alone as needed.",
        ],
        feedback: [
          "Kidney-safe analgesia protects the remaining kidney.",
          "NSAIDs reduce blood flow to the single remaining kidney.",
          "Poor pain control after a flank incision leads to atelectasis and pneumonia.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      },
      {
        kind: "postop", title: "Wound care", description: "Define the wound care for the incision.",
        choices: [
          "Keep the wound dry for 48 hours and check it for redness, discharge, or bulging.",
          "Soak the wound in the bath from day 1.",
          "Remove the staples on day 3.",
        ],
        feedback: [
          "Inspection catches infection and a flank bulge from nerve injury.",
          "Soaking raises infection.",
          "Early staple removal risks dehiscence.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Blood pressure management", description: "Tighten the blood pressure control for the single kidney.",
        choices: [
          "Keep the blood pressure under 130/80, favoring an ACE inhibitor once the creatinine is stable.",
          "Stop all antihypertensives after the nephrectomy.",
          "Start a high-dose diuretic for blood pressure control.",
        ],
        feedback: [
          "Blood pressure control protects the single kidney long term.",
          "Stopping antihypertensives causes rebound hypertension.",
          "High-dose diuretics dehydrate and stress the single kidney.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the imaging.",
        choices: [
          "Review at 4 to 6 weeks with the pathology and creatinine, and stage the surveillance.",
          "Review at 6 months with a CT.",
          "Discharge to the GP with the pathology to follow.",
        ],
        feedback: [
          "The pathology sets the surveillance intensity and any adjuvant treatment.",
          "A late review misses renal dysfunction and delays adjuvant decisions.",
          "The urology team must interpret the staging.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Surveillance plan", description: "Define the imaging surveillance for recurrence.",
        choices: [
          "Arrange chest and abdominal CT at intervals set by the tumor stage and grade.",
          "Stop surveillance after the first clear scan.",
          "Use chest X-ray alone for surveillance.",
        ],
        feedback: [
          "Risk-stratified imaging finds treatable recurrence.",
          "Kidney cancer can recur years later.",
          "A plain X-ray misses small metastases.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the medications, wound care, and the warning signs.",
        choices: [
          "Explain the warning signs (fever, flank swelling, falling urine output) and to avoid NSAIDs.",
          "Advise return only for wound redness.",
          "Advise taking ibuprofen for pain at home.",
        ],
        feedback: [
          "The warning signs cover bleeding, infection, and kidney injury.",
          "Bleeding and kidney injury present without wound changes.",
          "NSAIDs harm the single remaining kidney.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Return to activity", description: "Define the lifting and activity restrictions.",
        choices: [
          "Advise no heavy lifting for 6 weeks and a gradual return to work.",
          "Allow heavy lifting from 2 weeks.",
          "Advise bed rest at home for two weeks.",
        ],
        feedback: [
          "The fascia needs about 6 weeks before heavy loading.",
          "Early heavy lifting risks hernia and bleeding.",
          "Bed rest raises clot risk.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Lifestyle counseling", description: "Review the diet, fluids, and renal-protective habits.",
        choices: [
          "Advise adequate fluids, a moderate-protein diet, no smoking, and avoiding nephrotoxic drugs.",
          "Advise a high-protein diet to build strength.",
          "Advise restricting fluids to protect the kidney.",
        ],
        feedback: [
          "Kidney-protective habits preserve the remaining kidney.",
          "High protein raises the filtration load on a single kidney.",
          "Fluid restriction risks dehydration and kidney injury.",
        ],
        wrongComps: ["infection", "cardiac_arrhythmia"],
      },
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
          "Discharge to the GP and ask them to chase the pathology result.",
          "Schedule a biopsy of the remaining kidney.",
        ],
        feedback: [
          "Surveillance matches the pathology and staging.",
          "Surveillance imaging depends on the stage and grade, which the urology team must interpret.",
          "A biopsy of the remaining kidney is not indicated.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Blood pressure and lifestyle", description: "Address the hypertension and lifestyle factors.",
        choices: [
          "Optimize blood pressure control and discuss lifestyle modifications.",
          "Discontinue all antihypertensives after the nephrectomy.",
          "Leave the blood pressure and lifestyle discussion to the GP at the next routine visit.",
        ],
        feedback: [
          "Blood pressure and renal protection are optimized.",
          "Stopping antihypertensives can cause rebound hypertension.",
          "With one kidney left, blood pressure and renal protection need to start now, not at a routine visit.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      }
    ],
  },
];
