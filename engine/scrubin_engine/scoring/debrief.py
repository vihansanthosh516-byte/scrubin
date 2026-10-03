"""Debrief: outcome- and process-based evaluation of a case.

No item is "the right answer". Each finding compares what happened with
what evidence and guidelines say matters for patient outcome, and explains
why. Items are grouped by domain and graded good / fair / poor.
"""

from __future__ import annotations

from typing import Any

GOOD, FAIR, POOR, NA = "good", "fair", "poor", "n/a"


def _item(domain: str, title: str, grade: str, detail: str, teaching: str = "") -> dict:
    return {"domain": domain, "title": title, "grade": grade, "detail": detail, "teaching": teaching}


def _events(case, kind: str) -> list[dict]:
    return [e for e in case.events if e["kind"] == kind]


def _first(case, kind: str, **match) -> dict | None:
    for e in case.events:
        if e["kind"] == kind and all(e.get(k) == v for k, v in match.items()):
            return e
    return None


def anesthesia_items(case) -> list[dict]:
    m, items = case.metrics, []
    ind = case._flags.get("induction")
    # --- preparation ------------------------------------------------------
    if ind:
        mons = set(ind["monitors"])
        missing = {"ecg", "spo2", "nibp", "etco2"} - mons
        items.append(_item("Preparation", "Standard monitors before induction",
                           GOOD if not missing else POOR,
                           "All standard ASA monitors were on." if not missing else f"Induced without: {', '.join(sorted(missing))}.",
                           "ASA standards require continuous oxygenation, ventilation, circulation and temperature monitoring before induction."))
        fao2 = ind["fao2"]
        items.append(_item("Preparation", "Preoxygenation",
                           GOOD if fao2 >= 0.9 else (FAIR if fao2 >= 0.75 else POOR),
                           f"Alveolar O2 fraction at induction was {fao2:.0%}.",
                           "Aim for end-tidal O2 ≥ 90%. In an obese patient the FRC is small, so apnoea without preoxygenation desaturates in about a minute."))
    # --- airway / RSI -----------------------------------------------------
    roc = sum(e["amount"] for e in _events(case, "drug") if e["drug"] == "rocuronium" and ind and e["t"] <= ind["t"] + 120)
    sux = any(e["drug"] == "succinylcholine" for e in _events(case, "drug"))
    wt = case.patient.weight_kg
    if ind:
        rsi_ok = sux or roc >= 1.0 * (case.patient.ibw_kg + 0.4 * (wt - case.patient.ibw_kg))
        full = case.scenario.get("full_stomach", True)
        items.append(_item("Airway", "Rapid sequence for a full stomach" if full else "Neuromuscular blockade for intubation",
                           (GOOD if rsi_ok and case.body.stomach_air_ml < 200 else (FAIR if rsi_ok or case.body.stomach_air_ml < 200 else POOR)) if full
                           else (GOOD if (sux or roc > 0) and case.body.stomach_air_ml < 400 else FAIR),
                           f"Relaxant at induction: {'succinylcholine' if sux else f'rocuronium {roc:.0f} mg'}. Gastric air insufflated: {case.body.stomach_air_ml:.0f} mL.",
                           case.scenario.get("airway_teaching", "Acute appendicitis with vomiting = aspiration risk. Use succinylcholine or high-dose rocuronium (1.2 mg/kg) and avoid high-pressure mask ventilation.")))
    placed = _first(case, "tube_placed")
    if placed:
        checked = any(e["kind"] == "assess" and e["what"] in ("check_capnogram", "auscultate") and e["t"] >= placed["t"] for e in case.events)
        esoph = m.esophageal_unrecognized_s
        grade = GOOD if checked and esoph < 30 else (FAIR if esoph < 60 else POOR)
        detail = f"{m.intubation_attempts} laryngoscopy attempt(s). " + ("Placement confirmed." if checked else "Placement never explicitly confirmed.")
        if esoph > 0:
            detail += f" Tube sat in the oesophagus for {esoph:.0f} s."
        items.append(_item("Airway", "Tube placement confirmation", grade, detail,
                           "Sustained end-tidal CO2 over several breaths is the gold standard. 'No trace = wrong place.'"))
    for e in _events(case, "complication"):
        if e["name"] in ("aspiration", "laryngospasm", "bronchospasm", "anaphylaxis"):
            items.append(_item("Airway", f"Complication: {e['name']}", POOR if e["name"] in ("aspiration", "anaphylaxis") else FAIR,
                               f"Occurred at {e['t'] / 60:.1f} min.", _COMPLICATION_TEACHING.get(e["name"], "")))
    # --- safety -----------------------------------------------------------
    items.extend(_safety_items(case))
    # --- physiology -------------------------------------------------------
    total = max(1.0, m.seconds - (ind["t"] if ind else 0))
    items.append(_item("Hemodynamics", "Blood pressure", GOOD if m.sec_map_low < 120 else (FAIR if m.sec_map_low < 600 else POOR),
                       f"MAP < 65 for {m.sec_map_low / 60:.1f} min (lowest {m.min_map:.0f}).",
                       "Even brief intraoperative hypotension (MAP < 65) is associated with kidney and myocardial injury."))
    items.append(_item("Oxygenation", "Oxygen saturation", GOOD if m.sec_spo2_low == 0 else (FAIR if m.sec_spo2_crit == 0 and m.sec_spo2_low < 60 else POOR),
                       f"Lowest SpO2 {m.min_spo2 * 100:.0f}%. Time below 90%: {m.sec_spo2_low:.0f} s.", ""))
    items.append(_item("Depth", "Depth of anesthesia",
                       POOR if m.sec_awareness_risk > 30 or m.patient_movements > 1 else (FAIR if m.sec_too_deep > 600 or m.patient_movements else GOOD),
                       f"Paralysed with BIS > 70 for {m.sec_awareness_risk:.0f} s. Patient moved {m.patient_movements}×. BIS < 30 for {m.sec_too_deep / 60:.1f} min.",
                       "A paralysed patient cannot move to tell you they're awake. Keep hypnotic cover whenever relaxant is on board."))
    items.append(_item("Ventilation", "CO2", GOOD if m.sec_hypercarbia < 300 else FAIR if m.sec_hypercarbia < 900 else POOR,
                       f"PaCO2 > 55 for {m.sec_hypercarbia / 60:.1f} min; peak EtCO2 {m.max_etco2:.0f}.",
                       "Pneumoperitoneum adds 20–30% to CO2 load; increase minute ventilation to keep EtCO2 ~35–45."))
    # --- emergence --------------------------------------------------------
    ext = [e for e in _events(case, "extubation") if e.get("device") == "ett"]
    if ext:
        e = ext[-1]
        ratio = e.get("tof_ratio", 0)
        awake = e.get("bis", 0) > 75
        items.append(_item("Emergence", "Extubation criteria", GOOD if ratio >= 0.9 and awake else (FAIR if ratio >= 0.7 else POOR),
                           f"At extubation: TOF ratio {ratio:.2f}, BIS {e.get('bis')}.",
                           "Extubate awake, with TOF ratio ≥ 0.9 — residual blockade causes airway obstruction and aspiration."))
    return items


