"""Drug catalog.

Each drug knows its dosing unit, how to build its PK model for a given
patient, and the dose ranges an experienced anesthesiologist would consider
normal (used by the team to question unusual orders, never to block them).

Published models:
  propofol      Schnider 1998/1999
  remifentanil  Minto 1997
  fentanyl      Shafer 1990
  rocuronium    Wierda 1991 / Szenohradszky 1992 style 3-compartment, tuned to
                onset ~90 s and clinical duration ~35 min at 0.6 mg/kg
Others are one-compartment approximations tuned to typical clinical time
courses (onset, peak, duration).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional

from ..patient import PatientSpec
from .pk import PKParams, from_clearances


def _schnider(p: PatientSpec) -> PKParams:
    age, wt, ht, lbm = p.age, p.weight_kg, p.height_cm, p.lbm_kg
    v1 = 4.27
    v2 = 18.9 - 0.391 * (age - 53)
    v3 = 238.0
    k10 = 0.443 + 0.0107 * (wt - 77) - 0.0159 * (lbm - 59) + 0.0062 * (ht - 177)
    k12 = 0.302 - 0.0056 * (age - 53)
    k13 = 0.196
    k21 = (1.29 - 0.024 * (age - 53)) / v2
    k31 = 0.0035
    return PKParams(v1=v1, k10=k10, k12=k12, k21=k21, k13=k13, k31=k31, ke0=0.456)


def _minto(p: PatientSpec) -> PKParams:
    age, lbm = p.age, p.lbm_kg
    v1 = 5.1 - 0.0201 * (age - 40) + 0.072 * (lbm - 55)
    v2 = 9.82 - 0.0811 * (age - 40) + 0.108 * (lbm - 55)
    v3 = 5.42
    cl1 = 2.6 - 0.0162 * (age - 40) + 0.0191 * (lbm - 55)
    cl2 = 2.05 - 0.0301 * (age - 40)
    cl3 = 0.076 - 0.00113 * (age - 40)
    ke0 = 0.595 - 0.007 * (age - 40)
    return from_clearances(v1, v2, v3, cl1, cl2, cl3, ke0)


def _shafer_fentanyl(p: PatientSpec) -> PKParams:
    return PKParams(v1=6.09, k10=0.0827, k12=0.471, k21=0.102, k13=0.225, k31=0.006, ke0=0.147)


def _rocuronium(p: PatientSpec) -> PKParams:
    # Dosed on ideal/adjusted body weight in obesity; volumes scale with IBW.
    w = p.ibw_kg + 0.4 * max(0.0, p.weight_kg - p.ibw_kg)
    return PKParams(v1=0.045 * w, k10=0.1, k12=0.21, k21=0.13, k13=0.028, k31=0.01, ke0=0.168)


def _succinylcholine(p: PatientSpec) -> PKParams:
    # Rapid plasma cholinesterase hydrolysis; effect ends as drug diffuses
    # away from the junction.
    return PKParams(v1=0.06 * p.weight_kg, k10=0.9, ke0=0.9)


def _one(v_per_kg: float, k10: float, ke0: float, fixed_v: Optional[float] = None) -> Callable[[PatientSpec], PKParams]:
    def build(p: PatientSpec) -> PKParams:
        v1 = fixed_v if fixed_v is not None else v_per_kg * p.weight_kg
        return PKParams(v1=v1, k10=k10, ke0=ke0)

    return build


def _midazolam(p: PatientSpec) -> PKParams:
    return PKParams(v1=0.2 * p.weight_kg, k10=0.022, k12=0.35, k21=0.1, ke0=0.12)


@dataclass(frozen=True)
class DrugDef:
    id: str
    name: str
    unit: str  # "mg" | "mcg" | "g"
    drug_class: str
    aliases: tuple[str, ...] = ()
    concentration: str = ""  # syringe label shown in the UI
    usual_per_kg: tuple[float, float] = (0.0, 0.0)  # bolus range in unit/kg
    usual_fixed: tuple[float, float] = (0.0, 0.0)  # bolus range for fixed-dose drugs
    pk: Optional[Callable[[PatientSpec], PKParams]] = None
    infusion_unit: str = ""  # e.g. "mcg/kg/min"
    transit_s: float = 15.0
    notes: str = ""
    tags: tuple[str, ...] = field(default_factory=tuple)

    def usual_range(self, p: PatientSpec) -> tuple[float, float]:
        if self.usual_per_kg != (0.0, 0.0):
            lo, hi = self.usual_per_kg
            wt = p.weight_kg if "tbw" in self.tags else (p.lbm_kg if "lbm" in self.tags else p.ibw_kg + 0.4 * max(0.0, p.weight_kg - p.ibw_kg))
            return lo * wt, hi * wt
        return self.usual_fixed

    def public(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "unit": self.unit,
            "class": self.drug_class,
            "concentration": self.concentration,
            "infusion_unit": self.infusion_unit,
            "aliases": list(self.aliases),
            "notes": self.notes,
            # lets the cart pre-fill the low end of the usual bolus for this patient
            "usual_per_kg": list(self.usual_per_kg),
            "usual_fixed": list(self.usual_fixed),
            "dose_weight": "tbw" if "tbw" in self.tags else ("lbm" if "lbm" in self.tags else "adjusted"),
        }


DRUGS: dict[str, DrugDef] = {
    d.id: d
    for d in [
        # --- hypnotics / sedatives --------------------------------------
        DrugDef("propofol", "Propofol", "mg", "hypnotic", ("diprivan", "prop"), "10 mg/mL",
                usual_per_kg=(1.0, 2.5), pk=_schnider, infusion_unit="mcg/kg/min", tags=("lbm",),
                notes="Induction 1.5–2.5 mg/kg (lean weight). Causes apnea and hypotension."),
        DrugDef("midazolam", "Midazolam", "mg", "hypnotic", ("versed", "midaz"), "1 mg/mL",
                usual_fixed=(0.5, 4.0), pk=_midazolam, transit_s=20,
                notes="Anxiolysis 1–2 mg. Synergistic with opioids and propofol."),
        # --- opioids -----------------------------------------------------
        DrugDef("fentanyl", "Fentanyl", "mcg", "opioid", ("sublimaze", "fent"), "50 mcg/mL",
                usual_per_kg=(0.5, 3.0), pk=_shafer_fentanyl, infusion_unit="mcg/kg/h",
                notes="1–2 mcg/kg blunts laryngoscopy. Peak effect ~4 min."),
        DrugDef("remifentanil", "Remifentanil", "mcg", "opioid", ("ultiva", "remi"), "50 mcg/mL",
                usual_per_kg=(0.25, 1.0), pk=_minto, infusion_unit="mcg/kg/min", tags=("lbm",),
                notes="Ultra-short acting. Usually an infusion 0.05–0.3 mcg/kg/min."),
        # --- neuromuscular blockers + reversal -------------------------
        DrugDef("rocuronium", "Rocuronium", "mg", "nmb", ("zemuron", "roc"), "10 mg/mL",
                usual_per_kg=(0.3, 1.2), pk=_rocuronium,
                notes="0.6 mg/kg: intubating conditions ~90 s. 1.2 mg/kg for RSI."),
        DrugDef("succinylcholine", "Succinylcholine", "mg", "nmb", ("sux", "succs", "anectine", "suxamethonium"), "20 mg/mL",
                usual_per_kg=(1.0, 1.5), pk=_succinylcholine, transit_s=12, tags=("tbw",),
                notes="1–1.5 mg/kg (total weight). Onset ~60 s, lasts 8–10 min. MH trigger."),
        DrugDef("sugammadex", "Sugammadex", "mg", "reversal", ("bridion", "sugam"), "100 mg/mL",
                usual_per_kg=(2.0, 16.0), pk=_one(0.0, 0.0073, 1.0, fixed_v=12.0), tags=("tbw",),
                notes="Encapsulates rocuronium. 2 mg/kg if TOF ≥2, 4 mg/kg deep block, 16 mg/kg immediate."),
        DrugDef("neostigmine", "Neostigmine", "mg", "reversal", ("neo stig", "prostigmin"), "1 mg/mL",
                usual_per_kg=(0.03, 0.07), pk=_one(0.0, 0.03, 0.15, fixed_v=15.0),
                notes="Give with glycopyrrolate. Ineffective for deep block; peak 7–10 min."),
        # --- autonomic ---------------------------------------------------
        DrugDef("glycopyrrolate", "Glycopyrrolate", "mg", "anticholinergic", ("robinul", "glyco"), "0.2 mg/mL",
                usual_fixed=(0.1, 1.0), pk=_one(0.0, 0.01, 0.25, fixed_v=15.0)),
        DrugDef("atropine", "Atropine", "mg", "anticholinergic", (), "0.4 mg/mL",
                usual_fixed=(0.4, 1.0), pk=_one(0.0, 0.02, 0.6, fixed_v=20.0), transit_s=10),
        DrugDef("phenylephrine", "Phenylephrine", "mcg", "vasopressor", ("neosynephrine", "neo-synephrine", "phenyl", "phenyleprine"), "100 mcg/mL",
                usual_fixed=(40.0, 200.0), pk=_one(0.0, 0.25, 1.0, fixed_v=10.0), infusion_unit="mcg/min",
                notes="Pure alpha agonist: raises SVR, reflex bradycardia."),
        DrugDef("ephedrine", "Ephedrine", "mg", "vasopressor", ("ephed",), "5 mg/mL",
                usual_fixed=(5.0, 25.0), pk=_one(0.0, 0.07, 0.5, fixed_v=20.0),
                notes="Mixed direct/indirect: raises HR, contractility and BP."),
        DrugDef("epinephrine", "Epinephrine", "mcg", "vasopressor", ("adrenaline", "epi"), "10 mcg/mL (push-dose)",
                usual_fixed=(5.0, 1000.0), pk=_one(0.0, 0.7, 2.0, fixed_v=10.0), infusion_unit="mcg/min", transit_s=10,
                notes="Push-dose 10–20 mcg. Cardiac arrest 1 mg."),
        DrugDef("esmolol", "Esmolol", "mg", "beta_blocker", ("brevibloc",), "10 mg/mL",
                usual_per_kg=(0.25, 1.0), pk=_one(0.0, 0.4, 1.0, fixed_v=10.0), tags=("tbw",)),
        DrugDef("naloxone", "Naloxone", "mg", "reversal", ("narcan",), "0.4 mg/mL",
                usual_fixed=(0.04, 0.4), pk=_one(0.0, 0.08, 0.8, fixed_v=15.0)),
        # --- antibiotics (timing, allergy) -------------------------------
        DrugDef("cefazolin", "Cefazolin", "g", "antibiotic", ("ancef", "kefzol"), "2 g", usual_fixed=(2.0, 3.0), transit_s=5),
        DrugDef("cefoxitin", "Cefoxitin", "g", "antibiotic", ("mefoxin",), "2 g", usual_fixed=(2.0, 2.0), transit_s=5),
        DrugDef("metronidazole", "Metronidazole", "mg", "antibiotic", ("flagyl",), "500 mg", usual_fixed=(500.0, 500.0), transit_s=5),
        DrugDef("ceftriaxone", "Ceftriaxone", "g", "antibiotic", ("rocephin",), "2 g", usual_fixed=(1.0, 2.0), transit_s=5),
        DrugDef("piperacillin_tazobactam", "Piperacillin-tazobactam", "g", "antibiotic", ("zosyn", "pip tazo", "piptazo"), "4.5 g",
                usual_fixed=(3.375, 4.5), transit_s=5, tags=("penicillin",)),
        DrugDef("ampicillin_sulbactam", "Ampicillin-sulbactam", "g", "antibiotic", ("unasyn",), "3 g",
                usual_fixed=(3.0, 3.0), transit_s=5, tags=("penicillin",)),
        DrugDef("clindamycin", "Clindamycin", "mg", "antibiotic", ("cleocin",), "900 mg", usual_fixed=(600.0, 900.0), transit_s=5),
        DrugDef("gentamicin", "Gentamicin", "mg", "antibiotic", (), "5 mg/kg", usual_per_kg=(4.0, 5.0), transit_s=5),
        # --- adjuncts (charted; negligible acute physiology) -------------
        DrugDef("ondansetron", "Ondansetron", "mg", "antiemetic", ("zofran",), "2 mg/mL", usual_fixed=(4.0, 8.0)),
        DrugDef("dexamethasone", "Dexamethasone", "mg", "steroid", ("decadron", "dex"), "4 mg/mL", usual_fixed=(4.0, 10.0)),
        DrugDef("acetaminophen", "Acetaminophen", "mg", "analgesic", ("ofirmev", "tylenol", "paracetamol"), "10 mg/mL", usual_fixed=(650.0, 1000.0)),
        DrugDef("ketorolac", "Ketorolac", "mg", "analgesic", ("toradol",), "30 mg/mL", usual_fixed=(15.0, 30.0)),
    ]
}


VOLATILES = {
    "sevoflurane": ("sevo", "sevoflurane", "ultane"),
}

FLUIDS = {
    "lactated_ringers": ("lr", "lactated ringers", "ringers", "hartmann", "ringer's lactate", "ringers lactate"),
    "normal_saline": ("ns", "saline", "normal saline", "0.9 saline"),
    "albumin_5": ("albumin", "5% albumin"),
    "prbc": ("prbc", "blood", "packed red cells", "packed cells", "prbcs", "rbc", "red cells"),
}


def find_drug(text: str) -> Optional[DrugDef]:
    t = text.strip().lower().replace("-", " ")
    for d in DRUGS.values():
        names = (d.id.replace("_", " "), d.name.lower().replace("-", " "), *d.aliases)
        if t in names:
            return d
    return None
