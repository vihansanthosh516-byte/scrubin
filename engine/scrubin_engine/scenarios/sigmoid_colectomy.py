"""Laparoscopic sigmoid colectomy: Margaret H., 63 F, recurrent diverticulitis."""

from __future__ import annotations

import random

from ..patient import PatientSpec
from .appendectomy import _weighted


def build_patient(rng: random.Random) -> PatientSpec:
    hidden = {
        "cormack_lehane": _weighted(rng, {1: 0.4, 2: 0.4, 3: 0.17, 4: 0.03}),
        "difficult_mask": rng.random() < 0.15,
        "reactive_airway": rng.random() < 0.15,
        # Clear liquids until two hours before; a carbohydrate drink may still be on board.
        "gastric_volume_ml": _weighted(rng, {30: 0.75, 150: 0.25}),
        # Surgical anatomy and risk.
        "bowel_prepped": rng.random() < 0.8,
        "ureter_distorted": rng.random() < 0.3,
        "tension": rng.random() < 0.35,
        "marginal_perfusion": rng.random() < 0.15,
        "inflamed": rng.random() < 0.5,
        "adhesions": rng.random() < 0.4,
    }
    return PatientSpec(
        name="Margaret H.",
        age=63,
        sex="F",
        weight_kg=78.0,
        height_cm=165.0,
        hr=82.0,
        sbp=142.0,
        dbp=86.0,
        rr=15.0,
        temp_c=36.8,
        hb_g_dl=12.2,
        mallampati=2,
        history=(
            "Third episode of left-sided diverticulitis in 18 months, the last with a pelvic abscess drained percutaneously four months ago. "
            "CT: thickened sigmoid with diverticula and no residual collection. Colonoscopy six weeks ago: diverticular disease, no cancer. "
            "Elective sigmoid colectomy. Mechanical bowel preparation and oral neomycin plus metronidazole yesterday, clear liquids since, "
            "carbohydrate drink until two hours ago. Hysterectomy through a lower abdominal incision fifteen years ago."
        ),
        allergies=("penicillin (rash)",),
        comorbidities=("hypertension (losartan)", "GERD (omeprazole)", "former smoker, 30 pack-years", "BMI 29"),
        npo_hours=8.0,
        blood_type="A+",
        interview={
            "last_food": "Clear liquids only since yesterday lunchtime, and the carbohydrate drink they gave me this morning.",
            "vomiting": "No, but the prep made me queasy yesterday.",
            "pain": "A dull ache in the lower left belly now and then. Nothing right now.",
            "teeth": "I have a bridge on the upper front teeth.",
            "previous_anesthesia": "A hysterectomy years ago and a hip scope. I got a bit nauseated after.",
            "family_anesthesia_problems": "No.",
            "medications": "Losartan and omeprazole. I held the losartan this morning like they told me.",
            "allergy_reaction": "Penicillin gave me a rash when I was a child.",
            "diabetes": "No diabetes.",
            "smoking_alcohol": "Quit smoking twelve years ago. A glass of wine with dinner.",
            "bowel_prep": "I drank the whole prep and took the antibiotic tablets yesterday afternoon and evening. It was awful but I finished it.",
            "other": "I get heartburn at night.",
        },
        hidden=hidden,
    )


SCENARIO = {
    "id": "sigmoid_colectomy",
    "name": "Laparoscopic Sigmoid Colectomy",
    "specialty": "Colorectal Surgery",
    "summary": "63-year-old with recurrent diverticulitis for laparoscopic sigmoid colectomy with a stapled colorectal anastomosis.",
    "full_stomach": False,
    "awake_line": "I hope the prep was worth it. Is everything ready for the operation?",
    "airway_teaching": "Fasted elective case with GERD: standard induction with a video laryngoscope ready. Give cefazolin plus metronidazole within an hour of incision "
                       "(a childhood penicillin rash is not a contraindication), warm the patient, and expect a long case in steep Trendelenburg: watch peak pressures and EtCO2.",
    "build_patient": build_patient,
}
