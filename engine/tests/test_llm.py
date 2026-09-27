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


def test_rate_limited_model_falls_back_to_next_free_model(monkeypatch):
    import asyncio
    import json as _json

    import httpx

    import scrubin_engine.language.llm as L

    calls = []

    def handler(request: httpx.Request) -> httpx.Response:
        model = _json.loads(request.content)["model"]
        calls.append(model)
        if model == "primary":
            return httpx.Response(429, json={"error": "rate limited"})
        body = {"actions": [{"type": "volatile", "percent": 2.0}], "clarification": None, "reply": None}
        return httpx.Response(200, json={"choices": [{"message": {"content": _json.dumps(body)}}]})

    real_client = httpx.AsyncClient
    monkeypatch.setattr(L.httpx, "AsyncClient", lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw))
    monkeypatch.setattr(L, "MODEL", "primary")
    monkeypatch.setattr(L, "FALLBACK_MODELS", ["backup"])
    monkeypatch.setattr(L, "api_key", lambda: "test")
    r = asyncio.run(L.llm_parse("sevo two", {}))
    assert calls == ["primary", "backup"]
    assert r.actions[0]["percent"] == 2.0


def test_openrouter_backup_used_when_all_groq_models_limited(monkeypatch):
    import asyncio
    import json as _json

    import httpx

    import scrubin_engine.language.llm as L

    hosts = []

    def handler(request: httpx.Request) -> httpx.Response:
        hosts.append(request.url.host)
        if request.url.host != "openrouter.ai":
            return httpx.Response(429, json={"error": "rate limited"})
        body = {"actions": [{"type": "volatile", "percent": 3.0}]}
        return httpx.Response(200, json={"choices": [{"message": {"content": "```json\n" + _json.dumps(body) + "\n```"}}]})

    real_client = httpx.AsyncClient
    monkeypatch.setattr(L.httpx, "AsyncClient", lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw))
    monkeypatch.setattr(L, "api_key", lambda: "groq-test")
    monkeypatch.setenv("OPENROUTER_API_KEY", "or-test")
    r = asyncio.run(L.llm_parse("sevo three", {}))
    assert hosts[-1] == "openrouter.ai" and hosts.count("api.groq.com") == 1 + len(L.FALLBACK_MODELS)
    assert r.actions[0]["percent"] == 3.0
