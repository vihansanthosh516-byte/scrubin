"""Persistent case records (SQLite).

A case is fully defined by (scenario, role, seed, action log), so that is what
we store; any moment of it can be rebuilt exactly with `replay.replay`. The
debrief is cached once the case ends.
"""

from __future__ import annotations

import json
import os
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any, Optional

DEFAULT_DB = Path(__file__).resolve().parents[1] / "data" / "cases.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  scenario TEXT NOT NULL,
  role TEXT NOT NULL,
  seed INTEGER NOT NULL,
  tick INTEGER NOT NULL DEFAULT 0,
  sim_t REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  outcome TEXT,
  score INTEGER,
  log TEXT NOT NULL DEFAULT '[]',
  debrief TEXT,
  created_at REAL NOT NULL,
  updated_at REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id, updated_at DESC);
"""


class CaseStore:
    def __init__(self, path: Optional[str] = None) -> None:
        self.path = Path(path or os.environ.get("SCRUBIN_DB", DEFAULT_DB))
        if str(self.path) != ":memory:":
            self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._db = sqlite3.connect(str(self.path), check_same_thread=False)
        self._db.row_factory = sqlite3.Row
        self._db.executescript(SCHEMA)
        self._db.commit()

    def save(self, *, id: str, user_id: Optional[str], scenario: str, role: str, seed: int, tick: int,
             sim_t: float, status: str, outcome: Optional[str], log: list[dict],
             score: Optional[int] = None, debrief: Optional[dict] = None) -> None:
        now = time.time()
        with self._lock:
            self._db.execute(
                """INSERT INTO cases (id, user_id, scenario, role, seed, tick, sim_t, status, outcome, score, log, debrief, created_at, updated_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                   ON CONFLICT(id) DO UPDATE SET tick=excluded.tick, sim_t=excluded.sim_t, status=excluded.status,
                     outcome=excluded.outcome, log=excluded.log,
                     score=COALESCE(excluded.score, cases.score), debrief=COALESCE(excluded.debrief, cases.debrief),
                     updated_at=excluded.updated_at""",
                (id, user_id, scenario, role, seed, tick, sim_t, status, outcome, score, json.dumps(log),
                 json.dumps(debrief) if debrief is not None else None, now, now),
            )
            self._db.commit()

    def get(self, case_id: str) -> Optional[dict[str, Any]]:
        with self._lock:
            row = self._db.execute("SELECT * FROM cases WHERE id=?", (case_id,)).fetchone()
        if row is None:
            return None
        d = dict(row)
        d["log"] = json.loads(d["log"])
        d["debrief"] = json.loads(d["debrief"]) if d["debrief"] else None
        return d

    def list_for_user(self, user_id: str, limit: int = 50) -> list[dict[str, Any]]:
        with self._lock:
            rows = self._db.execute(
                "SELECT id, scenario, role, seed, tick, sim_t, status, outcome, score, created_at, updated_at "
                "FROM cases WHERE user_id=? ORDER BY updated_at DESC LIMIT ?",
                (user_id, limit),
            ).fetchall()
        return [dict(r) for r in rows]

    def delete(self, case_id: str) -> None:
        with self._lock:
            self._db.execute("DELETE FROM cases WHERE id=?", (case_id,))
            self._db.commit()
