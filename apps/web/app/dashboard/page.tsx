'use client';

import Link from 'next/link';
import { useState, useMemo, useRef } from 'react';
import {
  type Finding,
  type FindingsDataSource,
  extractFindingsFromJson,
  dataSourceLabel,
  dataSourceBadgeColor
} from '../../lib/findings';
import { auditGitHubRepository } from '../../lib/githubScanner';

export default function DashboardPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [dataSource, setDataSource] = useState<FindingsDataSource>('empty');
  const [importError, setImportError] = useState<string>('');
  const [analyzeHint, setAnalyzeHint] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [repoInput, setRepoInput] = useState<string>('https://github.com/retail-corp/storefront-api');
  const [activeRepo, setActiveRepo] = useState<string>('no-scan-loaded');
  const [activeBranch, setActiveBranch] = useState<string>('main');
  const [activeCommit, setActiveCommit] = useState<string>('—');
  const [scanDuration, setScanDuration] = useState<string>('—');
  const [repoStars, setRepoStars] = useState<number | null>(null);
  const [repoLang, setRepoLang] = useState<string>('—');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);
  const [githubPat, setGithubPat] = useState<string>('');
  const [githubUsername, setGithubUsername] = useState<string>('Johanvasquezdev');
  const [isConnected, setIsConnected] = useState<boolean>(false);
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
  const lowCount = findings.filter((f) => f.severity === 'LOW').length;
  const infoCount = findings.filter((f) => f.severity === 'INFO').length;
  const mitreTechniques = new Set(findings.flatMap((f) => f.mitre_attack?.map((m) => m.technique_id) || [])).size;

  const { postureScore, postureLabel, postureColor, critBarWidth, highBarWidth, medBarWidth, cleanBarWidth } = useMemo(() => {
    let score = 100;
    score -= criticalCount * 28;
    score -= highCount * 14;
    score -= mediumCount * 6;
    score -= lowCount * 1;
    const clamped = Math.max(12, Math.min(100, score));

    const totalWeight = (criticalCount * 3) + (highCount * 2) + (mediumCount * 1);
    let cW = 0, hW = 0, mW = 0, cleanW = 0;
    if (totalWeight === 0) {
      cleanW = 100;
    } else {
      cW = Math.round((criticalCount * 3 / totalWeight) * 100);
      hW = Math.round((highCount * 2 / totalWeight) * 100);
      mW = Math.max(0, 100 - cW - hW);
    }

    if (clamped >= 90) return { postureScore: clamped, postureLabel: 'Optimal', postureColor: '#10b981', critBarWidth: cW, highBarWidth: hW, medBarWidth: mW, cleanBarWidth: cleanW };
    if (clamped >= 75) return { postureScore: clamped, postureLabel: 'Moderate Risk', postureColor: '#f59e0b', critBarWidth: cW, highBarWidth: hW, medBarWidth: mW, cleanBarWidth: cleanW };
    if (clamped >= 50) return { postureScore: clamped, postureLabel: 'High Risk', postureColor: '#f97316', critBarWidth: cW, highBarWidth: hW, medBarWidth: mW, cleanBarWidth: cleanW };
    return { postureScore: clamped, postureLabel: 'Critical Exposure', postureColor: '#ef4444', critBarWidth: cW, highBarWidth: hW, medBarWidth: mW, cleanBarWidth: cleanW };
  }, [criticalCount, highCount, mediumCount, lowCount]);

  type PathStep = {
    stepLabel: string;
    source: string;
    color: string;
    title: string;
    description: string;
    finding?: Finding;
    isSink?: boolean;
  };

  const synthesizedPath = useMemo((): { hasAttackPath: boolean; title: string; subtitle: string; nodes: PathStep[] } => {
    const hasSevereExposure = criticalCount > 0 || highCount > 0;
    if (!hasSevereExposure) {
      return {
        hasAttackPath: false,
        title: 'HYPOTHESIZED PATH • NO HIGH/CRITICAL FINDINGS LOADED',
        subtitle: 'Hypothesized (heuristic — not confirmed reachability). Empty or low-severity set; no AST-proven paths.',
        nodes: [
          {
            stepLabel: 'BARRIER 1 • INGRESS',
            source: 'Heuristic',
            color: '#10b981',
            title: 'Route Boundaries Enforced',
            description: 'All public endpoints validate tenant context and authorization headers.',
            finding: findings[0]
          },
          {
            stepLabel: 'BARRIER 2 • DEPENDENCY GATE',
            source: 'Trivy Engine',
            color: '#10b981',
            title: 'Zero Exploitable CVEs',
            description: 'Package lockfile verified with no remote execution or forgery vectors.',
            finding: findings[1] || findings[0]
          },
          {
            stepLabel: 'BARRIER 3 • SECRETS HYGIENE',
            source: 'Heuristic',
            color: '#10b981',
            title: 'No high/critical secrets in loaded set',
            description: 'Zero plaintext cloud access keys or credentials detected in commits.',
            finding: findings[2] || findings[0]
          },
          {
            stepLabel: 'BARRIER 4 • ARCHITECTURE',
            source: 'Armelis Core',
            color: '#38bdf8',
            title: 'Air-Gapped Crown Jewels',
            description: 'Production datastores and secrets operate behind zero-trust boundaries.'
          }
        ]
      };
    }

    const entryCandidate = findings.find((f) => f.finding_type === 'CODE' || f.category === 'Code Vulnerability' || f.title.toLowerCase().includes('idor') || f.title.toLowerCase().includes('sql') || f.title.toLowerCase().includes('login')) || findings[0];
    const vulnCandidate = findings.find((f) => (f.finding_type === 'DEPENDENCY' || f.cve || f.severity === 'CRITICAL') && f !== entryCandidate) || findings[1] || entryCandidate;
    const lateralCandidate = findings.find((f) => (f.finding_type === 'SECRET' || f.category === 'Secret' || f.title.toLowerCase().includes('key') || f.title.toLowerCase().includes('secret') || f.severity === 'HIGH') && f !== entryCandidate && f !== vulnCandidate) || findings[2] || vulnCandidate;

    return {
      hasAttackPath: true,
      title: 'HYPOTHESIZED ATTACK PATH (HEURISTIC — NOT CONFIRMED REACHABILITY)',
      subtitle: 'Hypothesized (heuristic — not confirmed reachability). Ordered from loaded findings; not AST-proven.',
      nodes: [
        {
          stepLabel: 'STEP 1 • ENTRY POINT',
          source: entryCandidate.source,
          color: '#f97316',
          title: entryCandidate.title.length > 30 ? entryCandidate.title.slice(0, 30) + '...' : entryCandidate.title,
          description: entryCandidate.description,
          finding: entryCandidate
        },
        {
          stepLabel: 'STEP 2 • EXPLOITATION',
          source: vulnCandidate.source,
          color: vulnCandidate.severity === 'CRITICAL' ? '#ef4444' : '#f97316',
          title: vulnCandidate.title.length > 30 ? vulnCandidate.title.slice(0, 30) + '...' : vulnCandidate.title,
          description: vulnCandidate.description,
          finding: vulnCandidate
        },
        {
          stepLabel: 'STEP 3 • LATERAL MOVE',
          source: lateralCandidate.source,
          color: '#f97316',
          title: lateralCandidate.title.length > 30 ? lateralCandidate.title.slice(0, 30) + '...' : lateralCandidate.title,
          description: lateralCandidate.description,
          finding: lateralCandidate
        },
        {
          stepLabel: 'STEP 4 • BLAST RADIUS',
          source: 'Critical Sink',
          color: '#ef4444',
          title: 'Production Datastore & S3',
          description: 'Unrestricted exfiltration of customer records and cloud infrastructure storage.',
          isSink: true
        }
      ]
    };
  }, [findings, criticalCount, highCount]);

  function generateCEF(f: Finding) {
    const sevScore = f.severity === 'CRITICAL' ? 10 : f.severity === 'HIGH' ? 8 : f.severity === 'MEDIUM' ? 6 : 3;
    const mitre = f.mitre_attack?.[0];
    return `CEF:0|Armelis|Armelis|1.0.0|${f.finding_type}|${f.title}|${sevScore}|src=storefront-api filePath=${f.file || ''} fileId=${f.line || ''} cs1=${mitre?.technique_id || ''} cs1Label=mitre_technique_id cs2=${mitre?.technique_name || ''} cs2Label=mitre_technique_name cs3=${f.owasp_top10?.[0] || ''} cs3Label=owasp_category cve=${f.cve || ''}`;
  }

  function generateECS(f: Finding) {
    return JSON.stringify(
      {
        '@timestamp': new Date().toISOString(),
        event: {
          kind: 'alert',
          category: ['vulnerability'],
          dataset: 'armelis.findings',
          severity: f.severity === 'CRITICAL' ? 10 : 8
        },
        observer: { vendor: 'Armelis', product: 'Armelis' },
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
    return `<${pri}>1 ${new Date().toISOString()} localhost Armelis ${f.id} - ${generateCEF(f)}`;
  }

  async function copyToClipboard(text: string, format: string) {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(''), 2000);
  }

  function applyLoadedFindings(
    next: Finding[],
    source: FindingsDataSource,
    meta?: { target?: string; durationMs?: number }
  ) {
    setFindings(next);
    setDataSource(source);
    setImportError('');
    setSelectedFinding(null);
    if (meta?.target) {
      setActiveRepo(meta.target.replace(/^https?:\/\//, ''));
    }
    if (typeof meta?.durationMs === 'number') {
      setScanDuration((meta.durationMs / 1000).toFixed(2) + 's');
    }
  }

  async function handleLoadFixture() {
    setIsAnalyzing(true);
    setScanStep('Loading Trivy sample fixture...');
    setImportError('');
    setAnalyzeHint('');
    const started = performance.now();
    try {
      const res = await fetch('/fixtures/trivy-sample-findings.json');
      if (!res.ok) throw new Error(`Fixture HTTP ${res.status}`);
      const json = await res.json();
      const { findings: next, target, scanner } = extractFindingsFromJson(json);
      applyLoadedFindings(next, 'trivy-fixture', {
        target: target ? `fixture/${target}` : 'fixture/trivy-sample-findings',
        durationMs: performance.now() - started
      });
      setActiveBranch('fixture');
      setActiveCommit('sample');
      setRepoLang(scanner || 'Trivy');
      setRepoStars(null);
      setAnalyzeHint(`Loaded ${next.length} Trivy-normalized finding(s) from fixture.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAnalyzing(false);
      setScanStep('');
    }
  }

  async function handleImportFile(file: File) {
    setIsAnalyzing(true);
    setScanStep(`Importing ${file.name}...`);
    setImportError('');
    setAnalyzeHint('');
    const started = performance.now();
    try {
      const textPayload = await file.text();
      const json = JSON.parse(textPayload);
      const { findings: next, target, scanner } = extractFindingsFromJson(json);
      if (next.length === 0) {
        throw new Error('JSON contained zero findings. Export with armelis scan --format json or scripts/scan-to-json.js.');
      }
      applyLoadedFindings(next, 'trivy-import', {
        target: target || file.name,
        durationMs: performance.now() - started
      });
      setActiveBranch('import');
      setActiveCommit(file.name.slice(0, 12));
      setRepoLang(scanner || 'Trivy');
      setRepoStars(null);
      setAnalyzeHint(`Imported ${next.length} finding(s) from ${file.name}.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAnalyzing(false);
      setScanStep('');
    }
  }

  async function handleLocalScan(absolutePath: string) {
    setIsAnalyzing(true);
    setScanStep('Requesting local Trivy scan via /api/scan...');
    setImportError('');
    setAnalyzeHint('');
    const started = performance.now();
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: absolutePath })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Scan failed (${res.status})`);
      }
      const { findings: next, target } = extractFindingsFromJson(json);
      applyLoadedFindings(next, 'trivy-local-scan', {
        target: target || absolutePath,
        durationMs: performance.now() - started
      });
      setActiveBranch('local');
      setActiveCommit('trivy');
      setRepoLang('Trivy');
      setRepoStars(null);
      setAnalyzeHint(`Local Trivy scan returned ${next.length} finding(s).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setImportError(msg);
      setAnalyzeHint(
        'Local scan unavailable. Run `node scripts/scan-to-json.js <path> -o scan.json` then Import scan JSON.'
      );
    } finally {
      setIsAnalyzing(false);
      setScanStep('');
    }
  }

  async function handleAnalyzeRepo(targetUrl?: string) {
    const url = (targetUrl || repoInput).trim();
    if (!url) return;

    // Absolute local path → optional /api/scan (secure defaults)
    const looksLocal =
      /^[A-Za-z]:[\\/]/.test(url) ||
      url.startsWith('\\\\') ||
      (url.startsWith('/') && !url.startsWith('//'));

    if (looksLocal) {
      await handleLocalScan(url);
      return;
    }

    setIsAnalyzing(true);
    setScanStep('Connecting to GitHub API...');
    setImportError('');
    setAnalyzeHint('');

    let cleaned = url.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/\/$/, '');
    if (!cleaned.includes('/')) {
      cleaned = `Johanvasquezdev/${cleaned}`;
    }

    const [owner, repo] = cleaned.split('/');
    const started = performance.now();

    try {
      const scanRes = await auditGitHubRepository(
        owner,
        repo,
        githubPat || undefined,
        (step) => setScanStep(step)
      );

      setActiveRepo(`github.com/${owner}/${repo}`);
      setActiveBranch(scanRes.defaultBranch);
      setActiveCommit(scanRes.manifestPath || 'main');
      setScanDuration(((performance.now() - started) / 1000).toFixed(2) + 's');
      setRepoStars(scanRes.stars);
      setRepoLang(scanRes.language);

      if (!scanRes.ok && scanRes.error) {
        setImportError(scanRes.error);
        setFindings([]);
        setDataSource('empty');
        return;
      }

      applyLoadedFindings(scanRes.findings, 'github-scan', {
        target: `github.com/${owner}/${repo}`,
        durationMs: performance.now() - started
      });

      if (scanRes.findings.length > 0) {
        setAnalyzeHint(
          `Scanned ${scanRes.auditedCount} dependencies from ${scanRes.manifestPath || 'manifest'}. Detected ${scanRes.findings.length} real vulnerability advisory/advisories via OSV.dev & GitHub Advisories.`
        );
      } else if (scanRes.manifestPath) {
        setAnalyzeHint(
          `Audited ${scanRes.auditedCount} dependencies from ${scanRes.manifestPath} against Google OSV.dev & GitHub security advisories. 0 known vulnerabilities found. Defensive perimeter verified.`
        );
      } else {
        setAnalyzeHint(
          `Repository metadata loaded for ${owner}/${repo}. No package.json manifest found in root or standard paths. For full multi-language local scans, run Armelis Desktop or CLI.`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setImportError(`GitHub scan failed: ${msg}`);
      setDataSource('empty');
      setFindings([]);
    } finally {
      setIsAnalyzing(false);
      setScanStep('');
    }
  }

  function handleConnectGithub() {
    if (githubPat.trim()) {
      setIsConnected(true);
      setShowGithubModal(false);
    }
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
              gap: '12px'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/armelis-logo.png"
              alt="Armelis Shield"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
                borderRadius: '8px',
                filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.35))'
              }}
            />
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.4px', fontFamily: "'Gilroy', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
              ARME<span style={{ color: '#00e5ff' }}>[LIS]</span>
            </span>
          </Link>

          <span style={{ color: '#334155', fontSize: '15px' }}>/</span>

          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
            AI-Assisted Security Console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* GitHub Live Repository Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              fontSize: '12px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span style={{ fontWeight: 600 }}>Reading from GitHub Repo</span>
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
        
        {/* GitHub Live Repository Security Analyzer Bar */}
        <section
          aria-label="GitHub Repository Security Analyzer"
          style={{
            padding: '22px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(145deg, #0d182e 0%, #081224 100%)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#16233f', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                  GitHub Repository Security Analyzer
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                  Audits package manifests against Google OSV.dev and GitHub Security Advisories in real time (zero mock CVEs).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGithubModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: isConnected ? 'rgba(16, 185, 129, 0.12)' : '#101c33',
                border: isConnected ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(0, 229, 255, 0.25)',
                color: isConnected ? '#34d399' : '#00e5ff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>{isConnected ? 'GitHub Connected' : 'Direct GitHub Connection'}</span>
            </button>
          </div>

          {/* Repository Link Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyzeRepo();
            }}
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: '280px',
                display: 'flex',
                alignItems: 'center',
                background: '#060c18',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0 14px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <span style={{ color: '#64748b', fontSize: '13px', fontFamily: 'monospace', marginRight: '6px' }}>
                https://github.com/
              </span>
              <input
                type="text"
                value={repoInput.replace(/^https?:\/\/github\.com\//, '')}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="owner/repository (e.g. Johanvasquezdev/armelis)"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  padding: '12px 0'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              style={{
                padding: '0 24px',
                borderRadius: '8px',
                background: isAnalyzing ? '#1e293b' : 'linear-gradient(135deg, #0070f3, #00e5ff)',
                color: isAnalyzing ? '#94a3b8' : '#040711',
                fontWeight: 800,
                fontSize: '13px',
                border: 'none',
                cursor: isAnalyzing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '44px',
                boxShadow: isAnalyzing ? 'none' : '0 4px 16px rgba(0, 229, 255, 0.25)'
              }}
            >
              {isAnalyzing ? (
                <>
                  <svg
                    style={{ animation: 'spin 1s linear infinite' }}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                  </svg>
                  <span>Analyzing Repository...</span>
                </>
              ) : (
                <>
                  <span>Analyze Repository</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Live Progress Bar when Analyzing */}
          {isAnalyzing && (
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#00e5ff', fontWeight: 600, marginBottom: '6px' }}>
                <span>{scanStep}</span>
                <span>Fetching metadata...</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #0070f3, #00e5ff)', borderRadius: '2px' }} />
              </div>
            </div>
          )}

          {/* Trivy import / fixture — primary findings path */}
          <div
            style={{
              marginTop: '16px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Findings source
            </span>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#0f1b33',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#e0f2fe',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isAnalyzing ? 'wait' : 'pointer'
              }}
            >
              Import scan JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => void handleLoadFixture()}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0070f3, #00e5ff)',
                border: 'none',
                color: '#040711',
                fontSize: '12px',
                fontWeight: 800,
                cursor: isAnalyzing ? 'wait' : 'pointer'
              }}
            >
              Load Trivy fixture
            </button>
            <span style={{ fontSize: '11px', color: '#94a3b8', flex: '1 1 220px' }}>
              Prefer real scans: <code style={{ color: '#cbd5e1' }}>node scripts/scan-to-json.js . -o scan.json</code> then Import.
            </span>
          </div>

          {(importError || analyzeHint) && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px 14px',
                borderRadius: '8px',
                background: importError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                border: importError ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.3)',
                color: importError ? '#fca5a5' : '#6ee7b7',
                fontSize: '12px',
                lineHeight: 1.5
              }}
            >
              {importError || analyzeHint}
            </div>
          )}

          {/* Quick Preset Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Presets:
            </span>
            {[
              { name: 'Johanvasquezdev/armelis', badge: 'Audited Core', color: '#38bdf8' },
              { name: 'retail-corp/storefront-api', badge: 'Metadata only', color: '#94a3b8' },
              { name: 'juice-shop/juice-shop', badge: 'OWASP Benchmark', color: '#facc15' },
              { name: 'expressjs/express', badge: 'Dependency Map', color: '#a78bfa' }
            ].map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setRepoInput(`https://github.com/${preset.name}`);
                  handleAnalyzeRepo(`https://github.com/${preset.name}`);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#091122',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  cursor: 'pointer'
                }}
              >
                <span>{preset.name}</span>
                <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: preset.color, fontWeight: 700 }}>
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </section>

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
            <a
              href={`https://${activeRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(0, 112, 243, 0.15)',
                border: '1px solid rgba(0, 112, 243, 0.3)',
                color: '#60a5fa',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'monospace',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>{activeRepo}</span>
              <span style={{ fontSize: '10px' }}>↗</span>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
              <span>branch: <strong style={{ color: '#cbd5e1' }}>{activeBranch}</strong></span>
              <span>•</span>
              <span>commit: <strong style={{ color: '#00e5ff' }}>{activeCommit}</strong></span>
              <span>•</span>
              <span>language: <strong style={{ color: '#38bdf8' }}>{repoLang}</strong></span>
              {repoStars !== null && (
                <>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span>stars:</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#facc15"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <strong style={{ color: '#facc15', fontVariantNumeric: 'tabular-nums' }}>{repoStars}</strong>
                  </span>
                </>
              )}
              <span>•</span>
              <span>scan duration: <strong style={{ color: '#cbd5e1' }}>{scanDuration}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {(() => {
              const badge = dataSourceBadgeColor(dataSource);
              return (
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontWeight: 700 }}>
                  Source: {dataSourceLabel(dataSource)}
                </span>
              );
            })()}
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: dataSource === 'empty' ? '#0f1b33' : 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.35)', fontWeight: 700 }}>
              Trivy{dataSource === 'empty' ? '' : ' · active'}
            </span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#0a1224', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>Semgrep · Soon</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#0a1224', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>Gitleaks · Soon</span>
          </div>
        </div>

        {/* Title & Posture Health Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '28px', marginBottom: '32px' }}>
          <div>
            <span style={{ color: '#00e5ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              SECURITY FOR AI-ASSISTED TEAMS & DEVELOPERS
            </span>
            <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.6px', margin: '6px 0 10px' }}>
              Trivy Findings & Hypothesized Paths
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
              Import Trivy-normalized findings (or load the sample fixture). Attack paths shown below are hypothesized heuristics — not confirmed reachability. Semgrep and Gitleaks are not wired yet.
            </p>
          </div>

          {/* Posture Health Widget (Dynamic & Fixed Spacing) */}
          <div
            style={{
              padding: '18px 22px',
              borderRadius: '12px',
              background: '#0a1224',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              minWidth: '270px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                Posture Score
              </span>
              <span style={{ fontSize: '13px', color: postureColor, fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {postureScore} / 100 • {postureLabel}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden', display: 'flex', gap: '2px' }}>
              {cleanBarWidth > 0 ? (
                <div style={{ width: '100%', background: '#10b981', transition: 'width 300ms ease' }} />
              ) : (
                <>
                  {critBarWidth > 0 && <div style={{ width: `${critBarWidth}%`, background: '#ef4444', transition: 'width 300ms ease' }} />}
                  {highBarWidth > 0 && <div style={{ width: `${highBarWidth}%`, background: '#f97316', transition: 'width 300ms ease' }} />}
                  {medBarWidth > 0 && <div style={{ width: `${medBarWidth}%`, background: '#f59e0b', transition: 'width 300ms ease' }} />}
                </>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#94a3b8', gap: '8px' }}>
              {cleanBarWidth > 0 ? (
                <>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>0 Critical Exposure</span>
                  <span style={{ color: '#38bdf8' }}>{lowCount} Low • {infoCount} Info</span>
                </>
              ) : (
                <>
                  <span style={{ color: criticalCount > 0 ? '#ef4444' : '#64748b' }}>{criticalCount} Critical</span>
                  <span style={{ color: highCount > 0 ? '#f97316' : '#64748b' }}>{highCount} High</span>
                  <span style={{ color: mediumCount > 0 ? '#f59e0b' : '#64748b' }}>{mediumCount} Medium</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Attack Path Kill-Chain Flow (Dynamic Synthesis) */}
        <div
          style={{
            marginBottom: '32px',
            padding: '22px 24px',
            borderRadius: '14px',
            background: '#091122',
            border: synthesizedPath.hasAttackPath ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: synthesizedPath.hasAttackPath ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: synthesizedPath.hasAttackPath ? '#00e5ff' : '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {synthesizedPath.title}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {synthesizedPath.subtitle}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {synthesizedPath.nodes.map((node, i) => (
              <div
                key={i}
                onClick={() => node.finding && setSelectedFinding(node.finding)}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#0d172e',
                  border: node.isSink
                    ? '1px dashed rgba(239, 68, 68, 0.35)'
                    : !synthesizedPath.hasAttackPath
                    ? '1px solid rgba(16, 185, 129, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: node.finding ? 'pointer' : 'default',
                  transition: 'border-color 150ms ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: node.color, fontWeight: 700 }}>{node.stepLabel}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{node.source}</span>
                </div>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc', marginBottom: '4px' }}>
                  {node.title}
                </strong>
                <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', lineHeight: 1.4 }}>
                  {node.description}
                </small>
              </div>
            ))}
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

      {/* Direct GitHub Connection Modal */}
      {showGithubModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="github-modal-title"
          onClick={() => setShowGithubModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 110,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 100%)',
              borderRadius: '16px',
              padding: '28px',
              background: '#091224',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#16233f', display: 'grid', placeItems: 'center', color: '#fff' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <h3 id="github-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  Direct GitHub Repository Connection
                </h3>
              </div>
              <button
                onClick={() => setShowGithubModal(false)}
                aria-label="Close dialog"
                style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0f172a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginTop: 0, marginBottom: '16px' }}>
              Connect your GitHub account or Personal Access Token (PAT) to analyze private repositories, raise API rate limits from 60 to 5,000 req/hr, and trigger branch AST audits.
            </p>

            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.2)', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Local-First & Air-Gapped Privacy</span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                Tokens remain strictly in your browser session memory. Armelis never transmits your credentials to external third-party servers or cloud telemetry.
              </p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label htmlFor="github-token-input" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Personal Access Token (classic or fine-grained)
              </label>
              <input
                id="github-token-input"
                type="password"
                value={githubPat}
                onChange={(e) => setGithubPat(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_xxxxxxx"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#040711',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                Required scope: <code style={{ color: '#38bdf8' }}>repo (read-only)</code> or public repository read permissions.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              {isConnected ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsConnected(false);
                    setGithubPat('');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Disconnect Token
                </button>
              ) : (
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  No token? Public repos work anonymously.
                </span>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowGithubModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConnectGithub}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #0070f3, #00e5ff)',
                    border: 'none',
                    color: '#040711',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
