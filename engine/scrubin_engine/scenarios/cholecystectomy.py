"""Laparoscopic cholecystectomy: Elena R., 47 F, acute calculous cholecystitis."""

from __future__ import annotations

import random

from ..patient import PatientSpec
from .appendectomy import _weighted


def build_patient(rng: random.Random) -> PatientSpec:
    hidden = {
        # Airway (obese, Mallampati 3).
        "cormack_lehane": _weighted(rng, {1: 0.35, 2: 0.4, 3: 0.2, 4: 0.05}),
        "difficult_mask": rng.random() < 0.15,
        "reactive_airway": rng.random() < 0.1,
        # Fasted overnight, but opioids and pain slow gastric emptying.
        "gastric_volume_ml": _weighted(rng, {30: 0.7, 120: 0.3}),
        # Surgical anatomy.
        "acute_inflammation": rng.random() < 0.6,
        "posterior_cystic_artery": rng.random() < 0.2,
        "adhesions": rng.random() < 0.3,
    }
    return PatientSpec(
        name="Elena R.",
        age=47,
        sex="F",
        weight_kg=88.0,
        height_cm=162.0,
        hr=96.0,
        sbp=148.0,
        dbp=88.0,
        rr=18.0,
        temp_c=37.9,
        hb_g_dl=13.1,
        mallampati=3,
        history=(
            "36 h of constant right upper quadrant pain radiating to the right shoulder after a fatty meal, nausea, one episode of emesis. "
            "Positive Murphy's sign. WBC 13.4, bilirubin 1.1, ALP and lipase normal. Ultrasound: gallstones, wall 5 mm, "
            "pericholecystic fluid, CBD 5 mm. Admitted on IV antibiotics; NPO since midnight."
        ),
        allergies=("sulfa (rash)",),
        comorbidities=("obesity (BMI 34)", "type 2 diabetes (metformin)", "hypertension (lisinopril)"),
        npo_hours=12.0,
        blood_type="A+",
        interview={
            "last_food": "Nothing since dinner last night — just sips of water with my pills this morning.",
            "vomiting": "Threw up once yesterday. Just queasy now.",
            "pain": "Right under my ribs on the right, goes to my shoulder. 7 out of 10, worse when I breathe in.",
            "teeth": "I have a crown on a back tooth, nothing loose.",
            "previous_anesthesia": "Two C-sections with a spinal, and my wisdom teeth out asleep — I was really sick afterwards.",
            "family_anesthesia_problems": "No.",
            "medications": "Metformin and lisinopril. I took the lisinopril this morning; they told me to skip the metformin.",
            "allergy_reaction": "Sulfa pills gave me a rash.",
            "diabetes": "Sugars usually 130s. They checked it this morning — 168.",
            "smoking_alcohol": "Quit smoking five years ago. Glass of wine now and then.",
            "other": "I snore — my husband says I stop breathing sometimes. Never had a sleep study.",
        },
        hidden=hidden,
    )


SCENARIO = {
    "id": "cholecystectomy",
    "name": "Laparoscopic Cholecystectomy",
    "specialty": "General Surgery",
    "summary": "47-year-old with acute calculous cholecystitis for laparoscopic cholecystectomy.",
    "full_stomach": False,
    "airway_teaching": "Fasted elective-urgent case: standard induction with rocuronium is fine. With BMI 34, possible OSA and Mallampati 3, "
                       "preoxygenate head-up and have a video laryngoscope ready.",
    "build_patient": build_patient,
}
