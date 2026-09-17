# Armelis — Project Context & Architecture Reference

> **Document Classification:** Technical Architecture & Personal Project Reference  
> **Last Updated:** 2026-09-14  
> **Repository Root:** `Armelis/`  
> **Maintainer / Owner:** Johan Vasquez (Personal Project)

---

## 1. Executive Summary & Vision

**Armelis** (formerly *ThreatGraph*, prototype marketing name *Secora*) is a security intelligence platform designed to transform raw vulnerability and scanner evidence into comprehensive security understanding. 

Rather than overwhelming security engineers and development teams with raw vulnerability counts, Armelis connects findings across components, identities, sensitive resources, and dependencies to map concrete risk stories, attack paths, and prioritized remediation actions ("find the path, fix the risk").

### Core Philosophy & Principles
- **Evidence before inference:** Findings are based strictly on demonstrable scanner data, configurations, or proven paths. Uncertainty is made visible, never obscured.
- **Provenance preservation:** Original raw scanner payloads, rule identifiers, timestamps, and tool versions are retained immutably.
- **Context over raw counts:** Prioritize actionable risk reduction rather than cosmetic metrics (e.g., "start with the single authorization fix that breaks the attack path").
- **Vertical slice delivery:** Each feature is delivered as an end-to-end demonstrable slice (CLI runner -> adapter -> normalization -> persistence -> dashboard).
- **Strict security boundaries:** Scanners operate with least privilege, safe argument vectors (no shell expansion), and strict path confinement.

---

## 2. Project Ownership & Governance (100% Free & Open Source)

**Armelis** is an independent personal project developed, architected, and maintained solely by **Johan Vasquez**. It is **100% Free and Open Source Software (FOSS)** published under the permissive **MIT License**. It is **not** a Blue Hawk Technologies or Harper project. Enterprise corporate chains of command, hardware custody workflows (`BH-YYYY-XXXX`), and institutional asset matrices do not apply.

Governance for Armelis centers on developer-first software ethics, defined by the **MIT License**, **Terms of Use**, and **Privacy Policy**:


### 2.1 Terms of Use (Acceptable Use & Liability)
- **Authorized Targets Only:** Operators must only scan repositories, containers, infrastructure, and endpoints that they own or for which they possess explicit, documented authorization to test.
- **Defensive & Analytical Purpose:** Armelis is designed strictly for defensive intelligence, vulnerability remediation, and audit preparedness. It must not be weaponized or used for unauthorized reconnaissance or exploitation.
- **As-Is Provision & Disclaimers:** Armelis provides security evidence correlation and prioritization "as-is". It does not guarantee zero false positives, complete vulnerability identification, or automated regulatory certification.

### 2.2 Privacy Policy & Data Handling
- **Local-First Privacy Architecture:** In local mode (CLI and Tauri desktop), source code, configuration files, and repository metadata remain confined strictly to the operator's machine. No source code or file contents are transmitted to external servers without explicit operator consent.
- **Zero Unsanitized Secret Exposure:** All scanner adapters recursively redact sensitive fields (`secret`, `plaintext`, `token`, `password`, `key`, `match`) into `[REDACTED]` before generating normalized finding records, preventing inadvertent credential leakage in logs, exports, or UI screens.
- **No Unsolicited Tracking or Telemetry:** The application does not collect invasive usage telemetry or track private repository contents.

### 2.3 Framework Readiness Scope
- **Purpose:** Assists developers and teams in gathering evidence, mapping controls, and preparing for independent assessments (such as SOC 2 or ISO/IEC 27001:2022).
- **Claim Boundaries:** The project maintains an evidence-backed posture and prohibits unsupported claims of third-party compliance or certification.
- **Control Status Taxonomy:** `NOT_STARTED`, `IN_PROGRESS`, `READY_FOR_REVIEW`, `EVIDENCE_COLLECTED`, `EXCEPTION_OPEN`, `VERIFIED`, `NOT_APPLICABLE`.

---

## 3. Monorepo Structure & Codebase Map

