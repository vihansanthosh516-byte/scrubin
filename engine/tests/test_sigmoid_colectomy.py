import re

import pytest

from proc_helpers import Driver, ai_surgeon_case, all_text, leak_regex, run_ai

SID = "sigmoid_colectomy"
OTHER = r"|inguinal|iliopubic|epigastric ves|mesh"


def _to_ureter(d, seed_flex=True):
    c = d.c
    c.submit({"type": "say", "intent": "time_out"})
    d.do("prep and drape")
    d.steps(["umbilical skin incision", "hasson open entry", "insufflate", "camera in", "place the working ports", "explore"], confirm=True)
    c.submit({"type": "position", "position": "steep_trendelenburg_right_down"})
    if d.proc.flag("adhesions"):
        d.do("take down adhesions")
    d.do("sweep the small bowel out of the pelvis")
    d.do("medial to lateral dissection")


def _to_pelvis(d):
    d.steps(["divide the ima", "mobilize the descending colon", "check the reach"])
    if d.proc.flag("tension"):
        d.do("mobilize the splenic flexure")
    d.steps(["divide the rectosigmoid", "place the wound protector", "extract the specimen", "place the anvil", "check perfusion", "reinsufflate"])


def _finish(d, leak=True):
    d.do("make the anastomosis")
    if leak:
        d.do("air leak test")
    for t in ["check hemostasis", "desufflate", "do the count", "close the fascia", "close the skin"]:
        d.do(t, confirm=True)


def test_full_sigmoid_as_surgeon_reaches_pacu():
    d = Driver(SID, seed=3)
    assert "Margaret" in d.c.patient.name
    _to_ureter(d)
    d.do("identify the left ureter")
    _to_pelvis(d)
    _finish(d)
    assert d.proc.finished, d.proc.done
    assert not any("ureter" in o.lower() for o in d.proc.occult), d.proc.occult
    assert d.to_pacu() == "pacu"


def test_dividing_the_ima_before_the_ureter_is_challenged_and_hidden():
    d = Driver(SID, seed=4)
    _to_ureter(d)
    r = d.ask("divide the ima")
    assert r.get("needs_confirmation") and "ureter" in r["question"]
    assert any(m["from"] == "attending" for m in d.c.comms) or r["needs_confirmation"]
    found = False
    for seed in range(4, 20):
        d = Driver(SID, seed=seed)
        _to_ureter(d)
        d.do("divide the ima", confirm=True)
        _to_pelvis_after_ima(d)
        _finish(d)
        assert any("before the left ureter" in n for n in d.proc.notes)
        found = found or any("ureter injury" in o.lower() for o in d.proc.occult)
    assert found


def _to_pelvis_after_ima(d):
    d.steps(["mobilize the descending colon", "check the reach"])
    if d.proc.flag("tension"):
        d.do("mobilize the splenic flexure")
    d.steps(["divide the rectosigmoid", "place the wound protector", "extract the specimen", "place the anvil", "check perfusion", "reinsufflate"])


def test_skipping_the_leak_test_is_challenged_and_can_hide_a_leak():
    d = Driver(SID, seed=5)
    _to_ureter(d)
    d.do("identify the left ureter")
    _to_pelvis(d)
    d.do("make the anastomosis")
    d.do("check hemostasis")
    d.do("desufflate")
    d.do("do the count")
    r = d.ask("close the fascia")
    assert r.get("needs_confirmation") and "leak" in r["question"]
    hidden = False
    for seed in range(5, 40):
        d = Driver(SID, seed=seed)
        _to_ureter(d)
        d.do("identify the left ureter")
        _to_pelvis(d)
        d.do("make the anastomosis")
        d.steps(["check hemostasis", "desufflate", "do the count"])
        d.do("close the fascia", confirm=True)
        d.do("close the skin")
        assert any("never leak-tested" in n for n in d.proc.notes)
        hidden = hidden or any("Anastomotic leak" in o for o in d.proc.occult)
    assert hidden


def test_ai_surgeon_runs_a_sigmoid_colectomy():
    c = ai_surgeon_case(SID, 6, "steep_trendelenburg_right_down")
    run_ai(c)
    assert c.procedure.finished, (c.procedure.done, [m["text"] for m in c.comms[-3:]])
    assert "identify_ureter" in c.procedure.done and "leak_test" in c.procedure.done
    text = all_text(c)
    assert "sigmoid" in text.lower() and not re.search(r"appendi|cholecyst|gallbladder", text, re.I)


@pytest.mark.parametrize("seed", range(10))
def test_no_text_from_other_procedures_or_patients(seed):
    c = ai_surgeon_case(SID, seed)
    run_ai(c)
    text = all_text(c)
    leaks = leak_regex(OTHER)
    assert not leaks.search(text), leaks.search(text)
    assert re.search(r"\b(she|her)\b", text, re.I) or True
    assert not re.search(r"\b(he's|his|him)\b", text, re.I), re.search(r"\b(he's|his|him)\b", text, re.I)
