from helpers import appy, induce_and_intubate, monitors, preoxygenate

from scrubin_engine.replay import replay
from scrubin_engine.scenarios import SCENARIOS


def _script(c):
    monitors(c)
    preoxygenate(c, 120)
    induce_and_intubate(c)
    c.submit({"type": "volatile", "percent": 2.0})
    c.run(300)
    c.submit({"type": "drug", "drug": "phenylephrine", "dose": 100})
    c.run(120)


def test_same_seed_same_actions_same_trajectory():
    a, b = appy(seed=42), appy(seed=42)
    _script(a)
    _script(b)
    assert a.truth() == b.truth()
    assert a.snapshot() == b.snapshot()


def test_different_seed_changes_hidden_patient():
    hidden = {tuple(sorted(appy(seed=s).patient.hidden.items())) for s in range(10)}
    assert len(hidden) > 1


def test_replay_from_log_matches_live_case():
    live = appy(seed=7)
    _script(live)
    rebuilt = replay(SCENARIOS["appendectomy"], "anesthesia", 7, live.log, live.tick)
    assert rebuilt.truth() == live.truth()
    assert [e for e in rebuilt.events] == [e for e in live.events]
