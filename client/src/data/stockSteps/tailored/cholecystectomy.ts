// ─────────────────────────────────────────────────────────────────────────────
// LAPAROSCOPIC CHOLECYSTECTOMY — fully tailored bank.
// Sarah J., 42F, 78 kg, obese, symptomatic gallstones with a positive
// Murphy's sign. Latex allergy. On apixaban for a DVT last year.
// Every wrong choice triggers the complication it would actually cause, and
// `consequences` describe what the team sees the moment it happens.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProcedureBank } from "../stepBuilder";

export const CHOLECYSTECTOMY_BANK: ProcedureBank = {
  id: "cholecystectomy",
  spec: {
    approach: "four-port laparoscopic access with open umbilical entry",
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
    risks: [
      "infection",
      "hemorrhage",
      "hypoxia",
      "anaphylaxis",
      "cardiac_arrhythmia",
      "fluid_overload",
      "nerve_injury",
      "thrombosis",
    ],
    instrument: "a 30° laparoscope and clip applier",
    position: "reverse Trendelenburg with left tilt",
    wrongPositions: ["steep Trendelenburg", "prone"],
    detail: "42F, 78 kg, Murphy's sign positive, latex allergy, apixaban for a prior DVT",
  },
  steps: [
    // ── Pre-op and induction ────────────────────────────────────────────────
    {
      kind: "preop",
      title: "Run the time-out",
      description: "Her band says latex allergy. The chart says she takes apixaban for a DVT she had last year.",
      choices: [
        "Read back her name, the procedure, the latex allergy, and the time of her last apixaban dose.",
        "Confirm her name and consent, and let the team open the standard kit with its gloves and urinary catheter.",
        "Confirm her name and site, and take it that the apixaban was stopped because the pre-op clinic advised it.",
      ],
      feedback: [
        "Both hazards are caught: the room goes latex-free, and she confirms her last apixaban dose was three days ago.",
        "The standard kit contains latex. In a latex-allergic patient it triggers anaphylaxis once it touches mucosa.",
        "She actually took apixaban last night. Operating on a fully anticoagulated patient makes every plane bleed.",
      ],
      wrongComps: ["anaphylaxis", "hemorrhage"],
      consequences: [
        "Twenty minutes after the catheter goes in, she flushes, airway pressures climb, and BP drops to 68/40.",
        "Every port site and every plane oozes, and the liver bed will not stop bleeding.",
      ],
      effects: [null, {"set": ["latex_exposed"], "repair": "latex_anaphylaxis"}, null],
    },
    {
      kind: "antibiotic",
      title: "Give prophylaxis",
      description: "She has acute cholecystitis. There is no drug allergy. Incision is in 30 minutes.",
      choices: [
        "Give cefazolin 2 g now, so it is in within 60 minutes of incision, and redose after four hours.",
        "Give vancomycin 1.5 g as a ten-minute infusion right before incision to cover skin flora.",
        "Hold the antibiotic, since the gallbladder should come out intact inside a retrieval bag.",
      ],
      feedback: [
        "Cefazolin covers skin and biliary flora and is timed to be in the tissue at incision.",
        "Vancomycin run in over ten minutes causes a severe histamine-release reaction with hypotension.",
        "Acute cholecystitis carries infected bile; prophylaxis is indicated even if the specimen stays intact.",
      ],
      wrongComps: ["anaphylaxis", "infection"],
      consequences: [
        "Her upper body turns red, she wheezes against the ventilator, and BP falls to 74/42.",
        "Infected bile contaminates the port sites, and the umbilical wound becomes infected by day 3.",
      ],
      rescueVariants: [null, "wound"],
    },
    {
      kind: "position",
      title: "Position for laparoscopy",
      description: "She will be tilted head-up and left side down for most of the case.",
      choices: [
        "Reverse Trendelenburg with left tilt, a padded footboard, arms under 90 degrees, and calf sleeves on.",
        "Abduct both arms to 110 degrees on the boards so the surgeon and assistant can stand close to her.",
        "Leave the calf sleeves off; with her legs lower than her heart they are not needed.",
      ],
      feedback: [
        "A footboard stops her sliding, arms under 90 degrees protect the plexus, and sleeves fight head-up venous pooling.",
        "Abduction beyond 90 degrees stretches the brachial plexus for the whole case.",
        "Head-up tilt and pneumoperitoneum pool blood in the legs, which is exactly when sleeves matter, especially after a prior DVT.",
      ],
      wrongComps: ["nerve_injury", "thrombosis"],
      consequences: [
        "In recovery she cannot lift her right arm at the shoulder and the outer forearm is numb.",
        "By the evening her left calf is swollen and tender.",
      ],
    },
    {
      kind: "preop",
      title: "Secure the airway",
      description: "The abdomen will be insufflated with CO2 for about an hour.",
      choices: [
        "Intubate with a cuffed endotracheal tube and full muscle relaxation for the pneumoperitoneum.",
        "Use a supraglottic airway to avoid intubation, since it is a short laparoscopic case.",
        "Induce with a large propofol bolus and no vasopressor drawn up, since she is otherwise healthy.",
      ],
      feedback: [
        "A cuffed tube protects the lungs and lets you ventilate against the raised abdominal pressure.",
        "Pneumoperitoneum pushes the diaphragm up and pressures exceed the supraglottic seal, so ventilation fails and she can aspirate.",
        "A large bolus with nothing to treat the drop in pressure produces profound hypotension and bradycardia.",
      ],
      wrongComps: ["hypoxia", "cardiac_arrhythmia"],
      consequences: [
        "Once the gas goes in, the airway leaks, tidal volumes fall, and SpO2 drifts to 86%.",
        "Heart rate falls to 38 and the pressure to 60/30 before the first incision.",
      ],
    },

    // ── Access ───────────────────────────────────────────────────────────────
    {
      kind: "access",
      title: "Establish pneumoperitoneum",
      description: "Choose how to enter the abdomen at the umbilicus.",
      choices: [
        "Open Hasson entry at the umbilicus under direct vision, then insufflate to 12 mmHg.",
        "Push the first 12 mm trocar in at the umbilicus with a twisting thrust, then insufflate through it.",
        "Insufflate to 25 mmHg at high flow from the start to open up the working space.",
      ],
      feedback: [
        "Open entry sees the peritoneum before it is breached, and 12 mmHg gives room without cardiovascular strain.",
        "A blind thrust from the umbilicus can reach the aorta or iliac vessels in a patient with a deep abdomen.",
        "Rapid stretching of the peritoneum triggers a strong vagal reflex; high pressure also chokes venous return.",
      ],
      wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      consequences: [
        "Blood wells back up the trocar and the pressure falls to 62/30 within a minute.",
        "As the gas rushes in, the heart rate falls from 80 to 34, then there are pauses on the monitor.",
      ],
      effects: [null, {"repair": "major_vascular"}, null],
      rescueVariants: ["major", null],
    },
    {
      kind: "vitals",
      title: "Bradycardia during insufflation",
      description: "HR drops from 80 to 38 as the CO2 goes in. BP 90/55.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Stop insufflating, let the gas out, give glycopyrrolate, then restart slowly at a lower flow.",
        "Keep insufflating, since the vagal effect settles once the abdomen is fully distended.",
        "Tip her head down steeply to boost venous return while the gas keeps flowing in.",
      ],
      feedback: [
        "Removing the stimulus and blocking the vagal response restores the rate, and a slower restart prevents a repeat.",
        "Continued stretch keeps driving the vagal reflex and can progress to asystole.",
        "Head-down with a full abdomen pushes the diaphragm into the chest and collapses the lung bases.",
      ],
      wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      consequences: [
        "The monitor goes flat for four seconds before a slow junctional beat returns.",
        "Airway pressure jumps to 40 cmH2O and SpO2 falls to 88%.",
      ],
    },
    {
      kind: "exposure",
      title: "Place the working ports",
      description: "Epigastric and two right subcostal ports are needed.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Place each port under camera view, choosing sites where the camera shows no vessels.",
        "Put the epigastric port through the thickest part of the falciform ligament for a firmer hold.",
        "Place the lateral ports first, before the camera goes in, using surface landmarks to save a step.",
      ],
      feedback: [
        "Seeing each trocar tip enter avoids the epigastric vessels and any bowel stuck to the wall.",
        "The falciform ligament carries the paraumbilical veins and bleeds when a trocar is pushed through it.",
        "A trocar placed without the camera can go straight into adherent bowel.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "Blood runs down the epigastric port and drips across the liver onto the camera.",
        "When the camera goes in, a lateral trocar is sitting inside a loop of colon.",
      ],
      rescueVariants: [null, "bowel"],
      effects: [null, null, {"set": ["contaminated"], "repair": "colon_injury"}],
    },
    {
      kind: "exposure",
      title: "Retract the gallbladder",
      description: "The gallbladder is tense and inflamed.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Push the fundus over the liver toward the right shoulder and pull the infundibulum out laterally.",
        "Hold the tense gallbladder wall with a toothed grasper to get a firm, non-slip grip on it.",
        "Pull the fundus down toward her feet so that Calot's triangle opens toward the camera.",
      ],
      feedback: [
        "Cephalad fundus and lateral infundibulum open Calot's triangle and set the cystic duct at a right angle to the CBD.",
        "A toothed grasper punctures a tense, inflamed gallbladder and spills infected bile and stones.",
        "Pulling the fundus down levers against the liver and tears its capsule.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "Thick green bile and several small stones spill across the liver and into the right gutter.",
        "The liver capsule splits along the gallbladder edge and oozes blood steadily.",
      ],
      effects: [null, {"set": ["stones_spilled"]}, null],
    },
    {
      kind: "landmark",
      title: "Find your safe zone",
      description: "The anatomy around the infundibulum is swollen and hard to read.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Identify Rouvière's sulcus and keep all dissection above that line, on the gallbladder side.",
        "Begin below Rouvière's sulcus, where the tissue looks far less inflamed and easier to work in.",
        "Start medially on the hepatoduodenal ligament to find the common bile duct first and work outward.",
      ],
      feedback: [
        "Staying above Rouvière's sulcus keeps you away from the common bile duct.",
        "Below the sulcus lies the common bile duct; dissecting there is how duct injuries happen.",
        "The hepatoduodenal ligament holds the hepatic artery and portal vein; dissecting there invites major bleeding.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "A tube is opened, and bile, not blood, starts welling up from low in the field.",
        "A branch of the hepatic artery is torn and pulses into the porta hepatis.",
      ],
      effects: [null, {"repair": "bile_duct_injury"}, {"repair": "rha_bleed"}],
    },

    // ── Calot's triangle ────────────────────────────────────────────────────
    {
      kind: "dissect",
      title: "Open the peritoneum over Calot's triangle",
      description: "Start the dissection at the neck of the gallbladder.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Divide the peritoneum on the front and back of the infundibulum with the hook, close to the gallbladder.",
        "Clear the triangle with the hook on continuous coagulation at a high power setting.",
        "Separate the tissue in the triangle by tearing through it with the suction tip.",
      ],
      feedback: [
        "Opening both sides next to the gallbladder frees the neck without going near the duct.",
        "Continuous high-power coagulation spreads heat to the duct, which necroses and leaks days later.",
        "Tearing tissue in the triangle avulses small cystic artery branches.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "On day 4 she returns with fever and a bile collection from a burned duct that has broken down.",
        "Small arterial branches tear and bleed across Calot's triangle.",
      ],
      effects: [null, {"set": ["bdi_unrecognized"]}, null],
    },
    {
      kind: "landmark",
      title: "Achieve the critical view of safety",
      description: "You think you can see the cystic duct.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Clear the lower third of the gallbladder off the liver until only two structures enter it.",
        "Clip now, since one duct is clearly seen funneling into the gallbladder neck.",
        "Divide the pulsing structure running behind the duct, taking it to be the cystic artery.",
      ],
      feedback: [
        "Two structures entering the gallbladder, with the liver visible behind, is the proof you need before clipping.",
        "A duct funneling into the neck is the infundibular illusion; it may be the common bile duct.",
        "A pulsing vessel behind the duct is often the right hepatic artery looping close to the gallbladder.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "The clipped structure was the common bile duct. On day 2 she is jaundiced and febrile.",
        "The right hepatic artery is cut and pumps into the field, filling the view within seconds.",
      ],
      effects: [null, {"set": ["bdi_unrecognized"]}, {"repair": "rha_bleed"}],
    },
    {
      kind: "vessel",
      title: "Clip the cystic artery",
      description: "The critical view of safety is confirmed.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Place two clips toward the patient and one toward the gallbladder, then divide in between.",
        "Put a single clip on the artery and divide it with the hook right beside the clip.",
        "Clip it close to where it branches from the right hepatic artery, so the whole vessel is controlled.",
      ],
      feedback: [
        "Two clips on the patient side hold even if one fails, and cutting between clips leaves no heat near them.",
        "One clip with cautery beside it can loosen as the heat conducts along the metal.",
        "Clipping at the origin narrows or occludes the right hepatic artery itself.",
      ],
      wrongComps: ["hemorrhage", "thrombosis"],
      consequences: [
        "The single clip slides off and the cystic artery stump pulses into the field.",
        "On day 2 her liver enzymes soar and the right lobe looks ischemic on ultrasound.",
      ],
      rescueVariants: [null, "arterial"],
      effects: [null, {"repair": "cystic_stump"}, null],
    },
    {
      kind: "core",
      title: "Clip and divide the cystic duct",
      description: "The cystic duct is about 5 mm wide.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Clip the duct near the gallbladder, with two clips on the patient side, then cut between them.",
        "Clip the duct right against the common bile duct so that no long stump is left behind.",
        "Clip the duct together with the tissue behind it, so the posterior branch is closed in the same pass.",
      ],
      feedback: [
        "Clipping near the gallbladder leaves a safe margin from the CBD and a secure double-clipped stump.",
        "Clipping flush against the CBD narrows it or catches its wall, and bile leaks or backs up.",
        "Bundled clips hold poorly; the posterior artery branch tears when the duct is divided.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "By day 3 she has rising bilirubin, fever, and right upper quadrant pain from a narrowed duct.",
        "A torn posterior branch bleeds from behind the duct stump as soon as it is cut.",
      ],
      effects: [null, {"set": ["bdi_unrecognized"]}, null],
    },
    {
      kind: "dissect",
      title: "Take the gallbladder off the liver bed",
      description: "The duct and artery are divided.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Dissect in the loose areolar plane between gallbladder and liver, staying on the gallbladder wall.",
        "Dissect a millimeter inside the liver capsule, which leaves a cleaner, thicker edge on the gallbladder side.",
        "Peel the gallbladder off the bed by pulling it hard up toward the abdominal wall.",
      ],
      feedback: [
        "The areolar plane is bloodless and keeps the gallbladder intact.",
        "Going deep to the capsule opens branches of the middle hepatic vein in the bed.",
        "Hard traction tears the inflamed gallbladder and spills its stones.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "Dark venous blood wells up from the liver bed faster than suction clears it.",
        "The gallbladder tears open and a shower of stones drops over the liver.",
      ],
      effects: [null, {"repair": "liver_bed_bleed"}, {"set": ["stones_spilled"]}],
    },
    {
      kind: "bleed",
      title: "Control the cystic artery stump",
      description: "A clip has slipped and the stump is pulsing, obscuring the view.",
      when: {"none": ["lap_ended", "cystic_stump_repaired"]},
      choices: [
        "Grasp the stump with an atraumatic grasper, suction the field, and place a new clip under vision.",
        "Fire clips repeatedly into the pooling blood where the stump was until the bleeding stops.",
        "Seal the pooled area with the hook on high coagulation, since heat will cauterize the bleeding artery.",
      ],
      feedback: [
        "Holding the stump stops the bleeding and gives a clear view for a definitive clip.",
        "Clips fired into a pool of blood catch whatever is underneath, including the common bile duct.",
        "Cautery into a pool of blood does not seal an artery and spreads heat to the duct.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "The bleeding slows, but one of those clips is across the common bile duct; she is jaundiced on day 2.",
        "The artery keeps pumping through the char and the suction cannot keep up.",
      ],
      effects: [null, {"set": ["bdi_unrecognized"]}, {"repair": "cystic_stump"}],
    },
    {
      kind: "verify",
      title: "Recheck the cystic artery stump",
      description: "The stump you re-clipped earlier is in view again before you move on.",
      when: {"all": ["cystic_stump_repaired"], "none": ["lap_ended"]},
      choices: [
        "Drop the pressure to 8 mmHg and watch the stump for a minute; both clips sit square and dry.",
        "Add a third clip across the stump, deep toward the pedicle, as extra insurance before moving on.",
        "Touch the tip of the stump with the hook on coagulation to seal it behind the two new clips.",
      ],
      feedback: [
        "Low pressure unmasks a slow leak, and two square clips on a dry stump need nothing more.",
        "A clip placed deep on the pedicle can catch the side of the common bile duct.",
        "Heat conducts along metal clips and loosens them, so the stump bleeds again later.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "On day 2 she has fever and rising bilirubin; the extra clip narrowed the common bile duct.",
        "The stump starts pulsing again twenty minutes later as the clips loosen.",
      ],
      effects: [null, {"set": ["bdi_unrecognized"]}, {"repair": "cystic_stump"}],
    },
    {
      kind: "vitals",
      title: "Rising end-tidal CO2",
      description: "EtCO2 is 58 and climbing, with ectopic beats. Insufflation is at 15 mmHg.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Lower the pressure to 10 mmHg, raise minute ventilation, and feel the chest wall for surgical emphysema.",
        "Carry on at the same settings, because CO2 always rises during a laparoscopic case.",
        "Raise the insufflation pressure to 20 mmHg so the dissection finishes sooner and the gas can come out.",
      ],
      feedback: [
        "Less gas absorbed and more ventilation bring the CO2 down, and the check finds any subcutaneous tracking.",
        "Uncorrected hypercarbia and acidosis make the myocardium irritable, and the ectopics become runs.",
        "Higher pressure drives more CO2 absorption and splints the diaphragm further.",
      ],
      wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      consequences: [
        "EtCO2 reaches 72 and the ectopics become a run of ventricular tachycardia.",
        "Airway pressures climb, the lung bases collapse, and SpO2 falls to 87%.",
      ],
    },
    {
      kind: "vitals",
      title: "Sudden collapse under pneumoperitoneum",
      description: "EtCO2 suddenly falls from 40 to 15, BP drops to 70/40, and a mill-wheel murmur is heard.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Stop insufflating, release the gas, put her left side down and head down, and ventilate with 100% oxygen.",
        "Increase the insufflation flow to restore the working space while anesthesia gives ephedrine.",
        "Tilt her head up and right side down so the gas bubble can pass on into the lungs.",
      ],
      feedback: [
        "This is CO2 embolism; left-down, head-down traps the gas in the right atrium away from the outflow tract.",
        "More gas enlarges the embolus and the heart stops.",
        "Letting the gas pass into the pulmonary artery blocks lung perfusion and oxygenation collapses.",
      ],
      wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      consequences: [
        "The rhythm degenerates into pulseless electrical activity within a minute.",
        "SpO2 plunges to 70% and EtCO2 stays near zero as the gas blocks her pulmonary circulation.",
      ],
      effects: [null, {"repair": "co2_embolism_arrest"}, {"repair": "co2_embolism_arrest"}],
    },

    // ── Retrieval and final checks ──────────────────────────────────────────
    {
      kind: "core",
      title: "Retrieve the gallbladder",
      description: "The specimen is free and full of stones.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Place it in a retrieval bag and bring it out at the umbilicus, widening the fascia if it sticks.",
        "Pull it out bare through the umbilical port, crushing the stones with forceps so it fits through.",
        "Enlarge the epigastric port sideways through the rectus muscle to pull the gallbladder out there.",
      ],
      feedback: [
        "A bag contains bile and stones, and widening the fascia avoids tearing the bag.",
        "A bare, crushed gallbladder leaks infected bile into the port track.",
        "Extending sideways through the rectus cuts the superior epigastric vessels.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "Bile smears through the umbilical wound as the gallbladder splits during extraction.",
        "Bright blood pours from the enlarged epigastric port and runs over the drapes.",
      ],
      rescueVariants: ["wound", null],
    },
    {
      kind: "verify",
      title: "Deal with spilled stones",
      description: "Two stones fell out when the gallbladder tore.",
      when: {"all": ["stones_spilled"], "none": ["lap_ended"]},
      choices: [
        "Retrieve every visible stone into a bag and irrigate the right upper quadrant until clear.",
        "Leave the small stones behind, since they are sterile and the body will absorb them in time.",
        "Chase the stones deep behind the duodenum with the grasper until every last one is found.",
      ],
      feedback: [
        "Recovering the stones and washing the bile away prevents a late abscess.",
        "Retained stones carry bacteria and become the core of an abscess months later.",
        "Blind grasping behind the duodenum tears the pancreaticoduodenal vessels.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "Three months later she has fever and a subhepatic abscess around a retained stone.",
        "Blood wells up from behind the duodenum where the grasper tore a vessel.",
      ],
    },
    {
      kind: "verify",
      title: "Irrigate the gallbladder fossa",
      description: "The gallbladder came out intact. The fossa has a little old blood in it.",
      when: {"none": ["stones_spilled", "lap_ended"]},
      choices: [
        "Irrigate the fossa, then suction it dry and look at the returning fluid for bile or blood.",
        "Run in three liters of warm saline and leave it in the abdomen to be absorbed over the night.",
        "Wipe the liver bed firmly with a gauze swab on a grasper to clear the clots off its surface.",
      ],
      feedback: [
        "Suctioning dry shows whether the fluid comes back clear, and leaves nothing for bacteria to grow in.",
        "Large volumes left behind dilute the peritoneum's defenses and pool under the liver.",
        "Rubbing the bed pulls off the clots that are sealing small veins, and it bleeds again.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "On day 5 she has a fever and a fluid collection under the liver.",
        "Fresh blood oozes from the bed as each clot is wiped away.",
      ],
    },
    {
      kind: "verify",
      title: "Inspect before closing",
      description: "The field looks dry at 12 mmHg.",
      when: {"none": ["lap_ended"]},
      choices: [
        "Drop the pressure to 8 mmHg and check the stumps and the liver bed for blood or bile.",
        "Inspect at the full 12 mmHg, since the view of the liver bed is clearest with the abdomen fully open.",
        "Irrigate and leave a drain in place of checking the bed for bile staining.",
      ],
      feedback: [
        "Venous oozing hidden by the gas pressure shows once the pressure is lowered.",
        "Pneumoperitoneum tamponades small veins that bleed once the abdomen is let down.",
        "A drain does not stop a leak; a stained bed seen now can be clipped or sutured.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "In recovery her abdomen distends and hemoglobin falls from 12.8 to 9.6.",
        "On day 2 the drain fills with bile and she develops a fever.",
      ],
      rescueVariants: ["postop", null],
      effects: [null, {"repair": "reoperation_lap"}, {"set": ["bile_leak"]}],
    },

    // ── Closure ─────────────────────────────────────────────────────────────
    {
      kind: "closure",
      title: "Close the umbilical fascia",
      description: "The umbilical port was widened for extraction.",
      when: {"none": ["converted_open"]},
      choices: [
        "Close the umbilical fascia with a 0 absorbable suture, lifting the edges so nothing lies beneath.",
        "Close only the skin at the umbilicus, since the fascial defect is small and will scar down on its own.",
        "Anchor the fascial stitch lateral into the rectus muscle on each side for a stronger hold.",
      ],
      feedback: [
        "A closed, lifted fascia prevents a port-site hernia without catching bowel.",
        "An open fascial defect lets bowel slip in, and it can strangulate.",
        "Wide lateral bites into the rectus catch the epigastric vessels.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "On day 5 she vomits with a tender umbilical lump: bowel is trapped and turning gangrenous.",
        "A hematoma swells under the umbilicus in recovery.",
      ],
      rescueVariants: ["bowel", "postop"],
      effects: [null, {"set": ["port_hernia"]}, null],
    },
    {
      kind: "closure",
      title: "Close the laparotomy",
      description: "The open part of the operation is over and the abdomen needs closing.",
      when: {"all": ["converted_open"]},
      choices: [
        "Close the fascia with a continuous slowly absorbable loop, taking small 5 mm bites every 5 mm.",
        "Close the fascia with large bites a centimeter from the edge and a centimeter apart, tied tight.",
        "Close fascia and skin now while the wound edges still ooze; the closure pressure will stop it.",
      ],
      feedback: [
        "Small bites give a suture length at least four times the wound length, with fewer infections and hernias.",
        "Large, tight bites cut through ischemic fascia, and the wound breaks down and becomes infected.",
        "Oozing wound edges fill the closed wound with blood, and a hematoma forms under the skin.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "On day 6 the wound is red and leaking pus, and the fascia feels loose underneath.",
        "The wound swells tense and purple within an hour of closing.",
      ],
      rescueVariants: ["wound", "postop"],
    },
    {
      kind: "closure",
      title: "Remove the ports",
      description: "The procedure is complete.",
      when: {"none": ["converted_open"]},
      choices: [
        "Remove each port under camera view and watch its site for bleeding before letting the gas out.",
        "Pull all the ports and let the gas out together, then close the skin while the team clears up.",
        "Let the bile-stained irrigation drain out through the port sites as the ports come out.",
      ],
      feedback: [
        "Watching each site as the port leaves catches bleeding the port was compressing.",
        "A port compresses its own track; bleeding only shows once it is out, and no one is looking.",
        "Contaminated fluid in the port tracks seeds wound infections.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "Blood seeps from a lateral port site in recovery, and a hematoma forms in the abdominal wall.",
        "On day 3 two port sites are red and discharging pus.",
      ],
      rescueVariants: ["postop", "wound"],
    },

    // ── Wake-up and recovery ────────────────────────────────────────────────
    {
      kind: "postop",
      title: "Reverse and extubate",
      description: "The case is over. She received rocuronium 40 minutes ago.",
      when: {"none": ["icu_ventilated"]},
      choices: [
        "Reverse with sugammadex, confirm a train-of-four ratio over 0.9, then extubate her awake.",
        "Extubate once she lifts her head for a moment, taking that as proof of full reversal.",
        "Give neostigmine 5 mg without glycopyrrolate, because her heart rate is already 95.",
      ],
      feedback: [
        "Measured full reversal before extubation prevents residual weakness of the airway muscles.",
        "A brief head lift can occur with significant residual block; the airway then fails.",
        "Neostigmine without an anticholinergic causes profound bradycardia.",
      ],
      wrongComps: ["hypoxia", "cardiac_arrhythmia"],
      consequences: [
        "In recovery her breathing becomes shallow and rocking, and SpO2 falls to 82%.",
        "Her heart rate drops to 30 and she becomes grey and clammy.",
      ],
    },
    {
      kind: "postop",
      title: "Hand over to intensive care",
      description: "The operation is over. She is intubated after a major intraoperative crisis.",
      when: {"all": ["icu_ventilated"]},
      choices: [
        "Keep her sedated and ventilated, keep warming her, and hand over the products given and the plan.",
        "Wake and extubate her in theater now that things are stable, then send her up to ICU on a face mask.",
        "Give her two liters of saline before she leaves, so she arrives in ICU well filled for the night.",
      ],
      feedback: [
        "She is cold, acidotic, and newly resuscitated, so she stays ventilated until her physiology recovers.",
        "Extubating a cold, acidotic patient after a crisis invites airway failure and pulmonary edema.",
        "More crystalloid after heavy resuscitation fills her lungs and dilutes her clotting factors.",
      ],
      wrongComps: ["hypoxia", "fluid_overload"],
      consequences: [
        "Twenty minutes after extubation she is tiring, with SpO2 of 84%.",
        "In ICU her lungs crackle, SpO2 falls to 88%, and she needs more PEEP.",
      ],
    },
    {
      kind: "postop",
      title: "Nausea in recovery",
      description: "She is retching and has a history of motion sickness.",
      when: {"none": ["icu_ventilated"]},
      choices: [
        "Sit her up, suction her mouth, and give ondansetron, then review her opioid use.",
        "Lay her flat and give morphine 10 mg, which should settle both her pain and her nausea.",
        "Give a two-liter saline bolus over thirty minutes, since dehydration drives most of this nausea.",
      ],
      feedback: [
        "Sitting up protects the airway and an antiemetic treats the cause.",
        "Lying flat while vomiting risks aspiration, and morphine makes the nausea worse.",
        "A rapid two-liter bolus in a euvolemic patient overloads the circulation.",
      ],
      wrongComps: ["hypoxia", "fluid_overload"],
      consequences: [
        "She vomits lying flat, coughs, and SpO2 falls to 85% with right-sided crackles.",
        "She becomes breathless and her lung bases crackle as the fluid runs in.",
      ],
    },
    {
      kind: "postop",
      title: "Low blood pressure in recovery",
      description: "One hour after surgery, BP 88/50 and HR 115. Her abdomen is a little fuller. She is normally on apixaban.",
      when: {"none": ["major_bleed"]},
      choices: [
        "Treat it as bleeding: give a fluid bolus, get an urgent hemoglobin and crossmatch, and call the surgeon.",
        "Put it down to leftover anesthetic vasodilation and start a phenylephrine infusion to hold the pressure.",
        "Give three liters of crystalloid over the next hour, then recheck her in the morning.",
      ],
      feedback: [
        "A fast pulse and low pressure after surgery on apixaban is bleeding until proven otherwise.",
        "A vasopressor props up the number while she keeps bleeding into the abdomen.",
        "Large crystalloid volumes dilute her blood and flood the lungs without stopping the bleeding.",
      ],
      wrongComps: ["hemorrhage", "fluid_overload"],
      consequences: [
        "Her abdomen keeps swelling and her hemoglobin falls from 12 to 7.9 before anyone looks again.",
        "By morning she is short of breath with crackles, and her hemoglobin has halved by dilution.",
      ],
      rescueVariants: ["postop", null],
    },
    {
      kind: "postop",
      title: "Oozing after major blood loss",
      description: "Two hours after surgery she oozes from every wound. INR 1.9, fibrinogen 1.0 g/L, temperature 35.2 °C, ionized calcium 0.92.",
      when: {"all": ["major_bleed"]},
      choices: [
        "Warm her, give fibrinogen and plasma, replace calcium, and recheck with a viscoelastic test.",
        "Give two more units of red cells alone, because the hemoglobin is the number that keeps falling.",
        "Give a full dose of recombinant factor VIIa now to switch the clotting cascade back on in one step.",
      ],
      feedback: [
        "Coagulopathy after massive bleeding comes from cold, low fibrinogen, and low calcium; fix each one.",
        "Red cells alone dilute the fibrinogen and platelets that are left, so the oozing gets worse.",
        "Factor VIIa is a last resort that does little in a cold, acidotic patient and causes thrombosis.",
      ],
      wrongComps: ["hemorrhage", "thrombosis"],
      consequences: [
        "The oozing speeds up and her hemoglobin falls to 6.8.",
        "The next morning her right leg is cold and pulseless from an arterial clot.",
      ],
      rescueVariants: ["postop", "arterial"],
    },
    {
      kind: "postop",
      title: "Shoulder-tip pain",
      description: "She has sharp right shoulder pain four hours after surgery. ECG and vitals are normal.",
      when: {"none": ["converted_open", "port_hernia"]},
      choices: [
        "Explain it is referred pain from the CO2 and give paracetamol and ibuprofen with warmth.",
        "Treat it as cardiac pain: give aspirin 300 mg and start heparin while the troponin is sent.",
        "Give morphine 10 mg IV in a single bolus so she can finally rest through the night.",
      ],
      feedback: [
        "Residual CO2 irritates the diaphragm and refers pain to the shoulder; it settles with simple analgesia.",
        "Aspirin and heparin in a patient with a fresh liver bed and recent apixaban cause bleeding.",
        "A large single opioid bolus in a sleeping patient depresses her breathing.",
      ],
      wrongComps: ["hemorrhage", "hypoxia"],
      consequences: [
        "Her port sites ooze through the dressings and her hemoglobin drops overnight.",
        "The night nurse finds her breathing six times a minute with SpO2 of 84%.",
      ],
      rescueVariants: ["postop", null],
    },
    {
      kind: "postop",
      title: "Vomiting with an umbilical lump",
      description: "Day 2. She is vomiting and has a tender, firm lump under the umbilical scar.",
      when: {"all": ["port_hernia"]},
      choices: [
        "Keep her fasted, pass a nasogastric tube, get an urgent CT, and warn theater.",
        "Push the lump back through the scar at the bedside and send her home if it stays in.",
        "Give an antiemetic and a laxative, since opioid constipation explains most day-2 vomiting.",
      ],
      feedback: [
        "A painful lump at a port site with vomiting is an incarcerated hernia until the CT says otherwise.",
        "Forcing back bowel that may be dead hides a perforation inside the abdomen.",
        "Treating it as constipation leaves trapped bowel to strangulate.",
      ],
      wrongComps: ["infection", "cardiac_arrhythmia"],
      consequences: [
        "Hours later she has a rigid abdomen; the bowel that was pushed back has perforated.",
        "After a day of vomiting her potassium is 2.6 and runs of ectopics appear.",
      ],
      rescueVariants: ["bowel", null],
      effects: [{"repair": "port_hernia_repair"}, null, null],
    },
    {
      kind: "postop",
      title: "Replace her potassium",
      description: "After repeated vomiting her potassium is 3.0 mmol/L. She is drinking.",
      when: {"none": ["icu_ventilated"]},
      choices: [
        "Give oral potassium chloride 40 mmol now and recheck the level in the morning.",
        "Give 40 mmol of IV potassium over fifteen minutes through her peripheral cannula.",
        "Run three liters of saline overnight to replace everything she vomited today.",
      ],
      feedback: [
        "She is drinking, so oral replacement is effective and carries no risk of a sudden potassium surge.",
        "Rapid IV potassium reaches the heart before it redistributes and causes arrhythmias.",
        "Three liters overnight for a drinking patient is far more than she needs.",
      ],
      wrongComps: ["cardiac_arrhythmia", "fluid_overload"],
      consequences: [
        "Halfway through the infusion her ECG shows peaked T waves, then ventricular ectopics.",
        "By morning her ankles are swollen and she is breathless lying flat.",
      ],
    },
    {
      kind: "postop",
      title: "High potassium in ICU",
      description: "After the transfusion and a period of shock her potassium is 6.3, with peaked T waves.",
      when: {"all": ["icu_ventilated"]},
      choices: [
        "Give 10 mL of 10% calcium gluconate, then insulin with glucose, and recheck in an hour.",
        "Repeat the sample in the morning, since stored blood often hemolyzes and falsely raises the level.",
        "Run two liters of saline over two hours to dilute the potassium down to a safer level.",
      ],
      feedback: [
        "Calcium stabilizes the heart within minutes, and insulin moves potassium into the cells.",
        "Peaked T waves mean the level is real and the heart is already affected.",
        "Dilution barely lowers the potassium and floods lungs that are already wet.",
      ],
      wrongComps: ["cardiac_arrhythmia", "fluid_overload"],
      consequences: [
        "An hour later the QRS widens and she goes into ventricular tachycardia.",
        "Her SpO2 falls to 89% and the ventilator pressures climb.",
      ],
    },
    {
      kind: "postop",
      title: "She cannot pass urine",
      description: "Eight hours after surgery she has not voided and her bladder is palpable.",
      when: {"none": ["icu_ventilated"]},
      choices: [
        "Confirm with a bladder scan, then drain it with a single in-out pass of a latex-free catheter.",
        "Pass a standard catheter from the ward stock so she is relieved before the night team takes over.",
        "Leave an indwelling catheter in place for three days so this cannot happen again.",
      ],
      feedback: [
        "A scan confirms retention, and a latex-free, single drainage respects her allergy and lowers infection risk.",
        "Standard ward catheters are latex, and urethral mucosa absorbs the allergen fast.",
        "Each day a catheter stays in raises the chance of a urinary infection.",
      ],
      wrongComps: ["anaphylaxis", "infection"],
      consequences: [
        "Within minutes she is wheezing and flushed with swollen lips, and BP falls to 76/40.",
        "On day 3 she has fever, rigors, and cloudy urine.",
      ],
      rescueVariants: [null, "urinary"],
    },
    {
      kind: "dvt",
      title: "Order VTE prophylaxis",
      description: "She had a DVT last year and is normally on apixaban.",
      when: {"none": ["major_bleed"]},
      choices: [
        "Enoxaparin 40 mg from this evening plus compression sleeves, and walking from tomorrow.",
        "Enoxaparin 1.5 mg/kg once daily starting this evening, to match her clot history.",
        "Early walking alone, since the operation was short and laparoscopic.",
      ],
      feedback: [
        "Prophylactic-dose enoxaparin with mechanical measures protects her without making the liver bed bleed.",
        "A full treatment dose on the evening of surgery makes the liver bed and port sites bleed.",
        "A previous DVT puts her at high risk; walking alone is not enough.",
      ],
      wrongComps: ["hemorrhage", "thrombosis"],
      consequences: [
        "A hematoma spreads across her abdominal wall and blood seeps from the ports.",
        "On day 3 her left leg swells from groin to ankle.",
      ],
      rescueVariants: ["postop", null],
    },
    {
      kind: "dvt",
      title: "Time VTE prophylaxis after the bleed",
      description: "She had a DVT last year, and needed transfusion during this operation.",
      when: {"all": ["major_bleed"]},
      choices: [
        "Calf compression sleeves now, and enoxaparin 40 mg once there has been no bleeding for 24 hours.",
        "Start enoxaparin 40 mg this evening as normal, since her clot risk is higher than her bleed risk.",
        "Hold every form of prophylaxis, sleeves included, until she is walking on the ward.",
      ],
      feedback: [
        "Mechanical protection starts now, and the drug waits until the bleeding has clearly stopped.",
        "Enoxaparin hours after a major bleed restarts it.",
        "After a prior DVT, a major bleed, and bed rest, no prophylaxis at all lets a clot form.",
      ],
      wrongComps: ["hemorrhage", "thrombosis"],
      consequences: [
        "Overnight her drain and wounds start bleeding again.",
        "On day 3 her left leg is swollen from groin to ankle.",
      ],
      rescueVariants: ["postop", null],
    },
    {
      kind: "postop",
      title: "Breathless on day 1",
      description: "SpO2 91% on air, HR 112, mild pleuritic pain. She had a DVT last year.",
      choices: [
        "Examine her, get an ECG and a CT pulmonary angiogram, and start anticoagulation if a clot is confirmed.",
        "Call it atelectasis after laparoscopy and treat her with incentive spirometry and walking only.",
        "Give furosemide 80 mg IV for presumed fluid overload and recheck her in the afternoon.",
      ],
      feedback: [
        "Tachycardia and hypoxia after surgery in a patient with prior DVT demand a search for pulmonary embolism.",
        "Atelectasis is common, but assuming it here misses a pulmonary embolus.",
        "A large diuretic dose in a patient who is not overloaded drops her potassium and her volume.",
      ],
      wrongComps: ["thrombosis", "cardiac_arrhythmia"],
      consequences: [
        "That evening she collapses on the ward with a massive pulmonary embolus.",
        "Her potassium falls to 2.8 and the monitor shows runs of atrial fibrillation.",
      ],
    },
    {
      kind: "postop",
      title: "Rising bilirubin on day 2",
      description: "Bilirubin 58 µmol/L and rising, with mild right upper quadrant pain.",
      when: {"none": ["bdi_unrecognized", "bile_leak", "bdi_managed"]},
      choices: [
        "Order an MRCP and ask gastroenterology about ERCP for a retained stone or a duct injury.",
        "Watch and wait for a week, since mild jaundice often settles on its own after surgery.",
        "Give vitamin K and two units of fresh frozen plasma to correct the jaundice before any imaging.",
      ],
      feedback: [
        "Imaging defines whether a stone or a duct injury is blocking the bile, and ERCP can clear it.",
        "An obstructed, stagnant bile duct becomes infected, and she develops cholangitis.",
        "Plasma does not treat jaundice; it only adds volume to a patient who needs imaging.",
      ],
      wrongComps: ["infection", "fluid_overload"],
      consequences: [
        "On day 5 she has fever, rigors, and deep jaundice, with falling blood pressure.",
        "She becomes breathless with crackles after the plasma, and the jaundice keeps rising.",
      ],
    },
    {
      kind: "postop",
      title: "Fever and jaundice on day 2",
      description: "Bilirubin 64 µmol/L and rising, fever 38.4 °C, and right upper quadrant pain. Ultrasound shows fluid under the liver.",
      when: {"all": ["bdi_unrecognized"]},
      choices: [
        "Start IV antibiotics and get a CT and an MRCP to see whether a duct is blocked or leaking.",
        "Put it down to retained stones and book her for a routine ERCP on the next available list.",
        "Treat the fever with oral antibiotics and send her home, with liver tests in a week.",
      ],
      feedback: [
        "Fever, jaundice, and fluid after this operation mean a bile duct injury until imaging says otherwise.",
        "A routine list leaves an injured duct and a bile collection untreated for days.",
        "Sending her home with an undrained bile collection lets it become an abscess.",
      ],
      wrongComps: ["infection", "fluid_overload"],
      consequences: [
        "By day 4 she is septic with deep jaundice and a lactate of 4.",
        "Back in two days with septic shock, she needs six liters of fluid and her lungs fill.",
      ],
      effects: [{"repair": "bdi_postop"}, null, null],
    },
    {
      kind: "postop",
      title: "Bile in the drain on day 2",
      description: "The drain has put out 300 mL of green fluid since yesterday. She has a mild fever. Bilirubin is normal.",
      when: {"all": ["bile_leak"], "none": ["bdi_unrecognized"]},
      choices: [
        "Get an ultrasound to check the drain is clearing everything, and ask for an ERCP.",
        "Pull the drain out, since it is keeping a track open that lets the bile keep flowing.",
        "Clamp the drain for 24 hours to see whether the leak has stopped on its own.",
      ],
      feedback: [
        "A bile leak with a normal bilirubin is usually a cystic stump or bed duct, which ERCP finds and treats.",
        "Removing the drain lets the leaking bile pool inside, and it becomes infected.",
        "A clamped drain turns an open leak into a closed collection under pressure.",
      ],
      wrongComps: ["infection", "fluid_overload"],
      consequences: [
        "Two days later she is febrile with a large collection under the liver.",
        "She becomes septic and needs large volumes of fluid; her ankles and lungs fill.",
      ],
      effects: [{"repair": "bile_leak_mgmt"}, null, null],
    },
    {
      kind: "postop",
      title: "Check the bile duct repair",
      description: "Day 7 after the duct repair. The T-tube drains 150 mL a day and she feels well.",
      when: {"all": ["bdi_managed"], "none": ["bdi_unrecognized", "bile_leak"]},
      choices: [
        "Do a T-tube cholangiogram; if there is no leak or narrowing, clamp the tube and leave it in.",
        "Pull the T-tube out today, since the drain is dry and a cholangiogram adds nothing.",
        "Restart full-dose apixaban today and pull the T-tube tomorrow, since her clot risk comes first.",
      ],
      feedback: [
        "The cholangiogram proves the repair is sealed and open before the tube is clamped; the track needs weeks to mature.",
        "An immature track leaks bile into the abdomen when the tube is removed.",
        "Pulling a tube from the liver on full anticoagulation bleeds into the bile ducts.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "That night she has severe pain and fever; bile has leaked into the abdomen.",
        "She vomits blood and the tube fills with clot the next day.",
      ],
      rescueVariants: [null, "postop"],
    },
    {
      kind: "postop",
      title: "Pain relief for home",
      description: "She is going home on day 2 and will restart apixaban.",
      when: {"none": ["converted_open"]},
      choices: [
        "Paracetamol and ibuprofen for three days, then paracetamol alone once the apixaban restarts.",
        "A two-week supply of modified-release oxycodone twice daily, so her pain never breaks through.",
        "Ibuprofen 800 mg four times a day for two weeks alongside her apixaban.",
      ],
      feedback: [
        "Short NSAID use before anticoagulation restarts, then paracetamol, controls pain without adding bleeding risk.",
        "Long-acting opioids at home, with no monitoring, cause respiratory depression during sleep.",
        "High-dose NSAIDs on top of apixaban greatly raise the risk of bleeding.",
      ],
      wrongComps: ["hypoxia", "hemorrhage"],
      consequences: [
        "Her husband cannot wake her on the second night at home; her lips are blue.",
        "A week later she vomits blood from a stomach ulcer.",
      ],
      rescueVariants: [null, "postop"],
    },
    {
      kind: "postop",
      title: "Pain relief after the open operation",
      description: "She has a fresh laparotomy wound and is on the ward.",
      when: {"all": ["converted_open"]},
      choices: [
        "Regular paracetamol, rectus sheath catheter local anesthetic, and a morphine PCA with sedation checks.",
        "A morphine PCA with a background infusion running, so she keeps getting pain relief even while she sleeps.",
        "Ibuprofen 800 mg three times a day as the main painkiller, to keep her opioid use low.",
      ],
      feedback: [
        "Layered analgesia keeps her coughing and walking with the smallest safe opioid dose.",
        "A background infusion keeps giving morphine as she becomes drowsy, and her breathing slows.",
        "High-dose NSAIDs after a big open operation and with anticoagulation to restart invite bleeding.",
      ],
      wrongComps: ["hypoxia", "hemorrhage"],
      consequences: [
        "At 3 a.m. she is breathing six times a minute with SpO2 of 82%.",
        "Her wound oozes and she has coffee-ground vomit by day 3.",
      ],
      rescueVariants: [null, "postop"],
    },
    {
      kind: "postop",
      title: "Restart her anticoagulant",
      description: "She wants to fly home on day 4. She normally takes apixaban.",
      when: {"none": ["icu_ventilated", "bdi_managed"]},
      choices: [
        "Restart apixaban 48 hours after surgery once the wound is dry, then approve the flight.",
        "Restart full-dose apixaban tonight and add a daily aspirin, since she is flying home.",
        "Hold the apixaban until the two-week clinic visit, and let her fly home in the meantime.",
      ],
      feedback: [
        "48 hours balances liver bed healing against her clot risk, and she flies protected.",
        "Full anticoagulation plus aspirin on the night of surgery makes the liver bed bleed.",
        "Two weeks off anticoagulation, with a long flight, after a prior DVT is a clot waiting to happen.",
      ],
      wrongComps: ["hemorrhage", "thrombosis"],
      consequences: [
        "Overnight her abdomen distends and her hemoglobin falls, from bleeding in the liver bed.",
        "She lands with chest pain and breathlessness from a pulmonary embolus.",
      ],
      rescueVariants: ["postop", null],
    },
    {
      kind: "dvt",
      title: "Plan her anticoagulation after the major operation",
      description: "Day 8 after a major, complicated operation. No bleeding for several days and a stable hemoglobin. She normally takes apixaban.",
      when: {"any": ["icu_ventilated", "bdi_managed"]},
      choices: [
        "Continue prophylactic enoxaparin, then restart apixaban once she is eating and the wounds stay dry.",
        "Restart full-dose apixaban tonight and add daily aspirin, to make up for the days she has missed.",
        "Hold all anticoagulation until her clinic review in six weeks, since her operation was so complicated.",
      ],
      feedback: [
        "A stepwise return protects her from clots without risking the fresh repair and wounds.",
        "Full anticoagulation plus aspirin days after a major bleed restarts it.",
        "Weeks without anticoagulation after a DVT, surgery, and an ICU stay invite a pulmonary embolism.",
      ],
      wrongComps: ["hemorrhage", "thrombosis"],
      consequences: [
        "Two days later her hemoglobin falls again and the wound fills with blood.",
        "Ten days later she collapses at home with a pulmonary embolus.",
      ],
      rescueVariants: ["postop", null],
    },
  ],
  repairs: {
    "latex_anaphylaxis": {
      title: "Latex anaphylaxis",
      then: "next",
      done: {"set": ["latex_anaphylaxis"]},
      steps: [
        {
          kind: "preop",
          title: "Remove the latex",
          description: "The first adrenaline dose has brought her BP up to 92/50. The latex catheter and gloves are still in use.",
          choices: [
            "Take out the catheter, have everyone change to latex-free gloves, and re-drape with latex-free kit.",
            "Leave the catheter in, since the reaction has already started and taking it out will not reverse it.",
            "Remove the latex and give 1 mg of IV adrenaline as a bolus, so the reaction is fully over.",
          ],
          feedback: [
            "Removing every source of the allergen stops the reaction from being driven on.",
            "Latex on the urethral mucosa keeps releasing allergen, and the reaction keeps going.",
            "A 1 mg IV bolus is a cardiac arrest dose; with a pulse it causes severe hypertension and VT.",
          ],
          wrongComps: ["anaphylaxis", "cardiac_arrhythmia"],
          consequences: [
            "Her pressure drops back to 64/30 and the wheeze returns.",
            "BP spikes to 240/130 and the monitor shows ventricular tachycardia.",
          ],
        },
        {
          kind: "preop",
          title: "Decide whether to operate",
          description: "Twenty minutes later she is stable on a low adrenaline infusion. BP 112/68, airway pressures normal.",
          choices: [
            "Go ahead in a latex-free room once she is stable, with the adrenaline still running.",
            "Wake her now and extubate her, then rebook the operation for another week.",
            "Go ahead now, insufflating to 15 mmHg while the adrenaline is still at a high dose.",
          ],
          feedback: [
            "Her gallbladder is acutely inflamed, and a stable grade 3 reaction can continue in a latex-free room.",
            "Extubating soon after anaphylaxis risks a swollen airway that closes after the tube is out.",
            "Pneumoperitoneum cuts venous return while her circulation is still unstable.",
          ],
          wrongComps: ["hypoxia", "cardiac_arrhythmia"],
          consequences: [
            "Minutes after extubation she has stridor and SpO2 of 82%.",
            "As the gas goes in, her pressure collapses and the rhythm becomes a slow junctional one.",
          ],
        },
        {
          kind: "preop",
          title: "Confirm and record the reaction",
          description: "The adrenaline infusion is being weaned.",
          choices: [
            "Send mast cell tryptase now, again within two hours and at 24 hours, and refer her to allergy.",
            "Record it as a reaction to the antibiotic in her notes, since that drug went in last.",
            "Keep giving 20 mL/kg of fluid every fifteen minutes until the adrenaline is off.",
          ],
          feedback: [
            "Serial tryptase confirms anaphylaxis, and an allergy clinic identifies latex for next time.",
            "Blaming the wrong drug leaves latex off her record, and she reacts again at her next procedure.",
            "Repeated boluses after the pressure has recovered overload her circulation.",
          ],
          wrongComps: ["anaphylaxis", "fluid_overload"],
          consequences: [
            "At her next operation a latex catheter goes in, and she reacts again.",
            "An hour later her lungs crackle and SpO2 falls to 90%.",
          ],
        },
      ],
    },
    "major_vascular": {
      title: "Major vessel injury from the trocar",
      then: "next",
      done: {"set": ["lap_ended", "converted_open", "major_bleed", "icu_ventilated"]},
      steps: [
        {
          kind: "bleed",
          title: "Blood up the trocar",
          description: "Blood is pouring back through the umbilical trocar. BP 62/30, HR 140.",
          choices: [
            "Leave the trocar in place, call for help and blood, and open the abdomen through the midline.",
            "Pull the trocar out and put the camera in through another port to see where the blood comes from.",
            "Keep insufflating through the trocar to find the bleeding point with the laparoscope.",
          ],
          feedback: [
            "The trocar marks the injury and may slow the bleeding; only a laparotomy gives the control she needs.",
            "Removing the trocar lets the vessel bleed freely, and the view is lost in blood.",
            "Gas pushed into an open vein travels to the heart as an embolus.",
          ],
          wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
          consequences: [
            "Once the trocar is out, the abdomen fills with blood and her pressure is barely recordable.",
            "EtCO2 falls, a mill-wheel murmur starts, and the rhythm slows toward asystole.",
          ],
          rescueVariants: ["major", null],
        },
        {
          kind: "vessel",
          title: "Control the vessel",
          description: "The abdomen is open. Blood is welling up from a hole in the right common iliac artery.",
          choices: [
            "Press on the hole with a swab on a stick and pack around it until the vascular surgeon arrives.",
            "Put a large clamp across the pool of blood where the hole seems to be, so the bleeding stops fast.",
            "Clamp the aorta high, below the diaphragm, and leave it on for as long as the repair takes.",
          ],
          feedback: [
            "Direct pressure stops the bleeding without adding injury while help and blood arrive.",
            "A clamp placed into a pool of blood tears the iliac vein lying just behind the artery.",
            "A long clamp time above the gut arteries leaves the bowel and legs without blood, and clots form.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "Dark blood now joins the bright: the clamp has torn the iliac vein.",
            "After the repair the bowel is dusky and neither foot has a pulse.",
          ],
          rescueVariants: ["major", "arterial"],
        },
        {
          kind: "vitals",
          title: "Resuscitate during the repair",
          description: "The vascular surgeon is repairing the artery. She has had four units and is still hypotensive.",
          choices: [
            "Run the massive transfusion protocol with plasma and platelets, give tranexamic acid and calcium, and warm everything.",
            "Give four liters of crystalloid while waiting, and keep the blood for when the hemoglobin comes back.",
            "Squeeze in eight units of cold red cells through a pressure bag, with no calcium or warming.",
          ],
          feedback: [
            "Balanced products, tranexamic acid, calcium, and warmth prevent the lethal cycle of cold, acid, and coagulopathy.",
            "Large crystalloid volumes dilute clotting factors and swell the lungs and the bowel.",
            "Cold citrated blood drops her calcium and temperature, and the heart becomes irritable.",
          ],
          wrongComps: ["fluid_overload", "cardiac_arrhythmia"],
          consequences: [
            "Her lungs crackle, her airway pressures rise, and the bowel swells out of the wound.",
            "Her temperature is 34 °C and the monitor shows runs of ventricular tachycardia.",
          ],
        },
        {
          kind: "verify",
          title: "Decide what to do with the gallbladder",
          description: "The artery is repaired. She has had eight units, her temperature is 35.1 °C, and her lactate is 5.",
          choices: [
            "Leave the gallbladder, check the foot pulses, close, and take her to ICU; it can come out later.",
            "Take the gallbladder out open now, since the abdomen is already open and she will not need another operation.",
            "Close the abdomen once the repair is dry, taking the warm foot on the drapes as proof of flow.",
          ],
          feedback: [
            "A cold, acidotic, coagulopathic patient needs the operation stopped; the gallbladder can wait weeks.",
            "More dissection in a coagulopathic patient makes every surface bleed.",
            "Warm skin does not prove the repair is open; a thrombosed repair needs a pulse check before closing.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "The liver bed and the wound edges ooze everywhere, and she needs four more units.",
            "In ICU her right leg is white and cold; the repair has clotted.",
          ],
          rescueVariants: ["postop", "arterial"],
        },
      ],
    },
    "colon_injury": {
      title: "Trocar injury to the colon",
      then: "next",
      done: {"set": ["colon_repaired"]},
      steps: [
        {
          kind: "exposure",
          title: "Find both holes",
          description: "The lateral trocar is sitting inside a loop of transverse colon.",
          choices: [
            "Leave the trocar in to mark the hole, then look at the far side of the colon for an exit wound.",
            "Pull the trocar out and carry on with the operation, noting where the loop is to come back to it.",
            "Pull the trocar out and lift the colon with a toothed grasper to show the hole to the camera.",
          ],
          feedback: [
            "Trocars often go through and through, and a missed back-wall hole leaks feces for days.",
            "Once the trocar is out the colon falls away, and the hole cannot be found again.",
            "A toothed grasper tears the inflamed colon and the vessels in its mesentery.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 3 she has feculent peritonitis from a missed hole in the colon.",
            "The mesocolon tears and a hematoma spreads along the colon.",
          ],
          rescueVariants: ["bowel", null],
        },
        {
          kind: "core",
          title: "Repair the colon",
          description: "Two clean 1 cm holes, front and back, each well under half the circumference.",
          choices: [
            "Close each hole across the colon in two layers of absorbable suture.",
            "Close each hole along the length of the colon, following the direction of the tear.",
            "Bury each hole with wide bites into the mesocolon to cover the repair with fat.",
          ],
          feedback: [
            "Small clean holes close primarily, and closing across the bowel keeps the lumen wide.",
            "Closing along the length narrows the lumen, and the repair leaks under tension.",
            "Wide bites into the mesocolon catch its vessels and make a hematoma around the repair.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 4 she is febrile with pain; the narrowed repair has leaked.",
            "A hematoma swells in the mesocolon under the repair.",
          ],
          rescueVariants: ["bowel", null],
        },
        {
          kind: "antibiotic",
          title: "Deal with the spill",
          description: "A little stool leaked into the right gutter before the repair.",
          choices: [
            "Suction and irrigate the gutter until clear, and add metronidazole to cover colonic anaerobes.",
            "Wipe the spill away with a gauze and continue on the cefazolin that is already running.",
            "Irrigate using a red rubber catheter, which reaches deeper into the gutter than the suction does.",
          ],
          feedback: [
            "Washing out removes the load, and metronidazole covers the anaerobes cefazolin misses.",
            "Cefazolin alone misses colonic anaerobes, and a wiped spill leaves bacteria behind.",
            "Red rubber catheters are latex, and she is allergic.",
          ],
          wrongComps: ["infection", "anaphylaxis"],
          consequences: [
            "On day 5 she has fever and a collection in the right gutter.",
            "Within minutes of the catheter going in, she flushes and her BP falls to 70/40.",
          ],
          rescueVariants: ["bowel", null],
        },
      ],
    },
    "bile_duct_injury": {
      title: "Bile duct injury",
      then: "next",
      done: {"set": ["bdi_managed", "converted_open", "lap_ended"]},
      steps: [
        {
          kind: "landmark",
          title: "Bile from low in the field",
          description: "Bile is welling up from a tubular structure below the sulcus.",
          choices: [
            "Stop dissecting and do a cholangiogram to see which duct is open and how badly.",
            "Clip across the leaking tube to keep the field dry, and carry on with the gallbladder.",
            "Dissect all around the tube to free it and follow it to see where it goes.",
          ],
          feedback: [
            "Stopping prevents a partial injury becoming a complete one, and the cholangiogram maps it.",
            "A clip across a leaking common duct turns a tear into a complete blockage.",
            "Dissecting around the duct strips its blood supply and puts you on the hepatic artery.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 2 she is jaundiced and febrile; the clip closed her common hepatic duct.",
            "Bright arterial blood joins the bile as the right hepatic artery tears.",
          ],
          effects: [null, {"set": ["bdi_unrecognized"]}, {"repair": "rha_bleed"}],
        },
        {
          kind: "core",
          title: "Get the right surgeon",
          description: "The cholangiogram shows a tear in one third of the common hepatic duct. The duct is still in continuity.",
          choices: [
            "Place a drain by the tear, keep her asleep, and call the hepatobiliary surgeon in to repair it.",
            "Close the tear yourself laparoscopically with a running 3-0 suture, then finish the gallbladder.",
            "Convert and repair it yourself, clearing the duct all the way round for a better look.",
          ],
          feedback: [
            "Repairs done by the operating surgeon fail far more often; a hepatobiliary surgeon should repair it.",
            "A tight running suture in a small inflamed duct narrows it, and it later leaks or strictures.",
            "Clearing the duct circumferentially strips its blood supply and injures the right hepatic artery.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "Three weeks later she returns with cholangitis from a narrowed duct.",
            "The right hepatic artery tears behind the duct and fills the field.",
          ],
          effects: [null, null, {"repair": "rha_bleed"}],
        },
        {
          kind: "core",
          title: "Repair the duct",
          description: "The hepatobiliary surgeon has opened her abdomen. The tear is clean, with no tissue missing.",
          choices: [
            "Close the tear with fine absorbable interrupted sutures, with a T-tube brought out through a separate opening.",
            "Put the T-tube in through the tear itself and close the duct around it with a few stitches.",
            "Take deep bites into the tissue beside the duct so the repair holds without any tension.",
          ],
          feedback: [
            "Interrupted fine sutures heal without narrowing, and a separate T-tube keeps them off the repair.",
            "A T-tube through the injury holds the edges apart, and it leaks and scars.",
            "Deep bites beside the duct catch the hepatic artery or the portal vein.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 5 bile leaks around the T-tube and she becomes febrile.",
            "A needle goes into the portal vein and dark blood fills the field.",
          ],
        },
      ],
    },
    "rha_bleed": {
      title: "Right hepatic artery bleeding",
      then: "redo",
      done: {"set": ["rha_injured"]},
      steps: [
        {
          kind: "bleed",
          title: "Stop the arterial bleeding",
          description: "Pulsing blood is filling Calot's triangle and the view is going red.",
          choices: [
            "Press on the bleeding point with a gauze in a grasper, and let anesthesia catch up.",
            "Fire clips into the pulsing blood where the vessel seems to be, until it stops.",
            "Keep the suction on the bleeding point continuously so you can see the vessel through it.",
          ],
          feedback: [
            "Pressure stops the loss and buys time to see the artery and the duct before anything is clipped.",
            "Clips fired into blood catch the common bile duct lying beside the artery.",
            "Suction alone takes blood out as fast as she loses it, and the vessel stays hidden.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 2 she is jaundiced; one of the clips is across the common bile duct.",
            "Her BP falls to 70/40 as the suction canister fills.",
          ],
          effects: [null, {"set": ["bdi_unrecognized"]}, null],
        },
        {
          kind: "vessel",
          title: "Plan the control",
          description: "Pressure holds, but the pulsing returns each time the gauze is lifted. BP 94/60.",
          choices: [
            "Keep the pressure on, call a senior surgeon, and get ready to convert if the view does not improve.",
            "Release and re-clip over and over until one of the clips finally holds the vessel.",
            "Clip the common hepatic artery upstream in the ligament so no blood reaches the bleeding point.",
          ],
          feedback: [
            "A second senior surgeon and open access are how arterial bleeding at the hilum is controlled.",
            "Each release loses more blood and each clip risks the bile duct.",
            "Clipping the common hepatic artery starves the whole liver.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "Each release costs another 300 mL of blood.",
            "By day 2 her liver enzymes are in the thousands.",
          ],
          rescueVariants: [null, "arterial"],
        },
        {
          kind: "vessel",
          title: "Decide on the right hepatic artery",
          description: "The artery is seen: cut cleanly. A cholangiogram shows the bile duct is intact.",
          choices: [
            "With the duct intact and portal flow normal, tie both ends of the artery securely.",
            "Leave the two ends as they are, since both have stopped bleeding under the pressure.",
            "Clip it flush against the common hepatic artery, as near to its origin as you can get.",
          ],
          feedback: [
            "With the duct intact, the portal vein keeps the right lobe alive and ligation is well tolerated.",
            "Arterial ends that have stopped under pressure bleed again when her pressure recovers.",
            "A clip at the origin narrows the common hepatic artery and a clot spreads into it.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "Half an hour later the field fills with arterial blood again.",
            "On day 2 her enzymes soar and Doppler shows no flow in the hepatic artery.",
          ],
          rescueVariants: [null, "arterial"],
        },
      ],
    },
    "liver_bed_bleed": {
      title: "Bleeding from the liver bed",
      then: "next",
      done: {"set": ["major_bleed"]},
      steps: [
        {
          kind: "bleed",
          title: "Dark blood from the bed",
          description: "Dark blood wells from a vein in the gallbladder bed.",
          choices: [
            "Fold the gallbladder back over the bed with a gauze and hold pressure for five minutes.",
            "Coagulate deep into the bleeding liver with the hook on high until the bleeding stops.",
            "Raise the pressure to 20 mmHg so the gas pushes back on the bleeding vein.",
          ],
          feedback: [
            "Most bed bleeding stops with pressure, and the view clears to see what is left.",
            "Deep coagulation opens the vein further into the liver.",
            "High gas pressure over an open vein pushes CO2 into the circulation.",
          ],
          wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
          consequences: [
            "The hole in the vein widens and the bleeding doubles.",
            "EtCO2 falls sharply and the rhythm slows as gas reaches the heart.",
          ],
        },
        {
          kind: "vessel",
          title: "Seal the vein",
          description: "After compression, a 3 mm vein in the bed still bleeds.",
          choices: [
            "Place a suture or a clip on the visible vein, then lay a hemostatic agent over the bed.",
            "Fill the bed with hemostatic powder over the open vein and move on with the dissection.",
            "Pack a plug of oxidized cellulose into the mouth of the vein to seal it from inside.",
          ],
          feedback: [
            "A named vein needs a stitch or clip; the agent then deals with the ooze around it.",
            "Powder cannot close an open vein, and it keeps bleeding under the agent.",
            "Material pushed into a vein can travel in the bloodstream and block vessels.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "In recovery her abdomen distends as the vein bleeds under the powder.",
            "On day 1 she is breathless, with a clot in the pulmonary artery.",
          ],
        },
        {
          kind: "vitals",
          title: "Resuscitate after the bed bleed",
          description: "The bed is dry. She lost 1.4 L of blood. HR 118, BP 90/56.",
          choices: [
            "Transfuse red cells guided by a blood gas, give tranexamic acid, and keep her warm.",
            "Give three liters of saline to bring her pressure up, and hold the blood for now.",
            "Run in four units of cold blood fast, through a pressure bag, in fifteen minutes.",
          ],
          feedback: [
            "Red cells replace what she lost, and tranexamic acid protects the clots that have formed.",
            "Three liters of saline dilute her blood and waterlog her lungs.",
            "Cold, fast blood drops her temperature and calcium, and the heart becomes irritable.",
          ],
          wrongComps: ["fluid_overload", "cardiac_arrhythmia"],
          consequences: [
            "Her airway pressures climb and her lung bases crackle.",
            "Her temperature falls to 35 °C and runs of ectopic beats appear.",
          ],
        },
      ],
    },
    "co2_embolism_arrest": {
      title: "Cardiac arrest from CO2 embolism",
      then: "next",
      done: {"set": ["gas_embolism", "icu_ventilated", "lap_ended"]},
      steps: [
        {
          kind: "vitals",
          title: "She arrests",
          description: "No pulse. The monitor shows a slow, wide rhythm (PEA). The abdomen is still full of gas.",
          choices: [
            "Start compressions, give adrenaline 1 mg, release all the gas, and ventilate with 100% oxygen.",
            "Shock her at 200 joules first, then check for a pulse before starting any chest compressions.",
            "Ventilate with a 50% nitrous oxide mix to deepen anesthesia while you assess her.",
          ],
          feedback: [
            "PEA needs compressions and adrenaline; compressions also break up the gas in the heart.",
            "PEA is not a shockable rhythm, and the delay costs her perfusion.",
            "Nitrous oxide diffuses into gas bubbles and makes the embolus bigger.",
          ],
          wrongComps: ["cardiac_arrhythmia", "hypoxia"],
          consequences: [
            "Two minutes pass with no compressions, and the rhythm becomes asystole.",
            "SpO2 is unrecordable and the embolus grows in the right heart.",
          ],
        },
        {
          kind: "vitals",
          title: "Get the gas out",
          description: "She has a pulse again. Echo shows gas in a swollen right heart.",
          choices: [
            "Keep her left side and head down, and aspirate the atrium through a central line.",
            "Lay her flat and level on the table so the central line is easier to place, then aspirate the gas.",
            "Restart insufflation at a low pressure so you can finish the operation soon.",
          ],
          feedback: [
            "The position keeps the gas trapped in the atrium, away from the lung outflow, where a line can reach it.",
            "Laying her flat lets the gas move into the pulmonary artery and she arrests again.",
            "More gas into the abdomen can re-enter the torn vein and cause another embolus.",
          ],
          wrongComps: ["cardiac_arrhythmia", "hypoxia"],
          consequences: [
            "As she is laid flat, the pulse goes again.",
            "SpO2 falls to 72% as more gas reaches the lungs.",
          ],
        },
        {
          kind: "postop",
          title: "After the arrest",
          description: "She is stable on low-dose noradrenaline. The gallbladder is off the liver but still inside.",
          choices: [
            "Bag the gallbladder, remove it at the lowest pressure, and send her to ICU ventilated.",
            "Wake her and extubate in theater, so her neurology can be checked straight away.",
            "Re-insufflate to 15 mmHg for a full inspection and washout before taking the gallbladder.",
          ],
          feedback: [
            "Minimal gas and a short finish protect her, and ICU care after an arrest guards the brain.",
            "Straight after an arrest her lungs and brain are not ready to breathe on their own.",
            "Full pressure again over a torn vein risks a second embolus.",
          ],
          wrongComps: ["hypoxia", "cardiac_arrhythmia"],
          consequences: [
            "She tires in minutes after extubation and SpO2 falls to 80%.",
            "EtCO2 drops again and her pulse becomes weak and irregular.",
          ],
        },
      ],
    },
    "reoperation_lap": {
      title: "Return to theater for bleeding",
      then: "next",
      done: {"set": ["major_bleed", "reoperated"]},
      steps: [
        {
          kind: "bleed",
          title: "Decide how to treat the bleeding",
          description: "In recovery her abdomen is distended and her hemoglobin has fallen to 9.6. HR 124.",
          choices: [
            "Take her back for a laparoscopy to wash out the clot and find the bleeding point.",
            "Watch her in ICU with hemoglobin checks every hour, and transfuse as needed.",
            "Drain the blood under ultrasound through a needle at the bedside to relieve the pressure.",
          ],
          feedback: [
            "A bleeding patient after surgery needs the source found and controlled.",
            "Transfusing without control lets her keep bleeding.",
            "Needling a clot introduces bacteria into it and does not stop the bleeding.",
          ],
          wrongComps: ["hemorrhage", "infection"],
          consequences: [
            "Two hours later her hemoglobin is 6.5 and she is in shock.",
            "On day 4 the hematoma is infected and she is septic.",
          ],
          rescueVariants: ["postop", null],
        },
        {
          kind: "verify",
          title: "Find the bleeder",
          description: "Clot covers the liver bed. A small vein is oozing there.",
          choices: [
            "Clip the vein, then check every port site from inside with the pressure low before you wash out.",
            "Clip the vein and finish, since one bleeding point explains all the blood she lost.",
            "Leave the old clot over the bed as a natural seal and wash only around it.",
          ],
          feedback: [
            "Port-site bleeders are a common second source, and low pressure reveals them.",
            "A second bleeder at a port site goes on bleeding.",
            "Old clot left behind becomes infected.",
          ],
          wrongComps: ["hemorrhage", "infection"],
          consequences: [
            "That night her hemoglobin falls again from a missed port-site bleeder.",
            "On day 5 a collection under the liver is infected.",
          ],
          rescueVariants: ["postop", null],
        },
      ],
    },
    "bdi_postop": {
      title: "Bile duct injury after surgery",
      label: "Complication management",
      then: "next",
      done: {"set": ["bdi_referred"]},
      steps: [
        {
          kind: "postop",
          title: "Drain the bile collection",
          description: "MRCP shows the common duct injured, bile in a 6 cm collection, and dilated ducts above the injury.",
          choices: [
            "Drain the collection under CT, send the fluid for culture, and continue IV antibiotics.",
            "Treat with IV antibiotics alone, since the collection may settle once the fever comes down.",
            "Restart her therapeutic apixaban before the drain goes in, because of her previous DVT.",
          ],
          feedback: [
            "An infected bile collection needs draining; antibiotics alone cannot clear it.",
            "Antibiotics do not reach the middle of an undrained collection.",
            "A needle through the liver while fully anticoagulated bleeds.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "By day 4 she is septic with a growing collection.",
            "Blood fills the drain bag, and her hemoglobin falls to 7.8.",
          ],
          rescueVariants: [null, "postop"],
        },
        {
          kind: "postop",
          title: "Decompress the liver",
          description: "Bilirubin is 120 µmol/L. The duct is blocked, so bile above it cannot drain.",
          choices: [
            "Place a drain through the liver into the ducts above the block, since ERCP cannot get past it.",
            "Try ERCP and inject contrast firmly up to the block to force a way through it.",
            "Give three liters of IV fluid a day and wait for the jaundice to level out by itself.",
          ],
          feedback: [
            "A percutaneous transhepatic drain relieves an obstructed liver when ERCP cannot reach above the block.",
            "Pressurized contrast into an obstructed system pushes bacteria into the blood.",
            "Fluid does not unblock a duct and the jaundice keeps rising.",
          ],
          wrongComps: ["infection", "fluid_overload"],
          consequences: [
            "An hour after the ERCP she has rigors and a BP of 80/40.",
            "Her ankles swell and she is breathless, and the bilirubin keeps climbing.",
          ],
        },
        {
          kind: "postop",
          title: "Plan the definitive repair",
          description: "She is afebrile, the collection has gone, and both drains are working.",
          choices: [
            "Refer her to a hepatobiliary unit for a hepaticojejunostomy once the inflammation settles.",
            "Take her back tomorrow, remove the clips, and join the two cut duct ends back together again.",
            "Hold all anticoagulation until the repair in six weeks, to keep the drains from bleeding.",
          ],
          feedback: [
            "A duct injury is best repaired by a specialist with a bowel-to-duct join, in healthy tissue.",
            "Joining inflamed, ischemic duct ends leaks and later narrows.",
            "Six weeks without prophylaxis after a previous DVT invites another clot.",
          ],
          wrongComps: ["infection", "thrombosis"],
          consequences: [
            "The join leaks on day 4 and she is septic again.",
            "Three weeks later her left leg swells and she is breathless.",
          ],
        },
      ],
    },
    "bile_leak_mgmt": {
      title: "Bile leak after surgery",
      label: "Complication management",
      then: "next",
      done: {"set": ["bile_leak_treated"]},
      steps: [
        {
          kind: "postop",
          title: "Stop the leak",
          description: "ERCP shows contrast leaking from a small duct in the gallbladder bed. The common duct is clear.",
          choices: [
            "Cut a sphincterotomy and place a plastic stent so bile drains into the duodenum.",
            "Clamp the drain so the bile is forced down the common duct and into the bowel where it belongs.",
            "Cut a sphincterotomy and stent, with her full-dose apixaban restarted this morning.",
          ],
          feedback: [
            "Lowering the pressure in the bile duct lets bile take the easy route, and small leaks seal.",
            "Clamping the drain turns the leak into a collection under pressure.",
            "A sphincterotomy on full anticoagulation bleeds.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "Two days later she is febrile with a collection under the liver.",
            "She vomits blood from the sphincterotomy that night.",
          ],
          rescueVariants: [null, "postop"],
        },
        {
          kind: "postop",
          title: "Manage the drain and stent",
          description: "Drain output has fallen from 300 to 20 mL a day over four days.",
          choices: [
            "Remove the drain now that output is low, and remove the stent at ERCP in 4 to 6 weeks.",
            "Leave the stent in long term since it works, which spares her another ERCP.",
            "Keep her on bed rest until the drain is out, so the tube does not dislodge.",
          ],
          feedback: [
            "Low output means the leak has sealed; the stent comes out once healing is complete.",
            "Stents left in block with sludge, and she gets cholangitis.",
            "Bed rest after a DVT history is how a clot forms.",
          ],
          wrongComps: ["infection", "thrombosis"],
          consequences: [
            "Five months later she has fever, rigors, and jaundice.",
            "On day 5 her calf swells and she becomes breathless.",
          ],
        },
      ],
    },
    "port_hernia_repair": {
      title: "Port-site hernia",
      label: "Complication management",
      then: "next",
      done: {"set": ["bowel_resected"]},
      steps: [
        {
          kind: "postop",
          title: "Prepare for theater",
          description: "CT shows a knuckle of small bowel trapped in the umbilical fascial defect.",
          choices: [
            "Give IV fluids to correct her losses, pass a nasogastric tube, and take her to theater tonight.",
            "Give four liters of saline over two hours to make up for all the vomiting before theater.",
            "Wait until the morning list, since the bowel is only partly trapped and she looks well.",
          ],
          feedback: [
            "Correcting her fluids and taking her to theater that night is what saves trapped bowel.",
            "Four liters in two hours overloads her.",
            "Trapped bowel strangulates while she waits.",
          ],
          wrongComps: ["fluid_overload", "infection"],
          consequences: [
            "She is breathless with crackles before she reaches theater.",
            "By morning the knuckle has perforated and she is peritonitic.",
          ],
          rescueVariants: [null, "bowel"],
        },
        {
          kind: "core",
          title: "Free the trapped bowel",
          description: "Through the umbilical scar, a knuckle of ileum is dusky in a tight fascial ring.",
          choices: [
            "Widen the ring, free the bowel, and rest it in warm packs to see whether it recovers.",
            "Push the bowel back into the abdomen once it is free, since it is only slightly dusky in color.",
            "Pull more bowel out through the small ring to look at the loops on either side.",
          ],
          feedback: [
            "Freeing it and letting it rest tells you whether the blood supply is coming back.",
            "Slightly dusky bowel may be dead; returned without a check, it perforates.",
            "Pulling bowel through a tight ring tears its mesentery.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 3 she is peritonitic from a perforated segment.",
            "The mesentery tears and bleeds into the wound.",
          ],
          rescueVariants: ["bowel", null],
        },
        {
          kind: "closure",
          title: "Resect and close",
          description: "After warming, a 2 cm patch on the bowel wall stays black.",
          choices: [
            "Resect the segment with a primary join, and close the fascia with absorbable suture, no mesh.",
            "Fold the black patch inward with a purse-string suture and close the fascia over it.",
            "Close the fascia with wide lateral bites taken deep into the rectus muscle on each side for extra strength.",
          ],
          feedback: [
            "Dead bowel is removed, and mesh is avoided in a field that has been contaminated.",
            "An inverted dead patch perforates behind the stitch.",
            "Wide bites into the rectus catch the epigastric vessels.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 4 the inverted patch perforates.",
            "A hematoma spreads through the rectus sheath.",
          ],
          rescueVariants: ["bowel", "postop"],
        },
      ],
    },
    "cystic_stump": {
      title: "Cystic artery stump bleeding",
      then: "next",
      done: {"set": ["cystic_stump_repaired"]},
      steps: [
        {
          kind: "bleed",
          title: "Get control of the stump",
          description: "The cystic artery stump is pumping and the camera lens is splattered.",
          choices: [
            "Grasp the stump with an atraumatic grasper, then clean the lens and add a second suction.",
            "Pull the camera back and wait for the bleeding to slow before you try to see the stump.",
            "Grab the whole pedicle, duct stump included, with a toothed grasper to stop the pumping.",
          ],
          feedback: [
            "Holding the stump stops the bleeding, and a clean lens and suction bring back the view.",
            "An artery does not stop pumping on its own, and the field fills with blood.",
            "A toothed grasper across the pedicle pulls the clips off the cystic duct.",
          ],
          wrongComps: ["hemorrhage", "infection"],
          consequences: [
            "She loses 800 mL before the stump is found.",
            "On day 2 bile leaks from the cystic duct stump.",
          ],
          effects: [null, null, {"set": ["bile_leak"]}],
        },
        {
          kind: "vessel",
          title: "Secure the stump",
          description: "The stump is held and the view is clear.",
          choices: [
            "Put two new clips on the artery below the grasper, clear of the bile duct.",
            "Put one clip on the artery and divide the extra length beside it with the hook.",
            "Clip it as low down the pedicle as you can, to leave a long margin of safety.",
          ],
          feedback: [
            "Two clips placed under vision away from the duct are secure and safe.",
            "Heat beside a single clip loosens it again.",
            "Low on the pedicle the clip closes the right hepatic artery.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "The clip slides off again ten minutes later.",
            "On day 2 her liver enzymes soar and the right lobe looks ischemic.",
          ],
          rescueVariants: [null, "arterial"],
        },
      ],
    },
  },
};
