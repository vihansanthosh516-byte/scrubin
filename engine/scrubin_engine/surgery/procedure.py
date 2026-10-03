"""Procedure engine: runs a YAML task graph against a live case.

Two modes share the same definition:
  auto     - the AI surgeon performs tasks in canonical order, reacting to the
             anesthesia trainee (time-out, "okay to cut", table position,
             relaxation, a moving patient, bleeding).
  trainee  - the trainee surgeon triggers tasks with surgical actions; the
             scrub/circulator explain blocked steps and push back on unsafe
             ones, exactly like a real team.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

import yaml

from .. import actions as A
from . import hooks as H

PROC_DIR = Path(__file__).parent / "procedures"


def load_spec(proc_id: str) -> dict:
    with open(PROC_DIR / f"{proc_id}.yaml", encoding="utf-8") as f:
        spec = yaml.safe_load(f)
    spec["task_by_id"] = {t["id"]: t for t in spec["tasks"]}
    return spec


@dataclass
class Running:
    task: dict
    remaining_s: float
    total_s: float
    instrument: Optional[str]
    target: Optional[str]
    started_t: float
    moved: bool = False


@dataclass
class Bleeder:
    source: str
    rate_ml_min: float
    since_t: float


@dataclass
class Procedure:
    case: Any
    spec: dict
    mode: str  # "auto" | "trainee"
    flags: set = field(default_factory=set)
    done: list = field(default_factory=list)
    running: Optional[Running] = None
    bleeders: list = field(default_factory=list)
    iap: float = 0.0
    iap_target: float = 0.0
    co2_abs: float = 0.0
    paused: bool = False
    findings: list = field(default_factory=list)
    occult: list = field(default_factory=list)  # hidden injuries for debrief
    notes: list = field(default_factory=list)  # teaching notes for debrief
    instruments_used: set = field(default_factory=set)
    queue: list = field(default_factory=list)  # trainee steps said in one breath
    _cool: dict = field(default_factory=dict)
    _wait: dict = field(default_factory=dict)
    _vagal_s: float = 0.0
    finished: bool = False

    # ------------------------------------------------------------------
    # flags
    # ------------------------------------------------------------------
    def flag(self, name: str) -> bool:
        c = self.case
        h = c.patient.hidden
        if name == "anesthetized":
            # Asleep with a confirmed airway: a tube in the esophagus, or one
            # that hasn't shown CO2 yet, is not a secured airway to prep around.
            aw = c.airway
            return (c.eff.bis < 65 and aw.device in ("ett", "lma") and getattr(aw, "ett_location", "trachea") != "esophagus"
                    and aw.capno_shape != "none")
        if name == "relaxed":
            return c.eff.tof_count <= 2
        if name == "antibiotics_given":
            return c.metrics.antibiotic_t is not None
        if name == "time_out_done":
            return c.metrics.time_out_t is not None
        if name == "anesthesia_ready":
            return "anesthesia_ready" in self.flags
        if name == "not_insufflated":
            return "insufflated" not in self.flags
        if name == "adhesions":
            return bool(h.get("adhesions")) and "explored" in self.flags and "lyse_adhesions" not in self.done
        if name == "no_adhesions":
            return not h.get("adhesions") or "lyse_adhesions" in self.done
        if name == "retrocecal":
            return h.get("appendix_position") == "retrocecal" and "explored" in self.flags
        if name == "perforated":
            return bool(h.get("perforated")) and "explored" in self.flags
        if name == "appendix_accessible":
            return h.get("appendix_position") != "retrocecal" or "mobilize_cecum" in self.done
        if name == "bleeding":
            return bool(self.bleeders)
        if name == "positioned":
            return c.position in self.spec.get("positions", ("trendelenburg", "left_side_down"))
        return name in self.flags

    # ------------------------------------------------------------------
    # talking
    # ------------------------------------------------------------------
    def surgeon_says(self, text: str, key: Optional[str] = None, every_s: float = 0.0) -> None:
        if key is not None:
            last = self._cool.get(key)
            if last is not None and (every_s <= 0 or self.case.t - last < every_s):
                return
            self._cool[key] = self.case.t
        if self.mode == "auto":
            self.case.say("surgeon", text)
        else:
            self.case.say("system", text, kind="narration")

    def team_says(self, who: str, text: str, key: Optional[str] = None, every_s: float = 0.0) -> None:
        if key is not None:
            last = self._cool.get(key)
            if last is not None and (every_s <= 0 or self.case.t - last < every_s):
                return
            self._cool[key] = self.case.t
        self.case.say(who, text)

    # ------------------------------------------------------------------
    # starting tasks
    # ------------------------------------------------------------------
    def can_start(self, task: dict) -> tuple[bool, str]:
        if task["id"] in self.done and task["id"] != "control_bleeding":
            return False, f"{task['name']} is already done."
        for ex in task.get("exclusive_with", []):
            if ex in self.done:
                return False, f"We already have access ({self.spec['task_by_id'][ex]['name']})."
        for req in task.get("requires", []):
            if not self.flag(req):
                r = self.running
                if r is not None and req in r.task.get("sets", []):
                    return False, f"Waiting on {r.task['name'].lower()} — about {max(1, round(r.remaining_s))} s left."
                return False, task.get("blocked", f"Not yet — {req.replace('_', ' ')} first.")
        return True, ""

    def start(self, task: dict, instrument: Optional[str] = None, target: Optional[str] = None) -> None:
        if task["id"] == "desufflate":
            # Steps meant to happen with the camera in are lost once the gas is out.
            missed = [t["name"].lower() for t in self.spec["tasks"]
                      if t.get("auto_order") and t["auto_order"] < task.get("auto_order", 99)
                      and t["id"] not in self.done and t["id"] != task["id"]
                      and set(t.get("requires") or []) & {"camera_in", "insufflated"}]
            if missed:
                self.notes.append("Skipped before desufflating: " + ", ".join(missed) + ".")
        dur = float(task.get("duration_s", 60))
        dur *= H.duration_factor(self, task)
        self.running = Running(task, dur, dur, instrument, target, self.case.t)
        if instrument:
            self.instruments_used.add(instrument)
        if task.get("start"):
            self.surgeon_says(task["start"])
        if "iap" in task:
            self.iap_target = float(task["iap"])
        if task.get("vagal"):
            self._vagal_s = 30.0
        for hook in task.get("hooks", []):
            fn = getattr(H, f"start_{hook}", None)
            if fn:
                fn(self, task)
        self.case.event("surgery_task_start", task=task["id"], instrument=instrument)

    def _finish_running(self) -> None:
        r = self.running
        assert r is not None
        task = r.task
        self.running = None
        if task["id"] != "control_bleeding":
            self.done.append(task["id"])
        for f in task.get("sets", []):
            self.flags.add(f)
        for f in task.get("clears", []):
            self.flags.discard(f)
        for hook in task.get("hooks", []):
            fn = getattr(H, f"end_{hook}", None)
            if fn:
                fn(self, task, r)
        self.case.event("surgery_task_done", task=task["id"])
        if self.mode == "trainee" and task["id"] != "control_bleeding":
            self.case.say("system", f"{task['name']} — done.", kind="narration")

    # ------------------------------------------------------------------
    # trainee actions
    # ------------------------------------------------------------------
    def match_task(self, act: A.Surgical) -> Optional[dict]:
        tid = act.params.get("task_id") if act.params else None
        if tid and tid in self.spec["task_by_id"]:
            return self.spec["task_by_id"][tid]
        return match_task_text(self.spec, f"{act.verb} {act.target or ''} {act.instrument or ''}", self)

    def perform(self, act: A.Surgical, confirmed: bool = False) -> dict:
        c = self.case
        task = self.match_task(act)
        if task is None:
            c.say("scrub", "Sorry, which step do you want to do?")
            return {"ok": False, "error": "unknown surgical step"}
        if self.running is not None and not task.get("priority"):
            if task["id"] == self.running.task["id"]:
                c.say("scrub", f"Already on it — {task['name'].lower()}.")
                return {"ok": True, "already_running": task["id"]}
            # Refuse now if the step needs more than the current one will provide —
            # queueing it would promise a step that can't happen yet.
            will_set = set(self.running.task.get("sets") or [])
            missing = [f for f in task.get("requires") or [] if not self.flag(f) and f not in self.flags and f not in will_set]
            if missing:
                ok, why = self.can_start(task)
                if not ok:
                    c.say("scrub", why)
                    self._near_miss(task, why)
                    return {"ok": False, "error": why}
            if len(self.queue) >= 3:
                c.say("scrub", f"One thing at a time — still on: {self.running.task['name'].lower()}.")
                return {"ok": False, "error": "busy"}
            act_q = act.model_copy(update={"params": {**(act.params or {}), "task_id": task["id"]}})
            self.queue.append((act_q, confirmed))
            c.say("system", f"Next up after {self.running.task['name'].lower()}: {task['name'].lower()}.", kind="narration")
            return {"ok": True, "queued": task["id"]}
        ok, why = self.can_start(task)
        if not ok:
            c.say("scrub", why)
            self._near_miss(task, why)
            return {"ok": False, "error": why}
        allowed = task.get("instruments")
        instrument = act.instrument
        if instrument and allowed and instrument not in allowed:
            names = ", ".join(self.spec["instruments"][i]["name"] for i in allowed[:3])
            c.say("scrub", f"The {self.spec['instruments'].get(instrument, {}).get('name', instrument)} isn't right for that. Try: {names}.")
            return {"ok": False, "error": "wrong instrument"}
        if not instrument and allowed:
            instrument = allowed[0]
        if not confirmed:
            for flag, warning in (task.get("soft_requires") or {}).items():
                if not self.flag(flag):
                    who = "circulator" if flag in ("time_out_done", "antibiotics_given", "counted") else "attending" if flag == "cvs" else "anesthesia"
                    act2 = act.model_copy(update={"params": {**(act.params or {}), "task_id": task["id"]}, "instrument": instrument})
                    return c._ask_confirm(act2, who, warning + " Do you want to proceed anyway?")
        if task.get("priority") and self.running is not None:
            self.running = None  # drop what you're doing to deal with bleeding
        self.start(task, instrument, act.target)
        return {"ok": True, "task": task["id"], "duration_s": round(self.running.total_s) if self.running else 0}

    def hear(self, act: A.Say) -> bool:
        """React to things the trainee says to the team. Returns True if handled."""
        c = self.case
        if act.intent == "time_out":
            abx = "Antibiotics are in." if self.flag("antibiotics_given") else "Antibiotics are NOT in."
            c.say("circulator", f"Time-out: {c.patient.name}, {c.patient.age}, {self.label}. {self._allergy_line()} {abx} Everyone agree?")
            if self.mode == "auto":
                self.surgeon_says(f"Agree. {self.spec.get('expected', 'Expected duration about an hour, minimal blood loss expected.')}")
            return True
        if act.intent == "ready_for_incision":
            self.flags.add("anesthesia_ready")
            if self.mode == "auto":
                self.surgeon_says("Thanks.", key="thanks_ready")
            return True
        if act.intent == "stop_surgery":
            self.paused = True
            if self.mode == "auto":
                self.surgeon_says("Okay, holding. Tell me when we can go on.")
            return True
        if act.intent in ("resume", "continue") or (act.text and re.search(r"(carry on|continue|go ahead|resume|you can go on)", act.text.lower())):
            if self.paused:
                self.paused = False
                self.surgeon_says("Carrying on.")
                return True
        return False

    def status_report(self) -> None:
        c = self.case
        if self.running:
            left = self.running.remaining_s
            nxt = f"{self.running.task['name']} — about {max(1, round(left / 60))} min for this step."
        else:
            nxt = "Between steps."
        remaining = [t for t in self.spec["tasks"] if t.get("auto_order") and t["id"] not in self.done]
        mins = sum(t.get("duration_s", 60) for t in remaining) / 60
        bleed = f" Blood loss so far about {c.body.blood_loss_ml:.0f} mL." if c.body.blood_loss_ml > 20 else ""
        who = "surgeon" if self.mode == "auto" else "scrub"
        c.say(who, f"{nxt} Maybe {mins:.0f} minutes to closing.{bleed}")

    # ------------------------------------------------------------------
    # time
    # ------------------------------------------------------------------
    def step(self, dt: float) -> None:
        c = self.case
        # Pneumoperitoneum pressure ramps; CO2 absorption follows pressure.
        target = self.iap_target
        if target > 12 and not self.flag("relaxed"):
            target = 11.0  # tight abdomen: can't reach set pressure
        rate = 5.0 / 20.0 * dt
        self.iap += max(-rate * 3, min(rate, target - self.iap))
        co2_target = 2.4 * self.iap * (3.0 if "subq_emphysema" in self.flags else 1.0)
        self.co2_abs += (co2_target - self.co2_abs) * dt / 300.0

        # Bleeding
        bleed = sum(b.rate_ml_min for b in self.bleeders)

        load = c.load
        load.iap_mmhg = self.iap
        load.co2_absorption_ml_min = self.co2_abs
        load.bleeding_ml_min = bleed
        load.vagal_stimulus = 0.0
        if self._vagal_s > 0:
            self._vagal_s -= dt
            load.vagal_stimulus = 0.6 if self.iap < 12 else 0.3

        stim = 0.0
        if self.running and not self.paused:
            stim = float(self.running.task.get("stimulus", 0.0))
        elif "incised" in self.flags and "skin_closed" not in self.flags:
            stim = 0.08
        load.stimulus = stim

        if self.mode == "auto":
            self._auto(dt)

        if self.running is None and self.queue and not self.paused and self.mode == "trainee":
            act_q, conf = self.queue.pop(0)
            self.perform(act_q, conf)
        if self.running is None or self.paused:
            return
        # Progress: stalls if the patient moves or the field is bleeding.
        r = self.running
        if self.mode == "auto" and self._unsafe_to_operate():
            return
        if c.body.movement > 0.3:
            r.moved = True
            return
        if self.bleeders and not r.task.get("priority"):
            self.surgeon_says("Can't see anything — there's bleeding.", key="cant_see", every_s=45)
            return
        r.remaining_s -= dt
        if r.remaining_s <= 0:
            self._finish_running()

    # ------------------------------------------------------------------
    # AI surgeon
    # ------------------------------------------------------------------
    def _waited(self, key: str, seconds: float) -> bool:
        start = self._wait.setdefault(key, self.case.t)
        return self.case.t - start >= seconds

    def _unsafe_to_operate(self) -> bool:
        """An AI surgeon stops while the abdomen is open and the patient has no
        secured airway or is desaturating — the airway comes first."""
        c = self.case
        no_airway = c.airway.device not in ("ett", "lma")
        open_case = "incised" in self.flags and "skin_closed" not in self.flags and not self.finished
        return open_case and (c.body.sao2 < 0.88 or no_airway)

    def _auto(self, dt: float) -> None:
        c = self.case
        if self._unsafe_to_operate():
            self.surgeon_says(f"I'm holding — the airway's not secure. Tell me when {c.patient.he}'s intubated and oxygenating again.", key="hold_airway", every_s=60)
            return
        if self.finished or self.paused:
            return
        if c.t > 45 and "greeted" not in self.flags:
            self.flags.add("greeted")
            self.surgeon_says(f"Morning everyone. {self.label[0].upper() + self.label[1:]} — let me know when {c.patient.he}'s asleep and the airway's secure.")
        if self.bleeders and (self.running is None or not self.running.task.get("priority")):
            if self._waited("react_bleed", 15):
                self._wait.pop("react_bleed", None)
                self.running = None
                self.start(self.spec["task_by_id"]["control_bleeding"], "clip_applier", "bleeder")
            return
        if self.running is not None:
            if not self.flag("relaxed") and self.iap > 5 and self.running.task.get("stimulus", 0) >= 0.2:
                self.surgeon_says(f"The abdomen's tight and {c.patient.he}'s pushing against the gas — can I get more relaxation?", key="relax", every_s=180)
            return
        nxt = self._next_auto_task()
        if nxt is None:
            return
        tid = nxt["id"]
        # Anesthesia-facing checkpoints.
        if tid == "incision":
            if not self.flag("time_out_done"):
                self.surgeon_says("Can we do a time-out please?", key="ask_timeout")
                if not self._waited("timeout", 75):
                    return
                c.metrics.time_out_t = c.t
                self.notes.append("Circulator had to lead the time-out; anesthesia didn't respond.")
                c.say("circulator", f"I'll run it: {c.patient.name}, {c.patient.age}, {self.label}. {self._allergy_line()} " + ("Antibiotics in." if self.flag("antibiotics_given") else "Antibiotics are NOT in."))
            if not self.flag("antibiotics_given"):
                self.surgeon_says("Have antibiotics gone in? I'd like them in before I cut.", key="ask_abx")
                if not self._waited("abx", 120):
                    return
                if "abx_skipped" not in self.flags:
                    self.flags.add("abx_skipped")
                    self.notes.append("Incision made without prophylactic antibiotics.")
            if not self.flag("anesthesia_ready"):
                self.surgeon_says("Okay to start?", key="ask_ready")
                if not self._waited("ready", 60):
                    return
                self.flags.add("anesthesia_ready")
                self.notes.append("Surgeon started without a clear 'go ahead' from anesthesia.")
        pos = self.spec.get("position", {})
        if tid in pos.get("before", ("explore", "grasp_appendix", "mobilize_cecum")) and not self.flag("positioned"):
            words = pos.get("words", "Trendelenburg, left side down")
            self.surgeon_says(f"Can we get {words}, please?", key="ask_position")
            if not self._waited("position", 50):
                return
            c.say("circulator", f"I've got the table — {words}.")
            c._do_position(A.Position(position=pos.get("set", "left_side_down")), "circulator")
            self.notes.append("Table position request went unanswered; circulator positioned the patient.")
        if tid == "count" and c.position != "level":
            c._do_position(A.Position(position="level"), "circulator")
        ok, _ = self.can_start(nxt)
        if not ok:
            return
        instr = (nxt.get("instruments") or [None])[0]
        instr = (self.spec.get("auto_instruments") or {}).get(tid, instr)
        if tid == "divide_meso":
            instr = "harmonic"
        if tid == "secure_base":
            instr = "endoloop" if not c.patient.hidden.get("perforated") else "stapler"
        self.start(nxt, instr, None)

    @property
    def label(self) -> str:
        return self.spec.get("label", self.spec["name"].lower())

    def _allergy_line(self) -> str:
        a = self.case.patient.allergies
        return f"Allergy: {', '.join(a)}." if a else "No known allergies."

    def _near_miss(self, task: dict, why: str) -> None:
        """A blocked step is something the trainee almost did — the debrief shows it."""
        if task["id"] in self.done or why.startswith("Waiting on"):
            return  # a repeat click or a step queued behind the running one isn't a near miss
        note = f"Near miss: tried to {task['name'].lower()} too early — {why}"
        if note not in self.notes:
            self.notes.append(note)

    def _next_auto_task(self) -> Optional[dict]:
        tasks = sorted((t for t in self.spec["tasks"] if t.get("auto_order")), key=lambda t: t["auto_order"])
        for t in tasks:
            if t["id"] in self.done:
                continue
            if t.get("auto_if") and not all(self.flag(f) for f in t["auto_if"]):
                if "explored" in self.flags or t["auto_order"] < 8:
                    continue
                return None  # wait until exploration tells us
            ok, _ = self.can_start(t)
            if ok:
                return t
            if t["id"] == "prep" and not self.flag("anesthetized"):
                return None
            return t  # blocked on a checkpoint the auto logic handles
        return None

    # ------------------------------------------------------------------
    def snapshot(self) -> dict:
        tasks = []
        for t in self.spec["tasks"]:
            ok, why = self.can_start(t)
            tasks.append({
                "id": t["id"],
                "name": t["name"],
                "done": t["id"] in self.done,
                "available": ok,
                "blocked": None if ok else ("Skipped — the camera is out now." if "desufflate" in self.done and t["id"] not in self.done
                                            and set(t.get("requires") or []) & {"camera_in", "insufflated"} else why),
                "instruments": t.get("instruments", []),
                "optional": not bool(t.get("auto_order")),
            })
        return {
            "mode": self.mode,
            "running": {
                "task": self.running.task["id"],
                "name": self.running.task["name"],
                "progress": round(1 - self.running.remaining_s / max(1e-6, self.running.total_s), 3),
                "instrument": self.running.instrument,
            } if self.running else None,
            "done": list(self.done),
            "iap": round(self.iap, 1),
            "bleeding": bool(self.bleeders),
            "findings": list(self.findings),
            "paused": self.paused,
            "finished": self.finished,
            "tasks": tasks,
            "instruments": {k: v["name"] for k, v in self.spec["instruments"].items()},
        }


def _verb_regex(phrase: str) -> str:
    """Words of a verb phrase in order, allowing a few words in between
    ("close the fascia" matches "close the umbilical fascia")."""
    words = [re.escape(w) for w in phrase.lower().split()]
    return r"(?<![a-z])" + r"(?:\W+\w+){0,3}?\W+".join(words) + r"(?![a-z])"


def match_task_text(spec: dict, text: str, proc: Optional[Procedure] = None) -> Optional[dict]:
    t = text.lower()
    best, best_score = None, 0.0
    for task in spec["tasks"]:
        score = 0.0
        span = (0, 0)
        for v in task.get("verbs", []):
            m = re.search(_verb_regex(v), t)
            if m:
                exact = v.lower() in t
                sc = 2.0 + len(v) / 40.0 + (0.3 if exact else 0.0) + (0.4 if m.start() < 3 else 0.0)
                if sc > score:
                    score, span = sc, m.span()
        if score == 0:
            continue
        for tg in task.get("targets", []):
            for alias in spec["targets"].get(tg, [tg]):
                hit = re.search(rf"(?<![a-z]){re.escape(alias)}(?![a-z])", t)
                if hit and not (span[0] <= hit.start() < span[1]):  # don't double count the verb's own words
                    score += 1.5
                    break
        for ins in task.get("instruments", []):
            if ins.replace("_", " ") in t or spec["instruments"][ins]["name"].lower() in t:
                score += 0.5
        if proc is not None:
            ok, _ = proc.can_start(task)
            if ok:
                score += 2.0
            elif any(ex in proc.done for ex in task.get("exclusive_with", [])):
                score -= 3.0  # impossible on this path (e.g. Veress step after open entry)
            if task["id"] in proc.done and task["id"] != "control_bleeding":
                score -= 3.0
        if score > best_score:
            best, best_score = task, score
    return best
