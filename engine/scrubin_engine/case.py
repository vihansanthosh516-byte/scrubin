"""A single simulated case: patient, OR team, equipment, clock and event log.

`Case` is fully deterministic: given the same scenario, role, seed and the
same actions applied at the same ticks, it produces an identical trajectory.
The real-time runner (session.py) owns wall-clock pacing; this class only
knows simulated time.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Optional

from . import actions as A
from .anesthesia.airway import Airway
from .anesthesia.machine import Machine
from .monitors import Monitors
from .patient import PatientSpec
from .physiology.body import Body, SurgicalLoad
from .physiology.drugs import DRUGS, DrugDef
from .physiology.pharmacology import Pharmacology

DT = 0.5  # seconds of simulated time per tick

TEAM_NAMES = {
    "anesthesia": "Dr. Okafor (anesthesia)",
    "surgeon": "Dr. Lindqvist (surgeon)",
    "circulator": "Jess (circulating RN)",
    "scrub": "Tomás (scrub tech)",
    "patient": "Patient",
    "attending": "Dr. Okafor (attending)",
    "system": "System",
}

ANESTHESIA_ACTIONS = {"drug", "infusion", "volatile", "gas", "vent", "bag", "airway", "fluid", "monitor", "cpr", "defibrillate", "warming"}


@dataclass
class Stimulus:
    intensity: float
    remaining_s: float
    source: str


@dataclass
class Metrics:
    seconds: float = 0.0
    sec_map_low: float = 0.0  # MAP < 65
    sec_map_very_low: float = 0.0  # MAP < 55
    sec_spo2_low: float = 0.0  # SaO2 < 90%
    sec_spo2_crit: float = 0.0  # SaO2 < 80%
    sec_hr_high: float = 0.0  # HR > 120
    sec_awareness_risk: float = 0.0  # paralysed and BIS > 70
    sec_too_deep: float = 0.0  # BIS < 30
    sec_hypercarbia: float = 0.0  # PaCO2 > 55
    sec_surgery_light: float = 0.0  # stimulated & moving
    min_spo2: float = 1.0
    min_map: float = 999.0
    max_hr: float = 0.0
    max_etco2: float = 0.0
    antibiotic_t: Optional[float] = None
    incision_t: Optional[float] = None
    time_out_t: Optional[float] = None
    intubation_attempts: int = 0
    esophageal_unrecognized_s: float = 0.0
    patient_movements: int = 0

    def public(self) -> dict:
        return {k: (round(v, 3) if isinstance(v, float) else v) for k, v in self.__dict__.items()}


class Case:
    def __init__(self, scenario: dict, role: str = "anesthesia", seed: int = 1, procedure_factory=None, autopilot_factory=None):
        assert role in ("anesthesia", "surgeon")
        self.scenario_id = scenario["id"]
        self.scenario = scenario
        self.role = role
        self.seed = seed
        self.rng = random.Random(seed)
        self.patient: PatientSpec = scenario["build_patient"](self.rng)
        h = self.patient.hidden
        self.pharm = Pharmacology(self.patient)
        self.body = Body(self.patient)
        self.machine = Machine()
        self.airway = Airway(
            cormack_lehane=h.get("cormack_lehane", 1),
            difficult_mask=h.get("difficult_mask", False),
            rng=random.Random(self.rng.random()),
        )
        self.monitors = Monitors()
        self.t = 0.0
        self.tick = 0
        self.log: list[dict] = []  # actions applied, with tick (replay source)
        self.events: list[dict] = []  # timeline
        self.comms: list[dict] = []
        self.pending: Optional[dict] = None
        self.infusions: dict[str, dict] = {}
        self.stimuli: list[Stimulus] = []
        self.position = "supine"
        self.warming = False
        self.status = "pre_induction"
        self.outcome: Optional[str] = None
        self.metrics = Metrics()
        self.trend: list[dict] = []
        self.load = SurgicalLoad()
        self.anaphylaxis = 0.0
        self.aspirated = 0.0
        self._comms_seq = 0
        self._alarm_cooldown: dict[str, float] = {}
        self._flags: dict[str, Any] = {}
        self.eff = self.pharm.effects()
        self.stim_response = 0.0
        self.procedure = procedure_factory(self) if procedure_factory else None
        self.autopilot = autopilot_factory(self) if autopilot_factory else None
        self.say("circulator", f"{self.patient.name} is in the room. Name and date of birth confirmed, consent signed.")

    # ------------------------------------------------------------------
    # communication & events
    # ------------------------------------------------------------------

    def say(self, who: str, text: str, kind: str = "speech") -> None:
        self._comms_seq += 1
        self.comms.append({"id": self._comms_seq, "t": round(self.t, 1), "from": who, "name": TEAM_NAMES.get(who, who), "text": text, "kind": kind})

    def record_say(self, who: str, text: str, kind: str = "speech") -> None:
        """Speech that isn't produced by the deterministic engine (the trainee's words,
        LLM replies). Logged so replays show the full conversation."""
        self.log.append({"tick": self.tick, "comms": {"from": who, "text": text, "kind": kind}})
        self.say(who, text, kind)

    def event(self, kind: str, **data) -> None:
        self.events.append({"t": round(self.t, 1), "kind": kind, **data})

    # ------------------------------------------------------------------
    # actions
    # ------------------------------------------------------------------

    def submit(self, action) -> dict:
        """Apply an action now (at the current tick) and record it for replay."""
        if isinstance(action, dict):
            action = A.parse_action(action)
        self.log.append({"tick": self.tick, "action": action.model_dump(exclude_none=True)})
        return self._apply(action)

    def _apply(self, act, confirmed: bool = False) -> dict:
        kind = act.type
        # Role routing: a surgeon's anesthesia orders go to the anesthesia agent.
        performer = act.actor
        if self.role == "surgeon" and kind in ANESTHESIA_ACTIONS and act.actor == "trainee":
            # The AI anesthesiologist owns the anesthetic: it decides and doses.
            # The surgeon can still help run a code.
            if self.autopilot is not None and kind not in ("cpr", "defibrillate"):
                return self.autopilot.request(act)
            performer = "anesthesia"
        handler = getattr(self, f"_do_{kind}")
        if kind == "confirm":
            return handler(act)
        if kind == "drug" and not confirmed:
            check = self._check_drug(act)
            if check:
                return check
        if kind == "surgical":
            return handler(act, performer, confirmed) or {"ok": True}
        self._confirmed = confirmed
        result = handler(act, performer) if kind != "say" else handler(act)
        return result or {"ok": True}

    def _ask_confirm(self, act, who: str, text: str) -> dict:
        self.pending = {"action": act.model_dump(exclude_none=True), "from": who, "question": text}
        self.say(who, text, kind="question")
        return {"ok": False, "needs_confirmation": True, "question": text}

    def _do_confirm(self, act: A.Confirm) -> dict:
        if not self.pending:
            if not act.accept:
                self.say("circulator", "Okay.")
            return {"ok": True, "nothing_pending": True}
        pending = self.pending
        self.pending = None
        if not act.accept:
            self.say(pending["from"], "Okay, holding that.")
            return {"ok": True, "cancelled": True}
        return self._apply(A.parse_action(pending["action"]), confirmed=True)

    # --- drugs ------------------------------------------------------

    def _resolve_dose(self, d: DrugDef, dose: float, unit: Optional[str]) -> float:
        unit = (unit or d.unit).lower().replace(" ", "")
        w = self.patient.weight_kg
        factor = {"mg": 1.0, "mcg": 1e-3, "ug": 1e-3, "g": 1e3, "mg/kg": w, "mcg/kg": w * 1e-3, "g/kg": w * 1e3}.get(unit)
        if factor is None:
            factor = 1.0 if unit == d.unit else {"mg": 1.0, "mcg": 1e-3, "g": 1e3}.get(d.unit, 1.0)
        in_mg = dose * factor
        return in_mg / {"mg": 1.0, "mcg": 1e-3, "g": 1e3}[d.unit]

    def _check_drug(self, act: A.GiveDrug) -> Optional[dict]:
        d = DRUGS.get(act.drug)
        who = "anesthesia" if self.role == "surgeon" else "attending"
        if d is None:
            self.say(who if self.role == "surgeon" else "circulator", f"We don't have '{act.drug}' available.")
            return {"ok": False, "error": "unknown drug"}
        if act.dose is None:
            q = f"How much {d.name.lower()} do you want?"
            self.say(who if self.role == "surgeon" else "circulator", q, kind="question")
            return {"ok": False, "needs_clarification": True, "question": q}
        amount = self._resolve_dose(d, act.dose, act.unit)
        lo, hi = d.usual_range(self.patient)
        if hi > 0 and amount > 1.6 * hi:
            per_kg = amount / self.patient.weight_kg
            per_kg_s = f"{per_kg:.0f}" if per_kg >= 10 else f"{per_kg:.2g}"
            return self._ask_confirm(act, who, f"{self._fmt(amount, d.unit)} of {d.name.lower()}? That's {per_kg_s} {d.unit}/kg — well above the usual {self._fmt(lo, d.unit)}–{self._fmt(hi, d.unit)}. Are you sure?")
        if lo > 0 and amount < 0.2 * lo:
            return self._ask_confirm(act, who, f"Just {self._fmt(amount, d.unit)} of {d.name.lower()}? Usual is {self._fmt(lo, d.unit)}–{self._fmt(hi, d.unit)}. Confirm?")
        if "penicillin" in d.tags and any("penicillin" in a for a in self.patient.allergies):
            return self._ask_confirm(act, "circulator", f"Heads up — he has a penicillin allergy listed. Still want {d.name}?")
        return None

    @staticmethod
    def _fmt(amount: float, unit: str) -> str:
        if amount >= 100:
            s = f"{amount:.0f}"
        elif amount >= 10:
            s = f"{amount:.0f}"
        else:
            s = f"{amount:.3g}"
        return f"{s} {unit}"

    def _do_drug(self, act: A.GiveDrug, performer: str) -> dict:
        d = DRUGS[act.drug]
        amount = self._resolve_dose(d, act.dose or 0.0, act.unit)
        if d.drug_class == "hypnotic" and d.id == "propofol" and "induction" not in self._flags:
            self._flags["induction"] = {"t": self.t, "fao2": round(self.body.lung_o2_ml / max(300.0, self.body.frc), 3),
                                        "monitors": sorted(self.monitors.attached), "stomach_air_ml": round(self.body.stomach_air_ml)}
        self.pharm.give(d.id, amount)
        self.event("drug", drug=d.id, amount=round(amount, 3), unit=d.unit, by=performer)
        if performer != "trainee":
            self.say(performer, f"{d.name} {self._fmt(amount, d.unit)} is in.")
        if d.drug_class == "antibiotic" and self.metrics.antibiotic_t is None:
            self.metrics.antibiotic_t = self.t
        if "penicillin" in d.tags and any("penicillin" in a for a in self.patient.allergies):
            self._flags["anaphylaxis_onset"] = self.t + 180.0
        if d.id == "succinylcholine" and self.patient.hidden.get("mh_susceptible"):
            self._flags["mh"] = self.t
        return {"ok": True, "amount": amount, "unit": d.unit}

    def _do_infusion(self, act: A.Infusion, performer: str) -> dict:
        d = DRUGS.get(act.drug)
        if d is None or d.pk is None:
            return {"ok": False, "error": "not available as an infusion"}
        if act.stop or not act.rate:
            self.pharm.set_infusion(d.id, 0.0)
            self.infusions.pop(d.id, None)
            self.event("infusion", drug=d.id, rate=0)
            if performer != "trainee":
                self.say(performer, f"{d.name} infusion off.")
            return {"ok": True}
        unit = (act.unit or d.infusion_unit or f"{d.unit}/min").lower().replace(" ", "")
        w = self.patient.weight_kg
        per_min_mg = {
            "mcg/kg/min": act.rate * w * 1e-3,
            "mg/kg/h": act.rate * w / 60.0,
            "mcg/kg/h": act.rate * w * 1e-3 / 60.0,
            "mcg/min": act.rate * 1e-3,
            "mg/min": act.rate,
            "mg/h": act.rate / 60.0,
            "mcg/h": act.rate * 1e-3 / 60.0,
        }.get(unit)
        if per_min_mg is None:
            return {"ok": False, "error": f"unknown infusion unit {unit}"}
        amount_per_min = per_min_mg / {"mg": 1.0, "mcg": 1e-3, "g": 1e3}[d.unit]
        self.pharm.set_infusion(d.id, amount_per_min)
        self.infusions[d.id] = {"rate": act.rate, "unit": unit}
        self.event("infusion", drug=d.id, rate=act.rate, unit=unit)
        if performer != "trainee":
            self.say(performer, f"{d.name} running at {act.rate:g} {unit}.")
        return {"ok": True}

    def _do_volatile(self, act: A.Volatile, performer: str) -> dict:
        self.machine.sevo_dial = max(0.0, min(8.0, act.percent))
        self.event("volatile", percent=self.machine.sevo_dial)
        if performer != "trainee":
            self.say(performer, f"Sevo at {self.machine.sevo_dial:g} percent.")
        return {"ok": True}

    def _do_gas(self, act: A.Gas, performer: str) -> dict:
        if act.o2_flow is not None:
            self.machine.o2_flow = max(0.0, min(15.0, act.o2_flow))
        if act.air_flow is not None:
            self.machine.air_flow = max(0.0, min(15.0, act.air_flow))
        self.event("gas", o2=self.machine.o2_flow, air=self.machine.air_flow)
        return {"ok": True}

    def _do_vent(self, act: A.Vent, performer: str) -> dict:
        m = self.machine
        for k in ("mode", "tv_ml", "rr", "peep", "pinsp", "ie_ratio"):
            v = getattr(act, k)
            if v is not None:
                setattr(m, k, v)
        if act.mode in ("vcv", "pcv"):
            m.bagging = False
        self.event("vent", **m.snapshot())
        if performer != "trainee":
            self.say(performer, f"Ventilator {m.mode.upper()}, {m.tv_ml:.0f} by {m.rr:.0f}, PEEP {m.peep:.0f}.")
        return {"ok": True}

    def _do_bag(self, act: A.Bag, performer: str) -> dict:
        self.machine.bagging = act.on
        if act.on:
            self.machine.mode = "manual"
        if act.rate:
            self.machine.bag_rate = act.rate
        if act.tv_ml:
            self.machine.bag_tv_ml = act.tv_ml
        self.event("bag", on=act.on)
        return {"ok": True}

    def _do_airway(self, act: A.AirwayAction, performer: str) -> dict:
        aw = self.airway
        m = act.maneuver
        eff = self.eff
        if aw.attempt is not None and m not in ("mask_on",):
            if performer == "trainee":
                self.say("system", f"Still on laryngoscopy — about {max(1, round(aw.attempt.remaining_s))} s to go.", kind="sign")
            return {"ok": False, "error": "laryngoscopy in progress"}
        if m == "mask_on":
            aw.attempt = None
            aw.apply_mask()
        elif m == "mask_off":
            if aw.device == "face_mask":
                aw.device = "none"
                aw.mask_on = False
            self.machine.bagging = False
        elif m == "jaw_thrust_on":
            aw.jaw_thrust = True
        elif m == "jaw_thrust_off":
            aw.jaw_thrust = False
        elif m == "oral_airway":
            if eff.bis > 75:
                self.say("patient", "*gags and coughs*", kind="sign")
                self.stimuli.append(Stimulus(0.4, 5, "gag"))
                return {"ok": False, "error": "patient gags"}
            aw.oral_airway = True
        elif m == "nasal_airway":
            aw.nasal_airway = True
        elif m == "remove_adjuncts":
            aw.oral_airway = aw.nasal_airway = False
        elif m == "two_hand_mask_on":
            aw.two_hand_mask = True
        elif m == "two_hand_mask_off":
            aw.two_hand_mask = False
        elif m == "cricoid_on":
            aw.cricoid = True
        elif m == "cricoid_off":
            aw.cricoid = False
        elif m == "nasal_cannula":
            if aw.device in ("none", "nasal_cannula", "face_mask"):
                aw.device = "nasal_cannula" if aw.device != "face_mask" else aw.device
                aw.cannula_flow = act.flow if act.flow is not None else 4.0
        elif m == "intubate":
            self.metrics.intubation_attempts += 1
            aw.start_intubation(act.laryngoscope or "mac4", bool(act.bougie), act.tube_size or 7.5, act.depth_cm or 22.0, eff)
            self.machine.bagging = False
            self.event("laryngoscopy", laryngoscope=act.laryngoscope or "mac4", attempt=aw.attempts)
            if performer != "trainee":
                self.say(performer, "Going in with the laryngoscope.")
            else:
                self.say("system", f"Laryngoscope in — about {round(aw.attempt.remaining_s)} s to view the cords and pass the tube. No ventilation meanwhile.", kind="sign")
        elif m == "lma":
            aw.insert_lma(act.lma_size or 5, eff)
        elif m in ("extubate", "remove_lma"):
            unsafe = eff.tof_ratio < 0.9 or eff.bis < 70
            if performer == "trainee" and unsafe and not getattr(self, "_confirmed", False):
                why = []
                if eff.tof_ratio < 0.9:
                    why.append(f"still paralysed (TOF ratio {eff.tof_ratio:.2f})")
                if eff.bis < 70:
                    why.append(f"still deeply asleep (BIS {round(eff.bis)})")
                return self._ask_confirm(act, "attending", f"Hold on — he's {' and '.join(why)}. Pull the tube anyway?")
            prev = aw.remove_device()
            self.machine.mode = "manual"
            self.machine.bagging = False
            self.event("extubation", device=prev, bis=round(eff.bis), tof_ratio=round(eff.tof_ratio, 2), tof_count=eff.tof_count)
            if 55 < eff.bis < 80 and self.rng.random() < 0.4:
                aw.laryngospasm = True
            if performer != "trainee":
                self.say(performer, "Tube's out.")
        elif m == "reposition_tube":
            aw.reposition_tube(act.depth_cm or 22.0)
            self.event("tube_repositioned", depth_cm=aw.ett_depth_cm)
        elif m == "suction":
            self.stimuli.append(Stimulus(0.5, 6, "suction"))
        return {"ok": True}

    def _do_fluid(self, act: A.Fluid, performer: str) -> dict:
        vol = max(0.0, min(3000.0, act.volume_ml))
        self._flags.setdefault("fluid_queue", []).append({"fluid": act.fluid, "remaining": vol, "rate_ml_min": 100.0 if act.fluid != "prbc" else 50.0})
        self.event("fluid", fluid=act.fluid, volume_ml=vol)
        if performer != "trainee" or act.fluid == "prbc":
            self.say("circulator" if act.fluid == "prbc" else performer, f"{vol:.0f} mL {act.fluid.replace('_', ' ')} hanging, running wide open." if act.fluid != "prbc" else f"Checking a unit of O-positive with you now… {vol:.0f} mL PRBC running.")
        return {"ok": True}

    def _do_monitor(self, act: A.Monitor, performer: str) -> dict:
        added = self.monitors.attach(act.attach)
        self.monitors.detach(act.detach)
        if act.nibp_interval_s is not None:
            self.monitors.nibp_interval_s = act.nibp_interval_s
        if act.cycle_nibp:
            self.monitors.cycle_nibp()
        if added:
            self.event("monitors", attached=added)
        return {"ok": True, "attached": added}

    def _do_assess(self, act: A.Assess, performer: str) -> dict:
        w = act.what
        aw, b, eff = self.airway, self.body, self.eff
        self.event("assess", what=w, by=performer)
        if w == "auscultate":
            txt = {
                "absent_bilaterally_gurgling_over_stomach": "No breath sounds on either side. Gurgling over the epigastrium.",
                "right_only": "Good breath sounds on the right, markedly decreased on the left.",
                "wheezes": "Diffuse expiratory wheezes bilaterally.",
                "absent": "No air movement heard.",
                "stridor_snoring": "Snoring, obstructed breathing — high-pitched inspiratory noise.",
                "clear_bilaterally": "Equal, clear breath sounds bilaterally.",
            }[aw.breath_sounds]
            if aw.laryngospasm:
                txt = "High-pitched stridor, then silence. Chest is heaving but no air is moving."
            self.say("system", f"You listen: {txt}", kind="finding")
            return {"ok": True, "finding": txt}
        if w == "check_tof":
            if "tof" not in self.monitors.attached:
                self.monitors.attach(["tof"])
            r = self.monitors.check_tof(eff)
            txt = f"Train-of-four: {r['count']} twitch{'es' if r['count'] != 1 else ''}" + (f", ratio {r['ratio']:.2f}" if r["ratio"] is not None else "")
            self.say("system", txt, kind="finding")
            return {"ok": True, "finding": r}
        if w == "check_capnogram" and not self._flags.get("capno_now"):
            # Watch a few breaths before calling it, like a real anesthetist.
            self._flags["capno_check_at"] = self.t + 8.0
            return {"ok": True, "pending_s": 8}
        if w == "check_capnogram":
            shape = aw.capno_shape
            txt = {
                "none": "No CO2 waveform." + (" The tube may not be in the trachea." if aw.device == "ett" else ""),
                "normal": f"Square-wave capnogram, EtCO2 {b.etco2:.0f}.",
                "obstructive": "Shark-fin capnogram with upsloping plateau — obstructive pattern.",
                "curare_cleft": "Notch in the plateau — patient is making spontaneous efforts (curare cleft).",
            }[shape] if aw.capnography else "No capnography connected."
            self.say("system", txt, kind="finding")
            return {"ok": True, "finding": txt}
        if w == "look":
            parts = []
            if eff.consciousness == "awake":
                parts.append("awake and talking" if b.sao2 > 0.85 else "awake, agitated and confused")
            elif eff.consciousness == "sedated":
                parts.append("drowsy, rousable to voice")
            else:
                parts.append("unresponsive")
            if b.sao2 < 0.85:
                parts.append("cyanotic lips")
            if eff.fasciculating:
                parts.append("fasciculations across the chest and abdomen")
            if aw.obstruction > 0.5 and aw.device in ("none", "face_mask", "nasal_cannula") and b.spont_ve > 0:
                parts.append("paradoxical chest-abdomen movement (obstruction)")
            if b.stomach_air_ml > 500:
                parts.append("distended epigastrium")
            if self.anaphylaxis > 0.2:
                parts.append("flushed skin with raised urticarial welts")
            if b.movement > 0.25:
                parts.append("moving / bucking")
            self.say("system", "The patient is " + ", ".join(parts) + ".", kind="finding")
            return {"ok": True}
        if w == "check_abg":
            txt = f"ABG: pH {7.40 - 0.008 * (b.paco2 - 40):.2f}, PaCO2 {b.paco2:.0f}, PaO2 {b.pao2:.0f}, Hb {b.hb:.1f}, lactate {1.0 + b.o2_debt_ml / 400:.1f}"
            self._flags["abg_pending"] = (self.t + 90.0, txt)
            self.say("circulator", "ABG sent, results in about 90 seconds.")
            return {"ok": True}
        if w == "check_airway_pressure":
            self.say("system", f"Peak {aw.peak_pressure:.0f}, plateau {aw.plateau_pressure:.0f} cmH2O, delivered VT {aw.delivered_tv:.0f} mL.", kind="finding")
            return {"ok": True}
        if w == "ask_surgeon" and self.procedure is not None:
            self.procedure.status_report()
        return {"ok": True}

    def _do_cpr(self, act: A.Cpr, performer: str) -> dict:
        self.body.cpr = act.on
        self.event("cpr", on=act.on)
        self.say("circulator", "Starting compressions!" if act.on else "Holding compressions.")
        return {"ok": True}

    def _do_defibrillate(self, act: A.Defibrillate, performer: str) -> dict:
        self.event("defibrillate", joules=act.joules)
        if self.body.rhythm == "vf" and self.rng.random() < 0.6:
            self.body.rhythm = "sinus_tach"
            self.body.ischemia = 0.5
            self.say("circulator", "Shock delivered — organised rhythm!")
        else:
            self.say("circulator", "Shock delivered.")
        return {"ok": True}

    def _do_position(self, act: A.Position, performer: str) -> dict:
        self.position = act.position
        self.load.trendelenburg_deg = {"trendelenburg": 15.0, "left_side_down": 15.0, "reverse_trendelenburg": -15.0}.get(act.position, self.load.trendelenburg_deg if act.position in ("left_tilt", "right_tilt") else 0.0)
        self.event("position", position=act.position)
        self.say("circulator", "Table Trendelenburg, left side down." if act.position == "left_side_down" else f"Table {act.position.replace('_', ' ')}.")
        return {"ok": True}

    def _do_warming(self, act: A.Warming, performer: str) -> dict:
        self.warming = act.on
        self.say("circulator", "Bair Hugger on." if act.on else "Warmer off.")
        return {"ok": True}

    def _do_say(self, act: A.Say) -> dict:
        self.event("say", to=act.to, intent=act.intent, text=act.text)
        if act.intent == "time_out" and self.metrics.time_out_t is None:
            self.metrics.time_out_t = self.t
        handled = False
        if self.procedure is not None:
            handled = self.procedure.hear(act)
        if not handled and self.autopilot is not None:
            handled = self.autopilot.hear(act)
        if not handled and act.intent == "time_out":
            abx = "Antibiotics are in." if self.metrics.antibiotic_t is not None else "Antibiotics are NOT in yet."
            self.say("circulator", f"Time-out: {self.patient.name}, laparoscopic appendectomy, right side. Allergy: penicillin. {abx}")
        return {"ok": True}

    def _do_surgical(self, act: A.Surgical, performer: str, confirmed: bool = False) -> dict:
        if self.role != "surgeon":
            self.say("surgeon", "I've got the field — you focus on the patient.")
            return {"ok": False, "error": "surgical actions belong to the surgeon role"}
        if self.procedure is None:
            return {"ok": False, "error": "no procedure loaded"}
        return self.procedure.perform(act, confirmed)

    # ------------------------------------------------------------------
    # time
    # ------------------------------------------------------------------

    def step(self) -> None:
        dt = DT
        eff = self.pharm.effects()
        self.eff = eff

        # Surgical load and airway stimuli.
        if self.procedure is not None:
            self.procedure.step(dt)
        load = self.load
        load.warming = self.warming
        stim = max([s.intensity for s in self.stimuli], default=0.0)
        for s in self.stimuli:
            s.remaining_s -= dt
        self.stimuli = [s for s in self.stimuli if s.remaining_s > 0]
        aw = self.airway
        if aw.attempt is not None:
            stim = max(stim, 1.0)
        if aw.device == "ett" and aw.ett_location != "esophagus":
            stim = max(stim, 0.3)
        elif aw.device == "lma":
            stim = max(stim, 0.15)
        stim = max(stim, load.stimulus)
        self.stim_response = self.pharm.stimulus_response(stim, eff)
        if self.anaphylaxis > 0:
            eff.svr_factor *= 1.0 - 0.55 * self.anaphylaxis
            eff.venodilation += 0.25 * self.anaphylaxis

        # Ventilation.
        spont_ve, spont_rr = self.body.spontaneous_drive(eff)
        self.body.spont_ve, self.body.spont_rr = spont_ve, spont_rr
        vent = aw.deliver(dt, spont_ve, spont_rr, eff, self.machine, self.body.vd_anat, load.iap_mmhg, self.stim_response)
        vent.extra_shunt += 0.25 * self.aspirated
        self.body.stomach_air_ml += aw.gastric_insufflation_ml_min * dt / 60.0

        # Fluids running.
        queue = self._flags.get("fluid_queue", [])
        for f in queue:
            ml = min(f["remaining"], f["rate_ml_min"] * dt / 60.0)
            f["remaining"] -= ml
            self.body.give_fluid(f["fluid"], ml)
        self._flags["fluid_queue"] = [f for f in queue if f["remaining"] > 0.1]

        self.body.step(dt, eff, vent, load, self.stim_response)
        uptake = self.body.vo2_actual
        self.machine.step(dt, uptake, aw.connected_to_circuit)
        self.pharm.step(dt, self.body.co_ratio, vent.va_l_min, self.machine.fgf, self.machine.sevo_dial, self.body.frc / 1000.0, aw.connected_to_circuit)
        self.monitors.step(dt, self.t, self.body, aw, eff)

        self._complications(dt, eff)
        self._airway_events(aw.events, eff)
        self._narrate(dt, eff)
        self._accumulate(dt, eff)
        if self.autopilot is not None:
            self.autopilot.step(dt)

        if self.tick % 10 == 0:
            self._record_trend(eff)
        self.t += dt
        self.tick += 1

    def _record_trend(self, eff) -> None:
        b = self.body
        self.trend.append({
            "t": round(self.t),
            "hr": round(b.hr), "sbp": round(b.sbp), "dbp": round(b.dbp), "map": round(b.map),
            "spo2": round(b.sao2 * 100, 1), "etco2": round(b.etco2, 1), "paco2": round(b.paco2, 1),
            "bis": round(eff.bis), "mac": round(self.pharm.volatile.et_mac, 2), "tof": eff.tof_count,
            "rr": round(self.airway.delivered_rr), "temp": round(b.temp, 2), "iap": round(self.load.iap_mmhg, 1),
            "stim": round(self.load.stimulus, 2), "blood_loss": round(b.blood_loss_ml),
        })

    def run(self, seconds: float) -> None:
        for _ in range(int(round(seconds / DT))):
            self.step()

    # ------------------------------------------------------------------

    def _complications(self, dt: float, eff) -> None:
        b, aw, h = self.body, self.airway, self.patient.hidden
        onset = self._flags.get("anaphylaxis_onset")
        if onset is not None and self.t >= onset:
            if self.anaphylaxis == 0:
                self.event("complication", name="anaphylaxis")
            epi = self.pharm.ce("epinephrine")
            target = 0.9 if epi < 0.5 else 0.2
            self.anaphylaxis += (target - self.anaphylaxis) * dt / 90.0
            aw.bronchospasm = max(aw.bronchospasm, 0.6 * self.anaphylaxis)
            if epi > 1.0 and self.anaphylaxis < 0.25:
                self._flags["anaphylaxis_onset"] = None
        elif self.anaphylaxis > 0:
            self.anaphylaxis = max(0.0, self.anaphylaxis - dt / 300.0)

        # Bronchospasm on airway instrumentation in a light plane (asthmatic).
        if h.get("reactive_airway") and aw.device == "ett" and not self._flags.get("bronchospasm_checked"):
            self._flags["bronchospasm_checked"] = True
            p = 0.7 if eff.bis > 60 or eff.opioid_eq < 1.0 else 0.08
            if eff.sevo_mac > 0.8:
                p *= 0.3
            if self.rng.random() < p:
                aw.bronchospasm = 0.7
                self.event("complication", name="bronchospasm")

        # Aspiration: unprotected airway, unconscious, stomach contents/air.
        protected = aw.device == "ett" and aw.cuff_inflated and aw.ett_location != "esophagus"
        if not protected and eff.airway_tone < 0.5 and self.aspirated == 0:
            gastric = h.get("gastric_volume_ml", 40) + b.stomach_air_ml
            hazard = max(0.0, gastric - 150.0) / 150.0 * 0.002  # per second
            if aw.cricoid:
                hazard *= 0.3
            if aw.device == "lma":
                hazard *= 1.5 if self.load.iap_mmhg > 0 else 0.8
            if hazard > 0 and self.rng.random() < hazard * dt:
                self.aspirated = 0.05
                self.event("complication", name="aspiration")
                self.say("system", "You see gastric contents in the oropharynx.", kind="sign")
        if self.aspirated > 0:
            self.aspirated = min(0.8, self.aspirated + dt / 600.0)
            aw.bronchospasm = max(aw.bronchospasm, 0.3)

        capno_at = self._flags.get("capno_check_at")
        if capno_at is not None and self.t >= capno_at:
            self._flags["capno_check_at"] = None
            self._flags["capno_now"] = True
            self._do_assess(A.Assess(what="check_capnogram"), "system")
            self._flags["capno_now"] = False

        abg = self._flags.get("abg_pending")
        if abg and self.t >= abg[0]:
            self._flags["abg_pending"] = None
            self.say("circulator", abg[1])

    def _airway_events(self, events: list[dict], eff) -> None:
        for e in events:
            k = e["kind"]
            self.event(k, **{kk: vv for kk, vv in e.items() if kk != "kind"})
            speaker = "anesthesia" if self.role == "surgeon" else "system"
            if k == "tube_placed":
                self._flags["tube_t"] = self.t
                self._flags["failed_tubes"] = 0
                self._flags["das_prompt"] = False
                txt = f"Grade {e['view']} view. Tube passed, cuff up, {self.airway.ett_size:g} at {e['depth_cm']:g} cm."
                self.say(speaker, txt if speaker != "system" else f"You see a grade {e['view']} view and pass the tube. Cuff inflated at {e['depth_cm']:g} cm.", kind="finding")
            elif k == "intubation_failed":
                reason = {"patient_awake": "The patient gags and bites down — far too light.", "not_relaxed": "Jaw is tight and the cords are moving — not relaxed enough.", "no_view": f"Grade {e['view']} view — can't see the cords. Unable to pass the tube."}[e["reason"]]
                self.say(speaker, reason, kind="finding")
                self._flags["failed_tubes"] = self._flags.get("failed_tubes", 0) + 1
                if self.role == "anesthesia" and self._flags["failed_tubes"] >= 2 and not self._flags.get("das_prompt"):
                    # Difficult Airway Society: stop after repeated failures, oxygenate, get help.
                    self._flags["das_prompt"] = True
                    self.say("attending", "That's two failed attempts. Stop and oxygenate — mask with an oral airway or put in an LMA — and I'm coming in to help.")
            elif k == "lma_placed":
                self.say(speaker, f"LMA size {e['size']} in, cuff up.", kind="finding")
            elif k == "lma_failed":
                self.say(speaker, "Patient bites and coughs on the LMA — too light.", kind="finding")
            elif k == "laryngospasm_resolved":
                self.say("system", "The stridor settles; air is moving again.", kind="finding")

    def _narrate(self, dt: float, eff) -> None:
        b, aw = self.body, self.airway
        # Patient speech when awake.
        if eff.consciousness == "awake" and not self._flags.get("said_hello"):
            self._flags["said_hello"] = True
            self.say("patient", "Is this going to hurt? My stomach is killing me.")
        if eff.consciousness != "awake" and not self._flags.get("lost_consciousness"):
            self._flags["lost_consciousness"] = True
            self.event("loss_of_consciousness", bis=round(eff.bis))
            if self.status == "pre_induction":
                self.status = "anesthetized"
        if eff.fasciculating and not self._flags.get("fasc"):
            self._flags["fasc"] = True
            self.say("system", "Fasciculations ripple across the chest and abdomen.", kind="sign")
        if b.spont_ve == 0 and eff.bis < 70 and not self._flags.get("apnea_noted"):
            self._flags["apnea_noted"] = True
            self.event("apnea")
        if b.spont_ve > 0:
            self._flags["apnea_noted"] = False
        if aw.laryngospasm and not self._flags.get("ls_noted"):
            self._flags["ls_noted"] = True
            self.event("complication", name="laryngospasm")
            self.say("system", "High-pitched stridor — then silence. Chest heaving, no air movement.", kind="sign")
        if not aw.laryngospasm:
            self._flags["ls_noted"] = False
        # Team calls out important alarms (with cooldown), like a real room.
        readout = self.monitors.readout(self.t, b, aw, eff, self.machine)
        self.monitors.update_alarms(readout)
        for alarm in self.monitors.new_alarms:
            if self._alarm_cooldown.get(alarm, -1e9) + 60 > self.t:
                continue
            # The room knows a laryngoscopy (or a CO2 trace still showing) isn't
            # a lost airway — don't call "no CO2" over it.
            if alarm == "apnea" and (aw.attempt is not None or (readout.get("etco2") or 0) > 10
                                     or self.t - self._flags.get("tube_t", -1e9) < 30):
                continue
            self._alarm_cooldown[alarm] = self.t
            msg = {
                "spo2_low": f"Sats are {readout.get('spo2')}%.",
                "map_low": "Pressure's low.",
                "hr_low": f"Heart rate {readout.get('hr')}.",
                "apnea": "No CO2 on the monitor.",
                "asystole": "Asystole!",
                "pea": "I've lost the pulse!",
                "vf": "V-fib!",
            }.get(alarm)
            if msg:
                self.say("circulator", msg, kind="alarm")
        if b.movement > 0.3 and self.procedure is not None and self.load.stimulus > 0.3:
            if self._alarm_cooldown.get("movement", -1e9) + 30 < self.t:
                self._alarm_cooldown["movement"] = self.t
                self.metrics.patient_movements += 1
                self.event("patient_moved")
                self.say("surgeon", "He's moving! Can we get him deeper?")

        # Emergence complete: extubated, awake, breathing, oxygenating.
        if self.status == "emergence" and self.outcome is None:
            ok = aw.device in ("none", "nasal_cannula", "face_mask") and eff.bis > 80 and b.spont_ve > 0.4 * b.ve0 and b.sao2 > 0.92
            self._flags["pacu_s"] = self._flags.get("pacu_s", 0.0) + dt if ok else 0.0
            if self._flags["pacu_s"] >= 60:
                self.outcome = "pacu"
                self.status = "ended"
                self.event("case_complete", outcome="pacu")
                self.say("circulator", "Let's head to PACU. Nice work, everyone.")

        # Death / outcome.
        if b.rhythm in ("asystole", "pea") and not b.cpr and b.ischemia > 1.6 and self.outcome is None:
            self.outcome = "death"
            self.status = "ended"
            self.event("death")

    def _accumulate(self, dt: float, eff) -> None:
        m, b = self.metrics, self.body
        m.seconds += dt
        if b.map < 65:
            m.sec_map_low += dt
        if b.map < 55:
            m.sec_map_very_low += dt
        if b.sao2 < 0.9:
            m.sec_spo2_low += dt
        if b.sao2 < 0.8:
            m.sec_spo2_crit += dt
        if b.hr > 120:
            m.sec_hr_high += dt
        if eff.nmb_t1 < 0.2 and eff.bis > 70:
            m.sec_awareness_risk += dt
        if eff.bis < 30:
            m.sec_too_deep += dt
        if b.paco2 > 55:
            m.sec_hypercarbia += dt
        m.min_spo2 = min(m.min_spo2, b.sao2)
        m.min_map = min(m.min_map, b.map)
        m.max_hr = max(m.max_hr, b.hr)
        m.max_etco2 = max(m.max_etco2, b.etco2)
        if self.airway.device == "ett" and self.airway.ett_location == "esophagus":
            m.esophageal_unrecognized_s += dt

    # ------------------------------------------------------------------
    # views
    # ------------------------------------------------------------------

    def snapshot(self, since_comms: int = 0) -> dict:
        eff = self.eff
        readout = self.monitors.readout(self.t, self.body, self.airway, eff, self.machine)
        snap = {
            "t": round(self.t, 1),
            "tick": self.tick,
            "role": self.role,
            "status": self.status,
            "outcome": self.outcome,
            "monitor": readout,
            "alarms": list(self.monitors.active_alarms),
            "machine": self.machine.snapshot(),
            "airway": self.airway.snapshot(),
            "infusions": self.infusions,
            "position": self.position,
            "pending": self.pending,
            "comms": [c for c in self.comms if c["id"] > since_comms],
            "patient_signs": {
                "consciousness": eff.consciousness if eff.consciousness in ("awake", "sedated") else "unresponsive",
                "breathing": "apneic" if self.body.spont_ve == 0 and self.tick > 0 else ("obstructed" if self.airway.obstruction > 0.5 and self.airway.device in ("none", "face_mask", "nasal_cannula") else "breathing"),
                "moving": self.body.movement > 0.25,
                "fasciculating": eff.fasciculating,
            },
            "fluids": {"in_ml": round(self.body.fluids_in_ml), "blood_loss_ml": round(self.body.blood_loss_ml), "urine_ml": round(self.body.urine_ml)},
            "drug_log": [e for e in self.events if e["kind"] == "drug"][-30:],
        }
        if self.procedure is not None:
            snap["surgery"] = self.procedure.snapshot()
        return snap

    def truth(self) -> dict:
        """Hidden state: for debrief, tests and instructor views only."""
        return {
            "body": self.body.snapshot(),
            "effects": {k: (round(v, 3) if isinstance(v, float) else v) for k, v in self.eff.__dict__.items()},
            "pharm": self.pharm.snapshot(),
            "airway": self.airway.snapshot(reveal=True),
            "hidden": self.patient.hidden,
            "anaphylaxis": round(self.anaphylaxis, 3),
            "aspirated": round(self.aspirated, 3),
        }
