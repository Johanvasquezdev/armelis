import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

type MitreTechnique = {
  tactic: string;
  technique_id: string;
  technique_name: string;
  url?: string;
};

type Finding = {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  confidence: string;
  source: string;
  category: string;
  finding_type: string;
  owasp_top10?: string[];
  mitre_attack?: MitreTechnique[];
  package?: string;
  installed_version?: string;
  fixed_version?: string;
  file?: string;
  line?: number;
  cve?: string;
  remediation?: string;
  status: string;
  evidence?: Record<string, unknown>;
};

type ScanResult = {
  status: string;
  exit_code: number | null;
  stdout: string;
  stderr: string;
};

const scanners = ['vuln', 'misconfig', 'secret', 'license'];

// Authorized demo findings illustrating the full intelligence layer
const DEMO_FINDINGS: Finding[] = [
  {
    id: 'trivy-cve-2025-4128',
    title: 'CVE-2025-4128: Remote Code Execution in jsonwebtoken',
    description: 'Improper key validation allows signature forgery leading to arbitrary code execution.',
    severity: 'CRITICAL',
    confidence: 'CONFIRMED',
    source: 'Trivy',
    category: 'Vulnerability',
    finding_type: 'DEPENDENCY',
    owasp_top10: ['A06:2021'],
    mitre_attack: [
      {
        tactic: 'Initial Access',
        technique_id: 'T1190',
        technique_name: 'Exploit Public-Facing Application',
        url: 'https://attack.mitre.org/techniques/T1190/'
      },
      {
        tactic: 'Initial Access',
        technique_id: 'T1195.002',
        technique_name: 'Supply Chain Compromise: Compromise Software Dependencies',
        url: 'https://attack.mitre.org/techniques/T1195/002/'
      }
    ],
    package: 'jsonwebtoken',
    installed_version: '8.5.1',
    fixed_version: '9.0.2',
    file: 'package-lock.json',
    line: 142,
    cve: 'CVE-2025-4128',
    remediation: 'Upgrade jsonwebtoken to version 9.0.2 or later to enforce strict key algorithm verification.',
    status: 'OPEN',
    evidence: {
      package: 'jsonwebtoken',
      installed: '8.5.1',
      fixed: '9.0.2',
      cve: 'CVE-2025-4128',
      match: '[REDACTED]'
    }
  },
  {
    id: 'trivy-sec-aws-key',
    title: 'AWS Production Access Key Hardcoded in Configuration',
    description: 'Found high-entropy AWS Access Key ID exposed in application configuration file.',
    severity: 'HIGH',
    confidence: 'HIGH',
    source: 'Trivy',
    category: 'Secret',
    finding_type: 'SECRET',
    owasp_top10: ['A07:2021'],
    mitre_attack: [
      {
        tactic: 'Credential Access',
        technique_id: 'T1552.001',
        technique_name: 'Unsecured Credentials: Credentials In Files',
        url: 'https://attack.mitre.org/techniques/T1552/001/'
      }
    ],
    file: 'src/config/aws.ts',
    line: 18,
    remediation: 'Revoke the exposed key immediately in AWS IAM and migrate credential loading to environment variables or AWS Secrets Manager.',
    status: 'OPEN',
    evidence: {
      rule_id: 'aws-access-key-id',
      match: '[REDACTED]',
      target: 'src/config/aws.ts'
    }
  },
  {
    id: 'trivy-iac-root-container',
    title: 'Docker Service Running as Root User (DS-0001)',
    description: 'The container specification lacks a non-root USER instruction, allowing root privilege escalation on container escape.',
    severity: 'MEDIUM',
    confidence: 'HIGH',
    source: 'Trivy',
    category: 'Security Misconfiguration',
    finding_type: 'IAC',
    owasp_top10: ['A05:2021'],
    mitre_attack: [
      {
        tactic: 'Defense Evasion',
        technique_id: 'T1562.001',
        technique_name: 'Impair Defenses: Disable or Modify Tools',
        url: 'https://attack.mitre.org/techniques/T1562/001/'
      }
    ],
    file: 'Dockerfile',
    line: 24,
    remediation: 'Add a dedicated non-root user (e.g. USER appuser) in Dockerfile before the entrypoint.',
    status: 'OPEN',
    evidence: {
      rule_id: 'DS-0001',
      file: 'Dockerfile',
      resolution: 'Set USER nonroot'
    }
  }
];

