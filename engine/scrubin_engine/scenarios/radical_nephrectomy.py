"""Laparoscopic radical nephrectomy: Walter B., 66 M, renal mass."""

from __future__ import annotations

import random

from ..patient import PatientSpec
from .appendectomy import _weighted


def build_patient(rng: random.Random) -> PatientSpec:
    side = rng.choice(["right", "left"])
    hidden = {
        "cormack_lehane": _weighted(rng, {1: 0.35, 2: 0.4, 3: 0.2, 4: 0.05}),
        "difficult_mask": rng.random() < 0.15,
        "reactive_airway": rng.random() < 0.3,
        "gastric_volume_ml": _weighted(rng, {20: 0.85, 100: 0.15}),
        # Surgical anatomy and risk.
        "side": side,
        "accessory_renal_artery": rng.random() < 0.25,
        "adrenal_involved": rng.random() < 0.2,
        "adhesions": rng.random() < 0.2,
        "bulky_tumor": rng.random() < 0.4,
    }
    return PatientSpec(
        name="Walter B.",
        age=66,
        sex="M",
        weight_kg=92.0,
        height_cm=175.0,
        hr=76.0,
        sbp=146.0,
        dbp=88.0,
        rr=15.0,
        temp_c=36.7,
        hb_g_dl=12.8,
        mallampati=2,
        history=(
            f"Gross haematuria and then a {side} renal mass found on CT: 7.5 cm heterogeneously enhancing tumour of the {side} kidney, "
            "upper pole, no renal vein thrombus, no nodes, no metastases (cT2a). Estimated GFR 68 with a normal contralateral kidney. "
            "Planned laparoscopic radical nephrectomy with a decision on the adrenal at surgery. "
            "Fasted since midnight; two units crossmatched."
        ),
        allergies=("iodinated contrast (hives)",),
        comorbidities=("hypertension (lisinopril, amlodipine)", "mild COPD (inhaled tiotropium)", "former smoker, 40 pack-years", "chronic kidney disease stage 2"),
        npo_hours=12.0,
        blood_type="O+",
        interview={
            "last_food": "Nothing to eat since last night, and no water since midnight.",
            "vomiting": "No.",
            "pain": f"A dull ache in my {side} flank on and off. About 2 out of 10 right now.",
            "teeth": "I have dentures on the top. They're out already.",
            "previous_anesthesia": "A hernia repair and a colonoscopy, both fine.",
            "family_anesthesia_problems": "No.",
            "medications": "Lisinopril, amlodipine and the tiotropium inhaler. I used the inhaler this morning and skipped the lisinopril.",
            "allergy_reaction": "The CT contrast gave me hives once.",
            "diabetes": "No diabetes.",
            "smoking_alcohol": "I quit smoking ten years ago. Two beers a week.",
            "other": "I get short of breath on stairs, and I cough most mornings.",
        },
        hidden=hidden,
    )


SCENARIO = {
    "id": "radical_nephrectomy",
    "name": "Laparoscopic Radical Nephrectomy",
    "specialty": "Urology",
    "summary": "66-year-old with a 7.5 cm renal mass for laparoscopic radical nephrectomy in the lateral decubitus position.",
    "full_stomach": False,
    "awake_line": "How long will I be on my side for? My shoulder gets stiff.",
    "airway_teaching": "Fasted elective case with COPD: standard induction and bronchodilator readiness. The lateral decubitus position with the flank broken lowers venous return and "
                       "increases dependent-lung shunt: pad pressure points, secure the tube and expect a lower blood pressure when the table is flexed. Have blood crossmatched.",
    "build_patient": build_patient,
}