```text
Armelis/
├── apps/
│   ├── web/                     # Web dashboard & marketing portal (Next.js 15+ App Router)
│   │   ├── app/                 # Next.js App Router routes (layout, page, sitemap, robots, opengraph)
│   │   ├── components/          # Reusable UI components (Radix UI, Tailwind-compatible styling)
│   │   ├── lib/                 # Utilities (clsx, tailwind-merge)
│   │   └── public/              # Static assets (Armelis logos, llm.txt, brand imagery)
│   └── desktop/                 # Cross-platform desktop application (Tauri 2 + Vite + React + Rust)
│       ├── src/                 # React frontend for local scanner control
│       ├── src-tauri/           # Rust native application core & capabilities
│       │   ├── src/main.rs      # Native command bridge (`scan_local_repository`)
│       │   ├── Cargo.toml       # Rust dependencies (serde, tauri)
│       │   └── tauri.conf.json  # Tauri app permissions and configuration
│       └── package.json         # Desktop client scripts & frontend dependencies
├── packages/
│   ├── finding-model/           # Canonical domain schemas and contracts
│   │   ├── finding.schema.json  # JSON Schema (Draft 2020-12) for normalized findings
│   │   └── README.md
│   └── scanner-adapters/        # Specialized provider ingestion and normalization modules
│       └── trivy/               # Trivy scanner integration
│           ├── index.js         # Normalizer, secret redactor & MITRE/OWASP mapper
│           ├── runner.js        # Safe child process spawn runner with boundary checks
│           ├── scan.js          # Standalone CLI scan runner with --format options
│           ├── siem-exporter.js # SIEM formatter (CEF, ECS/NDJSON, RFC 5424 Syslog)
│           ├── package.json
│           └── test/            # Adapter, runner, scan & SIEM exporter test suites
├── workers/                     # Long-running scan, analysis, and embedding pipelines
│   └── (embedding-pipeline)     # Planned Python + Hugging Face sentence-transformers worker
├── docs/                        # Architecture decisions, threat models, and specifications
│   ├── architecture/
│   │   ├── v0.1.md              # Initial evidence pipeline architecture
│   │   ├── decisions.md         # Architecture Decision Records (ADRs)
│   │   ├── scanner-strategy.md  # Multi-scanner adaptation strategy
│   │   ├── client-platform.md   # Web vs Tauri dual-client strategy
│   │   └── web-seo.md           # SEO, Open Graph, llm.txt, and metadata guidelines
│   ├── compliance/
│   │   └── framework-readiness.md # SOC 2 / ISO 27001 readiness specifications
│   └── threat-model/
│       └── v0.1.md              # Threat modeling, attack surfaces, and security controls
├── ARCHITECTURE_PLAN.md         # Proposal for Hugging Face embeddings & pgvector pipeline
├── PRODUCT.md                   # Product vision, target persona, brand commitments
├── README.md                    # Project overview and milestone roadmap
├── DESIGN.md                    # Armelis Design System & color/typography tokens
├── APPLE_DESIGN.md              # Apple Human Interface & System Design Guide
├── POLITICS.md                  # Personal project governance, Terms of Use & Privacy Policy
├── SECURITY.md                  # Comprehensive cybersecurity, hardening & resilience standard
└── context.md                   # This project context document
```

---

## 4. Key Components & Architecture

### 4.1 Client Strategy: Web-First + Tauri Native Bridge
Armelis provides a unified user experience across two synchronized clients (similar to the Discord model):
- **Web Client (`apps/web`):** Built with Next.js App Router, React 19, GSAP, Anime.js, and Radix UI. Serves as the central security portal for review, collaboration, compliance readiness reporting, and attack path visualization. Features full SEO support, `robots.txt`, `llm.txt`, and canonical routing without leaking scan metadata.
- **Desktop Client (`apps/desktop`):** Built with Tauri 2 and React. Allows developers and security analysts to run local scans directly against repositories on their local workstation without sending source code to remote servers. The Rust bridge executes `trivy` with strict arguments and path validation.

