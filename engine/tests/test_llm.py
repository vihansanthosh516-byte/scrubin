from scrubin_engine.language.llm import coerce_llm_output


def test_llm_output_is_validated_and_filtered():
    raw = {
        "actions": [
            {"type": "drug", "drug": "propofol", "dose": 150, "unit": "mg"},
            {"type": "drug", "drug": "unobtainium", "dose": 1},
            {"type": "teleport", "where": "moon"},
            {"type": "vent", "mode": "vcv", "tv_ml": 450, "rr": None},
        ],
        "clarification": None,
        "reply": {"from": "patient", "text": "Last ate at 8 last night."},
    }
    r = coerce_llm_output(raw, "orig words")
    assert [a["type"] for a in r.actions] == ["drug", "vent"]
    assert r.actions[0]["utterance"] == "orig words"
    assert "rr" not in r.actions[1]
    assert r.reply == {"from": "patient", "text": "Last ate at 8 last night."}


def test_llm_garbage_becomes_unparsed():
    r = coerce_llm_output({"actions": "nope"}, "hmm")
    assert r.unparsed == ["hmm"] and not r.actions
