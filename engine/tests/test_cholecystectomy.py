from scrubin_engine.factory import build_case
from scrubin_engine.surgery import load_spec
from scrubin_engine.surgery.parse import parse_surgical

SPEC = load_spec("cholecystectomy")


def surgeon_case(seed=3):
    c = build_case("cholecystectomy", "surgeon", seed)
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


def _to_cvs(c):
    c.submit({"type": "say", "intent": "time_out"})
    do(c, "prep and drape")
    for text in ["umbilical skin incision", "hasson open entry", "insufflate", "camera in", "place the working ports", "explore"]:
        do(c, text, confirm=True)
    c.submit({"type": "position", "position": "reverse_trendelenburg"})
    if c.procedure.flag("adhesions"):
        do(c, "take down adhesions")
    do(c, "retract the fundus")
    do(c, "dissect the hepatocystic triangle with the maryland")


def test_full_cholecystectomy_as_surgeon_reaches_pacu():
    c = surgeon_case(seed=3)
    assert "Elena" in c.patient.name
    _to_cvs(c)
    for text in ["confirm the critical view of safety", "clip the cystic duct", "clip the cystic artery", "cut between the clips",
                 "take it off the liver bed", "put it in the bag", "remove the gallbladder"]:
        do(c, text)
    if c.procedure.flag("spillage"):
        do(c, "irrigate")
    for text in ["check hemostasis", "desufflate", "do the count", "close the fascia", "close the skin"]:
        do(c, text)
    assert c.procedure.finished, c.procedure.done
    assert not any("bile duct" in o for o in c.procedure.occult)
    t0 = c.t
    while c.outcome is None and c.t - t0 < 1800:
        c.step()
    assert c.outcome == "pacu"


def test_clipping_without_critical_view_is_challenged_and_noted():
    c = surgeon_case(seed=4)
    _to_cvs(c)
    r = c.submit(parse_surgical("clip the cystic duct", SPEC, c.procedure))
    assert r.get("needs_confirmation") and "critical view" in r["question"]
    c.submit({"type": "confirm", "accept": True})
    while c.procedure.running is not None:
        c.step()
    assert any("critical view" in n for n in c.procedure.notes)


def test_ai_surgeon_runs_a_cholecystectomy():
    c = build_case("cholecystectomy", "anesthesia", 6)
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
    c.submit({"type": "position", "position": "reverse_trendelenburg"})
    t0 = c.t
    while not c.procedure.finished and c.t - t0 < 4 * 3600:
        c.step()
        if c.eff.tof_count > 2 and int(c.t) % 600 == 0:
            c.submit({"type": "drug", "drug": "rocuronium", "dose": 20})
    assert c.procedure.finished, (c.procedure.done, c.comms[-3:])
    assert "confirm_cvs" in c.procedure.done
    text = " ".join(m["text"] for m in c.comms)
    assert "cholecystectomy" in text.lower() and "appendectomy" not in text.lower()
