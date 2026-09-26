from scrubin_engine.case import Case
from scrubin_engine.patient import PatientSpec
from scrubin_engine.scenarios import SCENARIOS


def lean_patient(rng=None, **overrides) -> PatientSpec:
    base = dict(name="Test", age=35, sex="M", weight_kg=70, height_cm=178, hr=70, sbp=120, dbp=75, rr=12, temp_c=37.0,
                hidden={"cormack_lehane": 1, "difficult_mask": False, "reactive_airway": False, "gastric_volume_ml": 20})
    base.update(overrides)
    return PatientSpec(**base)


LEAN = {"id": "lean", "build_patient": lambda rng: lean_patient()}


def appy(seed: int = 1, role: str = "anesthesia", **kw) -> Case:
    return Case(SCENARIOS["appendectomy"], role, seed=seed, **kw)


def lean(seed: int = 1) -> Case:
    return Case(LEAN, "anesthesia", seed=seed)


def monitors(c: Case) -> None:
    c.submit({"type": "monitor", "attach": ["ecg", "spo2", "nibp", "etco2", "bis"]})


def preoxygenate(c: Case, seconds: float = 180) -> None:
    c.submit({"type": "gas", "o2_flow": 10})
    c.submit({"type": "airway", "maneuver": "mask_on"})
    c.run(seconds)


def induce_and_intubate(c: Case, force_location: str | None = None) -> None:
    """Standard induction; optionally force where the tube ends up."""
    lbm = c.patient.lbm_kg
    c.submit({"type": "drug", "drug": "fentanyl", "dose": 100})
    c.run(60)
    c.submit({"type": "drug", "drug": "propofol", "dose": round(2 * lbm)})
    c.submit({"type": "drug", "drug": "rocuronium", "dose": round(0.6 * c.patient.weight_kg)})
    c.submit({"type": "infusion", "drug": "propofol", "rate": 120, "unit": "mcg/kg/min"})
    c.run(100)
    c.submit({"type": "airway", "maneuver": "intubate", "laryngoscope": "mac4", "depth_cm": 22})
    c.run(40)
    if force_location:
        c.airway.device = "ett"
        c.airway.cuff_inflated = True
        c.airway.ett_location = force_location
    c.submit({"type": "vent", "mode": "vcv", "tv_ml": 500, "rr": 12, "peep": 5})
