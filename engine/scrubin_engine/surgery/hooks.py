"""Risk hooks for surgical tasks.

`start_<name>(proc, task)` runs when a task starts, `end_<name>(proc, task,
running)` when it completes. Randomness always comes from the case RNG so
cases stay reproducible.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover
    from .procedure import Procedure, Running

LAPAROSCOPIC = {"explore", "lyse_adhesions", "mobilize_cecum", "grasp_appendix", "window", "divide_meso", "secure_base", "divide_appendix", "bag", "irrigate"}
NEEDS_EXPOSURE = {"explore", "grasp_appendix", "mobilize_cecum", "window", "divide_meso"}


def _rng(proc: "Procedure"):
    return proc.case.rng


def _instrument(proc: "Procedure", r: "Running") -> dict:
    return proc.spec["instruments"].get(r.instrument or "", {})


def duration_factor(proc: "Procedure", task: dict) -> float:
    f = 1.0
    h = proc.case.patient.hidden
    tid = task["id"]
    if tid in LAPAROSCOPIC and not proc.flag("relaxed"):
        f *= 1.4
    if tid in NEEDS_EXPOSURE and not proc.flag("positioned"):
        f *= 1.3
    if tid in ("grasp_appendix", "window", "divide_meso") and h.get("perforated"):
        f *= 1.3
    if tid == "mobilize_cecum" and h.get("adhesions"):
        f *= 1.2
    return f


# --- incision / access -------------------------------------------------

def start_record_incision(proc, task):
    c = proc.case
    if c.metrics.incision_t is None:
        c.metrics.incision_t = c.t
        c.event("incision")
        if c.metrics.antibiotic_t is not None and c.t - c.metrics.antibiotic_t > 3600:
            proc.notes.append("Antibiotics were given more than 60 minutes before incision.")


def end_veress_placement(proc, task, r):
    if _rng(proc).random() < 0.06:
        proc.flags.add("veress_preperitoneal")


def start_insufflation_checks(proc, task):
    c = proc.case
    if "veress_preperitoneal" in proc.flags:
        c.say("scrub", "Opening pressure is 13 mmHg at only 1 L/min flow…")
        if proc.mode == "auto":
            proc.surgeon_says("Pressure's too high — Veress isn't in. Re-siting.")
            proc.flags.discard("veress_preperitoneal")
        else:
            proc.flags.add("subq_emphysema")
            proc.occult.append("Preperitoneal insufflation (high opening pressure ignored): subcutaneous emphysema, extra CO2 absorption.")
    if not proc.flag("relaxed"):
        proc.surgeon_says("Pressure's climbing but the abdomen isn't expanding — he's not relaxed.", key="relax_insuff")


def end_blind_trocar_risk(proc, task, r):
    if _rng(proc).random() < 0.005:
        proc.occult.append("Unrecognised small bowel injury from blind trocar insertion.")


# --- findings / exposure ----------------------------------------------

def end_reveal_findings(proc, task, r):
    h = proc.case.patient.hidden
    pos = {"retrocecal": "retrocecal", "pelvic": "hanging into the pelvis", "subcecal": "subcecal"}[h.get("appendix_position", "pelvic")]
    parts = [f"Inflamed appendix, {pos}."]
    if h.get("perforated"):
        parts.append("It's perforated — purulent fluid in the pelvis.")
    else:
        parts.append("No perforation.")
    if h.get("adhesions"):
        parts.append("Omentum is stuck down to the cecum.")
    proc.findings = parts
    who = "surgeon" if proc.mode == "auto" else "system"
    proc.case.say(who, " ".join(parts), kind="finding" if who == "system" else "speech")
    if h.get("perforated"):
        proc.flags.add("perforated_known")


def start_exposure_check(proc, task):
    if not proc.flag("positioned"):
        if proc.mode == "trainee":
            proc.case.say("scrub", "Exposure is poor — bowel keeps falling into the field. Want the table tilted?")


def start_grasp_perforated(proc, task):
    r = proc.running
    if proc.case.patient.hidden.get("perforated") and r and r.instrument == "maryland" and _rng(proc).random() < 0.5:
        proc.flags.add("spillage")
        proc.case.say("system" if proc.mode == "trainee" else "surgeon", "The friable appendix tears — pus spills into the right lower quadrant.")
        proc.occult.append("Appendix torn with a traumatic grasper: intra-abdominal spillage.")


# --- dissection ----------------------------------------------------------

def _bleed(proc, rate, source, text):
    from .procedure import Bleeder

    proc.bleeders.append(Bleeder(source, rate, proc.case.t))
    proc.case.event("complication", name="bleeding", source=source, rate_ml_min=rate)
    who = "surgeon" if proc.mode == "auto" else "system"
    proc.case.say(who, text)


def end_mesoappendix_bleed(proc, task, r):
    h = proc.case.patient.hidden
    ins = _instrument(proc, r)
    p = 0.03
    rate = 120.0
    if not ins.get("hemostatic"):
        p = 1.0
        rate = 150.0
    elif r.instrument == "hook_cautery":
        p = 0.3
        rate = 80.0
    if h.get("accessory_appendiceal_artery"):
        p = max(p, 0.05 if r.instrument in ("ligasure", "stapler", "clip_applier") else 0.3)
    if r.moved:
        p = max(p, 0.5)
        proc.notes.append("The patient moved during mesoappendix division.")
    if _rng(proc).random() < p:
        _bleed(proc, rate, "appendiceal artery", "Bleeder from the appendiceal artery! Suction!" if proc.mode == "auto" else "Bright red blood wells up from the mesoappendix — the appendiceal artery is bleeding.")


def end_thermal_bowel_risk(proc, task, r):
    ins = _instrument(proc, r)
    p = 0.02 if ins.get("thermal") else 0.0
    if r.moved:
        p += 0.15
    if p and _rng(proc).random() < p:
        proc.flags.add("thermal_injury")
        proc.occult.append("Unrecognised thermal injury to the cecum.")


def end_base_technique(proc, task, r):
    h = proc.case.patient.hidden
    if h.get("perforated") and r.instrument == "endoloop":
        proc.notes.append("Perforated appendix with a friable base secured with endoloops rather than a stapler (higher stump leak risk).")
        if _rng(proc).random() < 0.3:
            proc.occult.append("Stump leak risk: loops on an inflamed, friable base.")


def end_specimen_contamination(proc, task, r):
    if "bagged" not in proc.flags:
        proc.notes.append("Specimen removed without a retrieval bag (port-site infection risk).")
        if proc.case.patient.hidden.get("perforated"):
            proc.flags.add("wound_contaminated")


def end_irrigation_effect(proc, task, r):
    proc.flags.discard("spillage")


def end_reveal_occult(proc, task, r):
    c = proc.case
    txt = "Stump secure, mesoappendix dry."
    if "thermal_injury" in proc.flags and _rng(proc).random() < 0.6:
        proc.flags.discard("thermal_injury")
        proc.occult = [o for o in proc.occult if "thermal" not in o]
        proc.notes.append("Thermal cecal injury recognised on inspection and oversewn.")
        txt = "Blanched area on the cecum — thermal injury. Oversewing it."
    who = "surgeon" if proc.mode == "auto" else "system"
    c.say(who, txt)


def end_control_bleeder(proc, task, r):
    ins = _instrument(proc, r)
    if ins.get("hemostatic"):
        proc.bleeders.clear()
        msg = "Bleeding controlled."
    else:
        for b in proc.bleeders:
            b.rate_ml_min *= 0.3
        msg = "Pressure is slowing it down, but it'll need a clip or energy device."
    who = "surgeon" if proc.mode == "auto" else "system"
    proc.case.say(who, msg)


def end_count_result(proc, task, r):
    proc.case.say("circulator", "Sponge, needle and instrument counts are correct.")


def start_closing_cue(proc, task):
    if proc.mode == "auto":
        proc.surgeon_says("Closing now — about ten minutes left.")
    else:
        proc.case.say("anesthesia", "Thanks — I'll start planning emergence.")


def end_finish(proc, task, r):
    c = proc.case
    proc.finished = True
    proc.iap_target = 0.0
    c.status = "emergence"
    c.event("surgery_complete")
    if "counted" not in proc.flags:
        proc.notes.append("Closed without a completed count (retained item risk).")
    if proc.mode == "auto":
        proc.surgeon_says("All done. Thanks everyone — he's all yours.")
    else:
        c.say("anesthesia", "Nice work. I'll wake him up.")
