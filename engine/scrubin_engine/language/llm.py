"""LLM fallback: free-form speech -> typed actions (or a clarifying question).

The LLM is a translator, never a simulator. It may only emit actions that
validate against `actions.Action`; anything else is discarded. Replies it
writes for teammates or the patient are limited to conversation grounded in
the public case facts passed in the prompt.

Provider: any OpenAI-compatible chat endpoint. Defaults to Groq
(openai/gpt-oss-120b) because the project already has GROQ_API_KEY.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Optional

import httpx
from pydantic import ValidationError

from ..actions import parse_action
from ..physiology.drugs import DRUGS
from .grammar import ParseResult


def _load_dotenv() -> None:
    """Minimal .env loader (repo root) so the engine shares the app's keys."""
    for path in (Path(__file__).resolve().parents[3] / ".env", Path.cwd() / ".env"):
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_dotenv()

API_URL = os.environ.get("SCRUBIN_LLM_URL", "https://api.groq.com/openai/v1/chat/completions")
MODEL = os.environ.get("SCRUBIN_LLM_MODEL", "openai/gpt-oss-120b")
STT_URL = os.environ.get("SCRUBIN_STT_URL", "https://api.groq.com/openai/v1/audio/transcriptions")
STT_MODEL = os.environ.get("SCRUBIN_STT_MODEL", "whisper-large-v3-turbo")


def api_key() -> Optional[str]:
    return os.environ.get("SCRUBIN_LLM_API_KEY") or os.environ.get("GROQ_API_KEY")


ACTION_SCHEMA = """
Each action is a JSON object with a "type" field. Allowed types and fields:
- drug: {"type":"drug","drug":<drug id>,"dose":number|null,"unit":"mg"|"mcg"|"g"|"mg/kg"|"mcg/kg"|null}
- infusion: {"type":"infusion","drug":<drug id>,"rate":number|null,"unit":"mcg/kg/min"|"mcg/kg/h"|"mcg/min"|"mg/h"|null,"stop":bool}
- volatile: {"type":"volatile","percent":number}            (sevoflurane dial %)
- gas: {"type":"gas","o2_flow":number|null,"air_flow":number|null}   (L/min)
- vent: {"type":"vent","mode":"manual"|"vcv"|"pcv"|null,"tv_ml":n|null,"rr":n|null,"peep":n|null,"pinsp":n|null}
- bag: {"type":"bag","on":bool}                               (manual bag ventilation)
- airway: {"type":"airway","maneuver":one of [mask_on, mask_off, jaw_thrust_on, jaw_thrust_off, oral_airway, nasal_airway, remove_adjuncts, two_hand_mask_on, two_hand_mask_off, cricoid_on, cricoid_off, nasal_cannula, intubate, lma, extubate, remove_lma, reposition_tube, suction], "laryngoscope":"mac3"|"mac4"|"miller2"|"video"|null, "bougie":bool|null, "tube_size":n|null, "depth_cm":n|null, "lma_size":n|null, "flow":n|null}
- fluid: {"type":"fluid","fluid":"lactated_ringers"|"normal_saline"|"albumin_5"|"prbc","volume_ml":number}
- monitor: {"type":"monitor","attach":[ecg,spo2,nibp,etco2,temp,bis,tof,art_line],"cycle_nibp":bool,"nibp_interval_s":n|null}
- assess: {"type":"assess","what":"auscultate"|"check_tof"|"check_capnogram"|"look"|"check_abg"|"ask_surgeon"|"check_airway_pressure"}
- cpr: {"type":"cpr","on":bool};  defibrillate: {"type":"defibrillate","joules":n}
- position: {"type":"position","position":"supine"|"trendelenburg"|"reverse_trendelenburg"|"left_side_down"|"level"}
- warming: {"type":"warming","on":bool}
- say: {"type":"say","to":"team"|"surgeon"|"anesthesia"|"circulator"|"scrub"|"patient","intent":"time_out"|"ready_for_incision"|"stop_surgery"|"question"|null,"text":<words>}
- confirm: {"type":"confirm","accept":bool}
- surgical: {"type":"surgical","verb":<verb>,"instrument":<id>|null,"target":<id>|null,"params":{}}
"""

