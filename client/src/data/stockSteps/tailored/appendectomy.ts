// ─────────────────────────────────────────────────────────────────────────────
// APPENDECTOMY (open, McBurney) — fully tailored bank.
// Marcus T., 28M, 95 kg, obese, febrile and tachycardic with early sepsis.
// Every wrong choice triggers the complication it would actually cause, and
// `consequences` describe what the team sees the moment it happens.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProcedureBank } from "../stepBuilder";

export const APPENDECTOMY_BANK: ProcedureBank = {
  id: "appendectomy",
  spec: {
    approach: "a transverse McBurney's point incision in the right lower quadrant",
    wrongApproaches: ["a large midline laparotomy", "a left lower quadrant incision"],
    landmark: "McBurney's point, one-third of the way from the ASIS to the umbilicus",
    wrongLandmarks: ["the pubic symphysis", "the femoral triangle"],
    vessel: "the appendiceal artery within the mesoappendix",
    wrongVessels: ["the ileocolic artery trunk", "the right colic artery"],
    nerve: "the iliohypogastric and ilioinguinal nerves",
    wrongNerves: ["the genitofemoral nerve", "the obturator nerve"],
    structure: "the appendix and its mesoappendix",
    wrongStructures: ["the terminal ileum", "the cecal pole"],
    test: "inspection for a fecalith and stump hemostasis",
    wrongTests: ["an on-table barium enema", "a routine ultrasound"],
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
    instrument: "a McBurney retractor",
    position: "supine with the right lower quadrant centered in the field",
    wrongPositions: ["prone", "left lateral decubitus"],
    detail: "obese (95 kg), febrile, HR 110, BP 95/65, penicillin allergy, vomited this morning",
  },
  steps: [
    // ── Pre-op and induction ────────────────────────────────────────────────
    {
      kind: "preop",
      title: "Run the time-out",
      description: "Marcus wears a red allergy band. He vomited twice on the ward this morning.",
      choices: [
        "Read back his name, the marked right side, the penicillin allergy on his band, and when he last vomited.",
        "Accept the ward's signed checklist as complete and let anesthesia hang the ampicillin-sulbactam that was ordered.",
        "Confirm his name and consent, and treat him as fasted because the NPO box on the sheet is ticked.",
      ],
      feedback: [
        "The time-out catches both hazards: a penicillin allergy and a full stomach that changes the induction plan.",
        "Ampicillin-sulbactam is a penicillin. Giving it to a patient with a penicillin allergy invites anaphylaxis.",
        "A ticked NPO box does not empty the stomach. Vomiting today means he must be induced as a full stomach, or he can aspirate.",
      ],
      wrongComps: ["anaphylaxis", "hypoxia"],
      consequences: [
        "Minutes after the infusion starts, hives spread across his chest, airway pressures climb, and BP drops to 70/40.",
        "At induction, green gastric fluid wells up in the pharynx and his saturation falls through the 80s.",
      ],
      effects: [null, {"set": ["anaphylaxis_event"], "repair": "anaphylaxis_after"}, {"set": ["aspiration"], "repair": "aspiration"}],
    },
    {
      kind: "preop",
      title: "Choose the induction technique",
      description: "Obese, full stomach, septic, BP 95/65. Anesthesia asks how you want him put to sleep.",
      when: {"none": ["aspiration"]},
      choices: [
        "Preoxygenate head-up, then rapid-sequence induction with a reduced propofol dose and a video laryngoscope.",
        "Standard induction, with bag-mask breaths between the drugs so his saturation never dips during intubation.",
        "Propofol 2.5 mg/kg by total body weight so he is deeply asleep before anyone touches the airway.",
      ],
      feedback: [
        "Rapid sequence protects the airway from aspiration, and a reduced dose respects his septic, low-volume circulation.",
        "Mask breaths inflate the stomach of a patient who already has a full one, driving aspiration.",
        "A full weight-based dose in a hypovolemic septic patient collapses his blood pressure and heart rhythm.",
      ],
      wrongComps: ["hypoxia", "cardiac_arrhythmia"],
      consequences: [
        "Gastric contents appear at the cords as the tube goes in; SpO2 slides to 84% with coarse crackles on the right.",
        "BP falls to 58/30 and the monitor shows a slow, wide-complex rhythm.",
      ],
      effects: [null, {"set": ["aspiration"], "repair": "aspiration"}, null],
    },
    {
      kind: "vitals",
      title: "Top up the circulation before induction",
      description: "BP 95/65, HR 110, lactate 2.8. He has already had 1 L on the ward.",
      choices: [
        "Give a 500 mL crystalloid bolus, then recheck BP, heart rate, and lung sounds before deciding on more.",
        "Run three liters of saline over twenty minutes so he is fully filled before the propofol and rocuronium go in.",
        "Hold further fluid and start a phenylephrine infusion to lift the pressure before induction.",
      ],
      feedback: [
        "A measured bolus with reassessment treats septic hypovolemia without drowning the lungs.",
        "Three liters at once in an obese patient overshoots, flooding the lungs before the case starts.",
        "Phenylephrine in an empty circulation squeezes the vessels, triggers reflex bradycardia, and hides the volume deficit.",
      ],
      wrongComps: ["fluid_overload", "cardiac_arrhythmia"],
      consequences: [
        "His breathing becomes wet, crackles rise to mid-chest, and SpO2 falls to 90% on the mask.",
        "His heart rate drops from 110 to 44 and the pressure sags despite the infusion.",
      ],
    },
    {
      kind: "antibiotic",
      title: "Pick the prophylactic antibiotic",
      description: "The penicillin allergy caused hives as a child. Incision is in 20 minutes.",
      choices: [
        "Start ciprofloxacin and metronidazole now so both are infused within 60 minutes of incision.",
        "Give piperacillin-tazobactam now because it covers the gut flora of a septic appendix best.",
        "Hold antibiotics until the appendix is out so the peritoneal cultures come back clean.",
      ],
      feedback: [
        "A fluoroquinolone plus metronidazole covers bowel flora with no penicillin exposure, and it is in before incision.",
        "Piperacillin is a penicillin. In a penicillin-allergic patient it can trigger anaphylaxis.",
        "Delaying prophylaxis past incision loses its protective window and raises the wound infection rate.",
      ],
      wrongComps: ["anaphylaxis", "infection"],
      consequences: [
        "Five minutes into the infusion his face flushes, he wheezes against the ventilator, and BP drops to 72/40.",
        "The wound becomes contaminated as the appendix is handled with no antibiotic on board.",
      ],
      rescueVariants: [null, "wound"],
      effects: [null, {"set": ["anaphylaxis_event"], "repair": "anaphylaxis_after"}, null],
    },
    {
      kind: "position",
      title: "Position and pad him",
      description: "He weighs 95 kg and will be supine for about an hour.",
      choices: [
        "Supine, arms on padded boards under 90 degrees, heels padded, and calf compression sleeves running.",
        "Tuck both arms tight at his sides so the surgeon and assistant can stand close, padding the elbows afterward.",
        "Leave the compression sleeves off because the case should be over in under an hour.",
      ],
      feedback: [
        "Arms under 90 degrees protect the brachial plexus, and running sleeves protect an obese septic patient from clots.",
        "Tight tucking in a heavy patient compresses the ulnar nerve at the elbow for the whole case.",
        "Obesity, sepsis, and immobility each raise clot risk. Mechanical prophylaxis should start before induction.",
      ],
      wrongComps: ["nerve_injury", "thrombosis"],
      consequences: [
        "In recovery he cannot feel his little finger and has a weak grip in his right hand.",
        "His left calf is swollen and tender by the end of the case.",
      ],
      rescueVariants: ["positional", null],
    },
    {
      kind: "vitals",
      title: "Treat hypotension after induction",
      description: "After intubation BP is 72/40 and HR 118. Sevoflurane is at 1 MAC.",
      choices: [
        "Give phenylephrine 100 mcg, run the fluid, and lower the sevoflurane while you reassess.",
        "Give epinephrine 1 mg IV push, the code-cart dose, to lift the pressure back to normal in one step.",
        "Bolus two liters of saline over ten minutes and avoid any vasopressor.",
      ],
      feedback: [
        "A small pressor dose, fluid, and a lighter anesthetic restore pressure without overshooting.",
        "One milligram of epinephrine is an arrest dose. In a perfusing patient it provokes dangerous arrhythmias.",
        "Two liters in ten minutes overloads an obese patient's lungs before the vasodilation is addressed.",
      ],
      wrongComps: ["cardiac_arrhythmia", "fluid_overload"],
      consequences: [
        "BP spikes to 210/120 and the monitor breaks into runs of ventricular tachycardia.",
        "Airway pressures rise, pink froth appears in the tube, and SpO2 falls to 88%.",
      ],
    },

    // ── Access ───────────────────────────────────────────────────────────────
    {
      kind: "landmark",
      title: "Mark the incision",
      description: "Locate McBurney's point on a heavy abdomen.",
      choices: [
        "Center a transverse incision one-third of the way from the right ASIS toward the umbilicus.",
        "Center it two fingerbreadths above the inguinal ligament, close to the pubic tubercle.",
        "Start it at the ASIS and extend it laterally along the iliac crest for more room.",
      ],
      feedback: [
        "McBurney's point sits over the usual base of the appendix and keeps the incision clear of major vessels and nerves.",
        "Low and medial puts the incision over the inferior epigastric vessels.",
        "Extending lateral along the crest runs into the iliohypogastric and lateral femoral cutaneous nerves.",
      ],
      wrongComps: ["hemorrhage", "nerve_injury"],
      consequences: [
        "Deepening the low incision opens the inferior epigastric artery, which pumps into the wound.",
        "On day 1 he reports burning numbness over the lateral hip and groin.",
      ],
      effects: [null, {"repair": "epigastric"}, null],
    },
    {
      kind: "access",
      title: "Get through the fat",
      description: "There are about 6 cm of subcutaneous fat before the aponeurosis.",
      choices: [
        "Divide the fat in layers with cautery, tying the superficial epigastric vein as you meet it.",
        "Take long, deep blade strokes through the fat down to the aponeurosis to keep the wound edges clean.",
        "Undermine the fat widely off the aponeurosis in every direction to give yourself more room.",
      ],
      feedback: [
        "Layered division keeps you in control of depth and keeps the wound dry.",
        "A deep single pass loses depth control; the blade goes through the aponeurosis into bleeding muscle.",
        "Wide undermining leaves a large dead space where serum collects and becomes infected.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "The blade cuts through the aponeurosis into the internal oblique, which bleeds briskly into the wound.",
        "By day 4 a fluctuant, tender collection has formed under the wound and it starts to discharge pus.",
      ],
      rescueVariants: [null, "wound"],
    },
    {
      kind: "exposure",
      title: "Open the external oblique",
      description: "The aponeurosis is now exposed across the wound.",
      choices: [
        "Incise the external oblique aponeurosis along its fibers and lift it off the internal oblique.",
        "Cut the aponeurosis across its fibers toward the rectus sheath for a wider opening.",
        "Split the aponeurosis low and medially toward the external ring, where the appendix base usually lies.",
      ],
      feedback: [
        "Splitting in the line of the fibers preserves strength and stays away from the vessels and nerves.",
        "Cutting medially toward the rectus sheath divides branches of the inferior epigastric vessels.",
        "The ilioinguinal nerve runs under the aponeurosis near the external ring and is cut by a low split.",
      ],
      wrongComps: ["hemorrhage", "nerve_injury"],
      consequences: [
        "A branch of the inferior epigastric artery is transected and spurts across the drapes.",
        "At follow-up he describes shooting pain and numbness over the right groin and scrotum.",
      ],
      effects: [null, {"repair": "epigastric"}, null],
    },
    {
      kind: "exposure",
      title: "Split the internal oblique and transversus",
      description: "The iliohypogastric nerve runs between these two muscle layers.",
      choices: [
        "Split both muscles bluntly along their fibers with two retractors, watching for the nerve.",
        "Divide the internal oblique with cautery at right angles to its fibers for a wider window.",
        "Push a finger through both muscle layers and on into the peritoneum in a single move.",
      ],
      feedback: [
        "A muscle-splitting approach leaves the layers and the nerve between them intact.",
        "Cutting across the fibers divides the iliohypogastric nerve that runs between the layers.",
        "Punching through into the peritoneum without seeing it can tear inflamed, adherent bowel.",
      ],
      wrongComps: ["nerve_injury", "infection"],
      consequences: [
        "Post-op, the skin above the pubis is numb and the lower abdominal wall bulges when he coughs.",
        "The finger enters a tense, adherent loop of cecum, and feculent fluid floods the wound.",
      ],
      effects: [null, null, {"set": ["peritoneum_open", "contaminated"], "repair": "cecal_enterotomy"}],
    },
    {
      kind: "access",
      title: "Open the peritoneum",
      description: "The peritoneum is thickened and edematous from the inflammation.",
      when: {"none": ["peritoneum_open"]},
      choices: [
        "Tent the peritoneum between two clips, feel that no bowel is caught, and open it with scissors.",
        "Open it with one scalpel stab where it bulges into the wound, then extend with scissors.",
        "Extend the peritoneal opening medially under the rectus muscle to improve the view of the cecum and ileum.",
      ],
      feedback: [
        "Tenting lifts the peritoneum off the bowel before you cut, so the bowel stays out of the incision.",
        "Where the peritoneum bulges, bowel is usually pressed against it, and a stab opens it.",
        "Carrying the opening under the rectus runs straight into the inferior epigastric vessels.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "The stab nicks the underlying cecum and turbid bowel contents leak into the field.",
        "A large vessel under the rectus is cut and bright red blood pours from the medial corner.",
      ],
      effects: [null, {"set": ["contaminated"], "repair": "cecal_enterotomy"}, {"repair": "epigastric"}],
    },
    {
      kind: "landmark",
      title: "Find the appendix",
      description: "Turbid fluid is present. The appendix is not visible yet.",
      choices: [
        "Deliver the cecum and follow the taeniae coli to where they converge at the appendix base.",
        "Deliver the first tubular loop that comes up and follow it along to its tip.",
        "Sweep a finger around the pelvis to break up the adhesions and feel for the appendix.",
      ],
      feedback: [
        "The three taeniae converge on the appendix base every time, whatever position the tip is in.",
        "The first loop is usually terminal ileum, and pulling on it tears its mesentery.",
        "Blind sweeping breaks open a walled-off abscess and spreads pus through the pelvis.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "The ileal mesentery tears as the loop is pulled up, and a hematoma spreads through it.",
        "Thick pus pours up from the pelvis as the walled-off collection ruptures.",
      ],
      effects: [null, {"repair": "mesenteric_tear"}, {"set": ["contaminated"]}],
    },

    // ── The appendix ────────────────────────────────────────────────────────
    {
      kind: "dissect",
      title: "Free a retrocecal appendix",
      description: "The appendix lies behind the cecum, stuck in inflammatory tissue.",
      choices: [
        "Divide the cecum's lateral peritoneal attachments and rotate it medially to show the appendix.",
        "Grasp the appendix tip with a Babcock clamp and pull steadily until it peels out from behind the cecum.",
        "Dissect deep behind the cecum toward the psoas until the whole appendix is visible.",
      ],
      feedback: [
        "Mobilizing the cecum brings a retrocecal appendix into view without pulling on it.",
        "Traction on a friable, inflamed appendix tears it and spills its contents.",
        "Deep retroperitoneal dissection toward the psoas enters the gonadal vessels.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "The appendix tears at its midpoint and pus and fecal debris spill into the right gutter.",
        "Dark blood wells up from the retroperitoneum near the psoas.",
      ],
      effects: [null, {"set": ["perforated", "contaminated"], "repair": "appendix_spill"}, {"repair": "retroperitoneal"}],
    },
    {
      kind: "vessel",
      title: "Ligate the appendiceal artery",
      description: "The mesoappendix is thick and edematous.",
      choices: [
        "Clamp the mesoappendix in small bites close to the appendix and tie each with 2-0 absorbable.",
        "Take the whole mesoappendix in one large clamp and secure it with a single tie.",
        "Ligate the mesentery back near the ileocolic trunk, where one secure tie controls the whole blood supply.",
      ],
      feedback: [
        "Small bites hold in edematous tissue and keep the ligatures away from the ileocolic vessels.",
        "A single tie on a thick, edematous pedicle slips as the swelling settles.",
        "The ileocolic trunk supplies the cecum and terminal ileum, and tying it cuts off their blood supply.",
      ],
      wrongComps: ["hemorrhage", "thrombosis"],
      consequences: [
        "The mass tie slides off the pedicle and the appendiceal artery pumps into the wound.",
        "The cecum and last loop of ileum turn dusky and mottled as their arterial supply stops.",
      ],
      rescueVariants: [null, "arterial"],
      effects: [null, {"repair": "appendiceal_artery"}, {"set": ["ileocolic_tied"], "repair": "ileocecal_resection"}],
    },
    {
      kind: "core",
      title: "Secure the appendix base",
      description: "The base is inflamed but not necrotic.",
      when: {"none": ["ileocecal_resection"]},
      choices: [
        "Crush the base with a clamp, then tie it twice with 0 absorbable ties just above the cecum.",
        "Tie the base once without crushing it, since the tissue is already soft, swollen, and easy to cinch down.",
        "Crush the base and divide it first, then tie the stump once the specimen is out.",
      ],
      feedback: [
        "Crushing leaves a thin line for the ties to seat in, and two ties make a secure stump.",
        "A single tie on swollen tissue loosens as the edema settles, and the stump leaks.",
        "Dividing before tying leaves an open, bleeding stump in the field.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "On day 3 he spikes 39.4 °C with rigors, and CT shows fluid collecting around the stump.",
        "The open stump bleeds briskly from its submucosal vessels as soon as the specimen comes away.",
      ],
    },
    {
      kind: "verify",
      title: "Decide on a drain after the resection",
      description: "The appendix came out with the ileocecal specimen. There is a fresh ileocolic anastomosis.",
      when: {"all": ["ileocecal_resection"]},
      choices: [
        "Place no routine drain, since a drain does not protect or reveal an ileocolic leak.",
        "Place a drain beside the anastomosis so that any leak will show up in the bag early.",
        "Lay a suction drain right against the staple line to keep the area completely dry.",
      ],
      feedback: [
        "Routine drains after a colonic anastomosis do not reduce leaks or catch them earlier.",
        "A drain beside the anastomosis adds a track for infection and gives false reassurance.",
        "Suction against a fresh staple line can erode the mesentery beside it and make it bleed.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "By day 3 the drain site is inflamed and the fluid in the bag has turned cloudy.",
        "The drain fills with fresh blood as the suction erodes a mesenteric vessel.",
      ],
      rescueVariants: ["wound", null],
    },
    {
      kind: "core",
      title: "Divide and remove the appendix",
      description: "The base is tied. Pack off the field before dividing.",
      when: {"none": ["ileocecal_resection"]},
      choices: [
        "Wall off with moist packs, divide above the ties with a knife, and hand that knife off as dirty.",
        "Divide with cautery flush against the ties so there is no stump left behind.",
        "Divide above the ties and keep using that same knife for the rest of the case, since it is still sharp.",
      ],
      feedback: [
        "Packing contains any spill, and retiring the contaminated knife keeps bowel flora out of the wound.",
        "Cautery right against the ties burns through them and they slip off the stump.",
        "A knife that has opened the bowel lumen carries bacteria into every layer it cuts afterward.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "The charred ties slip and the stump starts bleeding into the cecal serosa.",
        "By day 4 the wound is red, hot, and draining pus through the skin.",
      ],
      rescueVariants: [null, "wound"],
    },
    {
      kind: "core",
      title: "Close the mesenteric window",
      description: "The resection has left a gap in the mesentery beside the anastomosis.",
      when: {"all": ["ileocecal_resection"]},
      choices: [
        "Close the window with fine interrupted sutures that avoid the vessels running along its edge.",
        "Leave the window open, since it is small and any fluid collecting beside the anastomosis can drain through it.",
        "Close the window with a deep running stitch through the vascular arcade at its edge.",
      ],
      feedback: [
        "A closed window cannot trap a loop of bowel, and sparing the edge vessels keeps the anastomosis perfused.",
        "Small bowel can slip through an open window and twist, cutting off its own blood supply.",
        "Stitching through the arcade tears its vessels and bleeds into the mesentery.",
      ],
      wrongComps: ["thrombosis", "hemorrhage"],
      consequences: [
        "On day 2 a loop of ileum is trapped in the window and turning dark.",
        "A hematoma spreads through the mesentery beside the anastomosis.",
      ],
      rescueVariants: ["arterial", null],
    },
    {
      kind: "verify",
      title: "Look for a fecalith",
      description: "The CT mentioned a possible appendicolith.",
      choices: [
        "Open the specimen off the field and palpate the right lower quadrant for a dropped fecalith.",
        "Send the specimen closed, since a stone would have shown clearly on the CT.",
        "Milk the cecum toward the stump to express any debris before you close.",
      ],
      feedback: [
        "A dropped fecalith is a nidus for abscess, and finding it now prevents a return trip.",
        "CT can miss small stones, and a retained fecalith seeds a late abscess.",
        "Squeezing the cecum pushes against fresh ties and can blow the stump open.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "Two weeks later he returns septic with a pelvic abscess around a retained stone.",
        "The stump ligature slips under the pressure and the stump begins to bleed.",
      ],
    },
    {
      kind: "bleed",
      title: "Control a slipped mesenteric tie",
      description: "A tie on the mesoappendix has slipped and the stump is bleeding briskly.",
      when: {"none": ["appendiceal_artery_repaired", "ileocecal_resection"]},
      choices: [
        "Pinch the mesentery, suction, find the retracted vessel, and suture-ligate it under vision.",
        "Pack the wound, lower the table, and wait ten minutes for the bleeding to slow.",
        "Keep packing while anesthesia runs in three liters of crystalloid to hold the pressure up for now.",
      ],
      feedback: [
        "Compressing the pedicle buys a dry field to find the vessel and tie it for good.",
        "An arterial bleeder does not stop under a pack; it keeps losing blood into the pelvis.",
        "Crystalloid alone dilutes the blood and overloads the lungs while the vessel keeps bleeding.",
      ],
      wrongComps: ["hemorrhage", "fluid_overload"],
      consequences: [
        "The packs soak through, and HR climbs to 135 as BP falls to 80/45.",
        "Airway pressures rise and crackles appear as the crystalloid pools in his lungs.",
      ],
      effects: [null, {"repair": "appendiceal_artery"}, null],
    },
    {
      kind: "verify",
      title: "Recheck the pedicle ties",
      description: "The bleeding pedicle has already been sutured. Check it before you move on.",
      when: {"any": ["appendiceal_artery_repaired", "ileocecal_resection"]},
      choices: [
        "Look at the tied pedicle with the retractors relaxed and the blood pressure back up.",
        "Leave the pedicle alone now, since handling a fresh stitch again is the surest way to loosen it.",
        "Tug on the pedicle ties with forceps to prove that they are really secure.",
      ],
      feedback: [
        "A tie that holds at normal blood pressure, without retractor pressure, will hold after closure.",
        "A tie checked only while he was hypotensive may bleed once his pressure recovers.",
        "Pulling on a fresh ligature is how you pull it off.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "In recovery, as his blood pressure rises, the pedicle starts to bleed again.",
        "The tie pulls off, and blood mixed with bowel contents wells up from the stump.",
      ],
      rescueVariants: ["postop", null],
    },
    {
      kind: "vitals",
      title: "Read the falling blood pressure",
      description: "Estimated blood loss is 400 mL. HR 128, BP 84/50.",
      choices: [
        "Tell anesthesia the blood loss, send a hemoglobin and crossmatch, and look again for bleeding.",
        "Put it down to the fever and ask for more fentanyl while the operation carries on.",
        "Ask for metoprolol 5 mg IV to bring the heart rate below 100 before the tachycardia tires his heart.",
      ],
      feedback: [
        "Naming the blood loss aloud aligns the team, and looking again finds the source.",
        "Tachycardia with a falling pressure after 400 mL is bleeding until proven otherwise.",
        "The fast heart rate is holding his cardiac output up; beta-blocking it removes his compensation.",
      ],
      wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      consequences: [
        "Blood keeps collecting in the pelvis unnoticed, and BP drifts to 70/40.",
        "HR drops to 50 and BP to 58/30, and the rhythm widens on the monitor.",
      ],
      effects: [null, {"repair": "appendiceal_artery"}, null],
    },
    {
      kind: "dissect",
      title: "Wash out the right lower quadrant",
      description: "Purulent fluid remains around the cecum and in the gutter.",
      when: {"none": ["contaminated"]},
      choices: [
        "Suction the pus, then irrigate the right lower quadrant with warm saline until the return is clear.",
        "Irrigate the whole abdomen with six liters so every quadrant is washed as well as the right side.",
        "Scrub the fibrin off the cecum and ileum with a dry sponge to clean the serosa.",
      ],
      feedback: [
        "A local washout clears the contamination without carrying it elsewhere.",
        "Irrigating every quadrant spreads localized pus into clean parts of the abdomen.",
        "Rubbing inflamed serosa tears it and makes it bleed.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "A week later he has a left subphrenic abscess, far from the original source.",
        "The inflamed serosa oozes blood everywhere the sponge touched.",
      ],
    },
    {
      kind: "dissect",
      title: "Wash out gross fecal contamination",
      description: "Stool and pus have spread across the right lower quadrant and into the pelvis.",
      when: {"all": ["contaminated"]},
      choices: [
        "Remove the solid matter, irrigate the right lower quadrant and pelvis until clear, then change gloves.",
        "Irrigate every quadrant with ten liters of warm saline so that no area of the abdomen is left unwashed at all.",
        "Scrub the fibrin and stool off the bowel serosa with dry swabs until the loops look clean.",
      ],
      feedback: [
        "Removing solids and washing the soiled areas controls the contamination, and fresh gloves stop you carrying it on.",
        "Washing clean quadrants carries stool into them and seeds new abscesses.",
        "Rubbing inflamed serosa tears it and makes it bleed.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "Ten days later a CT shows abscesses under the left diaphragm and between loops of bowel.",
        "The scrubbed loops ooze blood from every raw patch of serosa.",
      ],
    },
    {
      kind: "verify",
      title: "Check the pelvis for pus",
      description: "Pus tracked down from the appendix tip.",
      choices: [
        "Look into the pelvis and paracolic gutter with the retractor and suction out any collection.",
        "Close now, since the pus seemed confined to the tip of the appendix and the washout came back clear.",
        "Break down every pelvic adhesion with your fingers to hunt for loculated pus.",
      ],
      feedback: [
        "Pus pools in the pelvis by gravity, and clearing it now prevents a pelvic abscess.",
        "An uncleared pelvic collection becomes a pelvic abscess within days.",
        "Tearing down adhesions leaves raw, bleeding surfaces across the pelvis.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "On day 5 he has pelvic pain, diarrhea, and swinging fevers from a pelvic abscess.",
        "Raw adhesion beds ooze steadily and blood pools in the pelvis.",
      ],
    },
    {
      kind: "verify",
      title: "Final check before closing",
      description: "The field looks dry with the retractors in place.",
      choices: [
        "Relax the retractors and recheck the stump and mesentery ties before you close.",
        "Close with the retractors still open, since the field looked dry a minute ago.",
        "Leave a drain in the right lower quadrant as routine to catch any leak or ooze.",
      ],
      feedback: [
        "Retractor tension can compress a bleeder; relaxing it shows whether the ties are secure.",
        "Retractors tamponade small vessels, and they bleed once the wound is closed.",
        "Routine drains in a non-abscess case add a track for infection without helping.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "In recovery the abdomen distends and hemoglobin drops two grams from a hidden bleed.",
        "By day 3 the drain site is red and discharging pus.",
      ],
      rescueVariants: ["postop", "wound"],
      effects: [null, {"repair": "reoperation_bleed"}, null],
    },

    // ── Closure ─────────────────────────────────────────────────────────────
    {
      kind: "closure",
      title: "Close the internal oblique",
      description: "The ilioinguinal nerve lies on the internal oblique near the medial end.",
      choices: [
        "Identify the ilioinguinal nerve and place loose sutures in the muscle that stay clear of it.",
        "Take deep, wide bites through the internal oblique so the muscle closure holds when he coughs.",
        "Leave wide gaps between a few interrupted sutures so any fluid can drain out.",
      ],
      feedback: [
        "Seeing the nerve first keeps it out of the closure while the muscle is reapproximated.",
        "Deep bites catch the ilioinguinal nerve and entrap it in the closure.",
        "Gaps leave dead space where serum and blood collect and become infected.",
      ],
      wrongComps: ["nerve_injury", "infection"],
      consequences: [
        "He wakes with sharp, burning groin pain that shoots into the scrotum with every movement.",
        "A tender, fluctuant swelling appears under the wound by day 4.",
      ],
      rescueVariants: [null, "wound"],
    },
    {
      kind: "closure",
      title: "Close the external oblique aponeurosis",
      description: "This is the strength layer of the wound.",
      choices: [
        "Close it with a running 0 absorbable suture, taking 1 cm bites 1 cm apart.",
        "Take deep medial bites near the rectus edge to anchor the closure firmly.",
        "Close it with braided silk, which holds its knots better in fatty tissue.",
      ],
      feedback: [
        "Running absorbable suture restores strength without leaving foreign material in a contaminated field.",
        "Deep medial bites can catch the inferior epigastric vessels.",
        "Braided nonabsorbable suture harbors bacteria in a contaminated wound and forms a chronic sinus.",
      ],
      wrongComps: ["hemorrhage", "infection"],
      consequences: [
        "A hematoma swells beneath the medial end of the wound in recovery.",
        "Weeks later the scar discharges pus around a knot of silk.",
      ],
      rescueVariants: ["postop", "wound"],
      effects: [null, {"repair": "reoperation_bleed"}, null],
    },
    {
      kind: "closure",
      title: "Close the skin",
      description: "The appendix was inflamed but not perforated. There is some ooze in the fat.",
      when: {"none": ["contaminated"]},
      choices: [
        "Irrigate the fat, cauterize the oozing points, and close with a subcuticular stitch.",
        "Close the skin tightly over the fat without irrigating the wound first.",
        "Close the skin over the oozing fat and let the dressing tamponade it.",
      ],
      feedback: [
        "Washing the fat and stopping the ooze before closure prevents both infection and hematoma.",
        "Contaminated fat closed without irrigation becomes a wound infection.",
        "A dressing does not stop bleeding under closed skin, and a hematoma forms.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "On day 3 the wound is red and swollen and drains pus when the stitch is removed.",
        "The dressing is soaked with blood within an hour, and a firm swelling lifts the wound.",
      ],
      rescueVariants: ["wound", "postop"],
    },
    {
      kind: "closure",
      title: "Manage the skin of a dirty wound",
      description: "The wound was grossly contaminated with stool. The fascia is closed.",
      when: {"all": ["contaminated"]},
      choices: [
        "Irrigate the fat and leave the skin open, packed loosely, for a delayed primary closure.",
        "Close the skin tightly with a subcuticular stitch so that the wound heals in a single week.",
        "Close the skin over the oozing fat and rely on the dressing to press the bleeding shut.",
      ],
      feedback: [
        "A dirty wound left open drains freely and can be closed in a few days once it is clean.",
        "Closing skin over grossly contaminated fat traps bacteria and makes a wound abscess very likely.",
        "Pressure from a dressing does not stop bleeding under closed skin.",
      ],
      wrongComps: ["infection", "hemorrhage"],
      consequences: [
        "By day 3 the wound is red and bulging, and pus pours out when a stitch is cut.",
        "The dressing is soaked with blood within the hour and a firm swelling lifts the wound.",
      ],
      rescueVariants: ["wound", "postop"],
    },

    // ── Wake-up and recovery ────────────────────────────────────────────────
    {
      kind: "postop",
      title: "Extubate",
      description: "The case is over. He is obese and had a full stomach at induction.",
      when: {"none": ["aspiration"]},
      choices: [
        "Suction, confirm full reversal of the block, and extubate him sitting up and fully awake.",
        "Extubate him deep, while still asleep, so he does not cough and strain on the tube.",
        "Reverse the rocuronium with neostigmine alone, leaving out the glycopyrrolate because he is tachycardic.",
      ],
      feedback: [
        "Awake, upright extubation with full reversal protects the airway of an obese full-stomach patient.",
        "Deep extubation leaves an unprotected airway in a patient at risk of aspiration and obstruction.",
        "Neostigmine without an anticholinergic causes profound bradycardia.",
      ],
      wrongComps: ["hypoxia", "cardiac_arrhythmia"],
      consequences: [
        "His airway obstructs as soon as the tube is out, and SpO2 plunges to 78%.",
        "Heart rate falls to 32 with a junctional rhythm a minute after the reversal.",
      ],
    },
    {
      kind: "postop",
      title: "Decide on extubation after aspiration",
      description: "He aspirated at induction. At the end of the case he needs FiO2 0.5 and PEEP 8 to keep SpO2 at 94%.",
      when: {"all": ["aspiration"]},
      choices: [
        "Keep him intubated on protective ventilation in the ICU until his oxygen needs have fallen.",
        "Extubate him now, awake and sitting upright, since he is breathing strongly and following commands.",
        "Give dexamethasone to calm the pneumonitis and extubate him in recovery.",
      ],
      feedback: [
        "A patient needing FiO2 0.5 and PEEP 8 is not ready to breathe alone; protective ventilation lets the lung recover.",
        "Strong breathing effort does not mean his lungs can oxygenate without PEEP; he will desaturate once extubated.",
        "Steroids do not improve outcome after aspiration and they do not make him safe to extubate.",
      ],
      wrongComps: ["hypoxia", "infection"],
      consequences: [
        "Twenty minutes after extubation his SpO2 falls to 82% and he is working hard to breathe.",
        "On day 3 he spikes a fever with a new right lower lobe consolidation on the ventilator.",
      ],
    },
    {
      kind: "postop",
      title: "Desaturation in recovery",
      description: "He snores, then SpO2 falls to 88% on 2 L nasal oxygen.",
      choices: [
        "Jaw thrust, sit him up 45 degrees, and start CPAP while you review his opioid doses.",
        "Give naloxone 2 mg IV to fully reverse the opioids that are depressing his breathing.",
        "Raise the oxygen to 15 L by face mask and let him sleep it off.",
      ],
      feedback: [
        "Opening the airway and splinting it with CPAP treats obstruction without losing his pain control.",
        "A large naloxone bolus causes a surge of catecholamines, with severe pain and arrhythmias.",
        "High-flow oxygen hides the saturation while CO2 climbs and he keeps obstructing.",
      ],
      wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      consequences: [
        "He wakes in agony, hypertensive, and the monitor shows runs of ventricular ectopy.",
        "The SpO2 looks fine for twenty minutes, then he becomes unrousable with CO2 narcosis.",
      ],
    },
    {
      kind: "postop",
      title: "Write the overnight fluids",
      description: "He is NPO tonight. Urine output 25 mL/h, BP 110/70, potassium 3.4.",
      choices: [
        "Run maintenance at 100 mL/h with oral potassium, and bolus 250 mL only if urine stays low.",
        "Run saline at 250 mL/h overnight to make up for the fever and the case losses.",
        "Replace the potassium with 40 mEq IV given over ten minutes so it is corrected before the night shift.",
      ],
      feedback: [
        "Maintenance with a trigger for boluses matches his needs and corrects the potassium safely by mouth.",
        "High-rate fluids overnight in an obese patient accumulate in the lungs.",
        "Rapid IV potassium produces dangerous arrhythmias; peripheral IV rates are far slower than this.",
      ],
      wrongComps: ["fluid_overload", "cardiac_arrhythmia"],
      consequences: [
        "By morning he is breathless with crackles to the mid-zones and SpO2 of 89%.",
        "Halfway through the infusion the ECG shows peaked T waves, then a run of ventricular tachycardia.",
      ],
    },
    {
      kind: "postop",
      title: "Decide on post-op antibiotics",
      description: "Pathology confirms acute appendicitis without perforation.",
      when: {"none": ["perforated", "contaminated", "ileocecal_resection", "cecum_repaired"]},
      choices: [
        "Stop antibiotics after the operation, since a non-perforated appendix needs no further course.",
        "Switch him to amoxicillin-clavulanate tablets for seven days at discharge to cover the gut flora.",
        "Keep ciprofloxacin and metronidazole going for two weeks as cover.",
      ],
      feedback: [
        "Uncomplicated appendicitis needs no postoperative antibiotics once the source is removed.",
        "Amoxicillin is a penicillin, and his allergy band says so.",
        "A long broad course with no indication selects for Clostridioides difficile colitis.",
      ],
      wrongComps: ["anaphylaxis", "infection"],
      consequences: [
        "An hour after the first tablet his lips swell and he wheezes on the ward.",
        "On day 9 he has profuse watery diarrhea, a fever, and a rising white count.",
      ],
      rescueVariants: [null, "cdiff"],
    },
    {
      kind: "postop",
      title: "Set the antibiotic course for a contaminated case",
      description: "The bowel was opened or contaminated during this operation. The source has now been controlled.",
      when: {"any": ["perforated", "contaminated", "ileocecal_resection", "cecum_repaired"]},
      choices: [
        "Continue ciprofloxacin and metronidazole for four days after source control, then stop.",
        "Stop the antibiotics tonight, since the source has now been removed from his abdomen.",
        "Switch him to amoxicillin-clavulanate tablets for two weeks to cover the gut flora.",
      ],
      feedback: [
        "After source control, a fixed four-day course is as effective as a longer one for intra-abdominal infection.",
        "Contamination that has already happened needs a short treatment course, not prophylaxis alone.",
        "Amoxicillin is a penicillin, and his band says he is allergic.",
      ],
      wrongComps: ["infection", "anaphylaxis"],
      consequences: [
        "On day 5 he spikes 39.2 °C and a CT shows a collection in the pelvis.",
        "An hour after the first tablet his lips swell and he wheezes on the ward.",
      ],
    },
    {
      kind: "postop",
      title: "Plan pain control",
      description: "He is obese and his partner says he snores loudly at night.",
      choices: [
        "Scheduled acetaminophen and ketorolac, with small oral oxycodone doses for breakthrough.",
        "A morphine PCA with a 2 mg per hour basal rate so he is comfortable all night.",
        "High-dose ketorolac every four hours around the clock for his whole stay, so he needs no opioid.",
      ],
      feedback: [
        "Multimodal analgesia limits opioids in a likely sleep apnea patient and caps the NSAID dose.",
        "A continuous opioid infusion in probable sleep apnea causes respiratory depression overnight.",
        "Uncapped high-dose ketorolac impairs platelets and the kidneys, and he bleeds.",
      ],
      wrongComps: ["hypoxia", "hemorrhage"],
      consequences: [
        "At 3 a.m. the nurse finds him unrousable with a respiratory rate of 6 and SpO2 of 81%.",
        "His dressing fills with blood and his hemoglobin falls by two grams on day 2.",
      ],
      rescueVariants: [null, "postop"],
    },
    {
      kind: "dvt",
      title: "Order VTE prophylaxis",
      description: "Obese, septic, and he will be in bed tonight.",
      when: {"none": ["major_bleed"]},
      choices: [
        "Enoxaparin 40 mg daily from tonight, compression sleeves, and walking from tomorrow morning.",
        "Compression sleeves only until he is up and walking, since at 28 his clot risk is low.",
        "Enoxaparin 1 mg/kg twice daily starting as soon as the skin is closed.",
      ],
      feedback: [
        "Prophylactic-dose enoxaparin plus mechanical measures fits his clot risk without bleeding risk.",
        "Age does not offset obesity, sepsis, and surgery; mechanical measures alone under-protect him.",
        "That is a treatment dose started on a fresh wound, and the wound bleeds.",
      ],
      wrongComps: ["thrombosis", "hemorrhage"],
      consequences: [
        "On day 3 he becomes suddenly breathless and tachycardic from a pulmonary embolus.",
        "The wound oozes steadily and a large hematoma spreads across the flank.",
      ],
      rescueVariants: [null, "postop"],
    },
    {
      kind: "dvt",
      title: "Time VTE prophylaxis after major bleeding",
      description: "He needed a bleeding vessel controlled and lost over a liter of blood. Obesity and sepsis still raise his clot risk.",
      when: {"all": ["major_bleed"]},
      choices: [
        "Start calf sleeves now and enoxaparin at 24 hours, once his hemoglobin is stable.",
        "Start enoxaparin 40 mg tonight as usual, since his clot risk has not changed.",
        "Hold all chemical prophylaxis until the day he is discharged, because of today's bleeding.",
      ],
      feedback: [
        "Mechanical prophylaxis protects him now, and delaying the drug a day lets fresh hemostasis settle.",
        "Anticoagulating hours after a major bleed risks the bleeding restarting.",
        "His clot risk is high; days without any drug leave him unprotected.",
      ],
      wrongComps: ["hemorrhage", "thrombosis"],
      consequences: [
        "Overnight the wound fills with a hematoma and his hemoglobin drops again.",
        "On day 4 he becomes suddenly breathless from a pulmonary embolus.",
      ],
      rescueVariants: ["postop", null],
    },
    {
      kind: "postop",
      title: "Work up a day 1 fever",
      description: "Temp 38.6 °C, HR 102. The wound is clean and his lungs sound quiet at the bases.",
      when: {"none": ["aspiration"]},
      choices: [
        "Get him up and walking with incentive spirometry, and examine the wound and calves first.",
        "Keep him resting flat in bed with extra opioid so the fever can settle overnight.",
        "Start piperacillin-tazobactam for a presumed early abscess tonight.",
      ],
      feedback: [
        "A day 1 fever with quiet bases is atelectasis until proven otherwise; deep breathing and walking treat it.",
        "Lying flat with more opioid deepens the atelectasis into a pneumonia.",
        "Piperacillin is a penicillin, and the allergy is on his band.",
      ],
      wrongComps: ["hypoxia", "anaphylaxis"],
      consequences: [
        "By the next morning he is on 6 L of oxygen with a right lower lobe collapse.",
        "Within minutes of the dose he is flushed, wheezing, and hypotensive on the ward.",
      ],
    },
    {
      kind: "postop",
      title: "Fever after the aspiration",
      description: "Day 1. Temp 38.7 °C, a right lower lobe infiltrate, and rising oxygen needs.",
      when: {"all": ["aspiration"]},
      choices: [
        "Send sputum cultures, support his breathing, and start ciprofloxacin only if pneumonia is likely.",
        "Start piperacillin-tazobactam for aspiration pneumonia, as it covers mouth anaerobes well.",
        "Give IV methylprednisolone for the chemical pneumonitis and hold off on any antibiotics for now.",
      ],
      feedback: [
        "Early fever after aspiration is often chemical; cultures guide antibiotics that avoid his penicillin allergy.",
        "Piperacillin is a penicillin, and his allergy band says so.",
        "Steroids do not help aspiration pneumonitis and they raise the chance of a real pneumonia.",
      ],
      wrongComps: ["anaphylaxis", "infection"],
      consequences: [
        "Within minutes of the dose he is flushed, wheezing, and hypotensive on the ward.",
        "By day 3 he has purulent sputum, a rising white count, and spreading consolidation.",
      ],
    },
    {
      kind: "postop",
      title: "Assess a swollen calf",
      description: "On day 2 his left calf is swollen and tender.",
      when: {"none": ["ileocecal_resection"]},
      choices: [
        "Get a same-day duplex scan and start full anticoagulation only if it shows a clot.",
        "Elevate and massage the calf, then reassess it on tomorrow's ward round.",
        "Start a full heparin infusion before any imaging, even though he is only two days from surgery.",
      ],
      feedback: [
        "Confirming the clot first means the bleeding risk of full anticoagulation is only taken when needed.",
        "Massaging a leg with a clot can dislodge it, and a delay lets it propagate.",
        "Empiric full anticoagulation this soon after surgery risks wound and intra-abdominal bleeding.",
      ],
      wrongComps: ["thrombosis", "hemorrhage"],
      consequences: [
        "During the massage he becomes acutely breathless and his SpO2 drops to 85%.",
        "The wound starts bleeding and his hemoglobin falls on the heparin.",
      ],
      rescueVariants: [null, "postop"],
    },
    {
      kind: "postop",
      title: "Pain and tachycardia after the resection",
      description: "Day 4 after the ileocecal resection: HR 118, new abdominal pain, temp 38.5 °C.",
      when: {"all": ["ileocecal_resection", "leak_risk"]},
      choices: [
        "Get a contrast CT for an anastomotic leak and prepare to return to theater if it confirms one.",
        "Start oral antibiotics and advance his diet, since pain on day 4 is expected after a resection.",
        "Give three liters of fluid for the tachycardia and review him again in the morning.",
      ],
      feedback: [
        "Tachycardia, fever, and new pain after an anastomosis are a leak until proven otherwise.",
        "Feeding a leaking anastomosis pushes bowel contents into the abdomen.",
        "Fluid treats the number, not the leak, and overloads him.",
      ],
      wrongComps: ["infection", "fluid_overload"],
      consequences: [
        "That night he becomes peritonitic and septic, with feculent fluid on a repeat CT.",
        "By morning he is breathless with crackles, and still tachycardic.",
      ],
      effects: [{"repair": "leak_mgmt"}, null, null],
    },
    {
      kind: "postop",
      title: "Plan the discharge",
      description: "Day 2. He is eating, walking, and his pain is controlled.",
      when: {"none": ["ileocecal_resection"]},
      choices: [
        "Discharge on oral analgesia, wound and fever advice, and enoxaparin if he will be immobile.",
        "Send him home with extended-release oxycodone so he does not have to call the ward for more tablets.",
        "Send him home tonight with no clot plan, even though he has a six-hour drive.",
      ],
      feedback: [
        "Oral analgesia and a clot plan for immobility keep him safe once he is home.",
        "Extended-release opioids at home in probable sleep apnea cause overnight respiratory depression.",
        "A long car journey days after surgery in an obese patient is a classic setup for a clot.",
      ],
      wrongComps: ["hypoxia", "thrombosis"],
      consequences: [
        "His partner calls an ambulance when she cannot wake him on his first night home.",
        "Two days later he arrives in the ED with pleuritic chest pain and a swollen leg.",
      ],
    },
    {
      kind: "postop",
      title: "Plan the discharge after the resection",
      description: "Day 8. He is eating, his bowels are working, and the wound is clean.",
      when: {"all": ["ileocecal_resection"]},
      choices: [
        "Discharge with wound and leak warning signs, enoxaparin while his mobility is reduced, and clinic in two weeks.",
        "Discharge with ten more days of oral amoxicillin-clavulanate to protect the join while it finishes healing.",
        "Discharge with extended-release oxycodone twice daily, so the pain never interrupts his sleep.",
      ],
      feedback: [
        "He knows which symptoms mean the join is leaking, and the clot plan covers his reduced mobility.",
        "Antibiotics do not protect a healed join; a needless course selects out C. difficile.",
        "Extended-release opioids at home, with probable sleep apnea, depress his breathing overnight.",
      ],
      wrongComps: ["infection", "hypoxia"],
      consequences: [
        "Nine days later he has profuse watery diarrhea and a fever.",
        "His partner cannot wake him on the second night at home.",
      ],
      rescueVariants: ["cdiff", null],
    },
  ],
  repairs: {
    "aspiration": {
      title: "Aspiration at induction",
      then: "next",
      steps: [
        {
          kind: "vitals",
          title: "Protect the airway",
          description: "Gastric fluid is welling up in the pharynx as he loses consciousness. The tube is not in yet.",
          choices: [
            "Tilt him head-down, suction the pharynx, and pass the tube with cricoid pressure before any breaths.",
            "Give several large bag-mask breaths first to lift his saturation, then intubate once he is pinker.",
            "Release the cricoid pressure so the fluid can drain, and give a small dose of atropine to dry it up.",
          ],
          feedback: [
            "Head-down drains the pharynx away from the larynx, and a cuffed tube seals the airway before ventilation.",
            "Positive-pressure breaths now drive the gastric fluid deep into both lungs.",
            "Releasing cricoid pressure lets more fluid reach the larynx, and atropine speeds his heart without drying anything.",
          ],
          wrongComps: ["hypoxia", "cardiac_arrhythmia"],
          consequences: [
            "SpO2 falls to 78% and both lung fields crackle after the mask breaths.",
            "His heart rate jumps to 150 while more fluid pools at the cords.",
          ],
        },
        {
          kind: "preop",
          title: "Clear the lungs",
          description: "The cuffed tube is in. Brown fluid is coming up the tube with each breath.",
          choices: [
            "Suction down the tube before ventilating, then ventilate with 100% oxygen and PEEP of 8.",
            "Lavage the trachea with 50 mL of saline to wash the acid out, then suction it back.",
            "Give IV methylprednisolone 1 g now to stop the acid injury from progressing in the lungs.",
          ],
          feedback: [
            "Suctioning first removes what you can, and PEEP holds open the alveoli the acid has injured.",
            "Saline lavage spreads the acid further into the small airways and worsens oxygenation.",
            "Steroids do not improve outcome after aspiration and they raise the risk of pneumonia.",
          ],
          wrongComps: ["hypoxia", "infection"],
          consequences: [
            "After the lavage his SpO2 drops to 80% and his airway pressures climb.",
            "By day 3 he has a fever and a spreading right lower lobe pneumonia.",
          ],
        },
        {
          kind: "preop",
          title: "Decide whether he needs a bronchoscopy",
          description: "The suction catheter brought up small pieces of food.",
          choices: [
            "Bronchoscope him now to remove the food particles before they block an airway.",
            "Hold off on the scope, since the saturation is recovering and the particles were small.",
            "Start broad-spectrum antibiotics now in place of a bronchoscopy to prevent pneumonia.",
          ],
          feedback: [
            "Particulate aspirate should be removed by bronchoscopy; suction alone leaves it in the smaller airways.",
            "Retained food particles plug a bronchus and collapse the lung beyond them.",
            "Prophylactic antibiotics are not recommended after aspiration and do not remove the food.",
          ],
          wrongComps: ["hypoxia", "infection"],
          consequences: [
            "Two hours later the right lower lobe collapses and his oxygen needs double.",
            "On day 5 he develops Clostridioides difficile diarrhea from the unnecessary course.",
          ],
        },
        {
          kind: "preop",
          title: "Decide whether to go ahead with the operation",
          description: "SpO2 is 95% on FiO2 0.5 with PEEP 8. His septic appendix is still in place.",
          choices: [
            "Go ahead once oxygenation is steady on these settings, since the septic appendix still needs removing.",
            "Abandon the operation for tonight and treat the appendicitis with IV antibiotics in the ICU until he recovers.",
            "Go ahead but turn the PEEP off so the surgeon has a flatter field to work in.",
          ],
          feedback: [
            "He is stable on moderate support, and sepsis from the appendix will not settle until it is out.",
            "Antibiotics alone in a septic, obese patient risk perforation and worse sepsis overnight.",
            "Removing PEEP collapses the injured alveoli and his saturation falls.",
          ],
          wrongComps: ["infection", "hypoxia"],
          consequences: [
            "By morning the appendix has perforated and he is in septic shock.",
            "SpO2 drops to 84% within minutes of the PEEP coming off.",
          ],
        },
      ],
    },
    "anaphylaxis_after": {
      title: "After anaphylaxis to a penicillin",
      then: "next",
      done: {"set": ["penicillin_anaphylaxis"]},
      steps: [
        {
          kind: "preop",
          title: "Decide whether to continue the operation",
          description: "The reaction is controlled on an epinephrine infusion. BP 104/60. His appendix is still septic.",
          choices: [
            "Continue once his pressure is steady, since his septic appendix still needs to come out today.",
            "Abandon the operation and treat the appendicitis with IV antibiotics alone until he recovers.",
            "Continue now, while he still needs repeated epinephrine boluses to hold a pressure.",
          ],
          feedback: [
            "Once stable, carrying on with an urgent operation after a moderate reaction does not worsen outcome.",
            "The appendix is the source of his sepsis; leaving it risks perforation on top of the reaction.",
            "Operating while he still needs boluses means any further bleeding or stress tips him into arrest.",
          ],
          wrongComps: ["infection", "cardiac_arrhythmia"],
          consequences: [
            "Two days later the appendix perforates and he is back in theater with peritonitis.",
            "During the incision his pressure collapses and the rhythm becomes ventricular tachycardia.",
          ],
        },
        {
          kind: "antibiotic",
          title: "Replace the antibiotic",
          description: "He still needs antibiotic cover for the operation.",
          choices: [
            "Stop every penicillin, record anaphylaxis on his chart, and give ciprofloxacin and metronidazole.",
            "Restart the ampicillin-sulbactam at a much slower rate, since the reaction was to the speed of infusion.",
            "Hold every antibiotic for the rest of the case so there is no risk of a second reaction.",
          ],
          feedback: [
            "An agent from an unrelated class covers the bowel flora with no cross-reactivity.",
            "Anaphylaxis is triggered by the drug, not the infusion rate; re-exposure sets it off again.",
            "Operating on a septic appendix with no antibiotic cover invites wound and abdominal infection.",
          ],
          wrongComps: ["anaphylaxis", "infection"],
          consequences: [
            "Minutes into the restarted infusion his airway pressures climb and hives return.",
            "On day 3 the wound is red and discharging pus.",
          ],
        },
        {
          kind: "postop",
          title: "Plan his recovery after the reaction",
          description: "The operation is over. He had grade 3 anaphylaxis two hours ago.",
          choices: [
            "Monitor him on a high-dependency unit for 24 hours and send a tryptase now and at 24 hours.",
            "Send him to the general surgical ward on routine observations, since he looks completely well now.",
            "Give prednisolone 60 mg daily for a week to stop the reaction from ever coming back.",
          ],
          feedback: [
            "Biphasic reactions can recur hours later, and paired tryptase levels confirm the diagnosis for allergy testing.",
            "A second-phase reaction on a general ward can be missed until he is in shock.",
            "Steroids do not reliably prevent a biphasic reaction and they slow wound healing.",
          ],
          wrongComps: ["anaphylaxis", "infection"],
          consequences: [
            "Six hours later on the ward his face swells and he wheezes, and no one is watching his monitor.",
            "By day 5 the wound is infected and his blood sugar has climbed on the steroids.",
          ],
        },
      ],
    },
    "epigastric": {
      title: "Inferior epigastric artery injury",
      then: "next",
      steps: [
        {
          kind: "bleed",
          title: "Get control of the bleeding",
          description: "Bright blood is pumping from the medial part of the wound.",
          choices: [
            "Press on it with a finger and extend the exposure so that both cut ends of the artery can be seen.",
            "Cauterize down into the depth of the wound where the blood seems to be coming from.",
            "Pack the wound firmly and ask anesthesia for two liters of saline while the bleeding settles down by itself.",
          ],
          feedback: [
            "Pressure stops the loss while wider exposure brings both retracted ends into view.",
            "A cut artery retracts; cautery at the surface does not reach it.",
            "Packing buys time but the crystalloid dilutes his blood and pools in his lungs.",
          ],
          wrongComps: ["hemorrhage", "fluid_overload"],
          consequences: [
            "Blood keeps pumping past the charred tissue and the wound fills again.",
            "His lungs crackle and SpO2 falls to 90% while the wound keeps oozing.",
          ],
        },
        {
          kind: "vessel",
          title: "Ligate the artery",
          description: "Both ends of the inferior epigastric artery are visible.",
          choices: [
            "Suture-ligate both the upper and the lower end, since the artery bleeds from both sides.",
            "Tie only the upper end, because that is the side the blood supply comes from.",
            "Clamp the external iliac artery above the inguinal ligament to stop all inflow to the area.",
          ],
          feedback: [
            "The epigastric arteries anastomose above, so the lower end back-bleeds unless it is tied too.",
            "The lower end refills from the superior epigastric artery and keeps bleeding.",
            "Clamping the external iliac artery cuts off the blood supply to his whole leg.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "The untied lower end starts to pump as soon as the pressure is released.",
            "His right leg becomes pale, cold, and pulseless while the clamp is on.",
          ],
          rescueVariants: [null, "arterial"],
        },
        {
          kind: "verify",
          title: "Check for a rectus sheath hematoma",
          description: "The bleeding has stopped.",
          choices: [
            "Release the pressure, watch the field stay dry for two minutes, and check under the rectus.",
            "Close over it now, since the bleeding looked well controlled a moment ago under your finger.",
            "Leave a suction drain under the rectus sheath as routine in every case like this one.",
          ],
          feedback: [
            "A hematoma under the rectus can hide further bleeding; checking now prevents a return to theater.",
            "A bleed that only looked controlled under pressure starts again once the wound is closed.",
            "A drain under the rectus adds a route for infection and does not stop bleeding.",
          ],
          wrongComps: ["hemorrhage", "infection"],
          consequences: [
            "In recovery a tense, painful swelling rises in the lower abdominal wall.",
            "By day 3 the drain site is red and leaking cloudy fluid.",
          ],
          rescueVariants: ["postop", "wound"],
        },
      ],
    },
    "cecal_enterotomy": {
      title: "Cecal perforation",
      then: "next",
      done: {"set": ["cecum_repaired"]},
      steps: [
        {
          kind: "core",
          title: "Control the cecal leak",
          description: "There is a hole in the cecum and stool is leaking into the wound.",
          choices: [
            "Close the hole with a Babcock clamp and pack moist swabs around the cecum before doing anything else.",
            "Suction all of the stool first, and look for the hole only once the whole field is completely clear of it.",
            "Lift the hole into view with toothed forceps gripping the edge of the cecal wall.",
          ],
          feedback: [
            "Stopping further leakage first limits how much of the abdomen is contaminated.",
            "While you suction, the hole keeps leaking stool into the abdomen.",
            "Toothed forceps tear the soft, inflamed cecal wall and make the hole larger and bleed.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "Stool keeps pouring out, tracking down into the pelvis.",
            "The cecal wall tears further and its edge bleeds briskly.",
          ],
        },
        {
          kind: "verify",
          title: "Assess the injury",
          description: "The spill is contained. Now decide how to repair the hole.",
          choices: [
            "Measure the hole against the circumference and check that its edges bleed and look viable.",
            "Close it now, since a finger or blade rarely makes a hole larger than a centimeter.",
            "Remove the whole right colon, since every cecal hole needs a right hemicolectomy.",
          ],
          feedback: [
            "A clean hole under half the circumference with healthy edges can be repaired; larger or dead edges need resection.",
            "Unmeasured holes are often larger than they look, and a second hole on the back wall is easily missed.",
            "A small clean hole does not need a major resection, which adds bleeding and a new anastomosis.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 4 stool leaks from a second, missed hole on the back wall of the cecum.",
            "The extended dissection for the hemicolectomy tears the ileocolic vessels.",
          ],
        },
        {
          kind: "core",
          title: "Repair the hole",
          description: "The hole is 1.5 cm, less than a third of the circumference, with healthy edges.",
          choices: [
            "Trim to healthy edges and close across the bowel in two layers: full thickness, then seromuscular.",
            "Close the hole along the length of the bowel in a single running layer of suture.",
            "Take deep bites that include the cecal mesentery on each side so the closure is extra strong and secure.",
          ],
          feedback: [
            "A transverse two-layer closure keeps the lumen wide and seals the full thickness.",
            "A lengthwise closure narrows the bowel, and one layer is more likely to leak.",
            "Bites through the mesentery strangle the vessels that supply the repair.",
          ],
          wrongComps: ["infection", "thrombosis"],
          consequences: [
            "On day 4 the repair leaks and stool spreads through the right side of the abdomen.",
            "The cecum beyond the repair turns dusky as its vessels are tied off.",
          ],
          rescueVariants: [null, "arterial"],
        },
        {
          kind: "verify",
          title: "Check the repair",
          description: "The repair is complete.",
          choices: [
            "Check that it is watertight and the lumen admits a finger, then change gloves and instruments.",
            "Push stool against the repair firmly with your hand to see whether it holds under real pressure.",
            "Oversew the ooze on the serosa with deep figure-of-eight stitches through the mesentery.",
          ],
          feedback: [
            "A sealed, wide repair and fresh instruments stop both a leak and carrying stool into the wound.",
            "Forcing stool against a fresh repair can split it open.",
            "Deep stitches through the mesentery tear its vessels and form a hematoma.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "The repair splits under the pressure and stool leaks out again.",
            "A hematoma spreads through the cecal mesentery.",
          ],
        },
      ],
    },
    "appendix_spill": {
      title: "Ruptured appendix spill",
      then: "next",
      steps: [
        {
          kind: "dissect",
          title: "Contain the spill",
          description: "The appendix tore in half. Pus, stool, and a fecalith spilled into the right gutter.",
          choices: [
            "Pack off the gutter, suction the pus, and remove the fecalith and debris by hand.",
            "Irrigate straight away with pulsed lavage to flush the pus and debris out of the gutter.",
            "Clamp deep into the pool of pus for the torn base before you can see where it lies.",
          ],
          feedback: [
            "Removing the solid matter and the pus before irrigating keeps the contamination local.",
            "Pressure irrigation spreads pus and debris through the abdomen.",
            "A clamp placed into pus without seeing the base catches the ileum or its mesentery.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "A week later he has a pelvic abscess and a collection between loops of bowel.",
            "The clamp catches the ileal mesentery, which bleeds.",
          ],
        },
        {
          kind: "core",
          title: "Secure the torn base",
          description: "The distal half of the appendix is out. The base is still attached to the cecum.",
          choices: [
            "Find the base where the taeniae meet, clamp it on healthy tissue, and tie it twice.",
            "Tie the stump right at the tear, even though the tissue there is black and soft.",
            "Staple well across the cecum, away from the base, and oversew the staple line with deep bites.",
          ],
          feedback: [
            "Tying on healthy tissue at the true base gives a stump that will hold.",
            "Ties on necrotic tissue cut through, and the stump leaks.",
            "Deep oversewing into the cecal wall catches its vessels and bleeds.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 3 the stump blows out and stool leaks into the pelvis.",
            "The staple line bleeds into the cecum.",
          ],
        },
      ],
    },
    "retroperitoneal": {
      title: "Retroperitoneal bleeding near the ureter",
      then: "next",
      done: {"set": ["major_bleed"]},
      steps: [
        {
          kind: "bleed",
          title: "Control the retroperitoneal bleeding",
          description: "Dark blood is welling up from beside the psoas. The ureter runs through this area.",
          choices: [
            "Press with a sponge stick, suction, and find the bleeding gonadal vessel before clamping anything.",
            "Fire large clamps into the pool of blood beside the psoas until the bleeding stops.",
            "Keep pressing on it while anesthesia gives three liters of crystalloid to hold his pressure.",
          ],
          feedback: [
            "Pressure controls venous bleeding while you find the vessel and keep the ureter safe.",
            "Clamps fired into pooled blood catch the ureter lying right next to the vessel.",
            "Three liters of crystalloid dilute his blood and flood his lungs.",
          ],
          wrongComps: ["infection", "fluid_overload"],
          consequences: [
            "A clamp crushes the right ureter; later, clear fluid leaks into the field.",
            "His lungs crackle and his saturation falls while the bleeding continues.",
          ],
          effects: [null, {"repair": "ureter"}, null],
        },
        {
          kind: "vessel",
          title: "Ligate the gonadal vessels",
          description: "The bleeding is from the gonadal vein.",
          choices: [
            "Identify the ureter where it crosses the iliac vessels first, then tie the gonadal vein above and below.",
            "Tie the gonadal vein together with all of the surrounding retroperitoneal tissue in one large mass ligature.",
            "Clip the external iliac vein beside it, which will slow any venous bleeding in the area.",
          ],
          feedback: [
            "Seeing the ureter first keeps it out of the ties; tying both ends stops the bleeding.",
            "A mass ligature on soft retroperitoneal tissue slips, and the vein bleeds again.",
            "Clipping the external iliac vein blocks the leg's main venous drainage.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "The mass tie slips off and dark blood wells up again.",
            "Within hours his right leg swells from thigh to ankle.",
          ],
        },
        {
          kind: "verify",
          title: "Check the ureter",
          description: "The bleeding has stopped.",
          choices: [
            "Watch the ureter for peristalsis and give IV methylene blue to check that it does not leak.",
            "Take it that the ureter is safe, since it was not in the area you clamped or tied.",
            "Dissect the ureter free along its whole length so that you can inspect every part of it.",
          ],
          feedback: [
            "Peristalsis and no dye leak show the ureter is intact; missed injuries cause urine leaks later.",
            "Half of ureteric injuries are missed at the first operation and present days later.",
            "Stripping the ureter along its length damages its blood supply and it strictures.",
          ],
          wrongComps: ["infection", "thrombosis"],
          consequences: [
            "On day 4 he has fever, flank pain, and a urine collection around the ureter.",
            "Weeks later the stripped ureter narrows and the kidney swells behind it.",
          ],
          effects: [null, {"repair": "ureter"}, null],
        },
      ],
    },
    "ureter": {
      title: "Ureteric injury",
      then: "next",
      done: {"set": ["ureter_repaired"]},
      steps: [
        {
          kind: "verify",
          title: "Define the injury",
          description: "The right ureter has been crushed or opened.",
          choices: [
            "Call urology, give IV methylene blue, and inspect the ureter to see how long the damaged segment is.",
            "Repair it yourself with one simple stitch across the injury so that the operation is not delayed any further.",
            "Tie off the damaged ureter and plan to drain the kidney through the back later on.",
          ],
          feedback: [
            "Knowing the length and level of the injury decides the repair, and urology should do it.",
            "A single stitch across a crushed ureter leaks and strictures.",
            "Tying the ureter obstructs the kidney, which becomes infected behind the tie.",
          ],
          wrongComps: ["infection", "thrombosis"],
          consequences: [
            "On day 3 urine leaks through the stitch and forms an infected collection.",
            "The tied ureter's blood supply fails and the segment dies.",
          ],
        },
        {
          kind: "core",
          title: "Repair the ureter",
          description: "A 1 cm crushed segment in the mid-ureter.",
          choices: [
            "Excise the crushed segment, spatulate both ends, and join them over a double-J stent.",
            "Join the ends straight across under tension, with no stent, to keep the repair simple.",
            "Strip the ureter's outer sheath off along its length to gain enough length for the join.",
          ],
          feedback: [
            "A spatulated, tension-free join over a stent heals in about nine cases out of ten.",
            "A tight join with no stent leaks and narrows as it heals.",
            "The outer sheath carries the ureter's blood supply; stripping it kills the ends.",
          ],
          wrongComps: ["infection", "thrombosis"],
          consequences: [
            "Urine leaks from the join and an infected urinoma forms around it.",
            "The stripped ureter ends turn pale and the repair breaks down.",
          ],
        },
      ],
    },
    "ileocecal_resection": {
      title: "Ischemic ileocecum: resection",
      then: "next",
      done: {"set": ["ileocecal_resection"]},
      steps: [
        {
          kind: "verify",
          title: "Confirm whether the bowel will survive",
          description: "The ileocolic trunk was tied. The cecum and last part of the ileum are dusky.",
          choices: [
            "Release the tie, wait ten minutes under warm packs, and check color, peristalsis, and bleeding edges.",
            "Resect straight away based on the color alone, before releasing the tie or waiting for any sign of recovery.",
            "Leave the dusky bowel in place and close, planning to look again in two days.",
          ],
          feedback: [
            "Restoring flow and waiting shows whether the bowel can recover before anything is removed.",
            "Resecting before releasing the tie may remove bowel that would have recovered.",
            "Leaving ischemic bowel in a septic patient lets it die and perforate.",
          ],
          wrongComps: ["hemorrhage", "infection"],
          consequences: [
            "The rushed resection is taken through the mesentery before the vessels are tied, and it bleeds.",
            "Two days later the cecum has perforated and stool fills the abdomen.",
          ],
        },
        {
          kind: "vessel",
          title: "Divide the mesentery",
          description: "After ten minutes the bowel is still dark. It must come out.",
          choices: [
            "Tie and divide the ileocolic vessels at their origin, sparing the right and middle colic supply.",
            "Take the mesentery all the way up to the middle colic vessels to be generous with the margin.",
            "Divide the mesentery with the cautery alone, without taking the time to tie the ileocolic trunk.",
          ],
          feedback: [
            "Tying at the origin removes the dead segment and keeps the colon beyond it perfused.",
            "Dividing the middle colic vessels leaves the transverse colon without its blood supply.",
            "Cautery does not seal a vessel the size of the ileocolic trunk.",
          ],
          wrongComps: ["thrombosis", "hemorrhage"],
          consequences: [
            "The transverse colon turns dusky once the middle colic vessels are divided.",
            "The ileocolic trunk pumps as soon as the cautery is lifted.",
          ],
          rescueVariants: ["arterial", null],
        },
        {
          kind: "core",
          title: "Divide the bowel",
          description: "Pick the margins for the resection.",
          choices: [
            "Divide the ileum and ascending colon between clamps at pink margins that bleed from their cut edge.",
            "Divide the ileum inside the dusky segment to save a little extra length of his small bowel for later.",
            "Divide the colon and its mesentery with scissors, without clamps or ties on either side.",
          ],
          feedback: [
            "Pink, bleeding margins are the ones an anastomosis can heal across.",
            "An anastomosis made on dusky bowel breaks down.",
            "Unclamped bowel spills its contents and the untied mesentery bleeds.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 4 the anastomosis leaks where it was made on dusky ileum.",
            "The divided mesentery bleeds from several points at once.",
          ],
          effects: [null, {"set": ["leak_risk"]}, null],
        },
        {
          kind: "core",
          title: "Join the bowel",
          description: "He is stable on low-dose noradrenaline. Lactate 2.1.",
          choices: [
            "Make a tension-free stapled side-to-side ileocolic anastomosis and close the common opening.",
            "Sew an end-to-end anastomosis under tension, since the two ends barely reach each other.",
            "Make the anastomosis, then close the common opening with a deep stitch through its mesentery.",
          ],
          feedback: [
            "A stable patient can have a primary anastomosis; tension-free, well perfused joins heal.",
            "An anastomosis under tension pulls apart as the bowel swells.",
            "A stitch through the mesentery catches the vessels feeding the anastomosis.",
          ],
          wrongComps: ["infection", "thrombosis"],
          consequences: [
            "On day 5 the joined ends pull apart and bowel contents leak.",
            "The bowel beside the anastomosis turns dusky as its mesentery is strangled.",
          ],
          rescueVariants: [null, "arterial"],
          effects: [null, {"set": ["leak_risk"]}, null],
        },
        {
          kind: "verify",
          title: "Check the anastomosis",
          description: "The anastomosis is complete.",
          choices: [
            "Check that it is pink, patent, and under no tension, with no bleeding from the staple line.",
            "Accept a slightly dusky anastomosis, since it should pink up once he warms up again.",
            "Reinforce the staple line with deep bites that go into the mesentery on both sides.",
          ],
          feedback: [
            "An anastomosis that is healthy now is the one that heals.",
            "A dusky anastomosis at the end of the case is one that will leak.",
            "Deep reinforcing bites tear the mesenteric vessels and bleed.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 4 the dusky anastomosis leaks and he becomes septic.",
            "A hematoma spreads along the mesentery beside the anastomosis.",
          ],
          effects: [null, {"set": ["leak_risk"]}, null],
        },
      ],
    },
    "appendiceal_artery": {
      title: "Bleeding appendiceal artery",
      then: "next",
      done: {"set": ["appendiceal_artery_repaired", "major_bleed"]},
      steps: [
        {
          kind: "bleed",
          title: "Find the bleeding artery",
          description: "The appendiceal artery is pumping from the mesoappendix.",
          choices: [
            "Pinch the mesoappendix between finger and thumb, suction, and find the retracted artery.",
            "Cauterize along the whole cut edge of the mesoappendix until the bleeding stops.",
            "Pack the wound and ask for three liters of crystalloid while you wait for it to settle.",
          ],
          feedback: [
            "Pinching the pedicle stops the flow and lets you see the artery's cut end.",
            "Cautery does not seal an artery that has retracted into fat, and the heat spreads to the cecum.",
            "An artery does not stop under a pack, and the crystalloid overloads him.",
          ],
          wrongComps: ["hemorrhage", "fluid_overload"],
          consequences: [
            "The artery keeps pumping through the charred fat.",
            "His airway pressures rise and his lungs crackle while the wound keeps filling.",
          ],
        },
        {
          kind: "vessel",
          title: "Tie the artery",
          description: "You can see the cut end of the appendiceal artery.",
          choices: [
            "Place a transfixion stitch of 2-0 absorbable on the artery under direct vision.",
            "Put a single free tie back around the swollen pedicle and pull it tight.",
            "Tie the ileocolic trunk, which reliably stops all flow into this area.",
          ],
          feedback: [
            "A transfixion stitch cannot slip off a swollen pedicle.",
            "A free tie on an edematous pedicle slips off again, just as the first one did.",
            "Tying the ileocolic trunk cuts off the blood to the cecum and terminal ileum.",
          ],
          wrongComps: ["hemorrhage", "thrombosis"],
          consequences: [
            "The new tie slides off and the artery pumps again.",
            "The cecum and terminal ileum turn dusky as their supply is cut off.",
          ],
          rescueVariants: [null, "arterial"],
          effects: [null, null, {"set": ["ileocolic_tied"], "repair": "ileocecal_resection"}],
        },
      ],
    },
    "mesenteric_tear": {
      title: "Torn ileal mesentery",
      then: "redo",
      done: {"set": ["mesentery_repaired"]},
      steps: [
        {
          kind: "bleed",
          title: "Control the mesenteric bleeding",
          description: "The ileal mesentery has torn and a hematoma is spreading through it.",
          choices: [
            "Press the torn mesentery flat between swabs, then find and tie each bleeding vessel.",
            "Place one large clamp across the whole torn area of the mesentery to control every bleeder together.",
            "Pour topical thrombin over the hematoma and move on to the appendix.",
          ],
          feedback: [
            "Pressure then individual ties control the bleeding and spare the vessels that are intact.",
            "A large clamp tears the fragile mesentery further and crushes vessels that were not bleeding.",
            "Topical agents do not stop arterial bleeding, and the hematoma keeps growing.",
          ],
          wrongComps: ["hemorrhage", "infection"],
          consequences: [
            "The clamp extends the tear and the hematoma doubles in size.",
            "The hematoma keeps expanding and later becomes infected.",
          ],
        },
        {
          kind: "verify",
          title: "Check the bowel's blood supply",
          description: "The bleeding is controlled. Some mesenteric vessels were torn.",
          choices: [
            "Watch the ileum beside the tear for color, peristalsis, and bleeding from a pinprick.",
            "Close the tear right away, since the bowel next to it still looks pink enough.",
            "Resect a meter of ileum around the tear to be completely sure it survives.",
          ],
          feedback: [
            "Checking the bowel now shows whether the torn vessels left a segment without blood supply.",
            "Bowel that looks pink at first can die over the next hours if its vessels were torn.",
            "Resecting healthy bowel adds an anastomosis that can leak.",
          ],
          wrongComps: ["thrombosis", "infection"],
          consequences: [
            "On day 2 the segment beside the tear dies and he develops peritonitis.",
            "On day 5 the unnecessary anastomosis leaks.",
          ],
          rescueVariants: ["arterial", null],
        },
        {
          kind: "closure",
          title: "Close the mesenteric defect",
          description: "The ileum is viable. There is a gap where the mesentery tore.",
          choices: [
            "Close the gap with fine interrupted sutures that avoid the vessels running along its edge.",
            "Leave the gap open, since it is small and a loop of bowel is very unlikely to slip through it.",
            "Close it with a deep running stitch through the vascular arcade at its edge.",
          ],
          feedback: [
            "A closed gap cannot trap bowel, and sparing the edge vessels keeps the ileum perfused.",
            "Small gaps trap bowel just as easily as large ones, and trapped bowel strangulates.",
            "Stitching through the arcade tears its vessels and bleeds.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "On day 3 a loop of ileum is caught in the gap and perforates.",
            "A new hematoma spreads through the mesentery along the stitch line.",
          ],
        },
      ],
    },
    "reoperation_bleed": {
      title: "Return to theater for bleeding",
      then: "next",
      done: {"set": ["major_bleed", "reoperated"]},
      steps: [
        {
          kind: "postop",
          title: "Decide to re-explore",
          description: "Two hours after surgery: HR 124, BP 88/50, hemoglobin down 3 g/dL, and the wound is swelling.",
          choices: [
            "Consent him, crossmatch, and take him back to theater tonight to find and stop the bleeding.",
            "Transfuse two units and keep watching him on the ward, going back only if the hemoglobin falls again.",
            "Give tranexamic acid and three liters of saline, then review him in the morning.",
          ],
          feedback: [
            "Ongoing bleeding with shock after surgery needs a return to theater, not observation.",
            "Transfusing without finding the source only delays the operation he needs.",
            "Large crystalloid volumes dilute his blood and overload him while he keeps bleeding.",
          ],
          wrongComps: ["hemorrhage", "fluid_overload"],
          consequences: [
            "By midnight his hemoglobin is 6.4 and he is barely maintaining a pressure.",
            "By morning he is breathless and edematous and his hemoglobin has halved.",
          ],
          rescueVariants: ["postop", null],
        },
        {
          kind: "bleed",
          title: "Evacuate the hematoma",
          description: "Back in theater. The wound is reopened.",
          choices: [
            "Evacuate all the clot, wash out, and find the bleeding vessel before you tie it.",
            "Squeeze the clot out through a small opening and let the vessel clot off on its own.",
            "Remove the clot and close up, since the wound looks clean once the clot is out.",
          ],
          feedback: [
            "Clearing the clot shows the source, and washing out the old blood lowers infection risk.",
            "A vessel that bled enough to need a return keeps bleeding if it is not tied.",
            "Old blood left in the wound is an ideal medium for infection.",
          ],
          wrongComps: ["hemorrhage", "infection"],
          consequences: [
            "Within an hour of closing, the wound swells again.",
            "On day 4 the wound is hot and discharging infected old blood.",
          ],
          rescueVariants: ["postop", "wound"],
        },
      ],
    },
    "leak_mgmt": {
      title: "Anastomotic leak",
      label: "Complication management",
      then: "next",
      done: {"set": ["leak", "ileostomy"]},
      steps: [
        {
          kind: "postop",
          title: "Decide on source control",
          description: "Day 4. CT shows free fluid and gas around the ileocolic join, and he has generalized peritonitis.",
          choices: [
            "Resuscitate, give broad-spectrum antibiotics, and take him back tonight for a laparotomy and washout.",
            "Place a CT-guided drain into the fluid and continue IV antibiotics on the ward overnight.",
            "Give four liters of crystalloid overnight and decide in the morning once he is better filled.",
          ],
          feedback: [
            "A free leak with peritonitis needs the abdomen opened and cleaned; drains only suit a small walled-off collection.",
            "A drain cannot clear free feculent fluid from the whole abdomen, and the sepsis keeps going.",
            "Fluid alone does not treat a leak; he keeps leaking, and the fluid collects in his lungs.",
          ],
          wrongComps: ["infection", "fluid_overload"],
          consequences: [
            "By morning he is on noradrenaline, with a lactate of 5.",
            "By morning his lungs crackle and he is still septic.",
          ],
        },
        {
          kind: "core",
          title: "Deal with the leaking join",
          description: "At laparotomy a third of the join has come apart, with stool throughout the abdomen. He needs noradrenaline.",
          choices: [
            "Take down the join, bring out an end ileostomy, and wash out the whole abdomen.",
            "Oversew the hole in the join, wash out the abdomen, and leave the join in place.",
            "Free the whole right colon mesentery to gain enough length to make a new join.",
          ],
          feedback: [
            "A septic patient on vasopressors should not get a new join; a stoma removes the leak for good.",
            "Stitches into inflamed, leaking bowel in a septic patient break down again.",
            "Wide mobilization in a septic, inflamed abdomen tears the mesenteric vessels.",
          ],
          wrongComps: ["infection", "hemorrhage"],
          consequences: [
            "Four days later the repaired join leaks again.",
            "The middle colic vessels tear and bleed into the mesentery.",
          ],
          rescueVariants: [null, null],
        },
        {
          kind: "postop",
          title: "Plan his recovery after the leak",
          description: "Day 5. He is off noradrenaline in the ICU and the stoma is working.",
          choices: [
            "Four more days of antibiotics after source control, enoxaparin, and stoma nurse teaching.",
            "Stop the antibiotics tonight, since the source has been removed and he is off vasopressors.",
            "Hold his enoxaparin for a week after this second operation, to protect the fresh stoma and wound.",
          ],
          feedback: [
            "Four days after source control is enough (STOP-IT), and he needs clot protection and stoma teaching.",
            "Stopping on the day of source control leaves residual peritonitis untreated.",
            "Two operations, sepsis, and bed rest make a week without prophylaxis a clot risk.",
          ],
          wrongComps: ["infection", "thrombosis"],
          consequences: [
            "On day 7 he spikes a fever from a pelvic collection.",
            "On day 9 his left leg swells from thigh to ankle.",
          ],
        },
      ],
    },
  },
};