def surgeon_items(case) -> list[dict]:
    m, p, items = case.metrics, case.procedure, []
    items.extend(_safety_items(case))
    if p is not None:
        for note in p.notes:
            items.append(_item("Technique", "Note", FAIR, note))
        for occ in p.occult:
            items.append(_item("Technique", "Hidden complication", POOR, occ,
                               "These were not visible during the case — this is what the patient will present with later."))
        if p.finished:
            op_min = (case.events[[e["kind"] for e in case.events].index("surgery_complete")]["t"] - (m.incision_t or 0)) / 60
            items.append(_item("Technique", "Operative time", GOOD if op_min < 60 else FAIR if op_min < 90 else POOR, f"Incision to close: {op_min:.0f} min."))
        items.append(_item("Technique", "Blood loss", GOOD if case.body.blood_loss_ml < 100 else FAIR if case.body.blood_loss_ml < 400 else POOR,
                           f"Estimated blood loss {case.body.blood_loss_ml:.0f} mL.",
                           p.spec.get("bleeding_teaching", "Divide the mesoappendix with an energy device, stapler or clips; the appendiceal artery runs in it.")))
    return items


def _safety_items(case) -> list[dict]:
    m, items = case.metrics, []
    if m.incision_t is not None:
        if m.antibiotic_t is None:
            items.append(_item("Safety", "Antibiotic prophylaxis", POOR, "No antibiotics before incision.",
                               "Give prophylaxis within 60 min before incision (cefazolin + metronidazole; penicillin hives is not a contraindication to cefazolin)."))
        else:
            lead = (m.incision_t - m.antibiotic_t) / 60
            items.append(_item("Safety", "Antibiotic prophylaxis", GOOD if 0 <= lead <= 60 else FAIR,
                               f"Given {lead:.0f} min before incision." if lead >= 0 else "Given after incision.", ""))
        tout = m.time_out_t
        notes = " ".join(case.procedure.notes) if case.procedure else ""
        led_by_circ = "Circulator had to lead" in notes
        items.append(_item("Safety", "Surgical time-out", GOOD if tout is not None and tout <= m.incision_t and not led_by_circ else FAIR if tout is not None and tout <= m.incision_t else POOR,
                           ("Time-out done after the incision — it has to come first." if tout is not None and m.incision_t is not None and tout > m.incision_t
                            else "Time-out completed before incision." + (" (Circulator had to lead it.)" if led_by_circ else "")) if tout is not None else "No time-out before incision.",
                           "The WHO checklist time-out reduces wrong-site surgery and missed antibiotics."))
    pen = [e for e in _events(case, "drug") if e["drug"] in ("piperacillin_tazobactam", "ampicillin_sulbactam")]
    if pen:
        items.append(_item("Safety", "Allergy", POOR, "A penicillin was given despite a documented penicillin allergy.", ""))
    return items


