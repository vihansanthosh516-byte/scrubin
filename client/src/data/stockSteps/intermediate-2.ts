// ─────────────────────────────────────────────────────────────────────────────
// Intermediate surgery step banks (2 of 2) — 30-40 science-based steps each.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProcedureBank } from "./stepBuilder";

export const INTERMEDIATE_BANKS_2: ProcedureBank[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // TOTAL HIP REPLACEMENT
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "hip-replacement",
    spec: {
      vteHigh: true,
      approach: "a posterior approach to the hip",
      wrongApproaches: ["an anterior approach as routine", "a medial approach"],
      landmark: "the greater trochanter and the femoral neck",
      wrongLandmarks: ["the ischial tuberosity", "the anterior superior iliac spine"],
      vessel: "the circumflex femoral arteries",
      wrongVessels: ["the femoral artery", "the profunda femoris artery"],
      nerve: "the sciatic nerve",
      wrongNerves: ["the femoral nerve", "the obturator nerve"],
      structure: "the femoral head, neck, and acetabulum",
      wrongStructures: ["the pubic ramus", "the ischium"],
      test: "a trial reduction with stability and leg-length checks",
      wrongTests: ["an on-table MRI", "a stress radiograph"],
      risks: ["thrombosis", "hemorrhage", "hypoxia", "nerve_injury", "cardiac_arrhythmia", "infection", "fluid_overload", "anaphylaxis"],
      instrument: "a reamer and a broach",
      position: "lateral decubitus",
      wrongPositions: ["supine", "prone"],
      detail: "68-year-old, right hip osteoarthritis, hypertensive and diabetic",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the templating, the consent, and the implant plan." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Implant surgery demands timely prophylaxis." },
      { kind: "position", title: "Position in lateral decubitus", description: "Stabilize the pelvis for the posterior approach.", f: { wrongPositions: ["supine", "prone"] } },
      {
        kind: "access", title: "Make the skin incision", description: "Center the incision over the greater trochanter.",
        choices: [
          "Make a straight lateral incision centered over the greater trochanter for the posterior approach.",
          "Make an anterior incision as routine, even for the planned posterior approach.",
          "Make a medial incision to stay away from the sciatic nerve.",
        ],
        feedback: [
          "A lateral incision over the greater trochanter is the correct access for the posterior approach.",
          "An anterior incision does not line up with the posterior approach and strains the exposure.",
          "A medial incision crosses the adductor origin and gives poor access to the acetabulum.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "exposure", title: "Divide the short external rotators", description: "Expose the posterior capsule.", f: { structure: "the short external rotators", landmark: "the posterior capsule" } },
      {
        kind: "nerve", title: "Protect the sciatic nerve", description: "The sciatic nerve lies just posterior to the exposure.",
        choices: [
          "Keep the dissection anterior to the sciatic nerve and use gentle retraction only.",
          "Retract the sciatic nerve with a deep retractor for the whole case.",
          "Dissect posteriorly to identify the nerve and open the capsule through it.",
        ],
        feedback: [
          "The sciatic nerve is protected by keeping the dissection anterior.",
          "Prolonged retraction on the sciatic nerve causes foot drop.",
          "Opening through the nerve bed risks direct injury.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      { kind: "core", title: "Dislocate the hip and excise the head", description: "Deliver the femoral head.", f: { structure: "the femoral head and neck" } },
      {
        kind: "core", title: "Prepare the acetabulum", description: "Expose and ream the socket.",
        choices: [
          "Expose the acetabulum fully and ream sequentially to the templated size.",
          "Ream aggressively to reach the final size quickly.",
          "Skip the exposure and ream through the capsule.",
        ],
        feedback: [
          "The acetabulum is exposed and reamed to the templated size.",
          "Over-reaming removes excessive bone and risks fracture.",
          "Reaming through the capsule risks the obturator structures.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "vessel", title: "Control bleeding at the acetabular notch", description: "The circumflex vessels bleed during reaming.",
        choices: [
          "Identify the vessel at the notch and cauterize or ligate it precisely.",
          "Pack the notch and ream over it.",
          "Cauterize the entire acetabular bed.",
        ],
        feedback: [
          "The bleeding vessel is controlled directly.",
          "Reaming over a packed bleeder risks ongoing loss.",
          "Cauterizing the bed damages the bone and the obturator artery.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "core", title: "Place the acetabular component", description: "Fix the cup.",
        choices: [
          "Insert the cup at the correct abduction and anteversion and impact it securely.",
          "Insert the cup as vertically as possible.",
          "Impact the cup with maximum force to seat it deeply.",
        ],
        feedback: [
          "The cup is placed in the safe zone.",
          "A vertical cup dislocates early.",
          "Excessive force can fracture the acetabulum.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Prepare the femur", description: "Open and broach the femoral canal.",
        choices: [
          "Open the femoral canal at the piriformis fossa and broach sequentially with correct anteversion.",
          "Open the canal laterally at the greater trochanter.",
          "Broach forcefully to the largest size quickly.",
        ],
        feedback: [
          "The femur is prepared in correct version and size.",
          "A lateral entry risks trochanteric fracture and varus stem placement.",
          "Forceful broaching can perforate the femur.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "verify", title: "Perform the trial reduction", description: "Test stability, range, and leg length.",
        choices: [
          "Reduce the trial and test stability through a full range with the leg-length assessment.",
          "Reduce the trial and check stability in extension only.",
          "Skip the trial and insert the final components.",
        ],
        feedback: [
          "The trial confirms stability and leg length.",
          "Testing only in extension misses posterior instability.",
          "Skipping the trial risks component malposition.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "core", title: "Insert the final components", description: "Implant the stem and liner.",
        choices: [
          "Insert the final stem and liner, then reduce the hip.",
          "Insert the components with the leg in full adduction.",
          "Reduce the hip with forceful rotation.",
        ],
        feedback: [
          "The final components are seated and the hip reduced gently.",
          "Adducted insertion can lever the cup out.",
          "Forceful reduction can fracture the femur.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "verify", title: "Confirm stability and closure", description: "Check the repair of the capsule and rotators.", f: { test: "stability through range and the rotator repair", wrongTests: ["an on-table X-ray", "a CT scan"] } },
      { kind: "verify", title: "Confirm the leg length", description: "Re-check the leg-length equality before closure.", f: { test: "the leg-length comparison", wrongTests: ["an on-table X-ray", "a CT scan"] } },
      {
        kind: "verify", title: "Check the acetabular cup fixation", description: "Confirm the cup is fully seated and stable.",
        choices: [
          "Inspect the cup–rim interface and confirm the component is fully seated with no gap or rock.",
          "Confirm the cup by feel — if it does not move with a strong push, it is seated.",
          "Skip the seating check — the press-fit was forceful and the cup is unlikely to move.",
        ],
        feedback: [
          "A visual check of the rim and a stable press-fit confirm the cup will not rock or dislodge.",
          "A partially seated cup can feel stable to a push while still being proud of the rim.",
          "A proud or loose cup fails early — the seating check is not optional.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      { kind: "bleed", title: "Control a capsular bleeder", description: "The capsule is bleeding during the repair.", f: { vessel: "the circumflex branches in the capsule", wrongVessels: ["the femoral artery", "the profunda femoris artery"] } },
      {
        kind: "verify", title: "Wash the wound", description: "Irrigate the joint and the wound before closure.",
        choices: [
          "Irrigate the joint and wound thoroughly and suction out all debris and cement fragments before closure.",
          "Close over a routine X-ray to confirm the components rather than washing out.",
          "Skip the washout — the field has been clean throughout the case.",
        ],
        feedback: [
          "A thorough washout clears the cement and bone debris that would otherwise irritate the joint and seed infection.",
          "An X-ray confirms component position, not a clean wound — debris left behind still causes problems.",
          "Cement fragments and debris can sit unnoticed until they cause a third-body wear or infection.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      { kind: "closure", title: "Repair the capsule and rotators", description: "Restore the posterior structures.", f: { structure: "the posterior capsule and short external rotators" } },
      {
        kind: "closure", title: "Close the skin", description: "Close the subcutaneous layer and skin.",
        choices: [
          "Approve the skin edges and close with a subcuticular stitch over a deep dermal layer.",
          "Close the skin with wide vertical mattress sutures under tension.",
          "Close the skin and apply a compression dressing over a still-oozing wound.",
        ],
        feedback: [
          "A deep dermal layer with subcuticular skin closure heals cleanly under no tension.",
          "Wide mattress sutures under tension strangulate the skin edges and invite infection.",
          "Closing over oozing tissue risks a hematoma that can compromise the repair.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Hip arthroplasty is among the highest-risk procedures for thrombosis." },
      {
        kind: "postop", title: "Watch for dislocation signs", description: "The hip was done through a posterior approach.",
        choices: [
          "Teach the precautions — no deep bending past 90° or crossing the legs — and that sudden pain with a short, rotated leg needs urgent review.",
          "Tell the patient the hip cannot dislocate once the wound heals.",
          "Advise sleeping with the legs crossed for comfort.",
        ],
        feedback: [
          "Precautions and warning signs reduce dislocation and speed its treatment.",
          "A dislocated hip left unrecognized stretches the sciatic nerve.",
          "Crossing the legs is exactly the position that dislocates a posterior-approach hip, stretching the sciatic nerve.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Monitor the wound", description: "Day 3: the wound is dry; the patient has diabetes.",
        choices: [
          "Check the wound daily and keep glucose controlled; review any ooze beyond day 5.",
          "Leave the dressing untouched for 3 weeks.",
          "Change the dressing twice a day as routine.",
        ],
        feedback: [
          "Daily checks and glucose control lower periprosthetic infection risk.",
          "A long-standing dressing hides a hematoma collecting over the implant.",
          "Frequent dressing changes expose the wound to bacteria.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Check the leg pulses", description: "Day 0 in recovery.",
        choices: [
          "Check the foot pulses, capillary refill, and sensation, and compare with the other leg.",
          "Skip the check — hip surgery doesn't affect the pulses.",
          "Check the pulses only at discharge.",
        ],
        feedback: [
          "A baseline neurovascular exam catches vascular or nerve injury early.",
          "A rare vascular injury bleeds unrecognized.",
          "A late check misses a sciatic nerve palsy that could have been addressed.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Cryotherapy and swelling control", description: "Day 1: the thigh is swollen.",
        choices: [
          "Ice in cycles, elevation, and compression devices.",
          "Keep ice on the bare skin continuously.",
          "Keep the leg dependent to aid walking.",
        ],
        feedback: [
          "Cold and compression reduce swelling safely.",
          "Continuous ice burns the skin and the nearby superficial nerves.",
          "A dependent leg swells, and venous pooling raises the clot risk.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Home exercise program", description: "Going home on day 2.",
        choices: [
          "Give a program of ankle pumps, gluteal squeezes, and walking with a frame.",
          "Tell the patient to rest in bed until the clinic visit.",
          "Tell the patient to do deep squats to regain motion.",
        ],
        feedback: [
          "Guided exercise restores function and circulation.",
          "Bed rest raises the clot risk.",
          "Deep squats bend the hip past 90° and dislocate it, stretching the sciatic nerve.",
        ],
        wrongComps: ["thrombosis", "nerve_injury"],
      },
      {
        kind: "postop", title: "Fall precautions", description: "The patient lives alone.",
        choices: [
          "Arrange a frame, raised toilet seat, and a home safety check.",
          "Advise walking without aids as soon as possible.",
          "Advise staying in bed to avoid falls.",
        ],
        feedback: [
          "Home adaptations prevent falls and dislocation.",
          "A fall can fracture around the implant and bleed.",
          "Staying in bed raises the clot risk.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Anticoagulant adherence", description: "The patient is going home on LMWH injections.",
        choices: [
          "Teach self-injection, check someone can help if needed, and confirm the full course is supplied.",
          "Stop the injections when the wound looks healed.",
          "Double the dose if a dose is missed.",
        ],
        feedback: [
          "Completing the extended course is what prevents late clots.",
          "Stopping early leaves the patient exposed during the highest-risk weeks — a clot forms.",
          "Doubling up after a missed dose causes bleeding into the wound.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Going home on day 2.",
        choices: [
          "Give written advice on precautions, the wound, calf swelling, breathlessness, and fever.",
          "Give no written advice.",
          "Tell the patient calf swelling is normal and can be ignored.",
        ],
        feedback: [
          "Clear warning signs catch DVT and infection early.",
          "Without advice, a wound infection is reported late.",
          "Calf swelling can be a DVT — dismissing it risks a pulmonary embolus.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Return-to-activity plan", description: "The patient asks about driving.",
        choices: [
          "Drive after about 6 weeks, once off opioids and able to brake hard; low-impact activity only.",
          "Drive tomorrow if the pain allows.",
          "Avoid all activity for 6 months.",
        ],
        feedback: [
          "Guided return protects the hip and others on the road.",
          "Driving on opioids with a weak leg risks a crash and a dislocation.",
          "Prolonged inactivity raises the clot risk.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Plan mobilization and precautions", description: "Define the recovery pathway.",
        choices: [
          "Mobilize day one with posterior hip precautions and physiotherapy.",
          "Keep the hip immobilized in a brace for six weeks.",
          "Allow unrestricted motion immediately.",
        ],
        feedback: [
          "Early mobilization with precautions is the standard.",
          "Prolonged bracing causes stiffness and thrombosis risk.",
          "Unrestricted motion risks early dislocation.",
        ],
        wrongComps: ["thrombosis", "nerve_injury"],
      },
      {
        kind: "postop", title: "Monitor for fat embolism", description: "Watch for hypoxia and confusion after femoral preparation.",
        choices: [
          "Monitor oxygenation and mental status; treat hypoxia promptly.",
          "Ignore brief desaturation — it is common.",
          "Only monitor the wound site.",
        ],
        feedback: [
          "Early detection of fat embolism improves outcomes.",
          "Ignoring hypoxia risks progression to respiratory failure.",
          "Wound-only monitoring misses the systemic risk.",
        ],
        wrongComps: ["hypoxia", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Discharge criteria and follow-up", description: "Define the discharge plan.",
        choices: [
          "Discharge when mobilization is safe and arrange a 6-week review with X-ray.",
          "Discharge on the day of surgery.",
          "Discharge with a GP review and no orthopedic X-ray.",
        ],
        feedback: [
          "Criteria-based discharge with follow-up is standard.",
          "Same-day discharge is unsafe after a posterior-approach THA.",
          "A 6-week X-ray and orthopedic review catch component malposition and wound problems early.",
        ],
        wrongComps: ["infection", "thrombosis"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // BREAST LUMPECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "breast-lumpectomy",
    spec: {
      approach: "a curvilinear incision over the tumor with sentinel node biopsy",
      wrongApproaches: ["a radial incision at the areolar edge as routine", "a midline sternal incision"],
      landmark: "the tumor and its ultrasound-guided localization",
      wrongLandmarks: ["the nipple", "the axillary tail"],
      vessel: "the perforating vessels of the breast",
      wrongVessels: ["the internal mammary artery", "the axillary artery"],
      nerve: "the intercostobrachial nerve during axillary dissection",
      wrongNerves: ["the long thoracic nerve", "the phrenic nerve"],
      structure: "the tumor with clear margins",
      wrongStructures: ["the pectoralis major", "the ribs"],
      test: "specimen radiography and margin orientation",
      wrongTests: ["a routine mammogram of the other breast", "an on-table MRI"],
      risks: ["hemorrhage", "infection", "nerve_injury", "fluid_overload", "cardiac_arrhythmia", "hypoxia", "thrombosis", "anaphylaxis"],
      instrument: "a needle-localization wire and a scalpel",
      position: "supine with the arm abducted",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "52-year-old, 2 cm invasive ductal carcinoma, sentinel node candidate",
    },
    steps: [
      { kind: "preop", title: "Confirm the localization", description: "Confirm the wire or seed position on imaging before induction." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Clean case — prophylaxis is per protocol." },
      { kind: "position", title: "Position with the arm abducted", description: "Expose the breast and the axilla for the sentinel step.", f: { wrongPositions: ["prone", "supine with the arm adducted"] } },
      {
        kind: "access", title: "Plan the incision", description: "Place the incision for cosmesis and access.",
        choices: [
          "Make a curvilinear incision directly over the tumor, following the skin lines.",
          "Make a radial incision from the nipple to the periphery.",
          "Make an incision at the inframammary fold for every tumor.",
        ],
        feedback: [
          "A curvilinear incision over the tumor gives direct access with a good scar.",
          "Radial incisions are reserved for specific locations, not routine.",
          "An inframammary incision cannot access a central tumor.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "exposure", title: "Excise the skin and subcutaneous tissue", description: "Take the skin over the tumor if involved.", f: { structure: "the skin ellipse over the tumor", landmark: "the tumor edge" } },
      {
        kind: "core", title: "Excise the tumor with margins", description: "Remove the tumor with a clear margin.",
        choices: [
          "Excise the tumor with a 1-2 cm margin of normal tissue, oriented for pathology.",
          "Shell out the tumor along its capsule.",
          "Excise widely through the pectoralis muscle.",
        ],
        feedback: [
          "The specimen is excised with margins and oriented for the pathologist.",
          "Shelling out risks a positive margin and tumor spillage.",
          "Resecting the muscle is unnecessary for a lumpectomy.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "bleed", title: "Control the perforating vessels", description: "The perforators bleed during the excision.",
        choices: [
          "Identify the bleeding perforators and cauterize or ligate them precisely.",
          "Pack the cavity and close over it.",
          "Cauterize the entire cavity wall.",
        ],
        feedback: [
          "The perforators are controlled without thermal damage.",
          "Closing over an active bleeder risks a breast hematoma.",
          "Broad cautery burns the cavity and distorts the specimen bed.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "verify", title: "Confirm the specimen radiograph", description: "Check the specimen contains the lesion with margins.",
        choices: [
          "Send the oriented specimen for radiography and confirm the lesion with margins in the cavity.",
          "Trust the palpation and close.",
          "Skip the radiograph — the tumor was clearly visible.",
        ],
        feedback: [
          "The radiograph confirms the lesion and the margins.",
          "Skipping the check risks leaving the lesion behind.",
          "The radiograph is standard for non-palpable and borderline cases.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "nerve", title: "Protect the intercostobrachial nerve", description: "This nerve is at risk during axillary dissection.", f: { nerve: "the intercostobrachial nerve", wrongNerves: ["the long thoracic nerve", "the thoracodorsal nerve"] } },
      {
        kind: "core", title: "Perform the sentinel node biopsy", description: "Identify and remove the sentinel node.",
        choices: [
          "Identify the sentinel node with the tracer and remove it for pathology.",
          "Perform a full axillary dissection as routine.",
          "Skip the sentinel node and observe.",
        ],
        feedback: [
          "The sentinel node is identified and removed.",
          "Routine full dissection causes unnecessary lymphedema.",
          "Skipping the node leaves staging incomplete.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      { kind: "verify", title: "Re-check the cavity margins", description: "Confirm the cavity is clean before closure.", f: { test: "the cavity for residual disease and hemostasis", wrongTests: ["a routine mammogram", "an on-table MRI"] } },
      { kind: "exposure", title: "Inspect the pectoralis fascia", description: "Confirm the fascia is intact if it was not taken.", f: { structure: "the pectoralis fascia", landmark: "the pectoralis major" } },
      { kind: "bleed", title: "Control a cavity bleeder", description: "A perforator is bleeding in the cavity.", f: { vessel: "the perforating vessels of the cavity", wrongVessels: ["the internal mammary artery", "the axillary artery"] } },
      { kind: "verify", title: "Confirm the clip markers", description: "Verify the clips mark the cavity for radiation planning.", f: { test: "the cavity clip markers", wrongTests: ["a routine mammogram", "an on-table MRI"] } },
      { kind: "closure", title: "Close the cavity and skin", description: "Restore the breast contour.",
        choices: [
          "Approximate the cavity with deep sutures and close the skin with a subcuticular stitch.",
          "Close the skin over the open cavity.",
          "Drain the cavity routinely.",
        ],
        feedback: [
          "The cavity is closed to preserve contour.",
          "An open cavity leaves a depression and seroma.",
          "Routine drainage increases infection risk.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for a short breast case." },
      {
        kind: "postop", title: "Watch for hematoma", description: "Day 1: the breast is swollen and tense.",
        choices: [
          "Examine; if a tense, enlarging hematoma, return to theatre to evacuate it.",
          "Aspirate the hematoma repeatedly in clinic.",
          "Apply a tight bandage and discharge.",
        ],
        feedback: [
          "An expanding hematoma needs evacuation and control of the bleeding.",
          "Repeated aspiration introduces bacteria into the cavity.",
          "A tight bandage doesn't stop an active bleed.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Arm and shoulder care", description: "After sentinel node biopsy.",
        choices: [
          "Start gentle shoulder exercises from day 1, increasing over 2 weeks.",
          "Keep the arm in a sling for 4 weeks.",
          "Start heavy weight training right away.",
        ],
        feedback: [
          "Early gentle movement prevents stiffness.",
          "A sling stiffens the shoulder and raises the clot risk.",
          "Heavy lifting early can bleed into the axilla.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Wound care", description: "Breast and axillary wounds.",
        choices: [
          "Keep dry for 48 hours, wear a supportive bra, and watch for redness.",
          "Soak in a bath from day 1.",
          "Leave the dressings for 3 weeks.",
        ],
        feedback: [
          "Support and simple care help healing.",
          "Soaking fresh wounds lets bacteria in.",
          "Old dressings hide a slowly expanding hematoma.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Lymphedema education", description: "After sentinel node biopsy.",
        choices: [
          "Explain the low but real lymphedema risk and to report arm swelling early.",
          "Say lymphedema can't happen after sentinel biopsy.",
          "Ban all use of the arm for life.",
        ],
        feedback: [
          "Early reporting allows early treatment.",
          "Missed early swelling becomes chronic, and a swollen arm is prone to cellulitis.",
          "Disuse doesn't prevent lymphedema and stiffens the shoulder.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      {
        kind: "postop", title: "Pain control", description: "Pain 5/10.",
        choices: [
          "Regular paracetamol and an NSAID, with short-course opioid if needed.",
          "Round-the-clock opioid for 2 weeks.",
          "High-dose aspirin as the only analgesic.",
        ],
        feedback: [
          "Multimodal analgesia is enough for most.",
          "Long opioid use risks respiratory depression.",
          "High-dose aspirin impairs platelets and bleeds into the cavity.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Review the sentinel node result", description: "Pathology is back.",
        choices: [
          "Review margins and node status at the MDT and plan radiotherapy or further surgery.",
          "Tell the patient the result only if they ask.",
          "Skip the MDT and start chemotherapy for everyone.",
        ],
        feedback: [
          "MDT review directs adjuvant treatment.",
          "Positive margins left unaddressed let the cancer recur.",
          "Chemotherapy without indication causes infection risk from neutropenia.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Breast self-examination guidance", description: "Surveillance plan.",
        choices: [
          "Annual mammography plus breast awareness, reporting new lumps promptly.",
          "No imaging needed after lumpectomy.",
          "Monthly CT scans.",
        ],
        feedback: [
          "Standard surveillance catches recurrence early.",
          "A recurrence is found late.",
          "Frequent CT adds radiation and contrast reactions without benefit.",
        ],
        wrongComps: ["infection", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the review.",
        choices: [
          "Review at 1–2 weeks with the pathology and the oncology plan.",
          "Review at 6 months.",
          "No review — the GP will handle it.",
        ],
        feedback: [
          "Early review delivers results and checks the wound.",
          "A wound infection or seroma goes unnoticed.",
          "Results must be discussed by the treating team.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Genetic testing discussion", description: "Mother had breast cancer at 45.",
        choices: [
          "Refer for genetic counselling given the family history; start no hormone therapy until reviewed.",
          "Start combined HRT now for menopausal symptoms while testing is arranged.",
          "Arrange risk-reducing mastectomy next week before any counselling.",
        ],
        feedback: [
          "Counselling guides testing and prevention without adding risk now.",
          "Estrogen-containing HRT after breast cancer is contraindicated and raises the clot risk.",
          "Rushed extra surgery on fresh tissue adds bleeding and infection risk before the facts are known.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Going home the same day.",
        choices: [
          "Give written advice: wound care, arm exercises, fever, swelling, or calf pain.",
          "Give no written advice.",
          "Tell the patient breast swelling is always normal.",
        ],
        feedback: [
          "Clear advice catches complications.",
          "Infection is reported late.",
          "A hematoma can be missed.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Return to activity", description: "The patient asks about the gym.",
        choices: [
          "Light activity immediately; heavy lifting after about 2 weeks.",
          "Bed rest for a week.",
          "Heavy upper-body weights next day.",
        ],
        feedback: [
          "Graded activity aids recovery.",
          "Bed rest raises the clot risk.",
          "Heavy lifting early bleeds into the wound.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Cosmetic expectations", description: "The patient asks about appearance.",
        choices: [
          "Explain some change in shape is common and radiotherapy can alter it; revision is possible later.",
          "Promise the breast will look unchanged.",
          "Recommend immediate re-excision for appearance.",
        ],
        feedback: [
          "Realistic expectations reduce distress.",
          "Unmet expectations lead to unnecessary early surgery — and its infection risk.",
          "Early re-operation adds surgical risk.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Nutritional support", description: "Diet advice.",
        choices: [
          "Balanced diet with adequate protein; no special supplements needed.",
          "High-dose vitamin E and fish oil before radiotherapy.",
          "Fast to 'starve the cancer'.",
        ],
        feedback: [
          "A balanced diet supports healing.",
          "High-dose vitamin E and fish oil impair clotting — the wound bleeds.",
          "Fasting impairs healing and immunity.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Plan the pathology conversation", description: "Prepare for the margin and node results.",
        choices: [
          "Arrange follow-up to review margins, nodes, and the adjuvant plan.",
          "Send the pathology to the GP and review only if the margins are involved.",
          "Discuss only the cosmetic outcome.",
        ],
        feedback: [
          "Follow-up reviews the pathology and the adjuvant plan.",
          "Nodes, receptor status, and radiotherapy planning need a multidisciplinary review, whatever the margins.",
          "Cosmesis alone ignores the oncologic result.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Seroma management", description: "Week 2: a soft, fluctuant swelling under the scar.",
        choices: [
          "Observe a small, painless seroma; aspirate under sterile conditions only if it is large or tense.",
          "Aspirate it at the bedside without sterile prep.",
          "Incise and drain it in clinic.",
        ],
        feedback: [
          "Most seromas resorb; sterile aspiration is reserved for symptomatic ones.",
          "Non-sterile aspiration introduces bacteria into the cavity.",
          "Incising a seroma leaves a draining wound and can bleed.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan radiation and adjuvant therapy", description: "Coordinate the multidisciplinary plan.",
        choices: [
          "Refer for radiation and oncology follow-up as indicated by the pathology.",
          "Skip radiation — the lumpectomy was clean.",
          "Start chemotherapy immediately without pathology.",
        ],
        feedback: [
          "Adjuvant therapy is coordinated with the pathology.",
          "Radiation is standard after lumpectomy for most invasive cancers.",
          "Treatment without pathology is dangerous.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TYMPANOPLASTY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "tympanoplasty",
    spec: {
      approach: "an endaural or postauricular approach to the middle ear",
      wrongApproaches: ["a transcanal approach through a stenotic canal", "a cervical approach"],
      landmark: "the tympanic membrane remnant and the malleus handle",
      wrongLandmarks: ["the round window", "the stapes footplate alone"],
      vessel: "the vessels of the tympanic membrane remnant",
      wrongVessels: ["the internal carotid artery", "the sigmoid sinus"],
      nerve: "the chorda tympani and the facial nerve",
      wrongNerves: ["the trigeminal nerve", "the glossopharyngeal nerve"],
      structure: "the tympanic membrane and the ossicular chain",
      wrongStructures: ["the inner ear", "the eustachian tube orifice"],
      test: "a check of the graft position and ossicular continuity",
      wrongTests: ["an on-table audiogram", "a CT scan"],
      risks: ["infection", "nerve_injury", "hemorrhage", "fluid_overload", "cardiac_arrhythmia", "hypoxia", "thrombosis", "anaphylaxis"],
      instrument: "a microscope and a pick",
      position: "supine with the head rotated",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "34-year-old, chronic left ear perforation with conductive hearing loss",
    },
    steps: [
      { kind: "preop", title: "Confirm the indication", description: "Review the otoscopy, the audiogram, and the dry ear status." },
      { kind: "position", title: "Position the head", description: "Rotate the head to expose the ear canal.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      {
        kind: "access", title: "Choose the approach", description: "Match the approach to the perforation.",
        choices: [
          "Use an endaural or postauricular approach that matches the perforation location and canal width.",
          "Use a cervical approach to reach the middle ear from below.",
          "Force a transcanal approach through the stenotic canal for a cosmetic result.",
        ],
        feedback: [
          "An endaural or postauricular approach fits the perforation and the canal anatomy.",
          "A cervical approach does not access the middle ear and risks the great vessels.",
          "Working through a stenotic canal injures the canal skin and the chorda tympani.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "exposure", title: "Prepare the ear canal", description: "Expose the tympanic membrane.",
        choices: [
          "Raise a tympanomeatal flap and expose the perforation margins.",
          "Incise the canal skin blindly and reflect it.",
          "Enter the middle ear through the round window.",
        ],
        feedback: [
          "The flap exposes the perforation cleanly.",
          "Blind incision risks the facial nerve and the chorda tympani.",
          "The round window is the wrong entry for a tympanoplasty.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Refresh the perforation margins", description: "Prepare the edges for grafting.",
        choices: [
          "Denude the perforation edges with a pick to promote healing.",
          "Leave the edges intact for the graft to lie on.",
          "Enlarge the perforation to improve access.",
        ],
        feedback: [
          "Denuded edges allow the graft to heal.",
          "Undenuded edges prevent graft take.",
          "Enlarging the perforation worsens the defect.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "nerve", title: "Protect the chorda tympani", description: "The chorda runs across the drum.",
        choices: [
          "Identify the chorda tympani and retract it gently during the graft placement.",
          "Divide the chorda to improve exposure.",
          "Cauterize the chorda if it bleeds.",
        ],
        feedback: [
          "The chorda is preserved, avoiding taste disturbance.",
          "Dividing the chorda causes permanent taste loss.",
          "Cauterizing the chorda destroys it.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "core", title: "Harvest the graft", description: "Take the grafting material.",
        choices: [
          "Harvest temporalis fascia or tragal cartilage for the graft.",
          "Harvest a full-thickness skin graft from the thigh.",
          "Use a synthetic sheet as the graft.",
        ],
        feedback: [
          "Fascia or cartilage is the standard graft material.",
          "Skin grafts are not appropriate for the drum.",
          "Synthetic sheets have poor take rates.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "core", title: "Place the graft", description: "Position the graft correctly.",
        choices: [
          "Place the graft medial or lateral to the remnant, supporting it with gelfoam.",
          "Place the graft over the round window.",
          "Place the graft loosely without support.",
        ],
        feedback: [
          "The graft is positioned and supported for healing.",
          "A graft over the round window blocks the inner ear.",
          "An unsupported graft falls away and fails.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "verify", title: "Check the ossicular chain", description: "Confirm the chain moves with the graft.",
        choices: [
          "Confirm the malleus is intact and the chain moves with gentle palpation.",
          "Push firmly on the stapes to test its mobility.",
          "Irrigate the middle ear with room-temperature tap water to clear the view.",
        ],
        feedback: [
          "The ossicular chain is confirmed mobile.",
          "Forceful stapes pressure injures the inner ear, and the facial nerve runs just above it.",
          "Non-sterile irrigation seeds the middle ear with bacteria under the new graft.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      { kind: "verify", title: "Confirm the graft position", description: "Re-check the graft lies flat against the remnant.", f: { test: "the graft position under the microscope", wrongTests: ["an on-table audiogram", "a CT scan"] } },
      { kind: "exposure", title: "Inspect the ossicular chain again", description: "Confirm the chain was not disturbed by the packing.", f: { structure: "the ossicular chain", landmark: "the incudostapedial joint" } },
      { kind: "bleed", title: "Control a canal wall bleeder", description: "The canal skin is bleeding during the packing.", f: { vessel: "the canal wall vessels", wrongVessels: ["the internal carotid artery", "the sigmoid sinus"] } },
      { kind: "verify", title: "Check the facial nerve function", description: "Confirm facial nerve integrity on the monitor before closing.", f: { test: "the facial nerve function", wrongTests: ["a nerve conduction study", "an on-table MRI"] } },
      { kind: "closure", title: "Reposition the flap and pack the ear", description: "Finish the repair.",
        choices: [
          "Reposition the tympanomeatal flap and pack the canal with gelfoam.",
          "Leave the canal unpacked.",
          "Pack the canal tightly with a firm dressing.",
        ],
        feedback: [
          "The flap is repositioned and lightly packed.",
          "An unpacked canal lets the graft shift and blood and debris collect — and that becomes infected.",
          "Tight packing tears the canal skin and the flap, and the canal bleeds.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for a short ENT case." },
      {
        kind: "postop", title: "Ear protection rules", description: "Going home the same day.",
        choices: [
          "Keep the ear dry with a cotton ball and petroleum jelly when showering until the surgeon clears it.",
          "Let water run into the ear when showering — it cleans the canal.",
          "Flush the ear with water daily to keep it clean.",
        ],
        feedback: [
          "A dry ear protects the graft from infection.",
          "Water in the canal carries bacteria onto the fresh graft.",
          "Flushing washes out the packing and infects the graft.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Sneeze and nose-blow rules", description: "The patient has hay fever.",
        choices: [
          "Sneeze with the mouth open and avoid nose-blowing for 2–3 weeks.",
          "Blow the nose firmly to clear congestion.",
          "Pinch the nose and hold in sneezes.",
        ],
        feedback: [
          "Open-mouth sneezing avoids pressure on the graft.",
          "Forceful blowing pushes air up the Eustachian tube and lifts the graft, and the canal bleeds.",
          "Holding in sneezes drives pressure into the middle ear and displaces the graft.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Watch for graft infection", description: "Day 7: smelly discharge from the ear.",
        choices: [
          "Review promptly, swab the discharge, and start antibiotic ear drops as directed.",
          "Ignore the discharge — it is just melting packing.",
          "Clean the canal deeply with a cotton bud.",
        ],
        feedback: [
          "Early treatment of infection can save the graft.",
          "Foul discharge is infection, not packing.",
          "Cotton buds push infection deeper and tear the canal skin, which bleeds.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Pain control", description: "Pain 3/10.",
        choices: [
          "Regular paracetamol, with ibuprofen if needed.",
          "Strong opioids around the clock for a week.",
          "High-dose aspirin as the only analgesic.",
        ],
        feedback: [
          "Simple analgesia is usually enough after tympanoplasty.",
          "Round-the-clock opioids cause sedation and respiratory depression.",
          "High-dose aspirin impairs platelets and the canal bleeds.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Ear drops plan", description: "Antibiotic-steroid drops were prescribed.",
        choices: [
          "Use the drops as directed for the set course, warming the bottle first.",
          "Use leftover drops from a family member.",
          "Use cold drops straight from the fridge.",
        ],
        feedback: [
          "A defined course keeps the canal clean while the graft heals.",
          "Unknown drops can be ototoxic or contaminated — infection follows.",
          "Cold drops cause caloric vertigo, and a dizzy patient can fall.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Hearing aid consideration", description: "The patient asks about hearing.",
        choices: [
          "Check an audiogram at about 3 months once the packing is gone.",
          "Fit a hearing aid in the operated ear this week.",
          "Test the hearing on day 1 with the packing in place.",
        ],
        feedback: [
          "Hearing is assessed once the ear has healed.",
          "A hearing aid mould in a fresh canal introduces infection.",
          "Testing through packing gives a false result.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Packing removal timing", description: "The canal is packed with gelfoam.",
        choices: [
          "Leave the packing to dissolve or be removed at the 2–3 week visit.",
          "Pull out the packing at home on day 3.",
          "Push the packing deeper with a cotton bud.",
        ],
        feedback: [
          "Packing supports the graft until it takes.",
          "Early removal pulls the graft out and the canal bleeds.",
          "Pushing packing deeper tears the graft and introduces infection.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Return to swimming", description: "The patient swims weekly.",
        choices: [
          "No swimming until the graft is confirmed healed, usually 6–8 weeks.",
          "Swim next week with a swim cap.",
          "Swim now — the graft is protected by the packing.",
        ],
        feedback: [
          "Waiting for a healed graft prevents infection.",
          "Water still enters the canal under a cap.",
          "Packing soaks up pool water and infects the ear.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Going home the same day.",
        choices: [
          "Give written advice: keep the ear dry, no nose-blowing, return for discharge, severe pain, dizziness, or facial weakness.",
          "Give no written advice.",
          "Tell the patient facial weakness is expected.",
        ],
        feedback: [
          "Clear advice catches infection and nerve injury early.",
          "Without advice, infection is reported late.",
          "Facial weakness can mean a facial nerve injury.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Long-term hearing expectations", description: "Setting expectations.",
        choices: [
          "Explain the aim is a closed, dry ear; hearing may improve but is not guaranteed.",
          "Promise normal hearing.",
          "Tell the patient hearing will get worse.",
        ],
        feedback: [
          "Honest expectations improve satisfaction.",
          "False promises lead to early re-operation and its risks.",
          "Unwarranted pessimism is inaccurate.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Travel and pressure advice", description: "The patient plans to fly next week.",
        choices: [
          "Avoid flying for about 2 weeks; if unavoidable, use decongestants and swallow during descent.",
          "Fly freely — the graft is secure.",
          "Scuba dive after 2 weeks.",
        ],
        feedback: [
          "Pressure changes can lift a fresh graft.",
          "Cabin pressure changes can displace the graft and bleed.",
          "Diving pressures injure the inner ear.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Tinnitus counseling", description: "Pre-existing tinnitus.",
        choices: [
          "Explain tinnitus may improve, stay, or rarely worsen; report sudden change.",
          "Promise the tinnitus will stop.",
          "Ignore tinnitus questions.",
        ],
        feedback: [
          "Realistic advice and red flags help the patient.",
          "A sudden worsening could signal inner-ear injury and is dismissed.",
          "Unaddressed concerns delay reporting new symptoms.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "postop", title: "Ear cleaning rules", description: "The patient asks about wax.",
        choices: [
          "Clean only the outer ear with a cloth; no cotton buds in the canal.",
          "Use cotton buds daily in the canal.",
          "Use ear candles to draw out debris.",
        ],
        feedback: [
          "Leaving the canal alone protects the graft.",
          "Cotton buds tear the canal skin and push bacteria to the graft.",
          "Ear candles can burn the canal and graft.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Contact rules", description: "Contact sport questions.",
        choices: [
          "Avoid contact sport and heavy straining for 4–6 weeks.",
          "Resume rugby next week.",
          "Heavy lifting from day 2.",
        ],
        feedback: [
          "Avoiding trauma and straining protects the graft.",
          "A blow to the ear can displace the graft and bleed.",
          "Straining raises pressure and the canal bleeds.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan the post-op course", description: "Define ear protection and monitoring.",
        choices: [
          "Keep the ear dry, avoid nose-blowing, and arrange follow-up otoscopy.",
          "Allow swimming immediately.",
          "Review once at one week to remove the packing and then discharge.",
        ],
        feedback: [
          "Ear protection and follow-up optimize graft take.",
          "Water exposure risks infection and graft failure.",
          "Graft take and hearing are judged at months, not at the packing removal visit.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Monitor hearing and balance", description: "Watch for inner ear complications.",
        choices: [
          "Assess hearing and balance at the follow-up visit.",
          "Wait for symptoms before checking.",
          "Test hearing only at one year.",
        ],
        feedback: [
          "Hearing and balance are assessed early.",
          "Waiting for symptoms delays detection of inner ear injury.",
          "A one-year delay misses early failure.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "postop", title: "Set recovery expectations", description: "Set expectations for recovery.",
        choices: [
          "Explain that hearing may be reduced initially and will improve as the packing resolves.",
          "Promise immediate hearing improvement.",
          "Advise avoiding all activity for a month.",
        ],
        feedback: [
          "Realistic expectations are set for recovery.",
          "Overpromising immediate improvement sets up disappointment.",
          "Excessive restriction is unnecessary.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FEMORAL NAIL FIXATION
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "femoral-nail-fixation",
    spec: {
      vteHigh: true,
      approach: "an antegrade piriformis-entry intramedullary nail",
      wrongApproaches: ["a retrograde nail through the knee as routine", "a plate fixation as routine"],
      landmark: "the piriformis fossa and the greater trochanter",
      wrongLandmarks: ["the lesser trochanter", "the adductor tubercle"],
      vessel: "the profunda femoris artery branches",
      wrongVessels: ["the popliteal artery", "the femoral artery at the groin"],
      nerve: "the sciatic nerve during traction",
      wrongNerves: ["the femoral nerve", "the obturator nerve"],
      structure: "the femoral shaft fracture",
      wrongStructures: ["the femoral neck", "the distal femur"],
      test: "fluoroscopic confirmation of the nail and the reduction",
      wrongTests: ["an on-table MRI", "a bone scan"],
      risks: ["hemorrhage", "hypoxia", "infection", "nerve_injury", "thrombosis", "fluid_overload", "cardiac_arrhythmia", "anaphylaxis"],
      instrument: "an intramedullary nail and a guide wire",
      position: "supine on a traction table",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "35-year-old, right femoral shaft fracture from a motorcycle accident",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the imaging and the resuscitation status — the patient is in pain with borderline vitals." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "A fracture case requires timely prophylaxis." },
      { kind: "position", title: "Position on the traction table", description: "Supine with traction applied to the injured leg.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      {
        kind: "access", title: "Choose the entry", description: "Select the approach for the nail.",
        choices: [
          "Use an antegrade piriformis-entry nail for this shaft fracture.",
          "Use a retrograde nail through the knee as routine.",
          "Open the fracture and plate it as routine.",
        ],
        feedback: [
          "An antegrade piriformis-entry nail is the standard for a shaft fracture.",
          "A retrograde nail is for distal fractures, not routine shaft fixation.",
          "Routine plating is more invasive and less biomechanically suited to the shaft.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      { kind: "exposure", title: "Open the piriformis fossa", description: "Expose the correct entry point.", f: { structure: "the piriformis fossa", landmark: "the greater trochanter" } },
      {
        kind: "nerve", title: "Monitor the sciatic nerve during traction", description: "Traction can stretch the sciatic nerve.",
        choices: [
          "Monitor distal sensation and adjust traction if the nerve is stretched.",
          "Maintain maximum traction to hold the reduction.",
          "Ignore distal sensation until the nail is placed.",
        ],
        feedback: [
          "Traction is titrated to protect the sciatic nerve.",
          "Sustained maximum traction risks a traction injury.",
          "Ignoring distal checks risks permanent nerve damage.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Pass the guide wire", description: "Enter the canal with the guide wire.",
        choices: [
          "Pass the guide wire into the canal under fluoroscopy, confirming the central position.",
          "Push the guide wire forcefully until it passes.",
          "Advance the guide wire through the fracture site blindly.",
        ],
        feedback: [
          "The guide wire is placed centrally under imaging.",
          "Forceful passage can perforate the cortex.",
          "Blind passage can exit the canal or injure the soft tissues.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "core", title: "Ream the canal", description: "Prepare the canal for the nail.",
        choices: [
          "Ream sequentially to the templated diameter, keeping the reamer within the canal.",
          "Ream to the largest size immediately.",
          "Ream past the isthmus into the distal femur.",
        ],
        feedback: [
          "Sequential reaming prepares a correct-sized canal.",
          "Aggressive reaming risks thermal necrosis and cortical perforation.",
          "Over-reaming distal femur weakens the bone.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "core", title: "Insert the nail", description: "Deliver the nail across the fracture.",
        choices: [
          "Insert the nail with the correct alignment, confirming the fracture reduction under fluoroscopy.",
          "Insert the nail while the fracture is distracted.",
          "Insert the nail without checking the rotation.",
        ],
        feedback: [
          "The nail is inserted with the reduction held.",
          "Inserting into a distracted fracture leaves a gap and delayed union.",
          "Ignoring rotation causes a rotational malunion.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "verify", title: "Confirm the nail position", description: "Check the nail is central and the fracture is reduced.",
        choices: [
          "Confirm the nail is central in both planes and the fracture is well reduced on fluoroscopy.",
          "Trust the insertion and lock the nail.",
          "Accept minor malalignment — it will remodel.",
        ],
        feedback: [
          "The nail and reduction are confirmed on imaging.",
          "Locking a malpositioned nail commits the malalignment.",
          "Shaft fractures do not remodel like pediatric fractures.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "vessel", title: "Control bleeding at the fracture", description: "The fracture hematoma is bleeding during reduction.",
        choices: [
          "Minimize further disruption and control any active bleeders at the fracture site.",
          "Evacuate the entire hematoma.",
          "Cauterize the fracture ends.",
        ],
        feedback: [
          "The hematoma is preserved and bleeding is controlled.",
          "Evacuating the hematoma removes the healing scaffold.",
          "Cauterizing bone causes necrosis.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "vitals", title: "Respond to desaturation", description: "SpO2 is dropping during reaming.",
        choices: [
          "Pause reaming, inform anesthesia, and check for fat embolism.",
          "Continue reaming — the desaturation will resolve.",
          "Ask for more oxygen and keep reaming.",
        ],
        feedback: [
          "Reaming is paused and the cause is addressed.",
          "Continuing risks worsening fat embolism.",
          "Masking the hypoxia delays treatment of the embolism.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "core", title: "Lock the nail", description: "Secure the nail with interlocking screws.",
        f: { structure: "the proximal and distal locking screws" },
        choices: [
          "Insert the interlocking screws through the alignment guide, confirming each hole engages the nail under fluoroscopy.",
          "Lock only the proximal holes and leave the distal screws out.",
          "Freehand drill the distal holes without fluoroscopic confirmation.",
        ],
        feedback: [
          "The nail is locked both proximally and distally, controlling rotation and length.",
          "Leaving the distal screws out risks shortening and malrotation of the fracture.",
          "Freehand drilling can skive off the nail or injure the popliteal vessels.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "verify", title: "Test rotational stability", description: "Confirm the construct is stable.",
        choices: [
          "Check rotational and axial stability with the locking screws in place.",
          "Remove the locking screws for a dynamized nail.",
          "Confirm stability by X-ray only.",
        ],
        feedback: [
          "The locked construct is stable.",
          "Routine dynamization is for delayed union, not primary fixation.",
          "Imaging alone cannot assess clinical stability.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "verify", title: "Confirm the fracture alignment", description: "Re-check the rotation and the alignment on fluoroscopy.", f: { test: "the rotation and the alignment", wrongTests: ["an on-table MRI", "a bone scan"] } },
      {
        kind: "verify", title: "Check the knee range", description: "Confirm the knee motion is full after the nailing.",
        choices: [
          "Range the knee through full flexion and extension and confirm the patella tracks without catching.",
          "Confirm the motion by feel — if the knee moves, the nail has not blocked it.",
          "Skip the range check — the nail sits in the medullary canal and cannot affect the knee.",
        ],
        feedback: [
          "Full motion with smooth patellar tracking confirms the nail has not violated the joint.",
          "A proud or prominent nail tip can block motion without feeling like a hard stop.",
          "A nail that has backed out or breached the joint will present as stiffness and pain — check now.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      { kind: "bleed", title: "Control a fracture-site bleeder", description: "The fracture hematoma is oozing.", f: { vessel: "the branches at the fracture site", wrongVessels: ["the popliteal artery", "the femoral artery"] } },
      { kind: "verify", title: "Confirm the screw lengths", description: "Check the locking screws do not protrude excessively.", f: { test: "the screw lengths and the positions", wrongTests: ["an on-table MRI", "a CT scan"] } },
      { kind: "closure", title: "Close the wounds", description: "Close the entry and screw sites.", f: { structure: "the entry wound and screw incisions" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Long-bone fractures carry a high thrombosis risk." },
      {
        kind: "postop", title: "Pin and screw site care", description: "The distal locking screw wounds are weeping slightly.",
        choices: [
          "Clean and dress the screw sites, and review if redness spreads or fever develops.",
          "Leave weeping wounds open to the air.",
          "Apply a tight compression bandage over the shin.",
        ],
        feedback: [
          "Simple wound care controls minor weeping.",
          "Open, weeping wounds pick up bacteria and infect the screw tracks.",
          "A tight bandage over a swollen leg can raise compartment pressures and compress the nerves.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Monitor the distal pulses", description: "Day 0 in recovery.",
        choices: [
          "Check the foot pulses, capillary refill, and sensation hourly at first.",
          "Check only at the morning ward round.",
          "Skip the check — the fracture was closed.",
        ],
        feedback: [
          "Early neurovascular checks catch vascular injury and compartment syndrome.",
          "An arterial injury from the fracture or reaming can be missed for hours.",
          "A closed fracture can still injure the vessels and nerves.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Pain control", description: "Pain 8/10 on day 1.",
        choices: [
          "Multimodal analgesia: paracetamol, regular opioid with monitoring, and a nerve block if available.",
          "Opioid infusion without monitoring.",
          "Paracetamol only — strong pain helps the patient stay still.",
        ],
        feedback: [
          "Multimodal analgesia allows early movement safely.",
          "An unmonitored opioid infusion depresses breathing.",
          "Uncontrolled pain keeps the patient in bed and raises the clot risk.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "postop", title: "Wound care", description: "Entry and locking-screw wounds.",
        choices: [
          "Keep the wounds dry and check them before discharge.",
          "Leave the dressings untouched for 4 weeks.",
          "Apply antibiotic ointment daily as routine.",
        ],
        feedback: [
          "Simple wound care prevents infection.",
          "Covered wounds hide an infection over the nail.",
          "Topical antibiotics add no benefit and cause allergic reactions.",
        ],
        wrongComps: ["infection", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Anemia after the fracture", description: "Day 2: Hb 82 g/L, the patient is dizzy on standing.",
        choices: [
          "Recheck Hb, look for ongoing thigh bleeding, and transfuse if symptomatic or still falling.",
          "Transfuse four units straight away to reach a normal Hb.",
          "Ignore it — a femoral fracture always loses some blood.",
        ],
        feedback: [
          "A femoral shaft fracture can hide over a litre of blood in the thigh; symptomatic anemia needs assessment.",
          "Large-volume transfusion without reassessment overloads the circulation.",
          "Ongoing bleeding into the thigh goes unnoticed.",
        ],
        wrongComps: ["fluid_overload", "hemorrhage"],
      },
      {
        kind: "postop", title: "Physiotherapy plan", description: "Day 1.",
        choices: [
          "Start knee and hip movement and walking with crutches.",
          "Keep the leg immobilized for 6 weeks.",
          "Start running drills in the first week.",
        ],
        feedback: [
          "Early motion prevents stiffness and clots.",
          "Immobilization raises the clot risk.",
          "Running before union loads the nail and the screws can break.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Bone health review", description: "A 35-year-old with a high-energy fracture and a heavy smoking history.",
        choices: [
          "Advise stopping smoking and check vitamin D, since both affect fracture union.",
          "Start long-term steroids to reduce swelling.",
          "Advise nothing — union is purely mechanical.",
        ],
        feedback: [
          "Smoking cessation and vitamin D repletion improve union rates.",
          "Steroids impair bone healing and immunity — a wound or pin-site infection follows.",
          "Smoking delays union and raises infection risk around the nail.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Return-to-driving plan", description: "The fracture is in the right leg.",
        choices: [
          "No driving until the patient can do an emergency stop safely, usually after union, and is off opioids.",
          "Drive at 2 weeks with the seat pushed back.",
          "Drive once the wound has healed, even on crutches.",
        ],
        feedback: [
          "Safe braking needs a healed, strong right leg and a clear head.",
          "Braking hard on an un-united femur risks loosening and a crash.",
          "Driving on crutches and opioids risks a crash and a fall.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Hardware considerations", description: "The patient asks if the nail will come out.",
        choices: [
          "Explain the nail usually stays; removal only if symptomatic after union.",
          "Plan routine removal at 3 months.",
          "Tell the patient the nail must come out within a year.",
        ],
        feedback: [
          "Routine removal adds surgical risk without benefit.",
          "Removal before union risks refracture and bleeding.",
          "Unnecessary surgery adds infection risk.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Going home on day 4.",
        choices: [
          "Give written advice on crutches, the wound, calf pain, breathlessness, and fever.",
          "Give only the crutch leaflet.",
          "Tell the patient breathlessness is normal after a fracture.",
        ],
        feedback: [
          "Clear warning signs catch clots and infection early.",
          "Without wound advice, infection is reported late.",
          "Breathlessness can be a pulmonary embolus.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Plan mobilization", description: "Define weight-bearing.",
        choices: [
          "Allow partial weight-bearing progressing to full as healing allows.",
          "Keep the patient non-weight-bearing for three months.",
          "Allow immediate full weight-bearing.",
        ],
        feedback: [
          "Protected weight-bearing progresses with healing.",
          "Excessive restriction delays recovery and union.",
          "Immediate full weight-bearing risks implant failure.",
        ],
        wrongComps: ["thrombosis", "infection"],
      },
      {
        kind: "postop", title: "Monitor for fat embolism and compartment syndrome", description: "Watch the systemic and limb signs.",
        choices: [
          "Monitor oxygenation, mental status, and the leg for swelling and pain out of proportion.",
          "Monitor only the wound.",
          "Discharge without monitoring.",
        ],
        feedback: [
          "Systemic and limb complications are monitored.",
          "Wound-only monitoring misses fat embolism.",
          "No monitoring risks missing both complications.",
        ],
        wrongComps: ["thrombosis", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the radiological follow-up.",
        choices: [
          "Arrange outpatient follow-up with serial X-rays until union.",
          "Review once at 6 weeks and discharge if walking comfortably.",
          "Schedule a routine MRI of the leg.",
        ],
        feedback: [
          "Serial radiographs track union.",
          "Femoral union takes months; comfort at 6 weeks does not exclude non-union or implant failure.",
          "An MRI adds no value for union assessment.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ROTATOR CUFF REPAIR
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "rotator-cuff-repair",
    spec: {
      approach: "arthroscopic repair through standard portals",
      wrongApproaches: ["an open deltoid-splitting approach as routine", "a posterior approach"],
      landmark: "the supraspinatus footprint on the greater tuberosity",
      wrongLandmarks: ["the acromion", "the coracoid"],
      vessel: "the branches of the circumflex humeral artery",
      wrongVessels: ["the axillary artery", "the brachial artery"],
      nerve: "the suprascapular nerve",
      wrongNerves: ["the axillary nerve", "the musculocutaneous nerve"],
      structure: "the torn supraspinatus tendon",
      wrongStructures: ["the biceps tendon", "the subscapularis"],
      test: "probing the repair for security and footprint coverage",
      wrongTests: ["an on-table MRI", "a stress radiograph"],
      risks: ["nerve_injury", "infection", "hemorrhage", "thrombosis", "fluid_overload", "cardiac_arrhythmia", "hypoxia", "anaphylaxis"],
      instrument: "an arthroscope and suture anchors",
      position: "beach-chair or lateral decubitus",
      wrongPositions: ["prone", "supine with the arm adducted"],
      detail: "55-year-old, full-thickness supraspinatus tear on MRI",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the MRI and the repair feasibility." },
      { kind: "antibiotic", title: "Prophylactic antibiotic timing", description: "Anchor placement warrants prophylaxis." },
      { kind: "position", title: "Position the patient", description: "Beach-chair or lateral — either works if set up correctly.", f: { wrongPositions: ["prone", "supine with the arm adducted"] } },
      {
        kind: "access", title: "Establish the portals", description: "Place the posterior viewing and anterior working portals.",
        choices: [
          "Place the posterior viewing and anterior working portals just off the acromial edge.",
          "Convert to an open deltoid-splitting approach as routine before looking.",
          "Place a posterior midline approach and work straight down the deltoid.",
        ],
        feedback: [
          "Standard posterior viewing and anterior working portals give full access to the footprint.",
          "An open approach as routine adds deltoid morbidity that arthroscopy avoids.",
          "A midline posterior approach risks the axillary nerve and gives poor footprint access.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "landmark", title: "Diagnostic arthroscopy", description: "Survey the joint and confirm the tear.",
        choices: [
          "Inspect the biceps, subscapularis, labrum, and the supraspinatus tear systematically.",
          "Move straight to the tear and start the repair.",
          "Repair the tendon without checking the biceps.",
        ],
        feedback: [
          "The full survey identifies all pathology.",
          "Skipping the survey misses a biceps or subscapularis lesion.",
          "Missing a biceps lesion leaves a painful tenosynovitis.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "nerve", title: "Protect the suprascapular nerve", description: "Medial mobilization threatens the suprascapular nerve.",
        choices: [
          "Limit medial mobilization and avoid dissection medial to the spinoglenoid notch.",
          "Mobilize the tendon as far medially as needed for length.",
          "Cauterize the medial attachments to free the tendon.",
        ],
        feedback: [
          "The nerve is protected by limiting medial dissection.",
          "Mobilizing far medially tears the suprascapular vessels that run with the nerve — the field fills with blood.",
          "Cautery near the notch burns the suprascapular nerve.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Prepare the footprint", description: "Prepare the greater tuberosity for healing.",
        choices: [
          "Decorticate the footprint gently to a bleeding bone bed without removing cortical strength.",
          "Burr deeply into the tuberosity for maximum bleeding.",
          "Leave the footprint intact to preserve bone.",
        ],
        feedback: [
          "A light decortication promotes healing without weakening the bone.",
          "Aggressive burring weakens the anchor fixation.",
          "An intact footprint reduces the healing response.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "vessel", title: "Control bleeding at the footprint", description: "The bleeding bed obscures the view.",
        choices: [
          "Control the bleeding with epinephrine-soaked fluid and pressure.",
          "Cauterize the footprint broadly.",
          "Increase the pump pressure to maximum.",
        ],
        feedback: [
          "The field is cleared without damaging the bone.",
          "Cauterizing the bed reduces the healing surface.",
          "Excessive pump pressure causes soft-tissue extravasation.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Place the anchors", description: "Fix the anchors for the repair.",
        choices: [
          "Place the anchors at the footprint edge at the correct deadman's angle.",
          "Place the anchors deep in the tuberosity vertically.",
          "Place the anchors at the articular margin.",
        ],
        feedback: [
          "The anchors are placed at the correct angle for fixation strength.",
          "Vertical placement weakens the pullout strength.",
          "Anchors at the articular margin cause chondral damage.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "core", title: "Pass and tie the sutures", description: "Repair the tendon to the footprint.",
        choices: [
          "Pass the sutures through the tendon and tie a secure, tensioned repair with full footprint coverage.",
          "Pass the sutures through the tendon edge only.",
          "Tie the sutures without tension to avoid damage.",
        ],
        feedback: [
          "The repair covers the footprint with secure knots.",
          "Edge-only sutures fail early.",
          "A loose repair leaves the tendon unattached.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "verify", title: "Test the repair", description: "Confirm the repair holds.",
        choices: [
          "Probe the repair and move the shoulder through range to confirm it holds.",
          "Trust the knots and close.",
          "Test the repair with maximal abduction force.",
        ],
        feedback: [
          "The repair is stable through a gentle range.",
          "Skipping the test misses a loose repair.",
          "Forceful testing can pull the repair.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "verify", title: "Re-check the repair under rotation", description: "Confirm the repair holds with gentle internal rotation.", f: { test: "the repair under rotation", wrongTests: ["an on-table X-ray", "a stress radiograph"] } },
      { kind: "exposure", title: "Check the biceps tendon", description: "Confirm the biceps was not damaged during the repair.", f: { structure: "the biceps tendon", landmark: "the bicipital groove" } },
      { kind: "bleed", title: "Control a portal bleeder", description: "A portal site is bleeding.", f: { vessel: "the vessels at the portal site", wrongVessels: ["the axillary artery", "the brachial artery"] } },
      {
        kind: "verify", title: "Wash out the subacromial space", description: "Irrigate the space before closure.",
        choices: [
          "Irrigate the subacromial space and suction out all bone and anchor debris before closure.",
          "Close over a routine MRI to check for retained debris.",
          "Skip the washout — the space drains through the portals on its own.",
        ],
        feedback: [
          "A thorough washout clears the debris that would otherwise irritate the subacromial space and seed infection.",
          "An MRI cannot remove debris — the washout must happen while the portals are in.",
          "Retained debris causes postoperative catching and can seed infection.",
        ],
        wrongComps: ["infection", "thrombosis"],
      },
      { kind: "closure", title: "Close the portals", description: "Close the portal sites.", f: { structure: "the portal sites" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for shoulder surgery." },
      {
        kind: "postop", title: "Sling positioning", description: "Going home the same day.",
        choices: [
          "Wear the sling with a small abduction pillow for about 6 weeks, removing it for elbow and hand exercises.",
          "Remove the sling after 2 days.",
          "Keep the arm strapped to the body without moving the elbow for 6 weeks.",
        ],
        feedback: [
          "Protected positioning with elbow motion is standard after cuff repair.",
          "Early removal stresses the repair and it can pull out, tearing the suprascapular vessels.",
          "Total immobilization stiffens the elbow and the swollen arm raises the clot risk.",
        ],
        wrongComps: ["hemorrhage", "thrombosis"],
      },
      {
        kind: "postop", title: "Shoulder icing", description: "Pain and swelling on day 2.",
        choices: [
          "Use a wrapped ice pack or cold-therapy cuff in 20-minute cycles.",
          "Apply ice directly to the skin for hours.",
          "Use heat packs over the fresh wounds.",
        ],
        feedback: [
          "Short cycles of wrapped cold reduce pain safely.",
          "Prolonged direct ice burns the skin and the superficial nerves.",
          "Heat over fresh wounds increases swelling and bleeding.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Pain control", description: "Pain 7/10 on day 1.",
        choices: [
          "Regular paracetamol, short-course NSAID if suitable, and oral opioid for breakthrough; ice packs.",
          "Opioids around the clock for 6 weeks.",
          "No pain relief — pain protects the repair.",
        ],
        feedback: [
          "Multimodal analgesia allows rehab with little opioid.",
          "Long opioid courses risk dependence and respiratory depression.",
          "Uncontrolled pain prevents rehab and sleep.",
        ],
        wrongComps: ["hypoxia", "thrombosis"],
      },
      {
        kind: "postop", title: "Wound care", description: "Three small arthroscopic portals.",
        choices: [
          "Keep the portals dry for 48 hours, then shower; watch for redness or discharge.",
          "Soak the shoulder in a bath from day 1.",
          "Leave the dressings on for 3 weeks.",
        ],
        feedback: [
          "Simple portal care prevents infection.",
          "Soaking fresh portals lets bacteria in.",
          "Dressings left for weeks hide a wound hematoma until it bursts.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Home exercise program", description: "Week 1.",
        choices: [
          "Pendulum and passive exercises as taught, with elbow, wrist, and hand movement.",
          "Active lifting of the arm overhead from week 1.",
          "No exercises until 3 months.",
        ],
        feedback: [
          "Passive motion protects the repair while preventing stiffness.",
          "Active lifting early pulls the repair apart.",
          "No movement leads to a frozen shoulder.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Return-to-work plan", description: "The patient works as a painter.",
        choices: [
          "Light one-handed work early; overhead work only after strength returns, around 4–6 months.",
          "Return to overhead painting at 2 weeks.",
          "Stay off work for a year.",
        ],
        feedback: [
          "A graded return matches tendon healing.",
          "Overhead work early re-tears the repair.",
          "Long inactivity weakens the arm and slows recovery.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the review.",
        choices: [
          "Review at 2 weeks for the wounds and at 6 weeks to progress rehab.",
          "One review at 6 months.",
          "No review unless there is pain.",
        ],
        feedback: [
          "Staged reviews catch stiffness and infection.",
          "A late review misses early stiffness and infection.",
          "Stiffness is often painless at first.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Going home the same day.",
        choices: [
          "Give written sling rules, wound care, and reasons to return: fever, spreading redness, numb hand.",
          "Give no written advice.",
          "Tell the patient a numb hand is normal after shoulder surgery.",
        ],
        feedback: [
          "Clear advice catches infection and nerve problems.",
          "Without advice, an infection is reported late.",
          "A persistently numb hand can mean a nerve injury from the block or the surgery.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Long-term retear risk", description: "The patient asks about retear.",
        choices: [
          "Explain the retear risk rises with age and tear size; follow rehab and avoid early heavy lifting.",
          "Promise the repair can never tear again.",
          "Advise avoiding all shoulder use forever.",
        ],
        feedback: [
          "Honest counselling improves adherence.",
          "Overconfidence leads to early heavy use and retear.",
          "Disuse causes stiffness and weakness.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Driving advice", description: "The patient is in a sling.",
        choices: [
          "No driving while in the sling, usually about 6 weeks.",
          "Drive one-handed in the sling.",
          "Drive once the pain settles at 1 week.",
        ],
        feedback: [
          "Safe control of the car needs both arms.",
          "Steering one-handed risks a crash and stresses the repair.",
          "Steering early pulls the repair apart.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Sleep positioning", description: "The patient can't sleep.",
        choices: [
          "Sleep semi-reclined with the sling on and a pillow behind the elbow.",
          "Sleep lying on the operated shoulder.",
          "Take the sling off to sleep flat.",
        ],
        feedback: [
          "Semi-reclined sleep protects the repair and eases pain.",
          "Lying on the shoulder compresses and stresses the repair.",
          "Without the sling the arm falls and pulls the repair.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Avoidance rules", description: "List the movements to avoid.",
        choices: [
          "Avoid lifting, pushing, or reaching behind the back with the operated arm for 6 weeks.",
          "Only avoid swimming.",
          "No restrictions after the wounds heal.",
        ],
        feedback: [
          "Clear rules protect the healing tendon.",
          "Other movements can still pull the repair apart.",
          "Wound healing doesn't mean the tendon has healed.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Plan the sling and rehab", description: "Protect the repair during healing.",
        choices: [
          "Use a sling with passive motion, progressing to active motion per protocol.",
          "Start full active motion immediately.",
          "Immobilize the shoulder in a cast for six weeks.",
        ],
        feedback: [
          "Protected passive motion allows healing.",
          "Early active motion can pull the repair.",
          "Prolonged casting causes stiffness.",
        ],
        wrongComps: ["nerve_injury", "thrombosis"],
      },
      {
        kind: "postop", title: "Monitor for stiffness and infection", description: "Watch the recovery course.",
        choices: [
          "Review range of motion and the wound at follow-up visits.",
          "Leave the recovery to the physiotherapist without surgical review.",
          "Check only the wound at one month.",
        ],
        feedback: [
          "Structured follow-up tracks motion and healing.",
          "Stiffness and retear need surgical review to decide on imaging or intervention.",
          "Wound-only checks miss functional issues.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      {
        kind: "postop", title: "Return to activity", description: "Define the return timeline.",
        choices: [
          "Base return to lifting and sport on strength and functional testing.",
          "Allow heavy lifting at six weeks.",
          "Advise against ever lifting with the arm again.",
        ],
        feedback: [
          "Criteria-based return protects the repair.",
          "Early heavy loading risks retear.",
          "Permanent restriction is unnecessarily pessimistic.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // RHINOPLASTY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "rhinoplasty",
    spec: {
      approach: "an open (external) approach with a transcolumellar incision",
      wrongApproaches: ["a closed approach through the nostril rim as routine", "a lateral nasal incision"],
      landmark: "the nasal tip, the dorsum, and the septal cartilage",
      wrongLandmarks: ["the alar base alone", "the maxillary spine"],
      vessel: "the dorsal nasal and lateral nasal arteries",
      wrongVessels: ["the facial artery", "the angular artery"],
      nerve: "the infraorbital nerve",
      wrongNerves: ["the trigeminal nerve", "the facial nerve"],
      structure: "the nasal bones, septum, and tip cartilages",
      wrongStructures: ["the maxillary sinus", "the orbital rim"],
      test: "a check of the airway and the symmetry of the result",
      wrongTests: ["an on-table CT", "a rhinomanometry test"],
      risks: ["hypoxia", "hemorrhage", "infection", "fluid_overload", "cardiac_arrhythmia", "thrombosis", "anaphylaxis"],
      instrument: "a nasal speculum and a rasp",
      position: "supine with the head elevated",
      wrongPositions: ["prone", "Trendelenburg"],
      detail: "27-year-old, nasal deformity with breathing difficulty",
    },
    steps: [
      { kind: "preop", title: "Confirm the plan", description: "Review the photos, the airway complaint, and the surgical plan." },
      { kind: "position", title: "Position with the head elevated", description: "Elevation reduces venous bleeding.", f: { wrongPositions: ["prone", "Trendelenburg"] } },
      { kind: "access", title: "Choose the approach", description: "Open vs. closed — match to the deformity.", f: { wrongApproaches: ["a closed approach as routine", "a lateral nasal incision"] } },
      {
        kind: "access", title: "Make the transcolumellar incision", description: "Begin the open approach.",
        choices: [
          "Make the transcolumellar incision in the narrowest part of the columella.",
          "Make the incision at the nasal sill.",
          "Extend the incision onto the alar rim bilaterally.",
        ],
        feedback: [
          "The columellar incision heals with an imperceptible scar.",
          "A sill incision distorts the nostril.",
          "Alar rim extensions scar visibly.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "exposure", title: "Raise the skin envelope", description: "Expose the cartilaginous framework.", f: { structure: "the nasal skin envelope", landmark: "the septal cartilage" } },
      {
        kind: "core", title: "Assess the tip cartilages", description: "Evaluate the tip projection and rotation.",
        choices: [
          "Assess the tip cartilages and plan the suture techniques before any resection.",
          "Resect the tip cartilages freely to refine the tip.",
          "Suture the tip immediately without assessment.",
        ],
        feedback: [
          "The tip is assessed and managed with controlled techniques.",
          "Over-resection collapses the tip.",
          "Suturing without assessment locks in the deformity.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "core", title: "Address the dorsum", description: "Correct the dorsal profile.",
        choices: [
          "Reduce the dorsal hump conservatively with a rasp, preserving the midvault.",
          "Resect the entire dorsal septum aggressively.",
          "Leave the dorsum untouched in every case.",
        ],
        feedback: [
          "The dorsum is reduced conservatively, preserving support.",
          "Over-resection causes an inverted-V deformity.",
          "Ignoring the dorsum leaves the chief complaint unaddressed.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "vessel", title: "Control dorsal bleeding", description: "The dorsal nasal vessels are bleeding.",
        choices: [
          "Identify the bleeding vessels and cauterize or pack them precisely.",
          "Pack the nose and proceed.",
          "Cauterize the whole dorsum.",
        ],
        feedback: [
          "The bleeding is controlled precisely.",
          "Packing alone risks ongoing loss and rebleeding.",
          "Broad cautery burns the thin dorsal skin — the necrotic patch becomes infected.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "core", title: "Manage the septum", description: "Correct the septal deviation for the airway.",
        choices: [
          "Correct the septal deviation, preserving dorsal and caudal septal support.",
          "Resect the entire septum for a straight airway.",
          "Ignore the septum — the case is cosmetic.",
        ],
        feedback: [
          "The septum is straightened with support preserved.",
          "Total septectomy removes the L-strut: the dorsum collapses and the nasal valves obstruct breathing.",
          "Ignoring the septum leaves the breathing problem untreated.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "verify", title: "Check the airway", description: "Confirm the airway is patent after the septal work.",
        choices: [
          "Confirm bilateral airflow and check for septal perforation or hematoma.",
          "Trust the intraoperative view and close.",
          "Check the airway only at the first follow-up.",
        ],
        feedback: [
          "The airway is confirmed patent.",
          "Skipping the check risks a missed septal hematoma.",
          "Delaying the airway check misses an obstruction.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      { kind: "verify", title: "Assess the symmetry", description: "Step back and confirm the nasal symmetry before closure.", f: { test: "the nasal symmetry", wrongTests: ["an on-table CT", "a rhinomanometry test"] } },
      { kind: "exposure", title: "Check the dorsal line", description: "Confirm the dorsal profile is smooth and straight.", f: { structure: "the dorsal line", landmark: "the radix and the tip" } },
      { kind: "bleed", title: "Control a lateral wall bleeder", description: "The lateral nasal wall is bleeding.", f: { vessel: "the lateral nasal vessels", wrongVessels: ["the facial artery", "the angular artery"] } },
      { kind: "verify", title: "Confirm the septal position", description: "Re-check the septum is straight in the midline.", f: { test: "the septal position", wrongTests: ["an on-table CT", "a rhinomanometry test"] } },
      { kind: "core", title: "Refine the tip and close", description: "Finish the tip work and close the incisions.",
        choices: [
          "Refine the tip with suture techniques, close the columellar incision, and splint the nose.",
          "Close the incision without tip refinement.",
          "Tape the nose without suturing the columella.",
        ],
        feedback: [
          "The tip is refined and the incisions closed with a splint.",
          "Skipping tip work leaves the deformity.",
          "Un-sutured columella heals with a poor scar.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for nasal surgery." },
      {
        kind: "postop", title: "Splint care", description: "External splint and internal splints in place.",
        choices: [
          "Keep the splint dry and in place for about a week until removal in clinic.",
          "Remove the splint at home after 2 days.",
          "Wet the splint in the shower daily.",
        ],
        feedback: [
          "The splint supports the new shape while swelling settles.",
          "Early removal lets the bones shift and the nose bleeds.",
          "A wet splint loosens and harbors bacteria.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Watch for bleeding", description: "Day 0: light ooze from the nose.",
        choices: [
          "Expect light ooze; sit up, apply gentle pressure, and seek help for a steady bleed.",
          "Blow the nose to clear the clots.",
          "Lie flat to stop the bleeding.",
        ],
        feedback: [
          "Head-up and pressure control a normal ooze.",
          "Blowing dislodges clots and restarts bleeding.",
          "Lying flat raises nasal venous pressure and blood runs into the throat.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "postop", title: "Sleep position", description: "The patient asks how to sleep.",
        choices: [
          "Sleep with the head elevated on two pillows for a week.",
          "Sleep face-down to protect the nose.",
          "Sleep flat without pillows.",
        ],
        feedback: [
          "Elevation reduces swelling and bleeding.",
          "Face-down sleep presses on the splint and shifts the bones.",
          "Flat sleep increases swelling and nasal obstruction.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "postop", title: "Glasses restriction", description: "The patient wears glasses.",
        choices: [
          "Tape the glasses to the forehead or use contacts for 4–6 weeks.",
          "Wear glasses normally from day 1.",
          "Wear heavy sunglasses over the splint.",
        ],
        feedback: [
          "Taping avoids pressure on the healing nasal bones.",
          "Glasses pressing on the bones shift them and cause bleeding.",
          "Heavy frames press on the dorsum.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Pain control", description: "Pain 4/10.",
        choices: [
          "Regular paracetamol, with short-course opioid if needed.",
          "Round-the-clock opioid for 2 weeks.",
          "High-dose ibuprofen and aspirin together.",
        ],
        feedback: [
          "Simple analgesia is usually enough.",
          "Long opioid use with nasal packing risks respiratory depression.",
          "Combined antiplatelet effects cause nosebleeds.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Nasal saline and crusting", description: "Week 1: crusting inside the nose.",
        choices: [
          "Use saline sprays several times a day and avoid picking or blowing the nose.",
          "Pick the crusts out with a fingernail.",
          "Use a decongestant spray continuously for a month.",
        ],
        feedback: [
          "Saline softens crusts and keeps the airway clear safely.",
          "Picking crusts tears the healing mucosa and the nose bleeds.",
          "Long decongestant use causes rebound swelling and blocks the airway.",
        ],
        wrongComps: ["hemorrhage", "hypoxia"],
      },
      {
        kind: "postop", title: "Airway assessment", description: "Review at 1 week.",
        choices: [
          "Check nasal airflow on both sides after splint removal and plan saline rinses.",
          "Skip the airway check — the operation was cosmetic.",
          "Pack both nostrils for another week.",
        ],
        feedback: [
          "Checking airflow confirms the functional repair.",
          "The septal work was for breathing; obstruction goes unnoticed.",
          "Unneeded packing blocks breathing and harbors infection.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Scar management", description: "The columellar scar is healing.",
        choices: [
          "Keep the scar clean, moisturize once healed, and use sunscreen.",
          "Apply steroid cream on the fresh wound.",
          "Scrub the scar daily.",
        ],
        feedback: [
          "Simple care gives the best scar.",
          "Steroid on an unhealed wound delays healing and invites infection.",
          "Scrubbing opens the wound.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Swelling expectations", description: "The patient worries about swelling.",
        choices: [
          "Explain most swelling settles in weeks, but the final result takes up to a year.",
          "Promise the final shape at 1 week.",
          "Recommend revision at 1 month.",
        ],
        feedback: [
          "Realistic expectations reduce distress.",
          "Unrealistic expectations lead to early revision.",
          "Early revision operates on swollen tissue, raising bleeding and infection risk.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Clinic follow-up", description: "Arrange the reviews.",
        choices: [
          "Remove the splint at 1 week, then review at 1, 3, and 12 months.",
          "One review at 1 year.",
          "Remove the splint at home.",
        ],
        feedback: [
          "Serial reviews catch problems and track the result.",
          "Early problems like infection or hematoma are missed.",
          "Self-removal can shift the bones and cause bleeding.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Return to activity", description: "The patient plays basketball.",
        choices: [
          "Avoid contact sport for 6 weeks and strenuous exercise for 2–3 weeks.",
          "Return to basketball next week.",
          "Strenuous gym workouts from day 2.",
        ],
        feedback: [
          "Avoiding trauma protects the nasal bones.",
          "A knock to the nose early displaces the bones and bleeds.",
          "Straining raises blood pressure and causes a nosebleed.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "postop", title: "Makeup and skin care", description: "The patient asks about makeup.",
        choices: [
          "Avoid makeup on the nose until the splint is off and incisions heal.",
          "Apply heavy makeup under the splint edges.",
          "Use exfoliating scrubs on the nose.",
        ],
        feedback: [
          "Waiting protects the wounds.",
          "Makeup under the splint irritates and infects the skin.",
          "Scrubs damage fragile skin.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Going home the same day.",
        choices: [
          "Give written advice: splint care, head-up sleep, heavy bleeding, fever, or blocked nose with pain.",
          "Give no written advice.",
          "Tell the patient a fever is normal after nose surgery.",
        ],
        feedback: [
          "Clear advice catches bleeding and septal hematoma.",
          "Heavy bleeding is reported late.",
          "Fever can mean a septal abscess or sinusitis.",
        ],
        wrongComps: ["hemorrhage", "infection"],
      },
      {
        kind: "postop", title: "Plan post-op airway monitoring", description: "Airway obstruction can develop after nasal surgery.",
        choices: [
          "Monitor for airway compromise and bleeding; keep the head elevated.",
          "Discharge immediately without monitoring.",
          "Keep the patient flat and sedated overnight.",
        ],
        feedback: [
          "Airway monitoring catches early obstruction.",
          "Immediate discharge risks a late airway event.",
          "Flat positioning and sedation worsen obstruction.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Watch for septal hematoma", description: "A septal hematoma can destroy the cartilage.",
        choices: [
          "Inspect the septum for hematoma and drain it if present.",
          "Wait for the patient to complain before inspecting.",
          "Assume a hematoma will resorb.",
        ],
        feedback: [
          "A septal hematoma is detected and drained.",
          "Waiting for symptoms can allow cartilage necrosis.",
          "Hematomas do not resorb — they abscess.",
        ],
        wrongComps: ["infection", "hypoxia"],
      },
      {
        kind: "postop", title: "Plan the follow-up", description: "Define the recovery timeline.",
        choices: [
          "Arrange follow-up for splint removal, then serial reviews over the year.",
          "Remove the splint at one week and discharge from follow-up.",
          "Schedule a CT scan at one month.",
        ],
        feedback: [
          "Structured follow-up tracks the healing nose.",
          "The nose changes shape for a year; early deformities need serial review.",
          "Imaging adds no value for routine healing.",
        ],
        wrongComps: ["infection", "hypoxia"],
      }
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PARATHYROIDECTOMY
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "parathyroidectomy",
    spec: {
      approach: "a focused approach guided by sestamibi and intraoperative PTH",
      wrongApproaches: ["a bilateral neck exploration as routine", "a transoral approach"],
      landmark: "the inferior thyroid artery and the RLN",
      wrongLandmarks: ["the carotid bifurcation", "the clavicular heads"],
      vessel: "the inferior thyroid artery",
      wrongVessels: ["the carotid artery", "the internal jugular vein"],
      nerve: "the recurrent laryngeal nerve",
      wrongNerves: ["the hypoglossal nerve", "the vagus nerve"],
      structure: "the parathyroid adenoma",
      wrongStructures: ["the thyroid nodule", "the thymus"],
      test: "intraoperative PTH measurement",
      wrongTests: ["a routine ultrasound", "an on-table biopsy of the thyroid"],
      risks: ["nerve_injury", "hemorrhage", "hypoxia", "infection", "fluid_overload", "cardiac_arrhythmia", "thrombosis", "anaphylaxis"],
      instrument: "a nerve monitor and a fine dissector",
      position: "supine with the neck extended",
      wrongPositions: ["prone", "lateral decubitus"],
      detail: "55-year-old, primary hyperparathyroidism, elevated calcium",
    },
    steps: [
      { kind: "preop", title: "Confirm the localization", description: "Review the sestamibi and ultrasound to plan the focused approach." },
      { kind: "position", title: "Position the neck", description: "Extension opens the operative space.", f: { wrongPositions: ["prone", "lateral decubitus"] } },
      { kind: "access", title: "Make the incision", description: "A small incision over the localized adenoma.", f: { wrongApproaches: ["a bilateral exploration as routine", "a transoral approach"] } },
      {
        kind: "exposure", title: "Raise the flaps and open the midline", description: "Expose the thyroid bed.",
        choices: [
          "Raise subplatysmal flaps and open the midline raphe between the strap muscles.",
          "Divide the strap muscles transversely to expose the gland quickly.",
          "Open the midline raphe below the thyroid isthmus only.",
        ],
        feedback: [
          "Subplatysmal flaps and the midline raphe open the thyroid bed without dividing muscle.",
          "Transverse division of the strap muscles adds denervation and bleeding for no benefit.",
          "Opening only the lower raphe restricts access to the upper pole and the external laryngeal nerve.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "landmark", title: "Identify the inferior thyroid artery", description: "This artery leads to the parathyroid glands.",
        choices: [
          "Identify the inferior thyroid artery and trace it to the parathyroid glands.",
          "Look for the adenoma directly on the thyroid surface.",
          "Use the carotid artery as the landmark.",
        ],
        feedback: [
          "The artery guides you to the parathyroid bed.",
          "Superficial searching misses a deep adenoma.",
          "The carotid is too lateral to guide the dissection.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "nerve", title: "Protect the recurrent laryngeal nerve", description: "The RLN crosses the inferior thyroid artery.",
        choices: [
          "Identify the RLN and keep it in view as the adenoma is mobilized.",
          "Mobilize the adenoma and look for the nerve afterwards.",
          "Cauterize tissue near the nerve to control bleeding.",
        ],
        feedback: [
          "The nerve is identified and protected throughout.",
          "Mobilizing first tears the inferior thyroid artery branches before the nerve is seen, and the field fills with blood.",
          "Cautery near the nerve causes thermal injury.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      {
        kind: "core", title: "Find the adenoma", description: "Locate the abnormal gland.",
        choices: [
          "Trace the inferior thyroid artery branches to find the enlarged, brown adenoma.",
          "Remove the first parathyroid gland you see.",
          "Remove a thyroid nodule that looks suspicious.",
        ],
        feedback: [
          "The adenoma is identified by its characteristic appearance.",
          "Removing a normal gland risks hypoparathyroidism.",
          "Removing thyroid tissue leaves the adenoma behind.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "vessel", title: "Control the adenoma's blood supply", description: "Ligate the small vessels to the adenoma.",
        choices: [
          "Ligate the adenoma's vascular pedicle close to the gland.",
          "Cauterize the pedicle broadly.",
          "Avulse the adenoma with a clamp.",
        ],
        feedback: [
          "The pedicle is ligated cleanly.",
          "Broad cautery risks the RLN and the thyroid capsule.",
          "Avulsion causes bleeding and capsular rupture.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "verify", title: "Measure intraoperative PTH", description: "Confirm the biochemical cure.",
        choices: [
          "Send the intraoperative PTH and confirm a drop of more than 50% from baseline.",
          "Trust the visual appearance and close.",
          "Measure PTH only after the wound is closed.",
        ],
        feedback: [
          "The PTH drop confirms the adenoma was removed.",
          "Skipping the check risks leaving a second adenoma.",
          "A delayed measurement cannot guide the exploration.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      {
        kind: "bleed", title: "Control a small thyroid bed bleeder", description: "A capsular vessel is oozing.",
        choices: [
          "Apply pressure and control the point with fine bipolar forceps.",
          "Pack the bed and close.",
          "Cauterize the thyroid capsule broadly.",
        ],
        feedback: [
          "The bleeder is controlled precisely.",
          "Closing over the bleed risks a neck hematoma.",
          "Broad cautery risks the RLN and parathyroid remnants.",
        ],
        wrongComps: ["hemorrhage", "nerve_injury"],
      },
      { kind: "verify", title: "Re-check the RLN with stimulation", description: "Confirm the nerve signal is intact before closure.", f: { test: "the RLN stimulation signal", wrongTests: ["a nerve conduction study", "an ultrasound"] } },
      { kind: "exposure", title: "Inspect the remaining parathyroid glands", description: "Confirm the remaining glands look healthy.", f: { structure: "the remaining parathyroid glands", landmark: "the thyroid capsule" } },
      { kind: "bleed", title: "Control a thymic bed bleeder", description: "A vessel in the thymic bed is bleeding.", f: { vessel: "the vessels in the thymic bed", wrongVessels: ["the carotid artery", "the internal jugular vein"] } },
      { kind: "verify", title: "Confirm the baseline PTH drop", description: "Re-measure the PTH to confirm the cure.", f: { test: "the intraoperative PTH drop", wrongTests: ["a routine ultrasound", "a calcium panel"] } },
      { kind: "closure", title: "Close the neck", description: "Close the strap muscles and skin.", f: { structure: "the strap muscles and skin" } },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for a short neck case." },
      {
        kind: "postop", title: "Watch for hungry-bone syndrome", description: "Day 2: tingling around the mouth; calcium low.",
        choices: [
          "Give IV calcium, start oral calcium and calcitriol, and monitor calcium and ECG.",
          "Reassure — tingling after neck surgery is normal.",
          "Give a fluid bolus and recheck tomorrow.",
        ],
        feedback: [
          "Hungry-bone hypocalcemia needs aggressive replacement and monitoring.",
          "Untreated severe hypocalcemia causes tetany and arrhythmias.",
          "Fluids don't correct calcium and can overload the patient.",
        ],
        wrongComps: ["cardiac_arrhythmia", "fluid_overload"],
      },
      {
        kind: "postop", title: "Calcium supplementation", description: "Post-op calcium normal.",
        choices: [
          "Short course of oral calcium with a planned check at 1 week.",
          "High-dose IV calcium daily for a month.",
          "No calcium and no checks.",
        ],
        feedback: [
          "Short oral supplementation with a check is standard.",
          "Excess IV calcium causes hypercalcemia and arrhythmias.",
          "An unrecognized late hypocalcemia can trigger laryngospasm.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "postop", title: "Swallowing check", description: "Day 1: the patient coughs when drinking water.",
        choices: [
          "Assess swallowing and arrange a speech and language review; thicken fluids if needed.",
          "Encourage large gulps of water to clear the throat.",
          "Ignore it — coughing is normal after neck surgery.",
        ],
        feedback: [
          "A cough on drinking can signal aspiration from nerve dysfunction.",
          "Large gulps with a weak swallow are aspirated into the lungs.",
          "Missed aspiration leads to pneumonia.",
        ],
        wrongComps: ["hypoxia", "infection"],
      },
      {
        kind: "postop", title: "Wound care", description: "Neck wound.",
        choices: [
          "Keep the wound dry for 48 hours, then shower; watch for swelling and redness.",
          "Soak the neck in a bath from day 1.",
          "Leave the dressing for 3 weeks.",
        ],
        feedback: [
          "Simple care prevents infection.",
          "Soaking a fresh wound lets bacteria in.",
          "Old dressings hide a neck hematoma until it compresses the airway.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Neck hematoma watch", description: "Two hours post-op: the neck is swelling.",
        choices: [
          "Open the wound at the bedside if breathing is threatened, and call for help.",
          "Apply a tight neck bandage.",
          "Wait for the morning review.",
        ],
        feedback: [
          "A neck hematoma can obstruct the airway within minutes.",
          "A tight bandage worsens airway compression.",
          "Delay lets the hematoma close the airway.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Pain control", description: "Pain 3/10.",
        choices: [
          "Paracetamol, with a short NSAID course if suitable.",
          "Round-the-clock opioid for a week.",
          "High-dose aspirin.",
        ],
        feedback: [
          "Simple analgesia is enough.",
          "Long opioids depress breathing.",
          "Aspirin raises the risk of a neck hematoma.",
        ],
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Vitamin D repletion", description: "Pre-op vitamin D was low.",
        choices: [
          "Replete vitamin D with standard doses and recheck calcium.",
          "Give a single huge vitamin D dose today.",
          "Ignore the low vitamin D.",
        ],
        feedback: [
          "Steady repletion supports bone recovery without overshooting calcium.",
          "A massive dose can push calcium too high and trigger arrhythmias.",
          "Low vitamin D worsens hungry-bone hypocalcemia, which can cause laryngospasm.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "postop", title: "Scar care", description: "The neck wound has healed at 2 weeks.",
        choices: [
          "Massage and moisturize the scar, and use sunscreen for a year.",
          "Apply steroid cream on day 1.",
          "Scrub the scar daily.",
        ],
        feedback: [
          "Simple scar care gives the best result.",
          "Steroid on an unhealed wound delays healing and invites infection.",
          "Scrubbing reopens the healing wound, which can bleed.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Bone density plan", description: "Pre-op osteoporosis.",
        choices: [
          "Repeat bone density in 1–2 years and treat osteoporosis if persistent.",
          "No follow-up.",
          "Start high-dose calcium for life regardless.",
        ],
        feedback: [
          "Bone density often improves after cure; follow-up guides treatment.",
          "Fracture risk goes unmanaged.",
          "Blanket calcium can cause hypercalcemia.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Discharge instructions", description: "Going home.",
        choices: [
          "Give advice: tingling or cramps, neck swelling, breathing trouble, or voice change need urgent review.",
          "Give no written advice.",
          "Tell the patient tingling is normal.",
        ],
        feedback: [
          "Clear advice catches hypocalcemia and hematoma.",
          "A hematoma is reported late.",
          "Tingling is hypocalcemia and can progress to arrhythmia.",
        ],
        wrongComps: ["hemorrhage", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Recurrence surveillance", description: "Long-term plan.",
        choices: [
          "Annual calcium check.",
          "No surveillance.",
          "Monthly neck CT.",
        ],
        feedback: [
          "Simple calcium checks detect recurrence.",
          "Recurrence is missed.",
          "Frequent CT adds radiation and contrast reactions.",
        ],
        wrongComps: ["cardiac_arrhythmia", "anaphylaxis"],
      },
      {
        kind: "postop", title: "Kidney stone prevention", description: "Previous stones.",
        choices: [
          "Encourage good hydration and review stone risk.",
          "Restrict fluids.",
          "Start high-dose vitamin D for life.",
        ],
        feedback: [
          "Hydration lowers stone risk.",
          "Dehydration promotes stones and infection.",
          "Excess vitamin D raises calcium.",
        ],
        wrongComps: ["infection", "cardiac_arrhythmia"],
      },
      {
        kind: "postop", title: "Medication review", description: "On thiazide and lithium.",
        choices: [
          "Review the thiazide and lithium with the prescribers, switching the thiazide if calcium stays high.",
          "Stop every regular medication, including the antihypertensives, at discharge.",
          "Add calcium tablets and vitamin D on top of the thiazide.",
        ],
        feedback: [
          "A planned review removes calcium-raising drugs safely.",
          "Stopping antihypertensives abruptly causes rebound hypertension and tachyarrhythmia.",
          "Extra calcium on a thiazide pushes calcium up and triggers arrhythmias.",
        ],
        wrongComps: ["cardiac_arrhythmia", "fluid_overload"],
      },
      {
        kind: "postop", title: "Monitor calcium", description: "The remaining glands may be suppressed.",
        choices: [
          "Monitor calcium closely and treat hypocalcemia if it develops.",
          "Check calcium only if symptoms appear.",
          "Discharge without calcium monitoring.",
        ],
        feedback: [
          "Calcium is monitored for the hungry-bone syndrome.",
          "Waiting for symptoms risks severe hypocalcemia — tetany and a dangerous arrhythmia.",
          "Unmonitored hypocalcemia can progress to laryngospasm.",
        ],
        wrongComps: ["cardiac_arrhythmia", "hypoxia"],
      },
      {
        kind: "postop", title: "Check the voice", description: "Confirm the RLN function.",
        choices: [
          "Assess the voice before discharge and arrange review if hoarse.",
          "Discharge and check the voice at one month.",
          "Only check the voice if the patient asks.",
        ],
        feedback: [
          "Voice function is confirmed before discharge.",
          "A delayed check delays management of a nerve injury.",
          "Waiting for the patient to ask misses a silent injury.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the calcium and clinic plan.",
        choices: [
          "Arrange a follow-up visit with repeat calcium and review of the pathology.",
          "Check the calcium once on the ward and discharge without a clinic visit.",
          "Schedule a routine neck ultrasound.",
        ],
        feedback: [
          "Follow-up confirms the cure and monitors calcium.",
          "Persistent or recurrent hyperparathyroidism shows up on calcium checks weeks later, not on the ward.",
          "Routine imaging adds no value.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      }
    ],
  },
];
