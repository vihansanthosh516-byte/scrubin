import re

import pytest

from scrubin_engine.factory import build_case
from scrubin_engine.surgery import load_spec
from scrubin_engine.surgery.parse import parse_surgical

SPEC = load_spec("inguinal_hernia")
LEAKS = re.compile(r"appendi|appendec|gallbladder|cholecyst|Marcus|Elena|mesoappend|cecum|cystic", re.I)


def surgeon_case(seed=3):
    c = build_case("inguinal_hernia", "surgeon", seed)
    while "anesthesia_ready" not in c.procedure.flags and c.t < 1200:
        c.step()
    assert "anesthesia_ready" in c.procedure.flags
    return c


def do(c, text, confirm=False):
    a = parse_surgical(text, SPEC, c.procedure)
    assert a is not None, text
    r = c.submit(a)
    if confirm and r.get("needs_confirmation"):
        r = c.submit({"type": "confirm", "accept": True})
    while c.procedure.running is not None and c.t < 20000:
        c.step()
        if c.procedure.bleeders and c.procedure.running is None:
            break
    if c.procedure.bleeders:
        c.submit(parse_surgical("clip the bleeder", SPEC, c.procedure))
        while c.procedure.running is not None:
            c.step()
    return r


def _to_flap(c):
    c.submit({"type": "say", "intent": "time_out"})
    do(c, "prep and drape")
    do(c, "empty the bladder")
    for text in ["umbilical skin incision", "hasson open entry", "insufflate", "camera in", "place the working ports", "explore"]:
        do(c, text, confirm=True)
    c.submit({"type": "position", "position": "trendelenburg"})
    do(c, "identify the epigastric vessels")


def _repair(c, tack="tack the mesh to cooper's ligament"):
    for text in ["incise the peritoneum", "develop the flap", "reduce the sac", "parietalize the cord", "place the mesh", tack, "close the peritoneal flap"]:
        do(c, text)


def _finish(c):
    for text in ["check hemostasis", "desufflate", "do the count", "close the fascia", "close the skin"]:
        do(c, text)


def test_full_hernia_as_surgeon_reaches_pacu():
    c = surgeon_case(seed=3)
    assert "Daniel" in c.patient.name
    _to_flap(c)
    _repair(c)
    _finish(c)
    assert c.procedure.finished, c.procedure.done
    assert not any("Tack" in o or "Bladder" in o or "flap left open" in o for o in c.procedure.occult)
    t0 = c.t
    while c.outcome is None and c.t - t0 < 1800:
        c.step()
    assert c.outcome == "pacu"


def test_tacks_in_the_triangle_of_pain_are_challenged_and_hidden():
    c = surgeon_case(seed=4)
    _to_flap(c)
    for text in ["incise the peritoneum", "develop the flap", "reduce the sac", "parietalize the cord", "place the mesh"]:
        do(c, text)
    r = c.submit(parse_surgical("tack the mesh in the triangle of pain", SPEC, c.procedure))
    assert r.get("needs_confirmation") and "iliopubic" in r["question"]
    assert any(m["from"] == "attending" for m in c.comms)
    found = False
    for seed in range(4, 14):  # nerve entrapment is likely, not certain
        c = surgeon_case(seed=seed)
        _to_flap(c)
        for text in ["incise the peritoneum", "develop the flap", "reduce the sac", "parietalize the cord", "place the mesh"]:
            do(c, text)
        do(c, "tack the mesh in the triangle of pain", confirm=True)
        do(c, "close the peritoneal flap")
        _finish(c)
        found = found or any("nerve" in o for o in c.procedure.occult)
        assert any("triangle of pain" in n for n in c.procedure.notes)
    assert found


def test_peritoneum_before_landmarks_and_full_bladder_are_noted():
    c = surgeon_case(seed=5)
    c.submit({"type": "say", "intent": "time_out"})
    do(c, "prep and drape")
    for text in ["umbilical skin incision", "hasson open entry", "insufflate", "camera in"]:
        do(c, text, confirm=True)
    r = c.submit(parse_surgical("place the working ports", SPEC, c.procedure))
    assert r.get("needs_confirmation") and "bladder" in r["question"]
    c.submit({"type": "confirm", "accept": True})
    while c.procedure.running is not None:
        c.step()
    do(c, "explore")
    c.submit({"type": "position", "position": "trendelenburg"})
    r = c.submit(parse_surgical("incise the peritoneum", SPEC, c.procedure))
    assert r.get("needs_confirmation") and "epigastric" in r["question"]


def test_ai_surgeon_runs_a_hernia_repair():
    c = build_case("inguinal_hernia", "anesthesia", 6)
    c.submit({"type": "monitor", "attach": ["ecg", "spo2", "nibp", "etco2", "bis"]})
    c.submit({"type": "gas", "o2_flow": 10})
    c.submit({"type": "airway", "maneuver": "mask_on"})
    c.run(180)
    c.submit({"type": "drug", "drug": "propofol", "dose": 150})
    c.submit({"type": "drug", "drug": "fentanyl", "dose": 100})
    c.submit({"type": "drug", "drug": "rocuronium", "dose": 60})
    c.run(90)
    c.submit({"type": "airway", "maneuver": "intubate", "laryngoscope": "video"})
    c.run(40)
    c.submit({"type": "vent", "mode": "vcv", "tv_ml": 450, "rr": 14, "peep": 6})
    c.submit({"type": "volatile", "percent": 2.2})
    c.submit({"type": "drug", "drug": "cefazolin", "dose": 2, "unit": "g"})
    c.submit({"type": "say", "intent": "time_out"})
    c.submit({"type": "say", "intent": "ready_for_incision"})
    c.submit({"type": "position", "position": "trendelenburg"})
    t0 = c.t
    while not c.procedure.finished and c.t - t0 < 4 * 3600:
        c.step()
        if c.eff.tof_count > 2 and int(c.t) % 600 == 0:
            c.submit({"type": "drug", "drug": "rocuronium", "dose": 20})
    assert c.procedure.finished, (c.procedure.done, c.comms[-3:])
    assert "identify_landmarks" in c.procedure.done and "close_peritoneum" in c.procedure.done
    text = " ".join(m["text"] for m in c.comms)
    assert "hernia" in text.lower() and not LEAKS.search(text), LEAKS.search(text)


@pytest.mark.parametrize("seed", range(10))
def test_no_text_from_other_procedures_or_patients(seed):
    c = build_case("inguinal_hernia", "anesthesia", seed)
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
    c.submit({"type": "say", "intent": "time_out"})
    c.submit({"type": "say", "intent": "ready_for_incision"})
    t0 = c.t
    while not c.procedure.finished and c.t - t0 < 4 * 3600:
        c.step()
        if c.eff.tof_count > 2 and int(c.t) % 600 == 0:
            c.submit({"type": "drug", "drug": "rocuronium", "dose": 20})
    text = " ".join(m["text"] for m in c.comms) + " ".join(c.procedure.findings + c.procedure.notes + c.procedure.occult)
    assert not LEAKS.search(text), LEAKS.search(text)
    assert not re.search(r"\b(she|her)\b", text, re.I), re.search(r"\b(she|her)\b", text, re.I)
