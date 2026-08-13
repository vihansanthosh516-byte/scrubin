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
      risks: ["thrombosis", "hemorrhage", "hypoxia", "nerve_injury", "cardiac_arrhythmia", "infection"],
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
      { kind: "postop", title: "Watch for dislocation signs", description: "Teach the patient the dislocation precautions and the signs.", f: { test: "the hip position and the precautions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Monitor the wound", description: "Watch for drainage and infection signs.", f: { test: "the wound for drainage and erythema", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Check the leg pulses", description: "Confirm the distal pulses after the surgery.", f: { test: "the distal pulses", wrongTests: ["a routine X-ray", "a Doppler of the leg"] } },
      { kind: "postop", title: "Cryotherapy and swelling control", description: "Define the swelling-control plan.", f: { test: "the leg swelling", wrongTests: ["a routine X-ray", "an ultrasound"] } },
      { kind: "postop", title: "Home exercise program", description: "Provide the exercises for the recovery period.", f: { test: "the home exercise compliance", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Fall precautions", description: "Review the fall risks after a hip replacement.", f: { test: "the gait safety", wrongTests: ["a routine X-ray", "a balance test"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the 6-week review with an X-ray.", f: { test: "the X-ray and the range of motion at 6 weeks", wrongTests: ["a routine MRI", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the medications, the precautions, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Return-to-activity plan", description: "Define the driving and activity restrictions.", f: { test: "the activity tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
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
          "No follow-up is needed after a hip replacement.",
        ],
        feedback: [
          "Criteria-based discharge with follow-up is standard.",
          "Same-day discharge is unsafe after a posterior-approach THA.",
          "Skipping follow-up misses component and wound issues.",
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
      risks: ["hemorrhage", "infection", "nerve_injury"],
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
        wrongComps: ["infection", "hemorrhage"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for a short breast case." },
      { kind: "postop", title: "Watch for hematoma", description: "Monitor the breast for a developing hematoma.", f: { test: "the breast for swelling and bruising", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Arm and shoulder care", description: "Plan the arm exercises after the sentinel node biopsy.", f: { test: "the arm range of motion", wrongTests: ["a routine X-ray", "a nerve study"] } },
      { kind: "postop", title: "Wound care", description: "Define the wound care for the breast and the axilla.", f: { test: "the wounds for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Lymphedema education", description: "Teach the signs of lymphedema and the precautions.", f: { test: "the lymphedema warning signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the breast and the axilla.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Review the sentinel node result", description: "Plan the discussion of the node pathology.", f: { test: "the sentinel node pathology", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Breast self-examination guidance", description: "Review the surveillance and self-examination plan.", f: { test: "the surveillance plan", wrongTests: ["a routine mammogram", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the pathology and the oncology plan.", f: { test: "the pathology and the oncology plan", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Genetic testing discussion", description: "Discuss genetic testing if the family history warrants it.", f: { test: "the genetic counseling plan", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the wound care, the medications, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Return to activity", description: "Define the lifting restrictions during recovery.", f: { test: "the activity tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
      { kind: "postop", title: "Cosmetic expectations", description: "Set realistic expectations for the breast appearance.", f: { test: "the cosmetic expectations", wrongTests: ["a routine mammogram", "a CT scan"] } },
      { kind: "postop", title: "Nutritional support", description: "Advise on nutrition to support wound healing.", f: { test: "the nutritional plan", wrongTests: ["a routine blood panel", "a CT scan"] } },
      {
        kind: "postop", title: "Plan the pathology conversation", description: "Prepare for the margin and node results.",
        choices: [
          "Arrange follow-up to review margins, nodes, and the adjuvant plan.",
          "No follow-up is needed until symptoms appear.",
          "Discuss only the cosmetic outcome.",
        ],
        feedback: [
          "Follow-up reviews the pathology and the adjuvant plan.",
          "Skipping follow-up delays treatment decisions.",
          "Cosmesis alone ignores the oncologic result.",
        ],
        wrongComps: ["infection", "hemorrhage"],
      },
      {
        kind: "postop", title: "Monitor the wound and arm", description: "Watch for hematoma and lymphedema.",
        choices: [
          "Check the wound and the arm for swelling and neuropraxia.",
          "Discharge without a wound check.",
          "Immobilize the arm for two weeks.",
        ],
        feedback: [
          "The wound and arm are checked for complications.",
          "No check misses a hematoma or early lymphedema.",
          "Immobilizing the arm promotes stiffness.",
        ],
        wrongComps: ["infection", "nerve_injury"],
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
      risks: ["infection", "nerve_injury", "hemorrhage"],
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
          "Assume the chain is intact and close.",
          "Remove the incus to improve exposure.",
        ],
        feedback: [
          "The ossicular chain is confirmed mobile.",
          "Assuming chain function can miss a fixed or disrupted chain.",
          "Removing the incus creates a new ossicular problem.",
        ],
        wrongComps: ["nerve_injury", "infection"],
      },
      { kind: "verify", title: "Confirm the graft position", description: "Re-check the graft lies flat against the remnant.", f: { test: "the graft position under the microscope", wrongTests: ["an on-table audiogram", "a CT scan"] } },
      { kind: "exposure", title: "Inspect the ossicular chain again", description: "Confirm the chain was not disturbed by the packing.", f: { structure: "the ossicular chain", landmark: "the incudostapedial joint" } },
      { kind: "bleed", title: "Control a canal wall bleeder", description: "The canal skin is bleeding during the packing.", f: { vessel: "the canal wall vessels", wrongVessels: ["the internal carotid artery", "the sigmoid sinus"] } },
      { kind: "verify", title: "Check the facial nerve function", description: "Confirm facial movement before the patient wakes.", f: { test: "the facial nerve function", wrongTests: ["a nerve conduction study", "an on-table MRI"] } },
      { kind: "closure", title: "Reposition the flap and pack the ear", description: "Finish the repair.",
        choices: [
          "Reposition the tympanomeatal flap and pack the canal with gelfoam.",
          "Leave the canal unpacked.",
          "Pack the canal tightly with a firm dressing.",
        ],
        feedback: [
          "The flap is repositioned and lightly packed.",
          "An unpacked canal allows the graft to move.",
          "Tight packing can injure the canal and the drum.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      },
      { kind: "dvt", title: "DVT prophylaxis", description: "Standard prophylaxis for a short ENT case." },
      { kind: "postop", title: "Ear protection rules", description: "Review the water and pressure precautions.", f: { test: "the ear protection compliance", wrongTests: ["a routine audiogram", "a CT scan"] } },
      { kind: "postop", title: "Sneeze and nose-blow rules", description: "Explain why nose-blowing must be avoided.", f: { test: "the eustachian tube pressure control", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Watch for graft infection", description: "Monitor for discharge and otorrhea.", f: { test: "the ear for discharge", wrongTests: ["a routine culture", "a CT scan"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the ear.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Balance and dizziness monitoring", description: "Watch for vertigo suggesting inner ear involvement.", f: { test: "the balance symptoms", wrongTests: ["a routine audiogram", "a CT scan"] } },
      { kind: "postop", title: "Hearing aid consideration", description: "Discuss the hearing follow-up and the audiogram timing.", f: { test: "the follow-up audiogram", wrongTests: ["a routine CT scan", "a blood panel"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the otoscopy and the audiogram at follow-up.", f: { test: "the graft take and the audiogram", wrongTests: ["a routine MRI", "a CT scan"] } },
      { kind: "postop", title: "Return to swimming", description: "Define when the ear can be exposed to water again.", f: { test: "the graft healing status", wrongTests: ["a routine audiogram", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the ear care and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Long-term hearing expectations", description: "Set realistic expectations for the hearing outcome.", f: { test: "the hearing outcome expectations", wrongTests: ["a routine audiogram", "a CT scan"] } },
      { kind: "postop", title: "Travel and pressure advice", description: "Advise on flying and pressure changes during healing.", f: { test: "the pressure-change precautions", wrongTests: ["a routine audiogram", "a CT scan"] } },
      { kind: "postop", title: "Tinnitus counseling", description: "Discuss tinnitus expectations if present preoperatively.", f: { test: "the tinnitus symptoms", wrongTests: ["a routine audiogram", "a CT scan"] } },
      { kind: "postop", title: "Ear cleaning rules", description: "Explain how to keep the ear clean safely.", f: { test: "the ear cleaning routine", wrongTests: ["a routine culture", "a CT scan"] } },
      { kind: "postop", title: "Contact rules", description: "Advise against inserting anything into the ear.", f: { test: "the ear contact rules", wrongTests: ["a routine X-ray", "a CT scan"] } },
      {
        kind: "postop", title: "Plan the post-op course", description: "Define ear protection and monitoring.",
        choices: [
          "Keep the ear dry, avoid nose-blowing, and arrange follow-up otoscopy.",
          "Allow swimming immediately.",
          "No follow-up is needed after a tympanoplasty.",
        ],
        feedback: [
          "Ear protection and follow-up optimize graft take.",
          "Water exposure risks infection and graft failure.",
          "Skipping follow-up misses graft failure and hearing outcomes.",
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
      risks: ["hemorrhage", "hypoxia", "infection", "nerve_injury", "thrombosis"],
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
        wrongComps: ["hypoxia", "hemorrhage"],
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
      { kind: "postop", title: "Watch for compartment syndrome", description: "Teach the early signs of compartment syndrome.", f: { test: "the leg for pain out of proportion and swelling", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Monitor the distal pulses", description: "Confirm the foot pulses and the capillary refill.", f: { test: "the distal pulses and the capillary refill", wrongTests: ["a routine X-ray", "a Doppler of the leg"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the fracture pain.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Wound care", description: "Define the wound care for the entry and screw sites.", f: { test: "the wounds for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Watch for fat embolism signs", description: "Monitor for confusion, hypoxia, and petechiae.", f: { test: "the fat embolism warning signs", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Physiotherapy plan", description: "Start the early range-of-motion therapy.", f: { test: "the knee and hip range of motion", wrongTests: ["a routine X-ray", "a nerve study"] } },
      { kind: "postop", title: "Weight-bearing plan", description: "Define the weight-bearing progression.", f: { test: "the weight-bearing tolerance", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the serial X-rays until union.", f: { test: "the fracture union on X-ray", wrongTests: ["a routine MRI", "a bone scan"] } },
      { kind: "postop", title: "Hardware considerations", description: "Discuss the future hardware removal if symptomatic.", f: { test: "the hardware symptoms", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the weight-bearing plan and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
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
        wrongComps: ["hypoxia", "hemorrhage"],
      },
      {
        kind: "postop", title: "Discharge and follow-up", description: "Define the radiological follow-up.",
        choices: [
          "Arrange outpatient follow-up with serial X-rays until union.",
          "No follow-up is needed after nailing.",
          "Schedule a routine MRI of the leg.",
        ],
        feedback: [
          "Serial radiographs track union.",
          "Skipping follow-up misses non-union and implant failure.",
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
      risks: ["nerve_injury", "infection", "hemorrhage", "thrombosis"],
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
        wrongComps: ["nerve_injury", "hemorrhage"],
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
          "Excessive medial mobilization denervates the cuff.",
          "Cautery near the notch injures the nerve.",
        ],
        wrongComps: ["nerve_injury", "infection"],
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
      { kind: "postop", title: "Sling positioning", description: "Define the sling use and the passive motion plan.", f: { test: "the sling and the passive motion schedule", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Watch for stiffness", description: "Monitor the range of motion at the follow-up.", f: { test: "the passive range of motion", wrongTests: ["a routine MRI", "a CT scan"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia and the cryotherapy.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Wound care", description: "Define the portal wound care.", f: { test: "the portals for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Home exercise program", description: "Provide the passive and assisted exercises.", f: { test: "the home exercise compliance", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Return-to-work plan", description: "Define the work restrictions based on the job.", f: { test: "the functional tolerance", wrongTests: ["a routine X-ray", "a stress test"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up to review motion and healing.", f: { test: "the motion and the healing at follow-up", wrongTests: ["a routine MRI", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the sling use, the medications, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Long-term retear risk", description: "Discuss the retear risk and the protective strategies.", f: { test: "the retear risk factors", wrongTests: ["a routine MRI", "a CT scan"] } },
      { kind: "postop", title: "Return-to-sport plan", description: "Define the sport-specific return criteria.", f: { test: "the sport readiness", wrongTests: ["a routine MRI", "a stress test"] } },
      { kind: "postop", title: "Sleep positioning", description: "Advise on the sleeping position that protects the repair.", f: { test: "the sleep positioning", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Avoidance rules", description: "List the movements to avoid during healing.", f: { test: "the avoidance rules", wrongTests: ["a routine X-ray", "a CT scan"] } },
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
          "No follow-up is needed after the repair.",
          "Check only the wound at one month.",
        ],
        feedback: [
          "Structured follow-up tracks motion and healing.",
          "Skipping follow-up misses stiffness and retear.",
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
      risks: ["hypoxia", "hemorrhage", "infection"],
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
          "Broad cautery risks skin necrosis.",
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
          "Total septectomy causes saddle-nose deformity.",
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
        wrongComps: ["hypoxia", "hemorrhage"],
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
      { kind: "postop", title: "Splint care", description: "Define the splint and the dressing care.", f: { test: "the splint and the dressing", wrongTests: ["a routine CT", "an X-ray"] } },
      { kind: "postop", title: "Watch for bleeding", description: "Monitor for epistaxis in the first 24 hours.", f: { test: "the nasal bleeding", wrongTests: ["a routine CT", "a blood panel"] } },
      { kind: "postop", title: "Sleep position", description: "Advise on the head elevation during sleep.", f: { test: "the sleep positioning", wrongTests: ["a routine CT", "an X-ray"] } },
      { kind: "postop", title: "Glasses restriction", description: "Explain why glasses must not rest on the nose.", f: { test: "the glasses restriction", wrongTests: ["a routine CT", "a rhinomanometry test"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the nose.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Inspect for septal hematoma", description: "Inspect the septum for a hematoma at follow-up.", f: { test: "the septum for hematoma", wrongTests: ["a routine CT", "an X-ray"] } },
      { kind: "postop", title: "Airway assessment", description: "Confirm the nasal airway is patent at the follow-up.", f: { test: "the nasal airway patency", wrongTests: ["a rhinomanometry test", "a CT scan"] } },
      { kind: "postop", title: "Scar management", description: "Advise on the columellar scar care.", f: { test: "the columellar scar", wrongTests: ["a routine CT", "a biopsy"] } },
      { kind: "postop", title: "Swelling expectations", description: "Set expectations for the swelling and the final result timeline.", f: { test: "the swelling expectations", wrongTests: ["a routine CT", "a rhinomanometry test"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the splint removal and the serial reviews.", f: { test: "the healing and the symmetry at follow-up", wrongTests: ["a routine CT", "a rhinomanometry test"] } },
      { kind: "postop", title: "Return to activity", description: "Define the activity and the sun-exposure restrictions.", f: { test: "the activity tolerance", wrongTests: ["a routine CT", "a stress test"] } },
      { kind: "postop", title: "Makeup and skin care", description: "Advise on the skin care during healing.", f: { test: "the skin care routine", wrongTests: ["a routine CT", "a biopsy"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the splint care, the medications, and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine CT", "an X-ray"] } },
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
          "No follow-up is needed after a rhinoplasty.",
          "Schedule a CT scan at one month.",
        ],
        feedback: [
          "Structured follow-up tracks the healing nose.",
          "Skipping follow-up misses early deformities.",
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
      risks: ["nerve_injury", "hemorrhage", "hypoxia", "infection"],
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
        wrongComps: ["nerve_injury", "hemorrhage"],
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
          "Mobilizing first risks an unseen nerve injury.",
          "Cautery near the nerve causes thermal injury.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
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
        wrongComps: ["hemorrhage", "nerve_injury"],
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
      { kind: "postop", title: "Watch for hungry-bone syndrome", description: "Monitor for profound hypocalcemia in the first days.", f: { test: "the calcium levels", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Calcium supplementation", description: "Plan the calcium and vitamin D supplementation.", f: { test: "the calcium supplement plan", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Voice assessment", description: "Confirm the voice is clear before discharge.", f: { test: "the voice quality", wrongTests: ["a routine laryngoscopy", "a CT scan"] } },
      { kind: "postop", title: "Wound care", description: "Define the neck wound care.", f: { test: "the neck wound for infection signs", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Neck hematoma watch", description: "Watch for swelling and airway compromise.", f: { test: "the neck for swelling", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Pain control", description: "Plan the analgesia for the neck.", f: { test: "the pain scores", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Calcium monitoring plan", description: "Define the serial calcium checks after discharge.", f: { test: "the serial calcium plan", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Clinic follow-up", description: "Arrange the follow-up with the calcium and the pathology.", f: { test: "the calcium and the pathology at follow-up", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Bone density plan", description: "Discuss the bone density follow-up for hyperparathyroidism.", f: { test: "the bone density assessment", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Discharge instructions", description: "Summarize the calcium plan and the warning signs.", f: { test: "the discharge instructions", wrongTests: ["a routine X-ray", "a CT scan"] } },
      { kind: "postop", title: "Recurrence surveillance", description: "Define the calcium surveillance for recurrence.", f: { test: "the calcium surveillance", wrongTests: ["a routine ultrasound", "a CT scan"] } },
      { kind: "postop", title: "Kidney stone prevention", description: "Discuss the kidney stone risk and the hydration plan.", f: { test: "the hydration plan", wrongTests: ["a routine blood panel", "a CT scan"] } },
      { kind: "postop", title: "Medication review", description: "Review the medications that affect calcium.", f: { test: "the medication list", wrongTests: ["a routine blood panel", "a CT scan"] } },
      {
        kind: "postop", title: "Monitor calcium", description: "The remaining glands may be suppressed.",
        choices: [
          "Monitor calcium closely and treat hypocalcemia if it develops.",
          "Check calcium only if symptoms appear.",
          "Discharge without calcium monitoring.",
        ],
        feedback: [
          "Calcium is monitored for the hungry-bone syndrome.",
          "Waiting for symptoms risks severe hypocalcemia.",
          "No monitoring is unsafe after parathyroidectomy.",
        ],
        wrongComps: ["nerve_injury", "hemorrhage"],
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
          "No follow-up is needed after parathyroidectomy.",
          "Schedule a routine neck ultrasound.",
        ],
        feedback: [
          "Follow-up confirms the cure and monitors calcium.",
          "Skipping follow-up misses persistent hypercalcemia.",
          "Routine imaging adds no value.",
        ],
        wrongComps: ["infection", "nerve_injury"],
      }
    ],
  },
];
