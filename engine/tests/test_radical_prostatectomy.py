import re

import pytest

from proc_helpers import Driver, ai_surgeon_case, all_text, leak_regex, run_ai

SID = "radical_prostatectomy"
OTHER = r"|inguinal|iliopubic|sigmoid|uterus|hysterect|nephrect|renal|ureter identified"


def _to_pelvis(d, dock_first=False):
    c = d.c
    c.submit({"type": "say", "intent": "time_out"})
    c.submit({"type": "position", "position": "steep_trendelenburg"})
    d.do("prep and drape")
    d.do("place the foley")
    d.steps(["skin incision", "hasson open entry", "insufflate", "camera in", "place the working ports"], confirm=True)
    d.do("dock the robot")
    d.do("survey the pelvis")


def _dissect(d, ligate=True):
    d.steps(["drop the bladder", "incise the endopelvic fascia"])
    if ligate:
        d.do("ligate the dorsal venous complex")
    d.steps(["divide the bladder neck", "dissect the seminal vesicles", "develop the plane behind denonvilliers fascia"])


def _decide(d, nerves=None):
    ece = d.c.patient.hidden["ece"]
    spare = (not ece) if nerves is None else nerves
    d.do("spare the nerves" if spare else "wide excision")


def _finish(d, leak=True):
    d.steps(["divide the urethra", "bag the prostate", "urethrovesical anastomosis"])
    if leak:
        d.do("leak test")
    d.steps(["extract the prostate", "undock the robot", "check hemostasis", "desufflate", "do the count"])
    d.do("close the fascia", confirm=True)
    d.do("close the skin")


def test_full_prostatectomy_as_surgeon_reaches_pacu_and_airway_checks_happen():
    d = Driver(SID, seed=3)
    assert "James" in d.c.patient.name
    _to_pelvis(d)
    _dissect(d)
    _decide(d)
    _finish(d)
    assert d.proc.finished, d.proc.done
    assert not any(k in o for o in d.proc.occult for k in ("Positive surgical margin", "not detected", "Thermal injury to the neurovascular")), d.proc.occult
    assert d.c.metrics.sec_steep > 2 * 3600 and d.c.metrics.max_peak_pressure > 22
    assert d.to_pacu() == "pacu"
    text = " ".join(m["text"] for m in d.c.comms)
    assert "puffy" in text and "cuff-leak" in text   # the AI anesthesiologist tests the cuff leak before extubating


def test_robot_waits_for_the_position_and_locks_the_table():
    d = Driver(SID, seed=3)
    d.c.submit({"type": "say", "intent": "time_out"})
    d.do("prep and drape")
    d.do("place the foley")
    d.steps(["skin incision", "hasson open entry", "insufflate", "camera in", "place the working ports"], confirm=True)
    r = d.ask("dock the robot")
    assert r.get("ok") is False and "Trendelenburg" in r["error"]
    d.c.submit({"type": "position", "position": "steep_trendelenburg"})
    d.do("dock the robot")
    r = d.c.submit({"type": "position", "position": "level"})
    assert d.c.position == "steep_trendelenburg" and "docked" in " ".join(m["text"] for m in d.c.comms[-3:])


def test_dividing_the_dvc_unligated_is_challenged_and_bleeds():
    d = Driver(SID, seed=4)
    _to_pelvis(d)
    _dissect(d, ligate=False)
    _decide(d)
    r = d.ask("divide the urethra")
    assert r.get("needs_confirmation") and "venous complex" in r["question"]
    d.c.submit({"type": "confirm", "accept": True})
    while d.proc.running is not None:
        d.c.step()
    assert d.proc.bleeders and any("without being suture-ligated" in n for n in d.proc.notes)


def test_sparing_the_nerves_against_a_suspicious_capsule_leaves_a_hidden_positive_margin():
    for seed in range(1, 40):
        d = Driver(SID, seed=seed)
        if not d.c.patient.hidden["ece"]:
            continue
        _to_pelvis(d)
        _dissect(d)
        assert any("extraprostatic" in f for f in d.proc.findings)
        d.do("spare the nerves with clips")
        assert any("Positive surgical margin" in o for o in d.proc.occult)
        return
    pytest.fail("no seed with ece")


def test_skipping_the_leak_test_is_challenged_and_can_hide_a_leak():
    d = Driver(SID, seed=5)
    _to_pelvis(d)
    _dissect(d)
    _decide(d)
    d.steps(["divide the urethra", "bag the prostate", "urethrovesical anastomosis", "extract the prostate", "undock the robot", "check hemostasis", "desufflate", "do the count"])
    r = d.ask("close the fascia")
    assert r.get("needs_confirmation") and "leak" in r["question"]
    hidden = False
    for seed in range(5, 40):
        d = Driver(SID, seed=seed)
        _to_pelvis(d)
        _dissect(d)
        _decide(d)
        d.steps(["divide the urethra", "bag the prostate", "urethrovesical anastomosis", "extract the prostate", "undock the robot", "check hemostasis", "desufflate", "do the count"])
        d.do("close the fascia", confirm=True)
        d.do("close the skin")
        assert any("never leak-tested" in n for n in d.proc.notes)
        hidden = hidden or any("anastomotic leak" in o.lower() for o in d.proc.occult)
    assert hidden


def test_ai_surgeon_runs_a_prostatectomy():
    c = ai_surgeon_case(SID, 6)
    run_ai(c)
    assert c.procedure.finished, (c.procedure.done, [m["text"] for m in c.comms[-3:]])
    done = c.procedure.done
    assert done.index("dvc_ligate") < done.index("divide_urethra") and "leak_test" in done and "undock_robot" in done
    assert c.metrics.sec_steep > 2 * 3600 and c.face_edema > 0.3
    text = all_text(c)
    assert "prostatectomy" in text.lower() and not re.search(r"appendi|cholecyst|gallbladder", text, re.I)


@pytest.mark.parametrize("seed", range(10))
def test_no_text_from_other_procedures_or_patients(seed):
    c = ai_surgeon_case(SID, seed)
    run_ai(c)
    text = all_text(c)
    leaks = leak_regex(OTHER)
    assert not leaks.search(text), leaks.search(text)
    assert not re.search(r"\b(she|her)\b", text, re.I), re.search(r"\b(she|her)\b", text, re.I)
