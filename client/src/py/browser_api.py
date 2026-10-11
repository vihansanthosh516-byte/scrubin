"""Glue that runs inside Pyodide (a Web Worker). It stands in for the two Python servers:

  * the classic multiple-choice core (vendor/scrubin-core/server.py)   -> core_call()
  * the real-time OR engine API (engine/scrubin_engine/api/app.py)    -> api_call() / ws_*()

The worker (worker.ts) injects: js_emit(json_str) to push messages to the page, and
js_put(json_str) / js_del(id) to persist case rows in IndexedDB.
"""
import json
import os
import time

os.environ["SCRUBIN_LLM_PROXY"] = "/api/llm"

from fastapi import HTTPException  # noqa: E402

# ----------------------------------------------------------------------------------------------
# Classic multiple-choice core
# ----------------------------------------------------------------------------------------------


def _json(obj):
    return json.dumps(obj, default=str)


def core_call(method, path, body_json, query_json):
    import server as S

    body = json.loads(body_json) if body_json else {}
    q = json.loads(query_json) if query_json else {}
    try:
        if method == "POST" and path == "/start":
            out = S.start(S.StartRequest(**body))
        elif method == "POST" and path == "/next":
            out = S.next_tick(S.NextRequest(**body))
        elif method == "POST" and path == "/decide":
            out = S.decide(S.DecideRequest(**body))
        elif method == "POST" and path == "/reset":
            out = S.reset(S.ResetRequest(**body))
        elif method == "POST" and path == "/complicate":
            narrative = body.get("narrative")
            out = S.complicate(S.ComplicateRequest(**{k: v for k, v in body.items() if k in S.ComplicateRequest.model_fields}))
            if narrative and isinstance(out, dict):
                out = {**out, "narrative": narrative}
        elif method == "POST" and path == "/tick":
            out = S.tick_session(S.NextRequest(**body))
        elif method == "POST" and path == "/complete":
            out = S.complete_session(S.NextRequest(**body))
        elif method == "GET" and path == "/procedures":
            out = S.procedures()
        elif method == "GET" and path == "/scenarios":
            out = S.scenarios()
        elif method == "GET" and path.startswith("/scenarios/"):
            out = S.scenario_by_id(path[len("/scenarios/"):])
        elif method == "GET" and path == "/procedures/search":
            out = S.procedures_search(q=q.get("q", ""), difficulty=q.get("difficulty"), tag=q.get("tag"))
        elif method == "GET" and path == "/health":
            out = S.health()
        else:
            return _json({"status": 404, "json": {"detail": "Not found"}})
        return _json({"status": 200, "json": out})
    except HTTPException as e:
        return _json({"status": e.status_code, "json": {"detail": e.detail}})
    except Exception as e:  # noqa: BLE001
        return _json({"status": 500, "json": {"error": str(e)}})


# ----------------------------------------------------------------------------------------------
# Real-time OR engine
# ----------------------------------------------------------------------------------------------

_rt = None


def _init_rt():
    global _rt
    if _rt is not None:
        return _rt
    import js  # noqa: F401  (Pyodide)
    from scrubin_engine.session import SessionStore

    class BrowserStore:
        """Case rows in memory, mirrored to IndexedDB through js_put / js_del."""

        def __init__(self):
            self.rows = {}

        def load(self, rows_json):
            for r in json.loads(rows_json):
                self.rows[r["id"]] = r

        def save(self, *, id, user_id, scenario, role, seed, tick, sim_t, status, outcome, log, score=None, debrief=None):
            now = time.time()
            prev = self.rows.get(id) or {}
            row = {"id": id, "user_id": user_id, "scenario": scenario, "role": role, "seed": seed, "tick": tick, "sim_t": sim_t,
                   "status": status, "outcome": outcome, "log": list(log),
                   "score": score if score is not None else prev.get("score"),
                   "debrief": debrief if debrief is not None else prev.get("debrief"),
                   "created_at": prev.get("created_at", now), "updated_at": now}
            self.rows[id] = row
            js_put(_json(row))  # noqa: F821 - injected by the worker

        def get(self, case_id):
            r = self.rows.get(case_id)
            return json.loads(json.dumps(r)) if r else None

        def list_for_user(self, user_id, limit=50):
            keys = ("id", "scenario", "role", "seed", "tick", "sim_t", "status", "outcome", "score", "created_at", "updated_at")
            rows = [r for r in self.rows.values() if r.get("user_id") == user_id]
            rows.sort(key=lambda r: r["updated_at"], reverse=True)
            return [{k: r[k] for k in keys} for r in rows[:limit]]

        def delete(self, case_id):
            self.rows.pop(case_id, None)
            js_del(case_id)  # noqa: F821

        def flush(self):
            pass

    db = BrowserStore()
    _rt = {"db": db, "store": SessionStore(db), "clients": {}}
    return _rt


def rt_load(rows_json):
    _init_rt()["db"].load(rows_json)


class _Client:
    """Stands in for a WebSocket: Session.broadcast() calls send_json()."""

    def __init__(self, case_id):
        self.case_id = case_id

    async def send_json(self, data):
        js_emit(_json({"type": "ws", "case_id": self.case_id, "data": data}))  # noqa: F821


def _case_info(s):
    from scrubin_engine.scenarios import SCENARIOS

    sc = SCENARIOS[s.scenario_id]
    return {"case_id": s.id, "seed": s.seed, "role": s.role, "scenario": {k: v for k, v in sc.items() if k != "build_patient"},
            "patient": s.case.patient.public_summary(), "t": s.case.t, "status": s.case.status}


