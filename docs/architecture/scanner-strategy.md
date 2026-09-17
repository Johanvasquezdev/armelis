# Armelis Scanner Strategy

## What Armelis adapts

Armelis uses established scanners as evidence providers. It does not copy proprietary scoring, databases, or product behavior.

### Snyk-inspired patterns

- Developer-first feedback close to the repository and pull request.
- Separate coverage for source code, open-source dependencies, containers, and infrastructure as code.
- Dependency paths and fix guidance as first-class evidence.
- Rescan history so a change can be verified over time.

### Trivy-inspired patterns

- One scan target can expose multiple evidence types: vulnerability, misconfiguration, secret, license, and SBOM data.
- Support repositories, filesystems, images, and SBOM inputs.
- Preserve package, target, path, line, advisory, and scanner metadata.
- Make scanner selection and skipped paths explicit.
- Treat scanner database freshness and offline mode as part of scan provenance.

### OWASP Top 10-inspired patterns

OWASP Top 10 categories are a classification and education layer, not proof that a finding is exploitable. A finding may map to one or more categories, with the mapping rule and confidence preserved.

Initial mappings:

| ID | Category |
| --- | --- |
| A01:2021 | Broken Access Control |
| A02:2021 | Cryptographic Failures |
| A03:2021 | Injection |
| A04:2021 | Insecure Design |
| A05:2021 | Security Misconfiguration |
| A06:2021 | Vulnerable and Outdated Components |
| A07:2021 | Identification and Authentication Failures |
| A08:2021 | Software and Data Integrity Failures |
| A09:2021 | Security Logging and Monitoring Failures |
| A10:2021 | Server-Side Request Forgery |

### MITRE ATT&CK-inspired patterns

Armelis maps normalized findings to MITRE ATT&CK enterprise tactics and techniques to enable SOC analysts, threat hunters, and detection engineers to understand the adversary playbook associated with each exposure:

| Finding Type | Primary Tactic | Primary Technique ID | Technique Name |
|---|---|---|---|
| **VULNERABILITY** | Initial Access | `T1190` / `T1195.002` | Exploit Public-Facing Application / Supply Chain Compromise: Dependencies |
| **MISCONFIGURATION** | Defense Evasion | `T1562.001` | Impair Defenses: Disable or Modify Tools |
| **SECRET** | Credential Access | `T1552.001` | Unsecured Credentials: Credentials In Files |
| **LICENSE** | Initial Access | `T1195` | Supply Chain Compromise |

### SIEM Export Formats

Armelis supports industry-standard SIEM ingestion formats to integrate directly with SOC pipelines:

- **CEF (Common Event Format):** Compatible with Splunk, ArcSight, AlienVault USM, and IBM QRadar. Maps severity (0–10 scale), source paths, CVEs, and MITRE IDs via custom string extensions (`cs1`, `cs2`).
- **ECS (Elastic Common Schema) / NDJSON:** Compatible with Elasticsearch, Logstash, Kibana, and Wazuh SIEM. Populates `threat.framework`, `vulnerability.id`, `package`, and `file` blocks natively.
- **Syslog (RFC 5424):** Wraps CEF or ECS payloads with standard syslog headers, facility `local0` (16), and dynamic priority values.

## Provider matrix

| Provider | Initial role | Armelis adds |
| --- | --- | --- |
| Semgrep | Source-code rules | component mapping and evidence correlation |
| Gitleaks | Secret detection | secret exposure context and affected data paths |
| Trivy | vulnerabilities, misconfigurations, secrets, licenses, SBOMs | cross-target relationships, MITRE ATT&CK & SIEM export |
| Snyk-compatible import | dependency, code, container, and IaC evidence | provider-neutral normalization and history |
| OWASP mapping | application-risk classification | taxonomy-aware prioritization and learning explanations |

## Important boundary

Armelis must not claim that a dependency is reachable, a secret is valid, a resource is internet-exposed, or an attack path is exploitable unless the available evidence supports that claim. Unknown reachability remains unknown.

## Planned sequence

1. Semgrep and Gitleaks adapters.
2. Trivy repository scanning, MITRE ATT&CK mapping, and SIEM export (CEF, ECS, Syslog).
3. Dependency and container fields plus SBOM references.
4. OWASP category mapping rules.
5. Snyk-compatible evidence import without requiring a Snyk account.
6. Correlation and graph edges across providers.
