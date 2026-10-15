"""Category 1 emergency caesarean under general anesthesia: Maria K., 31 F, 39+2 weeks, fetal bradycardia."""

from __future__ import annotations

import random

from ..patient import PatientSpec
from .appendectomy import _weighted


def build_patient(rng: random.Random) -> PatientSpec:
    hidden = {
        # Pregnancy makes the airway harder: oedema, large breasts, a short neck on the table.
        "cormack_lehane": _weighted(rng, {1: 0.35, 2: 0.35, 3: 0.22, 4: 0.08}),
        "difficult_mask": rng.random() < 0.15,
        "reactive_airway": rng.random() < 0.18,
        "gastric_volume_ml": _weighted(rng, {100: 0.6, 300: 0.4}),
        # Surgical and obstetric risk.
        "prior_cs_adhesions": rng.random() < 0.45,
        "anterior_placenta": rng.random() < 0.3,
        "big_baby": rng.random() < 0.25,
        "atony_risk": rng.random() < 0.35,
    }
    asthma = bool(hidden["reactive_airway"])
    return PatientSpec(
        name="Maria K.",
        age=31,
        sex="F",
        weight_kg=84.0,
        height_cm=165.0,
        hr=98.0,
        sbp=118.0,
        dbp=68.0,
        rr=18.0,
        temp_c=37.1,
        hb_g_dl=10.6,
        mallampati=3,
        history=(
            "39+2 weeks, G2P1, one previous caesarean. Trial of labour after caesarean, in labour for 9 hours. "
            "Over the last 6 minutes the fetal heart rate fell to 70 and has not recovered despite repositioning, fluids and stopping the oxytocin: "
            "Category 1 caesarean, decision made now. No epidural in place. Last ate toast about 3 hours ago, labouring since. "
            "Group and screen sent, two large cannulas in."
        ),
        allergies=(),
        comorbidities=("pregnancy 39+2 weeks", "previous caesarean", "iron-deficiency anaemia (Hb 10.6)", "BMI 31")
        + (("asthma (salbutamol as needed)",) if asthma else ()),
        npo_hours=3.0,
        blood_type="O+",
        pregnant=True,
        interview={
            "last_food": "Toast and tea about three hours ago, before the contractions got bad. Just ice chips since.",
            "vomiting": "I felt sick with the contractions and was sick once an hour ago.",
            "pain": "The contractions are awful, 8 out of 10, but I'm more scared about the baby.",
            "teeth": "All my own.",
            "previous_anesthesia": "I had a spinal for my first caesarean and it was fine.",
            "family_anesthesia_problems": "No.",
            "medications": ("Only prenatal vitamins and iron. I use a salbutamol inhaler when my asthma plays up." if asthma
                            else "Prenatal vitamins and iron tablets."),
            "allergy_reaction": "No allergies.",
            "diabetes": "No, my sugar test was normal.",
            "smoking_alcohol": "No smoking, no alcohol.",
            "other": ("My asthma has been quiet in pregnancy, but it flares with some medicines." if asthma else "Please just get the baby out safely."),
        },
        hidden=hidden,
    )


SCENARIO = {
    "id": "emergency_cesarean",
    "name": "Emergency Caesarean Section (Category 1)",
    "specialty": "Obstetrics",
    "summary": "31-year-old at 39 weeks in labour with fetal bradycardia: category 1 caesarean under general anesthesia.",
    "full_stomach": True,
    "pregnant": True,
    "obstetric": True,
    "awake_line": "Is the baby okay? Please put me to sleep, just get the baby out.",
    "airway_teaching": "Pregnant, in labour, full stomach, harder airway: left uterine displacement from the start, preoxygenate (FRC is smaller, she desaturates fast), cricoid pressure, "
                       "propofol with suxamethonium, a smaller tube and the video laryngoscope ready. Avoid opioids until the baby is out. Keep the volatile around 0.5–1 MAC and turn it down after delivery: it relaxes the uterus.",
    "build_patient": build_patient,
}
