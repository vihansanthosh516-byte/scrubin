"""Real-time session: paces a deterministic Case against the wall clock.

Actions arriving over the WebSocket are applied between ticks (asyncio is
single-threaded, so there is no race), stamped with the tick they landed on,
and so replay exactly.
"""

from __future__ import annotations

import re

import asyncio
import secrets
import time
from dataclasses import dataclass, field
from typing import Any, Optional

from fastapi import WebSocket

from .case import DT, Case
from .factory import build_case, case_kwargs
from .replay import replay
from .scenarios import SCENARIOS
from .store import CaseStore, make_store
from .language import interpret
from .scoring.debrief import build_debrief
from .surgery.parse import parse_surgical

SPEEDS = (0.0, 0.5, 1.0, 2.0, 5.0, 10.0)
BROADCAST_HZ = 5.0
MAX_STEPS_PER_LOOP = 60


@dataclass
class Session:
    id: str
    scenario_id: str
    role: str
    seed: int
    case: Case
    speed: float = 1.0
    paused: bool = True
    clients: dict[WebSocket, int] = field(default_factory=dict)  # ws -> last comms id sent
    task: Optional[asyncio.Task] = None
    created: float = field(default_factory=time.time)
    last_activity: float = field(default_factory=time.time)
    user_id: Optional[str] = None
    store: Optional[CaseStore] = None
    _saved_tick: int = -1
    _saved_status: str = ""

    # ------------------------------------------------------------------
    async def run(self) -> None:
        acc = 0.0
        last = time.perf_counter()
        last_broadcast = 0.0
        try:
            while True:
                await asyncio.sleep(0.05)
                now = time.perf_counter()
                wall = now - last
                last = now
                if not self.paused and self.case.status != "ended":
                    acc += wall * self.speed
                    steps = 0
                    while acc >= DT and steps < MAX_STEPS_PER_LOOP:
                        self.case.step()
                        acc -= DT
                        steps += 1
                    if steps == MAX_STEPS_PER_LOOP:
                        acc = 0.0  # fell behind; drop time rather than spiral
                if now - last_broadcast >= 1.0 / BROADCAST_HZ:
                    last_broadcast = now
                    await self.broadcast()
                    self.persist(throttle_ticks=20)
                if not self.clients and time.time() - self.last_activity > 3600:
                    return
        except asyncio.CancelledError:
            return

    async def broadcast(self) -> None:
        dead = []
        for ws, since in list(self.clients.items()):
            snap = self.case.snapshot(since_comms=since)
            snap.update(type="state", speed=self.speed, paused=self.paused)
            try:
                await ws.send_json(snap)
                if snap["comms"]:
                    self.clients[ws] = snap["comms"][-1]["id"]
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.clients.pop(ws, None)

    def persist(self, throttle_ticks: int = 0, with_debrief: bool = False) -> None:
        """Autosave seed + action log (enough to rebuild the case exactly)."""
        c = self.case
        if self.store is None:
            return
        changed = c.tick - self._saved_tick >= throttle_ticks or c.status != self._saved_status
        if not changed and not with_debrief:
            return
        debrief = None
        score = None
        if with_debrief or (c.status == "ended" and self._saved_status != "ended"):
            debrief = build_debrief(c)
            score = debrief.get("score")
        self.store.save(id=self.id, user_id=self.user_id, scenario=self.scenario_id, role=self.role, seed=self.seed,
                        tick=c.tick, sim_t=c.t, status=c.status, outcome=c.outcome, log=c.log, score=score, debrief=debrief)
        self._saved_tick, self._saved_status = c.tick, c.status

    # ------------------------------------------------------------------
    def control(self, speed: Optional[float] = None, paused: Optional[bool] = None) -> None:
        if speed is not None:
            self.speed = min(SPEEDS, key=lambda s: abs(s - speed))
        if paused is not None:
            self.paused = paused
        self.last_activity = time.time()

    def submit_action(self, action: dict) -> dict:
        self.last_activity = time.time()
        try:
            return self.case.submit(action)
        except Exception as exc:  # validation errors etc.
            return {"ok": False, "error": str(exc)}
        finally:
            # Save every order at once: if the engine restarts, a rebuilt case must not lose it.
            self.persist()

    async def utterance(self, text: str) -> dict:
        """Free text / transcribed speech from the trainee."""
        self.last_activity = time.time()
        text = text.strip()
        if not text:
            return {"ok": False}
        c = self.case
        c.record_say("trainee", text, kind="trainee")
        self.persist()
        actions: list[dict] = []
        clarification = None
        reply = None
        source = "grammar"
        if self.role == "surgeon" and c.procedure is not None:
            actions, leftover = self._surgeon_parse(text)
            if actions and not leftover:
                source = "surgical"
            else:
                actions = []  # partly understood: let the LLM read the whole sentence
        if not actions and self.role == "surgeon" and ANESTHESIA_ASK.search(text.lower()):
            # Requests about the anesthetic go to the anesthesiologist, who decides
            # the drugs and doses — the language model must not ask the surgeon.
            actions = [{"type": "say", "to": "anesthesia", "text": text}]
            source = "grammar"
        if not actions:
            result = await interpret(text, self._context())
            actions, clarification, reply, source = result.actions, result.clarification, result.reply, result.source
        results = [self.submit_action(a) for a in actions]
        responder = "anesthesia" if self.role == "surgeon" else "circulator"
        if clarification:
            c.record_say(responder, clarification, kind="question")
        if reply:
            c.record_say(reply["from"], reply["text"])
        if not actions and not clarification and not reply:
            c.record_say(responder, "Sorry — say that again?", kind="question")
        return {"ok": bool(actions) or bool(clarification) or bool(reply), "actions": actions, "results": results,
                "clarification": clarification, "source": source}

    def _surgeon_parse(self, text: str) -> tuple[list[dict], list[str]]:
        """Split 'insufflate, then camera in' into steps; surgical vocabulary first,
        then the general grammar (table position, drugs for anesthesia, ...)."""
        from .language.grammar import _SPLIT, _meaningful, parse_clause

        proc = self.case.procedure
        parts = [p for p in _SPLIT.split(text) if p and p.strip()] or [text]
        actions: list[dict] = []
        leftover: list[str] = []
        for part in parts:
            low = part.lower()
            # A surgeon asking about "the pressure" means blood pressure, and the
            # anesthesiologist answers it — not the ventilator readout.
            if re.search(r"\bpressure|\bbp\b", low) and not re.search(r"airway|peak|plateau|vent|insuffl|iap|abdom", low):
                actions.append({"type": "say", "to": "anesthesia", "text": part})
                continue
            general = parse_clause(part)
            # "Desufflate" / "let the gas out" is the surgeon's own closing step,
            # not a request to stop the operation.
            if general.actions and general.actions[0].get("intent") == "stop_surgery":
                own = parse_surgical(part, proc.spec, proc)
                if own is not None:
                    actions.append(own)
                    continue
            if general.actions and general.actions[0]["type"] in ("position", "say", "confirm", "assess"):
                actions.extend(general.actions)
                continue
            a = parse_surgical(part, proc.spec, proc)
            if a is not None:
                actions.append(a)
            elif general.actions:
                actions.extend(general.actions)
            elif _meaningful(part):
                leftover.append(part)
        return actions, leftover

    def _context(self) -> dict[str, Any]:
        c = self.case
        return {
            "role": self.role,
            "airway": c.airway.device,
            "consciousness": c.eff.consciousness,
            "vent": c.machine.mode,
            "patient": c.patient.public_summary(),
            "surgical_verbs": ", ".join(t["verbs"][0] for t in c.procedure.spec["tasks"]) if c.procedure else "none",
            "instruments": ", ".join(c.procedure.spec["instruments"]) if c.procedure else "none",
            "targets": ", ".join(c.procedure.spec["targets"]) if c.procedure else "none",
        }

    def debrief(self, end: bool = False) -> dict:
        c = self.case
        if end and c.status == "emergence" and c.outcome is None and c.airway.device in ("none", "nasal_cannula", "face_mask") \
                and c.eff.bis > 75 and c.body.spont_ve > 0.4 * c.body.ve0 and c.body.sao2 > 0.92:
            # Extubated, awake and breathing: ending now is the handover to recovery.
            c.outcome = "pacu"
            c.event("case_complete", outcome="pacu")
        if end and self.case.status != "ended":
            # "End & debrief": the trainee closed the case — it is no longer resumable.
            self.case.status = "ended"
            self.case.event("case_ended", by="trainee")
        d = build_debrief(self.case)
        if self.store is not None:
            self.store.save(id=self.id, user_id=self.user_id, scenario=self.scenario_id, role=self.role, seed=self.seed,
                            tick=self.case.tick, sim_t=self.case.t, status=self.case.status, outcome=self.case.outcome,
                            log=self.case.log, score=d.get("score"), debrief=d)
            self._saved_tick, self._saved_status = self.case.tick, self.case.status
        return d


