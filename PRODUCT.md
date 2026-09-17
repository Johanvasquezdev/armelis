# Product

<!-- impeccable:product-schema 1 -->

## Platform

web & desktop

## Stack

- **Web Client:** Next.js 15+ (App Router), React 19, TypeScript, GSAP, Anime.js, and Tailwind-compatible CSS.
- **Desktop Client:** Tauri 2 (Rust native command bridge) with React frontend.
- **Scanner Pipeline:** Node.js adapter runners (Trivy, Semgrep, Gitleaks), shared JSON Schema (`packages/finding-model`).
- **Intelligence & Persistence:** PostgreSQL + `pgvector` for vector similarity and finding storage (SQLite for local unit testing), Python embedding worker (`sentence-transformers/all-MiniLM-L6-v2`).

## Users

Security engineers, software developers, DevOps practitioners, and systems administrators who need to cut through alert fatigue, understand what findings actually matter, and know what to fix first.

## Product Purpose

Armelis turns disconnected scanner evidence into actionable security understanding. By connecting raw findings to components, identities, sensitive resources, and entry points, it maps concrete risk stories and attack paths, recommending the smallest meaningful change to eliminate exposure.

## Positioning

Armelis is a **100% Free and Open Source (FOSS) security intelligence layer** published under the permissive **MIT License**. It does not compete with or replace scanners like Trivy, Semgrep, or Gitleaks; it integrates them as evidence providers, correlates their outputs, calculates reachability and blast radius, and prioritizes remediation based on actual business risk rather than raw vulnerability totals. There are no paywalls, no tiered feature restrictions, and no commercial locks.


## Operating Context

Armelis offers a dual-client operating model (the "Discord model"):
- **Web Workspace:** Centralized dashboard for collaborative analysis, attack-path visualization, report generation, and compliance readiness tracking.
- **Tauri Desktop Client:** Secure workstation runner for developers to analyze local repositories directly. Source code remains strictly on the local machine unless the user explicitly configures remote synchronization.

## Capabilities and Constraints

- **Evidence before inference:** Findings must be grounded in verified scanner outputs, configurations, or proven paths.
- **Immutable provenance:** Retain raw scanner payloads, rule identifiers, timestamps, and tool versions.
- **Local-first privacy:** Proprietary source code and configuration files are analyzed locally and never transmitted to external servers without explicit user instruction.
- **Automated secret redaction:** Sensitive values (`secret`, `token`, `password`, `key`, `raw`, `plaintext`) are automatically masked as `[REDACTED]` prior to persistence or display.
- **Human-in-the-loop remediation:** Automated fixes or state modifications require explicit human review and confirmation.
- **Framework readiness:** Supports readiness workflows for SOC 2 and ISO/IEC 27001:2022 by mapping evidence to control objectives without making unsupported compliance or certification claims.

## Brand Commitments

- **Product Name:** Armelis (formerly *ThreatGraph*; legacy prototype name *Secora* is deprecated and removed).
- **Official Identity:** Precision radar/network mark, bold white **ARME** lettering, vibrant electric-blue **LIS** lettering (`#00E5FF`), on a deep dark navy background (`#0A0F1D`).
- **Product Voice:** Precise, technical, evidence-based, calm, and actionable.

## Evidence on Hand

- Official Armelis logo and vector wordmarks in `apps/web/public/`.
- Validated Trivy scanner adapter and runner test suites (`packages/scanner-adapters/trivy`).
- Canonical finding model schema specification (`packages/finding-model/finding.schema.json`).
- Architecture plans for semantic embedding and vector similarity (`ARCHITECTURE_PLAN.md`).

## Product Principles

1. **Analyze before prioritizing:** Correlate findings before assigning priority scores.
2. **Evidence before inference:** Never assume reachability or exploitability without proof.
3. **Context over counts:** A single critical attack path matters more than 200 isolated medium warnings.
4. **Make uncertainty visible:** Distinguish between confirmed findings and exploratory hypotheses.
5. **Recommend the smallest meaningful fix:** Highlight the precise change that breaks the attack chain.

## Accessibility & Inclusion

- Adherence to Apple HIG and WCAG 2.1 AA contrast standards.
- Semantic HTML landmarks (`main`, `header`, `nav`, `section`, `article`).
- Unrestricted keyboard navigation with distinct electric-blue focus rings.
- Full respect for `prefers-reduced-motion` across all GSAP and Anime.js animations.
- Touch target areas $\ge 44 \times 44\text{ pt}$ on mobile and touch interfaces.
