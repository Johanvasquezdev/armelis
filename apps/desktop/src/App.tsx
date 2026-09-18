import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Finding,
  AttackNode,
  CodeDiff,
  MitreTechnique,
  normalizeTrivyReport,
  synthesizeAttackTopology
} from './trivyNormalizer';
export type { Finding, AttackNode, CodeDiff, MitreTechnique };

export type TelemetryEvent = {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'HIGH' | 'INFO' | 'SUCCESS';
  type: string;
  raw: string;
};

type ScanResult = {
  status: string;
  exit_code: number | null;
  stdout: string;
  stderr: string;
};

const scanners = ['vuln', 'misconfig', 'secret', 'license'];

// 5-Stage Intrusive Topology Model
const TOPOLOGY_NODES: AttackNode[] = [
  {
    id: 'node-ingress',
    category: 'ENTRY POINT',
    title: 'Public Inbound Gateway',
    subtitle: 'POST /api/v1/auth/verify • Port 443',
    description: 'Unauthenticated external route accepting arbitrary client-supplied tokens.',
    hopNumber: 1
  },
  {
    id: 'node-chokepoint',
    category: 'CHOKE POINT #1',
    title: 'jsonwebtoken @ 8.5.1',
    subtitle: 'CVE-2025-4128 • package.json:142',
    description: 'Cryptographic algorithm confusion allows forging administrator JWT claims.',
    hopNumber: 2,
    isChokePoint: true,
    findingId: 'armelis-cve-2025-4128'
  },
  {
    id: 'node-pivot',
    category: 'LATERAL MOVEMENT',
    title: 'Internal Microservice RPC',
    subtitle: 'auth-svc ➔ order-api:8080',
    description: 'Forged admin session bypasses internal service authentication without mTLS.',
    hopNumber: 3
  },
  {
    id: 'node-secret',
    category: 'CREDENTIAL EXFILTRATION',
    title: 'AWS Production Access Key',
    subtitle: 'src/config/aws.ts:18',
    description: 'Process memory and source code reveal high-privilege AWS IAM credentials.',
    hopNumber: 4,
    findingId: 'armelis-sec-aws-key'
  },
  {
    id: 'node-crown',
    category: 'CROWN JEWEL',
    title: 'Production Customer Database',
    subtitle: 'PostgreSQL Cluster • db-prod.internal',
    description: 'Target storage holding customer PII, credit records, and primary cryptographic keys.',
    hopNumber: 5,
    isCrownJewel: true
  }
];

// Rich authorized demo findings illustrating the full intelligence layer
const DEMO_FINDINGS: Finding[] = [
  {
    id: 'armelis-cve-2025-4128',
    title: 'CVE-2025-4128: Remote Code Execution & Signature Forgery in jsonwebtoken',
    description: 'Improper key validation in jsonwebtoken allows adversaries to forge administrative session tokens using HMAC-SHA256 with the public key as HMAC secret, completely bypassing authentication.',
    severity: 'CRITICAL',
    confidence: 'CONFIRMED',
    source: 'Trivy',
    category: 'Vulnerability',
    finding_type: 'DEPENDENCY',
    is_reachable: true,
    owasp_top10: ['A06:2021-Vulnerable and Outdated Components'],
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
    remediation: 'Upgrade jsonwebtoken to version 9.0.2 or later and specify explicit algorithms whitelist in verify() options.',
    code_diff: {
      file: 'package.json & src/middleware/auth.ts',
      before: [
        '// package.json',
        '-   "jsonwebtoken": "8.5.1",',
        '',
        '// src/middleware/auth.ts',
        '-   const decoded = jwt.verify(token, publicKey);'
      ],
      after: [
        '// package.json',
        '+   "jsonwebtoken": "^9.0.2",',
        '',
        '// src/middleware/auth.ts',
        '+   const decoded = jwt.verify(token, publicKey, {',
        '+     algorithms: ["RS256"],',
        '+     allowInvalidAsymmetricKeyTypes: false',
        '+   });'
      ]
    },
    ai_prompt: `Task: Remediate CVE-2025-4128 in repository.
1. Update package.json to bump "jsonwebtoken" to "^9.0.2".
2. In src/middleware/auth.ts, update jwt.verify() to explicitly specify algorithms: ["RS256"] and set allowInvalidAsymmetricKeyTypes: false.
3. Verify all JWT unit tests pass with strict algorithm whitelisting.`,
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
    description: 'High-entropy 20-character AWS Access Key ID detected in plain text inside application configuration file. Vulnerable to lateral harvest and unauthorized cloud API calls.',
    severity: 'HIGH',
    confidence: 'HIGH',
    source: 'Trivy',
    category: 'Secret',
    finding_type: 'SECRET',
    is_reachable: true,
    owasp_top10: ['A07:2021-Identification and Authentication Failures'],
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
    remediation: 'Revoke the exposed key immediately in AWS IAM and load credentials dynamically from environment variables or AWS Secrets Manager.',
    code_diff: {
      file: 'src/config/aws.ts',
      before: [
        '- export const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";',
        '- export const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";'
      ],
      after: [
        '+ // Credentials injected dynamically via environment or IAM Role',
        '+ export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;',
        '+ export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;'
      ]
    },
    ai_prompt: `Task: Remediate hardcoded AWS credentials in src/config/aws.ts.
1. Remove hardcoded strings for AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.
2. Replace with environment variable access via process.env.AWS_ACCESS_KEY_ID and process.env.AWS_SECRET_ACCESS_KEY.
3. Add a check verifying that credentials exist at runtime and throw a descriptive error if missing.
4. Notify Cloud SecOps to rotate the leaked AKIA key in AWS IAM.`,
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
    description: 'The container image specification lacks an unprivileged non-root USER directive, granting container escape attacks immediate root privileges on the underlying host kernel.',
    severity: 'MEDIUM',
    confidence: 'HIGH',
    source: 'Trivy',
    category: 'Security Misconfiguration',
    finding_type: 'IAC',
    is_reachable: false,
    owasp_top10: ['A05:2021-Security Misconfiguration'],
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
    remediation: 'Define an unprivileged user (e.g. appuser) and group before the container ENTRYPOINT instruction.',
    code_diff: {
      file: 'Dockerfile',
      before: [
        '- # Running as default root user',
        '- ENTRYPOINT ["node", "dist/index.js"]'
      ],
      after: [
        '+ # Create and assign unprivileged non-root user',
        '+ RUN addgroup -S appgroup && adduser -S appuser -G appgroup',
        '+ USER appuser',
        '+ ENTRYPOINT ["node", "dist/index.js"]'
      ]
    },
    ai_prompt: `Task: Enforce non-root execution in Dockerfile (DS-0001).
1. Before the ENTRYPOINT directive, add instructions to create an unprivileged group and user (e.g. appgroup, appuser).
2. Add "USER appuser" so the container process drops root capabilities.
3. Ensure file permissions in the working directory allow appuser to execute the bundle.`,
    status: 'OPEN',
    evidence: {
      rule_id: 'DS-0001',
      file: 'Dockerfile',
      resolution: 'Set USER nonroot'
    }
  }
];

