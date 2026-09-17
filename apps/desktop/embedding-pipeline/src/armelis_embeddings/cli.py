from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

from .config import DEFAULT_BATCH_SIZE
from .embedder import FakeEmbedder, HuggingFaceEmbedder
from .store import utc_now, write_jsonl
from .text import assemble_text


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="armelis-embeddings",
        description="Embed Armelis-normalized findings with a local Hugging Face model.",
    )
    parser.add_argument("--input", required=True, help="Normalized findings JSON (object with findings, or an array)")
    parser.add_argument("--output", help="JSONL output path. Defaults to <input-dir>/finding_embeddings.jsonl")
    parser.add_argument(
        "--fake",
        action="store_true",
        help="Use the deterministic fake embedder (tests/CI only; does not download weights)",
    )
    args = parser.parse_args(argv)

    try:
        input_path = _resolve_input(args.input)
        output_path = Path(args.output) if args.output else input_path.parent / "finding_embeddings.jsonl"
        findings = load_findings(input_path)
        embedder = FakeEmbedder() if args.fake else HuggingFaceEmbedder()
        records = embed_findings(findings, embedder)
        write_jsonl(output_path, records)
    except Exception as error:
        summary = {
            "status": "FAILED",
            "embedded": 0,
            "failed": 0,
            "error": str(error),
        }
        json.dump(summary, sys.stdout, ensure_ascii=True)
        sys.stdout.write("\n")
        print(str(error), file=sys.stderr)
        return 1

    succeeded = sum(1 for record in records if record["status"] == "SUCCEEDED")
    failed = sum(1 for record in records if record["status"] == "FAILED")
    summary = {
        "status": "SUCCEEDED" if failed == 0 else "FAILED",
        "embedded": succeeded,
        "failed": failed,
        "output": str(output_path),
        "model_id": embedder.model_id,
        "model_revision": embedder.model_revision,
    }
    json.dump(summary, sys.stdout, ensure_ascii=True)
    sys.stdout.write("\n")
    return 0 if failed == 0 else 1


def load_findings(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        findings = payload
    elif isinstance(payload, dict) and isinstance(payload.get("findings"), list):
        findings = payload["findings"]
    elif isinstance(payload, dict) and payload.get("id") and payload.get("title"):
        findings = [payload]
    else:
        raise ValueError("input JSON must be a findings array or an object with a findings array")
    copied: list[dict[str, Any]] = []
    for finding in findings:
        if not isinstance(finding, dict):
            raise ValueError("each finding must be an object")
        copied.append(dict(finding))
    return copied


def embed_findings(findings: list[dict[str, Any]], embedder: Any) -> list[dict[str, Any]]:
    prepared: list[tuple[dict[str, Any], str, list[str], str]] = []
    for finding in findings:
        finding_id = str(finding.get("id") or "").strip()
        if not finding_id:
            raise ValueError("finding is missing id")
        text, source_fields = assemble_text(finding)
        text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
        prepared.append((finding, text, source_fields, text_hash))

    records: list[dict[str, Any]] = []
    for offset in range(0, len(prepared), DEFAULT_BATCH_SIZE):
        batch = prepared[offset : offset + DEFAULT_BATCH_SIZE]
        texts = [item[1] for item in batch]
        try:
            vectors = embedder.encode(texts)
            if len(vectors) != len(batch):
                raise RuntimeError("embedder returned the wrong number of vectors")
            for (finding, _text, source_fields, text_hash), vector in zip(batch, vectors, strict=True):
                records.append(
                    _record(
                        finding,
                        embedder,
                        source_fields,
                        text_hash,
                        status="SUCCEEDED",
                        vector=vector,
                        error=None,
                    )
                )
        except Exception as error:
            for finding, _text, source_fields, text_hash in batch:
                records.append(
                    _record(
                        finding,
                        embedder,
                        source_fields,
                        text_hash,
                        status="FAILED",
                        vector=None,
                        error=str(error),
                    )
                )
    return records


def _record(
    finding: dict[str, Any],
    embedder: Any,
    source_fields: list[str],
    text_hash: str,
    status: str,
    vector: list[float] | None,
    error: str | None,
) -> dict[str, Any]:
    finding_id = str(finding["id"])
    identity = f"{finding_id}|{embedder.model_id}|{embedder.model_revision}|{text_hash}"
    record: dict[str, Any] = {
        "id": f"emb-{hashlib.sha256(identity.encode('utf-8')).hexdigest()[:24]}",
        "finding_id": finding_id,
        "model_id": embedder.model_id,
        "model_revision": embedder.model_revision,
        "embedding_dim": int(embedder.embedding_dim),
        "text_hash": text_hash,
        "source_fields": source_fields,
        "status": status,
        "error": error,
        "created_at": utc_now(),
    }
    if vector is not None:
        record["vector"] = vector
    return record


def _resolve_input(raw: str) -> Path:
    if "://" in raw:
        raise ValueError("remote URLs are not allowed")
    path = Path(raw).expanduser()
    if not path.is_file():
        raise ValueError(f"input is not a file: {path}")
    return path.resolve()


if __name__ == "__main__":
    raise SystemExit(main())
