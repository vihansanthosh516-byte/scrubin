"""What the trainee can actually see.

The physiology knows the truth; the monitor shows what real devices would:
only attached monitors report, NIBP is intermittent and takes time to cycle,
pulse oximetry lags the arterial blood by 20-30 s and loses signal when
perfusion is poor, capnography needs a circuit connection.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from math import exp

MONITOR_TYPES = ("ecg", "spo2", "nibp", "etco2", "temp", "bis", "tof", "art_line")

ALARM_LIMITS = {
    "hr": (45, 130),
    "spo2": (90, 101),
    "map": (60, 120),
    "sbp": (85, 180),
    "etco2": (25, 55),
    "peak_pressure": (-1, 40),
    "temp": (35.5, 38.8),
}


@dataclass
class Monitors:
    attached: set[str] = field(default_factory=set)
    nibp_interval_s: float = 180.0
    nibp_timer_s: float = 0.0
    nibp_cycling_s: float = 0.0
    nibp_last: dict | None = None
    nibp_time: float | None = None
    spo2_buffer: deque = field(default_factory=lambda: deque(maxlen=80))
    spo2_display: float | None = None
    tof_last: dict | None = None
    active_alarms: list[str] = field(default_factory=list)
    new_alarms: list[str] = field(default_factory=list)

    def attach(self, kinds: list[str]) -> list[str]:
        added = [k for k in kinds if k in MONITOR_TYPES and k not in self.attached]
        self.attached.update(added)
        if "nibp" in added:
            self.cycle_nibp()
        return added

    def detach(self, kinds: list[str]) -> None:
        for k in kinds:
            self.attached.discard(k)

    def cycle_nibp(self) -> None:
        if "nibp" in self.attached and self.nibp_cycling_s <= 0:
            self.nibp_cycling_s = 30.0

    def step(self, dt_s: float, t: float, body, airway, eff) -> None:
        # NIBP cycling
        if "nibp" in self.attached:
            if self.nibp_cycling_s > 0:
                self.nibp_cycling_s -= dt_s
                if self.nibp_cycling_s <= 0:
                    if body.map > 25:
                        self.nibp_last = {"sbp": round(body.sbp), "dbp": round(body.dbp), "map": round(body.map)}
                    else:
                        self.nibp_last = {"sbp": None, "dbp": None, "map": None}
                    self.nibp_time = t
                    self.nibp_timer_s = 0.0
            elif self.nibp_interval_s > 0:
                self.nibp_timer_s += dt_s
                if self.nibp_timer_s >= self.nibp_interval_s:
                    self.cycle_nibp()
        # Pulse oximeter: ~20 s circulation + averaging delay.
        self.spo2_buffer.append(body.sao2)
        delayed = self.spo2_buffer[0]
        if self.spo2_display is None:
            self.spo2_display = delayed
        self.spo2_display += (delayed - self.spo2_display) * (1.0 - exp(-dt_s / 6.0))

    def check_tof(self, eff) -> dict:
        self.tof_last = {"count": eff.tof_count, "ratio": round(eff.tof_ratio, 2) if eff.tof_count == 4 else None}
        return self.tof_last

    def readout(self, t: float, body, airway, eff, machine) -> dict:
        a = self.attached
        perfused = body.co > 0.25 * body.co0 and body.map > 35
        out: dict = {"attached": sorted(a)}
        if "ecg" in a:
            out["hr"] = round(body.hr) if body.rhythm not in ("asystole", "vf") else 0
            out["rhythm"] = body.rhythm
        if "spo2" in a:
            if perfused and self.spo2_display is not None:
                out["spo2"] = round(min(100.0, self.spo2_display * 100.0))
                out["pulse_rate"] = round(body.hr)
                out["perfusion_index"] = round(max(0.1, 2.5 * body.sv / body.sv0 / max(0.5, body.svr / body.svr0)), 2)
            else:
                out["spo2"] = None
                out["perfusion_index"] = 0.0
        if "nibp" in a:
            out["nibp"] = self.nibp_last
            out["nibp_age_s"] = round(t - self.nibp_time) if self.nibp_time is not None else None
            out["nibp_cycling"] = self.nibp_cycling_s > 0
            out["nibp_interval_s"] = self.nibp_interval_s
        if "art_line" in a:
            out["art"] = {"sbp": round(body.sbp), "dbp": round(body.dbp), "map": round(body.map)}
        if "etco2" in a and airway.capnography:
            flowing = airway.capno_shape != "none"
            out["etco2"] = round(body.etco2) if flowing else 0
            out["rr"] = round(airway.delivered_rr) if flowing else 0
            out["capno_shape"] = airway.capno_shape
            out["fio2"] = round(machine.circuit_fio2 * 100)
            out["et_sevo"] = round(eff.et_sevo, 1) if flowing else None
            out["fi_sevo"] = round(eff.fi_sevo, 1)
            out["mac"] = round(eff.mac, 2) if flowing else None
        elif "etco2" in a:
            out["etco2"] = None
            out["capno_shape"] = "none"
        if "temp" in a:
            out["temp"] = round(body.temp, 1)
        if "bis" in a:
            out["bis"] = round(eff.bis) if eff.bis < 96 else 97
        if "tof" in a:
            out["tof"] = self.tof_last
        out["peak_pressure"] = round(airway.peak_pressure) if airway.device in ("ett", "lma", "face_mask") and airway.peak_pressure else None
        out["tv"] = round(airway.delivered_tv) if airway.capnography else None
        return out

    def update_alarms(self, readout: dict) -> None:
        alarms: list[str] = []

        def check(key: str, value):
            if value is None:
                return
            lo, hi = ALARM_LIMITS[key]
            if value < lo:
                alarms.append(f"{key}_low")
            elif value > hi:
                alarms.append(f"{key}_high")

        check("hr", readout.get("hr"))
        check("spo2", readout.get("spo2"))
        if readout.get("art"):
            check("map", readout["art"]["map"])
        elif readout.get("nibp") and readout["nibp"].get("map") is not None:
            check("map", readout["nibp"]["map"])
            check("sbp", readout["nibp"]["sbp"])
        if readout.get("capno_shape") not in (None,):
            if "etco2" in readout and readout.get("etco2") is not None and readout.get("capno_shape") != "none":
                check("etco2", readout.get("etco2"))
        if readout.get("etco2") == 0 and "etco2" in self.attached and readout.get("capno_shape") == "none":
            alarms.append("apnea")
        check("peak_pressure", readout.get("peak_pressure"))
        check("temp", readout.get("temp"))
        if readout.get("rhythm") in ("asystole", "vf", "pea"):
            alarms.append(readout["rhythm"])
        if "spo2" in self.attached and readout.get("spo2") is None:
            alarms.append("spo2_no_signal")
        self.new_alarms = [a for a in alarms if a not in self.active_alarms]
        self.active_alarms = alarms
