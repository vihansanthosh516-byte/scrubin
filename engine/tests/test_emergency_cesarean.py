import pytest

from proc_helpers import Driver, all_text, leak_regex
from scrubin_engine.factory import build_case
from scrubin_engine.scenarios import SCENARIOS
from scrubin_engine.scoring.debrief import build_debrief
from scrubin_engine.language.grammar import parse

SID = "emergency_cesarean"
OTHER = r"|inguinal|iliopubic|sigmoid|hysterectomy|prostate|nephrect|laparoscop|insufflat|pneumoperitoneum|trocar|camera"
OPEN = ["pfannenstiel skin incision", "dissect to the sheath", "open the fascia", "separate the recti", "open the peritoneum", "place the bladder retractor", "incise the uterus"]


def _until_ready(c):
    while "anesthesia_ready" not in c.procedure.flags and c.t < 1500:
        c.step()


def _to_delivery(d, give_oxytocin=True):
    c = d.c
    c.submit({"type": "say", "intent": "time_out"})
    d.do("prep and drape")
    d.steps(OPEN, confirm=True)
    d.do("deliver the baby")
    d.do("clamp the cord")
    if give_oxytocin:
        c.submit({"type": "drug", "drug": "oxytocin", "dose": 3, "unit": "units", "actor": "anesthesia"})
    d.do("deliver the placenta")


def _finish(d):
    for t in ["close the uterus", "check hemostasis", "do the count", "close the fascia", "close the skin"]:
        d.do(t, confirm=True)


def test_scenario_registered_and_pregnant():
    s = SCENARIOS[SID]
    assert s["pregnant"] and s["full_stomach"]
    c = build_case(SID, "surgeon", 3)
    assert c.patient.pregnant and c.patient.public_summary()["pregnant"]
    nonpreg = build_case("total_hysterectomy", "surgeon", 3).patient
    assert c.patient.frc_ml < 0.85 * (30.0 * c.patient.ibw_kg)
    assert not nonpreg.pregnant


def test_full_caesarean_as_surgeon_reaches_pacu_with_a_healthy_baby():
    d = Driver(SID, seed=3)
    _to_delivery(d)
    _finish(d)
    assert d.proc.finished
    assert d.to_pacu() == "pacu"
    deb = build_debrief(d.c)
    titles = {i["title"]: i for i in deb["items"]}
    for t in ("Left uterine displacement", "Decision to delivery", "Oxytocin", "Baby"):
        assert t in titles, titles.keys()
    assert titles["Oxytocin"]["grade"] == "good"
    assert not leak_regex(OTHER).search(all_text(d.c))


def test_ai_anesthesia_tilts_and_does_rapid_sequence():
    c = build_case(SID, "surgeon", 3)
    _until_ready(c)
    assert c.position == "left_tilt"
    text = " ".join(m["text"] for m in c.comms)
    assert "succinylcholine" in text.lower() or "Succinylcholine" in text
    assert "cricoid" in text.lower()
    assert c.airway.device == "ett"
    assert not c._aortocaval()


def _preoxygenated(position):
    c = build_case(SID, "anesthesia", 3)
    c.procedure._wait["position"] = 1e9  # the AI surgeon's circulator would tilt her after a few seconds
    c.submit({"type": "monitor", "attach": ["ecg", "spo2", "nibp", "etco2", "bis"]})
    c.submit({"type": "gas", "o2_flow": 10})
    c.submit({"type": "airway", "maneuver": "mask_on"})
    c.submit({"type": "position", "position": position})
    c.run(200)
    return c


def _induce(c):
    r = c.submit({"type": "drug", "drug": "propofol", "dose": 130})
    if r.get("needs_confirmation"):
        c.submit({"type": "confirm", "accept": True})


def test_lying_flat_drops_the_pressure_after_induction_and_is_graded():
    flat, tilted = _preoxygenated("level"), _preoxygenated("left_tilt")
    for c in (flat, tilted):
        _induce(c)
        c.run(60)
    assert tilted.body.map > flat.body.map + 5, (flat.body.map, tilted.body.map)
    assert flat.metrics.sec_untilted >= 250 and tilted.metrics.sec_untilted == 0


