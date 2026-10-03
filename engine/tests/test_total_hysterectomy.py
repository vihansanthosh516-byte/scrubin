import re

import pytest

from proc_helpers import Driver, ai_surgeon_case, all_text, leak_regex, run_ai

SID = "total_hysterectomy"
OTHER = r"|inguinal|iliopubic|sigmoid|ima pedicle|prostate|nephrect|urethrovesical"


def _start(d):
    c = d.c
    c.submit({"type": "say", "intent": "time_out"})
    d.do("prep and drape")
    d.do("place the uterine manipulator")
    d.steps(["umbilical skin incision", "hasson open entry", "insufflate", "camera in", "place the working ports", "explore"], confirm=True)
    c.submit({"type": "position", "position": "steep_trendelenburg"})
    if d.proc.flag("adhesions"):
        d.do("take down adhesions")
    d.steps(["divide the round ligaments", "divide the utero-ovarian ligaments", "develop the bladder flap", "open the broad ligament"])


def _tail(d, cuff=True):
    d.steps(["colpotomy", "remove the uterus"])
    if cuff:
        d.do("close the vaginal cuff")
    for t in ["check hemostasis", "desufflate", "do the count", "close the fascia", "close the skin"]:
        d.do(t, confirm=True)


def test_full_hysterectomy_as_surgeon_reaches_pacu():
    d = Driver(SID, seed=3)
    assert "Priya" in d.c.patient.name and d.c.patient.allergies == ("latex (hives)",)
    _start(d)
    d.do("identify the ureter")
    d.do("coagulate the uterine arteries")
    _tail(d)
    assert d.proc.finished, d.proc.done
    assert not any("Ureteric" in o or "cuff" in o for o in d.proc.occult), d.proc.occult
    assert d.to_pacu() == "pacu"


def test_uterine_arteries_before_the_ureter_are_challenged_and_hidden():
    d = Driver(SID, seed=4)
    _start(d)
    r = d.ask("coagulate the uterine arteries")
    assert r.get("needs_confirmation") and "ureter" in r["question"]
    found = False
    for seed in range(4, 22):
        d = Driver(SID, seed=seed)
        _start(d)
        d.do("coagulate the uterine arteries", confirm=True)
        _tail(d)
        assert any("before the ureter" in n for n in d.proc.notes)
        found = found or any("Ureteric injury" in o for o in d.proc.occult)
    assert found


def test_cystoscopy_can_catch_a_hidden_ureter_injury():
    caught = False
    for seed in range(4, 40):
        d = Driver(SID, seed=seed)
        _start(d)
        d.do("coagulate the uterine arteries", confirm=True)
        had = any("Ureteric" in o for o in d.proc.occult)
        d.steps(["colpotomy", "remove the uterus", "close the vaginal cuff", "cystoscopy"])
        if had and not any("Ureteric" in o for o in d.proc.occult):
            caught = True
            assert any("Cystoscopy caught" in n for n in d.proc.notes)
            break
    assert caught


def test_leaving_the_cuff_open_is_challenged_and_hidden():
    d = Driver(SID, seed=5)
    _start(d)
    d.do("identify the ureter")
    d.do("coagulate the uterine arteries")
    d.steps(["colpotomy", "remove the uterus", "check hemostasis", "desufflate", "do the count"])
    r = d.ask("close the fascia")
    assert r.get("needs_confirmation") and "cuff" in r["question"]
    d.accept()
    d.do("close the skin")
    assert any("Vaginal cuff left open" in o for o in d.proc.occult)


def test_ai_surgeon_runs_a_hysterectomy_and_steep_trendelenburg_costs_compliance():
    c = ai_surgeon_case(SID, 6)
    run_ai(c)
    assert c.procedure.finished, (c.procedure.done, [m["text"] for m in c.comms[-3:]])
    assert "identify_ureter" in c.procedure.done and "close_cuff" in c.procedure.done
    assert c.position in ("steep_trendelenburg", "level")
    assert c.metrics.max_peak_pressure > 22 and c.metrics.sec_steep > 1800
    text = all_text(c)
    assert "hysterectomy" in text.lower() and not re.search(r"appendi|cholecyst|gallbladder", text, re.I)


@pytest.mark.parametrize("seed", range(10))
def test_no_text_from_other_procedures_or_patients(seed):
    c = ai_surgeon_case(SID, seed)
    run_ai(c)
    text = all_text(c)
    leaks = leak_regex(OTHER)
    assert not leaks.search(text), leaks.search(text)
    assert not re.search(r"\b(he's|he|his|him)\b", text, re.I), re.search(r"\b(he's|he|his|him)\b", text, re.I)
