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
        hidden=hidden,
    )


SCENARIO = {
    "id": "appendectomy",
    "name": "Laparoscopic Appendectomy",
    "specialty": "General Surgery",
    "summary": "28-year-old with acute appendicitis for urgent laparoscopic appendectomy.",
    "build_patient": build_patient,
}
