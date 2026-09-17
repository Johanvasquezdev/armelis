from __future__ import annotations

import os
from pathlib import Path

DEFAULT_MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
# Pinned Hub revision for all-MiniLM-L6-v2 (384-d, 256-token window).
DEFAULT_MODEL_REVISION = "c9745ed1d9f207309f1a2403c530327fe4cd2e79"
DEFAULT_EMBEDDING_DIM = 384
DEFAULT_DEVICE = "cpu"
DEFAULT_MAX_CHARS = 1000
DEFAULT_BATCH_SIZE = 32

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CACHE_DIR = PACKAGE_ROOT / ".cache"


def cache_dir() -> Path:
    configured = os.environ.get("HF_HOME") or os.environ.get("ARMELIS_HF_HOME")
    path = Path(configured) if configured else DEFAULT_CACHE_DIR
    path.mkdir(parents=True, exist_ok=True)
    return path


def model_id() -> str:
    return os.environ.get("ARMELIS_EMBEDDING_MODEL", DEFAULT_MODEL_ID)


def model_revision() -> str:
    return os.environ.get("ARMELIS_EMBEDDING_REVISION", DEFAULT_MODEL_REVISION)