const INITIAL_TELEMETRY: TelemetryEvent[] = [
  {
    id: 'tel-1',
    timestamp: '17:45:01',
    level: 'INFO',
    type: 'INGRESS_DISCOVERY',
    raw: 'CEF:0|Armelis|DetectionEngine|0.1.3|INGRESS_DISCOVERED|Public endpoint listening on 0.0.0.0:443|3|src=0.0.0.0/0 dst=10.0.1.4 dstPort=443 method=POST path=/api/v1/auth/verify'
  },
  {
    id: 'tel-2',
    timestamp: '17:45:02',
    level: 'CRITICAL',
    type: 'CVE_IDENTIFIED',
    raw: 'CEF:0|Armelis|DetectionEngine|0.1.3|CVE-2025-4128|jsonwebtoken 8.5.1 key confusion vulnerability|10|file=package-lock.json:142 pkg=jsonwebtoken ver=8.5.1 cvss=9.8'
  },
  {
    id: 'tel-3',
    timestamp: '17:45:03',
    level: 'HIGH',
    type: 'GRAPH_CORRELATION',
    raw: 'CEF:0|Armelis|GraphEngine|0.1.3|ATTACK_PATH_CORRELATED|Reachability trajectory confirmed from Ingress to Production DB|9|hops=5 src=node-ingress dst=node-crown risk_pct=84'
  },
  {
    id: 'tel-4',
    timestamp: '17:45:04',
    level: 'HIGH',
    type: 'CHOKE_POINT_ISOLATED',
    raw: 'CEF:0|Armelis|GraphEngine|0.1.3|CHOKE_POINT_ISOLATED|Minimal cut isolated at node-chokepoint (jsonwebtoken)|8|remediation="bump to 9.0.2" impact="100% path severance"'
  }
];

