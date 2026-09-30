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
      risks: ["hemorrhage", "cardiac_arrhythmia", "hypoxia", "thrombosis", "infection", "anaphylaxis", "fluid_overload"],
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
        wrongComps: ["thrombosis", "hemorrhage"],
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
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
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
      {
        kind: "verify", title: "Re-check the anastomoses after the flow", description: "Re-inspect the anastomoses after the clamps are off.",
        choices: [
          "Inspect both anastomoses under full pressure, repair any needle-hole bleeding with a precise suture, and check the limbs are not kinked.",
          "Pack the anastomoses with gauze and close the aneurysm sac over the graft.",
          "Reverse all the heparin and close before checking the anastomoses under full flow.",
        ],
        feedback: [
          "Checking under full pressure finds the bleeding points while they are easy to repair.",
          "Packing hides a bleeding suture line that then bleeds into the retroperitoneum.",
          "Unchecked anastomoses can leak, and a kinked limb clots once the flow slows.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
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
      {
        kind: "verify", title: "Confirm the foot pulses", description: "Confirm the pedal pulses are present.",
        choices: [
          "Check the femoral and foot pulses or Doppler signals in both legs before leaving theater.",
          "Accept an absent foot pulse on one side as vasospasm and recheck it tomorrow.",
          "Check the femoral pulses only, since the feet are cold after the clamp.",
        ],
        feedback: [
          "Distal embolism or limb thrombosis must be found on the table, while an embolectomy is simple.",
          "An absent pulse after clamping is embolism until proven otherwise; waiting loses the limb, and reperfusing it late floods the circulation with potassium.",
          "Femoral pulses can be normal with emboli in the calf vessels.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
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
      {
        kind: "postop", title: "Watch for graft limb occlusion", description: "Monitor the legs for acute ischemia.",
        choices: [
          "Check the pulses and leg color hourly for 24 hours and get an urgent duplex for any change.",
          "Check the legs once a day on the ward round.",
          "Start full-dose heparin in every patient for 5 days.",
        ],
        feedback: [
          "Limb occlusion presents early; hourly checks find it in time for thrombectomy.",
          "Daily checks miss an occluded limb until ischemia is established.",
          "Routine full anticoagulation raises bleeding without preventing limb occlusion.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Monitor the bowel", description: "Watch for ischemic colitis signs.",
        choices: [
          "Watch for bloody diarrhea, a rising lactate, or abdominal pain, and arrange early sigmoidoscopy if they appear.",
          "Treat postoperative diarrhea with loperamide and observe.",
          "Start feeding on day 1 regardless of distension or lactate.",
        ],
        feedback: [
          "Colonic ischemia after IMA ligation shows as bloody stool; early sigmoidoscopy decides on resection.",
          "Bloody diarrhea after AAA repair is colonic ischemia until proven otherwise.",
          "Feeding an ischemic, distended bowel makes it worse, and it can perforate.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Blood pressure targets", description: "Define the blood pressure targets for the graft.",
        choices: [
          "Keep the systolic pressure around 100 to 140 mmHg, treating pain first and then using short-acting agents.",
          "Let the pressure run above 180 mmHg so the kidneys and bowel stay perfused.",
          "Drive the systolic pressure below 90 mmHg to protect the suture lines.",
        ],
        feedback: [
          "A moderate pressure protects the anastomoses while keeping the organs perfused.",
          "High pressure stresses fresh anastomoses and the heart.",
          "Low pressure risks kidney, bowel, and heart ischemia.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Watch for renal impairment", description: "Monitor the renal function closely.",
        choices: [
          "Track hourly urine output and daily creatinine, keep him euvolemic, and avoid NSAIDs and contrast.",
          "Give NSAIDs for pain, since they spare opioids.",
          "Order a contrast CT on day 1 as a routine graft check.",
        ],
        feedback: [
          "Aortic clamping stresses the kidneys; perfusion and avoiding nephrotoxins protect them.",
          "NSAIDs after aortic clamping injure an already stressed kidney, and oliguria follows.",
          "Early routine contrast adds a nephrotoxic load with no indication, and contrast can trigger a reaction.",
        ],
        wrongComps: ["fluid_overload", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Graft infection precautions", description: "Review the endocarditis and the graft infection precautions.",
        choices: [
          "Complete the perioperative antibiotic course, keep the wounds clean, and treat any wound infection early and aggressively.",
          "Continue oral antibiotics for 6 weeks as routine.",
          "Treat a discharging wound with dressings alone.",
        ],
        feedback: [
          "Graft infection starts from wound or bloodstream sources; early treatment protects the graft.",
          "Prolonged routine antibiotics do not reduce graft infection, select resistance, and risk drug reactions.",
          "A wound infection can track down to the graft.",
        ],
        wrongComps: ["anaphylaxis", "infection"],
      },
      {
        kind: "postop", title: "Wound care", description: "Define the laparotomy wound care.",
        choices: [
          "Inspect the laparotomy daily, keep it dry, and remove the clips at 10 to 14 days.",
          "Keep him in bed until the clips are out to protect the wound.",
          "Allow soaking in a bath from day 1.",
        ],
        feedback: [
          "A long laparotomy in an arteriopath heals slowly; clips stay 10 to 14 days.",
          "Two weeks of bed rest to protect a wound invites DVT and pneumonia.",
          "Soaking a fresh wound raises infection risk.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the imaging surveillance of the graft.",
        choices: [
          "Review at 6 weeks with the wound and a first imaging check of the graft, then enter the surveillance program.",
          "Stop the beta-blocker now the surgery is over.",
          "Stop the antiplatelet at discharge since the aneurysm is gone.",
        ],
        feedback: [
          "The first review checks the wound and graft and starts lifelong surveillance.",
          "Abrupt beta-blocker withdrawal after vascular surgery causes rebound tachycardia and ischemia.",
          "Aneurysm patients need lifelong antiplatelet therapy for their cardiovascular risk.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the activity, and the warning signs.",
        choices: [
          "Advise no heavy lifting for 6 weeks, and urgent return for back or abdominal pain, fever, leg pain, or bloody stools.",
          "Advise return only if the wound becomes red.",
          "Allow a return to heavy manual work at 2 weeks if the wound has healed.",
        ],
        feedback: [
          "The red flags cover graft infection, limb occlusion, and bowel ischemia.",
          "Back pain, fever, leg pain, or bloody stools can mean graft infection, limb occlusion, or bowel ischemia.",
          "Heavy lifting before 6 weeks risks wound dehiscence and incisional hernia.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Lifestyle management", description: "Optimize the risk factors for the graft and the vessels.",
        choices: [
          "Support smoking cessation, control his blood pressure, and continue the statin and antiplatelet.",
          "Defer smoking cessation until he has recovered from the surgery.",
          "Stop the blood pressure tablets now the aneurysm has been repaired.",
        ],
        feedback: [
          "Risk-factor control prevents new aneurysms and cardiovascular events.",
          "Smoking delays wound healing now and drives new aneurysms and cardiovascular events later.",
          "Hypertension still drives stroke and new aneurysm formation.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
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
          "Arrange one CT at 30 days and discharge from surveillance if the graft looks good.",
          "Schedule a single clinic visit and stop.",
        ],
        feedback: [
          "Graft surveillance is planned.",
          "Graft complications such as pseudoaneurysm and graft infection appear years later; surveillance is lifelong.",
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
      risks: ["hemorrhage", "nerve_injury", "infection", "thrombosis"],
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
          "A staple line at the bladder neck can catch the ureteric orifices — the obstructed, leaking ureter gets infected.",
        ],
        wrongComps: ["nerve_injury", "infection"],
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
          "A mass staple line across thick pedicles leaves vessels partly controlled, and they bleed; it can also catch the ureters.",
          "Heat spreading from cautery on the pedicles burns the neurovascular bundles, causing erectile dysfunction and incontinence.",
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
      {
        kind: "verify", title: "Re-check the anastomotic hemostasis", description: "Re-inspect the anastomosis with the bladder filled.",
        choices: [
          "Fill the bladder with 150 mL, check for a leak and bleeding, and add a stitch if needed.",
          "Close without testing the anastomosis.",
          "Place extra deep stitches through the bladder neck and urethra to secure it.",
        ],
        feedback: [
          "A leak test finds defects while they are easy to repair.",
          "An untested anastomosis can leak urine into the pelvis.",
          "Extra deep stitches narrow the anastomosis and can catch the sphincter.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      { kind: "exposure", title: "Check the neurovascular bundles", description: "Confirm the bundles are intact.", f: { structure: "the neurovascular bundles", landmark: "the prostatic apex" } },
      { kind: "bleed", title: "Control a dorsal complex bleeder", description: "The dorsal venous complex is oozing.", f: { vessel: "the dorsal venous complex", wrongVessels: ["the iliac artery", "the obturator artery"] } },
      {
        kind: "verify", title: "Confirm the catheter position", description: "Check the catheter is in the bladder.",
        choices: [
          "Confirm the catheter is in the bladder with free drainage and the balloon inflated there.",
          "Inflate the balloon without checking its position.",
          "Use a small catheter to limit discomfort.",
        ],
        feedback: [
          "A correctly placed catheter splints the anastomosis while it heals.",
          "A balloon inflated in the urethra tears the anastomosis.",
          "A small catheter blocks with clots.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      { kind: "closure", title: "Close the ports", description: "Close the port sites.", f: { structure: "the port sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Pelvic robotic surgery carries a thrombosis risk." },
      {
        kind: "postop", title: "Watch for clot retention", description: "Monitor for catheter blockage by clots.",
        choices: [
          "Check the catheter drainage hourly and flush gently with saline if it blocks.",
          "Flush the catheter forcefully to clear clots.",
          "Leave a blocked catheter until the morning round.",
        ],
        feedback: [
          "Gentle flushing keeps the catheter draining without disrupting the anastomosis.",
          "Forceful flushing can disrupt the anastomosis.",
          "A blocked catheter distends the bladder and stresses the anastomosis.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Pelvic floor exercises", description: "Start the pelvic floor training.",
        choices: [
          "Start pelvic floor training after catheter removal, ideally with a physiotherapist.",
          "Start forceful pelvic floor exercises with the catheter in.",
          "Wait 6 months to see if continence returns before training.",
        ],
        feedback: [
          "Guided training speeds the recovery of continence.",
          "Straining against a catheter irritates the anastomosis.",
          "Delaying training slows continence recovery.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Erectile rehabilitation plan", description: "Discuss the erectile rehabilitation options.",
        choices: [
          "Discuss early rehabilitation with a PDE5 inhibitor, and set realistic expectations after nerve sparing.",
          "Promise full return of erections in a few weeks.",
          "Advise avoiding any sexual activity for a year.",
        ],
        feedback: [
          "Early rehabilitation may improve erectile recovery after nerve sparing.",
          "Recovery takes months to years; false expectations cause distress.",
          "A long abstinence period may worsen erectile recovery.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "postop", title: "Wound care", description: "Define the port site care.",
        choices: [
          "Keep the port sites dry and dressed for 48 hours and check them for redness.",
          "Soak the port sites in the bath from day 1.",
          "Remove the dressings immediately after surgery.",
        ],
        feedback: [
          "Simple wound care prevents port-site infection.",
          "Soaking raises infection.",
          "Early dressing removal exposes the wounds to contamination.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Pain control", description: "Plan the analgesia for the abdomen.",
        choices: [
          "Use paracetamol, a short NSAID course if the kidneys allow, and minimal opioid.",
          "Use opioids alone for pain.",
          "Give high-dose NSAIDs for two weeks.",
        ],
        feedback: [
          "Multimodal analgesia speeds mobilization and bowel recovery.",
          "Opioids alone cause constipation, which strains the anastomosis.",
          "Long high-dose NSAIDs raise bleeding and kidney injury.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.",
        choices: [
          "Mobilize on the evening of surgery and give extended LMWH as pelvic cancer surgery requires.",
          "Keep him in bed until the catheter is out.",
          "Stop the LMWH at discharge.",
        ],
        feedback: [
          "Early mobilization and extended prophylaxis prevent clots.",
          "Bed rest raises clot and chest infection risk.",
          "Pelvic cancer surgery calls for about 4 weeks of LMWH.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "PSA surveillance plan", description: "Define the PSA monitoring schedule.",
        choices: [
          "Check the PSA at 6 to 12 weeks, then every 3 to 6 months, and act on a rising value.",
          "Check the PSA once a year.",
          "Check the PSA only if symptoms develop.",
        ],
        feedback: [
          "An undetectable PSA confirms clearance; a rising PSA shows early recurrence.",
          "Yearly checks miss early biochemical recurrence.",
          "Symptoms appear late; the PSA finds recurrence years earlier.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the PSA.",
        choices: [
          "Review at 6 weeks with the pathology, first PSA, and continence, and discuss radiotherapy if the margins are positive.",
          "Review at 6 months with a PSA.",
          "Discharge to the GP with the pathology to follow.",
        ],
        feedback: [
          "Margins and the PSA decide on adjuvant or early salvage radiotherapy.",
          "A late review delays radiotherapy decisions.",
          "The urology team must interpret the pathology.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the catheter care, the medications, and the warning signs.",
        choices: [
          "Teach catheter care, and to return for fever, a blocked catheter, leg swelling, or heavy bleeding.",
          "Advise return only for a fever.",
          "Allow removing the catheter at home after a few days.",
        ],
        feedback: [
          "The warning signs cover infection, clots, and a blocked catheter.",
          "Leg swelling and a blocked catheter need urgent review too.",
          "The catheter stays until the anastomosis heals; early removal causes a leak.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
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
          "Arrange a single clinic visit at 3 months to check continence, then discharge.",
          "Check PSA only at one year.",
        ],
        feedback: [
          "The pathology and PSA surveillance are planned.",
          "Biochemical recurrence is caught by serial PSA over years; one continence visit does not cover it.",
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
      risks: ["hypoxia", "infection", "hemorrhage", "cardiac_arrhythmia", "nerve_injury", "thrombosis"],
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
          "Divide the gastrocolic omentum close to the stomach wall, taking the short arcade vessels with it.",
        ],
        feedback: [
          "The left gastric artery is divided with the arcades preserved.",
          "Ligating the right gastric artery devascularizes the conduit.",
          "Dividing close to the greater curve takes the gastroepiploic arcade, the conduit's blood supply, and the ischemic conduit leaks.",
        ],
        wrongComps: ["thrombosis", "infection"],
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
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "nerve", title: "Protect the thoracic duct", description: "The duct runs beside the esophagus.",
        choices: [
          "Identify and preserve the thoracic duct, ligating it if injured.",
          "Take the tissue between the aorta and azygos en bloc without identifying the duct.",
          "Cauterize the duct to control oozing.",
        ],
        feedback: [
          "The thoracic duct is preserved.",
          "The unligated duct leaks chyle into the chest, and the chylothorax compresses the lung.",
          "Cautery does not seal the duct; the leak drains protein and lymphocytes and sets up infection.",
        ],
        wrongComps: ["hypoxia", "infection"],
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
        wrongComps: ["nerve_injury", "infection"],
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
        wrongComps: ["thrombosis", "hemorrhage"],
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
      {
        kind: "verify", title: "Re-check the conduit tip", description: "Confirm the conduit tip stays well-perfused.",
        choices: [
          "Check the conduit tip is pink and bleeding, and trim back to healthy tissue before the anastomosis.",
          "Accept a dusky tip, since it improves once the conduit sits in the chest.",
          "Build the anastomosis at the very tip to preserve length.",
        ],
        feedback: [
          "The tip has the poorest blood supply; an anastomosis on healthy tissue heals.",
          "A dusky tip necroses and leaks.",
          "The tip is the most ischemic part of the conduit; joining there invites a leak.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
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
      {
        kind: "verify", title: "Confirm the drain positions", description: "Check the drains are at the anastomosis and the chest.",
        choices: [
          "Place chest drains apically and basally, away from the anastomosis, and confirm the feeding jejunostomy.",
          "Lay a drain directly against the anastomosis.",
          "Use a single basal drain to limit discomfort.",
        ],
        feedback: [
          "Drains clear air and fluid, and the feeding tube allows early nutrition.",
          "A drain against a fresh anastomosis can erode it.",
          "A single basal drain leaves apical air and the lung does not expand.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      { kind: "closure", title: "Place the drains and close", description: "Drain the chest and abdomen.", f: { structure: "the chest drain and the abdominal closure" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major esophagogastric surgery carries a high thrombosis risk." },
      {
        kind: "postop", title: "Watch for an anastomotic leak", description: "Monitor the drains and the vitals for a leak.",
        choices: [
          "Watch for fever, tachycardia, new atrial fibrillation, or a change in the drain, and get a CT or endoscopy if they appear.",
          "Treat new atrial fibrillation with rate control alone and continue feeding by mouth.",
          "Start oral fluids on day 1 to test the anastomosis.",
        ],
        feedback: [
          "New AF or tachycardia after an esophagectomy is a leak until proven otherwise.",
          "AF is often the first sign of a leak; feeding through it spreads contamination into the chest.",
          "Oral intake before the anastomosis is assessed pushes fluid through any leak.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Ventilator management", description: "Plan the extubation and the pulmonary care.",
        choices: [
          "Extubate early once warm and awake with good epidural analgesia, then start physiotherapy.",
          "Keep him ventilated for 48 hours to protect the anastomosis.",
          "Extubate straight away without checking his cough or the analgesia.",
        ],
        feedback: [
          "Early extubation with good pain control reduces pneumonia, the commonest complication.",
          "Prolonged ventilation raises pneumonia and aspiration risk.",
          "A weak cough without analgesia leads to sputum retention and reintubation.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Nutrition support", description: "Start the enteral feeding plan.",
        choices: [
          "Start jejunostomy feeding within 24 to 48 hours and build up to the target.",
          "Keep him nil by mouth on IV fluids until the swallow study.",
          "Start oral feeding on day 2 if he feels hungry.",
        ],
        feedback: [
          "Early jejunal feeding maintains nutrition and gut function without stressing the anastomosis.",
          "Prolonged starvation delays healing and raises infection.",
          "Oral intake before the anastomosis is checked risks aspiration and leak.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Watch for recurrent laryngeal injury", description: "Assess the voice after the surgery.",
        choices: [
          "Check the voice and cough before oral intake, and get an ENT assessment for hoarseness.",
          "Start oral intake and assess the voice at the clinic visit.",
          "Put hoarseness down to the tube and reassure him.",
        ],
        feedback: [
          "Vocal cord palsy impairs the cough and causes aspiration; it is found before feeding by mouth.",
          "A palsied cord lets fluid into the airway; oral feeding before assessment leads to aspiration.",
          "Hoarseness after the neck dissection is nerve injury until proven otherwise.",
        ],
        wrongComps: ["hypoxia", "nerve_injury"],
      },
      {
        kind: "postop", title: "Pain control", description: "Plan the thoracic analgesia.",
        choices: [
          "Run a thoracic epidural or paravertebral catheter with regular paracetamol, and check the block daily.",
          "Use IV morphine on demand only.",
          "Give regular NSAIDs at full dose.",
        ],
        feedback: [
          "Regional analgesia lets him cough and breathe deeply, which prevents pneumonia.",
          "Opioids alone sedate him and suppress the cough.",
          "NSAIDs risk kidney injury and bleeding after a major resection.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.",
        choices: [
          "Sit him out on day 1 and walk on day 2, with LMWH and compression stockings.",
          "Keep him in bed until the drains are out.",
          "Hold the LMWH until he is fully mobile.",
        ],
        feedback: [
          "Early mobilization prevents pneumonia and clots.",
          "Bed rest after a thoracotomy leads to atelectasis and pneumonia.",
          "Esophageal cancer surgery carries a high clot risk that needs prophylaxis from the start.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the oncology plan.",
        choices: [
          "Review at 2 weeks with the pathology, discuss adjuvant treatment, and monitor weight and dysphagia.",
          "Review at 3 months once he has recovered.",
          "Discharge to the GP with the pathology to follow.",
        ],
        feedback: [
          "Adjuvant decisions and early strictures need prompt review.",
          "An anastomotic stricture or weight loss develops before a 3-month review.",
          "The oncology plan needs the surgical team's review of the pathology.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the diet, the drain care, and the warning signs.",
        choices: [
          "Advise small frequent meals, sleeping head-up, and return for fever, chest pain, or trouble swallowing.",
          "Advise large meals three times a day to regain weight quickly.",
          "Allow lying flat at night as usual.",
        ],
        feedback: [
          "Small meals and head-up sleep reduce dumping and reflux into the conduit.",
          "Large meals cause dumping and regurgitation from the conduit.",
          "Lying flat lets the conduit reflux, with aspiration at night.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
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
          "Discharge to the GP and ask them to chase the pathology result.",
          "Schedule a routine CT in one month regardless.",
        ],
        feedback: [
          "The pathology guides the adjuvant plan.",
          "The adjuvant plan needs the surgical and oncology teams; handing the pathology to the GP delays it.",
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
      risks: ["hemorrhage", "cardiac_arrhythmia", "infection", "hypoxia", "thrombosis", "fluid_overload"],
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
          "Divide the right-sided hilar structures together with one vascular stapler load.",
          "Ligate the first portal branch that comes into view at the hilum.",
        ],
        feedback: [
          "The right inflow is controlled individually.",
          "A mass staple across the hilum risks the left-sided inflow and the bile duct.",
          "Ligating the left portal vein devascularizes the left lobe.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
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
          "Coagulate the bleeding point with the bipolar forceps.",
        ],
        feedback: [
          "The venous bleed is controlled precisely.",
          "Packing alone risks ongoing loss and biliary injury.",
          "Coagulation enlarges the hole in a thin-walled hepatic vein, and air is drawn in.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
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
        wrongComps: ["thrombosis", "hypoxia"],
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
      {
        kind: "verify", title: "Re-check the cut surface hemostasis", description: "Re-inspect the cut surface before the closure.",
        choices: [
          "Inspect the cut surface with the CVP back up, control points with sutures or clips, and apply a sealant if needed.",
          "Inspect at the current low CVP and close if dry.",
          "Pack the cut surface and close.",
        ],
        feedback: [
          "Raising the CVP back to normal reveals venous bleeders that low CVP hides.",
          "A surface that is dry at low CVP can bleed once the pressure normalizes.",
          "Packing hides active bleeders and a bile leak.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "exposure", title: "Check the remnant perfusion", description: "Confirm the remnant lobe is well-perfused.", f: { structure: "the remnant lobe", landmark: "the inflow vessels" } },
      { kind: "bleed", title: "Control a surface bleeder", description: "The cut surface is bleeding again.", f: { vessel: "the cut surface vessels", wrongVessels: ["the aorta", "the vena cava"] } },
      {
        kind: "verify", title: "Confirm the bile duct closure", description: "Check the ducts on the cut surface are sealed.",
        choices: [
          "Check the cut surface for bile with a white gauze or leak test, and suture any open duct.",
          "Close without checking, since small ducts seal on their own.",
          "Cauterize any bile-stained area on the cut surface.",
        ],
        feedback: [
          "A leak test finds open ducts that would otherwise leak into the abdomen.",
          "Unsealed ducts on the cut surface leak and form a biloma.",
          "Cautery does not close a duct; it leaks later as the eschar separates.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "closure", title: "Place drains and close", description: "Drain the resection bed and close.", f: { structure: "the resection bed drain and the abdominal wall" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major hepatic surgery carries a thrombosis risk." },
      {
        kind: "postop", title: "Watch for a bile leak", description: "Monitor the drain for bile.",
        choices: [
          "Check the drain for bile daily and measure the drain bilirubin if it looks bilious.",
          "Remove the drain on day 1 whatever it shows.",
          "Put a bile-stained drain down to old blood and continue.",
        ],
        feedback: [
          "A drain bilirubin 3 times the serum level confirms a bile leak.",
          "Early removal misses a leak, which collects as a biloma.",
          "Bile in the drain needs confirming and managing, not dismissing.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Liver function monitoring", description: "Track the liver enzymes and the synthesis.",
        choices: [
          "Track bilirubin, INR, and lactate daily to watch for liver failure in the remnant.",
          "Check the liver tests once at discharge.",
          "Give fresh frozen plasma routinely to keep the INR normal.",
        ],
        feedback: [
          "A rising bilirubin and INR after day 5 signal post-hepatectomy liver failure.",
          "Liver failure develops in the first days; one test at discharge misses it.",
          "Routine plasma masks the INR, which is the main marker of remnant function, and overloads him.",
        ],
        wrongComps: ["infection", "fluid_overload"],
      },
      {
        kind: "postop", title: "Ascites monitoring", description: "Watch for ascites as the remnant regenerates.",
        choices: [
          "Weigh him daily and watch the drain volume and abdominal girth, restricting sodium if ascites builds.",
          "Give large volumes of saline to keep the urine output high.",
          "Leave the drain in until the ascites stops completely.",
        ],
        feedback: [
          "Early ascites control prevents wound leaks and infection.",
          "Saline loads a regenerating liver and worsens ascites.",
          "A long-standing drain in ascites becomes infected.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Encephalopathy watch", description: "Monitor for the signs of hepatic encephalopathy.",
        choices: [
          "Check his orientation and asterixis daily, and correct precipitants such as sepsis, bleeding, and sedatives.",
          "Sedate him with benzodiazepines for confusion.",
          "Put confusion down to the anesthetic and wait.",
        ],
        feedback: [
          "Encephalopathy signals remnant failure; treating the triggers helps.",
          "Benzodiazepines worsen hepatic encephalopathy and suppress breathing.",
          "New confusion can be liver failure or sepsis and needs assessment.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Nutrition support", description: "Start the liver-supportive nutrition.",
        choices: [
          "Start oral or enteral feeding on day 1 with adequate protein.",
          "Restrict protein to prevent encephalopathy.",
          "Keep him nil by mouth until the liver tests normalize.",
        ],
        feedback: [
          "Early feeding with protein supports regeneration.",
          "Protein restriction causes muscle loss and does not prevent encephalopathy.",
          "Starvation slows regeneration and raises infection.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Pain control", description: "Plan the analgesia for the incision.",
        choices: [
          "Use an epidural or wound catheters with paracetamol at a reduced dose.",
          "Give regular full-dose NSAIDs.",
          "Use a morphine infusion without monitoring.",
        ],
        feedback: [
          "Regional analgesia avoids drugs the remnant cannot clear.",
          "NSAIDs risk kidney injury and bleeding.",
          "A regenerating liver clears morphine slowly, and it accumulates and depresses breathing.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.",
        choices: [
          "Sit him out on day 1 and walk on day 2 with LMWH once the INR allows.",
          "Keep him in bed until the drain is out.",
          "Withhold LMWH for the whole stay because of the liver surgery.",
        ],
        feedback: [
          "Early mobilization prevents pneumonia and clots; LMWH is started once the INR allows.",
          "Bed rest after a large incision leads to atelectasis and pneumonia.",
          "Liver resection patients are hypercoagulable despite a raised INR.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the imaging.",
        choices: [
          "Review at 2 weeks with the pathology and liver tests, and discuss adjuvant treatment.",
          "Review at 3 months with a CT.",
          "Discharge to the GP for the liver tests.",
        ],
        feedback: [
          "Early review checks the liver function and sets the oncology plan.",
          "A late review misses a collection or early liver dysfunction.",
          "The surgical team must interpret the pathology and remnant function.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Surveillance plan", description: "Define the imaging surveillance for recurrence.",
        choices: [
          "Arrange CT and tumor markers every 3 to 6 months for 2 years, then less often.",
          "Stop surveillance after the first clear scan.",
          "Use ultrasound alone every year.",
        ],
        feedback: [
          "Liver recurrence is often resectable when found early.",
          "Most recurrences appear in the first 2 years.",
          "Yearly ultrasound misses small recurrences.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the diet, and the warning signs.",
        choices: [
          "Teach wound care and to return for jaundice, fever, abdominal swelling, or confusion.",
          "Advise return only for wound problems.",
          "Allow alcohol in moderation from discharge.",
        ],
        feedback: [
          "Red flags cover bile leak, liver failure, and infection.",
          "Jaundice, swelling, and confusion can be liver failure or a bile leak.",
          "Alcohol stresses a regenerating remnant.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Return to activity", description: "Define the lifting and activity restrictions.",
        choices: [
          "Advise no heavy lifting for 6 weeks and a gradual return to work.",
          "Allow heavy lifting from 2 weeks.",
          "Advise bed rest for 2 weeks at home.",
        ],
        feedback: [
          "The fascia needs about 6 weeks before heavy loading.",
          "Early heavy lifting risks wound dehiscence and hernia.",
          "Bed rest at home raises clot risk.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
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
          "Discharge to the GP and ask them to chase the pathology result.",
        ],
        feedback: [
          "Nutrition and oncology follow-up are arranged.",
          "Prolonged fasting delays recovery.",
          "Adjuvant decisions and recurrence surveillance need the thoracic and oncology teams, not a GP chasing results.",
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
      detail: "42-year-old, L5 radiculopathy from an L4-L5 disc herniation",
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
          "The incision is often a level off — decompressing the wrong level leaves the L5 root compressed.",
          "Palpation miscounts often; exploring a second level doubles the dissection and the epidural bleeding.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
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
          "Removing the facet destabilizes the segment, and the root is exposed to traction as it shifts.",
          "Blind punching tears the epidural veins lying under the flavum.",
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
          "Working around an unretracted root, instruments tear the epidural veins on its shoulder.",
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
          "Cautery on the dura burns a hole — the CSF leak that follows opens a path for meningitis.",
          "Bone wax in the epidural space compresses the sac.",
        ],
        wrongComps: ["infection", "nerve_injury"],
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
          "Curetting through the anterior annulus can lacerate the iliac vessels just in front of the disc.",
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
          "Extra curettage of a decompressed disc raises the risk of discitis without helping the root.",
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
          "A missed dural tear leaks CSF toward the skin, which opens a path for meningitis.",
          "By the time a headache appears, a pseudomeningocele is pressing on the roots and needs a second operation.",
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
      {
        kind: "postop", title: "Watch for a CSF leak", description: "Day 1: headache when sitting up, gone when lying flat.",
        choices: [
          "Examine the wound for clear fluid, keep her flat for a short period, and involve the surgeon about a repair.",
          "Put it down to anesthetic and discharge her.",
          "Start IV antibiotics as routine for the headache.",
        ],
        feedback: [
          "A positional headache means a CSF leak until proved otherwise — it needs a surgical opinion.",
          "A leak that tracks to the skin opens the way for meningitis.",
          "Antibiotics don't seal a leak; they only delay the diagnosis and risk a drug reaction.",
        ],
        wrongComps: ["infection", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Leg pain expectation", description: "The leg pain has gone, but she has tingling in the L5 area.",
        choices: [
          "Explain that numbness can take weeks to settle, and document the exam to compare with later.",
          "Tell her all symptoms should vanish by tomorrow.",
          "Order an urgent MRI for the tingling alone.",
        ],
        feedback: [
          "Setting expectations and documenting a baseline lets a new deficit be spotted.",
          "False reassurance means a genuinely new weakness is dismissed as expected.",
          "Early MRI after surgery is hard to read and adds nothing for stable residual numbness — the contrast also carries a reaction risk.",
        ],
        wrongComps: ["nerve_injury", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Wound care", description: "A small dressing over a 3 cm incision.",
        choices: [
          "Keep the dressing dry for 48 hours, then inspect; report redness, discharge, or fever.",
          "Soak the wound in a bath from day 1.",
          "Leave the dressing untouched for 3 weeks.",
        ],
        feedback: [
          "Simple wound care and warning signs cover the main infection risk.",
          "Soaking a fresh wound softens it and lets bacteria in.",
          "A dressing left for weeks hides a developing hematoma.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Pain control", description: "Back pain 5/10 on day 0.",
        choices: [
          "Regular paracetamol and an NSAID, with short-course oral opioid for breakthrough pain.",
          "High-dose IV opioid infusion overnight without monitoring.",
          "High-dose IV ketorolac every 6 hours for a week as the main treatment.",
        ],
        feedback: [
          "Multimodal analgesia controls pain with minimal opioid.",
          "An unmonitored opioid infusion depresses breathing.",
          "A week of high-dose ketorolac impairs platelets — an epidural hematoma can form over the fresh laminotomy.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Mobilization plan", description: "She is awake and comfortable.",
        choices: [
          "Walk the same day with a physiotherapist and teach log-rolling and safe bending.",
          "Strict bed rest for 3 days to protect the disc.",
          "No restrictions — she can lift and twist as normal today.",
        ],
        feedback: [
          "Early walking with sensible precautions is the standard after microdiscectomy.",
          "Bed rest brings no benefit to the disc and raises the DVT risk.",
          "Early heavy loading can re-herniate the disc onto the root.",
        ],
        wrongComps: ["thrombosis", "nerve_injury"],
      },
      {
        kind: "postop", title: "Return to work", description: "She works as a warehouse picker.",
        choices: [
          "Graded return — light duties at 2–4 weeks, full lifting around 6–8 weeks with a physio plan.",
          "Return to full heavy lifting next week.",
          "Stay off all work for 6 months.",
        ],
        feedback: [
          "A graded return matches the healing of the annulus.",
          "Heavy lifting before the annulus heals is the classic trigger for re-herniation.",
          "Prolonged inactivity slows recovery and raises the risk of a clot.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the review.",
        choices: [
          "Review at about 6 weeks to check the wound, the leg symptoms, and the return-to-work plan.",
          "No review needed if she feels better.",
          "Review at 6 months only.",
        ],
        feedback: [
          "A 6-week review catches residual deficits and guides rehab.",
          "Without a review, a slow wound infection or new weakness is missed.",
          "By 6 months a deficit that could have been addressed has become permanent.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Recurrence and red flags", description: "She asks what should make her come back.",
        choices: [
          "Explain that new leg weakness, saddle numbness, or bladder changes need emergency review.",
          "Tell her some bladder change is normal after back surgery.",
          "Tell her to wait for clinic if the leg pain returns with weakness.",
        ],
        feedback: [
          "Cauda equina symptoms need an emergency MRI and decompression.",
          "Bladder change can mean an epidural hematoma or a large recurrence compressing the cauda equina.",
          "Waiting weeks with new weakness risks permanent root damage.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "She is going home the same evening.",
        choices: [
          "Give written advice on the wound, walking, lifting limits, analgesia, and red flags.",
          "Discharge with verbal advice only while she is still drowsy.",
          "Give her the full opioid supply for a month.",
        ],
        feedback: [
          "Clear written advice makes a safe same-day discharge.",
          "Instructions given to a drowsy patient are forgotten — wound warning signs go unnoticed.",
          "A large opioid supply risks accidental overdose and respiratory depression.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Posture and body mechanics", description: "Physio session before discharge.",
        choices: [
          "Teach a hip hinge with a neutral spine, carrying loads close to the body.",
          "Teach toe-touch stretches to regain flexibility early.",
          "Tell her to avoid all movement until review.",
        ],
        feedback: [
          "Neutral-spine mechanics protect the healing annulus.",
          "Repeated loaded flexion stresses the annular defect and re-herniates the disc.",
          "Immobility slows recovery and raises the clot risk.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Long-term back health", description: "She wants to prevent a recurrence.",
        choices: [
          "Recommend a core-strengthening program, weight control, and smoking cessation.",
          "Recommend a lumbar brace for daily wear indefinitely.",
          "Recommend long-term opioid use to manage flare-ups.",
        ],
        feedback: [
          "Core strength, weight, and not smoking all lower the recurrence risk.",
          "Long-term bracing weakens the core muscles, and the weak spine re-herniates onto the root.",
          "Long-term opioids risk dependence and respiratory depression.",
        ],
        wrongComps: ["nerve_injury", "hypoxia"],
      },
      {
        kind: "postop", title: "Monitor the neurology", description: "Watch for new symptoms.",
        choices: [
          "Assess leg strength and sensation after surgery.",
          "Check the neuro exam only at the clinic visit.",
          "Trust the intraoperative result and skip the exam.",
        ],
        feedback: [
          "Early neurologic assessment catches a new deficit.",
          "A new root deficit left until clinic may no longer be reversible.",
          "An epidural hematoma compressing the cauda equina is found only by examining the legs.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Manage the wound and the headache", description: "Watch for infection and CSF leak symptoms.",
        choices: [
          "Inspect the wound and ask about positional headaches that suggest a CSF leak.",
          "Discharge without a wound check.",
          "Treat any headache with a week of strict bed rest.",
        ],
        feedback: [
          "Wound and CSF leak signs are monitored.",
          "No check misses an early infection.",
          "A positional headache needs assessment for a CSF leak, not a week in bed — and bed rest invites a DVT.",
        ],
        wrongComps: ["infection", "thrombosis"],
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
          "Heavy lifting in the first weeks re-herniates the disc onto the root.",
        ],
        wrongComps: ["thrombosis", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the clinic plan.",
        choices: [
          "Arrange follow-up to review recovery and return-to-work plans.",
          "Tell the patient to return only if the leg pain comes back.",
          "Discharge with two weeks of regular opioid as the only analgesic.",
        ],
        feedback: [
          "Structured follow-up tracks recovery.",
          "Return-if-worse misses wound problems, new deficits, and a structured return to work.",
          "Round-the-clock opioid alone at home risks sedation and respiratory depression.",
        ],
        wrongComps: ["infection", "hypoxia"],
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
      risks: ["cardiac_arrhythmia", "hemorrhage", "hypoxia", "thrombosis", "infection", "nerve_injury", "anaphylaxis", "fluid_overload"],
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
          "Harvest the LIMA skeletonized on a high cautery setting to speed it up.",
          "Skip the LIMA and use vein grafts only.",
        ],
        feedback: [
          "The LIMA pedicle is harvested with intact flow.",
          "High-power cautery along the pedicle burns the artery and the phrenic nerve.",
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
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
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
          "Graft the first large branch in the field without matching it to the angiogram.",
          "Make the anastomosis as large as possible.",
        ],
        feedback: [
          "The anastomosis is correct and functional.",
          "An unconfirmed target can be the wrong branch, leaving the diseased vessel ungrafted.",
          "An oversized anastomosis steals flow.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "vitals", title: "Respond to ischemia", description: "The ST segment is changing during the anastomosis.",
        choices: [
          "Pause, communicate with anesthesia, and support the hemodynamics while completing the anastomosis.",
          "Finish the anastomosis quickly, since the ST changes usually settle once flow is restored.",
          "Remove the stabilizer and abandon the graft.",
        ],
        feedback: [
          "Ischemia is managed while the graft is completed.",
          "Unsupported ischemia during the anastomosis can progress to arrhythmia and infarction before flow returns.",
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
      {
        kind: "verify", title: "Confirm the hemostasis with protamine", description: "Reverse the heparin and confirm the field stays dry.",
        choices: [
          "Give protamine slowly, recheck the ACT against baseline, then inspect every anastomosis and the LIMA bed.",
          "Leave the heparin unreversed, since off-pump grafts stay open better while he is anticoagulated.",
          "Push the full protamine dose as a rapid bolus so the heparin is reversed before closing.",
        ],
        feedback: [
          "Slow protamine with an ACT check reverses the heparin without a reaction, and every site is inspected dry.",
          "Unreversed heparin keeps the field bleeding; graft patency comes from antiplatelet therapy, not from leaving the heparin on.",
          "Rapid protamine causes profound hypotension and pulmonary hypertension.",
        ],
        wrongComps: ["hemorrhage", "anaphylaxis"],
      },
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
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "bleed", title: "Control a graft bed bleeder", description: "The harvest site is bleeding.", f: { vessel: "the harvest site vessels", wrongVessels: ["the femoral artery", "the aorta"] } },
      {
        kind: "verify", title: "Confirm the rhythm", description: "Check the rhythm is stable before closure.",
        choices: [
          "Confirm the rhythm, place temporary epicardial pacing wires, and test capture before closing.",
          "Close without pacing wires, since he is in sinus rhythm at the moment.",
          "Place the pacing wires through the fresh vein-graft hood, where capture is most reliable.",
        ],
        feedback: [
          "Epicardial wires give immediate pacing if heart block or bradycardia develops after surgery.",
          "Heart block after coronary surgery is common and unpredictable; without wires it needs emergency transvenous pacing.",
          "A wire through a fresh graft anastomosis tears it, and it bleeds when the wire is pulled.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      { kind: "closure", title: "Close the sternum", description: "Wire the sternum and close the layers.", f: { structure: "the sternum and the soft tissues" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Cardiac surgery carries a high thrombosis risk." },
      {
        kind: "postop", title: "Watch for low cardiac output", description: "Monitor the hemodynamics after the surgery.",
        choices: [
          "Track the cardiac index, filling pressures, lactate, and urine output hourly, and get an echo if the index falls.",
          "Treat any low blood pressure with a fluid bolus first, whatever the filling pressures show.",
          "Rely on the blood pressure, since a normal pressure means the output is adequate.",
        ],
        feedback: [
          "Low output after grafting can hide behind a normal pressure; the index, lactate, and echo find tamponade or pump failure early.",
          "High filling pressures with low output mean a failing ventricle or tamponade; more fluid makes it worse.",
          "Vasoconstriction keeps the pressure normal while the output falls.",
        ],
        wrongComps: ["fluid_overload", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Manage atrial fibrillation", description: "Treat new postoperative atrial fibrillation.",
        choices: [
          "Correct potassium and magnesium, control the rate with a beta-blocker or amiodarone, and anticoagulate if it persists beyond 48 hours.",
          "Cardiovert with a synchronized shock straight away, although he is hemodynamically stable.",
          "Leave the atrial fibrillation untreated, since it resolves by itself in most patients after heart surgery.",
        ],
        feedback: [
          "Electrolytes and rate control treat most postoperative AF; persistent AF needs anticoagulation for stroke risk.",
          "Stable postoperative AF usually recurs straight after a shock; cardioversion is for the unstable patient.",
          "Most does resolve, but fast AF drops the output and persistent AF carries a stroke risk.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "postop", title: "Pulmonary hygiene", description: "Plan the breathing exercises.",
        choices: [
          "Extubate once he is awake, warm, and not bleeding, then start incentive spirometry and early mobilization.",
          "Keep him ventilated overnight as routine so the lungs can rest after surgery.",
          "Extubate on the table as soon as the chest is closed, before he rewarms.",
        ],
        feedback: [
          "Early extubation of a stable, warm patient plus spirometry reduces pneumonia and atelectasis.",
          "Routine overnight ventilation raises the risk of ventilator pneumonia with no benefit in a stable patient.",
          "A cold patient shivers, raising oxygen demand, and may still be bleeding; extubate when warm and dry.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Renal protection", description: "Monitor the renal function.",
        choices: [
          "Keep the mean arterial pressure above 65, avoid nephrotoxins, and track urine output and creatinine daily.",
          "Give furosemide whenever the urine output drops below 0.5 mL/kg/h.",
          "Order a contrast CT on day 1 to check the grafts.",
        ],
        feedback: [
          "Perfusion pressure and avoiding nephrotoxins protect kidneys stressed by surgery.",
          "Diuretics raise the urine number without protecting the kidney, and the potassium they waste triggers arrhythmias after cardiac surgery.",
          "Early contrast adds a nephrotoxic load to a stressed kidney, and contrast can trigger a reaction.",
        ],
        wrongComps: ["cardiac_arrhythmia", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Sternal precautions", description: "Teach the sternal precautions.",
        choices: [
          "Teach sternal precautions: no lifting over about 5 kg and no pushing up with the arms for 6 to 8 weeks, and hug a pillow when coughing.",
          "Tell him to hold back his cough so the sternal wires are not stressed.",
          "Allow full upper-body activity once the skin has healed at 2 weeks.",
        ],
        feedback: [
          "Limiting the load while the sternum unites prevents dehiscence and mediastinitis.",
          "Holding back the cough leaves secretions in the lungs; splinting protects the sternum and still clears them.",
          "The sternum takes 6 to 8 weeks to unite; early loading risks dehiscence and mediastinitis.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Graft surveillance", description: "Define the graft surveillance plan.",
        choices: [
          "Start aspirin within 6 hours of surgery and investigate any new ischemia with an ECG, troponin, and angiography.",
          "Hold aspirin for a week to let the anastomoses settle.",
          "Arrange routine CT angiography of every graft at one week.",
        ],
        feedback: [
          "Early aspirin keeps vein grafts open; new ischemia after off-pump grafting needs prompt imaging.",
          "Delaying aspirin raises early graft occlusion.",
          "Routine early CT angiography adds a contrast load to recovering kidneys without changing management.",
        ],
        wrongComps: ["thrombosis", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the cardiology follow-up.",
        choices: [
          "Review at 4 to 6 weeks with a wound check, an ECG, and the secondary-prevention medications, then cardiac rehab.",
          "Stop the beta-blocker at the clinic visit if he is in sinus rhythm.",
          "Stop the statin once the chest pain has gone.",
        ],
        feedback: [
          "Structured review and secondary prevention protect the grafts and native vessels.",
          "Beta-blockers after CABG reduce atrial fibrillation and ischemia; stopping early brings them back.",
          "Statins slow graft disease; symptom relief does not mean the disease has stopped.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the sternal precautions, and the warning signs.",
        choices: [
          "Teach the sternal precautions and medications, and to return for chest pain, breathlessness, fever, or wound discharge.",
          "Advise return only for chest pain.",
          "Allow driving in the first week if he feels well.",
        ],
        feedback: [
          "Red flags cover graft occlusion, effusion, and sternal infection.",
          "Fever or wound discharge can be mediastinitis, which needs early treatment.",
          "Braking and steering load the healing sternum, and a crash would split it; most units advise about 4 weeks.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
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
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Plan cardiac rehabilitation", description: "Define the recovery pathway.",
        choices: [
          "Refer for cardiac rehabilitation and arrange cardiology follow-up.",
          "Discharge home with a walking leaflet and let the GP decide on rehabilitation later.",
          "Restrict all exertion indefinitely.",
        ],
        feedback: [
          "Cardiac rehabilitation improves outcomes.",
          "Formal cardiac rehab cuts mortality and readmission; a leaflet and a deferred GP decision usually means it never happens.",
          "Indefinite restriction is harmful.",
        ],
        wrongComps: ["thrombosis", "infection"],
      }
    ],
  },
];
