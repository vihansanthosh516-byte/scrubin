"""Typed actions. Every input (click, typed order, voice) becomes one of these.

The language layer (grammar / LLM) only ever produces these objects; the
engine alone decides what they do to the patient.
"""

from __future__ import annotations

from typing import Annotated, Literal, Optional, Union

from pydantic import BaseModel, Field, TypeAdapter


class _Base(BaseModel):
    actor: Literal["trainee", "anesthesia", "surgeon", "circulator", "scrub"] = "trainee"
    utterance: Optional[str] = None  # original words, for the log / debrief


class GiveDrug(_Base):
    type: Literal["drug"] = "drug"
    drug: str
    dose: Optional[float] = None
    unit: Optional[str] = None  # mg | mcg | g | mg/kg | mcg/kg
    route: Literal["iv"] = "iv"


class Infusion(_Base):
    type: Literal["infusion"] = "infusion"
    drug: str
    rate: Optional[float] = None
    unit: Optional[str] = None  # mcg/kg/min | mcg/min | mg/h | mcg/kg/h
    stop: bool = False


class Volatile(_Base):
    type: Literal["volatile"] = "volatile"
    agent: Literal["sevoflurane"] = "sevoflurane"
    percent: float


class Gas(_Base):
    type: Literal["gas"] = "gas"
    o2_flow: Optional[float] = None
    air_flow: Optional[float] = None


class Vent(_Base):
    type: Literal["vent"] = "vent"
    mode: Optional[Literal["manual", "vcv", "pcv"]] = None
    tv_ml: Optional[float] = None
    rr: Optional[float] = None
    peep: Optional[float] = None
    pinsp: Optional[float] = None
    ie_ratio: Optional[float] = None


class Bag(_Base):
    type: Literal["bag"] = "bag"
    on: bool = True
    rate: Optional[float] = None
    tv_ml: Optional[float] = None


AirwayManeuver = Literal[
    "mask_on", "mask_off", "jaw_thrust_on", "jaw_thrust_off", "oral_airway", "nasal_airway",
    "remove_adjuncts", "two_hand_mask_on", "two_hand_mask_off", "cricoid_on", "cricoid_off",
    "nasal_cannula", "intubate", "lma", "extubate", "remove_lma", "reposition_tube", "suction",
]


class AirwayAction(_Base):
    type: Literal["airway"] = "airway"
    maneuver: AirwayManeuver
    laryngoscope: Optional[Literal["mac3", "mac4", "miller2", "video"]] = None
    bougie: Optional[bool] = None
    tube_size: Optional[float] = None
    depth_cm: Optional[float] = None
    lma_size: Optional[int] = None
    flow: Optional[float] = None


class Fluid(_Base):
    type: Literal["fluid"] = "fluid"
    fluid: Literal["lactated_ringers", "normal_saline", "albumin_5", "prbc"]
    volume_ml: float = 500.0


class Monitor(_Base):
    type: Literal["monitor"] = "monitor"
    attach: list[str] = Field(default_factory=list)
    detach: list[str] = Field(default_factory=list)
    nibp_interval_s: Optional[float] = None
    cycle_nibp: bool = False


class Assess(_Base):
    type: Literal["assess"] = "assess"
    what: Literal["auscultate", "check_tof", "check_capnogram", "look", "check_abg", "ask_surgeon", "check_airway_pressure"]


class Cpr(_Base):
    type: Literal["cpr"] = "cpr"
    on: bool = True


class Defibrillate(_Base):
    type: Literal["defibrillate"] = "defibrillate"
    joules: float = 200.0


class Position(_Base):
    type: Literal["position"] = "position"
    position: Literal["supine", "trendelenburg", "reverse_trendelenburg", "left_tilt", "right_tilt", "left_side_down", "level"]


class Warming(_Base):
    type: Literal["warming"] = "warming"
    on: bool = True


class Say(_Base):
    """Free speech to the team (time-out, 'ready for incision', questions)."""

    type: Literal["say"] = "say"
    to: Literal["team", "surgeon", "anesthesia", "circulator", "scrub", "patient"] = "team"
    intent: Optional[str] = None  # normalised intent e.g. "time_out", "ready_for_incision"
    text: str = ""


class Confirm(_Base):
    type: Literal["confirm"] = "confirm"
    accept: bool = True


class Surgical(_Base):
    """A surgical step: a verb applied with an instrument to a target."""

    type: Literal["surgical"] = "surgical"
    verb: str
    instrument: Optional[str] = None
    target: Optional[str] = None
    params: dict = Field(default_factory=dict)


Action = Annotated[
    Union[
        GiveDrug, Infusion, Volatile, Gas, Vent, Bag, AirwayAction, Fluid, Monitor, Assess,
        Cpr, Defibrillate, Position, Warming, Say, Confirm, Surgical,
    ],
    Field(discriminator="type"),
]

ActionAdapter: TypeAdapter = TypeAdapter(Action)


def parse_action(data: dict):
    return ActionAdapter.validate_python(data)
