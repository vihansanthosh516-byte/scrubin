"""Laparoscopic appendectomy: Marcus T., 28 M, acute appendicitis."""

from __future__ import annotations

import random

from ..patient import PatientSpec


def _weighted(rng: random.Random, options: dict):
    r = rng.random() * sum(options.values())
    for k, w in options.items():
        r -= w
        if r <= 0:
            return k
    return next(iter(options))


def build_patient(rng: random.Random) -> PatientSpec:
    hidden = {
        # Airway (obese male, Mallampati 2).
        "cormack_lehane": _weighted(rng, {1: 0.45, 2: 0.35, 3: 0.17, 4: 0.03}),
        "difficult_mask": rng.random() < 0.12,
        # Asthma: light plane airway instrumentation can trigger bronchospasm.
        "reactive_airway": rng.random() < 0.5,
        # Acute abdomen with vomiting: delayed gastric emptying.
        "gastric_volume_ml": _weighted(rng, {40: 0.5, 150: 0.35, 400: 0.15}),
        # Surgical anatomy.
        "appendix_position": _weighted(rng, {"retrocecal": 0.6, "pelvic": 0.3, "subcecal": 0.1}),
        "perforated": rng.random() < 0.2,
        "accessory_appendiceal_artery": rng.random() < 0.25,
        "adhesions": rng.random() < 0.1,
    }
    return PatientSpec(
        name="Marcus T.",
        age=28,
        sex="M",
        weight_kg=95.0,
        height_cm=178.0,
        hr=104.0,
        sbp=136.0,
        dbp=84.0,
        rr=20.0,
        temp_c=38.3,
        hb_g_dl=14.8,
        mallampati=2,
        history=(
            "18 h of periumbilical pain migrating to the RLQ, anorexia, two episodes of emesis. "
            "Rebound tenderness at McBurney's point. WBC 15.8. CT: 11 mm appendix with "
            "periappendiceal fat stranding, no abscess. Last meal 10 h ago."
        ),
        allergies=("penicillin (hives as a child)",),
        comorbidities=("obesity (BMI 30)", "mild intermittent asthma (albuterol PRN)"),
        npo_hours=10.0,
        blood_type="O+",
        interview={
            "last_food": "Burger and fries about 10 hours ago; a few sips of water 4 hours ago.",
            "vomiting": "Threw up twice, last time about 3 hours ago.",
            "pain": "Sharp, right lower belly, 8 out of 10, worse when the car went over bumps.",
            "teeth": "All my own teeth, nothing loose, no caps or dentures.",
            "previous_anesthesia": "Tonsils out when I was 6 — no problems that I know of.",
            "family_anesthesia_problems": "Not that I know of.",
            "medications": "Albuterol inhaler when I need it — last used about three months ago.",
            "allergy_reaction": "Penicillin gave me hives as a kid. No trouble breathing.",
            "asthma": "Mild. Never been in hospital for it.",
            "smoking_alcohol": "Don't smoke. A few beers on weekends.",
            "other": "No heart or lung problems apart from the asthma. Never had a blood clot.",
        },
        hidden=hidden,
    )


SCENARIO = {
    "id": "appendectomy",
    "name": "Laparoscopic Appendectomy",
    "specialty": "General Surgery",
    "summary": "28-year-old with acute appendicitis for urgent laparoscopic appendectomy.",
    "build_patient": build_patient,
}
