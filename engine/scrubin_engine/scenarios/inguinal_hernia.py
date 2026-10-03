"""Laparoscopic TAPP inguinal hernia repair: Daniel K., 58 M, symptomatic right inguinal hernia."""

from __future__ import annotations

import random

from ..patient import PatientSpec
from .appendectomy import _weighted


def build_patient(rng: random.Random) -> PatientSpec:
    hidden = {
        "cormack_lehane": _weighted(rng, {1: 0.5, 2: 0.35, 3: 0.13, 4: 0.02}),
        "difficult_mask": rng.random() < 0.12,
        "reactive_airway": rng.random() < 0.12,
        "gastric_volume_ml": _weighted(rng, {20: 0.85, 100: 0.15}),
        # Surgical anatomy and risk.
        "hernia_type": _weighted(rng, {"indirect": 0.65, "direct": 0.35}),
        "vas_adherent": rng.random() < 0.25,
        "corona_mortis": rng.random() < 0.2,
        "contralateral_defect": rng.random() < 0.2,
        "prior_pelvic_surgery": rng.random() < 0.2,
    }
    return PatientSpec(
        name="Daniel K.",
        age=58,
        sex="M",
        weight_kg=84.0,
        height_cm=178.0,
        hr=74.0,
        sbp=138.0,
        dbp=84.0,
        rr=14.0,
        temp_c=36.7,
        hb_g_dl=14.6,
        mallampati=2,
        history=(
            "Right groin bulge for two years that is getting bigger and aches by the end of the day, worse after lifting at work. "
            "Reducible, no obstructive symptoms. Examination: a right inguinal hernia that comes down to the scrotum on standing and reduces lying flat. "
            "Elective day surgery, fasted since midnight. Lower urinary tract symptoms on tamsulosin: asked to empty the bladder before theatre."
        ),
        allergies=(),
        comorbidities=("hypertension (amlodipine)", "benign prostatic hyperplasia (tamsulosin)", "ex-smoker, 20 pack-years"),
        npo_hours=12.0,
        blood_type="O+",
        interview={
            "last_food": "Toast and tea at six last night, nothing since midnight, not even water.",
            "vomiting": "No, I feel fine.",
            "pain": "Just an ache in the right groin, about 3 out of 10 by evening. Nothing now.",
            "teeth": "All my own, nothing loose.",
            "previous_anesthesia": "A knee arthroscopy under general anesthetic years ago. I woke up fine.",
            "family_anesthesia_problems": "No.",
            "medications": "Amlodipine, and tamsulosin at night. I took the amlodipine this morning.",
            "allergy_reaction": "I don't have any drug allergies.",
            "diabetes": "No diabetes.",
            "smoking_alcohol": "Stopped smoking eight years ago. A couple of beers on weekends.",
            "other": "I have to pee a lot at night, that's what the tamsulosin is for. I went just before they brought me in.",
        },
        hidden=hidden,
    )


SCENARIO = {
    "id": "inguinal_hernia",
    "name": "Laparoscopic Inguinal Hernia Repair (TAPP)",
    "specialty": "General Surgery",
    "summary": "58-year-old with a symptomatic right inguinal hernia for laparoscopic transabdominal preperitoneal (TAPP) mesh repair.",
    "full_stomach": False,
    "awake_line": "Is this going to take long? I just want to get this hernia fixed.",
    "airway_teaching": "Fasted elective day case: standard induction with rocuronium is fine. A deep block helps the surgeon while the abdomen is insufflated; "
                       "reverse it fully at the end, and ask about bladder emptying before the surgeon places the suprapubic ports.",
    "build_patient": build_patient,
}
