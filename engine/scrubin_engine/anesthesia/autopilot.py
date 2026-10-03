"""AI anesthesiologist, used when the trainee plays the surgeon.

A rule-based controller that behaves like a competent attending: RSI for a
full-stomach appendicitis patient, confirms tube placement with
capnography, titrates volatile to depth, treats hypotension, adjusts
ventilation to EtCO2, redoses relaxant for laparoscopy, then reverses and
extubates. Its actions go through the same engine as the trainee's; they are
not written to the replay log because the controller is itself deterministic.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from .. import actions as A

ARREST = ("pea", "asystole", "vf")
DEPTH_DRUGS = {"propofol", "fentanyl", "remifentanil", "midazolam", "ketamine", "sevoflurane", "morphine", "hydromorphone"}
RELAXANTS = {"rocuronium", "vecuronium", "succinylcholine", "cisatracurium"}
PRESSORS = {"phenylephrine", "ephedrine", "epinephrine", "norepinephrine", "vasopressin"}
ANTIBIOTICS = {"cefazolin", "metronidazole", "clindamycin", "gentamicin", "vancomycin", "ampicillin"}


@dataclass
class Autopilot:
    case: Any
    phase: str = "setup"
    t_phase: float = 0.0
    last: dict = field(default_factory=dict)
    baseline_hr: float = 0.0

    def act(self, data: dict) -> None:
        data = {**data, "actor": "anesthesia"}
        self.case._apply(A.parse_action(data), confirmed=True)

    def say(self, text: str) -> None:
        self.case.say("anesthesia", text)

    def every(self, key: str, seconds: float) -> bool:
        t = self.case.t
        if t - self.last.get(key, -1e9) >= seconds:
            self.last[key] = t
            return True
        return False

    def goto(self, phase: str) -> None:
        self.phase = phase
        self.t_phase = self.case.t

    @property
    def in_phase(self) -> float:
        return self.case.t - self.t_phase

    # ------------------------------------------------------------------
    def hear(self, act: A.Say) -> bool:
        text = (act.text or "").lower()
        if re.search(r"relax|paraly|tight", text):
            self.act({"type": "drug", "drug": "rocuronium", "dose": 20})
            return True
        if re.search(r"\binduc|put (him|her|them) to sleep|go to sleep|let's (go|start)|ready to start", text):
            if self.induce_now():
                return True
        if re.search(r"deeper|moving|light", text):
            self.hear_deeper()
            return True
        if re.search(r"pressure|\bbp\b|pressor", text):
            b = self.case.body
            treat = re.search(r"\blow\b|treat|give|need|bring|raise|support|pressor", text) or b.map < 65
            if treat and self.phase in ("maintenance", "closing"):
                drug, dose = ("ephedrine", 10) if b.hr < 60 else ("phenylephrine", 100)
                self.act({"type": "drug", "drug": drug, "dose": dose})
                self.say(f"Pressure's {round(b.sbp)}/{round(b.dbp)}, MAP {round(b.map)} — {drug} {dose} going in.")
            else:
                self.say(f"Blood pressure is {round(b.sbp)}/{round(b.dbp)}, MAP {round(b.map)}, heart rate {round(b.hr)}.")
            return True
        if getattr(act, "to", None) == "anesthesia":
            # Anything else addressed to anesthesia gets a status report, not a question back.
            c, b = self.case, self.case.body
            self.say(f"Sats {round(b.sao2 * 100)}, pressure {round(b.sbp)}/{round(b.dbp)}, heart rate {round(b.hr)}"
                     + (f", BIS {round(c.eff.bis)}" if self.phase in ("maintenance", "closing") else "")
                     + " — I've got the anesthetic.")
            return True
        return False

    # ------------------------------------------------------------------
    def request(self, act) -> dict:
        """An anesthesia order from the trainee-surgeon. The anesthesiologist owns
        the anesthetic: it decides and doses, it never asks the surgeon how much."""
        c, b = self.case, self.case.body
        kind = act.type
        after_induction = self.phase in ("maintenance", "closing")
        if kind == "drug":
            drug = act.drug
            if drug in DEPTH_DRUGS and self.induce_now():
                pass
            elif drug in DEPTH_DRUGS:
                if after_induction:
                    self.hear_deeper()
                    self.say(f"Taking {self.case.patient.him} deeper.")
                else:
                    self.say(f"I'll induce as soon as {self.case.patient.he}'s preoxygenated.")
            elif drug in RELAXANTS:
                if after_induction:
                    self.act({"type": "drug", "drug": "rocuronium", "dose": 20})
                    self.say("More rocuronium going in.")
                else:
                    self.say("The relaxant goes in with induction.")
            elif drug in PRESSORS:
                if b.rhythm in ARREST:
                    self.say("We're running the code — epi is on schedule.")
                elif b.hr < 60:
                    self.act({"type": "drug", "drug": "ephedrine", "dose": 10})
                    self.say("Ephedrine 10 for the pressure.")
                else:
                    self.act({"type": "drug", "drug": "phenylephrine", "dose": 100})
                    self.say("Phenylephrine 100 for the pressure.")
            elif drug in ANTIBIOTICS:
                if self.last.get("antibiotics"):
                    self.say("Antibiotics are already in.")
                else:
                    self._antibiotics()
            else:
                self.say("I'll take care of the anesthetic drugs — tell me what you're seeing.")
            return {"ok": True, "delegated": True}
        if kind == "fluid":
            self.act({"type": "fluid", "fluid": "lactated_ringers", "volume_ml": 500})
            self.say("Running a 500 bolus of LR.")
            return {"ok": True, "delegated": True}
        self.say("I've got the airway and the ventilator — tell me what you need.")
        return {"ok": True, "delegated": True}

    def induce_now(self) -> bool:
        """The surgeon asks to get going: once a minute of preoxygenation is done,
        start the induction rather than waiting out the full three minutes."""
        if self.phase == "preox" and self.in_phase >= 60:
            self.say("Okay — inducing now. Rapid sequence: fentanyl, propofol, rocuronium.")
            self.act({"type": "drug", "drug": "fentanyl", "dose": 150})
            self.goto("fentanyl")
            return True
        if self.phase in ("setup", "preox"):
            self.say("Still preoxygenating — I'll induce in about a minute.")
            return True
        return False

    def hear_deeper(self) -> None:
        self.act({"type": "drug", "drug": "propofol", "dose": 40})
        self.act({"type": "volatile", "percent": min(3.5, self.case.machine.sevo_dial + 0.5)})

    def _antibiotics(self) -> None:
        c = self.case
        self._give_prophylaxis()
        self.say(self._abx_line())

    def _abx_line(self) -> str:
        names = " and ".join(d.capitalize() if i == 0 else d for i, d in enumerate(self._prophylaxis_drugs()))
        pcn = next((a for a in self.case.patient.allergies if "penicillin" in a), None)
        reaction = (re.search(r"\((.*?)\)", pcn) or [None, "mild"])[1] if pcn else ""
        return f"{names} {'are' if ' and ' in names else 'is'} in" + (f" — the penicillin allergy was {reaction}, so cefazolin is fine." if pcn else ".")

    def _prophylaxis_drugs(self) -> list[str]:
        return ["cefazolin", "metronidazole"] if self.case.scenario_id in ("appendectomy", "sigmoid_colectomy") else ["cefazolin"]

    def _give_prophylaxis(self) -> None:
        c = self.case
        self.act({"type": "drug", "drug": "cefazolin", "dose": 3 if c.patient.weight_kg >= 120 else 2, "unit": "g"})
        if "metronidazole" in self._prophylaxis_drugs():
            self.act({"type": "drug", "drug": "metronidazole", "dose": 500})
        self.last["antibiotics"] = c.t

    def _rescue(self) -> bool:
        """Arrest and hypoxia come before the plan. Returns True while a code runs."""
        c = self.case
        b, aw = c.body, c.airway
        if b.rhythm in ARREST:
            if not b.cpr:
                self.say("No pulse — starting CPR. Epi 1 milligram, and get the defibrillator.")
                self.act({"type": "cpr", "on": True})
                if aw.device != "ett":
                    self.act({"type": "airway", "maneuver": "mask_on"})
                    self.act({"type": "bag", "on": True})
                self.act({"type": "gas", "o2_flow": 10, "air_flow": 0})
                self.act({"type": "volatile", "percent": 0})
            if self.every("code_epi", 180):
                self.act({"type": "drug", "drug": "epinephrine", "dose": 1000})
            if b.rhythm == "vf" and self.every("shock", 120):
                self.act({"type": "defibrillate", "joules": 200})
            return True
        induced = self.phase in ("induced", "intubating", "rescue_mask", "confirm_tube", "emergence", "done")
        if induced and aw.device != "ett" and b.sao2 < 0.90 and self.every("desat", 30):
            self.say(f"Sats are {round(b.sao2 * 100)} — bagging {c.patient.him}.")
            self.act({"type": "gas", "o2_flow": 10, "air_flow": 0})
            self.act({"type": "airway", "maneuver": "mask_on"})
            self.act({"type": "airway", "maneuver": "oral_airway"})
            self.act({"type": "bag", "on": True})
        return False

    def step(self, dt: float) -> None:
        c = self.case
        eff, b, aw, m = c.eff, c.body, c.airway, c.machine
        p = self.phase
        proc = c.procedure
        if self._rescue():
            return

        if p == "setup" and c.t >= 5:
            self.say(f"Hi {c.patient.first_name}, I'm Dr. Okafor from anesthesia. We'll put some monitors on and give you some oxygen.")
            self.act({"type": "monitor", "attach": ["ecg", "spo2", "nibp", "etco2", "temp", "bis"]})
            self.act({"type": "gas", "o2_flow": 10, "air_flow": 0})
            self.act({"type": "airway", "maneuver": "mask_on"})
            self.goto("preox")
        elif p == "preox" and self.in_phase >= 170:
            self.say("Preoxygenated. Full stomach, so rapid sequence: fentanyl, propofol, rocuronium 1.2 per kilo, no bag-mask ventilation."
                     if c.scenario.get("full_stomach", True) else "Preoxygenated. Fasted, so a standard induction with the video laryngoscope ready: fentanyl, propofol, rocuronium.")
            self.act({"type": "drug", "drug": "fentanyl", "dose": 150})
            self.goto("fentanyl")
        elif p == "fentanyl" and self.in_phase >= 60:
            self.act({"type": "drug", "drug": "propofol", "dose": round(2.0 * c.patient.lbm_kg, -1)})
            self.act({"type": "drug", "drug": "rocuronium", "dose": round(1.2 * (c.patient.ibw_kg + 0.4 * (c.patient.weight_kg - c.patient.ibw_kg)), -1)})
            self.goto("induced")
        elif p == "induced" and self.in_phase >= 60 and eff.tof_count == 0:
            self.act({"type": "airway", "maneuver": "intubate", "laryngoscope": "video", "tube_size": 7.5, "depth_cm": 22})
            self.goto("intubating")
        elif p == "intubating" and aw.attempt is None:
            if aw.device == "ett":
                self.act({"type": "vent", "mode": "vcv", "tv_ml": 500, "rr": 14, "peep": 6})
                self.goto("confirm_tube")
            elif self.in_phase > 5:
                self.say("Couldn't get it — back to the mask.")
                self.act({"type": "airway", "maneuver": "mask_on"})
                self.act({"type": "airway", "maneuver": "oral_airway"})
                self.act({"type": "bag", "on": True})
                self.goto("rescue_mask")
        elif p == "rescue_mask" and self.in_phase >= 45:
            self.act({"type": "bag", "on": False})
            self.act({"type": "airway", "maneuver": "intubate", "laryngoscope": "video", "bougie": True, "tube_size": 7.0, "depth_cm": 22})
            self.goto("intubating")
        elif p == "confirm_tube" and self.in_phase >= 12:
            if aw.capno_shape == "none":
                self.say("No CO2 — that's esophageal. Pulling it and re-masking.")
                self.act({"type": "airway", "maneuver": "extubate"})
                self.act({"type": "airway", "maneuver": "mask_on"})
                self.act({"type": "bag", "on": True})
                self.goto("rescue_mask")
                return
            self.say(f"Tube confirmed — sustained CO2, equal breath sounds. 7.5 at 22 at the teeth.")
            self.act({"type": "volatile", "percent": 2.5})
            self.act({"type": "gas", "o2_flow": 1, "air_flow": 1})
            if not self.last.get("antibiotics"):
                self._give_prophylaxis()
            self.act({"type": "drug", "drug": "ondansetron", "dose": 4})
            self.act({"type": "drug", "drug": "dexamethasone", "dose": 8})
            self.act({"type": "warming", "on": True})
            self.say(self._abx_line() + " We're ready whenever you are; you'll want a time-out.")
            if proc is not None:
                proc.flags.add("anesthesia_ready")
            self.baseline_hr = b.hr
            self.goto("maintenance")
        elif p == "maintenance":
            self._maintain()
            if proc is not None and (proc.finished or (proc.running and proc.running.task["id"] == "close_skin")):
                self.say("Turning the sevo down for emergence.")
                self.act({"type": "volatile", "percent": 0.6})
                self.goto("closing")
        elif p == "closing":
            self._maintain(emergence=True)
            if proc is not None and proc.finished:
                self.act({"type": "volatile", "percent": 0})
                self.act({"type": "gas", "o2_flow": 8, "air_flow": 0})
                dose = 4 if eff.tof_count <= 1 else 2
                self.act({"type": "drug", "drug": "sugammadex", "dose": round(dose * c.patient.weight_kg, -1)})
                self.act({"type": "vent", "mode": "manual"})
                self.act({"type": "bag", "on": True, "rate": 8})
                self.goto("emergence")
        elif p == "emergence":
            if b.spont_ve > 0.3 * b.ve0 and m.bagging:
                self.act({"type": "bag", "on": False})
            if eff.bis > 80 and eff.tof_ratio > 0.9 and b.spont_ve > 0.5 * b.ve0 and c.face_edema >= 0.5:
                if not c._flags.get("cuff_leak_done"):
                    self.say(f"{c.patient.first_name}'s face is swollen after {c.metrics.sec_steep / 3600:.1f} hours head-down — cuff-leak test before the tube comes out.")
                    self.act({"type": "assess", "what": "cuff_leak"})
                    self.act({"type": "drug", "drug": "dexamethasone", "dose": 8})
                    self.last["leak_t"] = c.t
                elif c.face_edema >= 0.8 and c.t - self.last.get("leak_t", c.t) < 300:
                    return
            if eff.bis > 80 and eff.tof_ratio > 0.9 and b.spont_ve > 0.5 * b.ve0 and (c.face_edema < 0.5 or c._flags.get("cuff_leak_done")):
                self.say(f"{c.patient.he.capitalize()}'s awake, following commands, good tidal volumes. Extubating.")
                self.act({"type": "airway", "maneuver": "extubate"})
                self.act({"type": "airway", "maneuver": "nasal_cannula", "flow": 4})
                self.goto("done")

    def _maintain(self, emergence: bool = False) -> None:
        c = self.case
        eff, b, m = c.eff, c.body, c.machine
        if not self.every("titrate", 20):
            return
        if not emergence:
            light = eff.bis > 60 or (self.baseline_hr and b.hr > 1.25 * self.baseline_hr and c.load.stimulus > 0.3)
            if light and self.every("sevo", 90):
                ceiling = 3.5 if eff.bis > 65 else 3.0
                self.act({"type": "volatile", "percent": round(min(ceiling, m.sevo_dial + 0.3), 1)})
                if eff.opioid_eq < 1.5 and self.every("fent", 300):
                    self.act({"type": "drug", "drug": "fentanyl", "dose": 50})
            elif eff.bis < 35 and m.sevo_dial > 1.8 and self.every("sevo", 120):
                self.act({"type": "volatile", "percent": round(m.sevo_dial - 0.3, 1)})
            if eff.tof_count >= 2 and c.load.iap_mmhg > 5 and self.every("roc", 240):
                self.act({"type": "drug", "drug": "rocuronium", "dose": 20})
        if b.map < 65 and self.every("pressor", 90):
            if b.hr < 60:
                self.act({"type": "drug", "drug": "ephedrine", "dose": 10})
            else:
                self.act({"type": "drug", "drug": "phenylephrine", "dose": 100})
        if b.map < 60 and c.load.bleeding_ml_min > 0 and self.every("fluid", 300):
            self.act({"type": "fluid", "fluid": "lactated_ringers", "volume_ml": 500})
        if b.hb < 7.5 and self.every("blood", 600):
            self.act({"type": "fluid", "fluid": "prbc", "volume_ml": 300})
        if m.mode == "vcv":
            if b.etco2 > 45 and m.rr < 24:
                self.act({"type": "vent", "rr": m.rr + 2})
            elif b.etco2 < 32 and m.rr > 8:
                self.act({"type": "vent", "rr": m.rr - 2})
        if b.sao2 < 0.93 and self.every("oxygen", 60):
            self.act({"type": "gas", "o2_flow": 2, "air_flow": 0})
            self.act({"type": "vent", "peep": min(10, m.peep + 2)})
            self.act({"type": "assess", "what": "auscultate"})
