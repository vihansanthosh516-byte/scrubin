"""Parse spoken surgical commands against a procedure's vocabulary."""

from __future__ import annotations

import re
from typing import Optional

from .procedure import Procedure, match_task_text

INSTRUMENT_ALIASES = {
    "clips": "clip_applier", "clip": "clip_applier", "clip applier": "clip_applier",
    "gia": "stapler", "stapler": "stapler", "endo gia": "stapler",
    "loops": "endoloop", "loop": "endoloop", "endoloops": "endoloop", "endoloop": "endoloop",
    "hook": "hook_cautery", "bovie": "hook_cautery", "cautery": "hook_cautery", "electrocautery": "hook_cautery",
    "scope": "camera", "camera": "camera", "laparoscope": "camera",
    "bag": "endobag", "endobag": "endobag", "catch bag": "endobag",
    "knife": "scalpel", "blade": "scalpel", "scalpel": "scalpel", "eleven blade": "scalpel",
    "suction irrigator": "suction_irrigator", "suction": "suction_irrigator",
    "harmonic": "harmonic", "ligasure": "ligasure", "liga sure": "ligasure",
    "maryland": "maryland", "dissector": "maryland",
    "grasper": "grasper", "atraumatic grasper": "grasper", "graspers": "grasper",
    "scissors": "scissors", "shears": "scissors",
    "needle driver": "needle_driver", "veress": "veress", "hasson": "hasson",
    "sponge": "sponge", "raytec": "sponge",
    "5 mm": "trocar_5", "five millimeter": "trocar_5", "12 mm": "trocar_12", "twelve millimeter": "trocar_12",
}


def _find(text: str, table: dict[str, str]) -> Optional[str]:
    """The instrument the speaker means: the first one named after "with"/"using",
    otherwise the earliest one mentioned."""
    hits: list[tuple[int, int, str]] = []
    for alias, value in table.items():
        for m in re.finditer(rf"(?<![a-z]){re.escape(alias)}s?(?![a-z])", text):
            hits.append((m.start(), -len(alias), value))
    if not hits:
        return None
    hits.sort()
    cue = [m.end() for m in re.finditer(r"\b(with|using|use)\b", text)]
    if cue:
        after = [h for h in hits if h[0] >= cue[-1]] or [h for h in hits if h[0] >= cue[0]]
        if after:
            return after[0][2]
    return hits[0][2]


def parse_surgical(text: str, spec: dict, proc: Optional[Procedure] = None) -> Optional[dict]:
    t = text.lower().strip()
    task = match_task_text(spec, t, proc)
    if task is None:
        return None
    instrument = _find(t, INSTRUMENT_ALIASES)
    target = None
    for tg, aliases in spec["targets"].items():
        if any(re.search(rf"(?<![a-z]){re.escape(a)}(?![a-z])", t) for a in aliases):
            target = tg
            break
    action = {"type": "surgical", "verb": task["verbs"][0], "params": {"task_id": task["id"]}, "utterance": text.strip()}
    if instrument:
        action["instrument"] = instrument
    if target:
        action["target"] = target
    return action
