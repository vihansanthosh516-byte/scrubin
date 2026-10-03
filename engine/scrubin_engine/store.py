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


class SupabaseCaseStore:
    """Same interface as CaseStore, backed by the Supabase `or_cases` table
    (see supabase_or_cases.sql). Used in production, where the host has no
    persistent disk. Writes are coalesced per case and flushed by a background
    thread so the simulation loop never waits on the network."""

    def __init__(self, url: str, key: str, table: str = "or_cases") -> None:
        import httpx

        self.base = f"{url.rstrip('/')}/rest/v1/{table}"
        self._http = httpx.Client(timeout=10.0, headers={
            "apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"})
        self._pending: dict[str, dict] = {}
        self._cache: dict[str, dict] = {}
        self._lock = threading.Lock()
        self._wake = threading.Event()
        threading.Thread(target=self._flusher, daemon=True).start()

    def save(self, *, id: str, user_id: Optional[str], scenario: str, role: str, seed: int, tick: int,
             sim_t: float, status: str, outcome: Optional[str], log: list[dict],
             score: Optional[int] = None, debrief: Optional[dict] = None) -> None:
        now = time.time()
        with self._lock:
            prev = self._pending.get(id) or self._cache.get(id) or {}
            row = {"id": id, "user_id": user_id, "scenario": scenario, "role": role, "seed": seed, "tick": tick,
                   "sim_t": sim_t, "status": status, "outcome": outcome, "log": list(log),
                   "score": score if score is not None else prev.get("score"),
                   "debrief": debrief if debrief is not None else prev.get("debrief"),
                   "created_at": prev.get("created_at", now), "updated_at": now}
            self._pending[id] = row
            self._cache[id] = row
        self._wake.set()

    def _flusher(self) -> None:
        while True:
            self._wake.wait(timeout=5.0)
            self._wake.clear()
            self.flush()

    def flush(self) -> None:
        with self._lock:
            rows, self._pending = list(self._pending.values()), {}
        for row in rows:
            # Leave out unknown score/debrief so the upsert keeps what's already stored —
            # after a restart the cache is empty and None would wipe the saved values.
            body = _finite({k: v for k, v in row.items() if not (k in ("score", "debrief") and v is None)})
            try:
                r = self._http.post(self.base, json=body, params={"on_conflict": "id"},
                                    headers={"Prefer": "resolution=merge-duplicates,return=minimal"})
                r.raise_for_status()
            except Exception as e:  # keep it for the next flush rather than lose it
                print(f"[store] supabase save failed for {row['id']}: {e}")
                with self._lock:
                    self._pending.setdefault(row["id"], row)
                time.sleep(2.0)

    def get(self, case_id: str) -> Optional[dict[str, Any]]:
        with self._lock:
            if case_id in self._cache:
                return dict(self._cache[case_id])
        r = self._http.get(self.base, params={"id": f"eq.{case_id}", "select": "*"})
        r.raise_for_status()
        rows = r.json()
        return rows[0] if rows else None

    def list_for_user(self, user_id: str, limit: int = 50) -> list[dict[str, Any]]:
        self.flush()
        r = self._http.get(self.base, params={
            "user_id": f"eq.{user_id}", "order": "updated_at.desc", "limit": str(limit),
            "select": "id,scenario,role,seed,tick,sim_t,status,outcome,score,created_at,updated_at"})
        r.raise_for_status()
        return r.json()

    def delete(self, case_id: str) -> None:
        with self._lock:
            self._pending.pop(case_id, None)
            self._cache.pop(case_id, None)
        self._http.delete(self.base, params={"id": f"eq.{case_id}"}).raise_for_status()


def _finite(v: Any) -> Any:
    """JSON can't carry NaN/inf — one stray value used to make every save of a case fail."""
    if isinstance(v, float):
        return v if v == v and v not in (float("inf"), float("-inf")) else None
    if isinstance(v, dict):
        return {k: _finite(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [_finite(x) for x in v]
    return v


def make_store():
    """Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, else local SQLite."""
    url, key = os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if url and key:
        return SupabaseCaseStore(url, key)
    return CaseStore()
