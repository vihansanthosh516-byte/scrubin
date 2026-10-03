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
# Free-tier friendly: Groq rate-limits each model separately (free plan: 8k tokens/min,
# 1k requests/day per model), so on a 429 we fall through to the next free model.
FALLBACK_MODELS = [m.strip() for m in os.environ.get("SCRUBIN_LLM_FALLBACKS", "openai/gpt-oss-20b,qwen/qwen3.8-27b").split(",") if m.strip()]
# Last-resort free backup on OpenRouter (slower, ~5 s, but a separate quota).
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.environ.get("SCRUBIN_OPENROUTER_MODEL", "nvidia/nemotron-3-super-120b-a12b:free")


def _providers() -> list[tuple[str, str, str]]:
    """(url, key, model) in the order to try them."""
    out: list[tuple[str, str, str]] = []
    key = api_key()
    if key:
        out += [(API_URL, key, m) for m in [MODEL, *[m for m in FALLBACK_MODELS if m != MODEL]]]
    or_key = os.environ.get("OPENROUTER_API_KEY")
    if or_key and OPENROUTER_MODEL:
        out.append((OPENROUTER_URL, or_key, OPENROUTER_MODEL))
    return out
STT_URL = os.environ.get("SCRUBIN_STT_URL", "https://api.groq.com/openai/v1/audio/transcriptions")
STT_MODEL = os.environ.get("SCRUBIN_STT_MODEL", "whisper-large-v3-turbo")


def api_key() -> Optional[str]:
    key = os.environ.get("SCRUBIN_LLM_API_KEY") or os.environ.get("GROQ_API_KEY")
    if not key and API_URL.startswith(("http://localhost", "http://127.0.0.1")):
        return "local"  # e.g. Ollama: free, unlimited, no key needed
    return key


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
- If the speaker is talking to the patient or team, emit a "say" action. Whenever they ask the patient a question, ALWAYS write a short in-character "reply" from the patient, using the case facts and the patient's "interview" answers. If the question isn't covered, give a plausible, clinically unremarkable answer consistent with the chart. Never reveal or invent vital signs, exam findings or test results. A sedated/anesthetized patient cannot answer (reply null).
- Output a single JSON object: {"actions":[...], "clarification": string|null, "reply": {"from": "patient"|"surgeon"|"circulator"|"scrub"|"anesthesia", "text": string} | null}
""" + ACTION_SCHEMA


def _context_block(context: dict[str, Any]) -> str:
    drug_ids = ", ".join(sorted(DRUGS))
    return (
        f"Trainee role: {context.get('role', 'anesthesia')}\n"
        f"Available drug ids: {drug_ids}\n"
        f"Current airway: {context.get('airway', 'none')}; ventilator: {context.get('vent', 'manual')}; patient is {context.get('consciousness', 'awake')}\n"
        f"Surgical verbs available: {context.get('surgical_verbs', 'none')}\n"
        f"Surgical instrument ids: {context.get('instruments', 'none')}; target ids: {context.get('targets', 'none')}\n"
        f"Case facts (public): {json.dumps(context.get('patient', {}))}\n"
    )


async def llm_parse(text: str, context: dict[str, Any], timeout_s: float = 8.0) -> ParseResult:
    r = ParseResult(source="llm")
    providers = _providers()
    if not providers:
        r.unparsed.append(text)
        return r
    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": _context_block(context) + f'\nUtterance: "{text}"'},
    ]
    data = None
    async with httpx.AsyncClient(timeout=timeout_s) as client:
        for url, key, model in providers:
            payload: dict[str, Any] = {"model": model, "temperature": 0, "response_format": {"type": "json_object"}, "messages": messages}
            if "gpt-oss" in model:
                payload["reasoning_effort"] = "low"
            elif "qwen3" in model and "groq" in url:
                payload["reasoning_format"] = "hidden"
            timeout = timeout_s if "openrouter" not in url else max(timeout_s, 15.0)
            try:
                resp = await client.post(url, headers={"Authorization": f"Bearer {key}"}, json=payload, timeout=timeout)
                if resp.status_code in (429, 500, 502, 503) or (resp.status_code == 400 and "json" in resp.text.lower()):
                    continue  # rate-limited / flaky / bad JSON: try the next free model
                resp.raise_for_status()
                content = resp.json()["choices"][0]["message"]["content"] or ""
                data = json.loads(content[content.find("{"): content.rfind("}") + 1])
                break
            except (httpx.HTTPError, KeyError, ValueError, json.JSONDecodeError):
                continue
    if data is None:
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
    if isinstance(reply, dict) and isinstance(reply.get("text"), str) and reply["text"].strip():
        who = str(reply.get("from") or "patient").lower()
        who = who if who in ("patient", "surgeon", "circulator", "scrub", "anesthesia") else "patient"
        r.reply = {"from": who, "text": reply["text"].strip()[:400]}
    if not r.actions and not r.clarification and not r.reply:
        r.unparsed.append(text)
    return r


async def transcribe(audio: bytes, filename: str = "speech.webm", timeout_s: float = 15.0) -> Optional[str]:
    key = api_key()
    if not key:
        return None
    prompt = ("Operating room orders: propofol, fentanyl, remifentanil, rocuronium, succinylcholine, sugammadex, "
              "neostigmine, glycopyrrolate, phenylephrine, ephedrine, sevoflurane, cefazolin, metronidazole, "
              "PEEP, tidal volume, laryngoscope, bougie, LMA, Trendelenburg, trocar, Veress, mesoappendix, endoloop, cholecystectomy, cystic duct, Calot, critical view of safety.")
    files = {"file": (filename, audio, "audio/webm")}
    data = {"model": STT_MODEL, "prompt": prompt, "language": "en", "temperature": "0"}
    try:
        async with httpx.AsyncClient(timeout=timeout_s) as client:
            resp = await client.post(STT_URL, headers={"Authorization": f"Bearer {key}"}, files=files, data=data)
            resp.raise_for_status()
            return resp.json().get("text", "").strip() or None
    except (httpx.HTTPError, ValueError):
        return None
