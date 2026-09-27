// Rescue decisions for the open appendectomy (Marcus T., 28M, 95 kg, septic,
// penicillin allergy). A complication can start at any step, intra-op or on
// the ward, so each situation describes the patient, not one moment.

import type { ProcedureRescueBank } from "./types";

export const APPENDECTOMY_RESCUE: ProcedureRescueBank = {
  hemorrhage: [
    {
      situation: "Marcus is bleeding: blood is pooling in the right lower quadrant, HR 128, BP 84/48.",
      best: {
        text: "Press on the bleeding area, crossmatch four units, and get the vessel under vision to tie it.",
        feedback: "Pressure slows the loss, blood is on its way, and a stitch on the vessel is the only definitive fix.",
      },
      decoys: [
        {
          text: "Clamp deep into the pool of blood with a large clamp and close it on whatever lies at the bottom.",
          feedback: "Clamping tissue you cannot see catches the ileum, the ureter, or the gonadal vessels.",
        },
        {
          text: "Arrange a CT angiogram to find the exact bleeding point before doing anything more in the wound.",
          feedback: "An unstable patient with an accessible bleeding source needs surgical control, not a scanner.",
        },
        {
          text: "Ask anesthesia to run in three liters of saline while you carry on with the planned step.",
          feedback: "Crystalloid dilutes his blood and clotting factors while the vessel keeps bleeding.",
        },
      ],
    },
    {
      situation: "The packs are soaked, HR 140, BP 70/38, and the field refills as fast as you suction it.",
      best: {
        text: "Trigger the massive transfusion protocol, press on the mesenteric root, and call your senior in.",
        feedback: "Balanced blood products replace the loss while root pressure buys time for a definitive repair.",
      },
      decoys: [
        {
          text: "Leave the packs in, close over them, and plan to come back tomorrow once he has stabilized.",
          feedback: "He cannot stabilize while an artery keeps bleeding under the packs.",
        },
        {
          text: "Give tranexamic acid on its own and wait twenty minutes to see if the bleeding settles.",
          feedback: "Tranexamic acid supports clot stability but cannot stop a pumping arterial bleeder.",
        },
        {
          text: "Start a noradrenaline infusion to bring his pressure up before touching the wound again.",
          feedback: "A vasopressor squeezes an empty circulation; he needs volume and a tied vessel.",
        },
      ],
    },
  ],
  infection: [
    {
      situation: "Marcus is septic from the contamination: 39.3 °C, HR 124, lactate 3.2, abdomen tender.",
      best: {
        text: "Send blood cultures, give ciprofloxacin and metronidazole, and plan drainage of the source.",
        feedback: "Cultures first, antibiotics that respect his penicillin allergy, and source control together treat the sepsis.",
      },
      decoys: [
        {
          text: "Start piperacillin-tazobactam, since it gives the best cover for abdominal sepsis.",
          feedback: "Piperacillin is a penicillin, and his band says he is allergic.",
        },
        {
          text: "Give paracetamol and cooling, and review the white count on the morning ward round.",
          feedback: "Treating the fever alone lets the source keep seeding his bloodstream overnight.",
        },
        {
          text: "Give hydrocortisone 200 mg first to blunt the inflammatory response, then reassess.",
          feedback: "Steroids are for shock that does not respond to vasopressors, not a first move in sepsis.",
        },
      ],
    },
    {
      situation: "Despite antibiotics his BP is 82/45 and lactate 4.1; the collection is still there.",
      best: {
        text: "Give fluid in 500 mL boluses to 30 mL/kg, add noradrenaline, and drain the collection today.",
        feedback: "Resuscitation restores perfusion, and an undrained collection must be removed for him to recover.",
      },
      decoys: [
        {
          text: "Broaden the antibiotics to meropenem-level cover and hold off on any drainage until he is more stable.",
          feedback: "Antibiotics cannot sterilize an undrained abscess; he stabilizes only once it is drained.",
        },
        {
          text: "Give eight liters of saline over the next hour to drive the lactate back down.",
          feedback: "Unmeasured high-volume fluid floods the lungs of an obese septic patient.",
        },
        {
          text: "Send him back to the ward and recheck the lactate in six hours.",
          feedback: "A rising lactate with hypotension is septic shock and needs a higher level of care now.",
        },
      ],
    },
  ],
  hypoxia: [
    {
      situation: "SpO2 is falling through 86% and his breathing is labored.",
      best: {
        text: "Give 100% oxygen, open and suction the airway, and listen to both lungs to find the cause.",
        feedback: "Oxygen buys time while the airway check finds obstruction, aspiration, or collapse.",
      },
      decoys: [
        {
          text: "Give furosemide 40 mg IV on the assumption that fluid on the lungs is the cause.",
          feedback: "Treating a guessed cause delays finding the real one, and he may be volume-depleted.",
        },
        {
          text: "Give more sedation so he settles and stops fighting against his breathing.",
          feedback: "More sedation deepens obstruction and hypoventilation in an obese patient.",
        },
        {
          text: "Wait five minutes and repeat the reading, since the probe may have slipped on his finger.",
          feedback: "A falling saturation with labored breathing is real; waiting lets it fall further.",
        },
      ],
    },
    {
      situation: "SpO2 is 78%, his heart rate is slowing, and he is tiring despite the oxygen.",
      best: {
        text: "Secure the airway with a video laryngoscope, suction the trachea, and ventilate with PEEP.",
        feedback: "A definitive airway and positive pressure reopen collapsed lung before he arrests.",
      },
      decoys: [
        {
          text: "Keep bag-mask ventilating hard at a fast rate until the on-call anesthetist arrives to intubate.",
          feedback: "Forceful mask breaths inflate his stomach and drive more aspiration.",
        },
        {
          text: "Give midazolam to calm his breathing pattern so the oxygen can work better.",
          feedback: "A benzodiazepine in a tiring, hypoxic patient removes his remaining respiratory drive.",
        },
        {
          text: "Sit him fully upright on the mask and allow ten minutes for the saturation to recover.",
          feedback: "A slowing heart rate at 78% is pre-arrest; there is no time to wait.",
        },
      ],
    },
  ],
  anaphylaxis: [
    {
      situation: "Minutes after a new drug he has hives, a wheeze, and a BP of 70/40.",
      best: {
        text: "Stop the drug, give epinephrine 0.5 mg IM, 100% oxygen, and a rapid fluid bolus.",
        feedback: "Epinephrine reverses the vasodilation and bronchospasm; removing the trigger stops more exposure.",
      },
      decoys: [
        {
          text: "Give chlorphenamine and hydrocortisone IV first, then decide whether he needs epinephrine.",
          feedback: "Antihistamines and steroids are second-line; only epinephrine reverses anaphylactic shock.",
        },
        {
          text: "Slow the infusion down and see whether the rash settles over the next ten minutes.",
          feedback: "Any further dose of the trigger deepens the reaction.",
        },
        {
          text: "Give a salbutamol nebulizer for the wheeze and let the infusion finish.",
          feedback: "Treating the wheeze alone ignores the shock, and the drug keeps running in.",
        },
      ],
    },
    {
      situation: "After the first dose his BP is 58/30 and his lips and tongue are swelling.",
      best: {
        text: "Repeat the epinephrine, start an infusion, and secure his airway before the swelling closes it.",
        feedback: "Refractory anaphylaxis needs an epinephrine infusion, and a swelling airway must be secured early.",
      },
      decoys: [
        {
          text: "Give a second dose of hydrocortisone and wait for the steroid to take effect.",
          feedback: "Steroids take hours to act; his airway and pressure are failing now.",
        },
        {
          text: "Lie him flat with his legs raised and hold every further drug until his blood pressure has recovered.",
          feedback: "Positioning helps, but withholding epinephrine in worsening anaphylaxis is fatal.",
        },
        {
          text: "Give four liters of saline to lift the pressure in place of more epinephrine.",
          feedback: "Fluid supports the circulation but cannot stop the reaction or protect the airway.",
        },
      ],
    },
  ],
  cardiac_arrhythmia: [
    {
      situation: "His rhythm has suddenly changed on the monitor and his blood pressure is dropping.",
      best: {
        text: "Check for a pulse, stop the trigger, and treat the rhythm by its type with pads on.",
        feedback: "Pulse first, remove the cause, and have the defibrillator ready for whatever the rhythm becomes.",
      },
      decoys: [
        {
          text: "Give amiodarone 300 mg IV straight away, whatever the rhythm turns out to be.",
          feedback: "Amiodarone suits some tachycardias but worsens bradycardia and heart block.",
        },
        {
          text: "Deepen the anesthetic or sedation to settle the irritable heart.",
          feedback: "Deeper anesthesia drops a falling pressure further.",
        },
        {
          text: "Get a 12-lead ECG and wait for a cardiology opinion before treating anything.",
          feedback: "An unstable rhythm needs treatment now; the formal ECG can follow.",
        },
      ],
    },
    {
      situation: "Marcus has lost his pulse. There is no cardiac output.",
      best: {
        text: "Start chest compressions, shock if the rhythm is shockable, and give epinephrine every 3–5 minutes.",
        feedback: "High-quality compressions and early defibrillation are what restore circulation.",
      },
      decoys: [
        {
          text: "Give atropine 3 mg and wait a minute for the rhythm to recover before you start chest compressions.",
          feedback: "Every minute without compressions lowers the chance of survival.",
        },
        {
          text: "Keep ventilating and recheck the pulse in a minute to make sure it is really gone.",
          feedback: "Pulse checks longer than 10 seconds delay compressions in a patient already in arrest.",
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
      situation: "Crackles are rising in both lungs, SpO2 89%, and his fluid balance is five liters positive.",
      best: {
        text: "Stop the maintenance fluid, sit him up, give oxygen, and give furosemide 40 mg IV.",
        feedback: "Stopping the input, off-loading with a diuretic, and oxygen treat pulmonary edema from overload.",
      },
      decoys: [
        {
          text: "Give another fluid bolus in case the low saturation reflects poor perfusion.",
          feedback: "More fluid into wet lungs makes the edema worse.",
        },
        {
          text: "Start a morphine infusion to take the edge off his breathlessness.",
          feedback: "An opioid infusion in a hypoxic obese patient depresses his breathing.",
        },
        {
          text: "Restrict drinks by mouth but keep the IV drip running at the same rate.",
          feedback: "The IV drip is the main source of the overload and needs to stop.",
        },
      ],
    },
    {
      situation: "He is coughing pink froth, SpO2 84%, and tiring.",
      best: {
        text: "Start CPAP, repeat the furosemide, and move him to a monitored bed to find the cause.",
        feedback: "CPAP pushes fluid out of the alveoli and supports his breathing while the diuretic works.",
      },
      decoys: [
        {
          text: "Keep him on the general ward on a high-flow face mask and review him on the morning round.",
          feedback: "Pink frothy sputum is severe pulmonary edema and needs monitored, pressure support.",
        },
        {
          text: "Give a 250 mL bolus of albumin to pull the fluid back into his vessels.",
          feedback: "Albumin adds volume to an already overloaded circulation.",
        },
        {
          text: "Give a beta-blocker to slow his heart down so it has longer to fill.",
          feedback: "Beta-blockade in acute edema weakens the heart when it is already failing.",
        },
      ],
    },
  ],
  nerve_injury: [
    {
      situation: "Marcus reports new numbness and weakness along a nerve that was close to the operation.",
      best: {
        text: "Map and document the exact deficit, remove any compression, and request early neurology review.",
        feedback: "A precise baseline and early review distinguish neuropraxia from a transected or trapped nerve.",
      },
      decoys: [
        {
          text: "Reassure him that numbness always resolves within a day, and do nothing further.",
          feedback: "Many post-op nerve injuries do not resolve; without a baseline you cannot track them.",
        },
        {
          text: "Give a high dose of IV methylprednisolone straight away to reduce the swelling around the nerve.",
          feedback: "There is no evidence that steroids help a peripheral nerve injured at surgery.",
        },
        {
          text: "Order an MRI of the whole spine to look for a disc problem as the real cause.",
          feedback: "The deficit maps to the surgical field, not the spine.",
        },
      ],
    },
    {
      situation: "Two days on, the pain is burning and shooting and the deficit has not improved.",
      best: {
        text: "Start neuropathic analgesia and plan re-exploration to release a nerve caught in a stitch.",
        feedback: "Early release of an entrapped ilioinguinal or iliohypogastric nerve gives the best recovery.",
      },
      decoys: [
        {
          text: "Double his opioid dose and review the pain again at the six-week surgical clinic.",
          feedback: "Opioids treat neuropathic pain poorly, and a six-week wait lets entrapment become permanent.",
        },
        {
          text: "Tell him the pain is anxiety-driven and send him home.",
          feedback: "Burning pain in a nerve's territory after surgery is an entrapment until proven otherwise.",
        },
        {
          text: "Inject local anesthetic into the scar every week for a month and avoid any further surgery on it.",
          feedback: "Injections can mask it, but a nerve trapped in suture needs to be released.",
        },
      ],
    },
  ],
  thrombosis: [
    {
      situation: "His leg is swollen and he is breathless with a heart rate of 118. A clot is likely.",
      best: {
        text: "Confirm it with a duplex scan or CT pulmonary angiogram and start anticoagulation.",
        feedback: "Imaging confirms the diagnosis, and anticoagulation stops the clot from growing.",
      },
      decoys: [
        {
          text: "Start aspirin 75 mg and let his own system dissolve the clot over time.",
          feedback: "Aspirin does not treat venous thrombosis.",
        },
        {
          text: "Wait for the clinic review in two weeks to decide whether it needs treatment.",
          feedback: "An untreated DVT or PE can extend and kill within days.",
        },
        {
          text: "Massage and elevate the swollen leg every few hours to help the swelling and pain go down.",
          feedback: "Massaging a leg with a clot can send it to his lungs.",
        },
      ],
    },
    {
      situation: "He becomes hypotensive and hypoxic: a massive pulmonary embolism.",
      best: {
        text: "Start full heparin, call the PE team, and weigh thrombolysis against his fresh wound.",
        feedback: "Massive PE needs heparin and a senior decision on clot removal, balanced against surgical bleeding.",
      },
      decoys: [
        {
          text: "Give three liters of fluid rapidly to push more blood through his strained right heart.",
          feedback: "Large volumes overdistend the failing right ventricle and worsen the shock.",
        },
        {
          text: "Give furosemide to off-load his right heart and ease the breathing.",
          feedback: "A diuretic drops his preload when the right heart needs it most.",
        },
        {
          text: "Place a caval filter tomorrow and hold all anticoagulation today.",
          feedback: "A filter does not treat the clot already in his lungs.",
        },
      ],
    },
  ],

  // ── Mistake-specific rescue scenarios (StepDef.rescueVariants) ──────────
  "hemorrhage:postop": [
    {
      situation: "After surgery Marcus's wound is swelling and oozing, HR 120, BP 92/55, and his hemoglobin has dropped.",
      best: {
        text: "Stop any anticoagulant or NSAID, press on the wound, send a crossmatch, and call the surgeon.",
        feedback: "Removing what thins his blood, local pressure, and a surgical review address a post-op bleed at its cause.",
      },
      decoys: [
        {
          text: "Reinforce the dressing with more gauze and a pressure bandage, then recheck him at the next vitals round.",
          feedback: "A thicker dressing hides the bleeding while his hemoglobin keeps falling.",
        },
        {
          text: "Start a noradrenaline infusion on the ward to keep his systolic above 90 overnight.",
          feedback: "A vasopressor masks hypovolemia from bleeding; he needs the source controlled and blood.",
        },
        {
          text: "Give a further dose of enoxaparin, since bed rest after a bleed raises his clot risk even more.",
          feedback: "More anticoagulant turns an ooze into a major hemorrhage.",
        },
      ],
    },
    {
      situation: "His hemoglobin is now 7.1 g/dL and BP 78/40 despite a liter of fluid.",
      best: {
        text: "Transfuse, reverse any anticoagulant, and take him back to theater to find and tie the bleeder.",
        feedback: "Ongoing shock from a surgical bleed needs blood and a return to theater.",
      },
      decoys: [
        {
          text: "Transfuse two units and observe overnight, going back to theater only if a third unit is needed.",
          feedback: "He is already in shock; waiting for a third unit lets him keep bleeding into the wound.",
        },
        {
          text: "Order a CT angiogram for the morning and keep him fasted on the ward until then.",
          feedback: "A hypotensive, bleeding patient cannot wait until morning for a scan.",
        },
        {
          text: "Give four liters of crystalloid to bring the pressure up and hold off on any blood products.",
          feedback: "Crystalloid dilutes his remaining blood and clotting factors.",
        },
      ],
    },
  ],
  "thrombosis:arterial": [
    {
      situation: "A segment of Marcus's ileum and cecum has turned dusky and mottled: its arterial supply has been cut off.",
      best: {
        text: "Relieve whatever is cutting off the supply, warm the bowel, and reassess its color and bleeding edges.",
        feedback: "Restoring inflow, by releasing a tie or reducing a trapped loop, shows whether the bowel can recover before anything is cut out.",
      },
      decoys: [
        {
          text: "Close the abdomen and plan a second-look laparotomy in 48 hours to see how the bowel recovers.",
          feedback: "Whatever cut off the supply is still in place; closing leaves the bowel to die and perforate.",
        },
        {
          text: "Start a heparin infusion and wait on the table for the collateral circulation to open up.",
          feedback: "Heparin cannot restore flow through a tied or twisted artery.",
        },
        {
          text: "Resect the whole right colon to the mid-transverse colon now, whatever the bowel looks like.",
          feedback: "Resecting before restoring flow and reassessing may remove bowel that would recover.",
        },
      ],
    },
    {
      situation: "Ten minutes after the supply is restored the bowel is still dark, and its cut edges do not bleed.",
      best: {
        text: "Resect the non-viable ileum and cecum back to healthy, bleeding bowel and join the ends.",
        feedback: "Dead bowel must come out; joining healthy, bleeding ends gives an anastomosis that can heal.",
      },
      decoys: [
        {
          text: "Close and come back in 48 hours for a second look, leaving the dark bowel in place for now.",
          feedback: "Non-viable bowel left in a septic patient perforates within hours.",
        },
        {
          text: "Inject papaverine into the mesentery and close, relying on the drug to restore the flow.",
          feedback: "Vasodilators cannot revive bowel that has already died.",
        },
        {
          text: "Resect only the darkest few centimeters and leave the dusky bowel on either side.",
          feedback: "The dusky bowel on either side shares the same lost supply and will necrose too.",
        },
      ],
    },
  ],
  "infection:wound": [
    {
      situation: "Marcus's wound is red, hot, and swollen, and it is leaking cloudy fluid. Temp 38.4 °C.",
      best: {
        text: "Open the wound over the most swollen part, drain it, send a swab, and pack it loosely.",
        feedback: "A wound abscess needs to be opened and drained; antibiotics alone will not reach it.",
      },
      decoys: [
        {
          text: "Start oral flucloxacillin and keep the wound closed so it heals from the surface down.",
          feedback: "Flucloxacillin is a penicillin, and his band says he is allergic; the pus also stays trapped.",
        },
        {
          text: "Cover it with a fresh dressing and plan to review it at the two-week clinic visit.",
          feedback: "An undrained wound abscess spreads into cellulitis and sepsis within days.",
        },
        {
          text: "Squeeze the pus out through the stitches at the bedside and leave the wound closed.",
          feedback: "Partial expression leaves the cavity closed and still infected.",
        },
      ],
    },
    {
      situation: "Two days on, redness is spreading up his flank and he is tachycardic with a high white count.",
      best: {
        text: "Start IV vancomycin, open the whole wound, and get a CT to look for a deeper collection.",
        feedback: "Spreading cellulitis needs IV antibiotics that avoid his penicillin allergy, and a search for a deeper source.",
      },
      decoys: [
        {
          text: "Switch to IV piperacillin-tazobactam, since spreading cellulitis needs broad Gram-negative cover.",
          feedback: "Piperacillin is a penicillin; his allergy makes this dangerous.",
        },
        {
          text: "Keep the current dressing plan and repeat the white count in 48 hours to see its trend.",
          feedback: "Spreading infection with a systemic response cannot wait two days.",
        },
        {
          text: "Close the opened wound with staples to shrink the raw surface and help it heal faster.",
          feedback: "Closing an infected wound traps the pus again.",
        },
      ],
    },
  ],
  "infection:cdiff": [
    {
      situation: "On day 9 Marcus has profuse watery diarrhea, a fever, and a rising white count.",
      best: {
        text: "Isolate him, stop the antibiotics, send a C. difficile test, and start oral vancomycin.",
        feedback: "Stopping the trigger, containing spread, and oral vancomycin treat C. difficile colitis.",
      },
      decoys: [
        {
          text: "Give loperamide to slow the diarrhea and continue the ciprofloxacin and metronidazole.",
          feedback: "Antimotility drugs trap the toxin in the colon, and the antibiotics keep feeding the infection.",
        },
        {
          text: "Put the diarrhea down to the anesthetic and advance his diet to settle his bowels.",
          feedback: "Fever and a rising white count with diarrhea after antibiotics is C. difficile until proven otherwise.",
        },
        {
          text: "Start IV metronidazole alone and keep him on the open ward in a shared bay.",
          feedback: "IV metronidazole alone is second-line, and without isolation he spreads the spores to others.",
        },
      ],
    },
    {
      situation: "His abdomen distends, the diarrhea slows, and his lactate climbs: toxic megacolon.",
      best: {
        text: "Give oral vancomycin and IV metronidazole, get a CT, and involve surgery for a possible colectomy.",
        feedback: "Fulminant colitis needs maximal medical therapy and early surgical review.",
      },
      decoys: [
        {
          text: "Give loperamide now that the diarrhea has slowed down, since it seems to be working.",
          feedback: "Slowing diarrhea with distension is a warning sign of megacolon, not improvement.",
        },
        {
          text: "Arrange a colonoscopy today to confirm the colitis before any further treatment.",
          feedback: "Colonoscopy in toxic megacolon risks perforating the colon.",
        },
        {
          text: "Continue the oral vancomycin alone and review him on tomorrow's ward round.",
          feedback: "A rising lactate with a distending colon cannot wait until tomorrow.",
        },
      ],
    },
  ],
  "nerve_injury:positional": [
    {
      situation: "In recovery Marcus cannot feel his little and ring fingers, and his right grip is weak.",
      best: {
        text: "Document the ulnar deficit, pad and straighten his elbow, and arrange early neurology review.",
        feedback: "This is ulnar compression at the elbow from the tucked arm; relieving it and a baseline guide recovery.",
      },
      decoys: [
        {
          text: "Reassure him that pressure numbness always wears off by tomorrow and do nothing more.",
          feedback: "Compression neuropathies can last months; without a baseline you cannot track them.",
        },
        {
          text: "Take him back to theater to look for a nerve cut in the right lower quadrant wound.",
          feedback: "His hand numbness is from arm positioning, not the abdominal wound.",
        },
        {
          text: "Order an urgent MRI of his brain to rule out a stroke before anything else is done.",
          feedback: "A deficit in one nerve's territory after a tucked arm is positional, not a stroke.",
        },
      ],
    },
    {
      situation: "A day later the numbness persists and there is tingling along his inner forearm.",
      best: {
        text: "Start neuropathic analgesia and hand therapy, protect the elbow, and book nerve studies.",
        feedback: "Protecting the nerve, keeping the hand working, and a formal study plan his recovery.",
      },
      decoys: [
        {
          text: "Put the arm in a sling with the elbow bent to 90 degrees for the next six weeks.",
          feedback: "A flexed elbow stretches and compresses the ulnar nerve further.",
        },
        {
          text: "Double his opioids and review the hand again at the six-week clinic visit.",
          feedback: "Opioids treat neuropathic pain poorly, and six weeks without therapy stiffens the hand.",
        },
        {
          text: "Tell him the tingling is anxiety-related and discharge him with no follow-up.",
          feedback: "Tingling in the ulnar territory after surgery is a nerve injury, not anxiety.",
        },
      ],
    },
  ],
};
