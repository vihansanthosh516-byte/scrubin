// ─────────────────────────────────────────────────────────────────────────────
// Advanced surgery step banks (2 of 2) — 36-40 science-based steps each.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProcedureBank } from "./stepBuilder";

export const ADVANCED_BANKS_2: ProcedureBank[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // AAA REPAIR
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "aaa-repair",
    spec: {
      approach: "a midline laparotomy for open AAA repair",
      wrongApproaches: ["a retroperitoneal flank approach as routine", "a thoracoabdominal approach"],
      landmark: "the infrarenal aorta and the iliac bifurcation",
      wrongLandmarks: ["the superior mesenteric artery", "the renal veins"],
      vessel: "the infrarenal aorta and the common iliac arteries",
      wrongVessels: ["the inferior vena cava", "the portal vein"],
      nerve: "the autonomic plexus over the aortic bifurcation",
      wrongNerves: ["the sciatic nerve", "the femoral nerve"],
      structure: "the aortic aneurysm sac",
      wrongStructures: ["the duodenum", "the left kidney"],
      test: "a check of the distal pulses and the graft anastomoses",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["hemorrhage", "cardiac_arrhythmia", "hypoxia", "thrombosis", "infection"],
      instrument: "a vascular clamp and a Dacron graft",
      position: "supine",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "72-year-old, 6.5 cm infrarenal AAA with back pain, hypertensive and diabetic",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the CT, the aneurysm extent, and the resuscitation plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Graft placement demands timely prophylaxis." },
      { kind: "position", title: "Position the patient", description: "Supine with the abdomen exposed for a midline approach.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Make the midline incision", description: "Open the abdomen.", f: { wrongApproaches: ["a flank approach as routine", "a thoracoabdominal approach"] } },
      {
        kind: "exposure", title: "Retract the small bowel", description: "Expose the retroperitoneum.",
        choices: [
          "Pack the small bowel cephalad and to the right to expose the retroperitoneum over the aorta.",
          "Retract the small bowel with deep retractors and hold it steady against the spine.",
          "Clamp the small bowel mesentery with a bowel clamp to hold it out of the way.",
        ],
        feedback: [
          "Packing positions the bowel without trauma and exposes the aortic bed cleanly.",
          "Deep retraction can tear the mesentery — pack and position instead of pulling.",
          "A bowel clamp across the mesentery can thrombose the mesenteric vessels — pack, never clamp.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "landmark", title: "Expose the infrarenal neck", description: "Define the proximal clamp site.",
        choices: [
          "Expose the infrarenal neck below the renal veins for the proximal clamp.",
          "Clamp above the renal arteries to be safe.",
          "Clamp the aorta at the diaphragm.",
        ],
        feedback: [
          "The infrarenal neck is the correct clamp site.",
          "Suprarenal clamping causes renal ischemia.",
          "Clamping at the diaphragm risks the celiac and mesenteric flow.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "vessel", title: "Control the iliac arteries", description: "Prepare the distal clamp sites.",
        choices: [
          "Expose and loop the common iliac arteries for distal control.",
          "Clamp the inferior vena cava for distal control.",
          "Clamp the aorta at the bifurcation only.",
        ],
        feedback: [
          "The iliac arteries are controlled for distal clamping.",
          "Clamping the vena cava is a fatal error.",
          "Clamping only at the bifurcation leaves back-bleeding.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Heparinize and clamp", description: "Prepare for the aortic occlusion.",
        choices: [
          "Heparinize systemically, then clamp the neck and the iliac arteries in sequence.",
          "Clamp without heparin to avoid bleeding.",
          "Heparinize only after the aneurysm is opened.",
        ],
        feedback: [
          "The aorta is clamped with heparin protection.",
          "Clamping without heparin risks distal thrombosis.",
          "Delayed heparin allows clot to form during the clamp time.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "core", title: "Open the aneurysm sac", description: "Enter the sac.",
        choices: [
          "Open the sac longitudinally between the clamps, evacuating the thrombus.",
          "Open the sac with a transverse incision.",
          "Excise the entire aneurysm sac.",
        ],
        feedback: [
          "The sac is opened longitudinally with the thrombus removed.",
          "A transverse opening limits the exposure of the back-bleeding vessels.",
          "Excising the sac is unnecessary — the sac is closed over the graft.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "bleed", title: "Control the back-bleeding vessels", description: "The lumbar arteries are bleeding from the sac.",
        choices: [
          "Oversew the lumbar artery ostia from inside the sac.",
          "Cauterize the lumbar ostia.",
          "Pack the sac and proceed with the graft.",
        ],
        feedback: [
          "The lumbar ostia are oversewn.",
          "Cautery on the ostia can reopen or damage the vessel.",
          "Packing leaves ongoing bleeding into the graft.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Anastomose the proximal graft", description: "Sew the graft to the aorta.",
        choices: [
          "Sew the proximal anastomosis to the infrarenal neck with a running suture and a felt pledget where needed.",
          "Sew the graft to the suprarenal aorta.",
          "Sew the graft with deep bites through the back wall.",
        ],
        feedback: [
          "The proximal anastomosis is secure at the infrarenal neck.",
          "A suprarenal anastomosis is rarely needed and adds risk.",
          "Deep bites can injure the lumbar vessels or the vena cava.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Anastomose the distal graft", description: "Complete the distal anastomoses.",
        choices: [
          "Sew the distal anastomoses to the iliac arteries or the aortic bifurcation as planned.",
          "Sew both limbs to the aorta.",
          "Anastomose the graft to the inferior vena cava.",
        ],
        feedback: [
          "The distal anastomoses are completed as planned.",
          "Both limbs to the aorta leaves the legs without flow.",
          "Anastomosing to the vena cava is a fatal error.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check the anastomoses and pulses", description: "Confirm the repair.",
        choices: [
          "Remove the clamps in sequence and confirm the anastomoses are dry and the distal pulses return.",
          "Remove all clamps simultaneously.",
          "Trust the sutures and close without a pulse check.",
        ],
        feedback: [
          "The clamps are removed in sequence with dry anastomoses and good pulses.",
          "Simultaneous clamp release causes hypotension and washout.",
          "Skipping the pulse check misses an occluded limb.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "vitals", title: "Manage the clamp-release hypotension", description: "The pressure drops on clamp removal.",
        choices: [
          "Communicate with anesthesia, allow volume repletion, and release slowly.",
          "Re-clamp the aorta to raise the pressure.",
          "Push vasopressors without volume.",
        ],
        feedback: [
          "The pressure is managed with volume and slow release.",
          "Re-clamping prolongs ischemia.",
          "Vasopressors without volume risk ischemia.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      { kind: "verify", title: "Re-check the anastomoses after the flow", description: "Re-inspect the anastomoses after the clamps are off.", f: { test: "the anastomoses after flow", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      {
        kind: "verify", title: "Check the retroperitoneal bed", description: "Inspect the bed for oozing before the sac closure.",
        choices: [
          "Inspect the retroperitoneal bed along the left renal vein and the graft for oozing before closing the sac.",
          "Close the sac once the graft is in — the bed was controlled during the dissection.",
          "Close over a drain in the retroperitoneal bed to manage any oozing.",
        ],
        feedback: [
          "The bed and the graft are verified dry before the sac is closed over them.",
          "The retroperitoneal bed can ooze for hours after a clamp time — it must be seen, not assumed dry.",
          "A drain does not stop a bed ooze and adds an infection risk — control the source now.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "bleed", title: "Control a sac-edge bleeder", description: "The sac edge is bleeding.", f: { vessel: "the sac edge vessels", wrongVessels: ["the aorta", "the vena cava"] } },
      { kind: "verify", title: "Confirm the foot pulses", description: "Confirm the pedal pulses are present.", f: { test: "the pedal pulses", wrongTests: ["a routine X-ray", "a Doppler of the legs"] } },
      { kind: "closure", title: "Close the sac over the graft", description: "Wrap the sac around the graft.", f: { structure: "the aneurysm sac" } },
      {
        kind: "closure", title: "Close the abdomen", description: "Close the fascia and skin.",
        choices: [
          "Close the abdominal fascia in layers and approximate the skin.",
          "Close the skin only to keep tension off the aortic repair.",
          "Close the fascia with a single tight running suture to prevent a hernia.",
        ],
        feedback: [
          "Layered fascial closure restores the abdominal wall without tension on the retroperitoneum.",
          "Skin-only closure leaves the fascia open — evisceration risk and a weak repair.",
          "A single tight running suture strangulates the fascial edges and risks dehiscence and delayed bleeding.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major vascular surgery carries a high thrombosis risk." },
      { kind: "postop", title: "Watch for graft limb occlusion", description: "Monitor the legs for acute ischemia.", f: { test: "the leg perfusion", wrongTests: ["a routine X-ray", "a Doppler of the legs"] } },
      { kind: "postop", title: "Monitor the bowel", description: "Watch for ischemic colitis signs.", f: { test: "the bowel function and the symptoms", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Blood pressure targets", description: "Define the blood pressure targets for the graft.", f: { test: "the blood pressure readings", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Watch for renal impairment", description: "Monitor the renal function closely.", f: { test: "the urine output and the creatinine", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Graft infection precautions", description: "Review the endocarditis and the graft infection precautions.", f: { test: "the infection precautions", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Wound care", description: "Define the laparotomy wound care.", f: { test: "the wound for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the imaging surveillance of the graft.", f: { test: "the graft surveillance imaging", wrongTests: ["a routine MRI", "a blood panel"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the activity, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Lifestyle management", description: "Optimize the risk factors for the graft and the vessels.", f: { test: "the risk factor control", wrongTests: ["a routine blood panel", "a CT scan"] } },
      {
        kind: "postop", title: "Monitor distal perfusion", description: "Confirm the limbs are perfused.",
        choices: [
          "Check the distal pulses and the legs frequently in the first 24 hours.",
          "Check the pulses once and discharge from recovery.",
          "Rely on the intraoperative pulse check only.",
        ],
        feedback: [
          "Distal perfusion is monitored closely.",
          "A single check misses a delayed limb occlusion.",
          "Intraoperative checks cannot predict late thrombosis.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Monitor renal function", description: "The clamp time and the hemodynamics stress the kidneys.",
        choices: [
          "Monitor urine output and creatinine closely in the first 48 hours.",
          "Check creatinine only at discharge.",
          "Avoid fluids to protect the anastomoses.",
        ],
        feedback: [
          "Renal function is monitored closely.",
          "Delayed checks miss acute kidney injury.",
          "Fluid restriction can worsen the renal injury.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      },
      {
        kind: "postop", title: "Watch for ischemic colitis", description: "The mesenteric circulation may be compromised.",
        choices: [
          "Watch for abdominal pain, distension, and bloody diarrhea suggesting colonic ischemia.",
          "Ignore abdominal symptoms — they are expected after laparotomy.",
          "Check only the wound.",
        ],
        feedback: [
          "Ischemic colitis is detected early.",
          "Dismissing abdominal symptoms can miss a fatal colitis.",
          "Wound-only monitoring misses the mesenteric risk.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan surveillance and follow-up", description: "Define the graft surveillance.",
        choices: [
          "Arrange follow-up with imaging surveillance of the graft.",
          "No follow-up is needed after an AAA repair.",
          "Schedule a single clinic visit and stop.",
        ],
        feedback: [
          "Graft surveillance is planned.",
          "Skipping surveillance misses graft complications.",
          "A single visit does not cover late graft issues.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // RADICAL PROSTATECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "radical-prostatectomy",
    spec: {
      approach: "a robotic-assisted radical prostatectomy",
      wrongApproaches: ["a suprapubic approach as routine", "a transrectal approach"],
      landmark: "the prostatic apex and the neurovascular bundles",
      wrongLandmarks: ["the bladder neck alone", "the seminal vesicles"],
      vessel: "the dorsal venous complex and the prostatic pedicles",
      wrongVessels: ["the iliac artery", "the inferior vena cava"],
      nerve: "the cavernosal nerves of the neurovascular bundle",
      wrongNerves: ["the obturator nerve", "the femoral nerve"],
      structure: "the prostate, seminal vesicles, and the anastomosis",
      wrongStructures: ["the rectum", "the bladder diverticulum"],
      test: "a check of the anastomosis for a watertight seal",
      wrongTests: ["a routine cystoscopy", "an on-table MRI"],
      risks: ["hemorrhage", "nerve_injury", "infection"],
      instrument: "a robotic console and a needle driver",
      position: "steep Trendelenburg",
      wrongPositions: ["supine flat", "prone"],
      detail: "61-year-old, Gleason 7 prostate cancer, PSA 8.2, nerve-sparing candidate",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the biopsy, the staging, and the nerve-sparing plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Urologic implant-adjacent surgery demands timely prophylaxis." },
      { kind: "position", title: "Position in steep Trendelenburg", description: "The head-down position opens the pelvis.", f: { wrongPositions: ["supine flat", "prone"] } },
      {
        kind: "access", title: "Place the ports", description: "Set up the robotic access.",
        choices: [
          "Place a periumbilical camera port and fan the robotic arm ports to triangulate on the prostate.",
          "Place all ports low in the pelvis, close to the symphysis.",
          "Skip the camera port and work through a single large incision.",
        ],
        feedback: [
          "The ports fan toward the prostate with enough spacing for the robotic arms.",
          "Crowded low ports limit instrument range and risk vascular injury.",
          "An open single incision abandons the robotic approach without benefit.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "exposure", title: "Divide the urachus and enter the space of Retzius", description: "Expose the prostate.", f: { structure: "the space of Retzius", landmark: "the pubic bone and the prostate" } },
      {
        kind: "vessel", title: "Control the dorsal venous complex", description: "Secure the venous complex at the apex.",
        choices: [
          "Ligate the dorsal venous complex with a suture or stapler before dividing it.",
          "Cut the complex with cautery and observe.",
          "Clip the complex at the bladder neck.",
        ],
        feedback: [
          "The dorsal venous complex is controlled before division.",
          "Cutting the complex without control causes brisk bleeding.",
          "Clipping at the bladder neck is the wrong location.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Divide the bladder neck", description: "Set the proximal margin.",
        choices: [
          "Divide the bladder neck with a bladder-neck-sparing approach where oncologically safe.",
          "Excise a wide margin of the bladder neck routinely.",
          "Divide the bladder neck with a stapler.",
        ],
        feedback: [
          "The bladder neck is divided with the appropriate margin.",
          "Routine wide excision worsens continence without benefit.",
          "Stapling the bladder neck risks the ureters.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Mobilize the seminal vesicles", description: "Free the posterior structures.",
        choices: [
          "Dissect the seminal vesicles and vasa deferentia, staying anterior to the rectum.",
          "Dissect deep posteriorly toward the rectum.",
          "Pull the seminal vesicles firmly to free them.",
        ],
        feedback: [
          "The seminal vesicles are mobilized anterior to the rectum.",
          "Deep posterior dissection enters the rectum.",
          "Traction tears the seminal vesicle vessels.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "nerve", title: "Protect the neurovascular bundles", description: "Preserve the cavernosal nerves during the pedicle dissection.",
        choices: [
          "Dissect the prostatic pedicles with the neurovascular bundles preserved for a nerve-sparing case.",
          "Widen the resection to include the bundles for safety.",
          "Cauterize the pedicles broadly to control bleeding.",
        ],
        feedback: [
          "The neurovascular bundles are preserved for potency.",
          "Routine bundle excision causes erectile dysfunction without oncologic benefit here.",
          "Broad cautery destroys the bundles.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "vessel", title: "Control the prostatic pedicles", description: "Secure the vascular supply to the prostate.",
        choices: [
          "Clip and divide the prostatic pedicles in sequence with the bundles preserved.",
          "Staple across the pedicles en masse.",
          "Cut the pedicles with cautery and proceed.",
        ],
        feedback: [
          "The pedicles are controlled sequentially.",
          "Mass stapling risks the bundles and the ureters.",
          "Cautery division causes delayed bleeding.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Dissect the apex", description: "Free the prostatic apex.",
        choices: [
          "Dissect the apex sharply, preserving the sphincter and the distal urethra.",
          "Cut the apex with cautery at the pubic bone.",
          "Pull the prostate down to expose the apex.",
        ],
        feedback: [
          "The apex is dissected with the sphincter preserved.",
          "Cautery at the apex damages the sphincter and the bundles.",
          "Traction risks avulsing the apex.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Divide the urethra", description: "Complete the specimen.",
        choices: [
          "Divide the urethra distally with the specimen intact and remove it in a bag.",
          "Divide the urethra with a stapler.",
          "Leave the urethra attached and pull the specimen through.",
        ],
        feedback: [
          "The urethra is divided cleanly and the specimen removed.",
          "Stapling the urethra damages the sphincter.",
          "Pulling the specimen through the urethra tears it.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "core", title: "Create the anastomosis", description: "Join the bladder to the urethra.",
        choices: [
          "Create a tension-free vesicourethral anastomosis with interrupted sutures.",
          "Anastomose the bladder to the urethra under tension.",
          "Close the bladder neck and place a suprapubic tube.",
        ],
        feedback: [
          "A tension-free anastomosis is created.",
          "Tension on the anastomosis causes a leak and stricture.",
          "Closing the neck without a urethral connection is not a prostatectomy reconstruction.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "verify", title: "Test the anastomosis", description: "Confirm the seal.",
        choices: [
          "Fill the bladder and confirm a watertight anastomosis.",
          "Trust the sutures and close.",
          "Place the catheter without testing.",
        ],
        feedback: [
          "The anastomosis is confirmed watertight.",
          "Skipping the test risks a postoperative leak.",
          "A catheter alone does not confirm the seal.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "verify", title: "Re-check the anastomotic hemostasis", description: "Re-inspect the anastomosis with the bladder filled.", f: { test: "the anastomosis under bladder filling", wrongTests: ["a routine cystoscopy", "an on-table MRI"] } },
      { kind: "exposure", title: "Check the neurovascular bundles", description: "Confirm the bundles are intact.", f: { structure: "the neurovascular bundles", landmark: "the prostatic apex" } },
      { kind: "bleed", title: "Control a dorsal complex bleeder", description: "The dorsal venous complex is oozing.", f: { vessel: "the dorsal venous complex", wrongVessels: ["the iliac artery", "the obturator artery"] } },
      { kind: "verify", title: "Confirm the catheter position", description: "Check the catheter is in the bladder.", f: { test: "the catheter position", wrongTests: ["a routine cystoscopy", "a CT scan"] } },
      { kind: "closure", title: "Close the ports", description: "Close the port sites.", f: { structure: "the port sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Pelvic robotic surgery carries a thrombosis risk." },
      { kind: "postop", title: "Watch for clot retention", description: "Monitor for catheter blockage by clots.", f: { test: "the catheter output", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Pelvic floor exercises", description: "Start the pelvic floor training.", f: { test: "the pelvic floor exercises", wrongTests: ["a routine CT", "a nerve study"] } },
      { kind: "postop", title: "Erectile rehabilitation plan", description: "Discuss the erectile rehabilitation options.", f: { test: "the erectile rehabilitation plan", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Wound care", description: "Define the port site care.", f: { test: "the port sites", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the abdomen.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.", f: { test: "the mobilization tolerance", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "PSA surveillance plan", description: "Define the PSA monitoring schedule.", f: { test: "the PSA levels", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the PSA.", f: { test: "the pathology and the PSA at follow-up", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the catheter care, the medications, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      {
        kind: "postop", title: "Plan catheter care", description: "Define the catheter course.",
        choices: [
          "Keep the catheter with planned removal after confirming the anastomosis heals.",
          "Remove the catheter on day one.",
          "Leave the catheter for a month as routine.",
        ],
        feedback: [
          "The catheter course is planned for healing.",
          "Early removal risks a leak.",
          "Prolonged catheterization invites infection and stricture.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Monitor for bleeding", description: "Watch for hematuria and hemodynamic changes.",
        choices: [
          "Monitor the urine color, vitals, and hemoglobin for bleeding.",
          "Ignore pink urine — it is expected.",
          "Check the hemoglobin only at discharge.",
        ],
        feedback: [
          "Bleeding is monitored.",
          "Dismissing hematuria can miss significant hemorrhage.",
          "A discharge-only check misses a developing bleed.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Plan continence and erectile rehabilitation", description: "Set expectations and the recovery plan.",
        choices: [
          "Discuss the expected recovery of continence and erectile function with pelvic floor therapy.",
          "Promise full immediate recovery of both functions.",
          "Avoid discussing the functional outcomes.",
        ],
        feedback: [
          "Realistic expectations and a rehab plan are set.",
          "Overpromising immediate recovery is misleading.",
          "Avoiding the discussion leaves the patient unprepared.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "postop", title: "Plan the pathology and follow-up", description: "Coordinate the surveillance.",
        choices: [
          "Arrange follow-up with the pathology result and PSA surveillance.",
          "No follow-up is needed after a prostatectomy.",
          "Check PSA only at one year.",
        ],
        feedback: [
          "The pathology and PSA surveillance are planned.",
          "Skipping follow-up misses recurrence.",
          "Delayed PSA checks miss early biochemical recurrence.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ESOPHAGECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "esophagectomy",
    spec: {
      approach: "an Ivor Lewis esophagectomy (abdominal then right thoracic)",
      wrongApproaches: ["a left thoracic approach as routine", "a cervical approach alone"],
      landmark: "the azygos vein and the thoracic duct",
      wrongLandmarks: ["the left atrium", "the pulmonary artery"],
      vessel: "the left gastric artery and the azygos vein",
      wrongVessels: ["the celiac trunk", "the aorta"],
      nerve: "the recurrent laryngeal nerves and the thoracic duct",
      wrongNerves: ["the phrenic nerve alone", "the vagus nerve alone"],
      structure: "the esophagus and the gastric conduit",
      wrongStructures: ["the trachea", "the left bronchus"],
      test: "an anastomotic air-leak test and a check of the conduit perfusion",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["hypoxia", "infection", "hemorrhage", "cardiac_arrhythmia", "nerve_injury"],
      instrument: "a circular stapler and a thoracoscope",
      position: "supine for the abdominal phase, then left lateral",
      wrongPositions: ["prone throughout", "right lateral decubitus"],
      detail: "63-year-old, distal esophageal adenocarcinoma, dysphagia, COPD",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the staging, the lung function, and the two-phase plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "A long clean-contaminated case demands timely prophylaxis." },
      { kind: "position", title: "Position for the abdominal phase", description: "Supine for the abdominal dissection.", f: { wrongPositions: ["prone throughout", "right lateral decubitus"] } },
      {
        kind: "access", title: "Open the abdomen", description: "Expose the hiatus and the stomach.",
        choices: [
          "Open the abdomen through an upper midline incision and retract to expose the hiatus and the stomach.",
          "Open through a left thoracic incision as routine.",
          "Expose the hiatus through a cervical incision alone.",
        ],
        feedback: [
          "The upper midline exposure reaches the hiatus and the stomach for the abdominal phase.",
          "A left thoracotomy is not the abdominal access for this two-phase approach.",
          "A cervical incision alone cannot reach the hiatus or the stomach.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      { kind: "exposure", title: "Mobilize the stomach", description: "Preserve the right gastroepiploic arcade.", f: { structure: "the stomach and the gastroepiploic arcade", landmark: "the greater curvature" } },
      {
        kind: "vessel", title: "Control the left gastric artery", description: "Secure the gastric blood supply.",
        choices: [
          "Ligate the left gastric artery at its origin, preserving the right gastric and gastroepiploic arcades.",
          "Ligate the right gastric artery to simplify the dissection.",
          "Divide the gastroepiploic arcade to mobilize the stomach.",
        ],
        feedback: [
          "The left gastric artery is divided with the arcades preserved.",
          "Ligating the right gastric artery devascularizes the conduit.",
          "Dividing the arcade kills the conduit.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "core", title: "Create the gastric conduit", description: "Construct the conduit.",
        choices: [
          "Create a gastric tube along the greater curvature, preserving the arcade and the fundus.",
          "Create a wide conduit including the antrum.",
          "Use the whole stomach without narrowing it.",
        ],
        feedback: [
          "A well-vascularized conduit is created.",
          "A wide conduit is bulky and hard to pass.",
          "An un-narrowed stomach risks ischemia at the tip.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "nerve", title: "Protect the thoracic duct", description: "The duct runs beside the esophagus.",
        choices: [
          "Identify and preserve the thoracic duct, ligating it if injured.",
          "Divide the duct blindly during the dissection.",
          "Cauterize the duct to control oozing.",
        ],
        feedback: [
          "The thoracic duct is preserved.",
          "Blind division causes a chyle leak.",
          "Cauterizing the duct does not seal it.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Mobilize the esophagus", description: "Free the esophagus to the level of the azygos.",
        choices: [
          "Mobilize the esophagus with the surrounding lymphatics, staying clear of the trachea and the bronchi.",
          "Sweep the esophagus off the trachea bluntly.",
          "Cauterize along the tracheal wall to speed the dissection.",
        ],
        feedback: [
          "The esophagus is mobilized with the airway protected.",
          "Blunt sweeping can tear the membranous trachea.",
          "Cautery on the trachea causes a fistula.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "vessel", title: "Control the azygos vein", description: "The azygos crosses the esophagus.",
        choices: [
          "Ligate and divide the azygos vein to mobilize the esophagus.",
          "Staple across the azygos with a vascular stapler.",
          "Cauterize the azygos vein.",
        ],
        feedback: [
          "The azygos is ligated safely.",
          "A vascular stapler works only with clear dissection.",
          "Cauterizing the azygos causes catastrophic bleeding.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "core", title: "Divide the esophagus", description: "Set the proximal margin.",
        choices: [
          "Divide the esophagus at the level of the azygos with a negative margin confirmed.",
          "Divide the esophagus at the thoracic inlet.",
          "Divide the esophagus at the hiatus.",
        ],
        feedback: [
          "The esophagus is divided at the correct level.",
          "Dividing too high risks the recurrent laryngeal nerves.",
          "Dividing at the hiatus leaves disease behind.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "core", title: "Deliver the conduit", description: "Bring the conduit into the chest.",
        choices: [
          "Deliver the gastric conduit through the hiatus with the correct orientation and no tension.",
          "Pull the conduit through with force.",
          "Deliver the conduit anterior to the heart.",
        ],
        feedback: [
          "The conduit is delivered in the correct orientation.",
          "Forceful delivery twists or avulses the conduit.",
          "An anterior route is non-standard and risks compression.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check the conduit perfusion", description: "Confirm the conduit tip is viable.",
        choices: [
          "Confirm the conduit tip is pink with palpable pulses and good Doppler signal.",
          "Trust the conduit color and proceed.",
          "Anastomose regardless of the tip appearance.",
        ],
        feedback: [
          "The conduit is confirmed well-perfused.",
          "A dusky conduit will necrose and leak.",
          "Anastomosing a dead tip guarantees failure.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Create the anastomosis", description: "Join the conduit to the esophagus.",
        choices: [
          "Create a tension-free esophagogastric anastomosis, confirming the doughnuts are intact.",
          "Create the anastomosis under tension.",
          "Anastomose the conduit to the stomach remnant.",
        ],
        feedback: [
          "A tension-free anastomosis is created with intact doughnuts.",
          "Tension on the anastomosis leaks.",
          "Anastomosing to the stomach remnant is not the reconstruction.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "verify", title: "Test the anastomosis", description: "Confirm the seal.",
        choices: [
          "Perform an air-leak test under saline and repair any leak.",
          "Trust the stapler and close.",
          "Test the anastomosis only if the patient had radiation.",
        ],
        feedback: [
          "The anastomosis is confirmed sealed.",
          "Skipping the test risks a silent leak.",
          "Testing is standard regardless of radiation.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      { kind: "verify", title: "Re-check the conduit tip", description: "Confirm the conduit tip stays well-perfused.", f: { test: "the conduit perfusion at the tip", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      {
        kind: "verify", title: "Check the anastomotic tension", description: "Confirm the anastomosis is tension-free.",
        choices: [
          "Confirm the conduit reaches the esophagus without tension and the anastomosis lies free of stretch.",
          "Close once the anastomosis is sewn — the conduit was measured during the mobilization.",
          "Accept some tension — the anastomosis will stretch into place over the first week.",
        ],
        feedback: [
          "A tension-free anastomosis heals; a stretched one leaks — confirm the conduit lies slack.",
          "A tensioned anastomosis leaks, and the leak sets up a mediastinal infection.",
          "A tense anastomosis can tear along the staple line and bleed — the conduit must lie without stretch.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "bleed", title: "Control a conduit-edge bleeder", description: "The conduit staple line is bleeding.", f: { vessel: "the conduit staple line vessels", wrongVessels: ["the aorta", "the pulmonary artery"] } },
      { kind: "verify", title: "Confirm the drain positions", description: "Check the drains are at the anastomosis and the chest.", f: { test: "the drain positions", wrongTests: ["a routine chest X-ray", "an on-table MRI"] } },
      { kind: "closure", title: "Place the drains and close", description: "Drain the chest and abdomen.", f: { structure: "the chest drain and the abdominal closure" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major esophagogastric surgery carries a high thrombosis risk." },
      { kind: "postop", title: "Watch for an anastomotic leak", description: "Monitor the drains and the vitals for a leak.", f: { test: "the drain output and the inflammatory markers", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Ventilator management", description: "Plan the extubation and the pulmonary care.", f: { test: "the respiratory status", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Nutrition support", description: "Start the enteral feeding plan.", f: { test: "the nutritional plan", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Watch for recurrent laryngeal injury", description: "Assess the voice after the surgery.", f: { test: "the voice quality", wrongTests: ["a routine laryngoscopy", "a CT scan"] } },
      { kind: "postop", title: "Pain control", description: "Plan the thoracic analgesia.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.", f: { test: "the mobilization tolerance", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the oncology plan.", f: { test: "the pathology and the oncology plan", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the diet, the drain care, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      {
        kind: "postop", title: "Monitor the anastomosis", description: "Watch for a leak.",
        choices: [
          "Monitor the drains, the vitals, and the inflammatory markers for an anastomotic leak.",
          "Remove the drains immediately after surgery.",
          "Only investigate symptoms if they are severe.",
        ],
        feedback: [
          "A leak is detected early.",
          "Early drain removal hides a developing leak.",
          "Waiting for severe symptoms delays intervention.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Monitor oxygenation", description: "The chest and the conduit affect ventilation.",
        choices: [
          "Monitor oxygenation and manage secretions and analgesia to keep the lungs expanded.",
          "Check oxygen only if the patient complains.",
          "Keep the patient sedated to reduce demand.",
        ],
        feedback: [
          "Oxygenation is maintained.",
          "Intermittent checks miss hypoxia.",
          "Sedation promotes atelectasis and pneumonia.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Watch for chyle leak", description: "The thoracic duct may leak.",
        choices: [
          "Monitor the drain fluid and treat a chyle leak with dietary modification and drainage.",
          "Ignore milky drain fluid.",
          "Remove the drain if the fluid looks unusual.",
        ],
        feedback: [
          "A chyle leak is treated early.",
          "Ignoring chyle causes malnutrition and immunosuppression.",
          "Removing the drain leaves the leak in the chest.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Plan nutrition and swallowing", description: "Support the recovery.",
        choices: [
          "Start enteral feeding and arrange a swallow assessment before oral intake.",
          "Start oral intake immediately after surgery.",
          "Keep the patient fasting for two weeks.",
        ],
        feedback: [
          "Nutrition and swallowing are managed in sequence.",
          "Immediate oral intake risks aspiration and leak.",
          "Prolonged fasting delays recovery.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Plan the pathology and follow-up", description: "Coordinate the oncology plan.",
        choices: [
          "Arrange follow-up with the pathology result and the oncology team.",
          "No follow-up is needed after an esophagectomy.",
          "Schedule a routine CT in one month regardless.",
        ],
        feedback: [
          "The pathology guides the adjuvant plan.",
          "Skipping follow-up delays treatment decisions.",
          "Routine imaging timing depends on the pathology.",
        ],
        wrongComps: ["infection", "hypoxia"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // HEPATIC LOBECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "hepatic-lobectomy",
    spec: {
      approach: "a right hepatic lobectomy via a midline or Mercedes incision",
      wrongApproaches: ["a left subcostal approach as routine", "a thoracoabdominal approach"],
      landmark: "the porta hepatis and the middle hepatic vein",
      wrongLandmarks: ["the caudate lobe alone", "the splenic hilum"],
      vessel: "the right hepatic artery, portal vein, and hepatic veins",
      wrongVessels: ["the left portal vein", "the inferior vena cava"],
      nerve: "the bile ducts of the porta hepatis",
      wrongNerves: ["the phrenic nerve", "the vagus nerve"],
      structure: "the right lobe of the liver",
      wrongStructures: ["the left lobe", "the gallbladder bed alone"],
      test: "an ultrasound of the inflow vessels and a check of the resection margin",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["hemorrhage", "cardiac_arrhythmia", "infection", "hypoxia"],
      instrument: "an ultrasonic dissector and vascular staplers",
      position: "supine",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "59-year-old, solitary right lobe metastasis from colon cancer",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the CT volumetry, the liver function, and the resection plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "A major hepatic resection demands timely prophylaxis." },
      { kind: "position", title: "Position the patient", description: "Supine with the right side elevated if needed.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Make the incision", description: "Choose the exposure for the right lobe.", f: { wrongApproaches: ["a left subcostal approach as routine", "a thoracoabdominal approach"] } },
      { kind: "exposure", title: "Mobilize the right lobe", description: "Divide the ligaments to free the lobe.", f: { structure: "the right lobe", landmark: "the coronary and triangular ligaments" } },
      {
        kind: "landmark", title: "Assess the tumor and the inflow", description: "Plan the transection plane.",
        choices: [
          "Use intraoperative ultrasound to map the tumor and the inflow vessels before dividing anything.",
          "Trust the CT and start the parenchymal transection.",
          "Palpate the liver and divide along the palpable margin.",
        ],
        feedback: [
          "The ultrasound guides the plane and the vascular control.",
          "Skipping the ultrasound risks dividing a major vessel.",
          "Palpation alone is unreliable for deep lesions.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vessel", title: "Control the porta hepatis inflow", description: "Secure the right inflow vessels.",
        choices: [
          "Dissect the porta hepatis and control the right hepatic artery and portal vein individually.",
          "Clamp the whole porta hepatis and divide it.",
          "Ligate the left portal vein by mistake.",
        ],
        feedback: [
          "The right inflow is controlled individually.",
          "Mass clamping risks the left inflow and the bile duct.",
          "Ligating the left portal vein devascularizes the left lobe.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vessel", title: "Control the hepatic veins", description: "Secure the outflow before transection.",
        choices: [
          "Control the right hepatic vein with a vascular stapler or ligature after the inflow is divided.",
          "Divide the right hepatic vein first.",
          "Leave the hepatic veins for the end of the case.",
        ],
        feedback: [
          "The outflow is controlled after the inflow.",
          "Dividing the outflow first engorges the liver.",
          "Leaving the veins until the end risks avulsion during transection.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Transect the parenchyma", description: "Divide the liver tissue along the plane.",
        choices: [
          "Transect the parenchyma with an ultrasonic dissector, controlling the vessels and ducts individually.",
          "Crush the parenchyma with clamps and ligate everything en masse.",
          "Cut through the parenchyma with a stapler in one pass.",
        ],
        feedback: [
          "The parenchyma is divided with individual vessel control.",
          "Mass ligation risks the middle hepatic vein and the bile ducts.",
          "A single stapler pass can tear the vessels.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "bleed", title: "Control a hepatic vein bleeder", description: "The middle hepatic vein is bleeding.",
        choices: [
          "Apply pressure, then suture or staple the bleeding point precisely.",
          "Pack the liver and close.",
          "Cauterize the bleeding vein.",
        ],
        feedback: [
          "The venous bleed is controlled precisely.",
          "Packing alone risks ongoing loss and biliary injury.",
          "Cautery on a hepatic vein enlarges the hole.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "vitals", title: "Respond to the air embolism risk", description: "A hepatic vein is open to the air.",
        choices: [
          "Lower the head of the table, control the opening, and coordinate with anesthesia.",
          "Continue transecting — the embolism is unlikely.",
          "Raise the head of the table to drain the field.",
        ],
        feedback: [
          "The embolism risk is managed immediately.",
          "Ignoring the open vein risks a fatal air embolism.",
          "Raising the head increases the embolism risk.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "verify", title: "Check the resection margin", description: "Confirm the margin is clear.",
        choices: [
          "Inspect the transection surface and confirm a clear margin with the pathology orientation.",
          "Trust the plane and close.",
          "Widen the resection into the left lobe for safety.",
        ],
        feedback: [
          "The margin is confirmed clear.",
          "Skipping the check risks leaving disease behind.",
          "Widening into the left lobe risks liver failure.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "bleed", title: "Achieve final hemostasis", description: "The cut surface is oozing.",
        choices: [
          "Control the surface bleeding with cautery, sutures, and hemostatic agents.",
          "Pack the surface and close.",
          "Cauterize the entire cut surface.",
        ],
        feedback: [
          "The surface is hemostatic.",
          "Packing alone risks rebleeding and bile leak.",
          "Broad cautery necroses the surface and causes delayed bile leak.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "verify", title: "Re-check the cut surface hemostasis", description: "Re-inspect the cut surface before the closure.", f: { test: "the cut surface hemostasis", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      { kind: "exposure", title: "Check the remnant perfusion", description: "Confirm the remnant lobe is well-perfused.", f: { structure: "the remnant lobe", landmark: "the inflow vessels" } },
      { kind: "bleed", title: "Control a surface bleeder", description: "The cut surface is bleeding again.", f: { vessel: "the cut surface vessels", wrongVessels: ["the aorta", "the vena cava"] } },
      { kind: "verify", title: "Confirm the bile duct closure", description: "Check the ducts on the cut surface are sealed.", f: { test: "the bile duct closures", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      { kind: "closure", title: "Place drains and close", description: "Drain the resection bed and close.", f: { structure: "the resection bed drain and the abdominal wall" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major hepatic surgery carries a thrombosis risk." },
      { kind: "postop", title: "Watch for a bile leak", description: "Monitor the drain for bile.", f: { test: "the drain fluid for bile", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Liver function monitoring", description: "Track the liver enzymes and the synthesis.", f: { test: "the liver function panel", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Ascites monitoring", description: "Watch for ascites as the remnant regenerates.", f: { test: "the abdominal distension and the weight", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Encephalopathy watch", description: "Monitor for the signs of hepatic encephalopathy.", f: { test: "the mental status", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Nutrition support", description: "Start the liver-supportive nutrition.", f: { test: "the nutritional plan", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the incision.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.", f: { test: "the mobilization tolerance", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the imaging.", f: { test: "the pathology and the surveillance imaging", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Surveillance plan", description: "Define the imaging surveillance for recurrence.", f: { test: "the surveillance imaging schedule", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the diet, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Return to activity", description: "Define the lifting and activity restrictions.", f: { test: "the activity tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
      {
        kind: "postop", title: "Monitor liver function", description: "The remnant must compensate.",
        choices: [
          "Monitor liver enzymes, bilirubin, and synthetic function closely.",
          "Check the liver panel only at discharge.",
          "Avoid all lab work to reduce cost.",
        ],
        feedback: [
          "Liver function is monitored as the remnant regenerates.",
          "Delayed checks miss early liver failure.",
          "No labs risk missing decompensation.",
        ],
        wrongComps: ["infection", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Watch for bile leak", description: "The cut surface can leak bile.",
        choices: [
          "Monitor the drain fluid and treat a bile leak with drainage and endoscopic management if needed.",
          "Remove the drains immediately.",
          "Ignore the drain output.",
        ],
        feedback: [
          "A bile leak is detected and managed.",
          "Early drain removal hides a bile leak.",
          "Ignoring drain output risks biloma and sepsis.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan nutrition and follow-up", description: "Support the recovery.",
        choices: [
          "Start nutrition support and arrange oncology follow-up with the pathology.",
          "Keep the patient fasting until discharge.",
          "No follow-up is needed after a lobectomy.",
        ],
        feedback: [
          "Nutrition and oncology follow-up are arranged.",
          "Prolonged fasting delays recovery.",
          "Skipping follow-up misses recurrence.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LUMBAR MICRODISCECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "lumbar-microdiscectomy",
    spec: {
      approach: "a posterior midline microdiscectomy",
      wrongApproaches: ["an anterior retroperitoneal approach as routine", "a lateral transpsoas approach"],
      landmark: "the interlaminar space and the pedicles of L4 and L5",
      wrongLandmarks: ["the sacral hiatus", "the iliac crest"],
      vessel: "the epidural venous plexus",
      wrongVessels: ["the aorta", "the iliac artery"],
      nerve: "the L5 nerve root and the thecal sac",
      wrongNerves: ["the femoral nerve", "the obturator nerve"],
      structure: "the herniated disc fragment",
      wrongStructures: ["the posterior longitudinal ligament alone", "the facet joint"],
      test: "a check of the decompressed nerve root",
      wrongTests: ["an on-table MRI", "a bone scan"],
      risks: ["nerve_injury", "hemorrhage", "infection", "thrombosis"],
      instrument: "a microscope and a Kerrison punch",
      position: "prone on a spinal frame",
      wrongPositions: ["supine", "lateral decubitus"],
      detail: "38-year-old, L5 radiculopathy from an L4-L5 disc herniation",
    },
    steps: [
      { kind: "preop", title: "Confirm the level and the plan", description: "Review the MRI and the clinical level before induction." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "A spinal procedure demands timely prophylaxis." },
      { kind: "position", title: "Position prone on the frame", description: "Open the interlaminar space and protect the abdomen.", f: { wrongPositions: ["supine", "lateral decubitus"] } },
      { kind: "access", title: "Make the midline incision", description: "Expose the L4-L5 interlaminar space.", f: { wrongApproaches: ["an anterior approach", "a lateral approach"] } },
      {
        kind: "exposure", title: "Subperiosteal exposure", description: "Strip the paraspinal muscles off the laminae.",
        choices: [
          "Strip the paraspinal muscles subperiosteally off the spinous processes and laminae.",
          "Strip the muscles with cautery deep to the periosteum to speed the exposure.",
          "Strip the muscles sharply toward the facet joints to expose the canal fully.",
        ],
        feedback: [
          "The subperiosteal plane keeps the dissection bloodless and stays out of the canal.",
          "Going deep to the periosteum bleeds and risks entering the spinal canal.",
          "Carrying the dissection onto the facets destabilizes the segment and risks the nerve root.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "landmark", title: "Confirm the level", description: "Verify the interlaminar space before the decompression.",
        choices: [
          "Confirm the level with fluoroscopy against the sacrum.",
          "Trust the incision and start the laminotomy.",
          "Count the spinous processes by palpation.",
        ],
        feedback: [
          "The level is confirmed radiographically.",
          "Operating on the wrong level is a serious error.",
          "Palpation alone is unreliable.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "core", title: "Perform the laminotomy", description: "Open the interlaminar window.",
        choices: [
          "Perform a partial laminotomy and remove the ligamentum flavum to expose the nerve root.",
          "Remove the entire lamina and the facet joint.",
          "Cut the ligamentum flavum blindly with a Kerrison punch.",
        ],
        feedback: [
          "A targeted laminotomy exposes the root with the facets preserved.",
          "Removing the facets destabilizes the spine.",
          "Blind punching risks a dural tear.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "nerve", title: "Protect the nerve root", description: "The L5 root must be identified and retracted.",
        choices: [
          "Identify the L5 root and retract it gently with a nerve root retractor.",
          "Retract the thecal sac forcefully for more room.",
          "Look for the disc without moving the root.",
        ],
        feedback: [
          "The root is identified and protected.",
          "Forceful retraction causes a root injury.",
          "Working around the root without retraction risks an unseen injury.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "bleed", title: "Control the epidural venous bleeding", description: "The epidural plexus is bleeding.",
        choices: [
          "Control the epidural veins with bipolar cautery and cottonoids.",
          "Cauterize the dura to stop the bleeding.",
          "Pack the epidural space with bone wax.",
        ],
        feedback: [
          "The epidural bleeding is controlled safely.",
          "Cauterizing the dura tears it.",
          "Bone wax in the epidural space compresses the sac.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Find and remove the fragment", description: "Decompress the root.",
        choices: [
          "Retract the root medially and remove the herniated fragment under the microscope.",
          "Pull the fragment out blindly with a rongeur.",
          "Remove the whole disc space to be thorough.",
        ],
        feedback: [
          "The fragment is removed under direct vision.",
          "Blind rongeur use risks the root and the dura.",
          "Aggressive disc removal destabilizes the level.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "verify", title: "Confirm the root is decompressed", description: "Check the root is free.",
        choices: [
          "Confirm the root is mobile and free of compression with the probe.",
          "Trust the fragment removal and close.",
          "Remove more disc to guarantee decompression.",
        ],
        feedback: [
          "The root is confirmed decompressed.",
          "Skipping the check risks a missed fragment.",
          "Removing more disc adds instability without benefit.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "verify", title: "Check for a dural leak", description: "Confirm the dura is intact.",
        choices: [
          "Perform a Valsalva maneuver and confirm no CSF leak.",
          "Trust the dissection and close.",
          "Close the wound and observe for a headache.",
        ],
        feedback: [
          "The dura is confirmed intact.",
          "Skipping the test misses a dural tear.",
          "Waiting for a headache delays repair of a leak.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      { kind: "verify", title: "Re-confirm the root is free", description: "Re-check the root mobility after the Valsalva.", f: { test: "the root mobility and the decompression", wrongTests: ["an on-table MRI", "a bone scan"] } },
      {
        kind: "verify", title: "Check the dural repair", description: "Confirm the dura is intact and dry.",
        choices: [
          "Inspect the dura along the laminotomy edges and confirm it is intact and dry.",
          "Skip the leak check — if the dura is leaking, the drain will show it.",
          "Reinforce the dura with an overlying stitch just in case, without seeing the hole.",
        ],
        feedback: [
          "An intact, dry dura confirmed under direct vision means no CSF leak to repair.",
          "A CSF leak can set up meningitis — it must be seen and sealed now, not discovered on the floor.",
          "A blind stitch through the dura can catch a nerve root — identify the leak and repair it precisely.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      { kind: "bleed", title: "Control a bone-edge bleeder", description: "The lamina edge is bleeding.", f: { vessel: "the bone edge vessels", wrongVessels: ["the aorta", "the iliac artery"] } },
      {
        kind: "verify", title: "Wash the wound", description: "Irrigate the wound before the closure.",
        choices: [
          "Irrigate the wound thoroughly and confirm no retained disc fragments or bone dust before closure.",
          "Close over a routine X-ray to confirm the levels rather than washing out.",
          "Close while the epidural veins are still oozing — the pressure of closure will tamponade them.",
        ],
        feedback: [
          "The washout clears the fragments and bone dust that would otherwise irritate the root and seed infection.",
          "An X-ray shows the levels, not a retained fragment — the washout is what protects the disc space.",
          "Closure does not tamponade epidural oozing — an epidural hematoma can compress the cauda equina.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "closure", title: "Close the wound", description: "Close the fascia, subcutaneous layer, and skin.", f: { structure: "the fascia and skin" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Spinal surgery patients are at risk for thrombosis." },
      { kind: "postop", title: "Watch for a CSF leak", description: "Monitor for a positional headache or a wound leak.", f: { test: "the wound and the headache symptoms", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Radicular pain expectation", description: "Explain that some leg symptoms may persist briefly.", f: { test: "the leg symptoms", wrongTests: ["a routine MRI", "a nerve study"] } },
      { kind: "postop", title: "Wound care", description: "Define the back wound care.", f: { test: "the wound for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the back and the leg.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Mobilization plan", description: "Define the early mobilization with the lifting precautions.", f: { test: "the mobilization tolerance", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Return-to-work plan", description: "Define the return-to-work restrictions.", f: { test: "the functional tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up to review the recovery.", f: { test: "the recovery at follow-up", wrongTests: ["a routine MRI", "a CT scan"] } },
      { kind: "postop", title: "Recurrence risk discussion", description: "Discuss the recurrent herniation risk and the signs.", f: { test: "the recurrent symptoms", wrongTests: ["a routine MRI", "a nerve study"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the lifting rules, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Posture and body mechanics", description: "Teach the back-protective body mechanics.", f: { test: "the body mechanics", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Long-term back health", description: "Discuss the core strengthening for the long term.", f: { test: "the core strengthening plan", wrongTests: ["a routine X-ray", "a CT scan"] } },
      {
        kind: "postop", title: "Monitor the neurology", description: "Watch for new symptoms.",
        choices: [
          "Assess leg strength and sensation after surgery.",
          "Check the neuro exam only at the clinic visit.",
          "Trust the intraoperative result and skip the exam.",
        ],
        feedback: [
          "Early neurologic assessment catches a new deficit.",
          "A delayed exam misses a developing problem.",
          "Skipping the exam risks missing a root injury.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Manage the wound and the headache", description: "Watch for infection and CSF leak symptoms.",
        choices: [
          "Inspect the wound and ask about positional headaches that suggest a CSF leak.",
          "Discharge without a wound check.",
          "Ignore headaches after spinal surgery.",
        ],
        feedback: [
          "Wound and CSF leak signs are monitored.",
          "No check misses an early infection.",
          "A positional headache is the hallmark of a dural leak.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Plan mobilization", description: "Define the recovery pathway.",
        choices: [
          "Mobilize early with lifting precautions and physiotherapy.",
          "Keep the patient on bed rest for two weeks.",
          "Allow unrestricted lifting immediately.",
        ],
        feedback: [
          "Early mobilization with precautions is standard.",
          "Prolonged bed rest increases thrombosis risk.",
          "Unrestricted lifting risks a recurrent herniation.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the clinic plan.",
        choices: [
          "Arrange follow-up to review recovery and return-to-work plans.",
          "No follow-up is needed after a discectomy.",
          "Schedule a routine MRI before discharge.",
        ],
        feedback: [
          "Structured follow-up tracks recovery.",
          "Skipping follow-up misses recurrence and complications.",
          "Routine MRI adds no value.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // OFF-PUMP CABG
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "cabg-offpump",
    spec: {
      approach: "a median sternotomy with off-pump grafting on a beating heart",
      wrongApproaches: ["a thoracotomy as routine", "a subcostal approach"],
      landmark: "the LAD and the coronary targets",
      wrongLandmarks: ["the circumflex artery", "the posterior descending artery"],
      vessel: "the LIMA and the coronary targets",
      wrongVessels: ["the pulmonary veins", "the internal jugular vein"],
      nerve: "the left phrenic nerve",
      wrongNerves: ["the vagus nerve", "the recurrent laryngeal nerve"],
      structure: "the beating heart and the grafts",
      wrongStructures: ["the lungs", "the esophagus"],
      test: "graft flow measurement and a check of the anastomoses",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["cardiac_arrhythmia", "hemorrhage", "hypoxia", "thrombosis", "infection", "nerve_injury"],
      instrument: "a stabilizer and a coronary shunt",
      position: "supine with arms tucked",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "66-year-old, multi-vessel CAD, hypertensive and diabetic",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the angiogram and plan the conduits and the off-pump strategy." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Implant and grafting demand timely prophylaxis." },
      { kind: "position", title: "Position the patient", description: "Supine with arms tucked and pads placed.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Perform the median sternotomy", description: "Open the chest.", f: { wrongApproaches: ["a thoracotomy as routine", "a subcostal approach"] } },
      {
        kind: "exposure", title: "Open the pericardium", description: "Expose the heart and the targets.",
        choices: [
          "Open the pericardium over the aorta and right atrium and create a pericardial well with stay sutures.",
          "Open the pericardium directly over the left ventricular surface to reach the heart fastest.",
          "Incise the pericardium and skip the stay sutures to keep the field uncluttered.",
        ],
        feedback: [
          "Opening over the aorta and building the well gives a stable cradle for the beating heart and the grafts.",
          "The ventricular surface is the most irritable part of the heart — opening over it risks arrhythmia.",
          "Without stay sutures the well collapses and the heart can rotate — build the cradle properly.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "core", title: "Harvest the LIMA", description: "Take down the conduit.",
        choices: [
          "Harvest the LIMA as a pedicle, protecting the phrenic nerve and confirming flow.",
          "Harvest the LIMA with wide electrocautery.",
          "Skip the LIMA and use vein grafts only.",
        ],
        feedback: [
          "The LIMA pedicle is harvested with intact flow.",
          "Wide cautery burns the pedicle and the phrenic nerve.",
          "The LIMA is the best conduit for the LAD when available.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      { kind: "nerve", title: "Protect the left phrenic nerve", description: "The phrenic nerve runs beside the LIMA.", f: { nerve: "the left phrenic nerve", wrongNerves: ["the vagus nerve", "the hypoglossal nerve"] } },
      {
        kind: "core", title: "Stabilize the target", description: "Fix the beating heart for the anastomosis.",
        choices: [
          "Use the stabilizer to immobilize the target area, confirming the hemodynamics stay stable.",
          "Apply the stabilizer with maximum suction.",
          "Stabilize the heart by retracting it forcefully.",
        ],
        feedback: [
          "The target is stabilized with the hemodynamics maintained.",
          "Excessive suction injures the myocardium.",
          "Forceful retraction causes hypotension and arrhythmia.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "vessel", title: "Control the target vessel", description: "Prepare the coronary for the anastomosis.",
        choices: [
          "Place a shunt or snare to control the target and keep the distal flow.",
          "Clamp the target without a shunt.",
          "Cauterize the target to dry the field.",
        ],
        feedback: [
          "The target is controlled with distal perfusion maintained.",
          "Clamping without a shunt causes ischemia.",
          "Cauterizing the coronary causes a fatal injury.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "core", title: "Construct the anastomosis", description: "Sew the graft to the target.",
        choices: [
          "Construct the anastomosis with the correct size and orientation on the beating heart.",
          "Sew the graft to the wrong branch.",
          "Make the anastomosis as large as possible.",
        ],
        feedback: [
          "The anastomosis is correct and functional.",
          "Grafting the wrong branch leaves the disease untreated.",
          "An oversized anastomosis steals flow.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "vitals", title: "Respond to ischemia", description: "The ST segment is changing during the anastomosis.",
        choices: [
          "Pause, communicate with anesthesia, and support the hemodynamics while completing the anastomosis.",
          "Continue — the changes will resolve.",
          "Remove the stabilizer and abandon the graft.",
        ],
        feedback: [
          "Ischemia is managed while the graft is completed.",
          "Ignoring ST changes risks infarction.",
          "Abandoning the graft leaves the disease untreated.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "bleed", title: "Control an anastomotic bleeder", description: "A distal anastomosis is bleeding.",
        choices: [
          "Apply gentle pressure and place a precise additional suture at the bleeding point.",
          "Cauterize the anastomosis.",
          "Add a large pledgeted suture across the anastomosis.",
        ],
        feedback: [
          "The bleed is controlled precisely.",
          "Cautery destroys the graft.",
          "A large suture can occlude the anastomosis.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "core", title: "Complete the remaining grafts", description: "Graft the other targets.",
        choices: [
          "Stabilize and graft each planned target in sequence.",
          "Graft all targets on the anterior wall first.",
          "Skip the lateral and inferior targets to save time.",
        ],
        feedback: [
          "All planned targets are grafted.",
          "Sequencing matters for exposure and stability.",
          "Skipping targets leaves the disease untreated.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "core", title: "Construct the proximal anastomoses", description: "Connect the vein grafts to the aorta.",
        choices: [
          "Partially clamp the aorta and sew each proximal anastomosis with the correct orientation.",
          "Sew the proximals to the pulmonary artery.",
          "Connect the grafts to the aortic cannula site.",
        ],
        feedback: [
          "The proximal anastomoses are constructed correctly.",
          "Grafting to the pulmonary artery is fatal.",
          "Using the cannulation site compromises the repair.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check the grafts", description: "Confirm flow through the grafts.",
        choices: [
          "Use graft flow measurement to confirm each graft is patent.",
          "Trust the visual inspection.",
          "Measure flow only in the LIMA.",
        ],
        feedback: [
          "Graft flows are confirmed.",
          "Visual inspection misses a kinked graft.",
          "Checking only the LIMA misses a failing vein graft.",
        ],
        wrongComps: ["thrombosis", "cardiac_arrhythmia"],
      },
      { kind: "vessel", title: "Control sternal bleeding", description: "The sternal edges are oozing.", f: { vessel: "the sternal bleeding points", wrongVessels: ["the aorta", "the pulmonary artery"] } },
      { kind: "verify", title: "Confirm the hemostasis with protamine", description: "Reverse the heparin and confirm the field stays dry.", f: { test: "the field after protamine", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      {
        kind: "verify", title: "Check the LIMA bed", description: "Inspect the LIMA harvest bed for bleeding.",
        choices: [
          "Inspect the LIMA bed along the internal thoracic vessels and control any side-branch bleeding before closing.",
          "Close the sternum and rely on the drains to reveal any LIMA bed bleeding.",
          "Reinforce the LIMA bed with cautery along its full length just in case.",
        ],
        feedback: [
          "Side-branch bleeding from the harvest bed is controlled before the sternum closes.",
          "Drains reveal a bleed only after it has collected — the bed must be dry before closure.",
          "Cautery along the bed risks the phrenic nerve, which runs with the internal thoracic vessels — control only what is bleeding.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      { kind: "bleed", title: "Control a graft bed bleeder", description: "The harvest site is bleeding.", f: { vessel: "the harvest site vessels", wrongVessels: ["the femoral artery", "the aorta"] } },
      { kind: "verify", title: "Confirm the rhythm", description: "Check the rhythm is stable before closure.", f: { test: "the cardiac rhythm", wrongTests: ["a routine ECG", "a CT scan"] } },
      { kind: "closure", title: "Close the sternum", description: "Wire the sternum and close the layers.", f: { structure: "the sternum and the soft tissues" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Cardiac surgery carries a high thrombosis risk." },
      { kind: "postop", title: "Watch for low cardiac output", description: "Monitor the hemodynamics after the surgery.", f: { test: "the cardiac output and the pressures", wrongTests: ["a routine ECG", "a CT scan"] } },
      { kind: "postop", title: "Manage atrial fibrillation", description: "Treat new postoperative atrial fibrillation.", f: { test: "the rhythm and the rate", wrongTests: ["a routine ECG", "a CT scan"] } },
      { kind: "postop", title: "Pulmonary hygiene", description: "Plan the breathing exercises.", f: { test: "the respiratory status", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Renal protection", description: "Monitor the renal function.", f: { test: "the urine output and the creatinine", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Sternal precautions", description: "Teach the sternal precautions.", f: { test: "the sternal precautions", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Graft surveillance", description: "Define the graft surveillance plan.", f: { test: "the graft surveillance", wrongTests: ["a routine ECG", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the cardiology follow-up.", f: { test: "the discharge criteria and the follow-up", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the sternal precautions, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      {
        kind: "postop", title: "Plan ICU monitoring", description: "Define the postoperative surveillance.",
        choices: [
          "Monitor rhythm, hemodynamics, and graft flow in the ICU.",
          "Transfer to the ward once extubated.",
          "Monitor only the rhythm.",
        ],
        feedback: [
          "ICU monitoring catches graft failure early.",
          "Direct ward transfer is unsafe after CABG.",
          "Rhythm-only monitoring misses hypoperfusion.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Manage the chest tubes", description: "Track the mediastinal drainage.",
        choices: [
          "Track hourly output and re-explore for bleeding above the threshold.",
          "Remove the tubes as soon as the patient wakes.",
          "Leave the tubes in for three days routinely.",
        ],
        feedback: [
          "Tube output guides the bleeding decision.",
          "Early removal risks tamponade.",
          "Prolonged drainage invites infection.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Anti-platelet therapy", description: "Protect the grafts.",
        choices: [
          "Start aspirin early and plan clopidogrel if indicated.",
          "Start full-dose anticoagulation immediately.",
          "Avoid all antiplatelet therapy.",
        ],
        feedback: [
          "Aspirin protects the grafts.",
          "Full anticoagulation risks tamponade.",
          "No antiplatelet therapy increases graft thrombosis.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan cardiac rehabilitation", description: "Define the recovery pathway.",
        choices: [
          "Refer for cardiac rehabilitation and arrange cardiology follow-up.",
          "No rehabilitation is needed after CABG.",
          "Restrict all exertion indefinitely.",
        ],
        feedback: [
          "Cardiac rehabilitation improves outcomes.",
          "Skipping rehab delays recovery.",
          "Indefinite restriction is harmful.",
        ],
        wrongComps: ["thrombosis", "infection"],
      }
    ],
  },
];
