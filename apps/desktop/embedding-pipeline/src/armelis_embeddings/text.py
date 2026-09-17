from __future__ import annotations

import re
from typing import Any

from .config import DEFAULT_MAX_CHARS

SECRET_KEY_PATTERN = re.compile(
    r"^(secret|match|raw|plaintext|value|token|password|key)$",
    re.IGNORECASE,
)
REDACTED = "[REDACTED]"
SOURCE_CANDIDATES = ("title", "description", "category", "finding_type", "cwe", "cve")


def redact_value(value: Any) -> Any:
    if isinstance(value, list):
        return [redact_value(item) for item in value]
    if not isinstance(value, dict):
        return value
    redacted: dict[str, Any] = {}
    for key, child in value.items():
        if SECRET_KEY_PATTERN.match(str(key)):
            redacted[key] = REDACTED
        else:
            redacted[key] = redact_value(child)
    return redacted


def assemble_text(finding: dict[str, Any], max_chars: int = DEFAULT_MAX_CHARS) -> tuple[str, list[str]]:
    if not isinstance(finding, dict):
        raise TypeError("finding must be an object")

    parts: list[str] = []
    source_fields: list[str] = []
    for field in SOURCE_CANDIDATES:
        raw = finding.get(field)
        if raw is None:
            continue
        text = str(raw).strip()
        if not text:
            continue
        parts.append(text)
        source_fields.append(field)

    finding_type = str(finding.get("finding_type") or "").upper()
    evidence = finding.get("evidence")
    if finding_type != "SECRET" and isinstance(evidence, dict):
        safe_evidence = redact_value(evidence)
        snippet = _evidence_snippet(safe_evidence)
        if snippet:
            parts.append(snippet)
            source_fields.append("evidence")

    assembled = " ".join(parts).strip()
    if len(assembled) > max_chars:
        assembled = assembled[:max_chars].rstrip()
    return assembled, source_fields


def _evidence_snippet(evidence: dict[str, Any]) -> str:
    pieces: list[str] = []
    for key in ("target", "artifact_name", "class", "type", "file", "resolution"):
        value = evidence.get(key)
        if isinstance(value, str) and value.strip() and value != REDACTED:
            pieces.append(value.strip())
    return " ".join(pieces)