SYSTEM = """You translate spoken orders in a simulated operating room into structured JSON actions.

Rules:
- NEVER invent a dose, rate or number the speaker did not say. If a required number is missing, set it to null (the team will ask).
- If the words are ambiguous between two drugs (e.g. "neo" = neostigmine or neosynephrine/phenylephrine), do not guess: return a clarification question.
- Use only the drug ids listed. "neosynephrine"/"neo-synephrine" = phenylephrine. "Ancef" = cefazolin. "Zofran" = ondansetron.
- Prefer a concrete action over "say" whenever the speaker is asking for something to be done (a drug, a table position, a ventilator change, a surgical step). Asking anesthesia/the circulator to tilt the table is a "position" action. Use "say" only for conversation or requests no action type covers.
- For surgical steps, use type "surgical" with "verb" set to one of the listed surgical verbs and "instrument"/"target" set to the listed ids.
- If the speaker is just talking to the patient or team (asking a question, reassuring), emit a "say" action and, if a reply is natural, write a short in-character reply using ONLY the case facts given. Do not invent vital signs or findings.
- Output a single JSON object: {"actions":[...], "clarification": string|null, "reply": {"from": "patient"|"surgeon"|"circulator"|"scrub"|"anesthesia", "text": string} | null}
""" + ACTION_SCHEMA


def _context_block(context: dict[str, Any]) -> str:
    drug_ids = ", ".join(sorted(DRUGS))
    return (
        f"Trainee role: {context.get('role', 'anesthesia')}\n"
        f"Available drug ids: {drug_ids}\n"
        f"Current airway: {context.get('airway', 'none')}; ventilator: {context.get('vent', 'manual')}\n"
        f"Surgical verbs available: {context.get('surgical_verbs', 'none')}\n"
        f"Surgical instrument ids: {context.get('instruments', 'none')}; target ids: {context.get('targets', 'none')}\n"
        f"Case facts (public): {json.dumps(context.get('patient', {}))}\n"
    )


async def llm_parse(text: str, context: dict[str, Any], timeout_s: float = 8.0) -> ParseResult:
    key = api_key()
    r = ParseResult(source="llm")
    if not key:
        r.unparsed.append(text)
        return r
    payload = {
        "model": MODEL,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        **({"reasoning_effort": "low"} if "gpt-oss" in MODEL else {}),
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": _context_block(context) + f'\nUtterance: "{text}"'},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=timeout_s) as client:
            resp = await client.post(API_URL, headers={"Authorization": f"Bearer {key}"}, json=payload)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
        data = json.loads(content)
    except (httpx.HTTPError, KeyError, ValueError, json.JSONDecodeError):
        r.unparsed.append(text)
        return r
    return coerce_llm_output(data, text)


def coerce_llm_output(data: dict, text: str) -> ParseResult:
    """Validate raw LLM JSON into a ParseResult; drop anything off-schema."""
    r = ParseResult(source="llm")
    for a in data.get("actions") or []:
        if not isinstance(a, dict):
            continue
        a = {k: v for k, v in a.items() if v is not None}
        if a.get("type") == "drug" and a.get("drug") not in DRUGS:
            continue
        a["utterance"] = text
        try:
            parse_action(a)
        except ValidationError:
            continue
        r.actions.append(a)
    clar = data.get("clarification")
    if isinstance(clar, str) and clar.strip():
        r.clarification = clar.strip()
    reply = data.get("reply")
    if isinstance(reply, dict) and isinstance(reply.get("text"), str) and reply.get("from") in ("patient", "surgeon", "circulator", "scrub", "anesthesia"):
        r.reply = {"from": reply["from"], "text": reply["text"][:400]}
    if not r.actions and not r.clarification and not r.reply:
        r.unparsed.append(text)
    return r


async def transcribe(audio: bytes, filename: str = "speech.webm", timeout_s: float = 15.0) -> Optional[str]:
    key = api_key()
    if not key:
        return None
    prompt = ("Operating room orders: propofol, fentanyl, remifentanil, rocuronium, succinylcholine, sugammadex, "
              "neostigmine, glycopyrrolate, phenylephrine, ephedrine, sevoflurane, cefazolin, metronidazole, "
              "PEEP, tidal volume, laryngoscope, bougie, LMA, Trendelenburg, trocar, Veress, mesoappendix, endoloop.")
    files = {"file": (filename, audio, "audio/webm")}
    data = {"model": STT_MODEL, "prompt": prompt, "language": "en", "temperature": "0"}
    try:
        async with httpx.AsyncClient(timeout=timeout_s) as client:
            resp = await client.post(STT_URL, headers={"Authorization": f"Bearer {key}"}, files=files, data=data)
            resp.raise_for_status()
            return resp.json().get("text", "").strip() or None
    except (httpx.HTTPError, ValueError):
        return None