ANESTHESIA_ASK = re.compile(r"\binduc|put (him|her|them) (to sleep|under)|go to sleep|anesthe|anaesthe|deeper|\blight\b|relax|paraly"
                           r"|blood pressure|\bbp\b|pressure('s| is) low|pressor|intubat|airway|ventilat|\bsats?\b|oxygen")


def rebuild_case(record: dict, until_tick: Optional[int] = None, on_tick=None) -> Case:
    """Rebuild a saved case exactly from its seed and action log."""
    return replay(SCENARIOS[record["scenario"]], record["role"], record["seed"], record["log"],
                  record["tick"] if until_tick is None else until_tick, on_tick=on_tick,
                  **case_kwargs(record["scenario"], record["role"]))


def replay_frames(record: dict, every_s: float = 5.0) -> dict:
    """Monitor frames for the replay viewer, one every `every_s` of sim time."""
    frames: list[dict] = []
    every_s = max(every_s, float(record.get("sim_t") or 0) / 1200.0)  # long cases: keep the replay quick to build
    every = max(1, int(round(every_s / DT)))
    last_comm = [0]

    def capture(c: Case) -> None:
        if c.tick % every:
            return
        snap = c.snapshot(since_comms=last_comm[0])
        if snap["comms"]:
            last_comm[0] = snap["comms"][-1]["id"]
        frames.append({
            "t": snap["t"], "monitor": snap["monitor"], "alarms": snap["alarms"], "comms": snap["comms"],
            "airway": snap["airway"]["device"], "status": snap["status"],
            "surgery": (snap.get("surgery") or {}).get("running"),
            "iap": (snap.get("surgery") or {}).get("iap"),
        })

    c = rebuild_case(record, on_tick=capture)
    # The saved debrief is the one the trainee saw (and the score on their record) — "End & debrief"
    # isn't in the action log, so a rebuilt case would grade differently.
    saved = record.get("debrief") if record.get("status") == "ended" else None
    return {"frames": frames, "every_s": every_s, "debrief": saved or build_debrief(c)}


