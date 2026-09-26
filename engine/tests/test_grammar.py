import pytest

from scrubin_engine.actions import parse_action
from scrubin_engine.language.grammar import parse


def one(text):
    r = parse(text)
    assert len(r.actions) == 1, (text, r)
    parse_action(r.actions[0])  # must validate against the schema
    a = dict(r.actions[0])
    a.pop("utterance", None)
    return a


@pytest.mark.parametrize("text,expected", [
    ("push 150 of propofol", {"type": "drug", "drug": "propofol", "dose": 150.0, "unit": None}),
    ("propofol one fifty", {"type": "drug", "drug": "propofol", "dose": 150.0, "unit": None}),
    ("give 100 mcg fentanyl", {"type": "drug", "drug": "fentanyl", "dose": 100.0, "unit": "mcg"}),
    ("roc 50", {"type": "drug", "drug": "rocuronium", "dose": 50.0, "unit": None}),
    ("2 mg/kg propofol", {"type": "drug", "drug": "propofol", "dose": 2.0, "unit": "mg/kg"}),
    ("ancef 2 grams", {"type": "drug", "drug": "cefazolin", "dose": 2.0, "unit": "g"}),
    ("sux 140", {"type": "drug", "drug": "succinylcholine", "dose": 140.0, "unit": None}),
    ("phenylephrine 100 micrograms", {"type": "drug", "drug": "phenylephrine", "dose": 100.0, "unit": "mcg"}),
    ("give some propofol", {"type": "drug", "drug": "propofol", "dose": None, "unit": None}),
    ("glyco point two", {"type": "drug", "drug": "glycopyrrolate", "dose": 0.2, "unit": None}),
])
def test_drug_orders(text, expected):
    assert one(text) == expected


def test_ambiguous_neo_asks():
    r = parse("neo 100")
    assert not r.actions and "neostigmine" in r.clarification and "phenylephrine" in r.clarification


def test_infusions():
    assert one("start a propofol infusion at 120 mcg/kg/min") == {"type": "infusion", "drug": "propofol", "rate": 120.0, "unit": "mcg/kg/min"}
    assert one("stop the propofol drip") == {"type": "infusion", "drug": "propofol", "stop": True}
    assert one("remi drip 0.1")["rate"] == 0.1


def test_volatile_and_gas():
    assert one("sevo 2 percent") == {"type": "volatile", "percent": 2.0}
    assert one("turn the sevo off") == {"type": "volatile", "percent": 0.0}
    assert one("oxygen 10 liters") == {"type": "gas", "o2_flow": 10.0, "air_flow": None}
    assert one("flows 1 and 1") == {"type": "gas", "o2_flow": 1.0, "air_flow": 1.0}


def test_ventilator():
    a = one("volume control 500 by 12 peep 5")
    assert a == {"type": "vent", "mode": "vcv", "tv_ml": 500.0, "rr": 12.0, "peep": 5.0}
    assert one("increase the rate to 16") == {"type": "vent", "rr": 16.0}
    assert one("put him on the vent")["mode"] == "vcv"
    assert one("pressure control 18")["pinsp"] == 18.0


def test_airway():
    a = one("intubate with the glidescope, 7.5 tube at 22")
    assert a["maneuver"] == "intubate" and a["laryngoscope"] == "video" and a["tube_size"] == 7.5 and a["depth_cm"] == 22.0
    assert one("jaw thrust")["maneuver"] == "jaw_thrust_on"
    assert one("pull the tube back to 22") == {"type": "airway", "maneuver": "reposition_tube", "depth_cm": 22.0}
    assert one("size 5 lma")["lma_size"] == 5
    assert one("cricoid pressure")["maneuver"] == "cricoid_on"
    r = parse("preoxygenate")
    assert [x["type"] for x in r.actions] == ["gas", "airway"]


def test_monitors_assess_misc():
    assert one("put on standard monitors")["attach"] == ["ecg", "spo2", "nibp", "etco2", "temp"]
    assert one("cycle the cuff") == {"type": "monitor", "cycle_nibp": True}
    assert one("listen to the chest") == {"type": "assess", "what": "auscultate"}
    assert one("check a train of four") == {"type": "assess", "what": "check_tof"}
    assert one("do we have co2?") == {"type": "assess", "what": "check_capnogram"}
    assert one("time out")["intent"] == "time_out"
    assert one("okay to cut")["intent"] == "ready_for_incision"
    assert one("bolus 500 of LR") == {"type": "fluid", "fluid": "lactated_ringers", "volume_ml": 500.0}
    assert one("hang a unit of blood")["fluid"] == "prbc"
    assert one("reverse trendelenburg")["position"] == "reverse_trendelenburg"
    assert one("yes")["type"] == "confirm"


def test_multiple_orders():
    r = parse("give 100 of fentanyl and 150 of propofol then roc 50")
    assert [(a["drug"], a["dose"]) for a in r.actions] == [("fentanyl", 100.0), ("propofol", 150.0), ("rocuronium", 50.0)]


def test_unparsed_is_reported():
    r = parse("what do you think about the weather")
    assert not r.actions and r.unparsed