_COMPLICATION_TEACHING = {
    "aspiration": "Risk factors: full stomach, gastric insufflation from mask ventilation, unprotected airway. Prevent with RSI and a cuffed tube.",
    "laryngospasm": "Usually from airway stimulation in a light plane. Treat with jaw thrust + CPAP, deepen with propofol, low-dose succinylcholine if persistent.",
    "bronchospasm": "Asthmatics react to airway instrumentation when light. Deepen (sevoflurane is a bronchodilator), salbutamol, adrenaline if severe.",
    "anaphylaxis": "Hypotension + bronchospasm + rash after a trigger. Stop the trigger, adrenaline 50–100 mcg IV boluses, fluids.",
}


def build_debrief(case) -> dict[str, Any]:
    started = ("induction" in case._flags) if case.role == "anesthesia" else (case.metrics.incision_t is not None)
    if started:
        items = anesthesia_items(case) if case.role == "anesthesia" else surgeon_items(case)
        op_done = case.role == "surgeon" and case.procedure is not None and case.procedure.finished
        if case.outcome is None and not op_done:
            # Stopping partway can't earn a perfect score for a case not finished.
            items.append(_item("Case", "Case completion", POOR, "The case was ended before the patient reached recovery.",
                               "Finish the case — closure, emergence and handover are part of the operation."))
    else:
        what = "induction" if case.role == "anesthesia" else "the incision"
        items = [_item("Case", "Case ended early", NA, f"The case ended before {what}, so there is nothing to evaluate yet.")]
    weights = {GOOD: 1.0, FAIR: 0.5, POOR: 0.0}
    graded = [i for i in items if i["grade"] in weights]
    score = round(100 * sum(weights[i["grade"]] for i in graded) / len(graded)) if graded else None
    if case.outcome == "death":
        score = min(score or 0, 10)
    timeline = [{k: round(v, 3) if isinstance(v, float) else v for k, v in e.items()} for e in case.events if e["kind"] in (
        "drug", "infusion", "volatile", "laryngoscopy", "tube_placed", "intubation_failed", "lma_placed", "extubation",
        "complication", "incision", "surgery_task_start", "surgery_complete", "position", "fluid", "loss_of_consciousness",
        "apnea", "patient_moved", "case_complete", "death", "say", "assess", "monitors")]
    return {
        "role": case.role,
        "outcome": case.outcome or ("surgery_complete" if case.role == "surgeon" and case.procedure is not None and case.procedure.finished
                                    else "in_progress" if case.status != "ended" else case.status),
        "duration_min": round(case.t / 60, 1),
        "score": score,
        "items": items,
        "metrics": case.metrics.public(),
        "timeline": timeline,
        "trend": case.trend,
        "hidden": case.patient.hidden,
        "patient": {"age": case.patient.age, "sex": case.patient.sex, "weight_kg": case.patient.weight_kg,
                    "allergies": list(case.patient.allergies), "comorbidities": list(case.patient.comorbidities)},
        "surgery": {
            "notes": case.procedure.notes if case.procedure else [],
            "occult": case.procedure.occult if case.procedure else [],
            "findings": case.procedure.findings if case.procedure else [],
        },
        "blood_loss_ml": round(case.body.blood_loss_ml),
        "fluids_in_ml": round(case.body.fluids_in_ml),
    }
