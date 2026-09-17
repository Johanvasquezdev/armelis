from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REQUIRED_FIELDS = (
    "id",
    "finding_id",
    "model_id",
    "model_revision",
    "embedding_dim",
    "text_hash",
    "source_fields",
    "status",
    "created_at",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def validate_record(record: dict[str, Any]) -> None:
    missing = [field for field in REQUIRED_FIELDS if field not in record]
    if missing:
        raise ValueError(f"embedding record missing fields: {', '.join(missing)}")
    if record["status"] not in {"PENDING", "SUCCEEDED", "FAILED"}:
        raise ValueError("embedding status is invalid")
    if record["status"] == "SUCCEEDED":
        vector = record.get("vector")
        if not isinstance(vector, list) or not vector:
            raise ValueError("succeeded embedding is missing vector")
        if len(vector) != int(record["embedding_dim"]):
            raise ValueError("vector length does not match embedding_dim")
    text_hash = str(record["text_hash"])
    if len(text_hash) != 64 or any(char not in "0123456789abcdef" for char in text_hash):
        raise ValueError("text_hash must be sha-256 hex")


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    existing = _read_jsonl(path)
    merged = _upsert(existing, records)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for record in merged:
            validate_record(record)
            handle.write(json.dumps(record, ensure_ascii=True) + "\n")


def _read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    records: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        payload = json.loads(line)
        if isinstance(payload, dict):
            records.append(payload)
    return records


def _upsert(existing: list[dict[str, Any]], incoming: list[dict[str, Any]]) -> list[dict[str, Any]]:
    keyed: dict[tuple[str, str, str], dict[str, Any]] = {}
    for record in existing + incoming:
        key = (
            str(record.get("finding_id") or ""),
            str(record.get("model_id") or ""),
            str(record.get("model_revision") or ""),
        )
        keyed[key] = record
    return list(keyed.values())
