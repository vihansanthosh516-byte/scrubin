"""Deterministic replay: rebuild a case from its seed and action log."""

from __future__ import annotations

from typing import Callable, Optional

from .case import Case


def replay(scenario: dict, role: str, seed: int, log: list[dict], until_tick: int,
           on_tick: Optional[Callable[[Case], None]] = None, **case_kwargs) -> Case:
    c = Case(scenario, role, seed=seed, **case_kwargs)
    by_tick: dict[int, list[dict]] = {}
    for entry in log:
        by_tick.setdefault(entry["tick"], []).append(entry)

    def apply(entry: dict) -> None:
        if "comms" in entry:
            m = entry["comms"]
            c.record_say(m["from"], m["text"], m.get("kind", "speech"))
        else:
            c.submit(entry["action"])

    while c.tick < until_tick:
        for entry in by_tick.get(c.tick, []):
            apply(entry)
        c.step()
        if on_tick:
            on_tick(c)
    # Actions logged at the final tick (after the last step) still apply.
    for entry in by_tick.get(c.tick, []):
        apply(entry)
    return c
