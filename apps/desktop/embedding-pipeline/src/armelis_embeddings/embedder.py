from __future__ import annotations

import hashlib
from typing import Protocol

from .config import (
    DEFAULT_DEVICE,
    DEFAULT_EMBEDDING_DIM,
    DEFAULT_MODEL_ID,
    DEFAULT_MODEL_REVISION,
    cache_dir,
    model_id,
    model_revision,
)


class Embedder(Protocol):
    model_id: str
    model_revision: str
    embedding_dim: int

    def encode(self, texts: list[str]) -> list[list[float]]:
        ...

    def provenance_checksum(self) -> str:
        ...


def provenance_checksum(model: str, revision: str) -> str:
    return hashlib.sha256(f"{model}@{revision}".encode("utf-8")).hexdigest()


class FakeEmbedder:
    """Deterministic 384-d vectors for tests. Does not download weights."""

    def __init__(
        self,
        model: str = "armelis/fake-hash-embedder",
        revision: str = "test",
        dim: int = DEFAULT_EMBEDDING_DIM,
    ) -> None:
        self.model_id = model
        self.model_revision = revision
        self.embedding_dim = dim

    def provenance_checksum(self) -> str:
        return provenance_checksum(self.model_id, self.model_revision)

    def encode(self, texts: list[str]) -> list[list[float]]:
        return [_hash_vector(text, self.embedding_dim) for text in texts]


class HuggingFaceEmbedder:
    def __init__(
        self,
        model: str | None = None,
        revision: str | None = None,
        device: str = DEFAULT_DEVICE,
    ) -> None:
        self.model_id = model or model_id()
        self.model_revision = revision or model_revision()
        self.embedding_dim = DEFAULT_EMBEDDING_DIM
        self.device = device
        self._model = None

    def provenance_checksum(self) -> str:
        return provenance_checksum(self.model_id, self.model_revision)

    def _load(self):
        if self._model is not None:
            return self._model
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as error:
            raise RuntimeError(
                "sentence-transformers is not installed in the desktop embedding venv. "
                "Create apps/desktop/embedding-pipeline/.venv and install requirements.txt."
            ) from error

        cache = str(cache_dir())
        self._model = SentenceTransformer(
            self.model_id,
            revision=self.model_revision,
            trust_remote_code=False,
            cache_folder=cache,
            device=self.device,
        )
        dimension = int(self._model.get_sentence_embedding_dimension() or DEFAULT_EMBEDDING_DIM)
        self.embedding_dim = dimension
        return self._model

    def encode(self, texts: list[str]) -> list[list[float]]:
        loaded = self._load()
        vectors = loaded.encode(
            texts,
            batch_size=32,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return [vector.astype(float).tolist() for vector in vectors]


def _hash_vector(text: str, dim: int) -> list[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    raw: list[int] = []
    counter = 0
    while len(raw) < dim:
        block = hashlib.sha256(digest + counter.to_bytes(4, "big")).digest()
        raw.extend(block)
        counter += 1
    values = [(byte / 127.5) - 1.0 for byte in raw[:dim]]
    norm = sum(value * value for value in values) ** 0.5
    if norm == 0:
        return values
    return [value / norm for value in values]
