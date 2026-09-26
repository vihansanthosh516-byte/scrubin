"""Anesthesia workstation: gas delivery, vaporizer, ventilator."""

from __future__ import annotations

from dataclasses import dataclass
from math import exp

VENT_MODES = ("manual", "vcv", "pcv")


@dataclass
class Machine:
    o2_flow: float = 2.0  # L/min
    air_flow: float = 0.0
    sevo_dial: float = 0.0  # %
    mode: str = "manual"  # manual (bag / APL) | vcv | pcv
    tv_ml: float = 500.0
    rr: float = 12.0
    peep: float = 5.0
    pinsp: float = 15.0  # cmH2O above PEEP (PCV)
    ie_ratio: float = 2.0  # 1:2
    circuit_fio2: float = 0.21  # O2 fraction in the breathing circuit
    # Manual bagging by the anesthetist.
    bagging: bool = False
    bag_rate: float = 12.0
    bag_tv_ml: float = 500.0
    circuit_l: float = 6.0

    @property
    def fgf(self) -> float:
        return self.o2_flow + self.air_flow

    @property
    def fgf_fio2(self) -> float:
        if self.fgf <= 0:
            return self.circuit_fio2
        return (self.o2_flow + 0.21 * self.air_flow) / self.fgf

    def step(self, dt_s: float, patient_uptake_ml_min: float, connected: bool) -> None:
        # Circle system: circuit gas approaches fresh-gas composition with a
        # time constant of circuit volume / fresh gas flow. At very low flows
        # the patient's O2 uptake lowers circuit O2.
        dt = dt_s / 60.0
        if self.fgf > 0:
            k = self.fgf / self.circuit_l
            self.circuit_fio2 += (self.fgf_fio2 - self.circuit_fio2) * (1.0 - exp(-k * dt))
        if connected and self.fgf < 1.0:
            self.circuit_fio2 -= patient_uptake_ml_min / 1000.0 / self.circuit_l * dt * (1.0 - self.fgf)
        self.circuit_fio2 = max(0.05, min(1.0, self.circuit_fio2))

    def snapshot(self) -> dict:
        return {
            "o2_flow": self.o2_flow,
            "air_flow": self.air_flow,
            "fgf": round(self.fgf, 2),
            "sevo_dial": self.sevo_dial,
            "mode": self.mode,
            "tv_ml": self.tv_ml,
            "rr": self.rr,
            "peep": self.peep,
            "pinsp": self.pinsp,
            "ie_ratio": self.ie_ratio,
            "circuit_fio2": round(self.circuit_fio2, 3),
            "bagging": self.bagging,
        }
