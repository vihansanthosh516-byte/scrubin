import json

import httpx

from scrubin_engine.store import SupabaseCaseStore, make_store, CaseStore


def _fake_supabase():
    rows: dict[str, dict] = {}

    def handler(req: httpx.Request) -> httpx.Response:
        q = dict(req.url.params)
        if req.method == "POST":
            row = json.loads(req.content)
            rows[row["id"]] = row
            return httpx.Response(201)
        if req.method == "GET":
            if "id" in q:
                r = rows.get(q["id"].removeprefix("eq."))
                return httpx.Response(200, json=[r] if r else [])
            uid = q["user_id"].removeprefix("eq.")
            out = sorted((r for r in rows.values() if r["user_id"] == uid), key=lambda r: -r["updated_at"])
            return httpx.Response(200, json=out)
        if req.method == "DELETE":
            rows.pop(q["id"].removeprefix("eq."), None)
            return httpx.Response(204)
        return httpx.Response(405)

    return rows, httpx.Client(transport=httpx.MockTransport(handler), base_url="https://x")


def _save(store, **kw):
    base = dict(id="c1", user_id="u1", scenario="appendectomy", role="anesthesia", seed=5, tick=10, sim_t=5.0,
                status="running", outcome=None, log=[{"tick": 1, "action": {"type": "gas"}}])
    base.update(kw)
    store.save(**base)


def test_supabase_store_roundtrip():
    rows, client = _fake_supabase()
    s = SupabaseCaseStore("https://x", "key")
    s._http = client
    _save(s, score=None, debrief={"score": 80})
    _save(s, tick=20)  # later save without debrief keeps the cached one
    s.flush()
    assert rows["c1"]["tick"] == 20 and rows["c1"]["debrief"] == {"score": 80}
    s._cache.clear()
    assert s.get("c1")["seed"] == 5
    assert [r["id"] for r in s.list_for_user("u1")] == ["c1"]
    s.delete("c1")
    assert s.get("c1") is None


def test_make_store_defaults_to_sqlite(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    assert isinstance(make_store(), CaseStore)
