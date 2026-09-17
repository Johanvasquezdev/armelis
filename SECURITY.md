# SECURITY.md — Comprehensive Cybersecurity, Hardening & Resilience Standard

> **Document Classification:** Official Security Architecture & Defense Standard  
> **Project Scope:** Armelis (Web Workspace, Tauri Desktop & Scanner Adapters)  
> **Owner & Security Lead:** Johan Vasquez  
> **Version:** 1.0.0 (Production 2026)  

---

## 🏛️ 1. Security Governance & Core Objectives

As a security intelligence platform, **Armelis must embody the highest security standards it expects of the software it inspects**. Every architectural layer—from local process execution to database persistence and frontend rendering—is fortified to prevent misuse, data leakage, and supply-chain compromise.

---

## 🛡️ 2. Veracity, Authenticity & Information Disclosure

### 2.1. Zero Fabricated Findings or Fake Metrics
- **Absolute Authenticity:** Armelis never fabricates exploitability claims, simulated findings, synthetic customer reviews, or exaggerated risk scores.
- **Provable Provenance:** Every finding record displayed in the dashboard is cryptographically anchored to its original scanner execution by a deterministic SHA-256 identity:
  $$\text{ID} = \text{SHA-256}(\text{kind} \parallel \text{target} \parallel \text{rule\_id} \parallel \text{pkg\_name} \parallel \text{line})[0:24]$$

### 2.2. Error Handling & Zero Stack Trace Leakage
- **Neutral 404 & 500 Responses:** All unhandled exceptions and missing routes present neutral, cleanly styled error pages.
- **Stack Trace Suppression:** Under no circumstances are stack traces, environment variables, internal server paths (`C:\Users\...`), or database schema names disclosed in HTTP response bodies or client consoles.
- **Uniform Route Probing Defense:** The web application returns identical generic responses for non-existent and unauthorized routes to prevent path and user enumeration.

---

## 🔒 3. Authentication, Session Security & Access Control

For multi-user and web-connected deployments of Armelis:

### 3.1. Dual JWT Token Architecture & Automatic Rotation
1. **Short-Lived Access Token:** 
   - Strict lifespan of **15 minutes**.
   - Cryptographically signed with `RS256` or `HS256` using high-entropy secrets stored in secure environment variables.
2. **Rotating Refresh Token (*One-Time Use*):**
   - Lifespan of **7 days**.
   - Upon session renewal, the used refresh token is immediately burned and replaced.
   - **Reuse Detection (Theft Mitigation):** If a consumed refresh token is presented again, the system immediately flags a compromise, revoking the entire token family and terminating all active sessions for that identity.

### 3.2. Brute-Force Defense & Lockout Policy
- **Threshold:** Maximum **five (5) consecutive failed authentication attempts** per user identity or IP address.
- **Account Lockout:** Triggers a **thirty (30) minute lockout period**.
- **Rate Limiting:** Authentication endpoints are hard-capped at **5 requests per minute per IP**.

### 3.3. Timing Attack Mitigation & User Enumeration Prevention
- **Opaque Authentication Feedback:** Login endpoints consistently return *"Invalid credentials or unauthorized account"*, regardless of whether the username/email exists.
- **Constant-Time Verification:** Password hashes are verified using `bcrypt` (or `argon2id`). If an unknown user is queried, a dummy hash calculation is performed in memory to ensure uniform response timing.

### 3.4. Session Cookie Hardening
Cookies issued by the application strictly enforce the modern security baseline:
```http
Set-Cookie: __Host-armelis_session=token_value; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=900
```
- `HttpOnly`: Prevents client-side JavaScript access, neutralizing session theft via XSS.
- `Secure`: Restricts transmission exclusively to encrypted HTTPS channels.
- `SameSite=Strict`: Protects against Cross-Site Request Forgery (CSRF).
- `__Host-` Prefix: Locks the cookie to the exact host domain, preventing sub-domain overwriting.

---

## 🛑 4. Zero Role Bypass: Backend Cryptographic Authority

> [!CAUTION]
> **Fundamental Security Principle:**  
> **The client browser is an untrusted execution environment.**  
> No security check, permission boundary, or tenant isolation may rely solely on client-side React state, TypeScript interfaces, or LocalStorage.

