"""Airway: devices, patency, mask seal, laryngoscopy, and ventilation delivery.

The airway decides how much of the patient's own drive and the machine's
breaths actually become alveolar ventilation. Several outcomes are hidden
from the trainee and must be *detected* (as in real life):
  - esophageal intubation (look at the capnogram!)
  - right mainstem intubation (asymmetric breath sounds, rising pressures)
  - difficult laryngoscopy grade (only known once you look)
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field

from ..physiology.body import Ventilation
from ..physiology.pharmacology import Effects
from .machine import Machine

DEVICES = ("none", "nasal_cannula", "face_mask", "lma", "ett")
LARYNGOSCOPES = ("mac3", "mac4", "miller2", "video")


@dataclass
class IntubationAttempt:
    device: str
    bougie: bool
    tube_size: float
    depth_cm: float
    remaining_s: float
    grade: int


@dataclass
class Airway:
    cormack_lehane: int  # hidden true grade with a Macintosh blade
    difficult_mask: bool  # hidden
    rng: random.Random
    device: str = "none"
    cannula_flow: float = 0.0
    mask_on: bool = False  # face mask applied (device == face_mask)
    oral_airway: bool = False
    nasal_airway: bool = False
    jaw_thrust: bool = False
    two_hand_mask: bool = False
    cricoid: bool = False
    ett_location: str = ""  # trachea | esophagus | right_mainstem (hidden)
    ett_depth_cm: float = 0.0
    ett_size: float = 0.0
    cuff_inflated: bool = False
    lma_size: int = 0
    laryngospasm: bool = False
    bronchospasm: float = 0.0  # 0..1 severity
    attempt: IntubationAttempt | None = None
    attempts: int = 0
    last_view: int | None = None  # grade the trainee actually saw
    compliance: float = 45.0  # ml/cmH2O, respiratory system
    resistance: float = 8.0  # cmH2O/L/s
    events: list[dict] = field(default_factory=list)
    # outputs
    peak_pressure: float = 0.0
    plateau_pressure: float = 0.0
    capnography: bool = False
    capno_shape: str = "none"
    breath_sounds: str = "normal"
    gastric_insufflation_ml_min: float = 0.0
    delivered_tv: float = 0.0
    delivered_rr: float = 0.0
    obstruction: float = 0.0
    connected_to_circuit: bool = False
    esophageal_breaths: int = 0

    # ---------------- actions ------------------------------------------

    def emit(self, kind: str, **data) -> None:
        self.events.append({"kind": kind, **data})

    def start_intubation(self, laryngoscope: str, bougie: bool, tube_size: float, depth_cm: float, eff: Effects) -> None:
        grade = self.cormack_lehane
        if laryngoscope == "video":
            grade = max(1, grade - 1)
        elif laryngoscope == "miller2" and grade >= 3:
            grade = grade  # no help for this anatomy
        self.attempt = IntubationAttempt(laryngoscope, bougie, tube_size, depth_cm, remaining_s=25.0 + 10.0 * (grade - 1), grade=grade)
        self.attempts += 1
        # Laryngoscopy removes the mask; no ventilation during the attempt.
        self.device = "none"
        self.mask_on = False
        self.jaw_thrust = False

    def _finish_intubation(self, eff: Effects) -> None:
        a = self.attempt
        assert a is not None
        self.attempt = None
        self.last_view = a.grade
        # Patient not deep / not relaxed: gag, cough, laryngospasm.
        if eff.bis > 70:
            self.emit("intubation_failed", reason="patient_awake", view=a.grade)
            if eff.nmb_t1 > 0.3:
                self.laryngospasm = self.rng.random() < 0.6
            return
        if eff.nmb_t1 > 0.5 and eff.tof_count >= 3:
            # Vocal cords moving, jaw tight.
            if self.rng.random() < 0.6:
                self.emit("intubation_failed", reason="not_relaxed", view=a.grade)
                if self.rng.random() < 0.3:
                    self.laryngospasm = True
                return
        p_fail = {1: 0.02, 2: 0.08, 3: 0.45, 4: 0.85}[a.grade]
        p_esoph = {1: 0.005, 2: 0.03, 3: 0.12, 4: 0.2}[a.grade]
        if a.bougie and a.grade >= 3:
            p_fail *= 0.4
            p_esoph *= 0.3
        if a.device == "video":
            p_esoph *= 0.4
        r = self.rng.random()
        if r < p_fail:
            self.emit("intubation_failed", reason="no_view", view=a.grade)
            return
        self.device = "ett"
        self.ett_size = a.tube_size
        self.ett_depth_cm = a.depth_cm
        self.cuff_inflated = True
        if self.rng.random() < p_esoph:
            self.ett_location = "esophagus"
        else:
            self.ett_location = "right_mainstem" if a.depth_cm >= 25.0 else "trachea"
        self.esophageal_breaths = 0
        self.emit("tube_placed", view=a.grade, depth_cm=a.depth_cm)

    def insert_lma(self, size: int, eff: Effects) -> None:
        if eff.bis > 60 or eff.airway_tone > 0.6:
            self.emit("lma_failed", reason="too_light")
            if self.rng.random() < 0.35:
                self.laryngospasm = True
            return
        self.device = "lma"
        self.lma_size = size
        self.mask_on = False
        self.emit("lma_placed", size=size)

    def reposition_tube(self, depth_cm: float) -> None:
        if self.device != "ett":
            return
        self.ett_depth_cm = depth_cm
        if self.ett_location in ("trachea", "right_mainstem"):
            self.ett_location = "right_mainstem" if depth_cm >= 25.0 else "trachea"

    def remove_device(self) -> str:
        prev = self.device
        self.device = "none"
        self.ett_location = ""
        self.cuff_inflated = False
        self.lma_size = 0
        self.mask_on = False
        return prev

    def apply_mask(self) -> None:
        if self.device in ("ett", "lma"):
            return
        self.device = "face_mask"
        self.mask_on = True

    # ---------------- per-step delivery --------------------------------

    def deliver(self, dt_s: float, spont_ve: float, spont_rr: float, eff: Effects, machine: Machine, vd_anat_ml: float, iap: float, stim_response: float) -> Ventilation:
        v = Ventilation()
        self.events = []

        if self.attempt is not None:
            self.attempt.remaining_s -= dt_s
            if self.attempt.remaining_s <= 0:
                self._finish_intubation(eff)

        # Laryngospasm resolves when deep enough or paralysed.
        if self.laryngospasm and (eff.airway_tone < 0.2 or eff.bis < 45):
            self.laryngospasm = False
            self.emit("laryngospasm_resolved")
        if self.bronchospasm > 0:
            self.bronchospasm = max(0.0, self.bronchospasm - dt_s / 900.0 * (1.0 + 2.0 * min(1.0, eff.sevo_mac)))

        # Upper-airway patency for an unprotected airway.
        support = 0.55 * self.jaw_thrust + 0.45 * self.oral_airway + 0.35 * self.nasal_airway
        tone = eff.airway_tone
        if self.difficult_mask:
            support *= 0.7
        patency_unprotected = min(1.0, tone + support) if eff.bis < 80 else 1.0
        self.obstruction = 1.0 - patency_unprotected

        compliance = self.compliance * (1.0 - 0.018 * max(0.0, iap)) * (0.6 if self.ett_location == "right_mainstem" and self.device == "ett" else 1.0)
        compliance = max(12.0, compliance)
        resistance = self.resistance * (1.0 + 5.0 * self.bronchospasm) + (4.0 if self.device == "ett" and self.ett_size and self.ett_size < 7.0 else 0.0)

        # --- sources of ventilation ----------------------------------
        mech_tv = 0.0
        mech_rr = 0.0
        on_circuit = False
        seal = 1.0
        vd = vd_anat_ml
        patency = 1.0
        delivers_to_lungs = True
        v.source_fio2 = 0.21
        v.fio2 = 0.21

        if self.device == "none":
            patency = patency_unprotected
        elif self.device == "nasal_cannula":
            patency = patency_unprotected
            v.fio2 = min(0.5, 0.21 + 0.03 * self.cannula_flow)
            v.source_fio2 = v.fio2
            v.airway_open_to_o2 = self.cannula_flow >= 10 and patency > 0.4
        elif self.device == "face_mask":
            on_circuit = True
            seal = (0.98 if self.two_hand_mask else 0.93) * (0.6 if self.difficult_mask else 1.0)
            if self.cricoid:
                seal *= 0.9
            patency = patency_unprotected if spont_ve > 0 else min(1.0, patency_unprotected + 0.3)
            vd += 80.0
            v.airway_open_to_o2 = patency > 0.5 and seal > 0.6
        elif self.device == "lma":
            on_circuit = True
            seal = 0.95
            vd = 0.6 * vd_anat_ml + 40.0
            v.airway_open_to_o2 = True
        elif self.device == "ett":
            on_circuit = True
            seal = 1.0 if self.cuff_inflated else 0.7
            vd = 0.5 * vd_anat_ml + 30.0
            if self.ett_location == "esophagus":
                delivers_to_lungs = False
            v.airway_open_to_o2 = delivers_to_lungs

        if self.laryngospasm and self.device != "ett":
            patency = 0.0
            v.airway_open_to_o2 = False

        # Positive-pressure breaths.
        ppv_active = on_circuit and (machine.mode in ("vcv", "pcv") or machine.bagging)
        if ppv_active:
            if machine.mode == "vcv":
                mech_tv, mech_rr = machine.tv_ml, machine.rr
            elif machine.mode == "pcv":
                mech_tv = machine.pinsp * compliance * (1.0 - 0.3 * self.bronchospasm)
                mech_rr = machine.rr
            else:
                mech_tv, mech_rr = machine.bag_tv_ml, machine.bag_rate
            peak_limit = 25.0 if self.device == "lma" else 60.0
            peak = machine.peep + mech_tv / compliance + resistance * (mech_tv / 1000.0) / 1.0
            leak = 0.0
            if self.device == "face_mask":
                leak = 1.0 - seal * min(1.0, patency + 0.2)
                if peak > 20 and not self.cricoid:
                    self.gastric_insufflation_ml_min = (peak - 20) * 15.0 * mech_rr / 12.0
                else:
                    self.gastric_insufflation_ml_min = 0.0
            elif self.device == "lma" and peak > peak_limit:
                leak = min(0.7, (peak - peak_limit) / 20.0)
                self.gastric_insufflation_ml_min = (peak - peak_limit) * 20.0
            else:
                self.gastric_insufflation_ml_min = 0.0
            if not delivers_to_lungs:
                self.gastric_insufflation_ml_min = mech_tv * mech_rr * 0.8
                mech_tv_lungs = 0.0
            else:
                mech_tv_lungs = mech_tv * (1.0 - leak)
            if self.laryngospasm and self.device != "ett":
                mech_tv_lungs = mech_tv_lungs * 0.05
            self.peak_pressure = peak if delivers_to_lungs else 12.0
            self.plateau_pressure = machine.peep + mech_tv_lungs / compliance
            v.peep = machine.peep if self.device in ("ett", "lma") else machine.peep * 0.5
            ti = 60.0 / max(mech_rr, 1) / (1 + machine.ie_ratio)
            v.mean_paw = v.peep + (self.plateau_pressure - v.peep) * ti * mech_rr / 60.0 * 0.6
        else:
            mech_tv_lungs = 0.0
            self.peak_pressure = 0.0
            self.plateau_pressure = 0.0
            self.gastric_insufflation_ml_min = 0.0

        # Spontaneous breaths.
        spont_tv = spont_ve / spont_rr * 1000.0 if spont_rr > 0 else 0.0
        spont_tv_eff = spont_tv * patency * (1.0 if delivers_to_lungs else 0.35)
        if self.device == "face_mask":
            spont_tv_eff *= min(1.0, seal + 0.1)

        va_mech = max(0.0, mech_tv_lungs - vd) * mech_rr / 1000.0
        va_spont = max(0.0, spont_tv_eff - vd) * spont_rr / 1000.0
        if ppv_active and machine.mode in ("vcv", "pcv") and spont_rr > 0:
            # Patient breathing against the ventilator: dyssynchrony.
            va_spont *= 0.4
        v.va_l_min = va_mech + va_spont
        v.ve_l_min = (mech_tv_lungs * mech_rr + spont_tv_eff * spont_rr) / 1000.0
        v.rr = mech_rr + (spont_rr if spont_tv_eff > 50 else 0.0)
        v.tv_ml = (mech_tv_lungs * mech_rr + spont_tv_eff * spont_rr) / max(1.0, v.rr) if v.rr > 0 else 0.0
        v.spontaneous = mech_rr == 0
        self.delivered_tv = v.tv_ml
        self.delivered_rr = v.rr

        # Inspired O2 for circuit-connected airways.
        self.connected_to_circuit = on_circuit and (seal > 0.5)
        if on_circuit:
            v.source_fio2 = machine.circuit_fio2
            entrain = 1.0 - seal if self.device == "face_mask" else 0.0
            v.fio2 = machine.circuit_fio2 * (1 - entrain) + 0.21 * entrain
        if self.device == "ett" and self.ett_location == "right_mainstem":
            v.extra_shunt = 0.2
        if self.bronchospasm > 0:
            v.extra_shunt += 0.12 * self.bronchospasm
            v.va_l_min *= 1.0 - 0.6 * self.bronchospasm

        # Bucking/coughing on the tube when light and not paralysed.
        if self.device == "ett" and stim_response > 0.25 and eff.nmb_t1 > 0.3:
            self.peak_pressure += 15.0 * stim_response

        # Capnography: only on the circuit with alveolar gas flowing back.
        self.capnography = on_circuit
        if not on_circuit or v.va_l_min <= 0.05:
            self.capno_shape = "none"
        elif self.device == "ett" and self.ett_location == "esophagus":
            self.capno_shape = "none"
        elif self.bronchospasm > 0.2:
            self.capno_shape = "obstructive"
        elif ppv_active and spont_rr > 0 and eff.nmb_t1 < 0.9:
            self.capno_shape = "curare_cleft"
        else:
            self.capno_shape = "normal"

        # Breath sounds on auscultation.
        if self.device == "ett" and self.ett_location == "esophagus":
            self.breath_sounds = "absent_bilaterally_gurgling_over_stomach"
        elif self.device == "ett" and self.ett_location == "right_mainstem":
            self.breath_sounds = "right_only"
        elif self.bronchospasm > 0.2:
            self.breath_sounds = "wheezes"
        elif v.va_l_min <= 0.05:
            self.breath_sounds = "absent"
        elif self.obstruction > 0.5 and self.device in ("none", "face_mask", "nasal_cannula"):
            self.breath_sounds = "stridor_snoring"
        else:
            self.breath_sounds = "clear_bilaterally"
        return v

    def snapshot(self, reveal: bool = False) -> dict:
        d = {
            "device": self.device,
            "cannula_flow": self.cannula_flow,
            "oral_airway": self.oral_airway,
            "nasal_airway": self.nasal_airway,
            "jaw_thrust": self.jaw_thrust,
            "two_hand_mask": self.two_hand_mask,
            "cricoid": self.cricoid,
            "ett_depth_cm": self.ett_depth_cm,
            "ett_size": self.ett_size,
            "cuff_inflated": self.cuff_inflated,
            "lma_size": self.lma_size,
            "intubating": self.attempt is not None,
            "intubation_remaining_s": round(self.attempt.remaining_s, 1) if self.attempt else 0,
            "attempts": self.attempts,
            "last_view": self.last_view,
            "peak_pressure": round(self.peak_pressure, 1),
            "plateau_pressure": round(self.plateau_pressure, 1),
            "delivered_tv": round(self.delivered_tv),
            "delivered_rr": round(self.delivered_rr, 1),
            "capno_shape": self.capno_shape,
        }
        if reveal:
            d.update(
                ett_location=self.ett_location,
                cormack_lehane=self.cormack_lehane,
                difficult_mask=self.difficult_mask,
                laryngospasm=self.laryngospasm,
                bronchospasm=round(self.bronchospasm, 2),
            )
        return d
