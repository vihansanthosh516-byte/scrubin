"""Total laparoscopic hysterectomy: Priya N., 46 F, symptomatic fibroid uterus."""

from __future__ import annotations

import random

from ..patient import PatientSpec
from .appendectomy import _weighted


def build_patient(rng: random.Random) -> PatientSpec:
    hidden = {
        "cormack_lehane": _weighted(rng, {1: 0.45, 2: 0.4, 3: 0.13, 4: 0.02}),
        "difficult_mask": rng.random() < 0.1,
        "reactive_airway": rng.random() < 0.1,
        "gastric_volume_ml": _weighted(rng, {20: 0.85, 100: 0.15}),
        # Surgical anatomy and risk.
        "large_uterus": rng.random() < 0.4,
        "bladder_adherent": rng.random() < 0.35,
        "ureter_displaced": rng.random() < 0.3,
        "adhesions": rng.random() < 0.3,
    }
    return PatientSpec(
        name="Priya N.",
        age=46,
        sex="F",
        weight_kg=71.0,
        height_cm=160.0,
        hr=84.0,
        sbp=124.0,
        dbp=78.0,
        rr=14.0,
        temp_c=36.9,
        hb_g_dl=10.4,
        mallampati=2,
        history=(
            "Symptomatic fibroid uterus: two years of heavy periods with clots and pelvic pressure, iron-deficiency anaemia on oral iron (Hb 10.4). "
            "Ultrasound and MRI: three intramural fibroids, uterus about 14 weeks in size. Endometrial biopsy benign, cervical screening normal. "
            "Declined further medical therapy. Planned total laparoscopic hysterectomy with ovarian conservation. "
            "Two caesarean sections. Fasted since midnight; group and screen done."
        ),
        allergies=("latex (hives)",),
        comorbidities=("iron-deficiency anaemia", "hypothyroidism (levothyroxine)", "two previous caesarean sections", "BMI 28"),
        npo_hours=12.0,
        blood_type="B+",
        interview={
            "last_food": "Nothing since dinner last night. I had a sip of water with my thyroid pill at six.",
            "vomiting": "No, I feel fine.",
            "pain": "Just the usual pelvic heaviness, about 3 out of 10.",
            "teeth": "All my own, nothing loose.",
            "previous_anesthesia": "Two caesareans, both with a spinal. Once I was a little woozy afterwards.",
            "family_anesthesia_problems": "No.",
            "medications": "Levothyroxine and iron tablets. I took the levothyroxine this morning.",
            "allergy_reaction": "Latex gloves give me hives, so I always remind people.",
            "diabetes": "No diabetes.",
            "smoking_alcohol": "I've never smoked. I rarely drink.",
            "other": "I get very nauseated after anaesthetics, and I get motion sick.",
        },
        hidden=hidden,
    )


SCENARIO = {
    "id": "total_hysterectomy",
    "name": "Total Laparoscopic Hysterectomy",
    "specialty": "Gynecology",
    "summary": "46-year-old with a symptomatic fibroid uterus for total laparoscopic hysterectomy with ovarian conservation.",
    "full_stomach": False,
    "awake_line": "Please make sure my latex allergy is on the board. I'm very nauseated after anaesthetics.",
    "airway_teaching": "Fasted elective case: standard induction with rocuronium. Latex-free room, high PONV risk (female, non-smoker, motion sickness, post-operative opioids): "
                       "give ondansetron and dexamethasone. Steep Trendelenburg with pneumoperitoneum raises peak pressures and EtCO2: check the tube depth and watch the face and eyes.",
    "build_patient": build_patient,
}