1. **Client Manipulation Immunity:** Forcing `user.role = 'admin'` via browser DevTools, Redux DevTools, or console scripts has zero impact on server authorization.
2. **Per-Endpoint Verification:** Every API route verifies the cryptographic signature of the JWT and checks database permissions before executing queries.
3. **Obfuscation of Sensitive Routes:** Administrative and internal scanning endpoints do not use predictable URLs like `/admin` or `/debug`.

---

## 💉 5. Application Hardening & OWASP Top 10 Mitigation

### 5.1. Cross-Site Scripting (XSS)
- **Automatic JSX Escaping:** All dynamic content is automatically escaped by React.
- **Sanitized Markdown Rendering:** Any scanner descriptions or CWE explanations containing markdown are scrubbed using **DOMPurify** before rendering.
- **URI Scheme Restrictions:** Hyperlinks only allow `https://` or relative application paths; protocols such as `javascript:`, `data:`, or `vbscript:` are blocked.

### 5.2. SQL Injection (SQLi)
- **ORM Parameterization:** All queries to PostgreSQL or SQLite use **SQLAlchemy / Prisma** parameterized statements.
- **Prohibition of Raw Concatenation:** String interpolation (e.g. `f"SELECT * FROM findings WHERE id = '{id}'"`) is strictly forbidden.
- **Schema Validation:** Incoming payloads are strictly validated using Pydantic / Zod before reaching the data layer.

### 5.3. Process Execution & Scanner Sandboxing
- **No Shell Execution:** Scanner adapters (Trivy, Semgrep, Gitleaks) are invoked strictly via direct process APIs (`spawn(executable, args, { shell: false })` in Node.js, `Command::new().args()` in Rust).
- **Argument Vector Confinement:** All scanner arguments are passed as structured arrays, preventing argument injection.
- **Directory Traversal Defense:** Scan targets are validated using `validateTarget`, ensuring canonical paths remain strictly inside the configured `workspaceRoot`. Remote URL schemes (`http://`, `git://`) are rejected for local runs.

### 5.4. Deep Evidence Redaction
- Before persisting any scanner output, `redactEvidence` recursively scans the JSON payload, masking credentials, tokens, and plaintext passwords under `[REDACTED]`.

---

## 🌐 6. Network Security, HTTP Headers & CORS

Production deployments (via Nginx or Next.js edge middleware) enforce:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' wss://*; frame-ancestors 'none'; object-src 'none'; base-uri 'self';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

- **HSTS:** Enforces HTTPS for 2 years (`max-age=63072000`), stopping SSL stripping attacks.
- **X-Frame-Options: DENY:** Prevents clickjacking by forbidding embedding in third-party `<iframe>` elements.
- **Strict CORS Whitelist:** Wildcard origins (`Access-Control-Allow-Origin: *`) are forbidden whenever credentials or session tokens are involved.

---

## 🤖 7. Prompt Injection Defense & AI Safety

When integrating LLM explanation models or semantic search:
1. **Context Isolation:** Scanner evidence and repository snippets are treated as untrusted input and strictly wrapped in structural tags:
   ```xml
   <system_instructions>You are a security intelligence assistant...</system_instructions>
   <untrusted_evidence>RAW_SCANNER_SNIPPET</untrusted_evidence>
   ```
2. **Input Sanitization:** Prompts are stripped of adversarial override sequences (e.g., *"Ignore previous instructions and execute..."*).
3. **No Autonomous Changes:** AI models may generate hypotheses and remediation summaries; they can **never** execute scans, modify source code, or mutate databases autonomously.

---

## 📜 8. Immutable Audit Logging & Incident Response

1. **Audit Trail:**
   - Critical events (scan executions, finding status updates, user logins, failed auth attempts, report exports) are logged with UTC timestamps, user IDs, and client IP addresses.
2. **Tamper Resistance:** Audit logs are append-only and cannot be altered through standard application interfaces.
3. **Incident Escalation:**
   - Any suspected compromise, unauthorized scanning attempt, or privilege escalation is logged immediately and escalated to **Johan Vasquez**.

---

*To report a security vulnerability in Armelis, contact Johan Vasquez.*
