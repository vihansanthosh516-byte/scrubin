// ─────────────────────────────────────────────────────────────────────────────
// Advanced surgery step banks (1 of 2) — 36-40 science-based steps each.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProcedureBank } from "./stepBuilder";

export const ADVANCED_BANKS_1: ProcedureBank[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // CABG
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "cabg",
    spec: {
      approach: "a median sternotomy with cardiopulmonary bypass",
      wrongApproaches: ["a thoracotomy as routine", "a subcostal approach"],
      landmark: "the left anterior descending (LAD) artery and the aorta",
      wrongLandmarks: ["the circumflex artery", "the pulmonary artery"],
      vessel: "the LIMA and the coronary targets",
      wrongVessels: ["the internal jugular vein", "the pulmonary veins"],
      nerve: "the left phrenic nerve",
      wrongNerves: ["the vagus nerve", "the recurrent laryngeal nerve"],
      structure: "the heart, aorta, and the bypass grafts",
      wrongStructures: ["the lungs", "the esophagus"],
      test: "graft flow measurement and a check of the anastomoses",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["cardiac_arrhythmia", "hemorrhage", "hypoxia", "thrombosis", "infection", "nerve_injury", "anaphylaxis", "fluid_overload"],
      instrument: "a sternal saw and a cardioplegia cannula",
      position: "supine with arms tucked",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "64-year-old, multi-vessel CAD, hypertensive and diabetic, lethargic",
    },
    steps: [
      { kind: "preop", title: "Confirm the graft plan", description: "Review the angiogram and plan the conduits and targets." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Implant and bypass demand timely prophylaxis." },
      { kind: "position", title: "Position the patient", description: "Supine with arms tucked and defibrillator pads placed.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Perform the median sternotomy", description: "Open the chest.", f: { wrongApproaches: ["a thoracotomy as routine", "a subcostal approach"] } },
      {
        kind: "exposure", title: "Open the pericardium", description: "Create a pericardial well and identify the heart.",
        choices: [
          "Open the pericardium over the aorta and right atrium and create a pericardial well with stay sutures.",
          "Open the pericardium directly over the left ventricular surface to reach the heart fastest.",
          "Incise the pericardium and skip the stay sutures to keep the field uncluttered.",
        ],
        feedback: [
          "Opening over the aorta and building the well gives a stable cradle for the heart and the grafts.",
          "The ventricular surface is the most irritable part of the heart — opening over it risks arrhythmia.",
          "Without stay sutures the well collapses and the heart can rotate — build the cradle properly.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "core", title: "Harvest the LIMA", description: "Take down the left internal mammary artery.",
        choices: [
          "Harvest the LIMA as a pedicle, protecting the phrenic nerve and confirming flow.",
          "Harvest the LIMA skeletonized on a high cautery setting to speed it up.",
          "Use the LIMA only if the radial artery is unavailable.",
        ],
        feedback: [
          "The LIMA pedicle is harvested with intact flow.",
          "Wide cautery can burn the pedicle or the phrenic nerve.",
          "The LIMA is the preferred conduit for the LAD when available.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "nerve", title: "Protect the left phrenic nerve", description: "The phrenic nerve runs beside the LIMA.", f: { nerve: "the left phrenic nerve", wrongNerves: ["the vagus nerve", "the hypoglossal nerve"] } },
      {
        kind: "vessel", title: "Prepare the saphenous vein graft", description: "Harvest a vein conduit if planned.",
        choices: [
          "Harvest the great saphenous vein with gentle handling and distend it at low pressure.",
          "Strip the vein aggressively to speed the harvest.",
          "Distend the vein at high pressure to test for leaks.",
        ],
        feedback: [
          "The vein is handled gently and distended at physiologic pressure.",
          "Stripping damages the endothelium.",
          "High-pressure distension injures the endothelium and invites graft failure.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "core", title: "Heparinize for bypass", description: "Anticoagulate before the cannulas go in.",
        choices: [
          "Give heparin 300 to 400 units/kg through a central line and confirm an ACT above 400 seconds before cannulating.",
          "Give a standard 5,000-unit heparin bolus, as for a vascular clamp, and start cannulating.",
          "Cannulate first and give the heparin once bypass is running, to limit bleeding from the cannulation sites.",
        ],
        feedback: [
          "Full heparinization with a confirmed ACT prevents clotting in the bypass circuit.",
          "A vascular dose is far too low for bypass; the oxygenator clots and oxygenation fails.",
          "Blood contacting the circuit before heparin clots in it, with catastrophic embolism.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "core", title: "Cannulate for bypass", description: "Set up cardiopulmonary bypass.",
        choices: [
          "Cannulate the aorta and right atrium, confirming position before going on bypass.",
          "Cannulate the aorta without confirming the arterial line pressure.",
          "Cannulate the pulmonary artery for the arterial line.",
        ],
        feedback: [
          "The cannulas are placed and confirmed before bypass.",
          "An unconfirmed aortic cannula risks dissection.",
          "Cannulating the pulmonary artery is a critical error.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Go on cardiopulmonary bypass", description: "Transition to full bypass support.",
        choices: [
          "Go on bypass gradually, confirming venous drainage and perfusion pressures.",
          "Go on bypass at full flow immediately.",
          "Start bypass only after the distal anastomoses are done.",
        ],
        feedback: [
          "The transition to bypass is controlled and confirmed.",
          "Abrupt full-flow initiation can cause hypotension and arrhythmia.",
          "Distal anastomoses require bypass support first.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "core", title: "Arrest the heart", description: "Deliver cardioplegia.",
        choices: [
          "Cross-clamp the aorta and deliver antegrade cardioplegia until the heart arrests.",
          "Cross-clamp and wait for the heart to arrest on its own.",
          "Deliver cardioplegia without cross-clamping.",
        ],
        feedback: [
          "The heart arrests with cardioplegia under the cross-clamp.",
          "Waiting for spontaneous arrest causes ischemic injury.",
          "Cardioplegia without a clamp does not protect the heart.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "core", title: "Perform the distal anastomoses", description: "Graft the coronary targets.",
        choices: [
          "Expose each target and construct the anastomosis to the LAD and other targets as planned.",
          "Graft the targets without confirming the correct artery.",
          "Anastomose the grafts to the nearest visible vessel.",
        ],
        feedback: [
          "The planned targets are grafted correctly.",
          "Grafting the wrong vessel leaves the disease untreated.",
          "Anastomosing to any vessel risks a non-functional graft.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "bleed", title: "Control an anastomotic bleeder", description: "A distal anastomosis is bleeding.",
        choices: [
          "Apply gentle pressure and place a precise additional suture at the bleeding point.",
          "Cauterize the anastomosis to stop the bleeding.",
          "Add a large pledgeted suture across the anastomosis.",
        ],
        feedback: [
          "The bleeding point is controlled precisely.",
          "Cautery on a graft anastomosis destroys the graft.",
          "A large suture can narrow or occlude the anastomosis.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "core", title: "Perform the proximal anastomoses", description: "Connect the vein grafts to the aorta.",
        choices: [
          "Clamp the aorta partially and sew each proximal anastomosis with the correct orientation.",
          "Sew the proximals to the main pulmonary artery.",
          "Connect the vein grafts directly to the aortic cannula site.",
        ],
        feedback: [
          "The proximal anastomoses are constructed correctly.",
          "Grafting to the pulmonary artery is a fatal error.",
          "Using the cannulation site compromises the repair.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check the grafts", description: "Confirm flow through the grafts.",
        choices: [
          "Use graft flow measurement to confirm each graft is patent with good flow.",
          "Trust the visual inspection of the grafts.",
          "Measure flow only in the LIMA graft.",
        ],
        feedback: [
          "Graft flows are confirmed.",
          "Visual inspection can miss a kinked or thrombosed graft.",
          "Checking only the LIMA misses a failing vein graft.",
        ],
        wrongComps: ["thrombosis", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Wean from bypass", description: "Return the heart to full support.",
        choices: [
          "Rewarm, defibrillate if needed, and wean bypass gradually while confirming hemodynamics.",
          "Wean bypass immediately after the last stitch.",
          "Continue bypass until the patient is in the ICU.",
        ],
        feedback: [
          "The heart takes over support smoothly.",
          "Abrupt weaning causes hemodynamic collapse.",
          "Prolonged bypass increases bleeding and organ injury.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      { kind: "vitals", title: "Manage post-bypass hypotension", description: "The pressure is falling after weaning.", f: { structure: "the hemodynamics", landmark: "the filling pressures and contractility" } },
      {
        kind: "vessel", title: "Control sternal bleeding", description: "The sternal edges are oozing.",
        choices: [
          "Apply bone wax and cautery to the bleeding points before closure.",
          "Close the sternum over the oozing edges.",
          "Pack the mediastinum and close the skin.",
        ],
        feedback: [
          "The sternal bleeding is controlled before closure.",
          "Closing over the bleed invites a tamponade.",
          "Packing and closing leaves the bleeding in the chest.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "verify", title: "Check for tamponade physiology", description: "Confirm the heart is not compressed.",
        choices: [
          "Check the filling pressures and output after the chest is closed.",
          "Trust the pump run and close.",
          "Only check pressures if the patient arrests.",
        ],
        feedback: [
          "Tamponade is ruled out before leaving the OR.",
          "Skipping the check risks a postoperative tamponade.",
          "Waiting for arrest delays a life-saving reopening.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "verify", title: "Confirm the hemostasis with protamine", description: "Reverse the heparin and confirm the field stays dry.",
        choices: [
          "Give protamine slowly over 10 minutes, recheck the ACT against baseline, then inspect every anastomosis and cannulation site.",
          "Leave the heparin unreversed and transfuse platelets if the field keeps oozing.",
          "Push the full protamine dose as a rapid bolus so the heparin is reversed before closing.",
        ],
        feedback: [
          "Slow protamine with an ACT check reverses the heparin without a protamine reaction, and every site is inspected dry.",
          "Unreversed heparin keeps him anticoagulated; platelets cannot correct a heparin effect.",
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
      { kind: "bleed", title: "Control a graft bed bleeder", description: "The vein harvest site is bleeding.", f: { vessel: "the harvest site vessels", wrongVessels: ["the femoral artery", "the aorta"] } },
      {
        kind: "verify", title: "Confirm the rhythm", description: "Check the rhythm is stable before closure.",
        choices: [
          "Confirm the rhythm, place temporary epicardial pacing wires, and test capture before closing.",
          "Close without pacing wires, since he is in sinus rhythm at the moment.",
          "Place the pacing wires through the fresh vein-graft hood, where capture is most reliable.",
        ],
        feedback: [
          "Epicardial wires give immediate pacing if heart block or bradycardia develops after bypass.",
          "Heart block after bypass is common and unpredictable; without wires it needs emergency transvenous pacing.",
          "A wire through a fresh graft anastomosis tears it, and it bleeds when the wire is pulled.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      { kind: "closure", title: "Close the sternum", description: "Wire the sternum and close the layers.", f: { structure: "the sternum and the soft tissues" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Cardiac surgery carries a high thrombosis risk." },
      {
        kind: "postop", title: "Watch for low cardiac output", description: "Monitor the hemodynamics for low output.",
        choices: [
          "Track the cardiac index, filling pressures, lactate, and urine output hourly, and get an echo if the index falls.",
          "Treat any low blood pressure with a fluid bolus first, whatever the filling pressures show.",
          "Rely on the blood pressure, since a normal pressure means the output is adequate.",
        ],
        feedback: [
          "Low output after bypass can hide behind a normal pressure; the index, lactate, and echo find tamponade or pump failure early.",
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
          "Leave the atrial fibrillation untreated, since it resolves by itself in most patients after bypass.",
        ],
        feedback: [
          "Electrolytes and rate control treat most post-bypass AF; persistent AF needs anticoagulation for stroke risk.",
          "Stable AF after bypass usually recurs straight after a shock; cardioversion is for the unstable patient.",
          "Most does resolve, but fast AF drops the output and persistent AF carries a stroke risk.",
        ],
        wrongComps: ["cardiac_arrhythmia", "thrombosis"],
      },
      {
        kind: "postop", title: "Pulmonary hygiene", description: "Plan the breathing exercises and the extubation.",
        choices: [
          "Extubate once he is awake, warm, and not bleeding, then start incentive spirometry and early mobilization.",
          "Keep him ventilated overnight as routine so the lungs can rest after bypass.",
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
        kind: "postop", title: "Renal protection", description: "Monitor the renal function after the bypass.",
        choices: [
          "Keep the mean arterial pressure above 65, avoid nephrotoxins, and track urine output and creatinine daily.",
          "Give furosemide whenever the urine output drops below 0.5 mL/kg/h.",
          "Order a contrast CT on day 1 to check the grafts.",
        ],
        feedback: [
          "Perfusion pressure and avoiding nephrotoxins protect kidneys stressed by bypass.",
          "Diuretics raise the urine number without protecting the kidney, and the potassium they waste triggers arrhythmias after bypass.",
          "Early contrast adds a nephrotoxic load to a kidney stressed by bypass, and contrast can trigger a reaction.",
        ],
        wrongComps: ["cardiac_arrhythmia", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Sternal precautions", description: "Teach the sternal precautions for healing.",
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
        kind: "postop", title: "Discharge and follow-up", description: "Plan the discharge and the cardiology follow-up.",
        choices: [
          "Discharge on a high-intensity statin and a beta-blocker, with a wound check and a cardiology review at 4 to 6 weeks.",
          "Stop the statin at discharge, since the diseased segments are now bypassed.",
          "Arrange a cardiology review only if the chest pain comes back.",
        ],
        feedback: [
          "Statins slow disease in the grafts and native vessels; every CABG patient needs secondary prevention and review.",
          "Vein grafts develop atherosclerosis quickly without a statin, and they occlude.",
          "A routine review catches arrhythmias, heart failure, and graft problems before they cause symptoms.",
        ],
        wrongComps: ["thrombosis", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Plan ICU monitoring", description: "Define the postoperative surveillance.",
        choices: [
          "Monitor rhythm, hemodynamics, graft flow, and chest tube output in the ICU.",
          "Transfer to the ward once extubated.",
          "Monitor only the rhythm.",
        ],
        feedback: [
          "ICU monitoring catches graft failure and bleeding early.",
          "Direct ward transfer is unsafe after CABG.",
          "Rhythm-only monitoring misses tamponade and hypoperfusion.",
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
          "Early removal risks undrained blood and tamponade.",
          "Prolonged drainage invites infection.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Anti-platelet therapy", description: "Protect the grafts.",
        choices: [
          "Start aspirin early and plan clopidogrel if indicated by the pathology.",
          "Start anticoagulation immediately in full dose.",
          "Avoid all antiplatelet therapy to prevent bleeding.",
        ],
        feedback: [
          "Aspirin protects the grafts.",
          "Full anticoagulation risks tamponade without benefit.",
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
          "Indefinite restriction is unnecessary and harmful.",
        ],
        wrongComps: ["thrombosis", "infection"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CRANIOTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "craniotomy",
    spec: {
      approach: "a right frontal craniotomy for the frontal mass",
      wrongApproaches: ["a bicoronal flap across both frontal lobes", "a single burr hole over the tumor"],
      landmark: "the superior sagittal sinus and the central sulcus",
      wrongLandmarks: ["the transverse sinus", "the sylvian fissure alone"],
      vessel: "the middle meningeal artery and the cortical veins",
      wrongVessels: ["the internal carotid artery", "the vertebral artery"],
      nerve: "the motor cortex and its eloquent boundaries",
      wrongNerves: ["the trigeminal nerve", "the facial nerve"],
      structure: "the frontal lobe tumor and the surrounding cortex",
      wrongStructures: ["the cerebellum", "the brainstem"],
      test: "intraoperative navigation and a check of the resection cavity",
      wrongTests: ["an on-table MRI as routine", "a lumbar puncture"],
      risks: ["hemorrhage", "hypoxia", "nerve_injury", "cardiac_arrhythmia", "infection", "thrombosis"],
      instrument: "a craniotome and an ultrasonic aspirator",
      position: "supine with the head fixed and rotated",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "41-year-old, headache, left-sided weakness, 4 cm right frontal mass",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the MRI, the navigation, and the eloquent-area plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Bone and implant work demands timely prophylaxis." },
      { kind: "position", title: "Position and fix the head", description: "Supine with the head rotated and pinned.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Plan the skin incision", description: "Plan the incision for the frontal craniotomy.", f: { wrongApproaches: ["a bicoronal flap across both frontal lobes", "a single burr hole over the tumor"] } },
      { kind: "exposure", title: "Raise the scalp flap", description: "Reflect the scalp and pericranium.", f: { structure: "the scalp and pericranium", landmark: "the superior temporal line" } },
      {
        kind: "vessel", title: "Control scalp bleeding", description: "The scalp bleeds vigorously.",
        choices: [
          "Use Raney clips and cautery on the galeal edge to control the scalp vessels.",
          "Cauterize the full-thickness scalp edge.",
          "Close the incision briefly to tamponade the scalp.",
        ],
        feedback: [
          "Scalp hemostasis is achieved with clips and targeted cautery.",
          "Full-thickness cautery burns the hair follicles and skin.",
          "Closing to tamponade is ineffective and prolongs the case.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "core", title: "Perform the craniotomy", description: "Open the bone flap.",
        choices: [
          "Drill burr holes and cut the bone flap with the craniotome, preserving the dura.",
          "Crack the bone open with an osteotome across the sinus.",
          "Cut the bone flap flush with the sagittal sinus.",
        ],
        feedback: [
          "The bone flap is cut cleanly with the dura intact.",
          "Cracking the bone risks dural and sinus tears.",
          "Cutting over the sagittal sinus risks massive bleeding.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "nerve", title: "Protect the superior sagittal sinus", description: "The sinus sits at the midline edge of the flap.",
        choices: [
          "Keep the craniotomy and dural opening clear of the sinus midline.",
          "Open the dura across the sinus for wider access.",
          "Cauterize the sinus wall if it oozes.",
        ],
        feedback: [
          "The sinus is protected.",
          "Opening across the sinus risks fatal hemorrhage.",
          "Cauterizing the sinus wall can cause sinus thrombosis.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "core", title: "Open the dura", description: "Expose the cortex.",
        choices: [
          "Open the dura in a dural flap, protecting the underlying cortex and veins.",
          "Open the dura with scissors over the tumor directly.",
          "Excise the dura over the tumor to save time.",
        ],
        feedback: [
          "The dura is opened with the cortex protected.",
          "Opening over the tumor risks cortical injury.",
          "Excising dura over the tumor leaves a dural defect.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "landmark", title: "Identify the tumor with navigation", description: "Confirm the tumor boundaries.",
        choices: [
          "Use navigation to confirm the tumor boundaries and the eloquent cortex.",
          "Rely on visual inspection of the cortex.",
          "Resect the abnormal-looking tissue broadly.",
        ],
        feedback: [
          "Navigation guides a complete, safe resection.",
          "Visual inspection alone risks an incomplete or unsafe resection.",
          "Broad resection of abnormal tissue risks eloquent cortex.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Resect the tumor", description: "Remove the tumor with a safe margin.",
        choices: [
          "Resect the tumor with the ultrasonic aspirator, preserving the surrounding cortex and veins.",
          "Cauterize the tumor bulk and remove it rapidly.",
          "Resect the surrounding cortex with the tumor for a wide margin.",
        ],
        feedback: [
          "The tumor is resected with the cortex preserved.",
          "Cauterizing the tumor risks the surrounding eloquent brain.",
          "Resecting the cortex causes a permanent deficit.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "bleed", title: "Control a cortical vein bleeder", description: "A bridging vein is bleeding.",
        choices: [
          "Apply gentle pressure with a hemostatic agent and control the vein precisely.",
          "Cauterize the vein broadly at the cortex.",
          "Pack the cavity and close.",
        ],
        feedback: [
          "The vein is controlled without cortical injury.",
          "Broad cautery at the cortex causes a venous infarction.",
          "Packing over an active bleeder risks a rebleed and herniation.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "vitals", title: "Respond to the ICP rise", description: "The brain is swelling in the field.",
        choices: [
          "Pause, optimize ventilation and anesthesia, and consider mannitol if indicated.",
          "Continue resecting — the swelling will settle.",
          "Remove more bone to decompress the brain.",
        ],
        feedback: [
          "The ICP is managed medically and the field settles.",
          "Continuing against swelling risks herniation.",
          "Removing bone is a rescue measure, not a first response.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check the resection cavity", description: "Confirm a complete, hemostatic resection.",
        choices: [
          "Inspect the cavity with the microscope and navigation for residual tumor and bleeding.",
          "Trust the aspirator and close.",
          "Resect more cortex to ensure clear margins.",
        ],
        feedback: [
          "The cavity is confirmed clean and hemostatic.",
          "Skipping the check risks residual tumor and rebleeding.",
          "Wider cortical resection causes deficits without benefit.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "verify", title: "Confirm the hemostasis under irrigation", description: "Irrigate and confirm the cavity is dry.",
        choices: [
          "Irrigate the cavity with warm saline, ask anesthesia for a Valsalva, and check that the irrigation stays clear.",
          "Pack the cavity with hemostatic agent and close without a test at raised venous pressure.",
          "Close once the cavity looks dry at the current low blood pressure.",
        ],
        feedback: [
          "Clear irrigation under a Valsalva shows venous bleeders that a low pressure hides.",
          "Packed hemostatic agent hides a bleeder and swells, compressing the surrounding brain.",
          "A cavity that is dry at a low pressure can bleed when the pressure normalizes on waking.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "exposure", title: "Check the cortical veins", description: "Re-inspect the draining veins for patency.", f: { structure: "the cortical veins", landmark: "the sagittal sinus" } },
      { kind: "bleed", title: "Control a bone-edge bleeder", description: "The bone edges are oozing.", f: { vessel: "the bone edge vessels", wrongVessels: ["the middle meningeal artery", "the internal carotid artery"] } },
      {
        kind: "verify", title: "Confirm the brain relaxation", description: "Check the brain is not tense before closure.",
        choices: [
          "Check that the brain sits below the bone edge and pulsates, and review the CO2, head position, and osmotherapy before closing the dura.",
          "Close the dura tightly over the swollen brain and let the bone flap hold it in.",
          "Hyperventilate to a PaCO2 of 25 mmHg for the rest of the case to shrink the brain.",
        ],
        feedback: [
          "A relaxed brain lets the dura close without compressing cortex; checking the causes of swelling fixes it.",
          "Closing over a swollen brain raises the intracranial pressure and compresses the cortex.",
          "Deep, prolonged hyperventilation constricts cerebral vessels enough to cause ischemia.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "closure", title: "Close the dura", description: "Watertight dural closure.",
        choices: [
          "Close the dura watertight, using a patch if needed.",
          "Leave the dura open to avoid tension.",
          "Close the dura loosely over the bone flap.",
        ],
        feedback: [
          "A watertight closure prevents CSF leak.",
          "An open dura leaks CSF and invites infection.",
          "A loose closure can herniate the brain.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      { kind: "closure", title: "Replace the bone flap", description: "Fix the bone flap and close the scalp.", f: { structure: "the bone flap and scalp" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Neurosurgical patients are high-risk for thrombosis." },
      {
        kind: "postop", title: "Seizure prophylaxis plan", description: "Define the seizure prophylaxis for the craniotomy.",
        choices: [
          "Continue levetiracetam for about a week, with a plan to stop it if he stays seizure-free.",
          "Load with phenytoin and continue it indefinitely.",
          "Stop all anticonvulsants on the day of surgery to avoid drug interactions.",
        ],
        feedback: [
          "Short levetiracetam prophylaxis covers the highest-risk first week with few interactions.",
          "Phenytoin loading causes arrhythmias and hypotension, and indefinite prophylaxis is not indicated without seizures.",
          "The first week after cortical surgery carries the highest seizure risk.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "postop", title: "Watch for new deficits", description: "Monitor the neurologic exam closely.",
        choices: [
          "Do hourly neurologic observations overnight and get an urgent CT for any drop in GCS or new deficit.",
          "Check the neurology once on the morning round, since he was intact at extubation.",
          "Put any new weakness down to swelling and start steroids without imaging.",
        ],
        feedback: [
          "A postoperative hematoma shows as a falling GCS or a new deficit; early CT and evacuation decide the outcome.",
          "A hematoma can develop within hours; a single morning check finds it too late.",
          "A new deficit can be a hematoma that needs evacuation; treating it as swelling delays the scan.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Fluid management", description: "Manage the fluids to protect the brain.",
        choices: [
          "Keep him euvolemic with isotonic fluid and check the sodium twice daily for SIADH or diabetes insipidus.",
          "Run 5% dextrose as maintenance to avoid a sodium load.",
          "Restrict fluids to 1 liter a day as routine to reduce brain swelling.",
        ],
        feedback: [
          "Isotonic fluid and sodium checks catch SIADH and diabetes insipidus early.",
          "Hypotonic fluid lowers the sodium and worsens cerebral edema.",
          "Routine restriction causes hypovolemia and hypotension, which reduce cerebral perfusion and promote clotting.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Anticonvulsant levels", description: "Monitor the anticonvulsant levels if started.",
        choices: [
          "Check adherence and side effects; levetiracetam needs no routine levels, while phenytoin levels are corrected for albumin.",
          "Increase the dose every day until mild drowsiness appears.",
          "Stop the drug abruptly at discharge.",
        ],
        feedback: [
          "Monitoring matches the drug: levetiracetam is not level-guided, phenytoin is.",
          "Titrating to drowsiness causes toxicity, including phenytoin arrhythmias, and masks neurologic decline.",
          "Abrupt withdrawal provokes seizures.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "postop", title: "Wound care", description: "Define the scalp wound care.",
        choices: [
          "Keep the wound dry for 48 hours, inspect it for swelling or clear fluid, and remove the staples at 7 to 10 days.",
          "Keep a tight head bandage on for two weeks to prevent swelling.",
          "Remove the staples on day 3 once the wound looks sealed.",
        ],
        feedback: [
          "Daily inspection finds a CSF leak or infection early, and scalp staples need 7 to 10 days.",
          "A tight bandage for weeks hides a collecting subgaleal hematoma or a CSF leak.",
          "Early removal risks dehiscence and a CSF leak.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Watch for CSF leak", description: "Monitor the wound for a CSF leak.",
        choices: [
          "Check the wound and nose for clear fluid, test any fluid for beta-2 transferrin, and review early if it is positive.",
          "Treat a clear nasal drip as a cold and review it at the clinic visit.",
          "Place a lumbar drain on the ward before any imaging.",
        ],
        feedback: [
          "Beta-2 transferrin confirms CSF; early repair of a leak prevents meningitis.",
          "An unrecognized CSF leak is a direct route for meningitis.",
          "Draining CSF from below before a scan excludes a hematoma can cause herniation.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Mobilization plan", description: "Define the early mobilization with the deficits.",
        choices: [
          "Nurse him 30 degrees head-up and mobilize from day 1 with physiotherapy and mechanical DVT prophylaxis.",
          "Keep him flat in bed for 72 hours to protect the dural closure.",
          "Let him walk to the bathroom alone on the evening of surgery.",
        ],
        feedback: [
          "Head-up positioning helps venous drainage, and early mobilization prevents DVT and pneumonia.",
          "Prolonged bed rest raises DVT and pneumonia risk without protecting the dura.",
          "Unsupervised walking hours after a craniotomy risks a fall and a head injury.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the imaging.",
        choices: [
          "Review at 2 weeks with the histology and postoperative MRI, taper the dexamethasone, and refer to neuro-oncology.",
          "Stop the dexamethasone abruptly at discharge.",
          "Restart his aspirin on the day of discharge.",
        ],
        feedback: [
          "Early review sets the adjuvant plan, and a steroid taper avoids adrenal crisis.",
          "Abrupt withdrawal after days of dexamethasone risks adrenal crisis and rebound swelling.",
          "Aspirin within days of a craniotomy raises the risk of a postoperative hematoma.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the seizure plan, and the warning signs.",
        choices: [
          "Advise no driving until cleared under the seizure rules, and to return for headache, fever, wound leak, or new weakness.",
          "Tell him he can fly home the next day.",
          "Advise him to return only if he has a seizure.",
        ],
        feedback: [
          "Driving rules and red flags cover seizures, infection, and a late hematoma.",
          "Air in the skull expands at altitude; flying days after a craniotomy risks tension pneumocephalus.",
          "Headache, fever, wound leak, and new weakness are red flags too.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "postop", title: "Monitor in the ICU", description: "Watch for bleeding, seizures, and ICP.",
        choices: [
          "Monitor neurology, blood pressure, and the drain output in the ICU.",
          "Transfer to the ward once the patient wakes.",
          "Monitor only the vital signs.",
        ],
        feedback: [
          "ICU monitoring catches postoperative bleeding and seizures.",
          "Direct ward transfer is unsafe after a craniotomy.",
          "Vitals-only monitoring misses neurologic deterioration.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "postop", title: "Control blood pressure", description: "Hypertension risks a postoperative bleed.",
        choices: [
          "Maintain strict blood pressure targets with antihypertensives.",
          "Allow the pressure to run high to perfuse the brain.",
          "Check the pressure only in the ward.",
        ],
        feedback: [
          "Blood pressure is controlled to prevent rebleeding.",
          "High pressure risks hemorrhage into the cavity.",
          "Intermittent checks miss dangerous peaks.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Plan rehabilitation", description: "Address the neurologic deficits.",
        choices: [
          "Refer for physiotherapy and speech therapy as indicated by the deficits.",
          "Wait six weeks to see which deficits recover on their own before referring to therapy.",
          "Restrict the patient to bed rest for a week.",
        ],
        feedback: [
          "Rehabilitation addresses the postoperative deficits.",
          "Early therapy drives neurologic recovery; waiting to see what recovers by itself loses the most plastic period.",
          "Bed rest increases thrombosis and deconditioning.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Plan the pathology and follow-up", description: "Coordinate the oncology plan.",
        choices: [
          "Arrange follow-up with the pathology result and the oncology team.",
          "Discharge to the GP and ask them to chase the pathology result.",
          "Schedule a routine repeat MRI in one month regardless.",
        ],
        feedback: [
          "The pathology guides the adjuvant plan.",
          "The adjuvant plan needs the surgical and oncology teams; handing the pathology to the GP delays it.",
          "Routine imaging timing depends on the pathology.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SPINAL FUSION
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "spinal-fusion",
    spec: {
      approach: "a posterior midline approach for L4-L5 fusion",
      wrongApproaches: ["an anterior retroperitoneal approach as routine", "a lateral transpsoas approach"],
      landmark: "the pedicles of L4 and L5",
      wrongLandmarks: ["the sacral ala", "the iliac crest"],
      vessel: "the segmental vessels and the epidural venous plexus",
      wrongVessels: ["the aorta", "the iliac artery"],
      nerve: "the nerve roots of L4, L5, and the cauda equina",
      wrongNerves: ["the femoral nerve", "the obturator nerve"],
      structure: "the L4-L5 disc space and the pedicle screws",
      wrongStructures: ["the sacrum", "the facet joints above"],
      test: "neuromonitoring and a final X-ray of the construct",
      wrongTests: ["an on-table MRI", "a bone scan"],
      risks: ["nerve_injury", "hemorrhage", "infection", "thrombosis", "hypoxia", "fluid_overload"],
      instrument: "a pedicle probe and an awl",
      position: "prone on a spinal frame",
      wrongPositions: ["supine", "lateral decubitus"],
      detail: "54-year-old, L4-L5 disc herniation, failed conservative treatment",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the MRI, the levels, and the neuromonitoring plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Instrumented fusion demands timely prophylaxis." },
      { kind: "position", title: "Position prone on the spinal frame", description: "Protect the abdomen and the pressure points.", f: { wrongPositions: ["supine", "lateral decubitus"] } },
      { kind: "access", title: "Make the midline incision", description: "Expose the posterior elements of L4-L5.", f: { wrongApproaches: ["an anterior approach as routine", "a lateral approach"] } },
      { kind: "exposure", title: "Subperiosteal exposure of the posterior elements", description: "Strip the muscles off the spinous processes.", f: { structure: "the posterior elements", landmark: "the spinous processes" } },
      {
        kind: "landmark", title: "Confirm the level", description: "Verify you are at L4-L5 before any instrumentation.",
        choices: [
          "Confirm the level with fluoroscopy against the sacrum before placing screws.",
          "Trust the skin incision and start drilling.",
          "Count the spinous processes by palpation only.",
        ],
        feedback: [
          "The level is confirmed radiographically.",
          "Trusting the incision risks instrumenting the wrong level.",
          "Palpation miscounts often; exploring a second level doubles the dissection and the blood loss.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Place the pedicle screws", description: "Instrument the pedicles safely.",
        choices: [
          "Probe each pedicle with neuromonitoring and fluoroscopic confirmation before placing the screws.",
          "Drill the pedicles freehand at the presumed entry points.",
          "Place the screws with maximum diameter to ensure fixation.",
        ],
        feedback: [
          "The pedicles are probed and confirmed before instrumentation.",
          "Freehand drilling risks a pedicle breach and nerve root injury.",
          "Oversized screws split the pedicle, and the cancellous bone bleeds heavily.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "nerve", title: "Protect the nerve roots", description: "The L5 and S1 roots sit just ventral to the pedicles.",
        choices: [
          "Confirm the probe stays within the pedicle with a stimulating ball-tip probe.",
          "Advance the probe until resistance is felt.",
          "Place the screws without stimulation to save time.",
        ],
        feedback: [
          "The pedicle is confirmed intact with stimulation.",
          "Pushing through resistance breaches the front of the vertebral body toward the great vessels.",
          "Skipping stimulation risks a silent root injury.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Perform the decompression", description: "Decompress the L4-L5 nerve roots.",
        choices: [
          "Perform a laminectomy and discectomy, decompressing the L5 roots under direct vision.",
          "Remove the lamina with a burr down to the dura blindly.",
          "Leave the disc herniation and fuse only.",
        ],
        feedback: [
          "The roots are decompressed under direct vision.",
          "Burring to the dura without vision tears it — the CSF leak opens a path for meningitis.",
          "Fusing without decompression leaves the root compressed and the radiculopathy in place.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "bleed", title: "Control epidural venous bleeding", description: "The epidural plexus is bleeding.",
        choices: [
          "Control the epidural veins with bipolar cautery and hemostatic agents.",
          "Cauterize the dura to stop the bleeding.",
          "Pack the epidural space with bone wax.",
        ],
        feedback: [
          "The epidural bleeding is controlled safely.",
          "Cautery on the dura burns a hole — the CSF leak opens a path for meningitis.",
          "Bone wax in the epidural space presses on the sac and roots.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "core", title: "Prepare the disc space", description: "Prepare L4-L5 for the interbody cage.",
        choices: [
          "Prepare the disc space carefully, protecting the thecal sac and roots.",
          "Aggressively ream the disc space to the endplates.",
          "Remove the disc with a rongeur blindly.",
        ],
        feedback: [
          "The disc space is prepared with the neural structures protected.",
          "Reaming through the endplates opens the cancellous bone, which bleeds and lets the cage sink.",
          "Blind rongeur use risks the thecal sac and the exiting root.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Place the interbody cage", description: "Restore the disc height.",
        choices: [
          "Place the cage with the correct size and position, confirmed by fluoroscopy.",
          "Impact the largest cage that fits.",
          "Impact the cage past the anterior annulus to maximize lordosis.",
        ],
        feedback: [
          "The cage is placed in the correct position and size.",
          "Oversized cages risk endplate fracture and nerve stretch.",
          "The iliac vessels lie just in front of the anterior annulus — driving through it can tear them.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Rod the construct", description: "Connect the screws.",
        choices: [
          "Place the rods and lock them with the correct sagittal alignment.",
          "Compress the construct forcefully for maximum lordosis.",
          "Leave the rods long above the top screws to allow a later extension.",
        ],
        feedback: [
          "The rods are placed with correct alignment.",
          "Forceful compression closes the foramen and stretches the root.",
          "Long rod ends are prominent under thin tissue — the wound breaks down over them and becomes infected.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "verify", title: "Test the construct", description: "Confirm the implant position.",
        choices: [
          "Check the final X-ray for screw and cage position and obtain a wake-up test if monitoring is unreliable.",
          "Trust the placement and close.",
          "Rely on the neuromonitoring alone and skip the final image.",
        ],
        feedback: [
          "The construct is confirmed on imaging.",
          "A medially placed screw left behind presses on the root.",
          "Monitoring does not see a screw that has breached forward toward the great vessels.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "vessel", title: "Protect the vessels in front of the disc", description: "The iliac vessels lie just anterior to the L4-L5 disc.",
        choices: [
          "Keep the instruments within the disc space, checking their depth on fluoroscopy, and never breach the anterior annulus.",
          "Push the curette through the anterior annulus to clear the disc completely.",
          "Control a foraminal bleeder with a large clamp deep in the foramen.",
        ],
        feedback: [
          "Depth control inside the annulus keeps the great vessels safe.",
          "A breach through the anterior annulus can lacerate the iliac artery or vein — a hidden, massive bleed.",
          "The exiting root sits in the foramen — a blind clamp there crushes it.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "verify", title: "Confirm the screws on final imaging", description: "Re-check the screw positions on the final fluoroscopy.", f: { test: "the screw positions on the final image", wrongTests: ["an on-table MRI", "a CT scan"] } },
      {
        kind: "verify", title: "Check the decompression", description: "Confirm the thecal sac is free of compression.",
        choices: [
          "Inspect the laminectomy edges and confirm the thecal sac is free of bone or ligament compression.",
          "Confirm the decompression by palpation through the wound.",
          "Widen the laminectomy prophylactically to be sure the sac is free.",
        ],
        feedback: [
          "Seeing the sac free of bone and ligament confirms the decompression is complete.",
          "Blind palpation can injure the dura and nerve roots — the sac must be seen.",
          "Extending the laminectomy risks epidural bleeding — only the compressed segment needs freeing.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      { kind: "bleed", title: "Control a muscle bleeder", description: "The paraspinal muscle is bleeding.", f: { vessel: "the paraspinal vessels", wrongVessels: ["the aorta", "the iliac artery"] } },
      { kind: "verify", title: "Confirm the neuromonitoring signals", description: "Re-check the motor and sensory signals before closure.", f: { test: "the neuromonitoring signals", wrongTests: ["a nerve conduction study", "a CT scan"] } },
      { kind: "closure", title: "Close the wound", description: "Close the fascia, subcutaneous layer, and skin.", f: { structure: "the thoracolumbar fascia and skin" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Spinal surgery patients are high-risk for thrombosis." },
      {
        kind: "postop", title: "Watch for epidural hematoma", description: "Two hours post-op he reports new heaviness in both legs.",
        choices: [
          "Examine urgently; if a new deficit is confirmed, get an emergency MRI and return to theatre for evacuation.",
          "Reassure him it's residual anesthetic and recheck in the morning.",
          "Give more IV opioid for the discomfort and recheck in 4 hours.",
        ],
        feedback: [
          "A new deficit after spinal surgery is a hematoma until proven otherwise — decompression within hours saves function.",
          "Waiting overnight lets an epidural hematoma compress the cauda equina permanently.",
          "Sedating him hides the progression and depresses his breathing.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "postop", title: "Wound drain", description: "The drain has put out 150 mL in 12 hours.",
        choices: [
          "Record the output and remove the drain at 24–48 hours once it slows.",
          "Leave the drain for a week to be safe.",
          "Pull the drain now, even though it is still draining briskly.",
        ],
        feedback: [
          "Short-term drainage with timely removal balances hematoma and infection risk.",
          "A long-standing drain is a route for bacteria into the implant.",
          "Pulling a brisk drain lets the blood collect around the dura.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Pain control", description: "Back pain 7/10 on day 1.",
        choices: [
          "Multimodal analgesia: paracetamol, a gabapentinoid, and PCA opioid with monitoring.",
          "Double the PCA dose and add a benzodiazepine for comfort.",
          "Give high-dose NSAIDs for 6 weeks to speed recovery.",
        ],
        feedback: [
          "Multimodal analgesia with monitoring controls pain safely after fusion.",
          "Stacking opioid and benzodiazepine depresses breathing.",
          "Prolonged high-dose NSAIDs impair bone healing and platelet function — the wound and epidural space can bleed.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Log-roll and early movement", description: "Nursing asks how to move him.",
        choices: [
          "Log-roll for turning, sit out on day 1, and walk with physio.",
          "Keep him flat without turning for 48 hours.",
          "Let him sit up by twisting and pulling on the rails.",
        ],
        feedback: [
          "Log-rolling protects the construct while allowing early movement.",
          "Two days flat without turning risks DVT and pressure injury.",
          "Twisting loads the fresh screws and can shift them against a root.",
        ],
        wrongComps: ["thrombosis", "nerve_injury"],
      },
      {
        kind: "postop", title: "Watch for infection", description: "Day 5: new wound ooze and temperature 38.2°C.",
        choices: [
          "Examine the wound, send cultures and inflammatory markers, and involve the surgeon about washout.",
          "Start oral antibiotics and discharge.",
          "Put it down to atelectasis and recheck in 3 days.",
        ],
        feedback: [
          "A draining wound over an implant needs early surgical review — washout can save the hardware.",
          "Oral antibiotics alone do not clear a deep infection around the implant.",
          "Delay lets a deep infection spread along the implant.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Bowel and bladder", description: "He has not passed urine for 8 hours.",
        choices: [
          "Scan the bladder, catheterize if in retention, and examine for saddle anesthesia.",
          "Wait until he feels the urge.",
          "Give a large fluid bolus to get the kidneys going.",
        ],
        feedback: [
          "Retention after spinal surgery can be simple, or a sign of cauda equina compression — both need checking.",
          "Unrecognized retention with saddle numbness may be a hematoma compressing the cauda equina.",
          "Fluid does not fix retention — it overfills the bladder and the circulation.",
        ],
        wrongComps: ["hemorrhage", "fluid_overload"],
      },
      {
        kind: "postop", title: "Bracing plan", description: "He asks if he needs a brace.",
        choices: [
          "No routine brace for a stable instrumented fusion — follow the surgeon's movement precautions.",
          "Wear a rigid brace full-time for 6 months.",
          "Take the precautions off entirely at 1 week.",
        ],
        feedback: [
          "Instrumented fusions rarely need a brace; precautions protect the construct.",
          "Long-term rigid bracing weakens the core and keeps him inactive, raising the clot risk.",
          "Dropping all precautions early loads the screws before fusion, and they can loosen onto a root.",
        ],
        wrongComps: ["thrombosis", "nerve_injury"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the fusion review.",
        choices: [
          "Review at 6 weeks and 3 months with standing X-rays to check the construct.",
          "One wound check at 2 weeks and discharge.",
          "Review only if he reports pain.",
        ],
        feedback: [
          "Serial reviews catch hardware problems and track fusion.",
          "A single early wound check misses late infection and loosening.",
          "Without routine review, a slowly loosening screw can shift onto a root unnoticed.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "He is going home on day 3.",
        choices: [
          "Explain wound care, lifting limits, and red flags: new weakness, saddle numbness, fever, or wound discharge.",
          "Tell him bladder problems are normal after back surgery.",
          "Give no wound advice — the dressing is waterproof.",
        ],
        feedback: [
          "Clear red flags lead to early treatment of hematoma or infection.",
          "Bladder change can mean an epidural hematoma or cauda equina compression — it is an emergency.",
          "Without wound advice, an early infection is missed.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Monitor the neurology", description: "Watch for new deficits.",
        choices: [
          "Assess lower-extremity strength and sensation frequently after surgery.",
          "Check the neuro exam only at the first clinic visit.",
          "Trust the intraoperative monitoring and skip the exam.",
        ],
        feedback: [
          "Early neurologic assessment catches a new deficit.",
          "Delayed checks miss a developing compression.",
          "Intraoperative monitoring cannot replace the postoperative exam.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Manage the wound", description: "Watch for infection and hematoma.",
        choices: [
          "Inspect the wound and monitor for drainage, fever, and back pain.",
          "Discharge without a wound review.",
          "Change the dressing only at the clinic visit.",
        ],
        feedback: [
          "Wound surveillance catches early infection.",
          "No review risks a deep infection.",
          "A dressing left until clinic hides a growing wound hematoma.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan mobilization", description: "Define the recovery pathway.",
        choices: [
          "Mobilize early with log-roll precautions and structured physiotherapy.",
          "Keep the patient on strict bed rest for two weeks.",
          "Allow unrestricted bending and lifting immediately.",
        ],
        feedback: [
          "Early, protected mobilization is the standard.",
          "Prolonged bed rest increases thrombosis risk.",
          "Early bending and lifting loosens the screws before fusion — a loose screw can shift onto a root.",
        ],
        wrongComps: ["thrombosis", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the imaging and clinic plan.",
        choices: [
          "Arrange follow-up with X-rays at 6 weeks and 3 months to assess fusion.",
          "Review in clinic once at 6 weeks and discharge if the wound has healed.",
          "Stop all analgesia at discharge to avoid dependence.",
        ],
        feedback: [
          "Serial X-rays track fusion.",
          "Fusion takes months; a single 6-week wound check misses non-union, hardware failure, and late infection.",
          "Uncontrolled pain at home keeps him in bed, and immobility after a fusion raises the clot risk.",
        ],
        wrongComps: ["infection", "thrombosis"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // EXPLORATORY LAPAROTOMY (TRAUMA)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "exploratory-laparotomy",
    spec: {
      approach: "a midline laparotomy for trauma",
      wrongApproaches: ["a transverse right upper quadrant incision", "a flank incision"],
      landmark: "the four quadrants and the retroperitoneum",
      wrongLandmarks: ["the pelvis only", "the thoracic cavity"],
      vessel: "the aorta, the celiac axis, and the named abdominal vessels",
      wrongVessels: ["the femoral vessels", "the jugular vein"],
      nerve: "the retroperitoneal structures and the ureters",
      wrongNerves: ["the sciatic nerve", "the phrenic nerve"],
      structure: "the solid organs, hollow viscera, and the retroperitoneum",
      wrongStructures: ["the heart", "the lung"],
      test: "a systematic four-quadrant and retroperitoneal survey",
      wrongTests: ["a routine colonoscopy", "a CT scan in the OR"],
      risks: ["hemorrhage", "cardiac_arrhythmia", "infection", "hypoxia", "thrombosis"],
      instrument: "a self-retaining retractor and vascular clamps",
      position: "supine with the arms out",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "28-year-old, gunshot wound to the RUQ, hypotensive 85/50, tachycardic 135",
    },
    steps: [
      { kind: "preop", title: "Activate the trauma protocol", description: "Massive transfusion and a warm OR — every minute counts." },
      { kind: "position", title: "Position for the laparotomy", description: "Supine with the arms out for access.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Make the midline incision", description: "Open the abdomen fast and wide.", f: { wrongApproaches: ["a transverse RUQ incision", "a flank incision"] } },
      {
        kind: "exposure", title: "Evacuate the blood and pack", description: "Get control of the field.",
        choices: [
          "Sweep the pooled blood out with packs, then pack all four quadrants to tamponade the bleeding.",
          "Start hunting for the source before any packing.",
          "Pack only the right upper quadrant where the wound is.",
        ],
        feedback: [
          "Packing all four quadrants buys time and lets you find the source sequentially.",
          "Searching before packing allows continued loss and obscures the field.",
          "Packing only the RUQ misses other sources and leaves the field uncontrolled.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "bleed", title: "Control the major bleeding", description: "Blood is pooling — find the source.",
        choices: [
          "Pack all four quadrants, then remove packs sequentially to find and control the source.",
          "Sweep the blood out and start searching immediately.",
          "Clamp the aorta at the hiatus blindly.",
        ],
        feedback: [
          "Packing buys time and reveals the source sequentially.",
          "Searching without packing allows continued loss.",
          "Blind aortic clamping risks injury and is a last resort.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Control the liver bleeding", description: "The RUQ wound has injured the liver.",
        choices: [
          "Apply direct pressure, then perform a Pringle maneuver if the bleeding continues.",
          "Suture the liver wound immediately.",
          "Resect the injured liver lobe as routine.",
        ],
        feedback: [
          "The liver is controlled with pressure and a Pringle when needed.",
          "Suturing a bleeding liver without control worsens the tear.",
          "Routine resection is excessive in damage control.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vessel", title: "Identify the retroperitoneal hematoma", description: "A hematoma is expanding in the retroperitoneum.",
        choices: [
          "Explore a pulsatile or expanding hematoma with proximal control first.",
          "Open every retroperitoneal hematoma immediately.",
          "Leave the hematoma and close the abdomen.",
        ],
        feedback: [
          "The hematoma is explored with proximal control.",
          "Opening a contained hematoma without control causes exsanguination.",
          "Closing over an expanding hematoma is fatal.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "core", title: "Run the bowel", description: "Find the bowel injuries.",
        choices: [
          "Run the small bowel from the ligament of Treitz, examining both sides of the mesentery.",
          "Run the colon only.",
          "Inspect the bowel with the retractors in place.",
        ],
        feedback: [
          "The bowel is run systematically, finding all injuries.",
          "Running only the colon misses small bowel injuries.",
          "Retractors hide segments of bowel.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Manage the bowel injuries", description: "Repair or resect the injuries.",
        choices: [
          "Close simple perforations or resect segments with gross contamination, per the damage-control plan.",
          "Resect all perforations regardless of size.",
          "Close all wounds with a single layer without assessing viability.",
        ],
        feedback: [
          "The injuries are managed according to the damage-control plan.",
          "Resecting simple wounds adds unnecessary surgery in a sick patient.",
          "Single-layer closure without viability assessment risks a leak.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "vitals", title: "Respond to the hypotension", description: "The pressure is dropping despite transfusion.",
        choices: [
          "Pause, check for ongoing bleeding, and coordinate with anesthesia on the resuscitation.",
          "Continue operating — the pressure will recover.",
          "Push more fluid without reassessing.",
        ],
        feedback: [
          "The team addresses the cause of the hypotension.",
          "Continuing against hypotension risks cardiac arrest.",
          "Fluid alone without source control is futile.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      {
        kind: "core", title: "Decide on damage control", description: "The patient is cold, acidotic, and coagulopathic.",
        choices: [
          "Abbreviate the surgery: control bleeding and contamination, pack, and close temporarily.",
          "Complete the definitive repair now — it is the only chance.",
          "Close the abdomen fully after packing.",
        ],
        feedback: [
          "Damage control is the correct call in the lethal triad.",
          "Definitive surgery in the lethal triad is fatal.",
          "Closing the fascia over packs causes compartment syndrome.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      },
      {
        kind: "verify", title: "Re-check the packing sites", description: "Confirm the packs are placed at the bleeding sites.",
        choices: [
          "Place packs above and below the bleeding liver or retroperitoneum, compressing it, and count them onto the board.",
          "Pack the whole abdomen as tightly as possible to stop every ooze.",
          "Place the packs loosely over the bowel so they are easy to remove later.",
        ],
        feedback: [
          "Directed packs compress the bleeding surface, and a count prevents a retained pack.",
          "Over-packing raises the abdominal pressure and causes compartment syndrome.",
          "Loose packs over the bowel do not compress the bleeding surface.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hemorrhage"],
      },
      { kind: "exposure", title: "Assess the bowel viability", description: "Check the bowel that was injured for viability.", f: { structure: "the injured bowel", landmark: "the mesenteric edge" } },
      { kind: "bleed", title: "Control a mesenteric bleeder", description: "A mesenteric vessel is bleeding again.", f: { vessel: "the mesenteric vessels", wrongVessels: ["the aorta", "the iliac artery"] } },
      {
        kind: "verify", title: "Confirm the resuscitation parameters", description: "Check the temperature, the pH, and the coagulation before closing.",
        choices: [
          "Check the temperature, pH, lactate, and coagulation, and stop at damage control if he is cold, acidotic, or coagulopathic.",
          "Complete the definitive repairs now, since he is already on the table.",
          "Close the fascia tightly to keep the packs in place.",
        ],
        feedback: [
          "Hypothermia, acidosis, and coagulopathy together are lethal; damage control stops before they spiral.",
          "Long definitive surgery in a cold, acidotic patient deepens the coagulopathy and bleeding.",
          "Tight fascial closure over packs raises the abdominal pressure; a temporary closure is used.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      { kind: "closure", title: "Close the abdomen temporarily", description: "Protect the viscera and allow decompression.",
        choices: [
          "Close with a temporary closure that allows decompression and re-exploration.",
          "Close the fascia tightly over the packs.",
          "Leave the abdomen open without protection.",
        ],
        feedback: [
          "The temporary closure allows planned re-exploration.",
          "Tight fascial closure causes abdominal compartment syndrome.",
          "An unprotected open abdomen loses heat and fluid.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major trauma is the highest-risk setting for thrombosis." },
      {
        kind: "postop", title: "Watch for abdominal compartment syndrome", description: "Monitor the bladder pressure and the ventilation.",
        choices: [
          "Measure the bladder pressure every 4 hours and decompress if it stays above 20 mmHg with new organ dysfunction.",
          "Treat falling urine output with more fluid boluses.",
          "Watch the ventilator pressures only, without bladder pressures.",
        ],
        feedback: [
          "Bladder pressure finds compartment syndrome before the kidneys and lungs fail.",
          "More fluid raises the abdominal pressure further.",
          "Ventilator pressures rise late; the bladder pressure shows it early.",
        ],
        wrongComps: ["hypoxia", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Transfusion plan", description: "Define the transfusion goals and the monitoring.",
        choices: [
          "Transfuse red cells, plasma, and platelets in balanced ratios guided by viscoelastic tests, and give calcium.",
          "Give red cells alone until the hemoglobin is normal.",
          "Resuscitate with crystalloid first and hold blood products.",
        ],
        feedback: [
          "Balanced products and calcium treat the coagulopathy of massive transfusion.",
          "Red cells alone dilute the clotting factors, and he keeps bleeding.",
          "Crystalloid dilutes clotting factors and worsens acidosis and edema.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "postop", title: "Rewarming plan", description: "Plan the active rewarming in the ICU.",
        choices: [
          "Use a forced-air warmer and warmed fluids and products, aiming for above 36 °C.",
          "Rewarm slowly with blankets only.",
          "Accept 34 °C, since hypothermia protects the organs.",
        ],
        feedback: [
          "Active rewarming reverses the coagulopathy that cold causes.",
          "Passive rewarming is too slow for a coagulopathic trauma patient.",
          "Hypothermia after hemorrhage worsens bleeding and arrhythmias.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Ventilator management", description: "Define the ventilation strategy for the resuscitation.",
        choices: [
          "Use lung-protective ventilation at 6 to 8 mL/kg with PEEP, and keep him sedated until the second look.",
          "Use large tidal volumes of 12 mL/kg to recruit the lungs.",
          "Extubate once he is rewarmed, before the second look.",
        ],
        feedback: [
          "Protective ventilation limits lung injury after massive transfusion.",
          "Large tidal volumes injure the lungs, especially after transfusion.",
          "He needs to go back to theater with an open abdomen; extubating now risks aspiration and reintubation.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Renal support", description: "Monitor the urine output and the renal function.",
        choices: [
          "Track hourly urine output, lactate, and creatinine, and check the bladder pressure if output falls.",
          "Give furosemide to keep the urine output above 1 mL/kg/h.",
          "Accept low urine output until the second look.",
        ],
        feedback: [
          "Oliguria after damage control can be hypovolemia or compartment syndrome; both need finding.",
          "Diuretics in an under-resuscitated patient worsen hypovolemia and hide the cause.",
          "Low urine output is an early warning that needs a cause found now.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "postop", title: "Coagulation management", description: "Correct the coagulopathy with the blood products.",
        choices: [
          "Correct the coagulopathy guided by thromboelastography, with fibrinogen and platelets as needed.",
          "Give vitamin K and wait for the INR to correct.",
          "Start prophylactic heparin now to prevent clots.",
        ],
        feedback: [
          "Targeted factor replacement stops coagulopathic bleeding quickly.",
          "Vitamin K takes hours and does not treat dilutional coagulopathy.",
          "Heparin before the bleeding is controlled restarts it.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Watch for sepsis", description: "Monitor for the signs of developing sepsis.",
        choices: [
          "Watch for fever, rising lactate, and new organ dysfunction, and send cultures early.",
          "Put any fever down to transfusion reactions.",
          "Give routine broad-spectrum antibiotics for two weeks.",
        ],
        feedback: [
          "An open abdomen with packs is a high sepsis risk; early cultures guide treatment.",
          "Fever after damage control can be sepsis from a missed bowel injury.",
          "Long routine antibiotics select resistance without replacing source control.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Nutrition support", description: "Start the early nutritional support.",
        choices: [
          "Start trickle enteral feeding within 24 to 48 hours once he is resuscitated.",
          "Keep him nil by mouth until the abdomen is closed.",
          "Start full-rate feeding while he is still on escalating vasopressors.",
        ],
        feedback: [
          "Early enteral feeding helps gut integrity even with an open abdomen.",
          "Prolonged starvation raises infection and fistula risk.",
          "Full feeding during shock risks bowel ischemia.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Family communication", description: "Coordinate the family updates on the damage-control course.",
        choices: [
          "Meet the family with the ICU team, explain the planned second operation, and set expectations.",
          "Delay updating the family until after the second look.",
          "Tell the family the operation was a success and he will recover fully.",
        ],
        feedback: [
          "Early honest updates prepare the family for a staged course.",
          "Leaving the family uninformed through a critical period damages trust and consent.",
          "False reassurance before the second look sets up conflict if he deteriorates.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Planned re-exploration timing", description: "Set the timing and the criteria for the second look.",
        choices: [
          "Plan the second look at 24 to 48 hours once he is warm, not acidotic, and not coagulopathic.",
          "Return to theater after 6 hours whatever his physiology.",
          "Leave the packs for 7 days to be sure the bleeding has stopped.",
        ],
        feedback: [
          "Re-exploring after resuscitation gives the best chance of definitive repair.",
          "Going back before he is resuscitated repeats the lethal triad.",
          "Packs left for days raise abdominal sepsis.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Skin and wound protection", description: "Protect the open abdomen and the skin edges.",
        choices: [
          "Use a negative-pressure temporary abdominal closure and protect the skin edges.",
          "Close the skin only over the packs.",
          "Leave the abdomen covered with wet gauze alone.",
        ],
        feedback: [
          "A vacuum closure controls fluid and protects the bowel until closure.",
          "Skin-only closure can still cause compartment syndrome.",
          "Wet gauze on exposed bowel raises infection and fistula risk.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Analgesia plan", description: "Plan the analgesia for the ventilated patient.",
        choices: [
          "Use a fentanyl infusion with sedation holds, titrated to a pain score.",
          "Give regular NSAIDs for pain control.",
          "Use sedation alone without analgesia.",
        ],
        feedback: [
          "Opioid-based analgesia suits a ventilated patient with an open abdomen.",
          "NSAIDs worsen bleeding and kidney injury.",
          "Sedation without analgesia leaves pain, which drives tachycardia and arrhythmia.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Plan the ICU resuscitation", description: "Correct the physiology before the second look.",
        choices: [
          "Rewarm, correct coagulopathy, and support organ function before planned re-exploration.",
          "Re-explore immediately without resuscitation.",
          "Close the abdomen definitively in the ICU.",
        ],
        feedback: [
          "Physiology is corrected before the second look.",
          "Re-exploring a cold, acidotic patient repeats the mistake.",
          "ICU fascial closure is not the damage-control plan.",
        ],
        wrongComps: ["cardiac_arrhythmia", "infection"],
      },
      {
        kind: "postop", title: "Monitor for compartment syndrome", description: "Watch the bladder pressure and the physiology.",
        choices: [
          "Monitor bladder pressure and organ function for abdominal compartment syndrome.",
          "Ignore the pressures — the abdomen is open.",
          "Only check the pressures if the patient arrests.",
        ],
        feedback: [
          "Compartment syndrome is monitored even with a temporary closure.",
          "The temporary closure can still become tight with swelling.",
          "Waiting for arrest delays decompression.",
        ],
        wrongComps: ["hypoxia", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Plan the second-look operation", description: "Define the re-exploration.",
        choices: [
          "Re-explore once the physiology is corrected, completing the definitive repairs.",
          "Re-explore only if the patient deteriorates.",
          "Close the abdomen at the bedside without re-exploration.",
        ],
        feedback: [
          "The second look completes the definitive surgery.",
          "Re-exploring only on deterioration risks missed ischemia.",
          "Bedside closure without a look risks an untreated injury.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Antibiotics and source control", description: "Manage the contamination.",
        choices: [
          "Continue directed antibiotics based on the contamination and cultures.",
          "Stop antibiotics immediately after the first operation.",
          "Use broad-spectrum antibiotics indefinitely.",
        ],
        feedback: [
          "Antibiotics are directed at the contamination.",
          "Stopping antibiotics after contamination risks sepsis.",
          "Indefinite broad-spectrum therapy breeds resistance.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PULMONARY LOBECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "pulmonary-lobectomy",
    spec: {
      approach: "a video-assisted thoracoscopic (VATS) lobectomy",
      wrongApproaches: ["a median sternotomy as routine", "a subcostal approach"],
      landmark: "the right upper lobe bronchus and the pulmonary artery branches",
      wrongLandmarks: ["the esophagus", "the azygos vein alone"],
      vessel: "the pulmonary artery and vein branches",
      wrongVessels: ["the aorta", "the superior vena cava"],
      nerve: "the recurrent laryngeal nerve and the phrenic nerve",
      wrongNerves: ["the vagus nerve", "the hypoglossal nerve"],
      structure: "the right upper lobe and its fissures",
      wrongStructures: ["the middle lobe", "the left lower lobe"],
      test: "an air-leak test and a check of the bronchial stump",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["hypoxia", "hemorrhage", "cardiac_arrhythmia", "infection", "nerve_injury", "thrombosis"],
      instrument: "a thoracoscope and an endostapler",
      position: "lateral decubitus",
      wrongPositions: ["prone", "supine"],
      detail: "62-year-old, 2.5 cm RUL adenocarcinoma, COPD, SpO2 94%",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the CT, the lung function, and the lobe to resect." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Resection warrants timely prophylaxis." },
      { kind: "position", title: "Position in lateral decubitus", description: "The right side up for a right upper lobectomy.", f: { wrongPositions: ["prone", "supine"] } },
      { kind: "access", title: "Place the VATS ports", description: "Set up the thoracoscopic access.", f: { wrongApproaches: ["a median sternotomy", "a subcostal approach"] } },
      {
        kind: "core", title: "Achieve single-lung ventilation", description: "Collapse the operative lung.",
        choices: [
          "Confirm the double-lumen tube position with the bronchoscope before starting.",
          "Trust the tube placement and start the dissection.",
          "Collapse both lungs for better visibility.",
        ],
        feedback: [
          "The double-lumen tube is confirmed in position.",
          "An unconfirmed tube risks operating on an inflated lung.",
          "Bilateral collapse causes hypoxia.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "dissect", title: "Divide the fissures", description: "Complete the fissures to expose the hilum.",
        choices: [
          "Complete the major and minor fissures with the interlobar artery identified and protected.",
          "Staple across the incomplete fissure first and find the interlobar artery afterward.",
          "Divide the fissures with cautery to save stapler time.",
        ],
        feedback: [
          "With the interlobar artery identified, the fissure can be completed without vascular injury.",
          "Stapling blind risks the interlobar artery — find it before dividing anything.",
          "A cautery-sealed fissure leaves a prolonged air leak that can set up an empyema — staple the parenchyma.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vessel", title: "Control the pulmonary vein", description: "Secure the venous drainage of the lobe.",
        choices: [
          "Dissect and staple the superior pulmonary vein branch of the lobe.",
          "Staple the entire superior pulmonary vein.",
          "Ligate the vein with a suture ligature blindly.",
        ],
        feedback: [
          "The lobar vein branch is controlled correctly.",
          "Stapling the whole vein devascularizes the remaining lung.",
          "Blind ligation risks the atrial cuff.",
        ],
        wrongComps: ["thrombosis", "cardiac_arrhythmia"],
      },
      {
        kind: "vessel", title: "Control the pulmonary artery branches", description: "Secure the arterial supply of the lobe.",
        choices: [
          "Dissect and staple each segmental artery branch to the lobe individually.",
          "Staple the main pulmonary artery to the lobe en masse.",
          "Cauterize the arterial branches.",
        ],
        feedback: [
          "The lobar arterial branches are controlled individually.",
          "Stapling the main artery risks catastrophic hemorrhage.",
          "Cauterizing an artery causes delayed rupture.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "bleed", title: "Control a pulmonary artery bleed", description: "The artery is bleeding at the staple line.",
        choices: [
          "Apply pressure with a sponge stick, obtain proximal control, and repair or re-staple precisely.",
          "Pack the chest and close.",
          "Cauterize the bleeding artery.",
        ],
        feedback: [
          "The arterial bleed is controlled with proximal control.",
          "Packing alone is inadequate for an arterial bleed.",
          "Cautery on the pulmonary artery enlarges the hole.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "core", title: "Divide the bronchus", description: "Close the lobar bronchus.",
        choices: [
          "Staple the lobar bronchus at the correct level, confirming the other lobes ventilate.",
          "Staple the bronchus flush at the carina so no stump is left behind.",
          "Suture the bronchus closed with a running stitch.",
        ],
        feedback: [
          "The lobar bronchus is stapled at the correct level.",
          "Stapling at the carina takes the main bronchus, removing more lung than intended and leaving the remaining lobe unventilated.",
          "A running suture on the bronchus risks a stump leak.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "verify", title: "Test the bronchial stump", description: "Confirm the stump is sealed.",
        choices: [
          "Perform an air-leak test by re-inflating under saline and confirm the stump is sealed.",
          "Trust the staple line and close.",
          "Re-inflate the lung fully to test the stump.",
        ],
        feedback: [
          "The stump is confirmed sealed.",
          "Skipping the test risks a postoperative air leak or fistula.",
          "Full inflation can disrupt the stump.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "nerve", title: "Protect the recurrent laryngeal and phrenic nerves", description: "Dissection near the azygos and the hilum threatens these nerves.",
        choices: [
          "Keep the dissection away from the azygos arch and the vagus to protect the recurrent laryngeal and phrenic nerves.",
          "Retract the vagus firmly to expose the hilum.",
          "Cauterize tissue around the azygos arch.",
        ],
        feedback: [
          "The nerves are protected during the hilar dissection.",
          "Firm vagal retraction injures the recurrent laryngeal nerve.",
          "Cautery at the azygos arch risks the phrenic nerve.",
        ],
        wrongComps: ["nerve_injury", "hypoxia"],
      },
      {
        kind: "core", title: "Extract the lobe", description: "Remove the specimen.",
        choices: [
          "Extract the lobe in a specimen bag through the access incision.",
          "Pull the lobe through the port site directly.",
          "Morcellate the lobe in the chest.",
        ],
        feedback: [
          "The lobe is removed in a bag, protecting the wound.",
          "Direct extraction risks tumor seeding and wound contamination.",
          "Morcellation destroys the pathology.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "verify", title: "Re-inflate the remaining lobes", description: "Confirm the remaining lobes re-expand fully.",
        choices: [
          "Ask anesthesia to re-inflate under saline, check the stump for bubbles, and confirm the remaining lobes expand fully.",
          "Re-inflate at high pressure to open every collapsed segment at once.",
          "Close without re-inflating, since the lobes will expand on the chest drain.",
        ],
        feedback: [
          "A leak test at moderate pressure checks the stump and confirms the remaining lung fills the space.",
          "High inflation pressure can disrupt the fresh bronchial stump and staple lines.",
          "A lobe that is twisted or collapsed at closure stays that way; it must be seen to expand.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      { kind: "exposure", title: "Check the bronchial stump once more", description: "Re-inspect the stump for any leak under pressure.", f: { structure: "the bronchial stump", landmark: "the carina" } },
      { kind: "bleed", title: "Control a chest wall bleeder", description: "A chest wall vessel is bleeding at the port site.", f: { vessel: "the intercostal vessels at the port site", wrongVessels: ["the pulmonary artery", "the aorta"] } },
      {
        kind: "verify", title: "Confirm the drain position", description: "Check the chest drain is positioned correctly.",
        choices: [
          "Place one drain toward the apex, secure it, and connect it to an underwater seal.",
          "Place the drain low in the costophrenic angle only, since fluid collects there.",
          "Clamp the drain for the transfer to recovery.",
        ],
        feedback: [
          "An apical drain evacuates air after a lobectomy, when the remaining lung must fill the space.",
          "A basal-only drain leaves apical air, and the remaining lobe does not expand.",
          "A clamped drain with an air leak causes a tension pneumothorax.",
        ],
        wrongComps: ["hypoxia", "cardiac_arrhythmia"],
      },
      { kind: "closure", title: "Place the drains and close", description: "Drain the chest and close the ports.", f: { structure: "the chest drain and port sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Thoracic surgery carries a significant thrombosis risk." },
      {
        kind: "postop", title: "Watch for a persistent air leak", description: "Monitor the drain for a prolonged air leak.",
        choices: [
          "Record the air leak daily, keep the drain on water seal, and consider a portable valve if it lasts beyond 5 days.",
          "Put the drain on high suction until the leak stops.",
          "Remove the drain on day 2 whatever the leak.",
        ],
        feedback: [
          "Water seal shortens most leaks; a persistent one is managed with a portable valve rather than a longer stay.",
          "High suction keeps small leaks open and prolongs them.",
          "Removing the drain with an ongoing leak causes a pneumothorax.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Chest physiotherapy", description: "Start the breathing exercises early.",
        choices: [
          "Start deep breathing, coughing, and incentive spirometry from day 0 with good analgesia.",
          "Rest the lung for 48 hours before starting physiotherapy.",
          "Give physiotherapy only if the chest X-ray shows collapse.",
        ],
        feedback: [
          "Early physiotherapy clears secretions and prevents atelectasis and pneumonia.",
          "Resting the lung lets secretions pool and the remaining lobe collapse.",
          "Waiting for collapse on X-ray treats the complication instead of preventing it.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.",
        choices: [
          "Sit him out on day 0 and walk on day 1 with the drain, alongside LMWH.",
          "Keep him in bed until the drain is removed.",
          "Hold the LMWH until he is walking the ward.",
        ],
        feedback: [
          "Early mobilization improves ventilation and prevents clots.",
          "Bed rest with a drain leads to atelectasis and pneumonia.",
          "Thoracic cancer surgery carries a high clot risk that needs prophylaxis from the start.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "postop", title: "Wound care", description: "Define the port site care.",
        choices: [
          "Keep the port and drain sites dry and closed, and place a mattress suture to close the drain site on removal.",
          "Leave the drain site open to drain freely after removal.",
          "Remove the port sutures on day 2.",
        ],
        feedback: [
          "A sealed drain site stops air entering the chest and heals cleanly.",
          "An open drain site lets air in and becomes infected.",
          "Early suture removal risks dehiscence of the port sites.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Pulmonary rehabilitation", description: "Refer for pulmonary rehabilitation.",
        choices: [
          "Refer to pulmonary rehabilitation, especially with COPD or reduced FEV1.",
          "Advise avoiding exertion for three months to protect the remaining lung.",
          "Start rehabilitation only once breathlessness appears.",
        ],
        feedback: [
          "Rehabilitation improves exercise capacity and quality of life after lung resection.",
          "Inactivity leads to deconditioning, clots, and chest infection.",
          "Waiting for symptoms loses the early recovery window.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the chest X-ray and the pathology.",
        choices: [
          "Review at 2 weeks with a chest X-ray and the pathology, and discuss adjuvant treatment at the multidisciplinary meeting.",
          "Review at 3 months with a CT, since the pathology can wait.",
          "Let the respiratory team give the pathology at their routine appointment.",
        ],
        feedback: [
          "Node status decides on adjuvant chemotherapy, which should start within weeks.",
          "A late review delays adjuvant treatment and misses early complications like an effusion.",
          "The surgical team must explain the resection and pathology before the adjuvant plan.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Smoking cessation", description: "Discuss smoking cessation with the patient.",
        choices: [
          "Offer nicotine replacement or varenicline and refer to a cessation service.",
          "Advise cutting down slowly over the next year.",
          "Leave smoking for the GP to raise later.",
        ],
        feedback: [
          "Structured support doubles quit rates, and stopping reduces recurrence and second cancers.",
          "Cutting down keeps the risk; stopping is what helps.",
          "Surgery is the moment patients are most likely to quit.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Summarize the drain care, the medications, and the warning signs.",
        choices: [
          "Teach breathing exercises and drain-site care, and to return for breathlessness, fever, chest pain, or a leaking site.",
          "Advise return only for a high fever.",
          "Allow flying the day after discharge.",
        ],
        feedback: [
          "Red flags cover pneumothorax, empyema, and pulmonary embolism.",
          "Breathlessness and chest pain can be a pneumothorax or embolism, not only infection.",
          "Air trapped in the chest expands at altitude; flying is usually delayed about two weeks after a clear X-ray.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Surveillance plan", description: "Define the imaging surveillance schedule.",
        choices: [
          "Arrange CT surveillance every 6 months for 2 years, then yearly, per the thoracic oncology guideline.",
          "Stop surveillance at one year if the first scan is clear.",
          "Use chest X-ray alone for surveillance.",
        ],
        feedback: [
          "CT surveillance finds recurrence and second primaries while they are treatable.",
          "Most recurrences occur in the first 2 to 3 years.",
          "A plain X-ray misses small recurrences.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Manage the chest drain", description: "Track the air leak and drainage.",
        choices: [
          "Manage the chest drain with water-seal, monitoring for air leak and output.",
          "Remove the drain immediately after surgery.",
          "Leave the drain on high suction indefinitely.",
        ],
        feedback: [
          "The drain is managed to allow the lung to re-expand.",
          "Early removal risks a pneumothorax and undrained blood.",
          "Prolonged suction delays sealing of the air leak.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Monitor oxygenation", description: "The remaining lung must compensate.",
        choices: [
          "Monitor oxygenation closely and manage secretions and pain for lung expansion.",
          "Check oxygen only if the patient complains.",
          "Keep the patient sedated to reduce oxygen demand.",
        ],
        feedback: [
          "Oxygenation is monitored and the lung is kept expanded.",
          "Intermittent checks miss a developing hypoxia.",
          "Sedation promotes atelectasis.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan analgesia", description: "Control pain for lung expansion.",
        choices: [
          "Use thoracic epidural or intercostal blocks with multimodal analgesia.",
          "Rely on oral opioids only.",
          "Keep the patient comfortable with high-dose sedation.",
        ],
        feedback: [
          "Regional analgesia supports deep breathing and coughing.",
          "Oral opioids alone often fail after a thoracotomy.",
          "Sedation suppresses the respiratory drive.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Watch for atrial fibrillation", description: "Post-thoracotomy arrhythmia is common.",
        choices: [
          "Monitor the rhythm and treat new atrial fibrillation promptly.",
          "Ignore brief rhythm changes.",
          "Start antiarrhythmics for every patient.",
        ],
        feedback: [
          "Arrhythmia is detected and treated early.",
          "Ignoring rhythm changes risks hemodynamic compromise.",
          "Blanket prophylaxis is not indicated for every patient.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
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
  // WHIPPLE PROCEDURE
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "whipple",
    spec: {
      approach: "a midline laparotomy for pancreaticoduodenectomy",
      wrongApproaches: ["a left subcostal approach", "a thoracoabdominal approach"],
      landmark: "the superior mesenteric artery and the portal vein",
      wrongLandmarks: ["the celiac trunk alone", "the splenic artery"],
      vessel: "the gastroduodenal artery and the portal vein",
      wrongVessels: ["the aorta", "the middle colic artery"],
      nerve: "the retroperitoneal nerves around the SMA",
      wrongNerves: ["the phrenic nerve", "the sciatic nerve"],
      structure: "the pancreatic head, duodenum, and the reconstruction",
      wrongStructures: ["the spleen", "the left kidney"],
      test: "a check of the anastomoses and the SMA margin",
      wrongTests: ["a routine liver biopsy", "an on-table MRI"],
      risks: ["infection", "hemorrhage", "cardiac_arrhythmia", "hypoxia", "thrombosis", "nerve_injury", "anaphylaxis"],
      instrument: "a vascular stapler and a self-retaining retractor",
      position: "supine",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "67-year-old, pancreatic head mass, jaundice, weight loss, diabetic",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the imaging, the biliary drainage, and the staging." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "A long clean-contaminated case demands timely prophylaxis." },
      { kind: "position", title: "Position the patient", description: "Supine with the epigastrium exposed.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Make the incision", description: "Choose the laparotomy approach.", f: { wrongApproaches: ["a left subcostal approach", "a thoracoabdominal approach"] } },
      {
        kind: "exposure", title: "Explore the abdomen", description: "Assess resectability and look for metastasis.",
        f: { structure: "the peritoneal cavity", landmark: "the liver and the peritoneum" },
        choices: [
          "Systematically examine the liver, peritoneum, and omentum for metastasis, and assess the SMA, SMV, and portal vein before committing to resection.",
          "Commit to resection immediately based on the preoperative staging scans.",
          "Palpate only the pancreatic head and begin the Kocher maneuver.",
        ],
        feedback: [
          "The staging laparotomy is complete; the disease is resectable with clear margins.",
          "Skipping the staging laparotomy risks resecting a patient with occult metastasis.",
          "A limited palpation can miss liver or peritoneal disease that changes the plan.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "landmark", title: "Assess the tumor-vessel relationship", description: "Determine resectability.",
        choices: [
          "Assess the relationship of the tumor to the SMA, SMV, and portal vein before committing to resection.",
          "Start the resection — the imaging was clear.",
          "Resect the tumor en bloc regardless of vessel involvement.",
        ],
        feedback: [
          "Resectability is confirmed intraoperatively.",
          "Committing without assessment risks an incomplete resection.",
          "En bloc resection of involved vessels without planning is dangerous.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vessel", title: "Control the gastroduodenal artery", description: "Secure the arterial inflow to the specimen.",
        choices: [
          "Isolate and ligate the gastroduodenal artery with a test clamp and pulse check.",
          "Ligate the larger artery running along the upper border of the pancreas as the GDA.",
          "Ligate the gastroduodenal artery blindly.",
        ],
        feedback: [
          "The gastroduodenal artery is controlled with the hepatic artery confirmed.",
          "Ligating the hepatic artery devascularizes the liver.",
          "Blind ligation risks the common hepatic artery.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "core", title: "Divide the stomach or duodenum", description: "Set the proximal margin.",
        choices: [
          "Divide the duodenum distal to the pylorus, preserving the stomach where oncologically appropriate.",
          "Divide the stomach at the antrum as routine.",
          "Divide the duodenum at the ligament of Treitz.",
        ],
        feedback: [
          "The proximal margin is set correctly for the case.",
          "Routine antrectomy is not needed for every Whipple.",
          "Dividing at the ligament leaves the specimen attached distally.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Divide the pancreas", description: "Transect the pancreatic neck.",
        choices: [
          "Divide the pancreatic neck over the portal vein with careful hemostasis.",
          "Divide the pancreas with a stapler through the head.",
          "Cut the pancreas blindly to speed the resection.",
        ],
        feedback: [
          "The neck is divided cleanly over the portal vein.",
          "Stapling the pancreatic head risks the portal vein.",
          "Blind division risks the splenic and portal vessels.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vessel", title: "Control the portal vein and SMV", description: "Free the specimen from the venous structures.",
        choices: [
          "Dissect the portal vein and SMV off the pancreatic head with a vascular loop control.",
          "Staple across the portal vein to free the specimen.",
          "Pull the specimen off the vein with traction.",
        ],
        feedback: [
          "The veins are dissected free under loop control.",
          "Stapling the portal vein is fatal without reconstruction.",
          "Traction tears the thin-walled vein.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "bleed", title: "Control a portal vein tear", description: "The portal vein is bleeding during the dissection.",
        choices: [
          "Apply pressure, obtain proximal and distal control, and repair the tear with fine sutures.",
          "Pack the area and close the abdomen.",
          "Apply clips to the tear.",
        ],
        feedback: [
          "The venous injury is controlled and repaired.",
          "Packing alone risks ongoing loss and thrombosis.",
          "Clipping a venous tear is ineffective.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "core", title: "Divide the uncinate process", description: "Free the specimen from the SMA.",
        choices: [
          "Divide the uncinate process off the SMA with careful ligation of the small branches.",
          "Staple across the SMA margin.",
          "Cauterize the uncinate attachments.",
        ],
        feedback: [
          "The uncinate is divided with the SMA margin clear.",
          "Stapling across the SMA risks a positive margin or arterial injury.",
          "Cautery on the uncinate risks the small arterial branches.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "nerve", title: "Protect the retroperitoneal nerves", description: "Dissection along the SMA risks the autonomic plexus.",
        choices: [
          "Dissect the SMA margin with the nerve plexus managed deliberately.",
          "Widen the dissection to include all retroperitoneal tissue.",
          "Cauterize the tissue along the SMA.",
        ],
        feedback: [
          "The dissection balances the margin with the nerve function.",
          "Wide dissection causes severe diarrhea and poor quality of life.",
          "Cautery along the SMA risks the artery.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "verify", title: "Check the SMA margin", description: "Confirm the margin on the specimen.",
        choices: [
          "Ink the SMA margin, send it for frozen section, and clear the tissue off the right side of the SMA under direct vision.",
          "Pull the specimen off the SMA with blunt traction to include more tissue.",
          "Clear the margin with the energy device flush against the SMA wall.",
        ],
        feedback: [
          "The SMA margin is the one most often involved; frozen section guides further clearance.",
          "Blunt traction tears SMA branches and the first jejunal vein.",
          "Energy flush on the SMA wall can injure the artery, causing delayed bleeding or thrombosis.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "core", title: "Reconstruct the pancreaticojejunostomy", description: "Restore the pancreatic drainage.",
        choices: [
          "Create a tension-free pancreaticojejunostomy with duct-to-mucosa technique.",
          "Oversew the pancreatic stump without a reconstruction.",
          "Anastomose the pancreas to the stomach without duct stenting.",
        ],
        feedback: [
          "A duct-to-mucosa anastomosis is created.",
          "Oversewing the stump causes a pancreatic leak and fistula.",
          "The reconstruction must drain into the jejunum with a secure technique.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "core", title: "Reconstruct the hepaticojejunostomy", description: "Restore the biliary drainage.",
        choices: [
          "Create a tension-free hepaticojejunostomy to the Roux limb.",
          "Run the duct stitch deep enough to include the artery branch lying behind the duct.",
          "Ligate the common hepatic duct and rely on collaterals.",
        ],
        feedback: [
          "The biliary anastomosis is created to the Roux limb.",
          "The right hepatic artery runs behind the duct; catching it bleeds or devascularizes the duct.",
          "Ligating the duct causes cholangitis and jaundice.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "core", title: "Reconstruct the gastrojejunostomy", description: "Restore the alimentary continuity.",
        choices: [
          "Create the gastrojejunostomy with the correct orientation of the Roux limb.",
          "Connect the stomach directly to the bile duct limb.",
          "Skip the gastrojejunostomy — the stomach will drain on its own.",
        ],
        feedback: [
          "The alimentary reconstruction is complete and correctly oriented.",
          "Wrong orientation causes bile reflux and obstruction.",
          "Skipping the anastomosis causes gastric outlet obstruction.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "bleed", title: "Check for bleeding at the reconstruction", description: "The field is oozing after the anastomoses.",
        choices: [
          "Confirm hemostasis at all anastomoses and the retroperitoneum before closure.",
          "Close and plan to observe the hemoglobin.",
          "Pack the abdomen and close.",
        ],
        feedback: [
          "Hemostasis is confirmed before closure.",
          "Closing over oozing risks a postoperative hemorrhage.",
          "Packing a completed Whipple is a last resort that risks infection.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "verify", title: "Re-check the anastomotic perfusion", description: "Confirm the perfusion of the bowel and the stomach limbs.",
        choices: [
          "Check each anastomosis for pink, bleeding edges and no tension, and confirm hepatic artery flow on Doppler.",
          "Accept a dusky jejunal limb, since it usually pinks up after closure.",
          "Tighten the anastomotic sutures further to make the joins more secure.",
        ],
        feedback: [
          "Well-perfused, tension-free joins heal; Doppler confirms the hepatic artery was not compromised.",
          "A dusky limb will leak; it needs revision now.",
          "Over-tight sutures strangle the edges and cause ischemic leaks.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "verify", title: "Inspect the retroperitoneum", description: "Check the retroperitoneal bed for bleeding.",
        choices: [
          "Inspect the retroperitoneal bed along the aorta and vena cava and control any bleeding before reconstruction.",
          "Close the abdomen and rely on the drains to reveal retroperitoneal bleeding.",
          "Close over a retroperitoneal drain to manage any delayed oozing.",
        ],
        feedback: [
          "The retroperitoneal bed is verified dry against the great vessels before the reconstruction begins.",
          "Drains reveal a retroperitoneal bleed only after it has collected — the bed must be seen now.",
          "A drain does not stop a retroperitoneal bleed and adds an infection risk — verify the bed is dry.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "bleed", title: "Control an anastomotic bleeder", description: "An anastomotic suture line is bleeding.", f: { vessel: "the anastomotic vessels", wrongVessels: ["the aorta", "the portal vein"] } },
      {
        kind: "verify", title: "Confirm the drain positions", description: "Check the drains are placed at the anastomoses.",
        choices: [
          "Place a closed-suction drain beside the pancreatic and biliary anastomoses, clear of the vessels, and secure it at the skin.",
          "Place the drain tip on the gastroduodenal artery stump for the best drainage.",
          "Use an open corrugated drain through the main wound.",
        ],
        feedback: [
          "A drain beside the pancreatic anastomosis detects and controls a fistula.",
          "A drain eroding the GDA stump causes a sentinel bleed and pseudoaneurysm rupture.",
          "Open drains through the wound raise infection and do not measure the output.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "closure", title: "Place drains and close", description: "Drain the anastomoses and close.", f: { structure: "the drains and the abdominal wall" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major pancreatic surgery carries a high thrombosis risk." },
      {
        kind: "postop", title: "Watch for delayed gastric emptying", description: "Monitor the gastric emptying after the reconstruction.",
        choices: [
          "Keep the NG tube while the output is high, start a prokinetic such as erythromycin, and advance the diet as it settles.",
          "Remove the NG tube and start a full diet on day 1 whatever the output.",
          "Take him back to theater for a presumed obstruction on day 3.",
        ],
        feedback: [
          "Delayed gastric emptying is common after a Whipple and usually settles with decompression and prokinetics.",
          "Feeding through a high NG output causes vomiting and aspiration.",
          "Delayed emptying is managed conservatively; early re-operation adds morbidity.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Monitor the drains daily", description: "Track the drain output and the amylase.",
        choices: [
          "Measure the drain volume and amylase on day 3, and keep the drain if the amylase is over 3 times the serum level.",
          "Remove the drains on day 1 whatever the output.",
          "Put the drains on high-pressure wall suction to keep them empty.",
        ],
        feedback: [
          "Drain amylase on day 3 identifies a pancreatic fistula.",
          "Removing the drains before checking the amylase misses a fistula, which then collects.",
          "Wall suction on a drain beside the GDA stump erodes it and causes bleeding.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Glucose control", description: "Manage the diabetes and the stress hyperglycemia.",
        choices: [
          "Check capillary glucose every 4 to 6 hours and use a variable-rate insulin infusion if it stays above 10 mmol/L (180 mg/dL).",
          "Treat the glucose only once it goes above 20 mmol/L (360 mg/dL).",
          "Give a fixed high dose of long-acting insulin from day 1.",
        ],
        feedback: [
          "Pancreatic resection causes new diabetes; close monitoring prevents both highs and lows.",
          "Sustained hyperglycemia raises infection and fistula rates.",
          "Fixed insulin while he is not eating causes hypoglycemia, which provokes arrhythmias.",
        ],
        wrongComps: ["infection", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Nutrition support", description: "Start the early enteral or parenteral nutrition.",
        choices: [
          "Start enteral feeding within 48 hours by mouth or feeding jejunostomy, with pancreatic enzyme replacement at meals.",
          "Keep him nil by mouth on IV fluids alone until the drains are out.",
          "Start total parenteral nutrition as routine on day 1.",
        ],
        feedback: [
          "Early enteral feeding with enzymes reduces infection and supports healing.",
          "Prolonged starvation delays healing and raises infection.",
          "Routine TPN adds a central line, with its infection and thrombosis risk, and no benefit when the gut works.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Watch for cholangitis", description: "Monitor for fever and jaundice suggesting cholangitis.",
        choices: [
          "Watch for fever, rigors, and jaundice, and send blood cultures, liver tests, and imaging of the hepaticojejunostomy if they appear.",
          "Treat a fever as atelectasis with physiotherapy and no cultures.",
          "Start long-term prophylactic antibiotics for every Whipple patient.",
        ],
        feedback: [
          "Cholangitis after a hepaticojejunostomy needs cultures, antibiotics, and imaging for a stricture or leak.",
          "Missed cholangitis progresses to biliary sepsis.",
          "Routine long-term antibiotics select resistant organisms and risk drug reactions without preventing strictures.",
        ],
        wrongComps: ["infection", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.",
        choices: [
          "Sit him out of bed on day 1 and walk on day 2 with physiotherapy, alongside LMWH.",
          "Keep him in bed until the drains are removed.",
          "Hold the LMWH until he is fully mobile.",
        ],
        feedback: [
          "Early mobilization reduces DVT, pneumonia, and ileus.",
          "Bed rest leads to atelectasis and pneumonia and raises DVT risk.",
          "Cancer surgery calls for LMWH now and for about 4 weeks after discharge.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the oncology plan.",
        choices: [
          "Review at 2 weeks with the histology, refer for adjuvant chemotherapy, and continue pancreatic enzymes and extended LMWH.",
          "Stop the LMWH at discharge rather than completing 4 weeks.",
          "Remove the remaining drain in clinic without checking its amylase.",
        ],
        feedback: [
          "Adjuvant chemotherapy should start within about 12 weeks, and extended prophylaxis covers the cancer-related clot risk.",
          "Extended LMWH after major cancer surgery halves late venous thromboembolism.",
          "An undrained pancreatic fistula collects and becomes an abscess.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Monitor for pancreatic fistula", description: "The highest-risk complication.",
        choices: [
          "Monitor the drain amylase and the clinical course for a pancreatic leak.",
          "Check the drain only if the patient deteriorates.",
          "Remove the drains immediately after surgery.",
        ],
        feedback: [
          "A pancreatic fistula is detected early.",
          "Waiting for deterioration delays treatment of a leak.",
          "Early drain removal hides a developing fistula.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Monitor for hemorrhage", description: "Late bleeding can occur from the anastomoses.",
        choices: [
          "Monitor the hemoglobin, vitals, and the drains for signs of delayed hemorrhage.",
          "Check the hemoglobin only at discharge.",
          "Ignore minor drops in the hemoglobin.",
        ],
        feedback: [
          "Delayed hemorrhage is detected early.",
          "Intermittent checks miss a developing bleed.",
          "Ignoring hemoglobin drops risks a late sentinel bleed.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Plan nutrition and follow-up", description: "Support the recovery.",
        choices: [
          "Start enteral or parenteral nutrition support and arrange oncology follow-up with the pathology.",
          "Keep the patient fasting until discharge.",
          "Discharge to the GP and ask them to chase the pathology result.",
        ],
        feedback: [
          "Nutrition support and oncology follow-up are arranged.",
          "Prolonged fasting delays recovery.",
          "Adjuvant chemotherapy decisions need the surgical and oncology teams; handing the pathology to the GP delays them.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },
];