def test_left_side_down_means_uterine_displacement_for_a_pregnant_patient():
    c = build_case(SID, "anesthesia", 3)
    c.submit({"type": "position", "position": "left_side_down"})
    assert c.position == "left_tilt" and c.load.trendelenburg_deg == 0
    r = parse("put a wedge under her right hip, left uterine displacement")
    assert r.actions and r.actions[0]["position"] == "left_tilt"


def test_incision_waits_for_a_secured_airway_and_prep_needs_tilt():
    c = build_case(SID, "surgeon", 3)
    d = Driver.__new__(Driver)
    d.sid, d.c = SID, c
    from scrubin_engine.surgery import load_spec
    from scrubin_engine.surgery.parse import parse_surgical

    spec = load_spec(SID)
    c.submit({"type": "position", "position": "level"})
    r = c.submit(parse_surgical("prep and drape", spec, c.procedure))
    assert r.get("needs_confirmation") and "vena cava" in r["question"]
    c.submit({"type": "confirm", "accept": False})
    r = c.submit(parse_surgical("pfannenstiel incision", spec, c.procedure))
    assert not r.get("ok", True) or r.get("error")
    assert "Not yet" in " ".join(m["text"] for m in c.comms[-3:])


def test_oxytocin_units_are_parsed_and_a_fast_bolus_is_challenged():
    r = parse("oxytocin 3 units")
    assert r.actions[0]["drug"] == "oxytocin" and r.actions[0]["unit"] == "units" and r.actions[0]["dose"] == 3
    r = parse("start an oxytocin infusion at 10 units per hour")
    assert r.actions[0]["type"] == "infusion" and r.actions[0]["unit"] == "units/h" and r.actions[0]["rate"] == 10
    c = build_case(SID, "anesthesia", 3)
    out = c.submit({"type": "drug", "drug": "oxytocin", "dose": 10, "unit": "units"})
    assert out.get("needs_confirmation")
    c.submit({"type": "confirm", "accept": True})
    assert c.pharm.ever_given["oxytocin"] == 10


def test_a_fast_oxytocin_bolus_causes_tachycardia_and_vasodilation():
    def after(units):
        c = _preoxygenated("left_tilt")
        _induce(c)
        c.run(120)
        if units:
            c.submit({"type": "drug", "drug": "oxytocin", "dose": units, "unit": "units"})
            c.submit({"type": "confirm", "accept": True})
        c.run(75)
        return c

    none, slow, fast = after(0), after(3), after(10)
    assert fast.body.hr > none.body.hr + 12 and fast.body.svr < 0.9 * none.body.svr
    assert slow.body.hr < fast.body.hr - 8


def _atony_seed():
    for seed in range(1, 60):
        if build_case(SID, "surgeon", seed).patient.hidden["atony_risk"]:
            return seed
    raise AssertionError("no atony-prone patient in 60 seeds")


def _hold_the_ai_anesthesiologist(c):
    c.autopilot.last["post_delivery"] = c.t  # she waits for the surgeon to ask
    c.autopilot.last["atony"] = 1e9
    c.autopilot.last["second_line"] = 1e9


def test_no_oxytocin_means_atony_and_massage_alone_does_not_fix_it():
    d = Driver(SID, seed=3)
    _hold_the_ai_anesthesiologist(d.c)
    _to_delivery(d, give_oxytocin=False)
    atony = [b for b in d.proc.bleeders if b.cure_drugs]
    assert atony, "a boggy uterus without any oxytocin"
    r = d.ask("massage the uterus")
    assert r.get("ok", True)
    while d.proc.running is not None:
        d.c.step()
    atony = [b for b in d.proc.bleeders if b.cure_drugs]
    assert atony and atony[0].nonblocking and atony[0].rate_ml_min == 110
    d.c.submit({"type": "drug", "drug": "oxytocin", "dose": 3, "unit": "units", "actor": "anesthesia"})
    d.c.run(5)
    assert not [b for b in d.proc.bleeders if b.cure_drugs]


def test_closing_the_uterus_before_oxytocin_is_challenged():
    d = Driver(SID, seed=3)
    _hold_the_ai_anesthesiologist(d.c)
    _to_delivery(d, give_oxytocin=False)
    r = d.ask("close the uterus")
    assert r.get("needs_confirmation") and "oxytocin" in r["question"].lower()


