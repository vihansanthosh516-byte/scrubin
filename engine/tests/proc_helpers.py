"""Shared drivers for the per-procedure tests (surgeon role, AI-surgeon role, leak sweeps)."""

import re

from scrubin_engine.factory import build_case
from scrubin_engine.surgery import load_spec
from scrubin_engine.surgery.parse import parse_surgical

LEAK_WORDS = r"appendi|appendec|gallbladder|cholecyst|Marcus|Elena|mesoappend|cecum|cystic|hernia sac|critical view"


class Driver:
    def __init__(self, scenario_id, seed=3, other_leaks=""):
        self.sid = scenario_id
        self.spec = load_spec(scenario_id)
        self.c = build_case(scenario_id, "surgeon", seed)
        self.leaks = re.compile(LEAK_WORDS + other_leaks, re.I)
        while "anesthesia_ready" not in self.c.procedure.flags and self.c.t < 1500:
            self.c.step()
        assert "anesthesia_ready" in self.c.procedure.flags

    @property
    def proc(self):
        return self.c.procedure

    def do(self, text, confirm=False, bleed_ok=True):
        c = self.c
        a = parse_surgical(text, self.spec, c.procedure)
        assert a is not None, text
        r = c.submit(a)
        if confirm and r.get("needs_confirmation"):
            r = c.submit({"type": "confirm", "accept": True})
        while c.procedure.running is not None and c.t < 40000:
            c.step()
            if c.procedure.bleeders and c.procedure.running is None:
                break
        if c.procedure.bleeders and bleed_ok:
            c.submit(parse_surgical("clip the bleeder", self.spec, c.procedure))
            while c.procedure.running is not None:
                c.step()
        return r

    def steps(self, texts, confirm=False):
        for t in texts:
            self.do(t, confirm=confirm)

    def ask(self, text):
        return self.c.submit(parse_surgical(text, self.spec, self.proc))

    def accept(self):
        self.c.submit({"type": "confirm", "accept": True})
        while self.proc.running is not None:
            self.c.step()

    def to_pacu(self):
        c = self.c
        t0 = c.t
        while c.outcome is None and c.t - t0 < 3600:
            c.step()
        return c.outcome


def ai_surgeon_case(scenario_id, seed, position=None, weight_boost=1.0):
    """Anesthesia role with a competent hand-driven anesthetic; the AI surgeon runs the operation."""
    c = build_case(scenario_id, "anesthesia", seed)
    c.submit({"type": "monitor", "attach": ["ecg", "spo2", "nibp", "etco2", "bis"]})
    c.submit({"type": "gas", "o2_flow": 10})
    c.submit({"type": "airway", "maneuver": "mask_on"})
    c.run(180)
    for d in ({"drug": "fentanyl", "dose": 100}, {"drug": "propofol", "dose": 150}, {"drug": "rocuronium", "dose": 60}):
        c.submit({"type": "drug", **d})
    c.run(90)
    c.submit({"type": "airway", "maneuver": "intubate", "laryngoscope": "video"})
    c.run(40)
    c.submit({"type": "vent", "mode": "vcv", "tv_ml": 450, "rr": 14, "peep": 6})
    c.submit({"type": "volatile", "percent": 2.2})
    c.submit({"type": "drug", "drug": "cefazolin", "dose": 2, "unit": "g"})
    c.submit({"type": "say", "intent": "time_out"})
    c.submit({"type": "say", "intent": "ready_for_incision"})
    if position:
        c.submit({"type": "position", "position": position})
    return c


def run_ai(c, limit_h=6):
    t0 = c.t
    while not c.procedure.finished and c.t - t0 < limit_h * 3600:
        c.step()
        if c.eff.tof_count > 2 and int(c.t) % 600 == 0:
            c.submit({"type": "drug", "drug": "rocuronium", "dose": 20})
        if c.body.etco2 > 50 and int(c.t) % 120 == 0 and c.machine.rr < 24:
            c.submit({"type": "vent", "rr": c.machine.rr + 2})
    return c


def all_text(c):
    p = c.procedure
    return " ".join(m["text"] for m in c.comms) + " " + " ".join(p.findings + p.notes + p.occult)


def leak_regex(other: str = "") -> "re.Pattern":
    return re.compile(LEAK_WORDS + other, re.I)