### 4.2 Finding Model Contract (`packages/finding-model`)
Every scanner integration normalizes its output to conform to `finding.schema.json` (`additionalProperties: false`):
- **Required fields:** `id`, `title`, `severity`, `confidence`, `source`, `category`, `status`, `provenance`, `evidence`.
- **Severity levels:** `INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, `UNKNOWN`.
- **Confidence levels:** `LOW`, `MEDIUM`, `HIGH`, `CONFIRMED`, `UNKNOWN`.
- **Finding types:** `CODE`, `DEPENDENCY`, `CONTAINER`, `IAC`, `SECRET`, `LICENSE`, `API`, `CONFIGURATION`, `OTHER`.
- **Status lifecycle:** `OPEN`, `CONFIRMED`, `FALSE_POSITIVE`, `ACCEPTED_RISK`, `IN_PROGRESS`, `RESOLVED`, `REOPENED`.
- **Provenance metadata:** `scanner`, `scanner_version`, `rule_id`, `raw_finding_id`.

### 4.3 Scanner Adapters (`packages/scanner-adapters`)
- **Trivy Adapter & SOC Integration:**
  - Invokes `trivy repo --format json --scanners vuln,misconfig,secret,license`.
  - Concurrently processes vulnerabilities (CVEs), IaC misconfigurations, exposed secrets, and licensing issues.
  - Automatically maps findings to **MITRE ATT&CK enterprise tactics & techniques** (`T1190`, `T1552.001`, `T1562.001`, `T1195.002`) and **OWASP Top 10 (2021)**.
  - Automatically redacts sensitive secret values (`secret`, `raw`, `plaintext`, `match`) in the evidence tree.
  - Generates deterministic, collision-resistant finding IDs via SHA-256 digests.
  - Includes a dedicated **SIEM Exporter** (`siem-exporter.js`) supporting **CEF** (Splunk / ArcSight / QRadar), **ECS / NDJSON** (Elasticsearch / Wazuh), and **RFC 5424 Syslog**.
- **Planned Adapters:**
  - **Semgrep:** SAST and custom code rule execution.
  - **Gitleaks:** Dedicated git history secret scanning.
  - **Snyk-compatible JSON Import:** Ingest third-party dependency reports without lock-in.

### 4.4 Planned Embedding Pipeline (`workers/embedding-pipeline`)
- **Engine:** Python with Hugging Face `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional vectors).
- **Purpose:** Semantic similarity search, cross-scanner finding deduplication, and RAG grounding.
- **Strict Decoupling:** Vectors are stored in a dedicated `finding_embeddings` table in PostgreSQL (`pgvector`), completely separated from raw scanner evidence.

---

## 5. Security Architecture & Threat Mitigation

| Threat | Impact | Mitigation in Armelis |
|---|---|---|
| **Command Injection** | Remote code execution on worker or host | All process executions use argument vectors (`spawn(executable, args, { shell: false })` in Node.js, `Command::new().args()` in Rust). Shell expansion is explicitly prohibited. |
| **Path Traversal** | Unauthorized filesystem access | Strict validation (`validateTarget`) confirming canonical paths remain within the designated `workspaceRoot`. Remote URL schemes (`http://`, `git://`) are blocked in local execution. |
| **Secret Leakage** | Exposure of API keys, tokens, or credentials | Deep recursive evidence sanitizer (`redactEvidence`) masks sensitive fields as `[REDACTED]` before persistence or UI rendering. |
| **Silent Scanner Failure** | False sense of security from empty results | Process failures, non-zero exits, and stderr are recorded as explicit failure states rather than empty findings. |
| **Unverified AI Inferences** | Hallucinated vulnerabilities or exploitability | Machine learning and LLM outputs are treated as exploratory hypotheses; they never overwrite scanner evidence or set finding confidence to `CONFIRMED`. |

---

## 6. Development Workflow & Commands

### Prerequisites
- **Node.js:** v20+ (v22 tested)
- **Rust / Cargo:** For desktop Tauri build
- **Trivy:** Installed locally and available on `$PATH` (or specified via `--trivy`)
- **Python:** 3.11+ (for upcoming embedding workers)

### Common Commands
- **Run Trivy Adapter Tests:**
  ```powershell
  cd packages/scanner-adapters/trivy
  node test/trivy-adapter.test.js
  node test/runner.test.js
  node test/scan.test.js
  ```
- **Execute Local Trivy Scan via CLI:**
  ```powershell
  node packages/scanner-adapters/trivy/scan.js --target <path-to-repo> --output .armelis/scans/test.json
  ```
- **Run Web Client (Next.js):**
  ```powershell
  cd apps/web
  npm run dev
  ```
- **Run Desktop Client (Tauri):**
  ```powershell
  cd apps/desktop
  npm run tauri dev
  ```

---

*Armelis is an independent personal project created, developed, and maintained by Johan Vasquez.*
