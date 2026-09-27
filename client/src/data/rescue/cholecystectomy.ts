// Rescue decisions for the laparoscopic cholecystectomy (Sarah J., 42F,
// 78 kg, latex allergy, on apixaban after a DVT last year).

import type { ProcedureRescueBank } from "./types";

export const CHOLECYSTECTOMY_RESCUE: ProcedureRescueBank = {
  hemorrhage: [
    {
      situation: "Sarah is bleeding from the gallbladder region: HR 122, BP 86/50, and she is on apixaban at home.",
      best: {
        text: "Press on the bleeding point, crossmatch, and get the vessel or bed controlled under direct vision.",
        feedback: "Pressure slows the loss while you gain a clear view to clip, suture, or seal the source.",
      },
      decoys: [
        {
          text: "Fire clips into the pooled blood near the hilum until the bleeding appears to slow.",
          feedback: "Clips placed into a pool of blood catch the common bile duct or the right hepatic artery.",
        },
        {
          text: "Raise the pneumoperitoneum to 20 mmHg so that the gas pressure tamponades the bleeding.",
          feedback: "Higher pressure hides the bleeding temporarily and adds CO2 and cardiovascular strain.",
        },
        {
          text: "Give protamine to reverse her anticoagulant, then wait for the bleeding to stop on its own at low pressure.",
          feedback: "Protamine reverses heparin, not apixaban, and waiting leaves the source uncontrolled.",
        },
      ],
    },
    {
      situation: "The field is full of blood, HR 138, BP 72/40, and suction cannot keep up.",
      best: {
        text: "Convert to open surgery, press on the bleeding, start massive transfusion, and give andexanet or PCC.",
        feedback: "An uncontrollable laparoscopic bleed needs open access, blood products, and apixaban reversal.",
      },
      decoys: [
        {
          text: "Keep suctioning laparoscopically, since converting to an open operation would take too long.",
          feedback: "Persisting laparoscopically when you cannot see is how patients exsanguinate.",
        },
        {
          text: "Give tranexamic acid on its own and wait twenty minutes for the bleeding to settle.",
          feedback: "Tranexamic acid supports clots but cannot stop a bleeding artery or reverse apixaban.",
        },
        {
          text: "Start a noradrenaline infusion to bring her pressure up before doing anything else.",
          feedback: "A vasopressor squeezes an empty circulation; she needs control and blood.",
        },
      ],
    },
  ],
  infection: [
    {
      situation: "Sarah has fever 39.1 °C, HR 118, and right upper quadrant pain. Bile has leaked or become infected.",
      best: {
        text: "Take blood cultures, start IV biliary-cover antibiotics, and image the right upper quadrant.",
        feedback: "Cultures and biliary cover treat the sepsis while imaging finds a bile leak or collection to drain.",
      },
      decoys: [
        {
          text: "Give oral co-amoxiclav and book an outpatient ultrasound of the gallbladder bed for next week.",
          feedback: "Biliary sepsis after surgery needs IV treatment and urgent imaging, not an outpatient plan.",
        },
        {
          text: "Give paracetamol and cooling and review her again on tomorrow's ward round.",
          feedback: "Treating the fever alone leaves the infected bile to seed her bloodstream.",
        },
        {
          text: "Give hydrocortisone 200 mg first to damp down the inflammatory response.",
          feedback: "Steroids are reserved for shock that does not respond to vasopressors.",
        },
      ],
    },
    {
      situation: "Imaging shows a bile collection and she is now hypotensive, with a lactate of 4.",
      best: {
        text: "Resuscitate with fluid, drain the collection percutaneously, and arrange ERCP to stop the leak.",
        feedback: "Drainage and ERCP stenting control the source, and resuscitation restores perfusion.",
      },
      decoys: [
        {
          text: "Broaden the antibiotics to meropenem and hold off on any drainage until she looks much more stable.",
          feedback: "Antibiotics cannot sterilize a bile collection; she stabilizes only once it is drained.",
        },
        {
          text: "Take her straight back for an open exploration of the bile duct tonight.",
          feedback: "Percutaneous drainage and ERCP control most leaks without a second major operation on a septic patient.",
        },
        {
          text: "Run eight liters of saline over the next hour to wash out the lactate.",
          feedback: "Unmeasured high-volume fluid floods her lungs.",
        },
      ],
    },
  ],
  hypoxia: [
    {
      situation: "SpO2 is falling through 86% and her airway pressures are rising.",
      best: {
        text: "Give 100% oxygen, let down the pneumoperitoneum, and check the airway and both lungs.",
        feedback: "Releasing the gas frees the diaphragm while the airway check finds aspiration, a tube problem, or collapse.",
      },
      decoys: [
        {
          text: "Tilt her further head-down so the lungs fill with more blood and oxygen.",
          feedback: "Head-down with a full abdomen pushes the diaphragm up and collapses the lung bases.",
        },
        {
          text: "Give furosemide 40 mg IV, assuming that fluid on the lungs is the cause.",
          feedback: "A guessed diagnosis delays finding the real cause of the desaturation.",
        },
        {
          text: "Wait five minutes and repeat the reading, since the probe could be poorly placed.",
          feedback: "A falling saturation with rising pressures is real and will keep falling.",
        },
      ],
    },
    {
      situation: "SpO2 is 78% and her heart rate is slowing despite 100% oxygen.",
      best: {
        text: "Hand-ventilate, suction the tube or reintubate, and recruit the lungs with PEEP.",
        feedback: "Clearing the airway and opening collapsed lung restores oxygenation before she arrests.",
      },
      decoys: [
        {
          text: "Reinsufflate and finish the last part of the procedure, then deal with her breathing afterward.",
          feedback: "Continuing the operation during hypoxic bradycardia leads to cardiac arrest.",
        },
        {
          text: "Give midazolam to slow her breathing so the oxygen has time to work.",
          feedback: "A sedative removes the drive of a tiring, hypoxic patient.",
        },
        {
          text: "Sit her upright on a face mask and give the saturation ten minutes to recover.",
          feedback: "Hypoxic bradycardia is pre-arrest; there is no time to wait.",
        },
      ],
    },
  ],
  anaphylaxis: [
    {
      situation: "Sarah develops hives, wheeze, and a BP of 70/40 after exposure to a trigger.",
      best: {
        text: "Remove every latex item or stop the drug, give epinephrine, 100% oxygen, and a fluid bolus.",
        feedback: "Removing the trigger stops ongoing exposure, and epinephrine reverses the shock and bronchospasm.",
      },
      decoys: [
        {
          text: "Give chlorphenamine and hydrocortisone IV first, then decide about epinephrine.",
          feedback: "Antihistamines and steroids are second-line; only epinephrine reverses anaphylactic shock.",
        },
        {
          text: "Keep the catheter and gloves in place and watch whether the rash settles over the next ten minutes.",
          feedback: "Continued latex contact keeps driving the reaction.",
        },
        {
          text: "Give a salbutamol nebulizer for the wheeze and carry on with the procedure.",
          feedback: "Treating the wheeze alone ignores the shock and the ongoing exposure.",
        },
      ],
    },
    {
      situation: "After the first dose her BP is 58/30 and her tongue and lips are swelling.",
      best: {
        text: "Repeat the epinephrine, start an infusion, and secure her airway before the swelling closes it.",
        feedback: "Refractory anaphylaxis needs an epinephrine infusion, and a swelling airway must be secured early.",
      },
      decoys: [
        {
          text: "Give a second dose of hydrocortisone and wait for the steroid to take effect.",
          feedback: "Steroids take hours; her airway and pressure are failing now.",
        },
        {
          text: "Lie her flat with her legs raised and hold every further drug until her blood pressure has recovered.",
          feedback: "Withholding epinephrine in worsening anaphylaxis is fatal.",
        },
        {
          text: "Give four liters of saline in place of more epinephrine to lift her pressure.",
          feedback: "Fluid supports the circulation but cannot stop the reaction or protect the airway.",
        },
      ],
    },
  ],
  cardiac_arrhythmia: [
    {
      situation: "Her rhythm has changed on the monitor and her pressure is falling, with the abdomen insufflated.",
      best: {
        text: "Release the pneumoperitoneum, check for a pulse, and treat the rhythm by its type with pads on.",
        feedback: "Removing the gas takes away the vagal and CO2 triggers while you treat what the monitor shows.",
      },
      decoys: [
        {
          text: "Give amiodarone 300 mg IV straight away, whatever the rhythm turns out to be.",
          feedback: "Amiodarone worsens bradycardia and heart block.",
        },
        {
          text: "Keep the gas in and finish the dissection first, as the rhythm usually settles.",
          feedback: "The pneumoperitoneum may be causing the arrhythmia; leaving it in keeps the trigger going.",
        },
        {
          text: "Get a 12-lead ECG and wait for a cardiology opinion before treating anything.",
          feedback: "An unstable rhythm needs treatment now.",
        },
      ],
    },
    {
      situation: "Sarah has lost her pulse. There is no cardiac output.",
      best: {
        text: "Release the gas, start compressions, shock if shockable, and give epinephrine every 3–5 minutes.",
        feedback: "Compressions and defibrillation restore circulation, and releasing the gas removes a reversible cause.",
      },
      decoys: [
        {
          text: "Give atropine 3 mg and wait a minute for the rhythm to return before you start chest compressions.",
          feedback: "Every minute without compressions lowers the chance of survival.",
        },
        {
          text: "Keep ventilating and recheck the pulse after a minute to be certain it is gone.",
          feedback: "Long pulse checks delay compressions in a patient already in arrest.",
        },
        {
          text: "Give calcium and bicarbonate first to correct the acidosis before any shock.",
          feedback: "Drugs come after compressions and defibrillation, and only for specific causes.",
        },
      ],
    },
  ],
  fluid_overload: [
    {
      situation: "Crackles are spreading up both lungs, SpO2 89%, and she is four liters positive.",
      best: {
        text: "Stop the IV fluids, sit her up, give oxygen, and give furosemide 40 mg IV.",
        feedback: "Stopping the input and off-loading with a diuretic treat overload pulmonary edema.",
      },
      decoys: [
        {
          text: "Give another fluid bolus in case the low saturation is from poor perfusion.",
          feedback: "More fluid into wet lungs makes the edema worse.",
        },
        {
          text: "Start a morphine infusion to ease her breathlessness overnight.",
          feedback: "An opioid infusion in a hypoxic patient depresses her breathing.",
        },
        {
          text: "Restrict what she drinks but keep the IV drip running at the same rate.",
          feedback: "The drip is the source of the overload and needs to stop.",
        },
      ],
    },
    {
      situation: "She is coughing pink froth, SpO2 84%, and tiring.",
      best: {
        text: "Start CPAP, repeat the furosemide, and move her to a monitored bed to find the cause.",
        feedback: "CPAP pushes fluid out of the alveoli and supports her breathing while the diuretic works.",
      },
      decoys: [
        {
          text: "Keep her on the ward on a high-flow face mask and review her in the morning.",
          feedback: "Pink frothy sputum is severe pulmonary edema and needs monitored pressure support.",
        },
        {
          text: "Give a 250 mL albumin bolus to draw the fluid back into her vessels.",
          feedback: "Albumin adds volume to an already overloaded circulation.",
        },
        {
          text: "Give a beta-blocker to slow her heart so it has longer to fill.",
          feedback: "Beta-blockade in acute edema weakens a heart that is already failing.",
        },
      ],
    },
  ],
  nerve_injury: [
    {
      situation: "In recovery Sarah cannot lift her right arm at the shoulder, and her outer forearm is numb.",
      best: {
        text: "Document the deficit, reposition and pad the arm, and arrange early neurology review.",
        feedback: "This is a stretch injury to the brachial plexus; relieving it and a baseline exam guide recovery.",
      },
      decoys: [
        {
          text: "Reassure her that it always resolves within a day and do nothing further.",
          feedback: "Plexus injuries can last months; without a baseline you cannot track them.",
        },
        {
          text: "Order an urgent MRI of the brain for a stroke before doing anything else.",
          feedback: "Weakness in one plexus distribution after abducted arms is positional, not a stroke.",
        },
        {
          text: "Give a high dose of IV steroids straight away to reduce the nerve swelling.",
          feedback: "There is no evidence that steroids help a positional plexus injury.",
        },
      ],
    },
    {
      situation: "A day later the weakness is unchanged and she has burning pain down the arm.",
      best: {
        text: "Start neuropathic analgesia and physiotherapy, and arrange nerve conduction studies.",
        feedback: "Symptom control, keeping the joints moving, and a formal study plan the recovery.",
      },
      decoys: [
        {
          text: "Double her opioid dose and review the arm at the six-week clinic.",
          feedback: "Opioids treat neuropathic pain poorly, and a stiff shoulder develops while she waits.",
        },
        {
          text: "Put the arm in a sling and keep it completely still for six weeks so that the nerve can rest.",
          feedback: "Immobilization gives her a frozen shoulder without helping the nerve.",
        },
        {
          text: "Tell her the pain is anxiety-driven and discharge her home.",
          feedback: "Burning pain in a plexus distribution after surgery is neuropathic, not anxiety.",
        },
      ],
    },
  ],
  thrombosis: [
    {
      situation: "Her leg is swollen and she is breathless with HR 118. With her previous DVT, a clot is likely.",
      best: {
        text: "Confirm with a duplex scan or CT pulmonary angiogram and restart anticoagulation.",
        feedback: "Imaging confirms the clot, and anticoagulation stops it growing.",
      },
      decoys: [
        {
          text: "Start aspirin 75 mg daily and let her own system dissolve the clot over time.",
          feedback: "Aspirin does not treat venous thrombosis.",
        },
        {
          text: "Wait for the clinic review in two weeks before treating her.",
          feedback: "An untreated DVT or PE can extend and kill within days.",
        },
        {
          text: "Massage and elevate the swollen leg every few hours to help the swelling and pain go down.",
          feedback: "Massaging a leg with a clot can send it to her lungs.",
        },
      ],
    },
    {
      situation: "She becomes hypotensive and hypoxic: a massive pulmonary embolism.",
      best: {
        text: "Start full heparin, call the PE team, and weigh thrombolysis against the fresh liver bed.",
        feedback: "Massive PE needs heparin and a senior decision on clot removal, balanced against surgical bleeding.",
      },
      decoys: [
        {
          text: "Give three liters of fluid rapidly to push more blood through her strained right ventricle.",
          feedback: "Large volumes overdistend the failing right ventricle.",
        },
        {
          text: "Give furosemide to off-load her right heart and ease her breathing.",
          feedback: "A diuretic drops preload when the right heart needs it most.",
        },
        {
          text: "Place a caval filter tomorrow and hold all anticoagulation today.",
          feedback: "A filter does not treat the clot already in her lungs.",
        },
      ],
    },
  ],

  // ── Mistake-specific rescue scenarios (StepDef.rescueVariants) ──────────
  "hemorrhage:postop": [
    {
      situation: "After surgery Sarah is bleeding: HR 118, BP 90/52, hemoglobin falling, and she has had anticoagulants.",
      best: {
        text: "Stop all anticoagulants and NSAIDs, crossmatch, and find the source: wound, abdomen, or gut.",
        feedback: "Removing what thins her blood and finding where she is bleeding come before anything else.",
      },
      decoys: [
        {
          text: "Reinforce her dressings with a pressure bandage and recheck her hemoglobin tomorrow morning.",
          feedback: "A falling hemoglobin with tachycardia cannot wait until the morning.",
        },
        {
          text: "Give protamine to reverse the apixaban and keep her on the ward to see whether it settles.",
          feedback: "Protamine reverses heparin, not apixaban, and the source is still unknown.",
        },
        {
          text: "Start a noradrenaline infusion on the ward to keep her systolic above 90 overnight.",
          feedback: "A vasopressor masks hypovolemia from bleeding.",
        },
      ],
    },
    {
      situation: "Her hemoglobin is 7.0 g/dL and BP 76/40 despite a liter of fluid.",
      best: {
        text: "Transfuse, give PCC or andexanet, and take her for source control in theater or endoscopy.",
        feedback: "Blood, apixaban reversal, and definitive control of the source treat hemorrhagic shock.",
      },
      decoys: [
        {
          text: "Transfuse two units and observe overnight, acting only if she needs a third unit of blood.",
          feedback: "She is already in shock; waiting lets her keep bleeding.",
        },
        {
          text: "Order a CT for the morning and keep her fasted on the ward until the scan is done.",
          feedback: "An unstable, bleeding patient cannot wait until morning.",
        },
        {
          text: "Give four liters of crystalloid to bring the pressure up and avoid blood products.",
          feedback: "Crystalloid dilutes her remaining blood and clotting factors.",
        },
      ],
    },
  ],
  "hemorrhage:major": [
    {
      situation: "A major vessel is bleeding into the abdomen: HR 140, BP 62/30, and the field is filling fast.",
      best: {
        text: "Open the abdomen, press directly on the vessel, and call the vascular surgeon and for blood.",
        feedback: "Only open access and direct pressure control a major vessel, while help and blood arrive.",
      },
      decoys: [
        {
          text: "Pull the trocar and look again with the camera through a different port to find the source.",
          feedback: "The trocar marks the hole and slows the bleeding; pulling it loses both.",
        },
        {
          text: "Raise the gas pressure to 25 mmHg so the pneumoperitoneum tamponades the vessel.",
          feedback: "Gas cannot hold back arterial pressure, and it enters the torn vessel as an embolus.",
        },
        {
          text: "Give a liter of saline and phenylephrine, and keep working laparoscopically while it settles.",
          feedback: "A major vessel does not settle; she needs control, and saline only dilutes her.",
        },
      ],
    },
    {
      situation: "Pressure is on the vessel, but she has had six units, her temperature is 35.0 °C, and everything oozes.",
      best: {
        text: "Give plasma, platelets, and cryoprecipitate with the red cells, warm everything, and replace calcium.",
        feedback: "Balanced products, warmth, and calcium break the cycle of cold, acid, and coagulopathy.",
      },
      decoys: [
        {
          text: "Keep giving red cells alone until the hemoglobin comes back above 10 g/dL.",
          feedback: "Red cells alone dilute the clotting factors she has left.",
        },
        {
          text: "Give three liters of warmed saline to bring her pressure up while the plasma thaws.",
          feedback: "Saline dilutes clotting factors and adds to the swelling of the bowel and lungs.",
        },
        {
          text: "Lift the pressure off the vessel every few minutes to see whether it has stopped yet.",
          feedback: "Each release lets the vessel bleed again and loses the ground you gained.",
        },
      ],
    },
  ],
  "thrombosis:arterial": [
    {
      situation: "Her liver enzymes are soaring and ultrasound shows poor flow in the right hepatic artery.",
      best: {
        text: "Get a CT angiogram and involve the hepatobiliary team about restoring flow to the right lobe.",
        feedback: "Imaging defines the arterial injury, and specialists can restore flow before the lobe infarcts.",
      },
      decoys: [
        {
          text: "Repeat the liver tests in a week, since transaminases often rise a little after any laparoscopy.",
          feedback: "Soaring enzymes with poor arterial flow is ischemia, not a routine rise.",
        },
        {
          text: "Start full heparin on the ward and discharge her once the enzymes start to fall.",
          feedback: "Heparin does not reopen a clipped artery.",
        },
        {
          text: "Take her back tonight to remove every clip near the hilum without imaging first.",
          feedback: "Removing clips with no map of the injury risks releasing the cystic duct and artery stumps.",
        },
      ],
    },
    {
      situation: "The right lobe is infarcting and she is febrile, with a liver abscess forming.",
      best: {
        text: "Give IV antibiotics, drain the abscess under imaging, and transfer to a hepatobiliary unit.",
        feedback: "Drainage and antibiotics control the infected infarct while specialists plan definitive care.",
      },
      decoys: [
        {
          text: "Treat her with oral antibiotics at home and repeat the ultrasound in a month.",
          feedback: "An infected liver infarct needs IV treatment and drainage.",
        },
        {
          text: "Perform an emergency right hepatectomy tonight at this hospital without imaging.",
          feedback: "A major liver resection without planning or a specialist team is far riskier than drainage.",
        },
        {
          text: "Start full heparin to dissolve the arterial clot and keep her on the general ward.",
          feedback: "The artery was clipped, not clotted, and the abscess still needs draining.",
        },
      ],
    },
  ],
  "infection:wound": [
    {
      situation: "A port site is red, hot, and discharging cloudy fluid. Temp 38.3 °C.",
      best: {
        text: "Open the port site, drain it, send a swab, and start antibiotics if the redness spreads.",
        feedback: "A port-site abscess needs opening and drainage; antibiotics are added for spreading cellulitis.",
      },
      decoys: [
        {
          text: "Cover it with a new dressing and plan to review it at the two-week clinic.",
          feedback: "An undrained port-site abscess spreads within days.",
        },
        {
          text: "Squeeze the pus out through the skin stitch and leave the port site closed.",
          feedback: "Partial expression leaves the infected cavity closed.",
        },
        {
          text: "Start high-dose oral clindamycin for two weeks and keep the wound closed.",
          feedback: "Antibiotics cannot reach pus trapped in a closed wound.",
        },
      ],
    },
    {
      situation: "The redness is spreading across her abdomen and she is tachycardic with a high white count.",
      best: {
        text: "Start IV antibiotics, open the wound widely, and get a CT to look for a deeper collection.",
        feedback: "Spreading infection needs IV treatment and a search for a deeper source.",
      },
      decoys: [
        {
          text: "Keep the dressings as they are and repeat the white count in 48 hours to see which way it trends.",
          feedback: "A systemic response to spreading infection cannot wait two days.",
        },
        {
          text: "Close the drained port site again with staples to shrink the raw area and help healing.",
          feedback: "Closing an infected wound traps the pus again.",
        },
        {
          text: "Switch to oral antibiotics and discharge her with a district nurse review.",
          feedback: "A tachycardic patient with spreading cellulitis needs admission and IV therapy.",
        },
      ],
    },
  ],
  "infection:bowel": [
    {
      situation: "Sarah has worsening pain, vomiting, fever, and a rigid abdomen: bowel has been injured or trapped.",
      best: {
        text: "Resuscitate her, start IV antibiotics, get an urgent CT, and prepare for a return to theater.",
        feedback: "Peritonitis after laparoscopy is a bowel injury until proven otherwise and needs urgent surgery.",
      },
      decoys: [
        {
          text: "Give an antiemetic and IV morphine and review her again after the evening meal.",
          feedback: "Opioids mask peritonitis while the leak spreads.",
        },
        {
          text: "Insert a nasogastric tube and manage her conservatively for 48 hours without imaging.",
          feedback: "A rigid abdomen with fever is surgical; conservative care lets the leak spread.",
        },
        {
          text: "Order an abdominal X-ray for the morning and keep her nil by mouth.",
          feedback: "Peritonitis cannot wait until morning.",
        },
      ],
    },
    {
      situation: "CT shows free fluid and air near a port site, and her lactate is 4.2.",
      best: {
        text: "Take her to theater now to repair or resect the injured bowel and wash out the abdomen.",
        feedback: "Source control in theater is the only treatment for a perforated or strangulated bowel.",
      },
      decoys: [
        {
          text: "Place a radiological drain into the fluid collection and continue her IV antibiotics on the ward.",
          feedback: "A drain cannot close a hole in the bowel.",
        },
        {
          text: "Add antifungal cover and repeat the CT in 48 hours to see whether it improves.",
          feedback: "Free air and a lactate of 4.2 need theater now.",
        },
        {
          text: "Transfer her to a rehabilitation bed once her pain is controlled with opioids.",
          feedback: "She has a surgical emergency, not a pain problem.",
        },
      ],
    },
  ],
  "infection:urinary": [
    {
      situation: "Sarah has fever, rigors, and cloudy, foul-smelling urine draining through her catheter.",
      best: {
        text: "Send a urine culture, take out or replace the catheter, and start IV antibiotics.",
        feedback: "Removing the infected device and targeted antibiotics treat catheter-associated infection.",
      },
      decoys: [
        {
          text: "Flush the catheter with saline twice a day and leave it in place for another full week.",
          feedback: "Flushing spreads bacteria, and every extra day raises the infection risk.",
        },
        {
          text: "Clamp the catheter for four hours to train her bladder before taking it out.",
          feedback: "Clamping an infected catheter traps infected urine.",
        },
        {
          text: "Start oral antibiotics and keep the catheter in until her clinic review.",
          feedback: "The catheter is the source and needs to come out.",
        },
      ],
    },
    {
      situation: "She becomes hypotensive at 84/48, with a lactate of 3.6: urosepsis.",
      best: {
        text: "Give fluid boluses, take blood cultures, start broad IV antibiotics, and escalate her care.",
        feedback: "Septic shock needs fluid, antibiotics within the hour, and a higher level of care.",
      },
      decoys: [
        {
          text: "Switch to a different oral antibiotic and recheck her in the morning.",
          feedback: "Septic shock needs IV antibiotics and resuscitation now.",
        },
        {
          text: "Give a large dose of furosemide to flush the infection out of her bladder.",
          feedback: "A diuretic in septic shock worsens her hypotension.",
        },
        {
          text: "Replace the catheter with another standard latex one from the ward stock.",
          feedback: "She is latex-allergic, and a new catheter does not treat sepsis.",
        },
      ],
    },
  ],
};
