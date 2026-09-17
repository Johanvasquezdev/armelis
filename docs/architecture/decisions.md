# Armelis Architecture Decisions

## Decision 001 Project name

Armelis is the current product name. ThreatGraph is the previous working name and remains useful when referring to the security-graph concept.

## Decision 002 Evidence providers

Armelis integrates specialist scanners instead of replacing them. Scanners provide evidence; Armelis normalizes, correlates, prioritizes, and explains that evidence.

## Decision 003 Incremental delivery

Armelis will be built as vertical slices. A working evidence pipeline has priority over a broad but unverified platform surface.

## Decision 004 Desktop-local Hugging Face embeddings

Normalized findings may be embedded on the workstation after a local scan. The worker lives in `apps/desktop/embedding-pipeline/` and loads `sentence-transformers/all-MiniLM-L6-v2` from a pinned Hub revision onto CPU. Vectors are written to a sidecar JSONL file (`finding_embeddings`), not onto `finding.schema.json`.

Similarity scores are retrieval infrastructure. They must not set finding `confidence` to `CONFIRMED`, change severity, or be presented as scanner evidence. Embedder failures are visible (`FAILED` plus an error) and must not fail the Trivy scan. Public Hugging Face Inference APIs are out of scope; findings stay local.