export default function App() {
  const [target, setTarget] = useState('');
  const [selected, setSelected] = useState(scanners);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [findings, setFindings] = useState<Finding[]>(DEMO_FINDINGS);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'mitre' | 'evidence' | 'siem'>('overview');
  const [copiedFormat, setCopiedFormat] = useState<string>('');

  function toggleScanner(scanner: string) {
    setSelected((current) =>
      current.includes(scanner)
        ? current.filter((item) => item !== scanner)
        : [...current, scanner]
    );
  }

  async function runScan() {
    setBusy(true);
    setError('');
    try {
      const response = await invoke<ScanResult>('scan_local_repository', {
        target,
        scanners: selected,
        trivyExecutable: 'trivy'
      });

      if (response.stdout) {
        try {
          const parsed = JSON.parse(response.stdout);
          if (parsed && Array.isArray(parsed.Results)) {
            // Transform Trivy results into findings
            const extracted: Finding[] = [];
            for (const result of parsed.Results) {
              for (const vuln of result.Vulnerabilities || []) {
                extracted.push({
                  id: `trivy-${vuln.VulnerabilityID}-${vuln.PkgName}`,
                  title: `${vuln.VulnerabilityID}: ${vuln.Title || vuln.PkgName}`,
                  description: vuln.Description || '',
                  severity: (vuln.Severity || 'UNKNOWN') as Finding['severity'],
                  confidence: 'HIGH',
                  source: 'Trivy',
                  category: 'Vulnerability',
                  finding_type: 'DEPENDENCY',
                  owasp_top10: ['A06:2021'],
                  mitre_attack: [
                    {
                      tactic: 'Initial Access',
                      technique_id: 'T1190',
                      technique_name: 'Exploit Public-Facing Application',
                      url: 'https://attack.mitre.org/techniques/T1190/'
                    }
                  ],
                  package: vuln.PkgName,
                  installed_version: vuln.InstalledVersion,
                  fixed_version: vuln.FixedVersion,
                  file: result.Target,
                  cve: vuln.VulnerabilityID,
                  remediation: vuln.FixedVersion ? `Upgrade ${vuln.PkgName} to ${vuln.FixedVersion}` : 'Review patch advisories',
                  status: 'OPEN'
                });
              }
            }
            if (extracted.length > 0) {
              setFindings(extracted);
            }
          }
        } catch {
          // If stdout is not JSON, keep current findings and show message
        }
      }
    } catch (scanError) {
      setError(String(scanError));
    } finally {
      setBusy(false);
    }
  }

  // Filter findings
  const filtered = filterSeverity === 'ALL'
    ? findings
    : findings.filter((f) => f.severity === filterSeverity);

  // Metrics
  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const mitreTechniques = new Set(findings.flatMap((f) => f.mitre_attack?.map((m: MitreTechnique) => m.technique_id) || [])).size;

  // Generate SIEM format strings for selected finding
  function generateCEF(f: Finding) {
    const sevScore = f.severity === 'CRITICAL' ? 10 : f.severity === 'HIGH' ? 8 : f.severity === 'MEDIUM' ? 6 : 3;
    const mitre = f.mitre_attack?.[0];
    return `CEF:0|CyberScan|CyberScan|1.0.0|${f.finding_type}|${f.title}|${sevScore}|src=${target || 'local-repo'} filePath=${f.file || ''} fileId=${f.line || ''} cs1=${mitre?.technique_id || ''} cs1Label=mitre_technique_id cs2=${mitre?.technique_name || ''} cs2Label=mitre_technique_name cs3=${f.owasp_top10?.[0] || ''} cs3Label=owasp_category cve=${f.cve || ''}`;
  }

  function generateECS(f: Finding) {
    return JSON.stringify(
      {
        '@timestamp': new Date().toISOString(),
        event: {
          kind: 'alert',
          category: ['vulnerability'],
          dataset: 'cyberscan.findings',
          severity: f.severity === 'CRITICAL' ? 10 : 8
        },
        observer: { vendor: 'CyberScan', product: 'CyberScan' },
        vulnerability: { id: f.cve || f.id, severity: f.severity, description: f.description },
        threat: f.mitre_attack?.map((m: MitreTechnique) => ({
          framework: 'MITRE ATT&CK',
          tactic: { name: m.tactic },
          technique: { id: m.technique_id, name: m.technique_name, reference: m.url }
        })),
        file: f.file ? { path: f.file, line: f.line } : undefined,
        package: f.package ? { name: f.package, version: f.installed_version, fixed_version: f.fixed_version } : undefined
      },
      null,
      2
    );
  }

  function generateSyslog(f: Finding) {
    const pri = f.severity === 'CRITICAL' ? 130 : 131;
    return `<${pri}>1 ${new Date().toISOString()} localhost CyberScan ${f.id} - ${generateCEF(f)}`;
  }

  async function copyToClipboard(text: string, format: string) {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(''), 2000);
  }

  return (
    <main className="shell">
      {/* Apple HIG Header */}
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">⌁</div>
        <div>
          <p className="eyebrow">SECURITY INTELLIGENCE COMMAND</p>
          <h1>Cyber<span>Scan</span></h1>
        </div>
        <p className="status"><i></i> Local Worker Active</p>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <p className="eyebrow">LOCAL-FIRST ANALYSIS</p>
        <h2>Correlate evidence. Break the attack path.</h2>
        <p className="lede">
          Analyze repositories on this machine using isolated process boundaries. Source code remains strictly local while findings are normalized and mapped to MITRE ATT&CK and SIEM formats.
        </p>
      </section>

      {/* Summary Metrics Bar (Tabular Numbers) */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span>Total Findings</span>
          <strong>{findings.length}</strong>
        </div>
        <div className="metric-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <span style={{ color: 'var(--sev-critical)' }}>Critical Risks</span>
          <strong style={{ color: 'var(--sev-critical)' }}>{criticalCount}</strong>
        </div>
        <div className="metric-card" style={{ borderColor: 'rgba(249, 115, 22, 0.2)' }}>
          <span style={{ color: 'var(--sev-high)' }}>High Severity</span>
          <strong style={{ color: 'var(--sev-high)' }}>{highCount}</strong>
        </div>
        <div className="metric-card">
          <span style={{ color: 'var(--sev-medium)' }}>Medium Severity</span>
          <strong style={{ color: 'var(--sev-medium)' }}>{mediumCount}</strong>
        </div>
        <div className="metric-card">
          <span style={{ color: 'var(--cyberscan-electric)' }}>MITRE Techniques</span>
          <strong style={{ color: 'var(--cyberscan-electric)' }}>{mitreTechniques}</strong>
        </div>
      </div>

      {/* Scanner Control Panel (Apple Card) */}
      <section className="apple-card panel" aria-labelledby="scan-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">SCAN TARGET</p>
            <h3 id="scan-heading">Local Repository Scanner</h3>
          </div>
          <span className="chip">TRIVY ENGINE</span>
        </div>

        <label htmlFor="target">Repository Folder Path</label>
        <input
          id="target"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="C:\\Projects\\my-service (or leave empty to explore demo)"
        />
        <p className="hint">Strict sandboxing: argument vector invocation with no shell interpretation.</p>

        <fieldset>
          <legend>Active Evidence Providers</legend>
          <div className="scanner-grid">
            {scanners.map((scanner) => (
              <label className="scanner" key={scanner}>
                <input
                  type="checkbox"
                  checked={selected.includes(scanner)}
                  onChange={() => toggleScanner(scanner)}
                />
                <span>{scanner}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="button-row">
          <button
            className="primary-pill"
            disabled={busy || selected.length === 0}
            onClick={runScan}
          >
            {busy ? 'Analyzing Workspace…' : 'Start Sandboxed Scan'}
          </button>
          <button
            className="secondary-pill"
            onClick={() => setFindings(DEMO_FINDINGS)}
          >
            Reset Demo Findings
          </button>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
      </section>

      {/* Findings Matrix with Apple HIG Filtering */}
      <section className="findings-container" aria-labelledby="findings-heading">
        <div className="panel-heading" style={{ marginTop: '36px', marginBottom: '14px' }}>
          <div>
            <p className="eyebrow">DETECTION & TRIAGE</p>
            <h3 id="findings-heading">Normalized Findings Matrix</h3>
          </div>
          <span className="chip">{filtered.length} RESULTS</span>
        </div>

        {/* Severity Filter Pills */}
        <div className="filter-bar" role="toolbar" aria-label="Severity filter">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              className={`filter-pill ${filterSeverity === sev ? 'active' : ''}`}
              onClick={() => setFilterSeverity(sev)}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Finding Rows */}
        {filtered.map((finding) => (
          <article
            key={finding.id}
            className="finding-row"
            onClick={() => {
              setSelectedFinding(finding);
              setInspectorTab('overview');
            }}
          >
            <div className="finding-info">
              <span className={`sev-badge sev-${finding.severity}`}>{finding.severity}</span>
              <div className="finding-titles">
                <strong>{finding.title}</strong>
                <small>
                  {finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ''}` : 'Repository Target'}
                  {finding.package ? ` • ${finding.package} ${finding.installed_version || ''}` : ''}
                </small>
              </div>
            </div>

            <div className="finding-tags">
              {finding.mitre_attack?.[0] && (
                <span className="tag-mitre" title={finding.mitre_attack[0].technique_name}>
                  {finding.mitre_attack[0].technique_id}
                </span>
              )}
              {finding.owasp_top10?.[0] && (
                <span className="tag-owasp">{finding.owasp_top10[0]}</span>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Apple HIG Floating Bottom Sheet (Finding Inspector) */}
      {selectedFinding && (
        <div className="modal-overlay" onClick={() => setSelectedFinding(null)}>
          <div className="inspector-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grabber" />

            <div className="sheet-header">
              <div>
                <span className={`sev-badge sev-${selectedFinding.severity}`} style={{ display: 'inline-block', marginBottom: '8px' }}>
                  {selectedFinding.severity}
                </span>
                <h3>{selectedFinding.title}</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedFinding(null)}
                aria-label="Close inspector"
              >
                ✕
              </button>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="sheet-tabs" role="tablist">
              {(['overview', 'mitre', 'evidence', 'siem'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`sheet-tab ${inspectorTab === tab ? 'active' : ''}`}
                  onClick={() => setInspectorTab(tab)}
                  role="tab"
                >
                  {tab === 'overview' ? 'Overview' : tab === 'mitre' ? 'MITRE ATT&CK' : tab === 'evidence' ? 'Evidence (Redacted)' : 'SIEM Export'}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {inspectorTab === 'overview' && (
              <div className="tab-content">
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '14px', marginBottom: '16px' }}>
                  {selectedFinding.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="metric-card">
                    <span>Target Type</span>
                    <strong style={{ fontSize: '15px' }}>{selectedFinding.finding_type}</strong>
                  </div>
                  <div className="metric-card">
                    <span>OWASP Top 10</span>
                    <strong style={{ fontSize: '15px', color: '#fbbf24' }}>
                      {selectedFinding.owasp_top10?.[0] || 'Unmapped'}
                    </strong>
                  </div>
                  <div className="metric-card">
                    <span>Status</span>
                    <strong style={{ fontSize: '15px', color: 'var(--sev-confirmed)' }}>
                      {selectedFinding.status}
                    </strong>
                  </div>
                </div>

                {selectedFinding.remediation && (
                  <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>RECOMMENDED FIX FIRST</span>
                    <strong style={{ color: '#fff', fontSize: '14px' }}>{selectedFinding.remediation}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Tab: MITRE ATT&CK */}
            {inspectorTab === 'mitre' && (
              <div className="tab-content">
                <p className="hint" style={{ marginBottom: '14px' }}>
                  Adversary tactic & technique mappings for SOC triage and detection engineering:
                </p>
                {selectedFinding.mitre_attack?.map((m: MitreTechnique) => (
                  <div key={m.technique_id} className="mitre-box">
                    <h4>
                      [{m.technique_id}] {m.technique_name}
                    </h4>
                    <p>
                      <strong>Tactic:</strong> {m.tactic}
                    </p>
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--cyberscan-electric)', fontSize: '12px', textDecoration: 'underline' }}
                      >
                        View in MITRE Enterprise Matrix ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Evidence */}
            {inspectorTab === 'evidence' && (
              <div className="tab-content">
                <p className="hint" style={{ marginBottom: '8px' }}>
                  Sensitive parameters (secrets, passwords, matches) are masked with [REDACTED]:
                </p>
                <div className="code-preview">
                  {JSON.stringify(selectedFinding.evidence || selectedFinding, null, 2)}
                </div>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(JSON.stringify(selectedFinding.evidence, null, 2), 'evidence')}
                >
                  {copiedFormat === 'evidence' ? 'Copied to Clipboard!' : 'Copy Redacted Evidence'}
                </button>
              </div>
            )}

            {/* Tab: SIEM Export */}
            {inspectorTab === 'siem' && (
              <div className="tab-content">
                <p className="hint" style={{ marginBottom: '14px' }}>
                  Dispatch directly to your Security Operations Center (Splunk, Elastic, QRadar, Wazuh):
                </p>

                {/* CEF Format */}
                <div style={{ marginBottom: '20px' }}>
                  <span className="eyebrow">CEF FORMAT (SPLUNK / ARCSIGHT / QRADAR)</span>
                  <div className="code-preview" style={{ marginTop: '6px' }}>
                    {generateCEF(selectedFinding)}
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(generateCEF(selectedFinding), 'cef')}
                  >
                    {copiedFormat === 'cef' ? 'Copied CEF!' : 'Copy CEF Event'}
                  </button>
                </div>

                {/* ECS / NDJSON Format */}
                <div style={{ marginBottom: '20px' }}>
                  <span className="eyebrow">ECS / NDJSON (ELASTICSEARCH / WAZUH)</span>
                  <div className="code-preview" style={{ marginTop: '6px' }}>
                    {generateECS(selectedFinding)}
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(generateECS(selectedFinding), 'ecs')}
                  >
                    {copiedFormat === 'ecs' ? 'Copied ECS!' : 'Copy ECS JSON'}
                  </button>
                </div>

                {/* Syslog Format */}
                <div>
                  <span className="eyebrow">RFC 5424 SYSLOG LINE</span>
                  <div className="code-preview" style={{ marginTop: '6px' }}>
                    {generateSyslog(selectedFinding)}
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(generateSyslog(selectedFinding), 'syslog')}
                  >
                    {copiedFormat === 'syslog' ? 'Copied Syslog!' : 'Copy Syslog String'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
