"""Build a fully wired case for a scenario and role."""

from __future__ import annotations

from .anesthesia.autopilot import Autopilot
from .case import Case
from .scenarios import SCENARIOS
from .surgery import procedure_factory


def build_case(scenario_id: str, role: str, seed: int) -> Case:
    scenario = SCENARIOS[scenario_id]
    mode = "auto" if role == "anesthesia" else "trainee"
    return Case(
        scenario,
        role,
        seed=seed,
        procedure_factory=procedure_factory(scenario_id, mode),
        autopilot_factory=(lambda c: Autopilot(c)) if role == "surgeon" else None,
    )


def case_kwargs(scenario_id: str, role: str) -> dict:
    mode = "auto" if role == "anesthesia" else "trainee"
    return {
        "procedure_factory": procedure_factory(scenario_id, mode),
        "autopilot_factory": (lambda c: Autopilot(c)) if role == "surgeon" else None,
    }
