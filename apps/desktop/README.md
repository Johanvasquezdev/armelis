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

## Development

```powershell
npm install
npm run tauri dev
```

This first slice is intentionally local-only. The target architecture links the desktop client to the Armelis web service using the same account, projects, normalized finding contracts, reports, and graph data. Local scan synchronization will be added only after explicit project selection and user confirmation.
