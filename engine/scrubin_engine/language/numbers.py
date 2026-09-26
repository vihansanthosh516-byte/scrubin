"""Turn spoken numbers into digits ("one fifty" -> 150, "point five" -> 0.5)."""

from __future__ import annotations

import re

UNITS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
    "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
}
TENS = {"twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90}
WORDS = set(UNITS) | set(TENS) | {"hundred", "thousand", "a", "and", "point", "half"}


def _parse_words(tokens: list[str]) -> float | None:
    """Parse a run of number words. Supports 'one fifty' (=150) and 'one hundred fifty'."""
    if not tokens or all(t in ("a", "and") for t in tokens):
        return None
    if "point" in tokens:
        i = tokens.index("point")
        whole = _parse_words(tokens[:i]) if i > 0 else 0.0
        frac_digits = "".join(str(UNITS[t]) for t in tokens[i + 1 :] if t in UNITS and UNITS[t] < 10)
        if whole is None or not frac_digits:
            return None
        return whole + float("0." + frac_digits)
    total, current = 0, 0
    groups: list[int] = []
    for t in tokens:
        if t in ("a", "and"):
            if t == "a":
                current = max(current, 1)
            continue
        if t in UNITS:
            if current and current % 10 == 0 and current < 100 and UNITS[t] < 10:
                current += UNITS[t]
            elif current and current < 10 and not groups:
                # "one fifty": leading hundreds shorthand
                groups.append(current)
                current = UNITS[t]
            else:
                current += UNITS[t]
        elif t in TENS:
            if current and current < 10 and not groups:
                groups.append(current)
                current = TENS[t]
            else:
                current += TENS[t]
        elif t == "hundred":
            current = max(current, 1) * 100
        elif t == "thousand":
            total += max(current, 1) * 1000
            current = 0
        elif t == "half":
            return (total + current + 0.5) if (total + current) else 0.5
    if groups:
        # e.g. "one fifty" -> 1*100 + 50 ; "two twenty five" -> 225
        return float(groups[0] * 100 + current)
    return float(total + current)


def normalise_numbers(text: str) -> str:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9]*|\d+(?:\.\d+)?|[^\sa-zA-Z\d]", text.lower())
    out: list[str] = []
    run: list[str] = []

    def flush():
        nonlocal run
        trailing: list[str] = []
        while run and run[-1] in ("a", "and"):
            trailing.insert(0, run.pop())
        # Don't turn a lone "a" or "and" into a number.
        meaningful = [t for t in run if t not in ("a", "and")]
        if meaningful:
            val = _parse_words(run)
            if val is not None:
                out.append(f"{val:g}")
                out.extend(trailing)
                run = []
                return
        out.extend(run)
        out.extend(trailing)
        run = []

    for t in tokens:
        if t in WORDS:
            if t in ("a", "and") and not run:
                out.append(t)
                continue
            run.append(t)
        else:
            flush()
            out.append(t)
    flush()
    s = " ".join(out)
    s = re.sub(r"(\d) \. (\d)", r"\1.\2", s)
    s = re.sub(r"\s+([%/,])", r"\1", s)
    s = re.sub(r"([/])\s+", r"\1", s)
    return s
