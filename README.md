# Armelis

<p align="center">
 <img width="2172" height="724" alt="image" src="https://github.com/user-attachments/assets/c505ca4d-b305-489e-a4fc-0c47a1c4986a" />

</p>

<h3 align="center">Application Security Intelligence for AI-Assisted Teams & SOC Analysts</h3>

<p align="center">
  <em>See every hop from public entry point to crown-jewel asset — then fix the one link that breaks the chain.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/armelis"><img src="https://img.shields.io/npm/v/armelis.svg?color=cb3837&logo=npm" alt="npm version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Open%20Source-100%25%20Free-34d399.svg" alt="Open Source: 100% Free" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Platform-Web%20%7C%20Tauri%202%20Desktop-00e5ff.svg" alt="Platform: Web | Tauri 2 Desktop" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Standards-OWASP%20Top%2010%20%7C%20MITRE%20ATT%26CK-f59e0b.svg" alt="Standards: OWASP | MITRE" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Privacy-Air--Gapped%20%2F%20Local-8b5cf6.svg" alt="Privacy: Air-Gapped / Local" /></a>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-15.2-000000.svg?logo=nextdotjs&logoColor=white" alt="Next.js 15" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Tauri-2.0-24c8d8.svg?logo=tauri&logoColor=white" alt="Tauri 2" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.0-3178c6.svg?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#"><img src="https://img.shields.io/badge/SIEM-CEF%20%7C%20ECS%20%7C%20Syslog-10b981.svg" alt="SIEM: CEF | ECS | Syslog" /></a>
</p>

---

## Overview

**Armelis** is a **100% Free and Open Source (FOSS)** security intelligence platform architected and developed by **Johan Vasquez**. Published under the permissive **MIT License**, it transforms raw, disjointed vulnerability scanner output (Trivy, Semgrep, Gitleaks) into cohesive, actionable attack path models and prioritized remediation workflows.

Instead of overwhelming security and development teams with an unfiltered wall of 200 medium-severity alerts, Armelis maps the full exploitation route:
$$\text{Public Entry Point} \xrightarrow{\quad\text{Hop 1}\quad} \text{Vulnerability / Exploit} \xrightarrow{\quad\text{Hop 2}\quad} \text{Privilege Escalation} \xrightarrow{\quad\text{Hop 3}\quad} \text{Crown-Jewel Asset}$$

By isolating the critical single fix that severs the chain, developers and SOC analysts resolve root risks in minutes.

---

## Why Armelis for AI-Assisted Teams?

AI coding assistants (Cursor, GitHub Copilot, Devin, Claude Code) generate code at unprecedented speeds, but frequently introduce subtle security risks:
* **Missing Ownership & Tenant Isolation (IDOR):** Boilerplate CRUD endpoints generated without verifying authenticated user identity against requested resources.
* **Committed Cloud Secrets:** Plaintext credentials and IAM keys inadvertently committed in generated Terraform or Docker compose files.
* **Supply Chain Hallucinations:** Imports of non-existent, abandoned, or typo-squatted dependencies.

Armelis provides:
1. **Deterministic Reachability Analysis:** Validates whether an alert is actually exposed to public internet attack surfaces.
2. **1-Click AI Fix Prompts:** Synthesizes context-aware, deterministic remediation prompts engineered for instant, 1-turn resolution in Cursor, Copilot, or Claude Code.
3. **Rescan Verification:** Deterministically verifies that the applied patch broke the attack path and eliminated exposure.

---

## Key Capabilities

* **Unified Multi-Scanner Normalization:** Ingests Trivy (vulnerabilities, misconfigs, secrets, licenses), Semgrep (SAST), and Gitleaks evidence into a canonical, strict JSON Schema (`packages/finding-model`).
* **Automated Secret Redaction:** Deep recursive sanitization permanently masks sensitive keys (`secret`, `token`, `password`, `key`, `plaintext`) as `[REDACTED]` before persistence, display, or SIEM streaming.
* **Adversary Framework Mapping:** Automatically cross-references findings to **MITRE ATT&CK Enterprise Tactics & Techniques** (e.g. T1190, T1552.001, T1068, T1195.002) and **OWASP Top 10 (2021)**.
* **Native SIEM Exporter:** Out-of-the-box streaming and batch exports in **CEF** (Splunk, ArcSight, QRadar), **ECS / NDJSON** (Elasticsearch, Kibana, Wazuh), and **RFC 5424 Syslog**.
* **Air-Gapped & Local-First:** Runs 100% locally on your machine. Zero telemetry, zero analytics tracking, and zero source code exfiltration.
* **Dual-Client Architecture:**
  * **Web Client (`apps/web`):** Next.js 15 App Router, React 19, GSAP, Anime.js, and Tailwind CSS.
  * **Desktop Client (`apps/desktop`):** Secure workstation runner powered by Tauri 2 (Rust native command bridge) for offline repository analysis.

---

## Architecture Pipeline

