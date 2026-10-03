"""Robotic-assisted radical prostatectomy: James O., 62 M, localized prostate cancer."""

from __future__ import annotations

import random

from ..patient import PatientSpec
from .appendectomy import _weighted


def build_patient(rng: random.Random) -> PatientSpec:
    hidden = {
        "cormack_lehane": _weighted(rng, {1: 0.4, 2: 0.4, 3: 0.17, 4: 0.03}),
        "difficult_mask": rng.random() < 0.15,
        "reactive_airway": rng.random() < 0.1,
        "gastric_volume_ml": _weighted(rng, {20: 0.85, 100: 0.15}),
        # Surgical anatomy and risk.
        "ece": rng.random() < 0.3,
        "good_erectile_function": rng.random() < 0.85,
        "rectal_adherent": rng.random() < 0.15,
        "dvc_fragile": rng.random() < 0.25,
        "large_gland": rng.random() < 0.25,
    }
    return PatientSpec(
        name="James O.",
        age=62,
        sex="M",
        weight_kg=98.0,
        height_cm=180.0,
        hr=72.0,
        sbp=136.0,
        dbp=84.0,
        rr=14.0,
        temp_c=36.7,
        hb_g_dl=14.4,
        mallampati=2,
        history=(
            "PSA 7.8 ng/mL; MRI: PI-RADS 4 lesion in the left peripheral zone, organ-confined. Transperineal biopsy: Gleason 3+4 (Grade Group 2) in 5 of 14 cores, "
            "cT2a. Staging bone scan and CT negative. Healthy, wants the cancer out and strong urinary and sexual function afterwards (baseline SHIM score 22). "
            "Planned robotic-assisted radical prostatectomy with the nerve-sparing decision made at surgery. Fasted since midnight."
        ),
        allergies=("codeine (itching)",),
        comorbidities=("hypertension (lisinopril)", "hyperlipidaemia (atorvastatin)", "BMI 30", "glaucoma-free; wears glasses"),
        npo_hours=12.0,
        blood_type="A+",
        interview={
            "last_food": "Nothing since dinner last night, and no water since midnight.",
            "vomiting": "No, I feel well.",
            "pain": "No pain at all. I feel fine.",
            "teeth": "I have two crowns, nothing loose.",
            "previous_anesthesia": "A knee arthroscopy and a colonoscopy. No problems.",
            "family_anesthesia_problems": "No.",
            "medications": "Lisinopril and atorvastatin. I skipped the lisinopril this morning.",
            "allergy_reaction": "Codeine makes me itch, nothing worse.",
            "diabetes": "No diabetes.",
            "smoking_alcohol": "Never smoked. A glass of wine most evenings.",
            "other": "My eyes are fine. I've never had glaucoma, but I wear glasses. I read that the robot case means a long time with my head down, is that a problem?",
        },
        hidden=hidden,
    )


SCENARIO = {
    "id": "radical_prostatectomy",
    "name": "Robotic Radical Prostatectomy",
    "specialty": "Urology",
    "summary": "62-year-old with localized prostate cancer for robotic-assisted radical prostatectomy with a urethrovesical anastomosis.",
    "full_stomach": False,
    "awake_line": "I read the robot case means a long time with my head down. Please look after my eyes.",
    "airway_teaching": "Fasted elective case: standard induction with a video laryngoscope ready. Hours of steep Trendelenburg with a 15 mmHg pneumoperitoneum "
                       "stiffen the chest (peak pressures climb), swell the face and airway, and raise intraocular pressure: tape and pad the eyes, check the tube depth, "
                       "limit fluids, and do a cuff-leak test before extubating. The robot can't be moved once docked.",
    "build_patient": build_patient,
}