export default function App() {
  const [theme, setTheme] = useState<'cold' | 'warm'>('cold');
  const [target, setTarget] = useState('.');
  const [selected, setSelected] = useState(scanners);
  const [busy, setBusy] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhaseMessage, setScanPhaseMessage] = useState('');
  const [error, setError] = useState('');
  const [embedStatus, setEmbedStatus] = useState<'idle' | 'skipped' | 'pending' | 'succeeded' | 'failed'>('idle');
  const [embedMessage, setEmbedMessage] = useState('');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  
  // Dynamic Attack Graph Topology
  const [topologyNodes, setTopologyNodes] = useState<AttackNode[]>(() =>
    synthesizeAttackTopology([], 'Local Workspace')
  );
  
  // Tactical Drawer & Inspector State
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'diff' | 'aiprompt' | 'overview' | 'mitre' | 'evidence' | 'siem'>('diff');
  const [copiedFormat, setCopiedFormat] = useState<string>('');
  
  // Selected Graph Node for Tactical Focus
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-chokepoint');

  // Interactive Choke-Point Severance State
  const [isPathSevered, setIsPathSevered] = useState(false);

  // Live SIEM Telemetry Dock State
  const [telemetryOpen, setTelemetryOpen] = useState(true);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryEvent[]>(() => [
    {
      id: 'tel-init-1',
      timestamp: new Date().toTimeString().split(' ')[0],
      level: 'INFO',
      type: 'ENGINE_READY',
      raw: 'CEF:0|Armelis|CoreEngine|0.1.4|INITIALIZED|Air-gapped security workstation ready. Select target or load simulation.|1'
    }
  ]);
  const [telemetryFilter, setTelemetryFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'SUCCESS'>('ALL');
  const telemetryEndRef = useRef<HTMLDivElement>(null);

  // Sync theme attribute to <html> and <body> so canvas backgrounds shift dramatically
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle auto-scroll on new telemetry entries
  useEffect(() => {
    if (telemetryOpen && telemetryEndRef.current) {
      telemetryEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [telemetryLogs, telemetryOpen]);

  function addTelemetryLog(level: TelemetryEvent['level'], type: string, raw: string) {
    const time = new Date().toTimeString().split(' ')[0];
    const newEntry: TelemetryEvent = {
      id: `tel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: time,
      level,
      type,
      raw
    };
    setTelemetryLogs((prev) => [...prev, newEntry]);
  }

  function toggleScanner(scanner: string) {
    setSelected((current) =>
      current.includes(scanner)
        ? current.filter((item) => item !== scanner)
        : [...current, scanner]
    );
  }

  function loadDemoScenario() {
    setFindings(DEMO_FINDINGS);
    const demoTopology = synthesizeAttackTopology(DEMO_FINDINGS, 'Demo Scenario (jsonwebtoken CVE-2025-4128)');
    setTopologyNodes(demoTopology);
    setHasScanned(true);
    setIsDemoMode(true);
    setIsPathSevered(false);
    setError('');
    setSelectedFinding(DEMO_FINDINGS[0]);
    addTelemetryLog(
      'INFO',
      'DEMO_SIMULATION_LOADED',
      'CEF:0|Armelis|App|0.1.4|DEMO_LOADED|Loaded authorized demo attack path simulation (jsonwebtoken 8.5.1 key confusion)|1'
    );
  }

  function handleSeverToggle() {
    const nextSevered = !isPathSevered;
    setIsPathSevered(nextSevered);

    const chokeNode = topologyNodes.find((n) => n.isChokePoint);
    const chokeTitle = chokeNode?.title || 'Choke Point';
    const fixText = chokeNode?.fixedVersion ? `patched to ${chokeNode.fixedVersion}` : 'remediated';

    if (nextSevered) {
      addTelemetryLog(
        'SUCCESS',
        'CHOKE_POINT_SEVERED',
        `CEF:0|Armelis|DefenseEngine|0.1.4|SEVERANCE_ACTIVE|Choke point ${chokeTitle} ${fixText}. Ingress reachability dropped to 0%.|1|action="SEVER" target="${chokeNode?.subtitle || 'target'}"`
      );
    } else {
      addTelemetryLog(
        'HIGH',
        'SIMULATION_RESET',
        'CEF:0|Armelis|GraphEngine|0.1.4|PATH_RESTORED|Simulation reset. Active exploit reachability trajectory restored.|7|status="EXPOSED"'
      );
    }
  }

  async function runScan() {
    setBusy(true);
    setError('');
    setEmbedStatus('idle');
    setEmbedMessage('');
    setHasScanned(true);
    setIsDemoMode(false);
    setIsPathSevered(false);
    setSelectedFinding(null);

    const targetPath = target.trim() || '.';

    addTelemetryLog(
      'INFO',
      'SCAN_INITIATED',
      `CEF:0|Armelis|Runner|0.1.4|SCAN_STARTED|Sandboxed scan initiated on target "${targetPath}"|3|providers="${selected.join(',')}"`
    );

    setScanProgress(15);
    setScanPhaseMessage('Invoking native Trivy security engine...');

    const timer1 = setTimeout(() => {
      setScanProgress(45);
      setScanPhaseMessage('Auditing dependencies, lockfiles, and package manifests...');
    }, 1500);

    const timer2 = setTimeout(() => {
      setScanProgress(75);
      setScanPhaseMessage('Scanning container configurations, IaC, and secrets...');
    }, 4500);

    const timer3 = setTimeout(() => {
      setScanProgress(90);
      setScanPhaseMessage('Synthesizing reachability graph and choke points...');
    }, 9000);

    try {
      const result = await invoke<ScanResult>('run_scan', {
        target: targetPath,
        scanners: selected
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setScanProgress(100);
      setScanPhaseMessage('Scan complete. Findings normalized.');

      const scanSucceeded = result.status === 'SUCCESS' || result.status === 'COMPLETED';
      if (scanSucceeded) {
        const normalized = normalizeTrivyReport(result.stdout, targetPath);
        setFindings(normalized);

        const newTopology = synthesizeAttackTopology(normalized, targetPath);
        setTopologyNodes(newTopology);

        if (newTopology[1]?.id) {
          setSelectedNodeId(newTopology[1].id);
        }

        if (normalized.length === 0) {
          addTelemetryLog(
            'SUCCESS',
            'PERIMETER_VERIFIED',
            `CEF:0|Armelis|DetectionEngine|0.1.4|PERIMETER_CLEAN|Target "${targetPath}" verified secure. 0 vulnerabilities or secrets found.|1|findings_count=0`
          );
        } else {
          addTelemetryLog(
            'HIGH',
            'FINDINGS_NORMALIZED',
            `CEF:0|Armelis|DetectionEngine|0.1.4|FINDINGS_CORRELATED|Normalized ${normalized.length} findings across scanned manifests|8|findings_count=${normalized.length}`
          );

          normalized.slice(0, 3).forEach((f) => {
            addTelemetryLog(
              f.severity === 'CRITICAL' ? 'CRITICAL' : f.severity === 'HIGH' ? 'HIGH' : 'INFO',
              f.finding_type,
              generateCEF(f)
            );
          });
        }

        if (normalized.length > 0) {
          try {
            const embedResult = await invoke<ScanResult>('embed_findings', {
              workspace: targetPath,
              findingsJson: JSON.stringify({ product: 'Armelis', findings: normalized })
            });
            if (embedResult.status === 'SUCCEEDED') {
              setEmbedStatus('succeeded');
              setEmbedMessage('Local similarity vectors stored.');
            } else {
              setEmbedStatus('skipped');
              setEmbedMessage('Similarity embeddings skipped (local Python venv not initialized).');
            }
          } catch {
            setEmbedStatus('skipped');
            setEmbedMessage('Similarity embeddings skipped.');
          }
        }
      } else {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        setError(`Scanner failed (Exit ${result.exit_code}): ${result.stderr || result.stdout || 'Unknown error'}`);
        addTelemetryLog(
          'CRITICAL',
          'SCAN_FAILED',
          `CEF:0|Armelis|Runner|0.1.4|SCAN_ABORTED|Scan failed on target "${targetPath}": ${result.stderr || 'Execution error'}|9`
        );
      }
    } catch (e: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      const errMsg = e instanceof Error ? e.message : String(e);
      setError(`Scanner error: ${errMsg}`);
      addTelemetryLog(
        'CRITICAL',
        'SCAN_EXCEPTION',
        `CEF:0|Armelis|Runner|0.1.4|EXCEPTION|Scanner failed to execute: ${errMsg}|10`
      );
    } finally {
      setBusy(false);
      setTimeout(() => {
        setScanProgress(0);
      }, 1500);
    }
  }

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;

  const filtered = findings.filter((f) => {
    if (filterSeverity === 'ALL') return true;
    return f.severity === filterSeverity;
  });

  const filteredTelemetry = telemetryLogs.filter((log) => {
    if (telemetryFilter === 'ALL') return true;
    return log.level === telemetryFilter;
  });

  // SIEM formatting helpers
  function generateCEF(f: Finding) {
    const sevNum = f.severity === 'CRITICAL' ? 10 : f.severity === 'HIGH' ? 7 : f.severity === 'MEDIUM' ? 5 : 3;
    return `CEF:0|Armelis|SecurityPlatform|0.1.4|${f.id}|${f.title}|${sevNum}|src=127.0.0.1 cat=${f.category} cs1Label=TargetFile cs1=${f.file || 'unknown'} cs2Label=Remediation cs2=${f.remediation || 'none'}`;
  }

  function generateECS(f: Finding) {
    return JSON.stringify({
      '@timestamp': new Date().toISOString(),
      event: { kind: 'alert', category: 'vulnerability', severity: f.severity === 'CRITICAL' ? 10 : 7 },
      vulnerability: { id: f.cve || f.id, description: f.description, remediation: f.remediation },
      host: { hostname: 'armelis-tactical-node' },
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
    setTimeout(() => setCopiedFormat(''), 2200);
  }

  // Handle node selection in topology
  function handleNodeClick(node: AttackNode) {
    setSelectedNodeId(node.id);
    if (node.findingId) {
      const match = findings.find((f) => f.id === node.findingId);
      if (match) {
        setSelectedFinding(match);
        setInspectorTab('diff');
      }
    }
  }

  // Radial Exposure Gauge calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const reachableCount = findings.filter((f) => f.is_reachable).length;
  const exposurePct = isPathSevered || findings.length === 0
    ? 0
    : Math.min(100, Math.max(15, reachableCount * 25 + findings.length * 3));
  const strokeDashoffset = circumference - (exposurePct / 100) * circumference;

  const uniqueMitre = Array.from(
    new Set(findings.flatMap((f) => f.mitre_attack?.map((m) => m.technique_id) || []))
  );

  const chokeNode = topologyNodes.find((n) => n.isChokePoint);
  const isClean = hasScanned && findings.length === 0;

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
            {theme === 'cold' ? 'TACTICAL ATTACK GRAPH INTELLIGENCE' : 'TACTICAL DEFENSIVE ARMOR MATRIX'}
          </p>
          <h1>ARME<span>[LIS]</span> <span className="version-tag">v0.1.4</span></h1>
        </div>

        {/* Segmented Control for Dual Theme */}
        <div className="segmented-control" role="group" aria-label="Theme mode switcher">
          <button
            type="button"
            className={`segmented-btn ${theme === 'cold' ? 'active' : ''}`}
            onClick={() => setTheme('cold')}
            title="Cold analytical mode: Deep cyber void, nocturnal blue & cyan illumination"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Cold Analytical</span>
          </button>
          <button
            type="button"
            className={`segmented-btn ${theme === 'warm' ? 'active' : ''}`}
            onClick={() => setTheme('warm')}
            title="Warm protective: Tactical graphite armor, warm amber & bronze shield"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Warm Protective</span>
          </button>
        </div>
      </header>

      {/* Perimeter Threat HUD with Threat Exposure Gauge */}
      <section className="threat-hud" aria-label="Perimeter Threat HUD">
        {/* Metric 1: Threat Exposure Radial Gauge */}
        <div className="hud-card hud-gauge-card">
          <div className="hud-card-header">
            <span className="hud-label">Threat Exposure Index</span>
            <span className={`hud-badge ${isPathSevered || findings.length === 0 ? 'hud-badge-success' : 'hud-badge-danger'}`}>
              {isPathSevered || findings.length === 0 ? 'SECURED' : 'CRITICAL'}
            </span>
          </div>
          <div className="gauge-row">
            <div className="radial-gauge-container">
              <svg className="radial-gauge-svg" width="84" height="84" viewBox="0 0 84 84">
                <circle
                  className="gauge-track"
                  cx="42"
                  cy="42"
                  r={radius}
                  strokeWidth="7"
                />
                <circle
                  className={`gauge-indicator ${isPathSevered || findings.length === 0 ? 'gauge-severed' : 'gauge-active'}`}
                  cx="42"
                  cy="42"
                  r={radius}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="gauge-center-text">
                <span className="gauge-pct" style={{ color: isPathSevered || findings.length === 0 ? '#10b981' : '#ef4444' }}>
                  {exposurePct}%
                </span>
              </div>
            </div>
            <div className="gauge-meta">
              <span className="gauge-status-title">
                {findings.length === 0 ? 'Perimeter Verified' : isPathSevered ? 'Trajectory Neutralized' : 'Active Ingress Path'}
              </span>
              <p className="gauge-status-desc">
                {findings.length === 0
                  ? 'Zero vulnerabilities detected. System perimeter verified clean.'
                  : isPathSevered
                  ? 'Choke point severed. 0% of external traffic reaches credentials.'
                  : `Direct exploit reachability from ${topologyNodes[0]?.title || 'Ingress'} to ${topologyNodes[4]?.title || 'Target Asset'}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Metric 2: Choke-Point Severance Ratio */}
        <div className="hud-card">
          <div className="hud-card-header">
            <span className="hud-label">Choke-Point Ratio</span>
            <span className="hud-badge hud-badge-accent">1 ACTION = 100%</span>
          </div>
          <div className="hud-value" style={{ color: 'var(--accent-primary)' }}>
            1 : {Math.max(1, findings.length)}
          </div>
          <div className="hud-subtext">
            1 isolated choke point breaks entire intrusion chain
          </div>
        </div>

        {/* Metric 3: Active Threat Findings */}
        <div className="hud-card">
          <div className="hud-card-header">
            <span className="hud-label">Perimeter Findings</span>
            <span className={`hud-badge ${criticalCount > 0 ? 'hud-badge-danger' : 'hud-badge-accent'}`}>{criticalCount} CRIT</span>
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
            {uniqueMitre.length > 0 ? `${uniqueMitre.length} Vectors` : 'Verified'}
          </div>
          <div className="hud-subtext" style={{ fontFamily: 'monospace' }}>
            {uniqueMitre.length > 0 ? uniqueMitre.slice(0, 4).join(' • ') : 'No Threat Vectors'}
          </div>
        </div>
      </section>

      {/* Interactive 5-Node Attack Path Reachability Visualizer */}
      <section className="reachability-panel" aria-labelledby="attack-path-heading">
        <div className="reachability-header">
          <div className="reachability-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="radar-pulse-dot" />
              <p className="eyebrow" style={{ margin: 0 }}>ATTACK PATH CORRELATION TOPOLOGY (5-STAGE DAG)</p>
            </div>
            <h3 id="attack-path-heading" style={{ marginTop: '4px' }}>
              {isClean
                ? 'Perimeter Verified • Zero Attack Routes'
                : isPathSevered
                ? 'Exploit Chain Severed at Choke Point'
                : 'Active Ingress-to-Crown-Jewel Trajectory'}
            </h3>
            <p>
              {isClean
                ? 'All manifests, dependencies, and configuration policies are verified against known CVEs and security benchmarks.'
                : isPathSevered
                ? `Minimal Cut Activated: Remediating ${chokeNode?.title || 'Choke Point'} breaks the lateral pivot and protects downstream assets.`
                : `Graph correlation reveals external ingress reaches target assets through primary choke point: ${chokeNode?.title || 'Component'}.`}
            </p>
          </div>

          <button
            type="button"
            className={`sever-toggle-btn ${isPathSevered ? 'active' : 'inactive'}`}
            onClick={handleSeverToggle}
          >
            {isPathSevered ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Choke Point Severed (Reset Simulation)</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>
                  Sever Choke Point (
                  {chokeNode?.fixedVersion ? `Patch v${chokeNode.fixedVersion}` : 'Break Path'}
                  )
                </span>
              </>
            )}
          </button>
        </div>

        {/* 5-Node Interactive Attack Graph Flow */}
        <div className="topology-flow-scroll">
          <div className="topology-flow-5nodes">
            {topologyNodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              const isChokePoint = node.isChokePoint;
              const isAfterChokePoint = index >= 2;
              const isCut = isPathSevered && isAfterChokePoint;

              return (
                <div key={node.id} className="topology-step-wrapper">
                  {/* Node Card */}
                  <div
                    className={`topology-node node-step-${index + 1} ${isSelected ? 'selected' : ''} ${
                      isChokePoint ? (isPathSevered ? 'severed' : 'chokepoint') : ''
                    } ${isCut ? 'isolated' : ''}`}
                    onClick={() => handleNodeClick(node)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="node-top">
                      <span className="node-icon-badge">
                        {index === 0 && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        )}
                        {index === 1 && (
                          isPathSevered ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                          )
                        )}
                        {index === 2 && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                          </svg>
                        )}
                        {index === 3 && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                        {index === 4 && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                            <polygon points="6 3 18 3 22 9 12 22 2 9 6 3" />
                            <line x1="12" y1="22" x2="12" y2="9" />
                          </svg>
                        )}
                      </span>
                      <span className="node-category">
                        {isChokePoint && isPathSevered ? 'PATCHED CHOKE POINT' : node.category}
                      </span>
                    </div>

                    <strong>
                      {isChokePoint && isPathSevered
                        ? (node.fixedVersion ? `${node.title.split('@')[0]} @ ${node.fixedVersion}` : 'Remediated & Protected')
                        : node.title}
                    </strong>
                    <p>
                      {isChokePoint && isPathSevered
                        ? 'Defensive remediation applied. Key reachability path severed to 0%.'
                        : node.description}
                    </p>

                    <div className="node-footer">
                      <span>{node.subtitle}</span>
                      <span className="node-status-tag">
                        {isCut
                          ? 'ISOLATED'
                          : isChokePoint && isPathSevered
                          ? 'SEVERED'
                          : findings.length === 0
                          ? 'VERIFIED'
                          : 'EXPOSED'}
                      </span>
                    </div>
                  </div>

                  {/* Inter-node Connector */}
                  {index < topologyNodes.length - 1 && (
                    <div className="topology-connector">
                      <div
                        className={`beam-line ${
                          index === 1 && isPathSevered
                            ? 'severed-beam'
                            : isPathSevered && isAfterChokePoint
                            ? 'isolated-beam'
                            : findings.length === 0
                            ? 'isolated-beam'
                            : 'active'
                        }`}
                      />
                      {index === 1 && isPathSevered ? (
                        <div className="severed-laser-badge" title="Attack path broken here">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <span>SEVERED</span>
                        </div>
                      ) : (
                        <span className={`beam-badge ${isCut ? 'beam-cut' : ''}`}>▶</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
                ? 'Minimal Cut Activated: 100% of Reachability Paths to Crown Jewels Neutralized.'
                : 'Why Choke-Point Attack Graphs Matter:'}
            </strong>
            <p>
              {isPathSevered
                ? 'By upgrading jsonwebtoken to version 9.0.2, the entire intrusion chain is severed before an attacker can reach internal microservices or the AWS production database. No complex refactoring required.'
                : 'Traditional tools dump hundreds of disconnected alerts (code smells, unpinned dependencies). Armelis correlates reachability to isolate the single choke point that stops adversaries from escalating privileges.'}
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
            onClick={() => setTarget('.')}
            title="Scan current workspace root"
          >
            Current Directory (.)
          </button>
          <button
            type="button"
            className="quick-target-chip"
            onClick={() => setTarget('packages/scanner-adapters/trivy/test/fixture')}
            title="Scan test fixture containing real CVEs & credentials"
          >
            Vulnerable Fixture (Testbed)
          </button>
          <button
            type="button"
            className="quick-target-chip highlight-chip"
            onClick={loadDemoScenario}
            title="Load full 5-stage attack path demonstration scenario"
          >
            🧪 Load Demo Scenario
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
              onClick={loadDemoScenario}
              title="Load pre-configured attack path with CVE-2025-4128 and AWS credentials"
            >
              Load Demo Scenario
            </button>
          </div>
        )}

        {error && <p className="error" role="alert">{error}</p>}
        {embedStatus !== 'idle' && (
          <p
            className={`embed-status embed-status-${embedStatus}`}
            role="status"
            aria-live="polite"
          >
            <span className="embed-status-label">Local embeddings</span>
            {embedStatus === 'pending' && 'Running local MiniLM worker…'}
            {embedStatus === 'succeeded' && embedMessage}
            {embedStatus === 'failed' && `Failed — ${embedMessage}`}
            {embedStatus === 'skipped' && embedMessage}
          </p>
        )}
      </section>

      {/* Normalized Findings Matrix */}
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
        {!hasScanned && findings.length === 0 ? (
          <div className="clean-state-card" style={{ padding: '36px 24px', borderStyle: 'dashed' }}>
            <div
              className="clean-shield"
              style={{
                background: theme === 'cold' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: 'var(--accent-primary)',
                borderColor: 'var(--accent-primary)'
              }}
            >
              ⚡
            </div>
            <h3>Ready to Audit Repository</h3>
            <p style={{ maxWidth: '540px', margin: '8px auto 20px', lineHeight: 1.6 }}>
              Armelis runs Trivy air-gapped directly on your machine. Scan your local dependencies, lockfiles, configuration manifests, and secret tokens with zero data egress.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="primary-pill"
                onClick={runScan}
                style={{ fontSize: '13px', padding: '9px 20px' }}
              >
                Scan Workspace Now
              </button>
              <button
                type="button"
                className="secondary-pill"
                onClick={loadDemoScenario}
                style={{ fontSize: '13px', padding: '9px 20px' }}
              >
                🧪 Explore Attack Path Simulation
              </button>
            </div>
            <span className="clean-chip" style={{ marginTop: '22px' }}>
              LOCAL PROCESS BOUNDARY • ZERO CLOUD EGRESS • MITRE ATT&CK ALIGNED
            </span>
          </div>
        ) : hasScanned && findings.length === 0 ? (
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
                setInspectorTab('diff');
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

      {/* Slide-Over Threat Inspector Drawer */}
      {selectedFinding && (
        <div className="drawer-backdrop" onClick={() => setSelectedFinding(null)}>
          <aside className="drawer-panel" onClick={(e) => e.stopPropagation()} aria-label="Threat Inspector">
            <div className="drawer-header">
              <div className="drawer-header-left">
                <span className={`sev-badge sev-${selectedFinding.severity}`}>
                  {selectedFinding.severity}
                </span>
                <h3>{selectedFinding.title}</h3>
                <span className="drawer-target-path">
                  {selectedFinding.file ? `${selectedFinding.file}${selectedFinding.line ? `:${selectedFinding.line}` : ''}` : 'System Boundary'}
                </span>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setSelectedFinding(null)}
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            {/* Tactical Drawer Tabs */}
            <nav className="drawer-tabs" role="tablist">
              {(['diff', 'aiprompt', 'overview', 'mitre', 'evidence', 'siem'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`drawer-tab ${inspectorTab === tab ? 'active' : ''}`}
                  onClick={() => setInspectorTab(tab)}
                  role="tab"
                >
                  {tab === 'diff'
                    ? 'Code Diff (Patch)'
                    : tab === 'aiprompt'
                    ? '1-Click AI Prompt'
                    : tab === 'overview'
                    ? 'Overview'
                    : tab === 'mitre'
                    ? 'MITRE ATT&CK'
                    : tab === 'evidence'
                    ? 'Evidence'
                    : 'SIEM Export'}
                </button>
              ))}
            </nav>

            <div className="drawer-body">
              {/* Tab: Code Diff Patch */}
              {inspectorTab === 'diff' && (
                <div className="tab-pane">
                  <div className="diff-header-bar">
                    <span className="eyebrow">REMEDIATION CODE DIFF</span>
                    <span className="diff-file-tag">
                      {selectedFinding.code_diff?.file || selectedFinding.file || 'Source File'}
                    </span>
                  </div>

                  {selectedFinding.code_diff ? (
                    <div className="diff-viewer">
                      <div className="diff-chunk before-chunk">
                        <span className="diff-label">Vulnerable Implementation:</span>
                        <pre className="diff-code">
                          {selectedFinding.code_diff.before.map((line, i) => (
                            <div key={i} className="diff-line diff-del">
                              {line}
                            </div>
                          ))}
                        </pre>
                      </div>

                      <div className="diff-chunk after-chunk">
                        <span className="diff-label">Hardened / Patched Implementation:</span>
                        <pre className="diff-code">
                          {selectedFinding.code_diff.after.map((line, i) => (
                            <div key={i} className="diff-line diff-add">
                              {line}
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="code-preview" style={{ padding: '16px' }}>
                      {selectedFinding.remediation || 'Upgrade dependency to latest secure version.'}
                    </div>
                  )}

                  {selectedFinding.remediation && (
                    <div className="remediation-summary-box">
                      <span className="eyebrow">OFFICIAL RECOMMENDATION</span>
                      <p>{selectedFinding.remediation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: 1-Click AI Prompt Generator */}
              {inspectorTab === 'aiprompt' && (
                <div className="tab-pane">
                  <p className="hint">
                    Copy this structured prompt directly into <strong>Cursor</strong>, <strong>GitHub Copilot</strong>, or <strong>Claude</strong> to remediate this finding in seconds:
                  </p>

                  <div className="ai-prompt-box">
                    <pre className="ai-prompt-code">
                      {selectedFinding.ai_prompt || `Task: Fix ${selectedFinding.title}\nRemediation: ${selectedFinding.remediation || 'Update affected component'}\nTarget: ${selectedFinding.file || 'Repository'}`}
                    </pre>
                  </div>

                  <button
                    className="copy-btn copy-prompt-btn"
                    onClick={() =>
                      copyToClipboard(
                        selectedFinding.ai_prompt || selectedFinding.remediation || selectedFinding.title,
                        'aiprompt'
                      )
                    }
                  >
                    {copiedFormat === 'aiprompt' ? '✓ Prompt Copied to Clipboard!' : '📋 Copy Prompt for Cursor / Copilot'}
                  </button>
                </div>
              )}

              {/* Tab: Overview */}
              {inspectorTab === 'overview' && (
                <div className="tab-pane">
                  <p className="drawer-desc">{selectedFinding.description}</p>
                  
                  <div className="metrics-triad">
                    <div className="hud-card" style={{ padding: '12px' }}>
                      <span className="hud-label">Category</span>
                      <strong style={{ color: '#fff', fontSize: '13px' }}>{selectedFinding.category}</strong>
                    </div>
                    <div className="hud-card" style={{ padding: '12px' }}>
                      <span className="hud-label">OWASP Top 10</span>
                      <strong style={{ color: '#fbbf24', fontSize: '13px' }}>
                        {selectedFinding.owasp_top10?.[0] || 'Unmapped'}
                      </strong>
                    </div>
                    <div className="hud-card" style={{ padding: '12px' }}>
                      <span className="hud-label">Reachability</span>
                      <strong style={{ color: selectedFinding.is_reachable ? '#ef4444' : '#10b981', fontSize: '13px' }}>
                        {selectedFinding.is_reachable ? 'Active Ingress Path' : 'Isolated Runtime'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: MITRE ATT&CK */}
              {inspectorTab === 'mitre' && (
                <div className="tab-pane">
                  <p className="hint">Adversary Tactics & Techniques mapped for SOC incident response:</p>
                  {selectedFinding.mitre_attack?.map((m: MitreTechnique) => (
                    <div key={m.technique_id} className="mitre-box">
                      <h4>[{m.technique_id}] {m.technique_name}</h4>
                      <p><strong>Tactic:</strong> {m.tactic}</p>
                      {m.url && (
                        <a href={m.url} target="_blank" rel="noreferrer" className="mitre-link">
                          View in MITRE Enterprise Matrix ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Evidence */}
              {inspectorTab === 'evidence' && (
                <div className="tab-pane">
                  <p className="hint">Sensitive parameters (secrets, passwords, matches) are masked with [REDACTED]:</p>
                  <div className="code-preview">
                    {JSON.stringify(selectedFinding.evidence || selectedFinding, null, 2)}
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(JSON.stringify(selectedFinding.evidence, null, 2), 'evidence')}
                  >
                    {copiedFormat === 'evidence' ? 'Copied Evidence!' : 'Copy Redacted Evidence'}
                  </button>
                </div>
              )}

              {/* Tab: SIEM Export */}
              {inspectorTab === 'siem' && (
                <div className="tab-pane">
                  <p className="hint">Dispatch directly to enterprise SOC platforms (Splunk, Elastic, Datadog):</p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <span className="eyebrow">CEF FORMAT (SPLUNK / ARCSIGHT / QRADAR)</span>
                    <div className="code-preview" style={{ marginTop: '4px' }}>
                      {generateCEF(selectedFinding)}
                    </div>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(generateCEF(selectedFinding), 'cef')}
                    >
                      {copiedFormat === 'cef' ? 'Copied CEF!' : 'Copy CEF Event'}
                    </button>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <span className="eyebrow">ECS / NDJSON (ELASTICSEARCH / WAZUH)</span>
                    <div className="code-preview" style={{ marginTop: '4px' }}>
                      {generateECS(selectedFinding)}
                    </div>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(generateECS(selectedFinding), 'ecs')}
                    >
                      {copiedFormat === 'ecs' ? 'Copied ECS!' : 'Copy ECS JSON'}
                    </button>
                  </div>

                  <div>
                    <span className="eyebrow">RFC 5424 SYSLOG LINE</span>
                    <div className="code-preview" style={{ marginTop: '4px' }}>
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
          </aside>
        </div>
      )}

      {/* Collapsible Live SIEM Telemetry Dock */}
      <footer className={`telemetry-dock ${telemetryOpen ? 'open' : 'minimized'}`} aria-label="SIEM Telemetry Dock">
        <div className="dock-header" onClick={() => setTelemetryOpen(!telemetryOpen)}>
          <div className="dock-title-group">
            <span className="dock-live-pulse" />
            <span className="dock-title">SIEM TELEMETRY STREAM</span>
            <span className="dock-counter">{filteredTelemetry.length} EVENTS</span>
          </div>

          <div className="dock-controls" onClick={(e) => e.stopPropagation()}>
            {/* Filter pills inside dock */}
            <div className="dock-filters">
              {(['ALL', 'CRITICAL', 'HIGH', 'SUCCESS'] as const).map((lvl) => (
                <button
                  key={lvl}
                  className={`dock-filter-btn ${telemetryFilter === lvl ? 'active' : ''}`}
                  onClick={() => setTelemetryFilter(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              className="dock-export-btn"
              onClick={() => copyToClipboard(telemetryLogs.map((l) => `[${l.timestamp}] ${l.raw}`).join('\n'), 'telemetry')}
              title="Copy full telemetry log stream"
            >
              {copiedFormat === 'telemetry' ? 'Copied Stream!' : 'Export Logs'}
            </button>

            <button
              className="dock-toggle-btn"
              onClick={() => setTelemetryOpen(!telemetryOpen)}
              title={telemetryOpen ? 'Minimize Dock' : 'Expand Dock'}
            >
              {telemetryOpen ? '▼' : '▲'}
            </button>
          </div>
        </div>

        {telemetryOpen && (
          <div className="dock-body">
            {filteredTelemetry.map((log) => (
              <div key={log.id} className={`telemetry-line level-${log.level.toLowerCase()}`}>
                <span className="telemetry-time">[{log.timestamp}]</span>
                <span className={`telemetry-badge level-${log.level.toLowerCase()}`}>{log.level}</span>
                <span className="telemetry-type">{log.type}</span>
                <span className="telemetry-raw">{log.raw}</span>
              </div>
            ))}
            <div ref={telemetryEndRef} />
          </div>
        )}
      </footer>
    </main>
  );
}
