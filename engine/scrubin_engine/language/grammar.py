"""Deterministic parser for common OR orders.

Fast, offline and predictable. Anything it can't parse confidently goes to
the LLM parser. It never guesses a dose: "give some propofol" produces a
GiveDrug with no dose, and the team asks "how much?".
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Optional

from ..physiology.drugs import DRUGS
from .numbers import normalise_numbers

NUM = r"(\d+(?:\.\d+)?)"

# Words that are ambiguous between drugs. Real ORs have this problem too.
AMBIGUOUS = {
    "neo": ("neostigmine", "phenylephrine"),
}

# name -> drug id (longest names first when matching)
_DRUG_NAMES: list[tuple[str, str]] = []
for d in DRUGS.values():
    names = {d.id.replace("_", " "), d.name.lower().replace("-", " "), *[a.lower() for a in d.aliases]}
    for n in names:
        _DRUG_NAMES.append((n, d.id))
_DRUG_NAMES.sort(key=lambda x: -len(x[0]))

UNIT_ALIASES = {
    "mg": "mg", "milligram": "mg", "milligrams": "mg", "migs": "mg", "mgs": "mg",
    "mcg": "mcg", "microgram": "mcg", "micrograms": "mcg", "micro": "mcg", "micros": "mcg", "ug": "mcg", "mics": "mcg", "mikes": "mcg", "mic": "mcg",
    "g": "g", "gram": "g", "grams": "g", "gm": "g",
}

MONITOR_WORDS = {
    "ecg": ("ecg", "ekg", "leads", "electrodes", "cardiac monitor"),
    "spo2": ("pulse ox", "pulse oximeter", "sat probe", "spo2", "sats probe", "pulse oximetry"),
    "nibp": ("blood pressure cuff", "bp cuff", "nibp", "cuff"),
    "etco2": ("capnography", "capnograph", "etco2", "end tidal"),
    "temp": ("temperature probe", "temp probe", "temperature"),
    "bis": ("bis", "depth monitor"),
    "tof": ("twitch monitor", "nerve stimulator", "tof monitor"),
    "art_line": ("arterial line", "art line", "a line", "a-line"),
}

FLUID_WORDS = [
    ("lactated_ringers", ("lactated ringer", "ringer", "lr", "hartmann", "plasmalyte", "plasma lyte")),
    ("normal_saline", ("normal saline", "saline", "ns")),
    ("albumin_5", ("albumin",)),
    ("prbc", ("prbc", "packed red", "packed cells", "blood", "red cells", "unit of blood", "units of blood")),
]


@dataclass
class ParseResult:
    actions: list[dict] = field(default_factory=list)
    clarification: Optional[str] = None
    unparsed: list[str] = field(default_factory=list)
    source: str = "grammar"
    reply: Optional[dict] = None  # in-character reply (LLM only)

    @property
    def ok(self) -> bool:
        return bool(self.actions) or self.clarification is not None


def _has(text: str, *phrases: str) -> bool:
    return any(re.search(rf"(?<![a-z]){re.escape(p)}s?(?![a-z])", text) for p in phrases)


def _find_drug(text: str) -> tuple[Optional[str], Optional[str]]:
    """Return (drug_id, ambiguity_word)."""
    for word, options in AMBIGUOUS.items():
        if re.search(rf"(?<![a-z]){word}(?![a-z\-])", text) and not any(_has(text, n) for n, _ in _DRUG_NAMES if n != word and len(n) > 3):
            return None, word
    for name, did in _DRUG_NAMES:
        if re.search(rf"(?<![a-z]){re.escape(name)}(?![a-z])", text):
            return did, None
    return None, None


def _find_unit(text: str) -> Optional[str]:
    m = re.search(r"(mcg|mg|g|ug)\s*/\s*kg(?!\s*/)", text)
    if m:
        return {"mcg": "mcg", "ug": "mcg", "mg": "mg", "g": "g"}[m.group(1)] + "/kg"
    for w, u in UNIT_ALIASES.items():
        if re.search(rf"(?<=[\d\s]){re.escape(w)}(?![a-z])", text):
            return u
    return None


def _num_near_drug(text: str, drug_name_span: tuple[int, int] | None) -> Optional[float]:
    nums = [(m.start(), float(m.group(1))) for m in re.finditer(NUM, text)]
    if not nums:
        return None
    if drug_name_span is None:
        return nums[0][1]
    # Prefer the closest number to the drug name.
    s, e = drug_name_span
    return min(nums, key=lambda n: min(abs(n[0] - s), abs(n[0] - e)))[1]


def _drug_span(text: str, drug_id: str) -> tuple[int, int] | None:
    for name, did in _DRUG_NAMES:
        if did != drug_id:
            continue
        m = re.search(rf"(?<![a-z]){re.escape(name)}(?![a-z])", text)
        if m:
            return m.span()
    return None


def parse_clause(raw: str) -> ParseResult:
    t = normalise_numbers(raw.strip().lower())
    t = re.sub(r"[?!]+$", "", t).strip()
    r = ParseResult()
    if not t:
        return r

    def add(**a):
        a["utterance"] = raw.strip()
        r.actions.append(a)

    # --- confirmations --------------------------------------------------
    if re.fullmatch(r"(yes|yeah|yep|confirm(ed)?|i'?m sure|correct|affirmative|do it|go ahead|that'?s right|yes,? (i'?m )?sure)\.?", t):
        add(type="confirm", accept=True)
        return r
    if re.fullmatch(r"(no|nope|cancel|hold( that| off)?|never ?mind|don'?t|stop that|negative)\.?", t) or (
        re.match(r"^(no|nope|cancel|never ?mind|forget (it|that)|scratch that|hold that)\b", t) and len(t.split()) <= 5
    ):
        add(type="confirm", accept=False)
        return r

    # --- team communication --------------------------------------------
    if _has(t, "time out", "timeout", "time-out"):
        add(type="say", to="team", intent="time_out", text=raw)
        return r
    if re.search(r"(ready for|okay to|ok to|good to|go ahead and|you can|clear to|safe to) (cut|incise|incision|start|begin|prep|insufflate|proceed)", t) or _has(t, "ready for incision"):
        intent = "ready_for_incision" if re.search(r"cut|incis|start|begin|proceed", t) else ("ready_for_prep" if "prep" in t else "ready_for_insufflation")
        add(type="say", to="surgeon", intent=intent, text=raw)
        return r
    if re.search(r"(how('s| is) it going|status|how much longer|what('s| is) happening|any bleeding)", t) and "surgeon" in t or re.search(r"(how('s| is) (it|the case) going|how much longer)", t):
        add(type="assess", what="ask_surgeon")
        return r
    if re.search(r"\b(stop|hold) (the )?(surgery|operating|insufflation)|pause (the )?surgery|let (the )?gas out|desufflate", t) and "sevo" not in t:
        add(type="say", to="surgeon", intent="stop_surgery", text=raw)
        return r

    # --- CPR / defib ----------------------------------------------------
    if re.search(r"\b(start|begin|commence)?\s*(cpr|compressions|chest compressions)\b", t) and not re.search(r"stop|hold", t):
        add(type="cpr", on=True)
        return r
    if re.search(r"(stop|hold|pause) (cpr|compressions)", t):
        add(type="cpr", on=False)
        return r
    m = re.search(r"(shock|defib\w*)(?: at)? ?" + NUM + r"?", t)
    if m and ("shock" in t or "defib" in t):
        add(type="defibrillate", joules=float(m.group(2)) if m.group(2) else 200.0)
        return r

    # --- assessments ----------------------------------------------------
    if re.search(r"listen|auscultat|breath sounds|stethoscope", t):
        add(type="assess", what="auscultate")
        return r
    if re.search(r"train.of.(four|4)|\btof\b|twitch", t) and not re.search(r"attach|put on|place", t):
        add(type="assess", what="check_tof")
        return r
    if _has(t, "cuff leak", "leak test the cuff", "deflate the cuff and listen"):
        add(type="assess", what="cuff_leak")
        return r
    if re.search(r"(check|look at|see|any|do we have|is there) (the )?(co2|capno\w*|end.?tidal|waveform)|confirm (tube|placement)|is the tube in", t):
        add(type="assess", what="check_capnogram")
        return r
    if re.search(r"\b(abg|arterial blood gas|blood gas)\b", t):
        add(type="assess", what="check_abg")
        return r
    if re.search(r"(airway|peak|plateau) pressures?|what are the pressures", t):
        add(type="assess", what="check_airway_pressure")
        return r
    if re.search(r"^(look at|examine|check on|assess|inspect) (the )?patient|how does (he|she|the patient) look", t):
        add(type="assess", what="look")
        return r

    # --- monitors -------------------------------------------------------
    if re.search(r"(standard|asa|all( the)?|routine|basic) monitors?|monitors on|hook (him|her|them|the patient) up|put (the )?monitors on", t):
        add(type="monitor", attach=["ecg", "spo2", "nibp", "etco2", "temp"])
        return r
    if re.search(r"cycle (the )?(cuff|bp|blood pressure|nibp)|(check|take|get) (a |the )?(bp|blood pressure|pressure)\b|(new|another) (bp|pressure)", t) and not re.search(r"every|interval", t):
        add(type="monitor", cycle_nibp=True)
        return r
    m = re.search(r"(cuff|bp|blood pressure|nibp).*every " + NUM + r"\s*(min|minute|minutes|sec|seconds)?", t)
    if m:
        v = float(m.group(2))
        add(type="monitor", nibp_interval_s=v if (m.group(3) or "min").startswith("sec") else v * 60)
        return r
    if re.search(r"attach|put on|place|apply|hook up|connect|insert|get (a|an|the)|need (a|an)", t):
        kinds = [k for k, words in MONITOR_WORDS.items() if _has(t, *words)]
        if kinds:
            add(type="monitor", attach=kinds)
            return r

    # --- positioning / warming -----------------------------------------
    if _has(t, "reverse trendelenburg", "reverse trend", "head up"):
        add(type="position", position="reverse_trendelenburg")
        return r
    if _has(t, "lateral decubitus", "flank position", "flank break", "flex the table", "on his side", "on her side", "full lateral", "kidney position", "kidney rest"):
        add(type="position", position="lateral_decubitus")
        return r
    if _has(t, "steep") and _has(t, "trendelenburg", "head down", "trend") and _has(t, "right side down", "right tilt", "tilt right", "roll right"):
        add(type="position", position="steep_trendelenburg_right_down")
        return r
    if _has(t, "steep trendelenburg", "steep trend", "steep head down", "maximum trendelenburg", "full trendelenburg", "30 degrees head down", "25 degrees head down"):
        add(type="position", position="steep_trendelenburg")
        return r
    if _has(t, "left side down", "left tilt", "tilt left", "roll left", "roll him to the left", "roll her to the left", "left side down"):
        add(type="position", position="left_side_down")
        return r
    if _has(t, "trendelenburg", "head down"):
        add(type="position", position="trendelenburg")
        return r
    if re.search(r"(table|bed) (flat|level)|level the table|flatten|back to flat|supine", t):
        add(type="position", position="level")
        return r
    if _has(t, "bair hugger", "forced air warmer", "warming blanket", "warmer"):
        add(type="warming", on=not re.search(r"off|stop|remove", t))
        return r

    # --- volatile ------------------------------------------------------
    gas_as_volatile = _has(t, "gas") and re.search(r"\d|\boff\b|\bup\b|\bdown\b|\bon\b", t) and not re.search(r"liter|litre|flow|fresh gas|gas machine", t)
    if (_has(t, "sevo", "sevoflurane", "sevoflourane", "volatile", "vaporizer", "vapouriser") or gas_as_volatile) and not _has(t, "blood gas", "abg"):
        if re.search(r"\boff\b|turn (it |the \w+ )?off|close|\b(stop|discontinue|cut)\b", t):
            add(type="volatile", percent=0.0)
            return r
        m = re.search(NUM + r"\s*(%|percent)?", t)
        if m and not re.search(r"liter|litre|l/min|lpm|flow", t):
            add(type="volatile", percent=float(m.group(1)))
            return r
        if not re.search(r"liter|litre|flow|oxygen|o2|air", t):
            r.clarification = "What percent sevo?"
            return r

    if re.search(r"preoxygenat|pre-oxygenat|denitrogenat", t):
        m = re.search(NUM + r"\s*(?:l|liters?|litres?|lpm)", t)
        add(type="gas", o2_flow=float(m.group(1)) if m else 10.0, air_flow=0.0)
        add(type="airway", maneuver="mask_on")
        return r

    # --- fresh gas flows -----------------------------------------------
    if re.search(r"\b(o2|oxygen|flows?|fgf|fresh gas|air)\b", t) and not _has(t, "nasal cannula", "high flow", "hfno", "airway", "oral airway") and not re.search(r"airway", t):
        o2 = re.search(r"(?:o2|oxygen)(?: flow)?(?: to| at| of)?\s*" + NUM + r"|" + NUM + r"\s*(?:l|liters?|litres?|lpm)?(?:/min)?\s*(?:of )?(?:o2|oxygen)", t)
        air = re.search(r"\bair(?: flow)?(?: to| at| of)?\s*" + NUM + r"|" + NUM + r"\s*(?:l|liters?|litres?|lpm)?(?:/min)?\s*(?:of )?air\b", t)
        o2v = float(o2.group(1) or o2.group(2)) if o2 else None
        airv = float(air.group(1) or air.group(2)) if air else None
        if re.search(r"100\s*%|hundred percent|fio2 (of )?1\b", t) and o2v is None:
            o2v, airv = 10.0, 0.0
        if o2v is not None or airv is not None:
            if o2v is not None and o2v > 15:
                o2v = None  # probably a percent, not a flow
            add(type="gas", o2_flow=o2v, air_flow=airv)
            return r
        m = re.search(r"flows? (?:to |at |of )?" + NUM + r"(?: and | by |/)" + NUM, t)
        if m:
            add(type="gas", o2_flow=float(m.group(1)), air_flow=float(m.group(2)))
            return r

    # --- airway ---------------------------------------------------------
    if re.search(r"\b(intubate|tube (him|her|them|the patient)|put (the |a )?tube in|laryngoscop\w*|pass the tube)\b", t):
        scope = "video" if re.search(r"video|glide ?scope|c-?mac|mcgrath", t) else ("miller2" if "miller" in t else ("mac3" if re.search(r"mac ?3", t) else "mac4"))
        size = re.search(NUM + r"\s*(?:tube|ett|et tube)|(?:tube|ett|size)\s*(?:size )?" + NUM, t)
        depth = re.search(r"(?:at|to|depth)\s*" + NUM + r"\s*(?:cm|centimeters?)?(?: at the teeth| at the lip)?", t)
        tube = float(size.group(1) or size.group(2)) if size else None
        if tube is not None and not (5.0 <= tube <= 9.0):
            tube = None
        dval = float(depth.group(1)) if depth else None
        if dval is not None and not (15 <= dval <= 30):
            dval = None
        add(type="airway", maneuver="intubate", laryngoscope=scope, bougie=bool(re.search(r"bougie", t)), tube_size=tube, depth_cm=dval)
        return r
    if re.search(r"\b(lma|laryngeal mask|igel|i-gel|supraglottic)\b", t) and not re.search(r"remove|pull|take out", t):
        m = re.search(r"(?:size|#)\s*" + NUM + r"|" + NUM + r"\s*(?:lma|igel)", t)
        add(type="airway", maneuver="lma", lma_size=int(float(m.group(1) or m.group(2))) if m else None)
        return r
    m = re.search(r"(pull (the )?(tube )?back|withdraw (the )?tube|advance (the )?tube|reposition (the )?tube|tube to)\D*" + NUM, t)
    if m:
        add(type="airway", maneuver="reposition_tube", depth_cm=float(m.groups()[-1]))
        return r
    if re.search(r"pull (the )?(tube )?back", t):
        r.clarification = "To what depth at the teeth?"
        return r
    if re.search(r"extubat|pull (the )?tube|take (the )?tube out|remove (the )?(tube|ett)", t):
        add(type="airway", maneuver="extubate")
        return r
    if re.search(r"(remove|pull|take out) (the )?(lma|igel|i-gel|laryngeal mask)", t):
        add(type="airway", maneuver="remove_lma")
        return r
    if re.search(r"jaw thrust|chin lift|head tilt", t):
        add(type="airway", maneuver="jaw_thrust_off" if re.search(r"release|stop|off", t) else "jaw_thrust_on")
        return r
    if re.search(r"oral airway|oropharyngeal|\bopa\b|guedel", t):
        add(type="airway", maneuver="oral_airway")
        return r
    if re.search(r"nasal (airway|trumpet)|\bnpa\b|nasopharyngeal", t):
        add(type="airway", maneuver="nasal_airway")
        return r
    if re.search(r"two.?hand(ed)? mask|two person mask|2.?hand", t):
        add(type="airway", maneuver="two_hand_mask_on")
        return r
    if re.search(r"cricoid|sellick", t):
        add(type="airway", maneuver="cricoid_off" if re.search(r"release|off|let go|remove|stop", t) else "cricoid_on")
        return r
    if re.search(r"nasal cannula|high.?flow|hfno|nasal prongs", t):
        m = re.search(NUM + r"\s*(?:l|liters?|litres?|lpm)?", t)
        flow = float(m.group(1)) if m else (15.0 if re.search(r"high.?flow|hfno", t) else 4.0)
        add(type="airway", maneuver="nasal_cannula", flow=flow)
        return r
    if re.search(r"\bsuction\b", t):
        add(type="airway", maneuver="suction")
        return r
    if re.search(r"(\bbag\b|mask ventilat|bag.?mask|ventilate by hand|hand ventilat|squeeze the bag|start bagging|assist (his|her|their)? ?breath)", t) and not re.search(r"specimen|endobag|retrieval", t):
        if re.search(r"stop|hold|quit", t):
            add(type="bag", on=False)
            return r
        rate = re.search(r"(?:rate|at)\s*" + NUM + r"|" + NUM + r"\s*(?:breaths|times)", t)
        if "mask" in t:
            add(type="airway", maneuver="mask_on")
        add(type="bag", on=True, rate=float(rate.group(1) or rate.group(2)) if rate else None)
        return r
    if re.search(r"(mask|face mask) (on|him|her|them)|(put|place|apply) (the |a )?(face )?mask|preoxygenat|pre-oxygenat|denitrogenat", t):
        add(type="airway", maneuver="mask_on")
        if re.search(r"preoxygenat|pre-oxygenat|denitrogenat", t):
            r.actions.insert(0, {"type": "gas", "o2_flow": 10.0, "air_flow": 0.0, "utterance": raw.strip()})
        return r
    if re.search(r"(mask off|remove (the )?mask|take (the )?mask off)", t):
        add(type="airway", maneuver="mask_off")
        return r

    # --- ventilator -----------------------------------------------------
    vent_ctx = re.search(r"vent|ventilator|tidal|peep|volume control|pressure control|\bvc\b|\bpc\b|\bvcv\b|\bpcv\b|resp(iratory)? rate|\brr\b|breaths|manual mode|bag mode|minute ventilation|\bi:?e\b", t)
    if not vent_ctx and re.search(r"\brate\b", t) and not _find_drug(t)[0]:
        vent_ctx = True
    if vent_ctx:
        a: dict = {"type": "vent"}
        if re.search(r"pressure control|\bpcv?\b", t):
            a["mode"] = "pcv"
        elif re.search(r"volume control|\bvcv?\b|on the vent|on the ventilator|vent on|ventilator on|mechanical", t):
            a["mode"] = "vcv"
        elif re.search(r"manual|bag mode|spontaneous|off the vent|vent off|ventilator off", t):
            a["mode"] = "manual"
        m = re.search(r"(?:tidal volume|tv|vt|volume)\D{0,10}" + NUM, t) or re.search(NUM + r"\s*(?:ml|cc)?\s*(?:by|x)\s*\d", t)
        if m:
            a["tv_ml"] = float(m.group(1))
        m = re.search(r"(?:rate|rr|resp\w* rate|breaths per minute)\D{0,10}" + NUM + r"|" + NUM + r"\s*breaths|(?:by|x)\s*" + NUM, t)
        if m:
            a["rr"] = float(next(g for g in m.groups() if g))
        m = re.search(r"peep\D{0,6}" + NUM, t) or re.search(NUM + r"\s*(?:of )?peep", t)
        if m:
            a["peep"] = float(m.group(1))
        m = re.search(r"(?:pressure control|pcv?|inspiratory pressure|pinsp|pip)\D{0,10}" + NUM, t)
        if m and a.get("mode") == "pcv":
            a["pinsp"] = float(m.group(1))
        m = re.search(r"i:?e\D{0,6}1\s*[:to]+\s*" + NUM, t)
        if m:
            a["ie_ratio"] = float(m.group(1))
        # "increase the rate to 16"
        if len(a) > 1:
            a["utterance"] = raw.strip()
            r.actions.append(a)
            return r

    # --- fluids ---------------------------------------------------------
    for fid, words in FLUID_WORDS:
        if _has(t, *words) and not re.search(r"blood (pressure|gas|sugar)|blood loss|ebl", t):
            vol = None
            m = re.search(NUM + r"\s*(ml|cc|mls|l|liters?|litres?|units?)?", t)
            if m:
                v = float(m.group(1))
                unit = (m.group(2) or "").lower()
                if unit.startswith("l"):
                    v *= 1000
                elif unit.startswith("unit"):
                    v *= 300
                elif v < 10 and fid == "prbc":
                    v *= 300
                elif v < 5:
                    v *= 1000
                vol = v
            elif re.search(r"\b(a|one) (liter|litre)\b", t):
                vol = 1000.0
            elif re.search(r"\b(a|one) unit\b", t):
                vol = 300.0
            elif re.search(r"bolus", t):
                vol = 500.0
            if vol is None:
                r.clarification = "How much?"
                return r
            add(type="fluid", fluid=fid, volume_ml=vol)
            return r

    # --- drugs & infusions ---------------------------------------------
    drug, ambiguous = _find_drug(t)
    if ambiguous:
        opts = AMBIGUOUS[ambiguous]
        r.clarification = f"Did you mean {DRUGS[opts[0]].name.lower()} or {DRUGS[opts[1]].name.lower()}?"
        return r
    if drug:
        d = DRUGS[drug]
        span = _drug_span(t, drug)
        is_infusion = re.search(r"infusion|drip|gtt|run(ning)? at|/min|/kg/h|/h\b|per minute|per hour|mcg/kg|micrograms per kilo", t) and not re.search(r"bolus|push", t)
        if is_infusion or re.search(r"(stop|off|turn off|discontinue).{0,20}(infusion|drip)", t):
            if re.search(r"\b(stop|off|discontinue|pause)\b", t):
                add(type="infusion", drug=drug, stop=True)
                return r
            m = re.search(NUM + r"\s*(mcg/kg/min|mcg/kg/h|mg/kg/h|mcg/min|mg/h|mg/min|mcg/h|micrograms per kilo(?:gram)? per minute)?", t)
            if not m:
                r.clarification = f"What rate for the {d.name.lower()} infusion?"
                return r
            unit = m.group(2)
            if unit and unit.startswith("micrograms per kilo"):
                unit = "mcg/kg/min"
            add(type="infusion", drug=drug, rate=float(m.group(1)), unit=unit or d.infusion_unit or None)
            return r
        dose = _num_near_drug(t, span)
        unit = _find_unit(t)
        add(type="drug", drug=drug, dose=dose, unit=unit)
        return r

    r.unparsed.append(raw.strip())
    return r


_SPLIT = re.compile(r"\s*(?:;|,?\s*\band then\b|,?\s*\bthen\b|,?\s*\band\b|,)\s*", re.I)


def parse(text: str) -> ParseResult:
    """Parse a whole utterance, possibly containing several orders."""
    whole = parse_clause(text)
    parts = [p for p in _SPLIT.split(text) if p and p.strip()]
    if len(parts) <= 1:
        return whole
    combined = ParseResult()
    for p in parts:
        sub = parse_clause(p)
        combined.actions.extend(sub.actions)
        combined.unparsed.extend(sub.unparsed)
        if sub.clarification and not combined.clarification:
            combined.clarification = sub.clarification
    if combined.unparsed and whole.ok and not whole.unparsed:
        # The grammar only understood part of a multi-clause utterance. Keep its best
        # guess, but flag the leftovers so the LLM can read the whole sentence.
        whole.unparsed = [u for u in combined.unparsed if _meaningful(u)]
        if not whole.unparsed and combined.actions and len(combined.actions) > len(whole.actions):
            return combined
        return whole
    if combined.unparsed:
        combined.unparsed = [u for u in combined.unparsed if _meaningful(u)]
    return combined


_FILLER = {"please", "and", "the", "a", "an", "iv", "too", "now", "okay", "ok", "then", "thanks", "thank", "you", "him", "her", "at", "of", "to", "is", "it", "that", "go", "ahead"}


def _meaningful(fragment: str) -> bool:
    words = [w for w in re.findall(r"[a-z]+", fragment.lower()) if w not in _FILLER]
    return len(words) >= 2
