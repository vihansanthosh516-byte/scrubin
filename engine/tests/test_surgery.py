from scrubin_engine.factory import build_case
from scrubin_engine.surgery import load_spec
from scrubin_engine.surgery.parse import parse_surgical

SPEC = load_spec("appendectomy")


def surgeon_case(seed=3):
    c = build_case("appendectomy", "surgeon", seed)
    while "anesthesia_ready" not in c.procedure.flags and c.t < 1200:
        c.step()
    assert "anesthesia_ready" in c.procedure.flags
    return c


def do(c, text):
    a = parse_surgical(text, SPEC, c.procedure)
    assert a is not None, text
    r = c.submit(a)
    while c.procedure.running is not None and c.t < 20000:
        c.step()
    return r


def test_parse_surgical_commands():
    a = parse_surgical("divide the mesoappendix with the ligasure", SPEC)
    assert a["params"]["task_id"] == "divide_meso" and a["instrument"] == "ligasure" and a["target"] == "mesoappendix"
    assert parse_surgical("clip the bleeder", SPEC)["params"]["task_id"] == "control_bleeding"
    assert parse_surgical("fire the stapler across the base", SPEC)["params"]["task_id"] == "secure_base"
    assert parse_surgical("camera in", SPEC)["params"]["task_id"] == "camera_in"


def test_blocked_step_is_explained():
    c = surgeon_case()
    r = do(c, "make an incision at the umbilicus")
    assert r["ok"] is False
    assert "prepped" in c.comms[-1]["text"]


def test_incision_without_time_out_asks_to_confirm():
    c = surgeon_case()
    do(c, "prep and drape")
    r = do(c, "incision at the umbilicus")
    assert r.get("needs_confirmation")
    assert "time-out" in r["question"]
    r = c.submit({"type": "confirm", "accept": True})
    assert r["ok"] and c.procedure.running and c.procedure.running.task["id"] == "incision"


def test_wrong_instrument_is_refused():
    c = surgeon_case()
    do(c, "prep")
    c.submit({"type": "say", "intent": "time_out", "text": "time out"})
    r = c.submit({"type": "surgical", "verb": "incise", "target": "umbilicus", "instrument": "stapler"})
    assert r["ok"] is False and "isn't right" in c.comms[-1]["text"]


def _to_meso(c):
    c.submit({"type": "say", "intent": "time_out", "text": "time out"})
    for text in ["prep", "incision at the umbilicus", "hasson", "insufflate", "camera in", "working ports"]:
        do(c, text)
    c.submit({"type": "position", "position": "left_side_down"})
    do(c, "explore")
    if c.procedure.flag("adhesions"):
        do(c, "lyse adhesions with the harmonic")
    if c.procedure.flag("retrocecal"):
        do(c, "mobilize the cecum with the harmonic")
    do(c, "grasp the appendix with the grasper")
    do(c, "create a window at the base")


def test_scissors_on_mesoappendix_causes_bleeding_and_clips_control_it():
    c = surgeon_case()
    _to_meso(c)
    do(c, "divide the mesoappendix with scissors")
    assert c.procedure.bleeders
    lost = c.body.blood_loss_ml
    c.run(60)
    assert c.body.blood_loss_ml > lost + 100
    do(c, "clip the bleeder")
    assert not c.procedure.bleeders


def test_full_case_as_surgeon_reaches_pacu():
    c = surgeon_case(seed=3)
    _to_meso(c)
    for text in ["divide the mesoappendix with the ligasure", "fire the stapler across the base", "divide the appendix",
                 "put it in the bag", "remove the specimen"]:
        do(c, text)
        if c.procedure.bleeders:
            do(c, "clip the bleeder")
    if c.procedure.flag("perforated"):
        do(c, "irrigate")
    for text in ["check hemostasis", "desufflate", "do the count", "close the fascia", "close the skin"]:
        do(c, text)
    assert c.procedure.finished
    t0 = c.t
    while c.outcome is None and c.t - t0 < 1800:
        c.step()
    assert c.outcome == "pacu"
    assert c.metrics.min_spo2 > 0.9


