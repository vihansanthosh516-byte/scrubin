// ─────────────────────────────────────────────────────────────────────────────
// Beginner surgery step banks — 30-40 science-based steps per procedure.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProcedureBank } from "./stepBuilder";
import { APPENDECTOMY_BANK } from "./tailored/appendectomy";

export const BEGINNER_BANKS: ProcedureBank[] = [
  APPENDECTOMY_BANK,

  // ═════════════════════════════════════════════════════════════════════════
  // INGUINAL HERNIA REPAIR
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "inguinal-hernia",
    spec: {
      approach: "an oblique incision over the inguinal canal in the groin crease",
      wrongApproaches: ["a vertical incision over the femoral triangle", "a midline lower abdominal incision"],
      landmark: "the pubic tubercle and the external ring",
      wrongLandmarks: ["the anterior superior iliac spine", "the adductor hiatus"],
      vessel: "the cremasteric and spermatic vessels at the deep ring",
      wrongVessels: ["the femoral artery", "the inferior epigastric artery"],
      nerve: "the ilioinguinal and iliohypogastric nerves",
      wrongNerves: ["the femoral nerve", "the lateral femoral cutaneous nerve"],
      structure: "the hernia sac and the spermatic cord",
      wrongStructures: ["the femoral canal", "the vas deferens alone"],
      test: "a check for a contralateral hernia and reduction of the sac",
      wrongTests: ["an on-table ultrasound", "a barium enema"],
      risks: ["hemorrhage", "nerve_injury", "infection", "thrombosis", "fluid_overload", "cardiac_arrhythmia", "hypoxia", "anaphylaxis"],
      instrument: "a Babcock clamp and mesh",
      position: "supine with the affected groin exposed",
      wrongPositions: ["prone", "Trendelenburg with the head down"],
      detail: "45-year-old, reducible right groin bulge for 6 months, anxious",
    },
    steps: [
      { kind: "preop", title: "Confirm identity and side", description: "This is an elective, side-specific repair — verify which groin is marked." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Mesh placement changes the prophylaxis decision." },
      { kind: "position", title: "Position and prep", description: "Expose the groin with the pubic tubercle in the field." },
      {
        kind: "access", title: "Choose the incision", description: "The incision must reach the external ring and the canal.",
        choices: [
          "Make an oblique incision along the inguinal crease over the canal.",
          "Make a vertical incision directly over the femoral vessels.",
          "Make a midline incision below the umbilicus.",
        ],
        feedback: [
          "The crease incision follows Langer's lines and exposes the canal cleanly.",
          "A vertical incision over the femoral triangle endangers the femoral vessels and nerve.",
          "A midline incision puts the canal on the far side of the field.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "exposure", title: "Open the external oblique aponeurosis", description: "Expose the canal through the external oblique.", f: { structure: "the external oblique aponeurosis", landmark: "the external ring" } },
      { kind: "nerve", title: "Identify the ilioinguinal nerve", description: "The ilioinguinal nerve runs with the cord — find it early.", f: { nerve: "the ilioinguinal nerve", wrongNerves: ["the femoral nerve", "the sciatic nerve"] } },
      {
        kind: "dissect", title: "Mobilize the spermatic cord", description: "Separate the cord from the canal floor.",
        choices: [
          "Elevate the cord with the cremasteric fibers and dissect it off the floor of the canal.",
          "Clamp the entire cord bundle and retract it firmly.",
          "Cut the cremasteric fibers blindly with scissors.",
        ],
        feedback: [
          "The cord is mobilized as a unit, preserving the vas and vessels.",
          "Clamping the whole cord crushes the vas and testicular vessels.",
          "Blind division of cremasteric fibers can injure the cord or its artery.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "landmark", title: "Identify the hernia sac", description: "Find the sac at the deep ring or within the cord.",
        choices: [
          "Trace the cord to the deep ring and identify the sac by its pale, glistening wall.",
          "Look for the sac in the femoral triangle.",
          "Open the transversalis fascia at the internal ring immediately.",
        ],
        feedback: [
          "The sac is identified at its anatomical origin — the deep ring.",
          "The femoral triangle is the wrong compartment for an inguinal hernia.",
          "Opening the transversalis fascia prematurely creates a false plane.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "dissect", title: "Dissect the sac off the cord", description: "Separate the sac from the vas and testicular vessels.",
        choices: [
          "Dissect the sac off the cord structures, preserving the vas and vessels.",
          "Clamp the sac and surrounding cord tissue together.",
          "Cut the sac open and divide the cord blindly.",
        ],
        feedback: [
          "The sac is separated cleanly; the vas and vessels are preserved.",
          "Clamping sac plus cord endangers the vas and pampiniform plexus.",
          "Blind division risks transecting the vas deferens.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Check for sliding contents", description: "A sliding hernia contains bowel or bladder in the sac wall.",
        choices: [
          "Inspect the sac wall carefully for bowel, omentum, or bladder before dividing it.",
          "Divide the sac at the neck without inspecting the wall.",
          "Pull the sac firmly to see if anything reduces.",
        ],
        feedback: [
          "A sliding component is recognized and managed safely.",
          "Dividing a sliding sac can enter the bowel or bladder.",
          "Traction on a sliding hernia can tear its visceral wall.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Ligate or reduce the sac", description: "Handle the sac neck at the deep ring.",
        choices: [
          "Reduce the sac contents, then transfix-ligate the sac neck at the deep ring.",
          "Ligate the sac high in the canal without reducing contents.",
          "Leave the sac open in the preperitoneal space.",
        ],
        feedback: [
          "The sac is reduced and its neck secured at the deep ring.",
          "Ligating over unreduced contents leaves a mass and recurrences.",
          "An open sac in the preperitoneal space invites seroma and recurrence.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "vessel", title: "Control bleeding at the deep ring", description: "A cremasteric vessel is oozing at the deep ring.",
        choices: [
          "Control the cremasteric bleeder precisely with fine ligature, keeping the testicular vessels and vas in view.",
          "Place a mass ligature around the cord to stop the ooze.",
          "Cauterize blindly deep in the ring where the bleeding seems to be.",
        ],
        feedback: [
          "The bleeder is controlled with the testicular vessels and vas preserved.",
          "Mass ligation of the cord strangles the testicular vessels — the testis can thrombose and infarct.",
          "Blind cautery in the ring can hit the inferior epigastric vessels and keep bleeding.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "core", title: "Repair the floor of the canal", description: "Choose the repair for this defect.",
        choices: [
          "Place a mesh prosthesis over the myopectineal orifice, tension-free.",
          "Suture the conjoint tendon to the inguinal ligament under tension.",
          "Close the internal ring with a single figure-of-eight stitch.",
        ],
        feedback: [
          "A tension-free mesh repair covers all hernia sites and is the standard.",
          "Tension repairs have higher recurrence and chronic pain rates.",
          "Closing only the ring does not address a weakened canal floor.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "verify", title: "Secure the mesh safely", description: "Fixation must avoid the nerves and vessels.",
        choices: [
          "Secure the mesh to the pubic tubercle and inguinal ligament, clear of the nerves.",
          "Staple the mesh deeply into the pelvis for strong fixation.",
          "Tack the mesh to the periosteum of the pubic bone aggressively.",
        ],
        feedback: [
          "Fixation is placed where it holds without nerve contact.",
          "Deep pelvic stapling risks vascular and nerve injury.",
          "Aggressive periosteal tacks can cause osteitis and chronic pain.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "nerve", title: "Protect the iliohypogastric nerve", description: "This nerve runs above the canal and must not be caught in the repair.", f: { nerve: "the iliohypogastric nerve", wrongNerves: ["the genitofemoral nerve", "the obturator nerve"] } },
      {
        kind: "bleed", title: "Control an epigastric bleeder", description: "Bleeding appears at the medial edge of the deep ring.",
        choices: [
          "Identify the source, which is likely the inferior epigastric system, and ligate it directly.",
          "Pack the canal and close, planning to observe post-op.",
          "Cauterize the area broadly through the mesh.",
        ],
        feedback: [
          "The epigastric bleeder is ligated directly; hemostasis is secure.",
          "Closing over an active bleed risks a postoperative hematoma and re-exploration.",
          "Cautery through mesh can melt the mesh and miss the true source.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "verify", title: "Confirm cord and testicular viability", description: "Make sure the cord is not twisted or compressed.", f: { test: "a check of the cord and testis position", wrongTests: ["an on-table ultrasound", "a Doppler of the leg"] } },
      { kind: "landmark", title: "Locate the deep ring", description: "The deep ring lies above the inguinal ligament, lateral to the epigastric vessels.", f: { landmark: "the deep ring above the inguinal ligament", wrongLandmarks: ["the femoral ring", "the superficial ring"] } },
      {
        kind: "vessel", title: "Protect the inferior epigastric vessels", description: "The deep ring borders the inferior epigastric vessels.",
        choices: [
          "Identify the inferior epigastric vessels on the medial side of the deep ring and keep sutures and mesh fixation clear of them.",
          "Anchor the mesh with a deep stitch through the tissue medial to the deep ring.",
          "Divide the inferior epigastric vessels routinely to widen the ring.",
        ],
        feedback: [
          "Seeing the vessels keeps every stitch clear of them.",
          "A blind deep stitch medial to the ring skewers the inferior epigastric vessels — a rectus sheath hematoma follows.",
          "Routine division is unnecessary and risks a bleed if the ligature slips.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "exposure", title: "Reduce the hernia contents", description: "Return the contents to the abdominal cavity gently.", f: { structure: "the hernia contents", landmark: "the deep ring" } },
      {
        kind: "verify", title: "Assess the contralateral side", description: "Ask whether a contralateral defect was noted preoperatively.",
        choices: [
          "Review the preoperative notes and examine the contralateral groin for a clinically occult defect.",
          "Open the contralateral groin to explore it, since defects are commonly bilateral.",
          "Close without a contralateral check — the consent covers this side only.",
        ],
        feedback: [
          "A quick clinical check confirms whether a contralateral defect needs addressing or documenting.",
          "Unnecessary contralateral exploration adds dissection and nerve risk for an unproven finding.",
          "A missed contralateral defect may later strangulate — record the assessment, not the assumption.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "core", title: "Classify the defect", description: "Determine whether the hernia is direct or indirect to choose the repair.",
        choices: [
          "Inspect the sac position relative to the inferior epigastric vessels — lateral is indirect, medial is direct.",
          "Classify the hernia by the size of the bulge alone.",
          "Skip classification — the repair is identical either way.",
        ],
        feedback: [
          "The epigastric vessels mark the boundary: lateral is indirect, medial is direct.",
          "Bulge size does not distinguish a direct from an indirect sac.",
          "Classification matters — a direct sac has no neck to ligate and changes the repair.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      { kind: "closure", title: "Close the external oblique", description: "Recreate the canal over the cord without compression.", f: { structure: "the external oblique aponeurosis" } },
      {
        kind: "closure", title: "Close the subcutaneous layers and skin", description: "Complete the wound closure.",
        choices: [
          "Close Scarpa's fascia and the skin with a subcuticular suture.",
          "Close the skin only, leaving the deeper layers open.",
          "Place a drain in the canal before closure.",
        ],
        feedback: [
          "Layered closure restores the subcutaneous tissue and skin cleanly.",
          "Skin-only closure leaves dead space over the repair.",
          "A routine drain in a clean mesh repair increases infection risk.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "The patient will be ambulatory but prophylaxis is still indicated." },
      {
        kind: "postop", title: "Counsel on scrotal swelling", description: "Day 1: the scrotum is bruised and mildly swollen.",
        choices: [
          "Explain that bruising and mild swelling are common, and advise support underwear and ice for a few days.",
          "Tell the patient any scrotal swelling is dangerous and needs urgent imaging.",
          "Say nothing — the swelling will settle and discussing it only causes worry.",
        ],
        feedback: [
          "Expected bruising is explained, with clear advice on what would be abnormal.",
          "Needless imaging adds contrast exposure and delays a normal recovery — some agents cause reactions.",
          "Without advice, an enlarging, tense swelling from a hematoma is not reported.",
        ],
        wrongComps: ["anaphylaxis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discuss chronic pain risk", description: "The patient asks about long-term groin pain.",
        choices: [
          "Explain that chronic pain affects about 1 in 10, which nerves were protected, and to report burning pain early.",
          "Promise that chronic pain never happens after mesh repair.",
          "Advise strong opioids for any groin pain after discharge.",
        ],
        feedback: [
          "Honest counselling and early reporting allow nerve pain to be treated promptly.",
          "False reassurance means new burning nerve pain is ignored until it becomes chronic.",
          "Open-ended opioids at home risk sedation and respiratory depression.",
        ],
        wrongComps: ["nerve_injury", "hypoxia"],
      },
      {
        kind: "postop", title: "Return-to-work guidance", description: "The patient works in an office and goes to the gym.",
        choices: [
          "Return to desk work within a week; avoid heavy lifting until comfortable, usually 2–4 weeks.",
          "Stay off all work and activity for 3 months.",
          "Return to heavy gym lifting the next day.",
        ],
        feedback: [
          "Guided activity speeds recovery without stressing the repair.",
          "Three months of inactivity brings no benefit and raises the clot risk.",
          "Heavy straining on day 1 can tear the fresh repair and bleed into the wound.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan analgesia and activity", description: "Set recovery expectations.",
        choices: [
          "Prescribe scheduled analgesia and allow activity as tolerated with lifting precautions.",
          "Recommend strict bed rest for two weeks.",
          "Return to full lifting immediately to test the repair.",
        ],
        feedback: [
          "Early activity with lifting precautions optimizes recovery.",
          "Prolonged bed rest increases thrombosis risk and delays recovery.",
          "Immediate heavy lifting stresses the repair and risks recurrence.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Monitor for hematoma and seroma", description: "The wound is slightly swollen at the day-7 check.",
        choices: [
          "Examine the swelling; observe a soft seroma, and review a tense or enlarging swelling the same day.",
          "Aspirate every groin swelling in clinic as routine.",
          "Ignore groin swelling unless the patient has a fever.",
        ],
        feedback: [
          "Most seromas settle; tense or growing swellings need prompt review.",
          "Routine aspiration of a seroma introduces bacteria onto the mesh.",
          "An expanding hematoma can be missed while waiting for fever.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Watch for urinary retention", description: "Six hours after surgery the patient has not passed urine.",
        choices: [
          "Scan the bladder and catheterize if the volume is large, then trial without a catheter.",
          "Give a large IV fluid bolus to encourage voiding.",
          "Discharge and ask the patient to return if still unable to pass urine.",
        ],
        feedback: [
          "Retention after groin surgery is common and treated with bladder scanning and catheterization.",
          "More fluid overdistends the bladder and can overload an older patient's circulation.",
          "Untreated retention stretches the bladder and becomes infected.",
        ],
        wrongComps: ["fluid_overload", "infection"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the clinic plan.",
        choices: [
          "Arrange a 2-week wound check and a 6-week recurrence assessment.",
          "Tell the patient to return only if a lump reappears.",
          "Schedule a yearly CT scan to monitor the mesh.",
        ],
        feedback: [
          "Structured follow-up catches wound issues and early recurrence.",
          "Return-if-worse misses wound complications and chronic groin pain that need early review.",
          "Routine imaging of mesh is unnecessary and wasteful.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // THYROIDECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "thyroidectomy",
    spec: {
      approach: "a low transverse collar incision in a skin crease",
      wrongApproaches: ["a midline vertical neck incision", "a lateral submandibular incision"],
      landmark: "the cricoid cartilage and the sternal notch",
      wrongLandmarks: ["the angle of the mandible", "the clavicular heads"],
      vessel: "the superior and inferior thyroid arteries",
      wrongVessels: ["the carotid artery", "the internal jugular vein"],
      nerve: "the recurrent laryngeal nerve (RLN)",
      wrongNerves: ["the hypoglossal nerve", "the facial nerve"],
      structure: "the thyroid gland and its capsule",
      wrongStructures: ["the parathyroid glands", "the trachea"],
      test: "nerve monitoring and a check of the parathyroid glands",
      wrongTests: ["a barium swallow", "an on-table MRI"],
      risks: ["hypoxia", "nerve_injury", "hemorrhage", "infection", "fluid_overload", "cardiac_arrhythmia", "thrombosis", "anaphylaxis"],
      instrument: "a bipolar cautery and nerve monitor",
      position: "supine with the neck extended",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "38-year-old, Bethesda IV follicular neoplasm, anxious but well-informed",
    },
    steps: [
      { kind: "preop", title: "Confirm the indication and consent", description: "Discuss total thyroidectomy, voice risk, and calcium risk with the patient." },
      { kind: "position", title: "Position the neck", description: "Extension opens the space between the sternal notch and the chin." },
      {
        kind: "access", title: "Plan the incision", description: "The scar should sit in a natural crease.",
        choices: [
          "Mark a low transverse collar incision in a skin crease two fingerbreadths above the sternal notch.",
          "Plan a midline vertical incision from the chin to the notch.",
          "Plan a lateral incision behind the sternocleidomastoid.",
        ],
        feedback: [
          "The collar incision follows a skin crease and gives symmetric exposure.",
          "A midline vertical scar is cosmetically poor and crosses the neck midline.",
          "A lateral approach is for carotid or parotid work, not the thyroid.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "exposure", title: "Raise the subplatysmal flaps", description: "Develop the flaps above the strap muscles.", f: { structure: "the platysma and strap muscles", landmark: "the sternal notch" } },
      { kind: "exposure", title: "Divide the midline raphe", description: "Separate the strap muscles in the midline.", f: { structure: "the strap muscles", landmark: "the midline raphe" } },
      { kind: "landmark", title: "Identify the trachea", description: "Confirm midline anatomy before working laterally.", f: { landmark: "the trachea in the midline", wrongLandmarks: ["the carotid artery", "the esophagus"] } },
      {
        kind: "dissect", title: "Mobilize the thyroid lobe", description: "Develop the plane between the gland and the strap muscles.",
        choices: [
          "Dissect the avascular plane between the gland capsule and the strap muscles.",
          "Sweep the strap muscles off the gland with a blunt instrument.",
          "Cauterize along the gland surface to speed the mobilization.",
        ],
        feedback: [
          "The capsular plane is developed cleanly, keeping the parathyroids safe.",
          "Blunt sweeping can tear the gland capsule and bleed from its surface.",
          "Cautery on the gland surface risks thermal injury to the RLN and parathyroids.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "vessel", title: "Control the superior pole", description: "The superior thyroid vessels enter at the upper pole.",
        choices: [
          "Ligate the superior thyroid artery and vein individually, close to the gland.",
          "Clamp the whole upper pole and tie it en masse.",
          "Cauterize the upper pole vessels to save time.",
        ],
        feedback: [
          "Individual ligation close to the gland protects the external branch of the superior laryngeal nerve.",
          "Mass ligation of the pole risks injuring the external laryngeal nerve.",
          "Cautery at the pole can retract vessels and cause delayed bleeding.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Identify the recurrent laryngeal nerve", description: "Find the RLN before dividing any inferior vessels.",
        choices: [
          "Locate the RLN in the tracheoesophageal groove, medial to the inferior thyroid artery, and trace it to the cricoid.",
          "Begin dividing the inferior thyroid artery and look for the nerve afterwards.",
          "Rely on the nerve monitor and dissect the lateral gland freely.",
        ],
        feedback: [
          "The nerve is identified and traced before any inferior division — the safe sequence.",
          "The nerve often runs between the branches of the inferior thyroid artery — dividing first can cut or crush it.",
          "Free lateral dissection without seeing the nerve tears the middle thyroid vein and inferior thyroid branches — the field fills with blood.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "nerve", title: "Protect the RLN during dissection", description: "Keep the nerve in view as the gland is rolled medially.",
        choices: [
          "Identify the recurrent laryngeal nerve in the tracheoesophageal groove and keep it in view while rolling the gland medially.",
          "Retract the recurrent laryngeal nerve with a self-retaining retractor to improve exposure of the groove.",
          "Sweep the tissue in the tracheoesophageal groove with cautery to speed the medial roll.",
        ],
        feedback: [
          "The nerve is traced under direct vision — the gland is rolled without ever putting the nerve on tension.",
          "Retraction injury to the nerve risks permanent vocal cord dysfunction.",
          "Cautery across the groove risks the nerve and the inferior thyroid vessels — dissect sharply in the plane.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "vessel", title: "Control the inferior thyroid artery", description: "The artery crosses near the nerve.",
        choices: [
          "Ligate the inferior thyroid artery branches close to the gland, staying clear of the nerve.",
          "Ligate the inferior thyroid artery trunk at its origin from the subclavian.",
          "Cauterize the inferior thyroid artery to avoid touching the nerve.",
        ],
        feedback: [
          "Branch ligation at the capsule keeps the nerve out of the field.",
          "Ligating the trunk proximally is unnecessary and risks devascularizing the parathyroids.",
          "Cautery near the nerve can cause thermal injury even with a monitor.",
        ],
        wrongComps: ["hypoxia", "nerve_injury"],
      },
      {
        kind: "core", title: "Preserve the parathyroid glands", description: "The inferior parathyroid sits near the lower pole.",
        choices: [
          "Identify the parathyroid glands and preserve them on their vascular pedicles.",
          "Remove the parathyroids with the specimen — they are often intrathyroidal.",
          "Divide the inferior parathyroid's blood supply and assess it later.",
        ],
        feedback: [
          "The parathyroids are preserved on their pedicles, protecting calcium.",
          "Routine parathyroid removal causes avoidable hypocalcemia.",
          "Dividing the pedicle devascularizes the gland even if it stays behind.",
        ],
        wrongComps: ["nerve_injury", "hypoxia"],
      },
      {
        kind: "dissect", title: "Dissect the gland off the trachea", description: "Free the lobe from the trachea and Berry's ligament.",
        choices: [
          "Sharply divide Berry's ligament close to the trachea with the nerve visualized.",
          "Bluntly avulse the gland from the trachea.",
          "Cauterize Berry's ligament to free the lobe.",
        ],
        feedback: [
          "Berry's ligament is divided sharply with the nerve under direct vision.",
          "Avulsion tears the gland and risks bleeding from the tracheal surface.",
          "Cautery at Berry's ligament is where the RLN is most easily injured.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "verify", title: "Stimulate the RLN", description: "Confirm nerve function before finishing the side.",
        choices: [
          "Stimulate the nerve with the monitor and confirm an intact signal.",
          "Trust the dissection and move to the other side.",
          "Stimulate the nerve only if the voice was hoarse preoperatively.",
        ],
        feedback: [
          "A positive stimulation signal confirms the nerve is intact.",
          "Skipping the check leaves a silent nerve injury undiscovered until extubation.",
          "Monitoring is useful in every total thyroidectomy, not just high-risk cases.",
        ],
        wrongComps: ["nerve_injury", "hypoxia"],
      },
      {
        kind: "core", title: "Handle the contralateral lobe", description: "For a total thyroidectomy, repeat the sequence on the other side.",
        choices: [
          "Repeat the capsular dissection, preserving the contralateral RLN and parathyroids.",
          "Speed through the second side — the anatomy is usually easier.",
          "Leave a remnant of the second lobe to guarantee function.",
        ],
        feedback: [
          "The second side gets the same careful, nerve-sparing dissection.",
          "Rushing the second side invites the same injuries you avoided on the first.",
          "For a total thyroidectomy, leaving a remnant defeats the oncologic purpose.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "bleed", title: "Control a capsular bleeder", description: "Venous oozing from the gland surface is obscuring the field.",
        choices: [
          "Apply pressure, then control the point with fine bipolar cautery away from the nerve.",
          "Sweep a sponge across the field until it stops.",
          "Clamp the tissue blindly and tie it en masse.",
        ],
        feedback: [
          "The bleeder is controlled precisely without nerve contact.",
          "Sponge sweeping only smears the blood and hides the source.",
          "Blind clamping near the tracheoesophageal groove endangers the RLN.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "vitals", title: "Respond to desaturation", description: "SpO2 is drifting down during the dissection.",
        choices: [
          "Pause, ask anesthesia to check the airway and ventilation, and reassess before continuing.",
          "Continue — the desaturation will resolve once the dissection is complete.",
          "Ask anesthesia to increase oxygen while you keep operating.",
        ],
        feedback: [
          "The team identifies the cause — often pressure on the trachea — and corrects it.",
          "Ignoring desaturation during neck surgery can progress to airway loss.",
          "More oxygen alone can mask a developing airway problem.",
        ],
        wrongComps: ["hypoxia", "nerve_injury"],
      },
      {
        kind: "verify", title: "Inspect for bleeding before closure", description: "The empty bed must be dry before closure.",
        choices: [
          "Ask anesthesia to perform a Valsalva maneuver, then control any venous bleeders that appear.",
          "Close the bed and rely on a postoperative CT to detect any bleeding.",
          "Trust the stable vitals and close without raising venous pressure.",
        ],
        feedback: [
          "Valsalva raises venous pressure and reveals bleeders that would otherwise tamponade at closure.",
          "A postoperative CT finds a hematoma only after it forms — a delayed collection can compress the airway.",
          "Vitals lag behind slow venous oozing — the empty bed must be provably dry.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "dissect", title: "Develop the capsular plane on the second side", description: "Repeat the capsular dissection on the contralateral lobe.",
        choices: [
          "Develop the avascular capsular plane along the tracheoesophageal groove of the second lobe.",
          "Sweep the recurrent laryngeal nerve aside with a peanut to speed the capsular dissection.",
          "Run cautery across the capsular plane to clear the second lobe quickly.",
        ],
        feedback: [
          "The avascular capsular plane is followed — the nerve stays out of harm's way.",
          "Pushing the nerve with a peanut risks traction injury — dissect along the capsule instead.",
          "Cautery across the capsule risks the nerve and the parathyroid vessels.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "verify", title: "Confirm the external laryngeal nerve", description: "Identify the external branch of the superior laryngeal nerve as it crosses the superior pole vessels.", f: { test: "the external branch of the superior laryngeal nerve", wrongTests: ["a nerve conduction study", "an ultrasound"] } },
      { kind: "bleed", title: "Control a superior pole bleeder", description: "The superior thyroid vessels are retracting.", f: { vessel: "the superior thyroid artery at the upper pole", wrongVessels: ["the carotid artery", "the inferior thyroid artery"] } },
      { kind: "vitals", title: "Respond to the rising heart rate", description: "The heart rate is climbing during the second-side dissection.", f: { structure: "the hemodynamics", landmark: "the temperature and the calcium" } },
      { kind: "closure", title: "Close the strap muscles and platysma", description: "Reapproximate the layers over the trachea.",
        choices: [
          "Close the midline raphe and platysma in layers.",
          "Close the skin only to reduce tension on the neck.",
          "Leave the strap muscles open to avoid tracheal compression.",
        ],
        feedback: [
          "Layered closure restores the neck anatomy.",
          "Skin-only closure leaves dead space and a poor scar.",
          "Open strap muscles risk a wide, unsupported scar.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis applies to this elective case." },
      {
        kind: "postop", title: "Check for stridor", description: "Four hours post-op the patient is anxious with noisy breathing.",
        choices: [
          "Examine the neck at once; if it is tense, open the wound at the bedside and call for airway help.",
          "Give a nebulizer and recheck in an hour.",
          "Reassure the patient that anxiety causes noisy breathing after neck surgery.",
        ],
        feedback: [
          "A neck hematoma compressing the airway needs immediate wound opening — minutes matter.",
          "A nebulizer does nothing for a hematoma compressing the trachea — the airway closes.",
          "Mistaking stridor for anxiety lets the hematoma keep expanding.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Teach the signs of hypocalcemia", description: "The day-1 calcium is at the low end of normal.",
        choices: [
          "Teach tingling around the mouth and fingers and muscle cramps, and to come in if they occur.",
          "Tell the patient low calcium only happens after a total thyroidectomy.",
          "Start high-dose IV calcium for everyone before discharge.",
        ],
        feedback: [
          "Recognizing early symptoms prevents tetany and dangerous arrhythmia.",
          "Temporary parathyroid stunning happens after lobectomy too — untreated low calcium causes arrhythmias.",
          "Routine IV calcium in a normocalcemic patient risks overload and vein injury.",
        ],
        wrongComps: ["cardiac_arrhythmia", "fluid_overload"],
      },
      {
        kind: "postop", title: "Scar care", description: "The wound is healing well at 2 weeks.",
        choices: [
          "Massage and moisturize the healed scar and use sunscreen for a year.",
          "Apply steroid cream on the fresh wound from day 1.",
          "Pick off any crusts to speed healing.",
        ],
        feedback: [
          "Simple scar care and sun protection give the best cosmetic result.",
          "Steroid on an unhealed wound delays healing and invites infection.",
          "Picking crusts opens the wound to infection.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Arrange thyroid monitoring", description: "A lobectomy was done; the pathology is pending.",
        choices: [
          "Check thyroid function at 6–8 weeks and discuss the pathology; completion surgery if malignant.",
          "Start full-dose levothyroxine for life as routine.",
          "No follow-up — the remaining lobe will cope.",
        ],
        feedback: [
          "After lobectomy many patients stay euthyroid; testing and the pathology guide further treatment.",
          "Full replacement after lobectomy can overtreat and trigger atrial fibrillation.",
          "Skipping review misses a malignant result that needs completion surgery.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      },
      {
        kind: "postop", title: "Monitor the airway", description: "Hematoma or laryngeal edema can threaten the airway.",
        choices: [
          "Observe closely for stridor, swelling, or bleeding; keep the neck accessible.",
          "Discharge from recovery as soon as the patient is awake.",
          "Keep the patient intubated overnight as routine.",
        ],
        feedback: [
          "Airway surveillance catches a neck hematoma before it becomes emergent.",
          "Early discharge after a total thyroidectomy risks a late airway event at home.",
          "Routine overnight intubation is unnecessary and delays recovery.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Check calcium and voice", description: "These two systems are at risk after total thyroidectomy.",
        choices: [
          "Check serial calcium and assess the voice before discharge.",
          "Check calcium only if the patient complains of tingling.",
          "Assess the voice in clinic next week.",
        ],
        feedback: [
          "Calcium and voice are checked before discharge — the standard of care.",
          "Waiting for symptoms can miss clinically significant hypocalcemia.",
          "A delayed voice check delays management of a possible nerve injury.",
        ],
        wrongComps: ["nerve_injury", "hypoxia"],
      },
      {
        kind: "postop", title: "Plan hormone replacement", description: "The patient will need thyroid hormone after total thyroidectomy.",
        choices: [
          "Start levothyroxine replacement and arrange endocrinology follow-up.",
          "Wait for symptoms of hypothyroidism before starting treatment.",
          "Discharge without a thyroid hormone plan.",
        ],
        feedback: [
          "Replacement is initiated and follow-up arranged.",
          "Waiting for symptoms leaves the patient hypothyroid for weeks.",
          "No plan guarantees a missed diagnosis of hypothyroidism.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Discharge and wound care", description: "Define the follow-up and scar care.",
        choices: [
          "Arrange a 2-week wound check and review the final pathology.",
          "Discharge on levothyroxine and let the GP review the pathology.",
          "Schedule a routine neck ultrasound in one month.",
        ],
        feedback: [
          "Follow-up reviews pathology, calcium stability, and the scar.",
          "The surgeon must review the pathology (it decides on radioiodine) and the calcium; the GP cannot make that call.",
          "Routine early ultrasound adds no value after a complete thyroidectomy.",
        ],
        wrongComps: ["infection", "hypoxia"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CARPAL TUNNEL RELEASE
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "carpal-tunnel-release",
    spec: {
      approach: "a longitudinal incision in the axis of the ring finger, ulnar to the palmaris longus",
      wrongApproaches: ["a transverse incision across the wrist crease", "an incision radial to the palmaris longus"],
      landmark: "the hook of the hamate and the palmaris longus tendon",
      wrongLandmarks: ["the radial artery", "the pisiform alone"],
      vessel: "the superficial palmar arch and its ulnar-side branches",
      wrongVessels: ["the radial artery", "the median artery"],
      nerve: "the median nerve and its recurrent motor branch",
      wrongNerves: ["the ulnar nerve", "the radial sensory nerve"],
      structure: "the transverse carpal ligament",
      wrongStructures: ["the flexor retinaculum of the digits", "the palmar aponeurosis alone"],
      test: "a check of the motor branch and digital perfusion",
      wrongTests: ["an on-table nerve conduction study", "a wrist X-ray"],
      risks: ["nerve_injury", "infection", "hemorrhage", "thrombosis", "fluid_overload", "cardiac_arrhythmia", "hypoxia", "anaphylaxis"],
      instrument: "a #15 blade and a Ragnell retractor",
      position: "supine with the hand supinated on a hand table",
      wrongPositions: ["prone with the hand pronated", "lateral decubitus"],
      detail: "52-year-old, 8 months of median-distribution numbness and tingling",
    },
    steps: [
      { kind: "preop", title: "Confirm the diagnosis and side", description: "Verify the affected hand and the electrodiagnostic findings." },
      { kind: "position", title: "Position the hand", description: "Supinate the hand on the hand table with the wrist in slight extension." },
      {
        kind: "access", title: "Plan the incision", description: "The incision must expose the ligament without crossing the wrist crease at a right angle.",
        choices: [
          "Mark a longitudinal incision in the axis of the ring finger, ulnar to the palmaris longus.",
          "Plan a transverse incision directly across the wrist crease.",
          "Plan an incision radial to the palmaris longus over the thenar eminence.",
        ],
        feedback: [
          "The ring-finger axis line runs over the carpal tunnel and avoids the motor branch.",
          "A transverse wrist-crease incision cuts the palmar cutaneous branch and scars badly.",
          "A radial incision endangers the recurrent motor branch and the radial artery.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "landmark", title: "Identify the palmaris longus", description: "This tendon marks the ulnar border of the approach.",
        choices: [
          "Confirm the palmaris longus and use it as the ulnar boundary of the incision.",
          "Use the radial artery pulse as the guide for the incision.",
          "Locate the pisiform and incise directly over it.",
        ],
        feedback: [
          "The palmaris longus reliably marks the ulnar edge of the safe zone.",
          "The radial artery lies radial to the tunnel — a poor guide and a danger.",
          "The pisiform marks the proximal ulnar tunnel but not the safe incision line.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "exposure", title: "Open the skin and subcutaneous fat", description: "Expose the palmar aponeurosis and ligament.", f: { structure: "the palmar aponeurosis", landmark: "the transverse carpal ligament" } },
      {
        kind: "nerve", title: "Protect the palmar cutaneous branch", description: "This branch can be cut with an ulnar incision.",
        choices: [
          "Keep the dissection ulnar and identify the palmar cutaneous branch if it appears.",
          "Divide any structure that crosses the field to speed exposure.",
          "Cauterize the small nerves in the fat to control bleeding.",
        ],
        feedback: [
          "The palmar cutaneous branch is preserved, avoiding painful neuroma.",
          "Dividing crossing structures risks a painful neuroma in the palm.",
          "Cauterizing small nerves guarantees a symptomatic neuroma.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "core", title: "Identify the median nerve", description: "The nerve lies deep to the ligament, ulnar to the flexor tendons.",
        choices: [
          "Open the ligament just ulnar to the nerve and confirm the nerve's position visually.",
          "Cut the ligament in the midline where the nerve is usually deepest.",
          "Probe for the nerve with a closed scissors before cutting.",
        ],
        feedback: [
          "The nerve is identified directly before any division — the safest method.",
          "Cutting without identifying the nerve risks transecting it.",
          "Blind probing can injure the nerve or its branches.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "core", title: "Divide the transverse carpal ligament", description: "Release the tunnel in a controlled, complete manner.",
        choices: [
          "Divide the ligament in a distal-to-proximal direction under direct vision.",
          "Slide a blade blindly beneath the ligament and cut in one pass.",
          "Divide the ligament proximally at the wrist crease only.",
        ],
        feedback: [
          "Direct-vision division is complete and protects the arch and nerve.",
          "Blind passage of a blade risks the superficial palmar arch and the nerve.",
          "Releasing only the wrist portion leaves distal compression untreated.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "landmark", title: "Confirm the distal extent", description: "The ligament ends where the palmar fat appears.",
        choices: [
          "Release until the distal ligament edge and the palmar fat pad are visible.",
          "Stop at the point where the ligament looks thin.",
          "Extend the release into the palmar aponeurosis for completeness.",
        ],
        feedback: [
          "The release ends at the true distal edge — complete and safe.",
          "Stopping early leaves residual compression on the motor fibers.",
          "Over-extending into the aponeurosis risks the superficial arch.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check the recurrent motor branch", description: "The thenar branch can loop through the distal ligament.",
        choices: [
          "Inspect the distal ligament edge for a looped motor branch before finishing.",
          "Assume the branch is deep and unremarkable.",
          "Stimulate the thenar muscles through the wound.",
        ],
        feedback: [
          "A looped motor branch is identified and preserved.",
          "A looped branch cut at the distal edge causes permanent thenar weakness.",
          "Stimulation through the wound is unreliable and unnecessary.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "vessel", title: "Protect the superficial palmar arch", description: "The arch lies just distal to the ligament edge.",
        choices: [
          "Keep the scissors tip parallel to the skin and lift as you divide the distal ligament.",
          "Angle the scissors deeply to make sure the ligament is fully cut.",
          "Cut down firmly until the arch is exposed for verification.",
        ],
        feedback: [
          "Lifting the scissors tip away from the arch protects it.",
          "Deep angulation drives the tip into the arch.",
          "Deliberately exposing the arch risks dividing it.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "bleed", title: "Control a small palmar bleeder", description: "A superficial vessel is bleeding from the fat.",
        choices: [
          "Identify the vessel and cauterize it precisely with fine bipolar forceps.",
          "Compress the wound and close over the bleeding site.",
          "Cauterize the whole wound edge to stop the oozing.",
        ],
        feedback: [
          "The bleeder is controlled without collateral damage.",
          "Closing over an active bleeder risks a palmar hematoma and nerve compression.",
          "Broad cautery damages the fat and small nerves.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "verify", title: "Confirm the nerve is fully decompressed", description: "The nerve should be visible and free along the released length.", f: { test: "direct inspection of the nerve from proximal to distal", wrongTests: ["an on-table nerve conduction study", "a postoperative MRI"] } },
      { kind: "exposure", title: "Retract the skin edges", description: "Keep the wound edges open with a small retractor.", f: { structure: "the skin and subcutaneous edges", landmark: "the palmar aponeurosis" } },
      { kind: "landmark", title: "Identify the flexor tendons", description: "The tendons lie deep and ulnar to the nerve — note their position.", f: { landmark: "the flexor tendons beneath the ligament", wrongLandmarks: ["the thenar muscles", "the hypothenar fat"] } },
      { kind: "dissect", title: "Expose the ulnar border of the ligament", description: "Define the ulnar edge before any division.", f: { landmark: "the ulnar border of the transverse carpal ligament" } },
      { kind: "core", title: "Carry the release to the distal edge", description: "The release must extend to the distal ligament edge.", f: { structure: "the distal ligament edge", landmark: "the palmar fat pad" } },
      {
        kind: "vessel", title: "Protect the ulnar artery", description: "The ulnar artery sits at the ulnar border of the tunnel.",
        choices: [
          "Divide the ligament along its radial side, staying away from the ulnar artery and nerve in Guyon's canal.",
          "Divide the ligament along its ulnar edge to get a wider release.",
          "Cauterize the tissue at the ulnar border to keep the field dry.",
        ],
        feedback: [
          "Staying radial keeps the ulnar neurovascular bundle safe.",
          "The ulnar edge is where the ulnar artery runs — cutting there risks lacerating it.",
          "Cautery at the ulnar border can burn the ulnar nerve alongside the artery.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "bleed", title: "Manage a superficial arch injury", description: "A small bleed appears at the distal release.", f: { vessel: "the superficial palmar arch", wrongVessels: ["the deep palmar arch", "the radial artery"] } },
      { kind: "verify", title: "Confirm free passive flexion", description: "Passively flex the fingers to confirm the nerve is free.", f: { test: "free passive finger flexion", wrongTests: ["a nerve conduction study", "a wrist X-ray"] } },
      { kind: "closure", title: "Close the skin", description: "The ligament does not need repair — the skin only.", f: { structure: "the skin edges" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "A short hand case still warrants standard prophylaxis." },
      {
        kind: "postop", title: "Splint positioning", description: "Soft bulky dressing on; the patient asks about a splint.",
        choices: [
          "Use a soft dressing, elevate the hand, and move the fingers from day 1 — no rigid splint needed.",
          "Immobilize the wrist in a rigid splint for 6 weeks.",
          "Keep the hand hanging down to reduce stiffness.",
        ],
        feedback: [
          "Early finger movement with elevation reduces swelling and stiffness; splinting adds no benefit.",
          "Prolonged splinting stiffens the hand and the tendons adhere around the healing nerve.",
          "A dependent hand swells, and the tight dressing can bleed and throb.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Explain sensory recovery", description: "The patient still has some numbness the next day.",
        choices: [
          "Explain that tingling improves over weeks, but long-standing numbness may take months or remain.",
          "Promise all numbness will be gone by tomorrow.",
          "Order urgent nerve conduction studies for the residual numbness.",
        ],
        feedback: [
          "Realistic expectations prevent alarm and let a real new deficit stand out.",
          "False promises mean a genuinely new weakness is dismissed as expected.",
          "Early nerve studies are uninterpretable; a new deficit is what needs review.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "postop", title: "Refer for hand therapy", description: "The fingers are stiff at the 1-week check.",
        choices: [
          "Refer to hand therapy for tendon-gliding and scar exercises.",
          "Advise keeping the hand still until the stiffness passes.",
          "Start forceful gripping with a heavy grip trainer now.",
        ],
        feedback: [
          "Guided exercises restore motion and limit scar adhesion.",
          "Rest makes the stiffness and adhesions around the nerve worse.",
          "Heavy gripping strains the healing wound and it can bleed or open.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Return-to-work plan", description: "The patient works on a construction site.",
        choices: [
          "Light duties at 2 weeks, heavy gripping and vibrating tools from about 6 weeks.",
          "Return to heavy tools the day after surgery.",
          "Stay off work for 6 months.",
        ],
        feedback: [
          "A graded return matches wound and grip strength recovery.",
          "Heavy tools on a fresh wound cause pain, bleeding, and wound breakdown.",
          "Long inactivity weakens the hand and slows recovery.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Teach the signs of wound infection", description: "Sutures are due out at 10–14 days.",
        choices: [
          "Teach spreading redness, pus, and fever, and to keep the wound dry until the stitches are out.",
          "Tell the patient to soak the hand in hot water daily.",
          "Tell the patient a little pus is normal after hand surgery.",
        ],
        feedback: [
          "Clear signs and a dry wound catch infection early.",
          "Soaking a fresh wound softens it and lets bacteria in.",
          "Pus is never normal — a hand infection spreads quickly along the tendon sheaths.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan the dressing and activity", description: "Immobilize just enough to protect the wound.",
        choices: [
          "Apply a light dressing and allow early finger motion.",
          "Immobilize the wrist in a splint for four weeks.",
          "Keep the hand elevated and completely still for a week.",
        ],
        feedback: [
          "Early motion prevents stiffness while the wound heals.",
          "Prolonged splinting causes unnecessary stiffness and delay.",
          "Complete stillness promotes joint stiffness and tendon adhesions.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Monitor for recurrence of symptoms", description: "Set expectations for nerve recovery.",
        choices: [
          "Explain that numbness may take weeks to months to resolve and arrange follow-up.",
          "Promise immediate, complete resolution of all symptoms.",
          "Arrange a wound check with the practice nurse and discharge from surgical follow-up.",
        ],
        feedback: [
          "Realistic expectations and a follow-up visit are set.",
          "Overpromising immediate cure sets the patient up for frustration.",
          "A nurse wound check misses incomplete release and pillar pain that the surgeon needs to assess.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Define wound care and the return-to-work plan.",
        choices: [
          "Advise keeping the wound dry for 48 hours and returning for suture removal.",
          "Allow the wound to get wet immediately and leave sutures indefinitely.",
          "Restrict all hand use until the scar fades.",
        ],
        feedback: [
          "Clear wound care and follow-up are provided.",
          "Wetting the wound early invites infection; retained sutures cause scarring.",
          "Over-restriction delays return to normal function.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      }
    ],
  },
];
