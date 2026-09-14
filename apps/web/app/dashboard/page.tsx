'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

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
  ai_prompt?: string;
  status: string;
  evidence?: Record<string, unknown>;
};

const DEMO_FINDINGS: Finding[] = [
  {
    id: 'cs-finding-01',
    title: 'CVE-2025-4128: Signature Forgery in jsonwebtoken',
    description: 'Improper algorithm verification allows unauthenticated attackers to forge arbitrary JWT tokens and access private customer orders without credentials.',
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
        technique_name: 'Supply Chain Compromise: Dependencies',
        url: 'https://attack.mitre.org/techniques/T1195/002/'
      }
    ],
    package: 'jsonwebtoken',
    installed_version: '8.5.1',
    fixed_version: '9.0.2',
    file: 'package-lock.json',
    line: 88,
    cve: 'CVE-2025-4128',
    remediation: 'Upgrade jsonwebtoken to >= 9.0.2 in package.json to enforce explicit signature algorithm whitelisting.',
    ai_prompt: 'Upgrade dependency jsonwebtoken to version 9.0.2 in package.json and update package-lock.json. Enforce algorithms: ["HS256"] in jwt.verify calls.',
    status: 'OPEN',
    evidence: {
      package: 'jsonwebtoken',
      installed: '8.5.1',
      fixed: '9.0.2',
      cve: 'CVE-2025-4128',
      match: '[REDACTED_PACKAGE_SPEC]'
    }
  },
  {
    id: 'cs-finding-02',
    title: 'Production AWS Secret Key in Git Commit History',
    description: 'A 40-character AWS IAM secret access key was committed to the repository in an infrastructure deployment manifest.',
    severity: 'HIGH',
    confidence: 'HIGH',
    source: 'Gitleaks',
    category: 'Secret',
    finding_type: 'SECRET',
    owasp_top10: ['A07:2021'],
    mitre_attack: [
      {
        tactic: 'Credential Access',
        technique_id: 'T1552.001',
        technique_name: 'Unsecured Credentials: In Files',
        url: 'https://attack.mitre.org/techniques/T1552/001/'
      }
    ],
    file: 'infra/deploy.tf',
    line: 14,
    remediation: 'Rotate the AWS access key immediately in IAM, invalidate old sessions, and rewrite git history using git-filter-repo.',
    ai_prompt: 'Remove hardcoded AWS credentials from infra/deploy.tf and replace with AWS_SECRET_ACCESS_KEY environment variable reference via data.aws_secretsmanager or var.aws_secret_key.',
    status: 'OPEN',
    evidence: {
      rule_id: 'aws-secret-access-key',
      target: 'infra/deploy.tf',
      match: '[REDACTED_AWS_SECRET_KEY]'
    }
  },
  {
    id: 'cs-finding-03',
    title: 'Missing Authorization Check on /api/orders/:id',
    description: 'Endpoint lacks tenant ownership validation, allowing any authenticated user to view arbitrary customer records (IDOR). Common when AI generates boilerplate CRUD routes.',
    severity: 'HIGH',
    confidence: 'HIGH',
    source: 'Semgrep',
    category: 'Code Vulnerability',
    finding_type: 'CODE',
    owasp_top10: ['A01:2021'],
    mitre_attack: [
      {
        tactic: 'Privilege Escalation',
        technique_id: 'T1068',
        technique_name: 'Exploitation for Privilege Escalation',
        url: 'https://attack.mitre.org/techniques/T1068/'
      }
    ],
    file: 'src/routes/orders.ts',
    line: 42,
    remediation: 'Verify order.user_id === session.user.id before serializing record into JSON response.',
    ai_prompt: 'In src/routes/orders.ts line 42, add an authorization guard: if (order.user_id !== session.user.id) { return res.status(403).json({ error: "Forbidden" }); }',
    status: 'OPEN',
    evidence: {
      rule_id: 'owasp.idor.missing-owner-check',
      file: 'src/routes/orders.ts'
    }
  },
  {
    id: 'cs-finding-04',
    title: 'Docker Container Root Execution Allowed',
    description: 'No USER directive declared in Dockerfile, resulting in containers running with root host permissions.',
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
    line: 18,
    remediation: 'Define a dedicated non-privileged user (e.g. USER node or USER nonroot) before running the application process.',
    ai_prompt: 'In Dockerfile, add "USER node" before the CMD instruction so the container process does not run as root.',
    status: 'OPEN',
    evidence: {
      rule_id: 'DS-0001',
      file: 'Dockerfile'
    }
  }
];