```text
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│     Trivy      │     │    Semgrep     │     │    Gitleaks    │
│  (CVEs / IaC)  │     │     (SAST)     │     │   (Secrets)    │
└────────┬───────┘     └────────┬───────┘     └────────┬───────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │  Recursive Sanitizer (Secret Redaction)      │
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │  Canonical Finding Schema (Draft 2020-12)    │
         │  + MITRE ATT&CK & OWASP Top 10 Correlation   │
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │  Graph Reachability & Attack Path Synthesizer│
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │  Armelis Security Console                   │
         │  ├── Visual Kill-Chain Inspector             │
         │  ├── 1-Click AI Fix Prompts (Cursor/Copilot) │
         │  └── SIEM Exporter (CEF / ECS / Syslog)      │
         └──────────────────────────────────────────────┘
```

---

## Monorepo Layout

```text
Armelis/
├── bin/                         # Global executable launcher (node bin/armelis.js)
├── apps/
│   ├── web/                     # Web dashboard & portal (Next.js 15+, React 19, GSAP)
│   └── desktop/                 # Workstation client (Tauri 2 + Vite + React + Rust)
├── packages/
│   ├── cli/                     # Zero-dependency Armelis CLI (scan, trace, break, export)
│   ├── finding-model/           # Canonical JSON Schema for normalized findings
│   └── scanner-adapters/        # Provider ingestion modules
│       └── trivy/               # Trivy runner, normalizer, and SIEM exporter
├── docs/                        # Architecture decision records, threat models & specifications
├── DESIGN.md                    # Armelis Design System & Anti-Vibecoding Standards
├── APPLE_DESIGN.md              # Apple HIG and macOS design specification
├── POLITICS.md                  # Project governance, Terms of Use & Privacy Policy
├── SECURITY.md                  # Hardening, secure coding & threat model standards
└── LICENSE                      # MIT License (Copyright 2026 Johan Vasquez)
```

---

## Installation & Quick Start

### 1. Global CLI via npm (Recommended)
Install Armelis globally across macOS, Linux, or Windows with Node 18+:

```bash
npm install -g armelis
```

Verify your installation:
```bash
armelis --version
armelis --help
```

---

### 2. Zero-Install Instant Execution (`npx`)
Run scans, trace lateral attack reachability, or break exploit chains without installing:

```bash
# Scan local repository or directory
npx armelis scan .

# Trace attack reachability graph
npx armelis trace .

# Pinpoint minimal choke-point cut
npx armelis break .

# Stream telemetry to SIEM (CEF / Syslog)
npx armelis export . --format cef
```

---

### 3. Clone from Source (Monorepo)
```bash
git clone https://github.com/Johanvasquezdev/armelis.git
cd armelis
npm install
node bin/armelis.js scan .
```


### Scan guidance (Trivy)

Prefer a **small target** first so cold Trivy DB downloads and filesystem walks stay within budget:

```bash
# Fixture-first (fast smoke)
node bin/armelis.js scan packages/scanner-adapters/trivy/test/fixture

# Explicit subdirectory
node bin/armelis.js scan apps/web

# Full monorepo (skips node_modules, .git, dist, build, .next, target, .venv; 10m default timeout)
node bin/armelis.js scan .
```

If a root scan still times out on OneDrive/network drives, pass a narrower `--target` (via the adapter CLI) or raise `--timeout-ms`.

### Install notes

From the monorepo root (`npm install`) uses `.npmrc` `legacy-peer-deps=true` to avoid npm 10 arborist peer crashes (`matches` / `edgesOut`) seen with Next/SWC optional peers and `class-variance-authority` on Node 22.

### 2. Armelis CLI (Zero Dependencies)
Run security intelligence, graph traversal, and chain severance directly from your terminal:

```bash
# Scan repository and normalize multi-scanner findings
node bin/armelis.js scan .

# Trace reachability attack paths (hops) from public entry points to crown jewels
node bin/armelis.js trace .

# Find the single critical link that breaks the attack chain + get 1-click AI fix prompt
node bin/armelis.js break .

# Stream normalized findings to SIEM (CEF / ECS / Syslog)
node bin/armelis.js export . --format cef
```

### 3. Launch Web Console
```bash
cd apps/web
npm install
npm run dev
```
Visit **`http://localhost:3000`** for the landing page or **`http://localhost:3000/dashboard`** for the live security console.

### 4. Launch Desktop Client (Tauri 2)
```bash
cd apps/desktop
npm install
npm run tauri dev
```

---

## Standards & Framework Readiness

Armelis maps scanner evidence against leading industry security controls to accelerate audit readiness:
* **SOC 2 Type II:** Trust Services Criteria (CC6.1 Logical Access, CC6.6 Vulnerability Management, CC7.1 Threat Detection).
* **ISO/IEC 27001:2022:** Annex A.8.8 Management of Technical Vulnerabilities, A.8.12 Data Leakage Prevention, A.8.28 Secure Coding.
* **OWASP Top 10 (2021):** Direct tagging for Broken Access Control (A01), Cryptographic Failures (A02), Injection (A03), and Vulnerable Components (A06).

*(Note: Armelis provides evidence correlation and audit preparedness workflows; it does not issue automated compliance certifications).*

---

## Acceptable Use & Privacy

* **Authorized Testing Only:** Operators must only scan repositories and systems they own or have documented permission to audit.
* **Zero Telemetry:** Armelis does not collect telemetry, analytics, or user metrics. All scan payloads and source code remain strictly local.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 **Johan Vasquez**. Free for personal, open source, academic, and commercial use.
