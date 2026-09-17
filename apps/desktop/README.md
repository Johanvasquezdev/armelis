# Armelis Local

The Tauri client is the local-analysis surface for Armelis. It reuses the JavaScript/React design language while invoking a narrow Rust command for an explicitly selected local directory.

## Current slice

- Enter a local application or repository path.
- Select Trivy scanners.
- Invoke Trivy without shell interpretation.
- Return JSON output and process status to the UI.

## Requirements

- Node.js and npm.
- Rust and Cargo.
- Tauri 2 prerequisites for the operating system.
- Trivy installed and available as `trivy`, or pass a configured executable path in a future settings flow.
- Python 3.11+ for the local Hugging Face embedding worker in `embedding-pipeline/` (optional; scan still succeeds if the embedder is missing).

## Local embeddings

Vectors are generated on-device with `sentence-transformers/all-MiniLM-L6-v2`. They are similarity infrastructure only — not confirmed evidence and not a confidence score.

```powershell
cd embedding-pipeline
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -t .
.\.venv\Scripts\python.exe .\run.py --fake --input .\tests\fixtures\findings.json --output $env:TEMP\finding_embeddings.jsonl
```

The fake embedder is for tests only. For MiniLM on a real scan:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```
## Development

```powershell
npm install
npm run tauri dev
```

This first slice is intentionally local-only. The target architecture links the desktop client to the Armelis web service using the same account, projects, normalized finding contracts, reports, and graph data. Local scan synchronization will be added only after explicit project selection and user confirmation.
