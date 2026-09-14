# CyberScan Client Platform

## Decision

CyberScan is one linked product with two clients:

- Web client for browser access and centralized product updates.
- Tauri 2 desktop client for the same workspace plus local scanning capabilities.

Both clients use the same authenticated CyberScan backend, domain contracts, design system, and project data.

Electron is not the initial desktop target.

## Shared product model

The relationship should feel like Discord: the user signs in once, sees the same workspace across clients, and changes made in one client become available in the other through the shared service.

```text
Web client ───────┐
                  ├── Authenticated CyberScan API ── PostgreSQL
Desktop client ───┘              │
                                 ├── Scan queue and workers
                                 ├── Projects and findings
                                 ├── Reports and graph data
                                 └── Realtime events
```

The desktop client may perform a local scan, but it should upload only the normalized result and permitted evidence after the user chooses a project and confirms synchronization. Source code remains local unless the user explicitly configures repository upload or remote scanning.

## Why web first

- The primary product is a security dashboard and analysis workspace.
- Users need access from desktop and mobile browsers.
- Next.js supports route-based rendering, shared layouts, metadata, and PWA capabilities.
- Updates can be deployed centrally without packaging a new desktop binary.
- Responsive design makes the graph, findings, reports, and remediation views available on smaller screens.

## Why Tauri for desktop

Tauri can reuse the web frontend while providing a native shell for desktop and mobile targets. It is appropriate if CyberScan later needs:

- Local repository selection.
- Local scanner execution through a restricted native bridge.
- Offline report review.
- OS notifications.
- Secure local storage or device integration.

The native bridge must expose narrow allowlisted operations. It must not become unrestricted shell execution.

## Why not Electron first

Electron is a valid option when the product needs a mature Node.js desktop ecosystem or deep JavaScript-native integration. It also increases the bundled runtime and security responsibility because the application includes Chromium and Node.js capabilities. Electron would require strict context isolation, process sandboxing, restrictive CSP, controlled navigation, validated IPC senders, and no Node integration for remote content.

Those requirements are manageable, but they are not necessary for CyberScan's first product slice.

## Update behavior

### Web

Web UI changes deploy centrally and are available immediately.

### Desktop

The desktop binary contains a versioned copy of the shared UI and native bridge. It receives signed application updates through a Tauri updater flow. The desktop app must not silently execute arbitrary remote JavaScript as a shortcut for instant updates.

This gives us Discord-like product continuity while preserving a clear trust boundary for a security tool.

## Proposed repository structure

```text
apps/
  web/                 Next.js application and PWA
  desktop/             Tauri wrapper and local scanner bridge
packages/
  ui/                  Shared React components and design tokens
  domain/              Findings, scans, graph, and report contracts
  api-client/          Typed API client
  scanner-adapters/    Server-side scanner integrations
workers/               Scan orchestration and analysis jobs
```

## Runtime boundaries

```text
Browser / PWA / Tauri UI
          |
          v
Authenticated CyberScan API
          |
          v
Queue and isolated scanner workers
          |
          v
PostgreSQL + object storage for controlled evidence
```

The browser and desktop UI must not directly execute scanners in the first architecture. Scanner execution remains on controlled workers. A future desktop-local mode would require a separate threat model and explicit user approval.

## Product phases

1. Responsive Next.js web dashboard.
2. Shared UI and domain packages.
3. Authenticated project, scan, and report synchronization.
4. Tauri desktop shell with local scanning.
5. Signed desktop updates.
6. PWA manifest, offline shell, and mobile-friendly read-only views.
7. Native mobile capabilities only after validating the PWA experience.

## Decision rule

Choose Electron later only if a required desktop capability cannot be delivered safely with Tauri or a browser/PWA. Do not select a desktop shell merely to package the dashboard.