def test_atony_despite_oxytocin_needs_a_second_line_drug_and_the_ai_gives_the_right_one():
    seed = _atony_seed()
    for s in range(seed, seed + 30):
        c = build_case(SID, "surgeon", s)
        if not c.patient.hidden["atony_risk"]:
            continue
        d = Driver(SID, seed=s)
        _to_delivery(d, give_oxytocin=True)
        if not any(e.get("source") == "uterine atony" for e in d.c.events if e["kind"] == "complication"):
            continue
        d.c.run(240)
        given = d.c.pharm.ever_given
        assert not [b for b in d.proc.bleeders if b.cure_drugs], d.proc.bleeders
        assert given.get("tranexamic_acid") == 1
        if d.c.patient.hidden["reactive_airway"]:
            assert given.get("methylergonovine") and not given.get("carboprost")
        else:
            assert given.get("carboprost") and not given.get("methylergonovine")
        assert not any(e.get("cause") == "carboprost" for e in d.c.events if e["kind"] == "complication")
        return
    raise AssertionError("no atony case found")


def test_carboprost_in_an_asthmatic_causes_bronchospasm():
    hit = None
    for seed in range(1, 40):
        c = build_case(SID, "anesthesia", seed)
        if c.patient.hidden["reactive_airway"]:
            hit = c
            break
    assert hit is not None
    hit.submit({"type": "drug", "drug": "carboprost", "dose": 0.25})
    assert hit.airway.bronchospasm >= 0.8
    assert any(e.get("name") == "bronchospasm" and e.get("cause") == "carboprost" for e in hit.events)
    assert "salbutamol" in hit.patient.interview["medications"]
    assert any("asthma" in x for x in hit.patient.comorbidities)


def test_anterior_placenta_cut_through_unless_located():
    cut = located = False
    for seed in range(1, 40):
        d = Driver(SID, seed=seed)
        if not d.c.patient.hidden["anterior_placenta"]:
            continue
        d.c.submit({"type": "say", "intent": "time_out"})
        d.do("prep and drape")
        d.steps(OPEN[:5], confirm=True)
        d.do("scan the placenta")
        d.steps(OPEN[5:], confirm=True)
        located = located or "cut_through_placenta" not in d.proc.flags
        d2 = Driver(SID, seed=seed)
        d2.c.submit({"type": "say", "intent": "time_out"})
        d2.do("prep and drape")
        d2.steps(OPEN, confirm=True)
        cut = cut or "cut_through_placenta" in d2.proc.flags
        if cut and located:
            break
    assert cut and located


def test_ai_surgeon_runs_the_whole_operation():
    c = build_case(SID, "anesthesia", 3)
    c.submit({"type": "monitor", "attach": ["ecg", "spo2", "nibp", "etco2", "bis"]})
    c.submit({"type": "gas", "o2_flow": 10})
    c.submit({"type": "airway", "maneuver": "mask_on"})
    c.submit({"type": "position", "position": "left_tilt"})
    c.run(120)
    c.submit({"type": "airway", "maneuver": "cricoid_on"})
    c.submit({"type": "drug", "drug": "propofol", "dose": 130})
    c.submit({"type": "drug", "drug": "succinylcholine", "dose": 130})
    c.run(60)
    c.submit({"type": "airway", "maneuver": "intubate", "laryngoscope": "video", "tube_size": 7.0})
    c.run(30)
    c.submit({"type": "vent", "mode": "vcv", "tv_ml": 450, "rr": 14, "peep": 6})
    c.submit({"type": "volatile", "percent": 1.5})
    c.submit({"type": "airway", "maneuver": "cricoid_off"})
    c.submit({"type": "drug", "drug": "cefazolin", "dose": 2, "unit": "g"})
    c.submit({"type": "say", "intent": "time_out"})
    c.submit({"type": "say", "intent": "ready_for_incision"})
    p = c.procedure
    while not p.finished and c.t < 6000:
        c.step()
        if "baby_delivered" in p.flags and "oxy" not in c._flags:
            c._flags["oxy"] = 1
            c.run(20)
            c.submit({"type": "drug", "drug": "oxytocin", "dose": 3, "unit": "units"})
        if c.eff.tof_count > 2 and int(c.t) % 240 == 0:
            c.submit({"type": "drug", "drug": "rocuronium", "dose": 20})
    assert p.finished, p.done
    assert any(e["kind"] == "delivery" for e in c.events)
    assert not leak_regex(OTHER).search(all_text(c))
