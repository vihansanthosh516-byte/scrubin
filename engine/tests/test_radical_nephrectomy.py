import re

import pytest

from proc_helpers import Driver, ai_surgeon_case, all_text, leak_regex, run_ai

SID = "radical_nephrectomy"
OTHER = r"|inguinal|iliopubic|sigmoid|uterus|hysterect|prostat|urethrovesical|ureter identified"


def _to_hilum(d):
    c = d.c
    c.submit({"type": "say", "intent": "time_out"})
    c.submit({"type": "position", "position": "lateral_decubitus"})
    d.do("prep and drape")
    d.steps(["skin incision", "hasson open entry", "insufflate", "camera in", "place the working ports", "explore"], confirm=True)
    if d.proc.flag("adhesions"):
        d.do("take down adhesions")
    d.do("reflect the colon")
    d.do("kocher the duodenum" if d.proc.case.patient.hidden["side"] == "right" else "drop the spleen")
    d.do("expose the hilum")


def _artery_first(d, survey=True):
    if survey:
        d.do("survey the hilum for an accessory artery")
    d.steps(["isolate the renal artery", "clip the renal artery"])
    if d.proc.flag("accessory_found"):
        d.do("clip the accessory artery")
    d.steps(["isolate the renal vein", "staple the renal vein"])


def _adrenal_and_out(d):
    inv = d.c.patient.hidden["adrenal_involved"]
    d.do("take the adrenal" if inv else "spare the adrenal")
    d.steps(["free the kidney", "bag the kidney", "extract the kidney"])
    for t in ["check hemostasis", "desufflate", "do the count", "close the fascia", "close the skin"]:
        d.do(t, confirm=True)


def test_full_nephrectomy_as_surgeon_reaches_pacu():
    d = Driver(SID, seed=3)
    assert "Walter" in d.c.patient.name
    _to_hilum(d)
    _artery_first(d)
    _adrenal_and_out(d)
    assert d.proc.finished, d.proc.done
    assert not d.proc.occult, d.proc.occult
    assert d.to_pacu() == "pacu"


def test_prep_waits_for_the_flank_position_and_wrong_side_step_is_blocked():
    d = Driver(SID, seed=3)
    r = d.ask("prep and drape")
    assert r.get("ok") is False and "lateral" in r["error"]
    d.c.submit({"type": "position", "position": "lateral_decubitus"})
    assert d.c.load.lateral_flank and d.c.position == "lateral_decubitus"
    d.c.submit({"type": "say", "intent": "time_out"})
    d.do("prep and drape")
    d.steps(["skin incision", "hasson open entry", "insufflate", "camera in", "place the working ports", "explore"], confirm=True)
    d.do("reflect the colon")
    wrong = "drop the spleen" if d.c.patient.hidden["side"] == "right" else "kocher the duodenum"
    r = d.ask(wrong)
    assert r.get("ok") is False


def test_vein_before_artery_is_challenged_and_bleeds():
    d = Driver(SID, seed=4)
    _to_hilum(d)
    d.steps(["isolate the renal artery", "isolate the renal vein"])
    r = d.ask("staple the renal vein")
    assert r.get("needs_confirmation") and "artery" in r["question"]
    d.c.submit({"type": "confirm", "accept": True})
    while d.proc.running is not None:
        d.c.step()
    assert d.proc.bleeders
    assert any("before the renal artery" in n for n in d.proc.notes)


def test_missed_accessory_artery_leaves_a_hidden_problem():
    found = False
    for seed in range(1, 30):
        d = Driver(SID, seed=seed)
        if not d.c.patient.hidden["accessory_renal_artery"]:
            continue
        _to_hilum(d)
        _artery_first(d, survey=False)
        found = any("second renal artery" in o for o in d.proc.occult)
        assert found
        break
    assert found


def test_wrong_adrenal_decision_is_reported():
    for seed in range(1, 40):
        d = Driver(SID, seed=seed)
        if d.c.patient.hidden["adrenal_involved"]:
            _to_hilum(d)
            _artery_first(d)
            d.do("spare the adrenal")
            assert any("adrenal was involved" in o for o in d.proc.occult)
            return
    pytest.fail("no seed with an involved adrenal")


def test_ai_surgeon_runs_a_nephrectomy():
    c = ai_surgeon_case(SID, 6)
    run_ai(c)
    assert c.procedure.finished, (c.procedure.done, [m["text"] for m in c.comms[-3:]])
    assert c.position in ("lateral_decubitus", "level")
    done = c.procedure.done
    assert done.index("clip_renal_artery") < done.index("clip_renal_vein") and "survey_hilum" in done
    text = all_text(c)
    assert "nephrectomy" in text.lower() and not re.search(r"appendi|cholecyst|gallbladder", text, re.I)


@pytest.mark.parametrize("seed", range(10))
def test_no_text_from_other_procedures_or_patients(seed):
    c = ai_surgeon_case(SID, seed)
    run_ai(c)
    text = all_text(c)
    leaks = leak_regex(OTHER)
    assert not leaks.search(text), leaks.search(text)
    assert not re.search(r"\b(she|her)\b", text, re.I), re.search(r"\b(she|her)\b", text, re.I)
    # the side of the tumour is consistent everywhere
    side = c.patient.hidden["side"]
    other = "left" if side == "right" else "right"
    assert not re.search(rf"\b{other} (kidney|flank)", text, re.I), re.search(rf"\b{other} (kidney|flank)", text, re.I)
