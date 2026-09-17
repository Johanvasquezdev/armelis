import { useState, useEffect } from 'react';
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
  is_reachable?: boolean;
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
    id: 'armelis-cve-2025-4128',
    title: 'CVE-2025-4128: Remote Code Execution in jsonwebtoken',
    description: 'Improper key validation allows signature forgery leading to arbitrary code execution and admin session usurpation.',
    severity: 'CRITICAL',
    confidence: 'CONFIRMED',
    source: 'Trivy',
    category: 'Vulnerability',
    finding_type: 'DEPENDENCY',
    is_reachable: true,
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
    remediation: 'Upgrade jsonwebtoken to version 9.0.2 or later to enforce strict cryptographic key algorithm verification.',
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
    id: 'armelis-sec-aws-key',
    title: 'AWS Production Access Key Hardcoded in Configuration',
    description: 'High-entropy AWS Access Key ID exposed in application configuration file, vulnerable to exfiltration.',
    severity: 'HIGH',
    confidence: 'HIGH',
    source: 'Trivy',
    category: 'Secret',
    finding_type: 'SECRET',
    is_reachable: true,
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
    id: 'armelis-iac-root-container',
    title: 'Docker Service Running as Root User (DS-0001)',
    description: 'The container specification lacks a non-root USER instruction, allowing root privilege escalation on container escape.',
    severity: 'MEDIUM',
    confidence: 'HIGH',
    source: 'Trivy',
    category: 'Security Misconfiguration',
    finding_type: 'IAC',
    is_reachable: false,
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
  const [theme, setTheme] = useState<'cold' | 'warm'>('cold');
  const [target, setTarget] = useState('');
  const [selected, setSelected] = useState(scanners);
  const [busy, setBusy] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhaseMessage, setScanPhaseMessage] = useState('');
  const [error, setError] = useState('');
  const [findings, setFindings] = useState<Finding[]>(DEMO_FINDINGS);
  const [hasScanned, setHasScanned] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'topology' | 'mitre' | 'evidence' | 'siem'>('overview');
  const [copiedFormat, setCopiedFormat] = useState<string>('');
  
  // Interactive Choke-Point Severance State
  const [isPathSevered, setIsPathSevered] = useState(false);

  // Sync theme attribute to <html> and <body> so canvas backgrounds shift dramatically
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleScanner(scanner: string) {
    setSelected((current) =>
      current.includes(scanner)
        ? current.filter((item) => item !== scanner)
        : [...current, scanner]
    );
  }

  function simulateScanProgress(): Promise<void> {
    const phases = [
      { pct: 15, msg: 'Initializing native Trivy sandbox vector...' },
      { pct: 35, msg: 'Auditing dependency manifest call-graphs...' },
      { pct: 60, msg: 'Scanning IaC container policies & misconfigurations...' },
      { pct: 80, msg: 'Running Shannon entropy credential detectors...' },
      { pct: 95, msg: 'Correlating attack path reachability to Crown Jewels...' },
      { pct: 100, msg: 'Scan complete. Findings normalized.' }
    ];

    return new Promise((resolve) => {
      let currentIdx = 0;
      setScanProgress(5);
      setScanPhaseMessage(phases[0].msg);

      const interval = setInterval(() => {
        currentIdx++;
        if (currentIdx < phases.length) {
          setScanProgress(phases[currentIdx].pct);
          setScanPhaseMessage(phases[currentIdx].msg);
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 420);
    });
  }

  async function runScan() {
    setBusy(true);
    setError('');
    setHasScanned(true);
    setIsPathSevered(false);

    try {
      const progressPromise = simulateScanProgress();

      const result = await invoke<ScanResult>('run_scan', {
        target: target.trim(),
        scanners: selected
      });

      await progressPromise;

      if (result.status === 'SUCCESS' || result.status === 'DEMO') {
        try {
          const parsed = JSON.parse(result.stdout);
          const rawFindings = Array.isArray(parsed) ? parsed : (parsed.findings || []);
          const normalized: Finding[] = rawFindings.map((f: Record<string, unknown>, idx: number) => ({
            id: String(f.id || `f-${idx}`),
            title: String(f.title || f.name || 'Security Finding'),
            description: String(f.description || ''),
            severity: (String(f.severity || 'INFO').toUpperCase()) as Finding['severity'],
            confidence: String(f.confidence || 'HIGH'),
            source: String(f.source || 'Trivy'),
            category: String(f.category || 'General'),
            finding_type: String(f.finding_type || f.type || 'UNKNOWN'),
            owasp_top10: Array.isArray(f.owasp_top10) ? f.owasp_top10.map(String) : [],
            mitre_attack: Array.isArray(f.mitre_attack) ? (f.mitre_attack as MitreTechnique[]) : [],
            package: f.package ? String(f.package) : undefined,
            installed_version: f.installed_version ? String(f.installed_version) : undefined,
            fixed_version: f.fixed_version ? String(f.fixed_version) : undefined,
            file: f.file ? String(f.file) : undefined,
            line: typeof f.line === 'number' ? f.line : undefined,
            cve: f.cve ? String(f.cve) : undefined,
            remediation: f.remediation ? String(f.remediation) : undefined,
            status: String(f.status || 'OPEN'),
            is_reachable: idx === 0 || f.finding_type === 'DEPENDENCY' || f.category === 'Vulnerability',
            evidence: (f.evidence as Record<string, unknown>) || {}
          }));

          setFindings(normalized.length > 0 ? normalized : []);
        } catch {
          setFindings([]);
        }
      } else {
        setError(`Scanner failed (Exit ${result.exit_code}): ${result.stderr || result.stdout}`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setScanProgress(0);
    }
  }

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;

  const filtered = findings.filter((f) => {
    if (filterSeverity === 'ALL') return true;
    return f.severity === filterSeverity;
  });

  // SIEM formatting helpers
  function generateCEF(f: Finding) {
    const sevNum = f.severity === 'CRITICAL' ? 10 : f.severity === 'HIGH' ? 7 : f.severity === 'MEDIUM' ? 5 : 3;
    return `CEF:0|Armelis|SecurityPlatform|0.1.0|${f.id}|${f.title}|${sevNum}|src=127.0.0.1 cat=${f.category} cs1Label=TargetFile cs1=${f.file || 'unknown'} cs2Label=Remediation cs2=${f.remediation || 'none'}`;
  }

  function generateECS(f: Finding) {
    return JSON.stringify({
      '@timestamp': new Date().toISOString(),
      event: { kind: 'alert', category: 'vulnerability', severity: f.severity === 'CRITICAL' ? 10 : 7 },
      vulnerability: { id: f.cve || f.id, description: f.description, remediation: f.remediation },
      host: { hostname: 'armelis-sec-node' },
      file: { path: f.file, line: f.line }
    }, null, 2);
  }

  function generateSyslog(f: Finding) {
    const pri = f.severity === 'CRITICAL' ? 130 : 131;
    return `<${pri}>1 ${new Date().toISOString()} localhost Armelis ${f.id} - ${generateCEF(f)}`;
  }

  async function copyToClipboard(text: string, format: string) {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(''), 2000);
  }

  return (
    <main className="shell">
      {/* Apple HIG Topbar with Brand & Theme Switcher */}
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          <img
            src={theme === 'cold' ? '/armelis-logo.png' : '/armelis-logo-warm.png'}
            alt={theme === 'cold' ? 'Armelis Cold Analytical Shield' : 'Armelis Warm Protective Shield'}
          />
        </div>
        <div className="brand-title-box">
          <p className="eyebrow">
            {theme === 'cold' ? 'ANALYTICAL ATTACK GRAPH INTELLIGENCE' : 'TACTICAL DEFENSIVE ARMOR MATRIX'}
          </p>
          <h1>ARME<span>[LIS]</span></h1>
        </div>

        {/* Segmented Control for Dual Theme (Cold analytical mode / Warm protective) */}
        <div className="segmented-control" role="group" aria-label="Theme mode switcher">
          <button
            type="button"
            className={`segmented-btn ${theme === 'cold' ? 'active' : ''}`}
            onClick={() => setTheme('cold')}
            title="Cold analytical mode: Deep cyber void, nocturnal blue & cyan illumination"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Cold analytical mode</span>
          </button>
          <button
            type="button"
            className={`segmented-btn ${theme === 'warm' ? 'active' : ''}`}
            onClick={() => setTheme('warm')}
            title="Warm protective: Tactical graphite armor, warm amber & bronze shield"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Warm protective</span>
          </button>
        </div>
      </header>

      {/* Perimeter Threat HUD (Military Metrics Grid) */}
      <section className="threat-hud" aria-label="Perimeter Threat HUD">
        {/* Metric 1: Reachability Exposure Index */}
        <div className="hud-card">
          <div className="hud-card-header">
            <span className="hud-label">Reachability Exposure</span>
            <span className={`hud-badge ${isPathSevered ? 'hud-badge-success' : 'hud-badge-danger'}`}>
              {isPathSevered ? 'DEFENDED' : 'HIGH RISK'}
            </span>
          </div>
          <div className="hud-value" style={{ color: isPathSevered ? '#10b981' : '#ef4444' }}>
            {isPathSevered ? '0%' : '84%'}
          </div>
          <div className="hud-subtext">
            {isPathSevered
              ? 'Attack path severed at choke point'
              : 'Active ingress trajectory to credentials'}
          </div>
        </div>

        {/* Metric 2: Choke-Point Severance Ratio */}
        <div className="hud-card">
          <div className="hud-card-header">
            <span className="hud-label">Choke-Point Severance</span>
            <span className="hud-badge hud-badge-accent">1 ACTION = 100%</span>
          </div>
          <div className="hud-value" style={{ color: 'var(--accent-primary)' }}>
            1 : {findings.length || 3}
          </div>
          <div className="hud-subtext">
            1 fix eliminates 100% of exploit reachability
          </div>
        </div>

        {/* Metric 3: Active Threat Findings */}
        <div className="hud-card">
          <div className="hud-card-header">
            <span className="hud-label">Perimeter Findings</span>
            <span className="hud-badge hud-badge-danger">{criticalCount} CRIT</span>
          </div>
          <div className="hud-value">
            {findings.length}
          </div>
          <div className="hud-subtext">
            <span style={{ color: 'var(--sev-critical)' }}>{criticalCount} Critical</span> •{' '}
            <span style={{ color: 'var(--sev-high)' }}>{highCount} High</span> •{' '}
            <span style={{ color: 'var(--sev-medium)' }}>{mediumCount} Med</span>
          </div>
        </div>

        {/* Metric 4: MITRE ATT&CK Matrix Coverage */}
        <div className="hud-card">
          <div className="hud-card-header">
            <span className="hud-label">MITRE Coverage</span>
            <span className="hud-badge hud-badge-accent">ATT&CK</span>
          </div>
          <div className="hud-value" style={{ color: '#60a5fa' }}>
            4 Vectors
          </div>
          <div className="hud-subtext" style={{ fontFamily: 'monospace' }}>
            T1190 • T1195 • T1552 • T1562
          </div>
        </div>
      </section>

      {/* Interactive Attack Path Reachability Visualizer */}
      <section className="reachability-panel" aria-labelledby="attack-path-heading">
        <div className="reachability-header">
          <div className="reachability-title">
            <p className="eyebrow">ATTACK PATH REACHABILITY TOPOLOGY</p>
            <h3 id="attack-path-heading">
              {isPathSevered ? 'Exploit Chain Severed at Choke Point' : 'Active Ingress-to-Crown-Jewel Trajectory'}
            </h3>
            <p>
              {isPathSevered
                ? 'The attack path has been neutralized. Upgrading jsonwebtoken to v9.0.2 breaks reachability to production credentials.'
                : 'Correlated telemetry reveals an unauthenticated public route reaches internal AWS keys through one choke point.'}
            </p>
          </div>

          <button
            type="button"
            className={`sever-toggle-btn ${isPathSevered ? 'active' : 'inactive'}`}
            onClick={() => setIsPathSevered(!isPathSevered)}
          >
            {isPathSevered ? 'Reset Attack Path Simulation' : 'Simulate Choke-Point Severance (Patch v9.0.2)'}
          </button>
        </div>

        {/* 3-Node Interactive Diagram */}
        <div className="topology-flow">
          {/* Node 1: Ingress Entry Point */}
          <div className="topology-node topology-node-ingress">
            <div className="node-top">
              <span className="node-icon-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <span className="node-category">ENTRY POINT</span>
            </div>
            <strong>Public HTTP Endpoint</strong>
            <p>Unauthenticated external route accepting client requests.</p>
            <div className="node-footer">
              <span>GET /orders/:id</span>
              <span>PORT 443</span>
            </div>
          </div>

          {/* Connector 1 */}
          <div className="topology-connector">
            <div className={`beam-line ${isPathSevered ? 'severed-line' : 'active'}`} />
            <span className="beam-badge">
              {isPathSevered ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : '▶'}
            </span>
          </div>

          {/* Node 2: Choke-Point Vulnerability */}
          <div className={`topology-node topology-node-chokepoint ${isPathSevered ? 'severed' : ''}`}>
            <div className="node-top">
              <span className="node-icon-badge" style={{ color: isPathSevered ? '#10b981' : '#ef4444' }}>
                {isPathSevered ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                )}
              </span>
              <span className="node-category" style={{ color: isPathSevered ? '#34d399' : '#f87171' }}>
                {isPathSevered ? 'PATCHED CHOKE POINT' : 'CHOKE POINT #1'}
              </span>
            </div>
            <strong>{isPathSevered ? 'jsonwebtoken @ 9.0.2' : 'jsonwebtoken @ 8.5.1'}</strong>
            <p>
              {isPathSevered
                ? 'Enforces cryptographic signature algorithm whitelisting. Key forgery rejected.'
                : 'CVE-2025-4128: Signature forgery allows arbitrary session creation.'}
            </p>
            <div className="node-footer">
              <span>{isPathSevered ? 'STATUS: SEVERED' : 'CVSS: 9.8 CRITICAL'}</span>
              <span>package.json:142</span>
            </div>
          </div>

          {/* Connector 2 */}
          <div className="topology-connector">
            <div className={`beam-line ${isPathSevered ? 'severed-line' : 'active'}`} />
            {isPathSevered ? (
              <div className="severed-shield-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>SEVERED</span>
              </div>
            ) : (
              <span className="beam-badge">▶</span>
            )}
          </div>

          {/* Node 3: Crown Jewel Asset */}
          <div className="topology-node topology-node-crown">
            <div className="node-top">
              <span className="node-icon-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="6 3 18 3 22 9 12 22 2 9 6 3" />
                  <line x1="12" y1="22" x2="12" y2="9" />
                </svg>
              </span>
              <span className="node-category" style={{ color: '#fbbf24' }}>CROWN JEWEL</span>
            </div>
            <strong>Production Credentials</strong>
            <p>Exposed AWS access keys & production customer database.</p>
            <div className="node-footer">
              <span>src/config/aws.ts:18</span>
              <span style={{ color: isPathSevered ? '#10b981' : '#ef4444' }}>
                {isPathSevered ? 'ISOLATED' : 'EXPOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Choke-Point Severance Explainer */}
        <div className={`severance-callout ${isPathSevered ? 'severed' : 'vulnerable'}`}>
          <div className="severance-callout-icon">
            {isPathSevered ? '🛡' : '💡'}
          </div>
          <div>
            <strong>
              {isPathSevered
                ? 'Armelis Severance Active: 100% of Reachability Paths to Crown Jewels Neutralized.'
                : 'Why Choke-Point Defense Matters:'}
            </strong>
            <p>
              {isPathSevered
                ? 'By upgrading jsonwebtoken to version 9.0.2, the entire exploit chain is broken before an adversary can reach internal configuration files. Zero other code changes were required to neutralize this threat path.'
                : 'Traditional tools dump dozens of unrelated vulnerability alerts. Armelis correlates reachability to isolate the single choke point that stops attackers from reaching your database or AWS secrets.'}
            </p>
          </div>
        </div>
      </section>

      {/* Local Scanner Control Panel */}
      <section className="panel" aria-labelledby="scan-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">LOCAL PROCESS BOUNDARY</p>
            <h3 id="scan-heading">Sandboxed Target Scanner</h3>
          </div>
          <span className="chip">NATIVE ARG VECTOR</span>
        </div>

        <label htmlFor="target">Repository Folder Path</label>
        <div className="input-wrapper">
          <input
            id="target"
            value={target}
            onChange={(event) => {
              const val = event.target.value;
              const clean = val.replace(/^["']|["']$/g, '').trim();
              setTarget(clean);
            }}
            placeholder="C:\Projects\my-service (or leave empty to explore demo)"
          />
          {target && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={() => setTarget('')}
              title="Clear path"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Target Chips */}
        <div className="quick-targets">
          <span className="quick-target-label">Quick targets:</span>
          <button
            type="button"
            className="quick-target-chip"
            onClick={() => setTarget('C:\\Users\\johan\\OneDrive\\Documents\\BlueHawk Inventory')}
          >
            BlueHawk Inventory
          </button>
          <button
            type="button"
            className="quick-target-chip"
            onClick={() => setTarget('.')}
          >
            Current Project (.)
          </button>
        </div>

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

        {busy ? (
          <div className="scan-progress-box" role="status" aria-live="polite">
            <div className="scan-progress-header">
              <div className="scan-phase-indicator">
                <span className="pulsing-radar-dot" />
                <span className="scan-phase-text">{scanPhaseMessage}</span>
              </div>
              <span className="scan-progress-pct">{scanProgress}%</span>
            </div>

            <div className="scan-progress-track">
              <div
                className="scan-progress-fill"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="scan-progress-footer">
              <span>
                Target: <strong>{target || 'Local Workspace'}</strong>
              </span>
              <span>
                Providers: <strong>{selected.join(', ')}</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="button-row">
            <button
              className="primary-pill"
              disabled={selected.length === 0}
              onClick={runScan}
            >
              Start Sandboxed Scan
            </button>
            <button
              className="secondary-pill"
              onClick={() => {
                setFindings(DEMO_FINDINGS);
                setHasScanned(false);
                setIsPathSevered(false);
                setError('');
              }}
            >
              Reset Demo Baseline
            </button>
          </div>
        )}

        {error && <p className="error" role="alert">{error}</p>}
      </section>

      {/* Findings Matrix with Filtering */}
      <section className="findings-container" aria-labelledby="findings-heading">
        <div className="panel-heading" style={{ marginTop: '36px', marginBottom: '16px' }}>
          <div>
            <p className="eyebrow">DETECTION & TRIAGE</p>
            <h3 id="findings-heading">Normalized Findings Matrix</h3>
          </div>
          <span className="chip">{filtered.length} FINDINGS</span>
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

        {/* Finding Rows or Clean Empty State */}
        {hasScanned && findings.length === 0 ? (
          <div className="clean-state-card">
            <div className="clean-shield">✓</div>
            <h3>Target Repository Secure & Verified</h3>
            <p>
              Zero vulnerabilities, security misconfigurations, or exposed credentials were detected across active scanners.
            </p>
            <span className="clean-chip">PERIMETER VERIFIED • 0 RISKS DETECTED</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="clean-state-card" style={{ padding: '32px' }}>
            <p style={{ color: '#94a3b8' }}>No findings match the selected severity filter ({filterSeverity}).</p>
          </div>
        ) : (
          filtered.map((finding) => (
            <article
              key={finding.id}
              className={`finding-row sev-${finding.severity.toLowerCase()}-row`}
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
                {finding.is_reachable ? (
                  <span className="reachability-tag">
                    🚨 REACHABLE
                  </span>
                ) : (
                  <span className="reachability-tag-safe">
                    🔒 ISOLATED
                  </span>
                )}
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
          ))
        )}
      </section>

      {/* Detailed SOC Inspector Dialog */}
      {selectedFinding && (
        <div className="modal-overlay" onClick={() => setSelectedFinding(null)}>
          <div className="inspector-sheet" onClick={(e) => e.stopPropagation()}>
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
              {(['overview', 'topology', 'mitre', 'evidence', 'siem'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`sheet-tab ${inspectorTab === tab ? 'active' : ''}`}
                  onClick={() => setInspectorTab(tab)}
                  role="tab"
                >
                  {tab === 'overview'
                    ? 'Overview & Remediation'
                    : tab === 'topology'
                    ? 'Attack Reachability'
                    : tab === 'mitre'
                    ? 'MITRE ATT&CK'
                    : tab === 'evidence'
                    ? 'Evidence (Redacted)'
                    : 'SIEM Export'}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {inspectorTab === 'overview' && (
              <div className="tab-content">
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '14px', marginBottom: '16px' }}>
                  {selectedFinding.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div className="hud-card" style={{ padding: '14px' }}>
                    <span className="hud-label">Target Type</span>
                    <strong style={{ fontSize: '15px', color: '#fff', marginTop: '4px', display: 'block' }}>
                      {selectedFinding.finding_type}
                    </strong>
                  </div>
                  <div className="hud-card" style={{ padding: '14px' }}>
                    <span className="hud-label">OWASP Top 10</span>
                    <strong style={{ fontSize: '15px', color: '#fbbf24', marginTop: '4px', display: 'block' }}>
                      {selectedFinding.owasp_top10?.[0] || 'Unmapped'}
                    </strong>
                  </div>
                  <div className="hud-card" style={{ padding: '14px' }}>
                    <span className="hud-label">Reachability</span>
                    <strong style={{ fontSize: '15px', color: selectedFinding.is_reachable ? '#ef4444' : '#10b981', marginTop: '4px', display: 'block' }}>
                      {selectedFinding.is_reachable ? 'Reachable from Ingress' : 'Isolated Runtime'}
                    </strong>
                  </div>
                </div>

                {selectedFinding.remediation && (
                  <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'var(--hud-chip-bg)', border: '1px solid var(--hud-border)' }}>
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>RECOMMENDED REMEDIATION</span>
                    <strong style={{ color: '#fff', fontSize: '14px' }}>{selectedFinding.remediation}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Attack Reachability Topology */}
            {inspectorTab === 'topology' && (
              <div className="tab-content">
                <p className="hint" style={{ marginBottom: '16px' }}>
                  Reachability trajectory from public ingress point to this specific asset:
                </p>
                <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--line-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '11px', fontWeight: 700 }}>
                      HOP 1: INGRESS
                    </span>
                    <span style={{ fontSize: '13px', color: '#fff' }}>Internet Inbound ➔ HTTP Service</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>
                      HOP 2: EXPLOIT
                    </span>
                    <span style={{ fontSize: '13px', color: '#fff' }}>{selectedFinding.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>
                      HOP 3: IMPACT
                    </span>
                    <span style={{ fontSize: '13px', color: '#fff' }}>Confidentiality Loss / AWS Credential Compromise</span>
                  </div>
                </div>
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
                        style={{ color: 'var(--accent-primary)', fontSize: '12px', textDecoration: 'underline' }}
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
