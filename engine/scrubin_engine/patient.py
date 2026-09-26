"""Patient specification and derived anthropometrics.

All derived values use standard clinical formulas so drug models (which are
parameterised on age / weight / height / lean body mass) behave like the
published models they come from.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from math import log10


@dataclass(frozen=True)
class PatientSpec:
    name: str
    age: int
    sex: str  # "M" | "F"
    weight_kg: float
    height_cm: float
    # Awake, resting baseline (before any anesthetic).
    hr: float = 80.0
    sbp: float = 120.0
    dbp: float = 75.0
    rr: float = 14.0
    temp_c: float = 36.8
    hb_g_dl: float = 14.0
    # Airway exam (visible to the trainee).
    mallampati: int = 2
    # Clinical story (visible to the trainee).
    history: str = ""
    allergies: tuple[str, ...] = ()
    comorbidities: tuple[str, ...] = ()
    npo_hours: float = 8.0
    blood_type: str = "O+"
    # Hidden truths (never sent to the client until debrief).
    hidden: dict = field(default_factory=dict)

    # --- anthropometrics -------------------------------------------------

    @property
    def height_m(self) -> float:
        return self.height_cm / 100.0

    @property
    def bmi(self) -> float:
        return self.weight_kg / self.height_m**2

    @property
    def lbm_kg(self) -> float:
        """James formula (used by the Schnider and Minto models)."""
        w, h = self.weight_kg, self.height_cm
        if self.sex == "M":
            return 1.1 * w - 128.0 * (w / h) ** 2
        return 1.07 * w - 148.0 * (w / h) ** 2

    @property
    def ibw_kg(self) -> float:
        """Devine ideal body weight."""
        inches_over_5ft = max(0.0, self.height_cm / 2.54 - 60.0)
        base = 50.0 if self.sex == "M" else 45.5
        return base + 2.3 * inches_over_5ft

    @property
    def blood_volume_ml(self) -> float:
        """Nadler formula."""
        h, w = self.height_m, self.weight_kg
        if self.sex == "M":
            litres = 0.3669 * h**3 + 0.03219 * w + 0.6041
        else:
            litres = 0.3561 * h**3 + 0.03308 * w + 0.1833
        return litres * 1000.0

    @property
    def frc_ml(self) -> float:
        """Supine awake FRC; reduced with obesity (~ -3%/BMI point over 25)."""
        base = 30.0 * self.ibw_kg  # ~2.2 L supine for a 73 kg IBW adult
        obesity = max(0.0, self.bmi - 25.0) * 0.03
        return base * max(0.5, 1.0 - obesity)

    @property
    def vo2_ml_min(self) -> float:
        """Resting O2 consumption, +10% per degree C of fever."""
        base = 3.5 * self.weight_kg ** 0.75 * 3.0  # Brody/Kleiber-ish, ~250 ml/min @70kg
        return base * (1.0 + 0.10 * max(0.0, self.temp_c - 37.0))

    @property
    def sevo_mac(self) -> float:
        """Age-adjusted sevoflurane MAC (%), Mapleson 1996."""
        return 2.1 * 10 ** (-0.00269 * (self.age - 40))

    @property
    def map(self) -> float:
        return (self.sbp + 2 * self.dbp) / 3.0

    def public_summary(self) -> dict:
        return {
            "name": self.name,
            "age": self.age,
            "sex": self.sex,
            "weight_kg": self.weight_kg,
            "height_cm": self.height_cm,
            "bmi": round(self.bmi, 1),
            "mallampati": self.mallampati,
            "history": self.history,
            "allergies": list(self.allergies),
            "comorbidities": list(self.comorbidities),
            "npo_hours": self.npo_hours,
            "blood_type": self.blood_type,
            "baseline": {
                "hr": self.hr,
                "sbp": self.sbp,
                "dbp": self.dbp,
                "rr": self.rr,
                "temp_c": self.temp_c,
                "hb": self.hb_g_dl,
            },
        }


def age_factor(age: float, per_decade: float) -> float:
    """Utility for simple linear age scaling around 40 years."""
    return 1.0 + per_decade * (age - 40.0) / 10.0


def log_dose_scale(dose: float, ref: float) -> float:
    return 1.0 + log10(max(dose, 1e-9) / ref)
