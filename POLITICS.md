# POLITICS.md — Personal Project Governance, Terms of Use & Privacy Policy

> **Document Classification:** Official Governance, Acceptable Use & Privacy Framework  
> **Project Scope:** Armelis (Independent Personal Project)  
> **Author & Lead Maintainer:** Johan Vasquez  
> **Effective Date:** 2026 Operative Year in Ahead  
> **Review Cycle:** Annual Revision  

---

## 🏛️ 1. Scope of Application & Project Nature

**Armelis** is an independent personal project created, architected, and maintained exclusively by **Johan Vasquez**. 

- It is **not** an enterprise application of Blue Hawk Technologies or Harper projects.
- Consequently, corporate chains of command, hardware loan duration limits (15-day rules), physical asset barcode tagging (`BH-YYYY-XXXX`), and institutional server matrices do not apply.
- The governance of Armelis is established through this unified document containing the **Open Source Licensing Charter**, **Terms of Use**, **Privacy Policy**, **AI Transparency Directive**, and **External API Security Guidelines**.

---

## ⚖️ 1.1. Open Source Licensing Policy (MIT License)

Armelis is **100% Free and Open Source Software (FOSS)** distributed under the terms of the **MIT License**.

- **Zero Commercial Fees or Paywalls:** Any developer, student, security researcher, or organization may download, run, self-host, audit, and modify Armelis free of charge.
- **Enterprise Permissiveness:** The MIT License was intentionally chosen over restrictive copyleft licenses (e.g., GPL) to enable security teams to freely integrate Armelis into their private DevSecOps pipelines, CI/CD runners, and internal SOC workflows without fear of legal contamination.
- **Copyright & Provenance:** Original copyright remains with **Johan Vasquez**. All copies, forks, or substantial portions of the software must retain the original copyright notice and MIT permission notice as defined in the root `LICENSE` file.
- **Community Contributions:** Contributions, pull requests, and bug reports are welcome under the same MIT License terms.


---

## 📜 2. Terms of Use (Acceptable Use Policy)

By accessing, running, deploying, or testing Armelis (including its CLI runners, web dashboard, and Tauri desktop application), you agree to the following terms:

### 2.1. Strictly Authorized Targets
1. **Explicit Authorization Required:** Operators must only scan, analyze, or audit repositories, source code, container images, infrastructure files, and application endpoints that they own or for which they possess formal, documented authorization to test.
2. **Prohibition of Malicious Scanning:** Armelis must never be used to conduct unauthorized port scanning, vulnerability discovery, reconnaissance, or automated attacks against third-party systems, public cloud assets, or organizations without consent.

### 2.2. Defensive & Educational Purpose
- Armelis is built as a defensive intelligence tool to help developers, DevOps engineers, and security auditors understand contextual risk and remediate vulnerabilities before deployment.
- The software must not be weaponized or integrated into offensive exploitation toolchains.

### 2.3. Disclaimer of Warranties & Limitation of Liability
- **"As-Is" Provision:** Armelis is provided "as is" and "as available", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, or non-infringement.
- **No Guarantee of Total Security:** Scanner integrations and correlation algorithms provide analytical assistance based on available evidence. Armelis does not warrant that it will detect every existing vulnerability, nor that reported findings will be 100% free of false positives.
- **Compliance Disclaimers:** Mapping findings to SOC 2 or ISO/IEC 27001:2022 controls serves as audit preparation evidence; it does not constitute official certification or legal compliance advice.

---

## 🔒 3. Privacy Policy & Data Protection

Armelis is designed from the ground up with a **local-first, privacy-by-design** philosophy.

### 3.1. Local-First Source Code Confinement
1. **Source Code Stays on Your Machine:** In local CLI execution and in the Tauri desktop client, source code and configuration files are processed directly on the host machine. Source code is **never** transmitted, uploaded, or mirrored to external cloud servers.
2. **Explicit Synchronization Only:** In the web workspace mode, only normalized finding summaries (title, severity, file path, line number, redacted evidence) are stored in the database. Raw repository contents remain outside the persistent database layer unless an operator explicitly connects a remote git provider.

### 3.2. Mandatory Secret Redaction (*Zero Credential Leakage*)
All scanner adapters (including Trivy, Semgrep, and Gitleaks) implement recursive evidence sanitization:
- Any field containing sensitive tokens, passwords, private keys, API credentials, or raw matched secrets (`secret`, `raw`, `plaintext`, `match`, `token`, `password`) is automatically replaced with `[REDACTED]` before finding records are created or stored.
- Redacted data can never be viewed in logs, exported in reports, or retrieved via API endpoints.

### 3.3. Zero Unsolicited Telemetry
- Armelis does not collect telemetry, analytics, user keystrokes, repository names, or private scan findings.
- No behavioral tracking scripts or third-party marketing trackers are loaded in the application.

---

## 🤖 4. AI Transparency & Human-in-the-Loop Directives

When AI models, semantic embeddings, or LLM explanation features are integrated into Armelis:

### 4.1. Unambiguous AI Disclosure
- Any finding explanation, remediation suggestion, attack-path narrative, or summary generated by an artificial intelligence model must be **clearly and visually labeled** (e.g., *"AI-Generated Analysis"*, *"Heuristic Suggestion"*).
- The user interface must never present an AI prediction as a verified, confirmed finding without empirical evidence.

### 4.2. Mandatory Human Supervision (*Human-in-the-Loop*)
- AI-driven suggestions (e.g., automated code patches, changing a finding's status to `RESOLVED` or `FALSE_POSITIVE`) **cannot be applied autonomously**.
- The system must always require explicit operator confirmation before persisting state changes or generating remediation pull requests.

---

## 🌐 5. Governance of External APIs & Third-Party Services

1. **No External Transmission of Confidential Data:**
   - It is strictly forbidden to send raw source code, secrets, database passwords, or unredacted vulnerability payloads to public, third-party AI APIs (e.g., public OpenAI, Claude, or Gemini endpoints) without prior automated redaction and explicit operator consent.
2. **Local Embedding Models Preferred:**
   - Semantic similarity, finding deduplication, and vector search are architected to run locally via dedicated workers (`sentence-transformers/all-MiniLM-L6-v2`) rather than transmitting security findings across the internet.
3. **Graceful Offline Degradation:**
   - The platform must function in fully air-gapped or offline environments. Failure to reach an external service must never crash the scan engine or result in silent data loss.

---

*For inquiries or security reporting regarding Armelis, contact Johan Vasquez.*
