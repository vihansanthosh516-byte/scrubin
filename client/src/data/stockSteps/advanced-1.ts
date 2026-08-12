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
      risks: ["cardiac_arrhythmia", "hemorrhage", "hypoxia", "thrombosis"],
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
      { kind: "exposure", title: "Open the pericardium", description: "Create a pericardial well and identify the heart.", f: { structure: "the pericardium", landmark: "the aorta and the right atrium" } },
      {
        kind: "core", title: "Harvest the LIMA", description: "Take down the left internal mammary artery.",
        choices: [
          "Harvest the LIMA as a pedicle, protecting the phrenic nerve and confirming flow.",
          "Harvest the LIMA with wide electrocautery along its length.",
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
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
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
      { kind: "verify", title: "Confirm the hemostasis with protamine", description: "Reverse the heparin and confirm the field stays dry.", f: { test: "the field after protamine", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      { kind: "exposure", title: "Check the LIMA bed", description: "Inspect the LIMA harvest bed for bleeding.", f: { structure: "the LIMA bed", landmark: "the internal thoracic vessels" } },
      { kind: "bleed", title: "Control a graft bed bleeder", description: "The vein harvest site is bleeding.", f: { vessel: "the harvest site vessels", wrongVessels: ["the femoral artery", "the aorta"] } },
      { kind: "verify", title: "Confirm the rhythm", description: "Check the rhythm is stable before closure.", f: { test: "the cardiac rhythm and the pacing", wrongTests: ["a routine ECG", "a CT scan"] } },
      { kind: "closure", title: "Close the sternum", description: "Wire the sternum and close the layers.", f: { structure: "the sternum and the soft tissues" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Cardiac surgery carries a high thrombosis risk." },
      { kind: "postop", title: "Watch for low cardiac output", description: "Monitor the hemodynamics for low output.", f: { test: "the cardiac output and the filling pressures", wrongTests: ["a routine ECG", "a CT scan"] } },
      { kind: "postop", title: "Manage atrial fibrillation", description: "Treat new postoperative atrial fibrillation.", f: { test: "the rhythm and the rate control", wrongTests: ["a routine ECG", "a CT scan"] } },
      { kind: "postop", title: "Pulmonary hygiene", description: "Plan the breathing exercises and the extubation.", f: { test: "the respiratory status", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Renal protection", description: "Monitor the renal function after the bypass.", f: { test: "the urine output and the creatinine", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Sternal precautions", description: "Teach the sternal precautions for healing.", f: { test: "the sternal precautions", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Discharge and follow-up", description: "Plan the discharge and the cardiology follow-up.", f: { test: "the discharge criteria and the follow-up", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
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
          "Skipping rehab delays functional recovery.",
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
      wrongApproaches: ["a posterior fossa craniectomy as routine", "a transnasal approach"],
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
      risks: ["hemorrhage", "hypoxia", "nerve_injury", "cardiac_arrhythmia"],
      instrument: "a craniotome and an ultrasonic aspirator",
      position: "supine with the head fixed and rotated",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "41-year-old, headache, left-sided weakness, 4 cm right frontal mass",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the MRI, the navigation, and the eloquent-area plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Bone and implant work demands timely prophylaxis." },
      { kind: "position", title: "Position and fix the head", description: "Supine with the head rotated and pinned.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Plan the skin incision", description: "Plan the incision for the frontal craniotomy.", f: { wrongApproaches: ["a posterior fossa approach", "a transnasal approach"] } },
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
        wrongComps: ["hemorrhage", "nerve_injury"],
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
      { kind: "verify", title: "Confirm the hemostasis under irrigation", description: "Irrigate and confirm the cavity is dry.", f: { test: "the cavity under irrigation", wrongTests: ["a routine CT", "an on-table MRI"] } },
      { kind: "exposure", title: "Check the cortical veins", description: "Re-inspect the draining veins for patency.", f: { structure: "the cortical veins", landmark: "the sagittal sinus" } },
      { kind: "bleed", title: "Control a bone-edge bleeder", description: "The bone edges are oozing.", f: { vessel: "the bone edge vessels", wrongVessels: ["the middle meningeal artery", "the internal carotid artery"] } },
      { kind: "verify", title: "Confirm the brain relaxation", description: "Check the brain is not tense before closure.", f: { test: "the brain relaxation", wrongTests: ["a routine CT", "an ultrasound"] } },
      { kind: "closure", title: "Replace the bone flap", description: "Fix the bone flap and close the scalp.", f: { structure: "the bone flap and scalp" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Neurosurgical patients are high-risk for thrombosis." },
      { kind: "postop", title: "Seizure prophylaxis plan", description: "Define the seizure prophylaxis for the craniotomy.", f: { test: "the seizure prophylaxis plan", wrongTests: ["a routine EEG", "a CT scan"] } },
      { kind: "postop", title: "Watch for new deficits", description: "Monitor the neurologic exam closely.", f: { test: "the neurologic exam", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Fluid management", description: "Manage the fluids to protect the brain.", f: { test: "the fluid balance and the sodium", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Anticonvulsant levels", description: "Monitor the anticonvulsant levels if started.", f: { test: "the anticonvulsant levels", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Wound care", description: "Define the scalp wound care.", f: { test: "the scalp wound", wrongTests: ["a routine CT", "an ultrasound"] } },
      { kind: "postop", title: "Watch for CSF leak", description: "Monitor the wound for a CSF leak.", f: { test: "the wound for CSF", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Mobilization plan", description: "Define the early mobilization with the deficits.", f: { test: "the mobilization tolerance", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the imaging.", f: { test: "the pathology and the imaging at follow-up", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the seizure plan, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine CT", "a blood panel"] } },
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
          "No rehabilitation is needed after a craniotomy.",
          "Restrict the patient to bed rest for a week.",
        ],
        feedback: [
          "Rehabilitation addresses the postoperative deficits.",
          "Skipping rehab delays recovery.",
          "Bed rest increases thrombosis and deconditioning.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Plan the pathology and follow-up", description: "Coordinate the oncology plan.",
        choices: [
          "Arrange follow-up with the pathology result and the oncology team.",
          "No follow-up is needed after the resection.",
          "Schedule a routine repeat MRI in one month regardless.",
        ],
        feedback: [
          "The pathology guides the adjuvant plan.",
          "Skipping follow-up delays treatment decisions.",
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
      risks: ["nerve_injury", "hemorrhage", "infection", "thrombosis"],
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
          "Palpation alone is unreliable in the obese or deep back.",
        ],
        wrongComps: ["nerve_injury", "infection"],
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
          "Oversized screws can breach the pedicle wall.",
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
          "Advancing through resistance can breach into the canal.",
          "Skipping stimulation risks a silent root injury.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
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
          "Burring to the dura without vision risks a dural tear.",
          "Fusing without decompression leaves the radiculopathy.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
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
          "Cauterizing the dura causes a dural tear.",
          "Bone wax in the epidural space causes a mass effect.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
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
          "Aggressive reaming violates the endplates.",
          "Blind rongeur use risks the thecal sac.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Place the interbody cage", description: "Restore the disc height.",
        choices: [
          "Place the cage with the correct size and position, confirmed by fluoroscopy.",
          "Impact the largest cage that fits.",
          "Place the cage off-midline for better purchase.",
        ],
        feedback: [
          "The cage is placed in the correct position and size.",
          "Oversized cages risk endplate fracture and nerve stretch.",
          "Off-midline placement risks root injury.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Rod the construct", description: "Connect the screws.",
        choices: [
          "Place the rods and lock them with the correct sagittal alignment.",
          "Compress the construct forcefully for maximum lordosis.",
          "Place the rods without checking the alignment.",
        ],
        feedback: [
          "The rods are placed with correct alignment.",
          "Forceful compression can cause a listhesis or root stretch.",
          "Unchecked alignment leaves a poor sagittal balance.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "verify", title: "Test the construct", description: "Confirm the implant position.",
        choices: [
          "Check the final X-ray for screw and cage position and obtain a wake-up test if monitoring is unreliable.",
          "Trust the placement and close.",
          "Skip the final imaging to save time.",
        ],
        feedback: [
          "The construct is confirmed on imaging.",
          "Skipping the check risks a misplaced screw left behind.",
          "Final imaging is standard before closing a fusion.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      { kind: "vessel", title: "Protect the segmental vessels", description: "The segmentals cross the mid-vertebral body.", f: { vessel: "the segmental vessels", wrongVessels: ["the aorta", "the iliac artery"] } },
      { kind: "verify", title: "Confirm the screws on final imaging", description: "Re-check the screw positions on the final fluoroscopy.", f: { test: "the screw positions on the final image", wrongTests: ["an on-table MRI", "a CT scan"] } },
      { kind: "exposure", title: "Check the decompression", description: "Confirm the thecal sac is free of compression.", f: { structure: "the thecal sac", landmark: "the laminectomy edges" } },
      { kind: "bleed", title: "Control a muscle bleeder", description: "The paraspinal muscle is bleeding.", f: { vessel: "the paraspinal vessels", wrongVessels: ["the aorta", "the iliac artery"] } },
      { kind: "verify", title: "Confirm the neuromonitoring signals", description: "Re-check the motor and sensory signals before closure.", f: { test: "the neuromonitoring signals", wrongTests: ["a nerve conduction study", "a CT scan"] } },
      { kind: "closure", title: "Close the wound", description: "Close the fascia, subcutaneous layer, and skin.", f: { structure: "the thoracolumbar fascia and skin" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Spinal surgery patients are high-risk for thrombosis." },
      { kind: "postop", title: "Watch for hematoma", description: "Monitor for a spinal epidural hematoma.", f: { test: "the neuro exam for a new deficit", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Wound drainage", description: "Define the drain management.", f: { test: "the drain output", wrongTests: ["a routine X-ray", "a blood panel"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the back.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Log-roll training", description: "Teach the log-roll technique for the staff and the patient.", f: { test: "the log-roll technique", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Watch for infection", description: "Monitor the wound and the inflammatory markers.", f: { test: "the wound and the inflammatory markers", wrongTests: ["a routine CT scan", "a blood panel"] } },
      { kind: "postop", title: "Bowel and bladder monitoring", description: "Assess the bowel and bladder function after the surgery.", f: { test: "the bowel and bladder function", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Bracing plan", description: "Define the brace use if prescribed.", f: { test: "the brace plan", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the X-ray follow-up for the fusion.", f: { test: "the fusion on X-ray", wrongTests: ["a routine MRI", "a bone scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the lifting precautions and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
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
          "Delayed dressing changes hide wound breakdown.",
        ],
        wrongComps: ["infection", "nerve_injury"],
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
          "Unrestricted activity stresses the construct.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the imaging and clinic plan.",
        choices: [
          "Arrange follow-up with X-rays at 6 weeks and 3 months to assess fusion.",
          "No follow-up is needed after a fusion.",
          "Schedule an MRI at one month as routine.",
        ],
        feedback: [
          "Serial X-rays track fusion.",
          "Skipping follow-up misses non-union and hardware failure.",
          "Routine MRI is not indicated for fusion assessment.",
        ],
        wrongComps: ["infection", "nerve_injury"],
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
      risks: ["hemorrhage", "cardiac_arrhythmia", "infection", "hypoxia"],
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
      { kind: "verify", title: "Re-check the packing sites", description: "Confirm the packs are placed at the bleeding sites.", f: { test: "the packing sites", wrongTests: ["a routine CT", "an on-table MRI"] } },
      { kind: "exposure", title: "Assess the bowel viability", description: "Check the bowel that was injured for viability.", f: { structure: "the injured bowel", landmark: "the mesenteric edge" } },
      { kind: "bleed", title: "Control a mesenteric bleeder", description: "A mesenteric vessel is bleeding again.", f: { vessel: "the mesenteric vessels", wrongVessels: ["the aorta", "the iliac artery"] } },
      { kind: "verify", title: "Confirm the resuscitation parameters", description: "Check the temperature, the pH, and the coagulation before closing.", f: { test: "the temperature, pH, and coagulation", wrongTests: ["a routine CT", "a blood panel"] } },
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
      { kind: "postop", title: "Watch for abdominal compartment syndrome", description: "Monitor the bladder pressure and the ventilation.", f: { test: "the bladder pressure", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Transfusion plan", description: "Define the transfusion goals and the monitoring.", f: { test: "the hemoglobin and the coagulation", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Rewarming plan", description: "Plan the active rewarming in the ICU.", f: { test: "the core temperature", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Ventilator management", description: "Define the ventilation strategy for the resuscitation.", f: { test: "the ventilation parameters", wrongTests: ["a routine chest X-ray", "a blood panel"] } },
      { kind: "postop", title: "Renal support", description: "Monitor the urine output and the renal function.", f: { test: "the urine output and the creatinine", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Coagulation management", description: "Correct the coagulopathy with the blood products.", f: { test: "the coagulation panel", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Watch for sepsis", description: "Monitor for the signs of developing sepsis.", f: { test: "the infection markers", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Nutrition support", description: "Start the early nutritional support.", f: { test: "the nutritional plan", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Family communication", description: "Coordinate the family updates on the damage-control course.", f: { test: "the family communication", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Planned re-exploration timing", description: "Set the timing and the criteria for the second look.", f: { test: "the re-exploration criteria", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Skin and wound protection", description: "Protect the open abdomen and the skin edges.", f: { test: "the abdominal wound", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Analgesia plan", description: "Plan the analgesia for the ventilated patient.", f: { test: "the sedation and the analgesia", wrongTests: ["a routine CT", "a blood panel"] } },
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
        wrongComps: ["infection", "hemorrhage"],
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
      risks: ["hypoxia", "hemorrhage", "cardiac_arrhythmia", "infection"],
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
      { kind: "exposure", title: "Divide the fissures", description: "Complete the fissures to expose the hilum.", f: { structure: "the major and minor fissures", landmark: "the interlobar artery" } },
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
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
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
          "Staple the main bronchus to ensure a complete resection.",
          "Suture the bronchus closed with a running stitch.",
        ],
        feedback: [
          "The lobar bronchus is stapled at the correct level.",
          "Stapling the main bronchus removes more lung than intended.",
          "A running suture on the bronchus risks a stump leak.",
        ],
        wrongComps: ["infection", "hypoxia"],
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
      { kind: "verify", title: "Re-inflate the remaining lobes", description: "Confirm the remaining lobes re-expand fully.", f: { test: "the re-expansion of the remaining lobes", wrongTests: ["a routine chest X-ray", "an on-table MRI"] } },
      { kind: "exposure", title: "Check the bronchial stump once more", description: "Re-inspect the stump for any leak under pressure.", f: { structure: "the bronchial stump", landmark: "the carina" } },
      { kind: "bleed", title: "Control a chest wall bleeder", description: "A chest wall vessel is bleeding at the port site.", f: { vessel: "the intercostal vessels at the port site", wrongVessels: ["the pulmonary artery", "the aorta"] } },
      { kind: "verify", title: "Confirm the drain position", description: "Check the chest drain is positioned correctly.", f: { test: "the drain position and the function", wrongTests: ["a routine chest X-ray", "an on-table MRI"] } },
      { kind: "closure", title: "Place the drains and close", description: "Drain the chest and close the ports.", f: { structure: "the chest drain and port sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Thoracic surgery carries a significant thrombosis risk." },
      { kind: "postop", title: "Watch for a persistent air leak", description: "Monitor the drain for a prolonged air leak.", f: { test: "the air leak duration", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Chest physiotherapy", description: "Start the breathing exercises early.", f: { test: "the respiratory effort", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.", f: { test: "the mobilization tolerance", wrongTests: ["a routine chest X-ray", "a blood panel"] } },
      { kind: "postop", title: "Wound care", description: "Define the port site care.", f: { test: "the port sites", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Pulmonary rehabilitation", description: "Refer for pulmonary rehabilitation.", f: { test: "the exercise tolerance", wrongTests: ["a routine chest X-ray", "a stress test"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the chest X-ray and the pathology.", f: { test: "the chest X-ray and the pathology", wrongTests: ["a routine MRI", "a CT scan"] } },
      { kind: "postop", title: "Smoking cessation", description: "Discuss smoking cessation with the patient.", f: { test: "the smoking cessation plan", wrongTests: ["a routine chest X-ray", "a blood panel"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the drain care, the medications, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine chest X-ray", "a CT scan"] } },
      { kind: "postop", title: "Surveillance plan", description: "Define the imaging surveillance schedule.", f: { test: "the surveillance imaging", wrongTests: ["a routine blood panel", "a CT scan"] } },
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
          "No follow-up is needed after a lobectomy.",
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
      risks: ["infection", "hemorrhage", "cardiac_arrhythmia", "hypoxia", "thrombosis"],
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
      { kind: "exposure", title: "Explore the abdomen", description: "Assess resectability and look for metastasis.", f: { structure: "the peritoneal cavity", landmark: "the liver and the peritoneum" } },
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
          "Ligate the hepatic artery by mistake.",
          "Ligate the gastroduodenal artery blindly.",
        ],
        feedback: [
          "The gastroduodenal artery is controlled with the hepatic artery confirmed.",
          "Ligating the hepatic artery devascularizes the liver.",
          "Blind ligation risks the common hepatic artery.",
        ],
        wrongComps: ["hemorrhage", "infection"],
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
        wrongComps: ["hemorrhage", "thrombosis"],
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
      { kind: "verify", title: "Check the SMA margin", description: "Confirm the margin on the specimen.", f: { test: "the SMA groove margin on the specimen", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
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
          "Anastomose the bile duct to the stomach.",
          "Ligate the common hepatic duct and rely on collaterals.",
        ],
        feedback: [
          "The biliary anastomosis is created to the Roux limb.",
          "A biliary-gastric anastomosis is not standard.",
          "Ligating the duct causes cholangitis and jaundice.",
        ],
        wrongComps: ["infection", "hemorrhage"],
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
      { kind: "verify", title: "Re-check the anastomotic perfusion", description: "Confirm the perfusion of the bowel and the stomach limbs.", f: { test: "the perfusion of the anastomotic limbs", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      { kind: "exposure", title: "Inspect the retroperitoneum", description: "Check the retroperitoneal bed for bleeding.", f: { structure: "the retroperitoneal bed", landmark: "the aorta and the vena cava" } },
      { kind: "bleed", title: "Control an anastomotic bleeder", description: "An anastomotic suture line is bleeding.", f: { vessel: "the anastomotic vessels", wrongVessels: ["the aorta", "the portal vein"] } },
      { kind: "verify", title: "Confirm the drain positions", description: "Check the drains are placed at the anastomoses.", f: { test: "the drain positions", wrongTests: ["a routine liver biopsy", "an on-table MRI"] } },
      { kind: "closure", title: "Place drains and close", description: "Drain the anastomoses and close.", f: { structure: "the drains and the abdominal wall" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Major pancreatic surgery carries a high thrombosis risk." },
      { kind: "postop", title: "Watch for delayed gastric emptying", description: "Monitor the gastric emptying after the reconstruction.", f: { test: "the gastric emptying", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Monitor the drains daily", description: "Track the drain output and the amylase.", f: { test: "the drain amylase and the output", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Glucose control", description: "Manage the diabetes and the stress hyperglycemia.", f: { test: "the blood glucose levels", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Nutrition support", description: "Start the early enteral or parenteral nutrition.", f: { test: "the nutritional plan", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Watch for cholangitis", description: "Monitor for fever and jaundice suggesting cholangitis.", f: { test: "the liver enzymes and the bilirubin", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Mobilization plan", description: "Define the early mobilization.", f: { test: "the mobilization tolerance", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the oncology plan.", f: { test: "the pathology and the oncology plan", wrongTests: ["a routine CT", "a blood panel"] } },
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
          "No follow-up is needed after a Whipple.",
        ],
        feedback: [
          "Nutrition support and oncology follow-up are arranged.",
          "Prolonged fasting delays recovery.",
          "Skipping follow-up misses recurrence and late complications.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },
];