def test_ai_surgeon_waits_then_circulator_runs_time_out():
    c = build_case("appendectomy", "anesthesia", 5)
    c.submit({"type": "monitor", "attach": ["ecg", "spo2", "nibp", "etco2"]})
    c.submit({"type": "gas", "o2_flow": 10})
    c.submit({"type": "airway", "maneuver": "mask_on"})
    c.run(180)
    c.submit({"type": "drug", "drug": "propofol", "dose": 150})
    c.submit({"type": "drug", "drug": "rocuronium", "dose": 100})
    c.submit({"type": "infusion", "drug": "propofol", "rate": 120, "unit": "mcg/kg/min"})
    c.run(80)
    c.submit({"type": "airway", "maneuver": "intubate", "laryngoscope": "video"})
    c.run(40)
    c.submit({"type": "vent", "mode": "vcv", "tv_ml": 500, "rr": 14, "peep": 6})
    # Say nothing: no antibiotics, no time-out, no go-ahead.
    t0 = c.t
    while c.metrics.incision_t is None and c.t - t0 < 1200:
        c.step()
    assert c.metrics.incision_t is not None
    notes = " ".join(c.procedure.notes)
    assert "time-out" in notes and "antibiotics" in notes


def test_playtest_routing_and_queue():
    import asyncio

    from scrubin_engine.session import Session

    s = Session("t", "appendectomy", "surgeon", 3, surgeon_case())
    c = s.case
    c.submit({"type": "say", "intent": "time_out", "text": "time out"})
    for text in ["prep", "incision at the umbilicus", "hasson"]:
        do(c, text)
    r = asyncio.run(s.utterance("Insufflate CO2 to 15, then camera in through the umbilical port"))
    assert [a["params"]["task_id"] for a in r["actions"]] == ["insufflate", "camera_in"]
    while (c.procedure.running or c.procedure.queue) and c.t < 20000:
        c.step()
    assert "camera_in" in c.procedure.done
    a = parse_surgical("Cut the appendix with the scissors distal to the endoloops", SPEC)
    assert a["instrument"] == "scissors"


def test_capnogram_check_waits_for_breaths():
    c = surgeon_case()  # AI anesthesia has intubated and ventilated
    r = c.submit({"type": "assess", "what": "check_capnogram"})
    assert r.get("pending_s")
    c.run(10)
    assert "capnogram" in c.comms[-1]["text"].lower() or "co2" in c.comms[-1]["text"].lower()


def test_desufflate_is_the_surgeons_step_not_stop_surgery():
    from scrubin_engine.session import Session

    s = Session("t", "appendectomy", "surgeon", 3, surgeon_case())
    for text in ["desufflate", "let the gas out"]:
        actions, _ = s._surgeon_parse(text)
        assert actions and actions[0]["type"] == "surgical" and actions[0]["params"]["task_id"] == "desufflate"
    actions, _ = s._surgeon_parse("stop the surgery")
    assert actions[0].get("intent") == "stop_surgery"


def test_ai_anesthesiologist_doses_on_its_own_and_runs_the_code():
    c = surgeon_case()
    r = c.submit({"type": "drug", "drug": "propofol"})
    assert r.get("delegated") and not any("How much" in m["text"] for m in c.comms)
    r = c.submit({"type": "airway", "maneuver": "extubate"})
    assert r.get("delegated") and c.airway.device == "ett"  # the surgeon can't pull the tube
    c.body.rhythm = "pea"
    c.run(5)
    assert c.body.cpr
    assert any("starting CPR" in m["text"] for m in c.comms)


def test_surgeon_asking_to_induce_starts_induction_after_a_minute_of_preox():
    from scrubin_engine.factory import build_case

    c = build_case("appendectomy", "surgeon", 3)
    c.run(80)  # monitors on, ~75 s of preoxygenation
    c.submit({"type": "say", "to": "anesthesia", "text": "Let's induce now"})
    assert any("inducing now" in m["text"] for m in c.comms)


def test_surgeon_free_text_about_anesthesia_never_asks_the_surgeon_for_drugs():
    import asyncio

    from scrubin_engine.factory import build_case
    from scrubin_engine.session import Session

    s = Session("t", "appendectomy", "surgeon", 3, build_case("appendectomy", "surgeon", 3))
    s.case.run(80)
    r = asyncio.run(s.utterance("let's induce now"))
    assert r["source"] == "grammar" and not r["clarification"]
    assert any("inducing now" in m["text"] for m in s.case.comms)
