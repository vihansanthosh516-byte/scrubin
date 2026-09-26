"""HTTP + WebSocket API. Everything is mounted under /engine so the Vite dev
proxy (and a production reverse proxy) can forward it without rewriting."""

from __future__ import annotations

import asyncio
from typing import Literal, Optional

from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ..language.llm import api_key, transcribe
from ..physiology.drugs import DRUGS, FLUIDS
from ..scenarios import SCENARIOS
from ..session import SPEEDS, SessionStore, rebuild_case, replay_frames
from ..scoring.debrief import build_debrief
from ..surgery import load_spec

app = FastAPI(title="ScrubIn Engine", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
router = APIRouter(prefix="/engine")
store = SessionStore()


class CreateCase(BaseModel):
    scenario: str = "appendectomy"
    role: Literal["anesthesia", "surgeon"] = "anesthesia"
    seed: Optional[int] = None
    user_id: Optional[str] = None


class Utterance(BaseModel):
    text: str


class Control(BaseModel):
    speed: Optional[float] = None
    paused: Optional[bool] = None


@router.get("/health")
def health() -> dict:
    return {"ok": True, "sessions": len(store.sessions), "llm": bool(api_key())}


@router.get("/scenarios")
def scenarios() -> list[dict]:
    return [{k: v for k, v in s.items() if k != "build_patient"} for s in SCENARIOS.values()]


@router.get("/catalog")
def catalog() -> dict:
    spec = load_spec("appendectomy")
    return {
        "drugs": [d.public() for d in DRUGS.values()],
        "fluids": list(FLUIDS),
        "speeds": list(SPEEDS),
        "instruments": {k: v["name"] for k, v in spec["instruments"].items()},
    }


@router.post("/cases")
async def create_case(body: CreateCase) -> dict:
    if body.scenario not in SCENARIOS:
        raise HTTPException(404, "unknown scenario")
    s = store.create(body.scenario, body.role, body.seed, body.user_id)
    return _case_info(s)


def _case_info(s) -> dict:
    sc = SCENARIOS[s.scenario_id]
    return {
        "case_id": s.id,
        "seed": s.seed,
        "role": s.role,
        "scenario": {k: v for k, v in sc.items() if k != "build_patient"},
        "patient": s.case.patient.public_summary(),
        "t": s.case.t,
        "status": s.case.status,
    }


def _session(case_id: str):
    s = store.resume(case_id)  # live, or rebuilt from the saved action log
    if s is None:
        raise HTTPException(404, "case not found")
    return s


@router.get("/users/{user_id}/cases")
def user_cases(user_id: str) -> list[dict]:
    rows = store.db.list_for_user(user_id)
    for r in rows:
        sc = SCENARIOS.get(r["scenario"])
        r["scenario_name"] = sc["name"] if sc else r["scenario"]
        live = store.get(r["id"])
        if live is not None:  # fresher than the last autosave
            r.update(tick=live.case.tick, sim_t=live.case.t, status=live.case.status, outcome=live.case.outcome)
    return rows


@router.post("/cases/{case_id}/resume")
async def resume(case_id: str) -> dict:
    s = _session(case_id)
    s.control(paused=True)
    return _case_info(s)


_replay_cache: dict[str, tuple[int, dict]] = {}


@router.get("/cases/{case_id}/replay")
async def replay_case(case_id: str, every_s: float = 5.0) -> dict:
    live = store.get(case_id)
    if live is not None:
        live.persist()
    rec = store.db.get(case_id)
    if rec is None:
        raise HTTPException(404, "case not found")
    cached = _replay_cache.get(case_id)
    if cached and cached[0] == rec["tick"]:
        return cached[1]
    data = await asyncio.to_thread(replay_frames, rec, max(1.0, min(30.0, every_s)))
    data.update(scenario=rec["scenario"], role=rec["role"], seed=rec["seed"])
    _replay_cache[case_id] = (rec["tick"], data)
    if len(_replay_cache) > 20:
        _replay_cache.pop(next(iter(_replay_cache)))
    return data


@router.delete("/cases/{case_id}")
def delete_case(case_id: str) -> dict:
    live = store.sessions.pop(case_id, None)
    if live is not None and live.task:
        live.task.cancel()
    store.db.delete(case_id)
    _replay_cache.pop(case_id, None)
    return {"ok": True}


@router.get("/cases/{case_id}/state")
async def state(case_id: str) -> dict:
    s = _session(case_id)
    snap = s.case.snapshot()
    snap.update(speed=s.speed, paused=s.paused)
    return snap


@router.post("/cases/{case_id}/action")
async def action(case_id: str, body: dict) -> dict:
    return _session(case_id).submit_action(body)


@router.post("/cases/{case_id}/utterance")
async def utterance(case_id: str, body: Utterance) -> dict:
    return await _session(case_id).utterance(body.text)


@router.post("/cases/{case_id}/control")
async def control(case_id: str, body: Control) -> dict:
    s = _session(case_id)
    s.control(body.speed, body.paused)
    return {"speed": s.speed, "paused": s.paused}


@router.get("/cases/{case_id}/debrief")
async def debrief(case_id: str) -> dict:
    live = store.get(case_id)
    if live is not None:
        return live.debrief()
    rec = store.db.get(case_id)
    if rec is None:
        raise HTTPException(404, "case not found")
    if rec["debrief"] and rec["status"] == "ended":
        return rec["debrief"]
    return build_debrief(await asyncio.to_thread(rebuild_case, rec))


@router.get("/cases/{case_id}/log")
async def log(case_id: str) -> dict:
    s = _session(case_id)
    return {"scenario": s.scenario_id, "role": s.role, "seed": s.seed, "tick": s.case.tick, "log": s.case.log}


@router.post("/stt")
async def stt(audio: UploadFile = File(...)) -> dict:
    data = await audio.read()
    if len(data) > 5_000_000:
        raise HTTPException(413, "audio too long")
    text = await transcribe(data, audio.filename or "speech.webm")
    if text is None:
        raise HTTPException(503, "speech-to-text unavailable (no valid API key)")
    return {"text": text}


@router.websocket("/cases/{case_id}/ws")
async def ws(websocket: WebSocket, case_id: str) -> None:
    s = store.resume(case_id)
    await websocket.accept()
    if s is None:
        await websocket.send_json({"type": "error", "error": "case not found"})
        await websocket.close()
        return
    s.clients[websocket] = 0
    await s.broadcast()
    try:
        while True:
            msg = await websocket.receive_json()
            kind = msg.get("type")
            if kind == "action":
                result = s.submit_action(msg.get("action") or {})
                await websocket.send_json({"type": "result", "result": result, "ref": msg.get("ref")})
            elif kind == "utterance":
                result = await s.utterance(msg.get("text", ""))
                await websocket.send_json({"type": "parsed", "result": result, "ref": msg.get("ref")})
            elif kind == "control":
                s.control(msg.get("speed"), msg.get("paused"))
            await s.broadcast()
    except WebSocketDisconnect:
        pass
    finally:
        s.clients.pop(websocket, None)
        if not s.clients:
            # Nobody watching: freeze the patient rather than let the case run unattended.
            s.control(paused=True)
            s.persist()


app.include_router(router)
