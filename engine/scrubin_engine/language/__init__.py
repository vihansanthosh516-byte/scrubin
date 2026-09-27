"""Speech/text -> actions. Grammar first (fast, offline), LLM for the rest."""

from __future__ import annotations

from typing import Any

from .grammar import ParseResult, parse
from .llm import _providers, llm_parse


async def interpret(text: str, context: dict[str, Any], use_llm: bool = True) -> ParseResult:
    result = parse(text)
    if result.ok and not result.unparsed:
        return result
    if use_llm and _providers():
        llm = await llm_parse(text, context)
        if llm.ok or llm.reply:
            return llm
    return result


__all__ = ["interpret", "parse", "ParseResult"]