export default function DashboardPage() {
  const [findings] = useState<Finding[]>(DEMO_FINDINGS);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'mitre' | 'evidence' | 'siem'>('overview');
  const [copiedFormat, setCopiedFormat] = useState<string>('');
  const [showBatchSiemModal, setShowBatchSiemModal] = useState<boolean>(false);
  const [batchFormat, setBatchFormat] = useState<'cef' | 'ecs'>('cef');

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      const matchSev = filterSeverity === 'ALL' || f.severity === filterSeverity;
      const matchCat = filterCategory === 'ALL' || f.finding_type === filterCategory;
      const matchQuery =
        !searchQuery.trim() ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.file?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.cve?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.package?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.mitre_attack?.some((m) => m.technique_id.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSev && matchCat && matchQuery;
    });
  }, [findings, filterSeverity, filterCategory, searchQuery]);

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const mitreTechniques = new Set(findings.flatMap((f) => f.mitre_attack?.map((m) => m.technique_id) || [])).size;

  function generateCEF(f: Finding) {
    const sevScore = f.severity === 'CRITICAL' ? 10 : f.severity === 'HIGH' ? 8 : f.severity === 'MEDIUM' ? 6 : 3;
    const mitre = f.mitre_attack?.[0];
    return `CEF:0|CyberScan|CyberScan|1.0.0|${f.finding_type}|${f.title}|${sevScore}|src=storefront-api filePath=${f.file || ''} fileId=${f.line || ''} cs1=${mitre?.technique_id || ''} cs1Label=mitre_technique_id cs2=${mitre?.technique_name || ''} cs2Label=mitre_technique_name cs3=${f.owasp_top10?.[0] || ''} cs3Label=owasp_category cve=${f.cve || ''}`;
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
        threat: f.mitre_attack?.map((m) => ({
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
    <main
      style={{
        minHeight: '100vh',
        background: '#060b17',
        color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: '80px'
      }}
    >
      {/* Top Header Bar (Clean, Solid, No Glassmorphic Blur) */}
      <header
        style={{
          background: '#0a1122',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0070f3, #00e5ff)',
                color: '#060b17',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: '16px'
              }}
            >
              ⌁
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              CYBER<span style={{ color: '#00e5ff' }}>SCAN</span>
            </span>
          </Link>

          <span style={{ color: '#334155', fontSize: '15px' }}>/</span>

          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
            AI-Assisted Security Console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Engine Online Status (Clean, Understated - Exact as media_1789418874506.png) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981'
              }}
            />
            <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Engine Online</span>
          </div>

          <button
            onClick={() => setShowBatchSiemModal(true)}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#e2e8f0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Export SIEM Feed
          </button>

          <Link
            href="/"
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              background: '#0f172a',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Main Content Shell */}
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Workspace Telemetry Ribbon */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: '#0a1224',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            marginBottom: '28px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'rgba(0, 112, 243, 0.15)',
                border: '1px solid rgba(0, 112, 243, 0.3)',
                color: '#60a5fa',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'monospace'
              }}
            >
              github.com/retail-corp/storefront-api
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
              <span>branch: <strong style={{ color: '#cbd5e1' }}>main</strong></span>
              <span>•</span>
              <span>commit: <strong style={{ color: '#00e5ff' }}>8f3e1a9</strong></span>
              <span>•</span>
              <span>AI workflow: <strong style={{ color: '#34d399' }}>Cursor + Copilot PR #42</strong></span>
              <span>•</span>
              <span>scan duration: <strong style={{ color: '#cbd5e1' }}>3.42s</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#0f1b33', color: '#38bdf8', border: '1px solid rgba(255,255,255,0.06)' }}>Trivy</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#0f1b33', color: '#c084fc', border: '1px solid rgba(255,255,255,0.06)' }}>Semgrep</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#0f1b33', color: '#facc15', border: '1px solid rgba(255,255,255,0.06)' }}>Gitleaks</span>
          </div>
        </div>

        {/* Title & Posture Health Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
          <div>
            <span style={{ color: '#00e5ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              SECURITY FOR AI-ASSISTED TEAMS & DEVELOPERS
            </span>
            <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.6px', margin: '6px 0 10px' }}>
              Correlated Attack Paths & Risk Triage
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
              AI code generation accelerates development, but can inadvertently introduce unauthenticated IDOR endpoints, hallucinated packages, or committed cloud secrets. CyberScan proves what is reachable and provides exact prompts to fix it.
            </p>
          </div>

          {/* Posture Health Widget */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: '#0a1224',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              minWidth: '240px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Posture Score</span>
              <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>64 / 100 • High Risk</span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden', display: 'flex', gap: '2px' }}>
              <div style={{ width: '25%', background: '#ef4444' }} />
              <div style={{ width: '50%', background: '#f97316' }} />
              <div style={{ width: '25%', background: '#f59e0b' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
              <span>1 Critical</span>
              <span>2 High</span>
              <span>1 Medium</span>
            </div>
          </div>
        </div>

        {/* Attack Path Kill-Chain Flow (Clean, Solid, High-Contrast) */}
        <div
          style={{
            marginBottom: '32px',
            padding: '22px 24px',
            borderRadius: '14px',
            background: '#091122',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#00e5ff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SYNTHESIZED EXPLOITATION PATH (AI AGENT & HUMAN AUDIT)
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Click node to inspect finding
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            
            <div
              onClick={() => {
                const found = findings.find((f) => f.id === 'cs-finding-03');
                if (found) setSelectedFinding(found);
              }}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: '#0d172e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: '#f97316', fontWeight: 700 }}>STEP 1 • ENTRY POINT</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Semgrep</span>
              </div>
              <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc', marginBottom: '4px' }}>
                /api/orders/:id IDOR
              </strong>
              <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', lineHeight: 1.4 }}>
                Unauthenticated access to customer records across tenants.
              </small>
            </div>

            <div
              onClick={() => {
                const found = findings.find((f) => f.id === 'cs-finding-01');
                if (found) setSelectedFinding(found);
              }}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: '#0d172e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>STEP 2 • EXPLOITATION</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Trivy CVE</span>
              </div>
              <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc', marginBottom: '4px' }}>
                jsonwebtoken CVE-2025-4128
              </strong>
              <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', lineHeight: 1.4 }}>
                Signature verification bypass allows arbitrary claim forgery.
              </small>
            </div>

            <div
              onClick={() => {
                const found = findings.find((f) => f.id === 'cs-finding-02');
                if (found) setSelectedFinding(found);
              }}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: '#0d172e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: '#f97316', fontWeight: 700 }}>STEP 3 • LATERAL MOVE</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Gitleaks</span>
              </div>
              <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc', marginBottom: '4px' }}>
                AWS Key in deploy.tf
              </strong>
              <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', lineHeight: 1.4 }}>
                Hardcoded IAM credentials committed during infra setup.
              </small>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: '#0d172e',
                border: '1px dashed rgba(255, 255, 255, 0.15)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>STEP 4 • BLAST RADIUS</span>
                <span style={{ fontSize: '10px', color: '#ef4444' }}>Critical</span>
              </div>
              <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc', marginBottom: '4px' }}>
                Customer Database & S3
              </strong>
              <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', lineHeight: 1.4 }}>
                Unrestricted exfiltration of customer records and data storage.
              </small>
            </div>

          </div>
        </div>

        {/* Metrics Row (Clean, Solid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          
          <div
            onClick={() => setFilterSeverity('ALL')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: filterSeverity === 'ALL' ? '#111e38' : '#0a1224',
              border: filterSeverity === 'ALL' ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Total Correlated</span>
            <strong style={{ display: 'block', fontSize: '26px', fontWeight: 800, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>{findings.length}</strong>
          </div>

          <div
            onClick={() => setFilterSeverity('CRITICAL')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: filterSeverity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.12)' : '#0a1224',
              border: filterSeverity === 'CRITICAL' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Critical Alert</span>
            <strong style={{ display: 'block', fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>{criticalCount}</strong>
          </div>

          <div
            onClick={() => setFilterSeverity('HIGH')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: filterSeverity === 'HIGH' ? 'rgba(249, 115, 22, 0.12)' : '#0a1224',
              border: filterSeverity === 'HIGH' ? '1px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: '#f97316', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>High Severity</span>
            <strong style={{ display: 'block', fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#f97316', fontVariantNumeric: 'tabular-nums' }}>{highCount}</strong>
          </div>

          <div
            onClick={() => setFilterSeverity('MEDIUM')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: filterSeverity === 'MEDIUM' ? 'rgba(245, 158, 11, 0.12)' : '#0a1224',
              border: filterSeverity === 'MEDIUM' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Medium Warnings</span>
            <strong style={{ display: 'block', fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>{mediumCount}</strong>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#0a1224',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <span style={{ color: '#00e5ff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>MITRE Tactics</span>
            <strong style={{ display: 'block', fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#00e5ff', fontVariantNumeric: 'tabular-nums' }}>{mitreTechniques}</strong>
          </div>

        </div>

        {/* Search & Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            marginBottom: '18px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: '#0a1224',
            border: '1px solid rgba(255, 255, 255, 0.07)'
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, files, packages, or CVEs..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#060b17',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Severity Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SEVERITY:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: filterSeverity === sev ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: filterSeverity === sev ? 'rgba(0, 229, 255, 0.15)' : '#060b17',
                  color: filterSeverity === sev ? '#00e5ff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Category Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TYPE:</span>
            {[
              { label: 'All', val: 'ALL' },
              { label: 'Deps', val: 'DEPENDENCY' },
              { label: 'Secret', val: 'SECRET' },
              { label: 'Code', val: 'CODE' },
              { label: 'IaC', val: 'IAC' }
            ].map((cat) => (
              <button
                key={cat.val}
                onClick={() => setFilterCategory(cat.val)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: filterCategory === cat.val ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  background: filterCategory === cat.val ? '#1e293b' : 'transparent',
                  color: filterCategory === cat.val ? '#fff' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Finding List / Cards (CLEAN 1px BORDER - NO VIBE-CODED 4px BORDER-LEFT) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((finding) => (
            <article
              key={finding.id}
              onClick={() => {
                setSelectedFinding(finding);
                setInspectorTab('overview');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '10px',
                background: '#0a1224',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'background 0.12s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                
                {/* Severity Badge */}
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    background:
                      finding.severity === 'CRITICAL'
                        ? '#dc2626'
                        : finding.severity === 'HIGH'
                        ? '#ea580c'
                        : finding.severity === 'MEDIUM'
                        ? '#d97706'
                        : '#0284c7',
                    flexShrink: 0
                  }}
                >
                  {finding.severity}
                </span>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                      {finding.title}
                    </strong>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#1e293b',
                        color: '#94a3b8',
                        fontWeight: 600
                      }}
                    >
                      {finding.finding_type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', color: '#64748b', fontSize: '12px' }}>
                    <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                      {finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ''}` : 'Repository Target'}
                    </span>
                    {finding.package && (
                      <span>• pkg: <strong style={{ color: '#cbd5e1' }}>{finding.package}</strong> ({finding.installed_version} → {finding.fixed_version})</span>
                    )}
                    <span>• Provider: <strong style={{ color: '#94a3b8' }}>{finding.source}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions & AI Prompt Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                {finding.ai_prompt && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(finding.ai_prompt || '', `prompt-${finding.id}`);
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: '#13233f',
                      border: '1px solid #1e3a6a',
                      color: '#38bdf8',
                      cursor: 'pointer'
                    }}
                    title="Copy deterministic prompt for Cursor, Copilot, or Claude Code"
                  >
                    {copiedFormat === `prompt-${finding.id}` ? '✓ Copied AI Prompt' : 'Copy AI Fix Prompt'}
                  </button>
                )}

                {finding.mitre_attack?.[0] && (
                  <span
                    style={{
                      padding: '4px 7px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      background: 'rgba(0, 112, 243, 0.12)',
                      color: '#60a5fa'
                    }}
                  >
                    {finding.mitre_attack[0].technique_id}
                  </span>
                )}

                <span style={{ color: '#00e5ff', fontSize: '13px', marginLeft: '4px' }}>Inspect →</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Centered Floating Modal Inspector (Solid, Clean, Apple HIG) */}
      {selectedFinding && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspector-modal-title"
          onClick={() => setSelectedFinding(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 100
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(800px, 100%)',
              maxHeight: 'min(88vh, 740px)',
              overflowY: 'auto',
              borderRadius: '16px',
              padding: '24px 28px',
              background: '#091224',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: '#fff',
                      background:
                        selectedFinding.severity === 'CRITICAL'
                          ? '#dc2626'
                          : selectedFinding.severity === 'HIGH'
                          ? '#ea580c'
                          : '#d97706'
                    }}
                  >
                    {selectedFinding.severity}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
                    {selectedFinding.id}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>• Engine: {selectedFinding.source}</span>
                </div>
                <h2 id="inspector-modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                  {selectedFinding.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedFinding(null)}
                aria-label="Close inspector dialog"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: '#0f172a',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>

            {/* AI Assistant Prompt Box (Direct AI Workflow Benefit) */}
            {selectedFinding.ai_prompt && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: '#070f1e',
                  border: '1px solid #1e3a6a'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    PROMPT FOR AI ASSISTANT (CURSOR / COPILOT / CLAUDE CODE)
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedFinding.ai_prompt || '', 'modal-prompt')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: '#0070f3',
                      color: '#fff',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedFormat === 'modal-prompt' ? '✓ Copied Prompt' : 'Copy AI Prompt'}
                  </button>
                </div>
                <code style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', lineHeight: 1.5, fontFamily: 'monospace' }}>
                  {selectedFinding.ai_prompt}
                </code>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', margin: '18px 0 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              {(['overview', 'mitre', 'evidence', 'siem'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setInspectorTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: inspectorTab === tab ? '#00e5ff' : '#94a3b8',
                    background: inspectorTab === tab ? '#0e1d38' : 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {tab === 'overview' ? 'Overview' : tab === 'mitre' ? 'MITRE ATT&CK' : tab === 'evidence' ? 'Sanitized Evidence' : 'SIEM Payloads'}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {inspectorTab === 'overview' && (
              <div>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '14px', margin: '0 0 16px' }}>
                  {selectedFinding.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', background: '#060b17', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Target Type</span>
                    <strong style={{ fontSize: '14px' }}>{selectedFinding.finding_type}</strong>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: '#060b17', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>OWASP Top 10</span>
                    <strong style={{ fontSize: '14px', color: '#fbbf24' }}>{selectedFinding.owasp_top10?.[0] || 'A06:2021'}</strong>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: '#060b17', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Status</span>
                    <strong style={{ fontSize: '14px', color: '#34d399' }}>{selectedFinding.status}</strong>
                  </div>
                </div>

                {selectedFinding.remediation && (
                  <div style={{ marginTop: '16px', padding: '14px', borderRadius: '8px', background: '#0a1a2f', border: '1px solid #173860' }}>
                    <span style={{ display: 'block', color: '#38bdf8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      RECOMMENDED REMEDIATION
                    </span>
                    <strong style={{ color: '#fff', fontSize: '13px', lineHeight: 1.5, display: 'block' }}>
                      {selectedFinding.remediation}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* Tab: MITRE ATT&CK */}
            {inspectorTab === 'mitre' && (
              <div>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
                  Adversary tactics and techniques mapped for SOC alert triage:
                </p>
                {selectedFinding.mitre_attack?.map((m) => (
                  <div
                    key={m.technique_id}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: '#071224',
                      border: '1px solid rgba(0, 112, 243, 0.25)',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#60a5fa', fontSize: '14px' }}>
                        [{m.technique_id}] {m.technique_name}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{m.tactic}</span>
                    </div>
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-block', marginTop: '6px', color: '#00e5ff', fontSize: '12px' }}
                      >
                        Open in MITRE Matrix ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Evidence */}
            {inspectorTab === 'evidence' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                    Deterministic AST matches with secrets permanently masked:
                  </p>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedFinding.evidence, null, 2), 'evidence')}
                    style={{ padding: '4px 10px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: 'none', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {copiedFormat === 'evidence' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '14px', borderRadius: '8px', background: '#060b17', border: '1px solid rgba(255,255,255,0.06)', color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(selectedFinding.evidence || selectedFinding, null, 2)}
                </pre>
              </div>
            )}

            {/* Tab: SIEM Export */}
            {inspectorTab === 'siem' && (
              <div>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
                  Standard event payloads for SIEM pipelines (Splunk, Elastic, Wazuh):
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#00e5ff', fontSize: '11px', fontWeight: 700 }}>CEF (SPLUNK / QRADAR)</span>
                    <button onClick={() => copyToClipboard(generateCEF(selectedFinding), 'cef')} style={{ padding: '3px 8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: 'none', fontSize: '10px', cursor: 'pointer' }}>
                      {copiedFormat === 'cef' ? '✓ Copied' : 'Copy CEF'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '10px', borderRadius: '6px', background: '#060b17', color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {generateCEF(selectedFinding)}
                  </pre>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#00e5ff', fontSize: '11px', fontWeight: 700 }}>ECS JSON (ELASTICSEARCH / WAZUH)</span>
                    <button onClick={() => copyToClipboard(generateECS(selectedFinding), 'ecs')} style={{ padding: '3px 8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: 'none', fontSize: '10px', cursor: 'pointer' }}>
                      {copiedFormat === 'ecs' ? '✓ Copied' : 'Copy ECS'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '10px', borderRadius: '6px', background: '#060b17', color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px', overflowX: 'auto', maxHeight: '140px' }}>
                    {generateECS(selectedFinding)}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Batch SIEM Export Modal */}
      {showBatchSiemModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-siem-title"
          onClick={() => setShowBatchSiemModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 100
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(720px, 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              background: '#091224',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 id="batch-siem-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                Export All Findings ({findings.length})
              </h3>
              <button
                onClick={() => setShowBatchSiemModal(false)}
                aria-label="Close export dialog"
                style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setBatchFormat('cef')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: batchFormat === 'cef' ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.08)',
                  background: batchFormat === 'cef' ? '#0f2347' : '#060b17',
                  color: batchFormat === 'cef' ? '#00e5ff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                CEF Multiline (Splunk)
              </button>
              <button
                onClick={() => setBatchFormat('ecs')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: batchFormat === 'ecs' ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.08)',
                  background: batchFormat === 'ecs' ? '#0f2347' : '#060b17',
                  color: batchFormat === 'ecs' ? '#00e5ff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                ECS NDJSON (Elasticsearch)
              </button>
            </div>

            <pre style={{ margin: 0, padding: '12px', borderRadius: '8px', background: '#060b17', color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px', maxHeight: '220px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {batchFormat === 'cef'
                ? findings.map((f) => generateCEF(f)).join('\n')
                : findings.map((f) => JSON.stringify(JSON.parse(generateECS(f)))).join('\n')}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                onClick={() =>
                  copyToClipboard(
                    batchFormat === 'cef'
                      ? findings.map((f) => generateCEF(f)).join('\n')
                      : findings.map((f) => JSON.stringify(JSON.parse(generateECS(f)))).join('\n'),
                    'batch'
                  )
                }
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copiedFormat === 'batch' ? '✓ Copied Batch to Clipboard' : `Copy ${batchFormat.toUpperCase()} Batch`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