async def api_call(method, path, body_json, query_json):
    from scrubin_engine.physiology.drugs import DRUGS, FLUIDS
    from scrubin_engine.scenarios import SCENARIOS
    from scrubin_engine.scoring.debrief import build_debrief
    from scrubin_engine.session import SPEEDS, rebuild_case, replay_frames
    from scrubin_engine.surgery import load_spec

    rt = _init_rt()
    store, db = rt["store"], rt["db"]
    body = json.loads(body_json) if body_json else {}
    q = json.loads(query_json) if query_json else {}

    def resume(case_id):
        s = store.resume(case_id)
        if s is None:
            raise HTTPException(404, "case not found")
        return s

    try:
        if method == "GET" and path == "/health":
            return _json({"status": 200, "json": {"ok": True, "sessions": len(store.sessions), "llm": True}})
        if method == "GET" and path == "/scenarios":
            return _json({"status": 200, "json": [{k: v for k, v in s.items() if k != "build_patient"} for s in SCENARIOS.values()]})
        if method == "GET" and path == "/catalog":
            instruments = {}
            for sid in SCENARIOS:
                instruments.update({k: v["name"] for k, v in load_spec(sid)["instruments"].items()})
            return _json({"status": 200, "json": {"drugs": [d.public() for d in DRUGS.values()], "fluids": list(FLUIDS),
                                                  "speeds": list(SPEEDS), "instruments": instruments}})
        if method == "POST" and path == "/cases":
            if body.get("scenario", "appendectomy") not in SCENARIOS:
                raise HTTPException(404, "unknown scenario")
            s = store.create(body.get("scenario", "appendectomy"), body.get("role", "anesthesia"), body.get("seed"), body.get("user_id"))
            return _json({"status": 200, "json": _case_info(s)})
        if method == "GET" and path.startswith("/users/") and path.endswith("/cases"):
            uid = path[len("/users/"):-len("/cases")]
            rows = db.list_for_user(uid)
            for r in rows:
                sc = SCENARIOS.get(r["scenario"])
                r["scenario_name"] = sc["name"] if sc else r["scenario"]
                live = store.get(r["id"])
                if live is not None:
                    r.update(tick=live.case.tick, sim_t=live.case.t, status=live.case.status, outcome=live.case.outcome)
                    if r.get("score") is None and live.case.status == "ended":
                        r["score"] = build_debrief(live.case).get("score")
                if r.get("score") is None and r.get("status") == "ended":
                    r["score"] = ((db.get(r["id"]) or {}).get("debrief") or {}).get("score")
            return _json({"status": 200, "json": rows})
        parts = path.strip("/").split("/")
        if len(parts) >= 2 and parts[0] == "cases":
            cid = parts[1]
            act = parts[2] if len(parts) > 2 else ""
            if method == "POST" and act == "resume":
                s = resume(cid)
                s.control(paused=True)
                return _json({"status": 200, "json": _case_info(s)})
            if method == "DELETE" and not act:
                live = store.sessions.pop(cid, None)
                if live is not None and live.task:
                    live.task.cancel()
                db.delete(cid)
                return _json({"status": 200, "json": {"ok": True}})
            if method == "GET" and act == "replay":
                live = store.get(cid)
                if live is not None:
                    live.persist()
                rec = db.get(cid)
                if rec is None:
                    raise HTTPException(404, "case not found")
                data = replay_frames(rec, max(1.0, min(30.0, float(q.get("every_s", 5.0)))))
                data.update(scenario=rec["scenario"], role=rec["role"], seed=rec["seed"])
                return _json({"status": 200, "json": data})
            if method == "GET" and act == "debrief":
                end = str(q.get("end", "")).lower() in ("1", "true")
                live = store.get(cid)
                if live is not None:
                    return _json({"status": 200, "json": live.debrief(end=end)})
                rec = db.get(cid)
                if rec is None:
                    raise HTTPException(404, "case not found")
                if rec["debrief"] and rec["status"] == "ended":
                    return _json({"status": 200, "json": rec["debrief"]})
                return _json({"status": 200, "json": build_debrief(rebuild_case(rec))})
        return _json({"status": 404, "json": {"detail": "Not found"}})
    except HTTPException as e:
        return _json({"status": e.status_code, "json": {"detail": e.detail}})
    except Exception as e:  # noqa: BLE001
        return _json({"status": 500, "json": {"error": str(e)}})


async def ws_open(case_id):
    rt = _init_rt()
    s = rt["store"].resume(case_id)
    if s is None:
        js_emit(_json({"type": "ws", "case_id": case_id, "data": {"type": "error", "error": "case not found"}}))  # noqa: F821
        return
    client = rt["clients"].get(case_id)
    if client is None:
        client = rt["clients"][case_id] = _Client(case_id)
    s.clients[client] = 0
    await s.broadcast()


async def ws_msg(case_id, msg_json):
    rt = _init_rt()
    s = rt["store"].get(case_id)
    if s is None:
        return
    msg = json.loads(msg_json)
    kind = msg.get("type")
    client = rt["clients"].get(case_id)
    if kind == "action":
        result = s.submit_action(msg.get("action") or {})
        js_emit(_json({"type": "ws", "case_id": case_id, "data": {"type": "result", "result": result, "ref": msg.get("ref")}}))  # noqa: F821
    elif kind == "utterance":
        result = await s.utterance(msg.get("text", ""))
        js_emit(_json({"type": "ws", "case_id": case_id, "data": {"type": "parsed", "result": result, "ref": msg.get("ref")}}))  # noqa: F821
    elif kind == "control":
        s.control(msg.get("speed"), msg.get("paused"))
    await s.broadcast()


def ws_close(case_id):
    rt = _init_rt()
    s = rt["store"].get(case_id)
    client = rt["clients"].pop(case_id, None)
    if s is not None and client is not None:
        s.clients.pop(client, None)
        if not s.clients:
            s.control(paused=True)
            s.persist()