class SessionStore:
    def __init__(self, db: Optional[CaseStore] = None) -> None:
        self.sessions: dict[str, Session] = {}
        self.db = db or make_store()

    def _start(self, s: Session) -> Session:
        s.store = self.db
        self.sessions[s.id] = s
        s.task = asyncio.get_event_loop().create_task(s.run())
        self._gc()
        return s

    def create(self, scenario_id: str, role: str, seed: Optional[int] = None, user_id: Optional[str] = None) -> Session:
        seed = seed if seed is not None else secrets.randbelow(2**31)
        sid = secrets.token_urlsafe(8)
        s = self._start(Session(sid, scenario_id, role, seed, build_case(scenario_id, role, seed), user_id=user_id))
        s.persist()
        return s

    def resume(self, case_id: str) -> Optional[Session]:
        """Live session for a case: the running one, or rebuilt from the database."""
        live = self.sessions.get(case_id)
        if live is not None:
            return live
        rec = self.db.get(case_id)
        if rec is None:
            return None
        case = rebuild_case(rec)
        s = Session(case_id, rec["scenario"], rec["role"], rec["seed"], case, user_id=rec["user_id"])
        s._saved_tick, s._saved_status = case.tick, case.status
        return self._start(s)

    def get(self, sid: str) -> Optional[Session]:
        return self.sessions.get(sid)

    def _gc(self) -> None:
        now = time.time()
        for sid, s in list(self.sessions.items()):
            if s.task and s.task.done() or (not s.clients and now - s.last_activity > 3 * 3600):
                if s.task and not s.task.done():
                    s.task.cancel()
                s.persist()
                self.sessions.pop(sid, None)
