"""Real-time session: paces a deterministic Case against the wall clock.

Actions arriving over the WebSocket are applied between ticks (asyncio is
single-threaded, so there is no race), stamped with the tick they landed on,
and so replay exactly.
"""

from __future__ import annotations

import asyncio
import secrets
import time
from dataclasses import dataclass, field
from typing import Any, Optional

from fastapi import WebSocket

from .case import DT, Case
from .factory import build_case
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

    async def utterance(self, text: str) -> dict:
        """Free text / transcribed speech from the trainee."""
        self.last_activity = time.time()
        text = text.strip()
        if not text:
            return {"ok": False}
        c = self.case
        c.say("trainee", text, kind="trainee")
        actions: list[dict] = []
        clarification = None
        reply = None
        source = "grammar"
        if self.role == "surgeon" and c.procedure is not None:
            a = parse_surgical(text, c.procedure.spec, c.procedure)
            if a is not None:
                actions = [a]
                source = "surgical"
        if not actions:
            result = await interpret(text, self._context())
            actions, clarification, reply, source = result.actions, result.clarification, result.reply, result.source
        results = [self.submit_action(a) for a in actions]
        responder = "anesthesia" if self.role == "surgeon" else "circulator"
        if clarification:
            c.say(responder, clarification, kind="question")
        if reply:
            c.say(reply["from"], reply["text"])
        if not actions and not clarification and not reply:
            c.say(responder, "Sorry — say that again?", kind="question")
        return {"ok": bool(actions) or bool(clarification) or bool(reply), "actions": actions, "results": results,
                "clarification": clarification, "source": source}

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

    def debrief(self) -> dict:
        return build_debrief(self.case)


class SessionStore:
    def __init__(self) -> None:
        self.sessions: dict[str, Session] = {}

    def create(self, scenario_id: str, role: str, seed: Optional[int] = None) -> Session:
        seed = seed if seed is not None else secrets.randbelow(2**31)
        sid = secrets.token_urlsafe(8)
        s = Session(sid, scenario_id, role, seed, build_case(scenario_id, role, seed))
        self.sessions[sid] = s
        s.task = asyncio.get_event_loop().create_task(s.run())
        self._gc()
        return s

    def get(self, sid: str) -> Optional[Session]:
        return self.sessions.get(sid)

    def _gc(self) -> None:
        now = time.time()
        for sid, s in list(self.sessions.items()):
            if s.task and s.task.done() or (not s.clients and now - s.last_activity > 3 * 3600):
                if s.task and not s.task.done():
                    s.task.cancel()
                self.sessions.pop(sid, None)
