'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { animate } from 'animejs';
import { gsap } from 'gsap';
import { Button } from '../components/ui/button';

import { useState } from 'react';

const findings = [
  ['01', 'Public endpoint', 'GET /orders/:id'],
  ['02', 'Auth check missing', 'Potential exposure'],
  ['03', 'Customer data', 'Orders database']
];

function BrandWordmark({ large = false, theme = 'cold' }: { large?: boolean; theme?: 'cold' | 'warm' }) {
  const isWarm = theme === 'warm';
  return (
    <span
      className="brand-identity-lockup"
      role="img"
      aria-label="Armelis"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: large ? '16px' : '14px'
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isWarm ? '/armelis-logo-warm.png' : '/armelis-logo.png'}
        alt={isWarm ? 'Armelis Warm Protective Shield' : 'Armelis Cold Analytical Shield'}
        style={{
          width: large ? '64px' : '46px',
          height: large ? '64px' : '46px',
          objectFit: 'contain',
          borderRadius: '8px',
          filter: isWarm ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.35))' : 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.35))',
          transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />
      <span
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: large ? '44px' : '32px',
          fontWeight: 800,
          letterSpacing: '-0.3px',
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'baseline'
        }}
      >
        <span style={{ color: 'var(--ink, #ffffff)' }}>ARME</span>
        <span style={{ color: isWarm ? '#F59E0B' : 'var(--cyan, #00e5ff)', transition: 'color 200ms ease' }}>
          [LIS]
        </span>
      </span>
    </span>
  );
}

export default function HomePage() {
  const [theme, setTheme] = useState<'cold' | 'warm'>('cold');
  const [installTab, setInstallTab] = useState<'cli' | 'desktop' | 'docker'>('cli');
  const [cliShell, setCliShell] = useState<'powershell' | 'cmd' | 'bash'>('powershell');
  const [desktopMode, setDesktopMode] = useState<'installer' | 'source'>('installer');
  const [copiedSnippet, setCopiedSnippet] = useState<string>('');

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(''), 2000);
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-copy > *',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.scan-console',
        { y: 28, opacity: 0, rotateX: 5 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, delay: 0.18, ease: 'power3.out' }
      );
      gsap.to('.radar-sweep', { rotate: 360, duration: 7, repeat: -1, ease: 'none' });
      animate('.path-node', {
        translateY: [12, 0],
        opacity: [0, 1],
        delay: 150,
        duration: 650,
        ease: 'out(4)'
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="armelis-site" data-theme={theme}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      
      {/* Site Header */}
      <header className="site-header shell">
        <Link className="brand-lockup" href="/" aria-label="Home">
          <BrandWordmark theme={theme} />
        </Link>
        <nav aria-label="Primary navigation">
          {/* Apple HIG Segmented Theme Control */}
          <div className="web-theme-control" role="group" aria-label="Theme mode switcher">
            <button
              type="button"
              className={`web-theme-btn ${theme === 'cold' ? 'active' : ''}`}
              onClick={() => setTheme('cold')}
              title="Cold analytical mode"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>Cold analytical mode</span>
            </button>
            <button
              type="button"
              className={`web-theme-btn ${theme === 'warm' ? 'active' : ''}`}
              onClick={() => setTheme('warm')}
              title="Warm protective"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Warm protective</span>
            </button>
          </div>

          <Link href="/dashboard" style={{ color: 'var(--cyan)', fontWeight: 700 }}>
            Live Console ↗
          </Link>
          <Link href="#platforms">CLI & Desktop</Link>
          <Link href="#install">Activation & Download</Link>
          <Link href="#how-it-works">How it works</Link>
          <Link href="#open-source">Open Source</Link>
          <Button asChild size="sm">
            <a
              href="https://github.com/Johanvasquezdev/armelis"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub <span>↗</span>
            </a>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            Application security for AI-assisted teams <span className="eyebrow-rule" />
          </p>
          <h1 id="hero-title">
            {theme === 'cold' ? (
              <>Find the path.<br /><em>Fix the risk.</em></>
            ) : (
              <>Armor the code.<br /><em>Sever the chain.</em></>
            )}
          </h1>
          <p className="hero-lede">
            {theme === 'cold'
              ? 'Armelis correlates your code, dependencies, containers, and configurations to show what could actually happen—and what choke point to sever first.'
              : 'Armelis provides active defensive armor, turning chaotic security alerts into deterministic choke points that protect your crown jewels.'}
          </p>
          <div className="hero-actions">
            <Button asChild>
              <Link href="/dashboard">
                Open Live Console <span>→</span>
              </Link>
            </Button>
            <a
              className="text-link"
              href="https://github.com/Johanvasquezdev/armelis"
              target="_blank"
              rel="noreferrer"
            >
              Clone on GitHub (MIT) <span>↗</span>
            </a>
          </div>
          <p className="hero-proof">
            <span>EVIDENCE / PATH / FIX</span>
            <i /> Works with AI-assisted workflows <i /> Rescan to verify
          </p>
        </div>

        {/* 3D Console Perspective (Blender Motion Style) */}
        <div className="hero-visual" aria-label="Sample Armelis attack path visualization">
          <div className="console-orbit orbit-a" />
          <div className="console-orbit orbit-b" />
          <div className="radar-sweep" />
          <div className="scan-console">
            <div className="console-top">
              <span className="live-dot" /> sample scan / storefront-api <b>READY</b>
            </div>
            <div className="console-body">
              <div className="console-repo">
                <div className="repo-mark">⌘</div>
                <div>
                  <strong>storefront-api</strong>
                  <small>connected repository</small>
                </div>
                <span>CONNECTED</span>
              </div>
              <div className="console-label">SYNTHESIZED RISK STORY</div>
              <div className="path-flow">
                {findings.map(([index, title, detail], i) => (
                  <div className="path-segment" key={index}>
                    <div className={`path-node node-${i + 1}`}>
                      <span>{index}</span>
                      <strong>{title}</strong>
                      <small>{detail}</small>
                    </div>
                    {i < findings.length - 1 && <div className="path-connector" />}
                  </div>
                ))}
              </div>
              <div className="fix-callout">
                <div className="fix-spark">✦</div>
                <div>
                  <span>FIX FIRST</span>
                  <strong>Verify order.user_id matches authenticated session.</strong>
                  <p>One single authorization check breaks the entire exploit chain.</p>
                </div>
                <b>→</b>
              </div>
            </div>
          </div>
          <span className="visual-caption caption-a">01 / AST + Secrets Correlated</span>
          <span className="visual-caption caption-b">02 / MITRE ATT&CK Mapped</span>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section shell story-section">
        <div className="section-intro">
          <p className="eyebrow">The difference</p>
          <h2>
            Your scanner found 18 things.<br />
            <em>Start with the one that matters.</em>
          </h2>
          <p>
            Armelis connects code, dependencies, containers, and configuration—then turns disconnected alerts into a concrete risk path your team can understand and remediate.
          </p>
        </div>
        <div className="steps">
          <article>
            <span>01</span>
            <h3>Connect evidence</h3>
            <p>Combine Trivy, Semgrep, and Gitleaks evidence in a unified schema.</p>
          </article>
          <article>
            <span>02</span>
            <h3>See the path</h3>
            <p>Follow the route from public internet entry to crown-jewel assets.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Fix and verify</h3>
            <p>Apply the smallest meaningful code change, then rescan to prove reduction.</p>
          </article>
        </div>
      </section>

      {/* Sample Scan Comparison */}
      <section id="sample-scan" className="section shell sample-section">
        <div className="section-intro split">
          <div>
            <p className="eyebrow">Sample scan / SOC triage</p>
            <h2>
              Path over<br />
              <em>pile.</em>
            </h2>
          </div>
          <p>
            Deterministic graph traversal cuts alert fatigue and eliminates wasted developer cycles.
          </p>
        </div>
        <div className="comparison">
          <div className="signal-column">
            <span className="column-label">BEFORE / UNFILTERED ALERT FATIGUE</span>
            <p>
              <i className="signal orange" /> Dependency alert <small>medium</small>
            </p>
            <p>
              <i className="signal orange" /> Missing auth check <small>high</small>
            </p>
            <p>
              <i className="signal blue" /> Exposed debug route <small>low</small>
            </p>
            <p>
              <i className="signal orange" /> Secret in config <small>high</small>
            </p>
          </div>
          <div className="comparison-beam">→</div>
          <div className="signal-column resolved">
            <span className="column-label">AFTER / ROOT CAUSE RESOLVED</span>
            <div className="resolved-row">
              <span>✓</span>
              <div>
                <strong>Authorization check enforced</strong>
                <small>Attack path broken. Blast radius reduced to zero.</small>
              </div>
            </div>
            <div className="risk-direction">
              <span>RISK REDUCTION</span>
              <b>100% ELIMINATED</b>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="section shell feature-section">
        <div className="section-intro split">
          <div>
            <p className="eyebrow">Built for modern development</p>
            <h2>
              Security in<br />
              <em>your workflow.</em>
            </h2>
          </div>
          <p>
            Evidence first. Clear tradeoffs. Useful whether you code by hand, with AI, or across a full engineering team.
          </p>
        </div>
        <div className="feature-grid">
          <article>
            <span style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>PRIORITIZE</span>
            <h3>Know what matters</h3>
            <p>Skip the wall of alerts. See the risks that can actually change the outcome.</p>
          </article>
          <article>
            <span style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>CORRELATE</span>
            <h3>Follow the path</h3>
            <p>Connect your endpoint, weakness, service, and sensitive data in plain English.</p>
          </article>
          <article>
            <span style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>REMEDIATE</span>
            <h3>Fix first with AI prompts</h3>
            <p>Get the smallest set of changes that meaningfully makes your app safer, with copy-pasteable prompts for Cursor, Copilot, and Claude Code.</p>
          </article>
          <article>
            <span style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>VERIFY</span>
            <h3>Rescan with confidence</h3>
            <p>Verify the risk went down with deterministic rescanning instead of hoping the patch worked.</p>
          </article>
        </div>
      </section>

      {/* CLI vs Desktop Platforms Section */}
      <section id="platforms" className="section shell platforms-section">
        <div className="section-intro split">
          <div>
            <p className="eyebrow">TWO MODALITIES • ONE DEFENSE MATRIX</p>
            <h2>
              Armelis CLI &amp;<br />
              <em>Desktop Command.</em>
            </h2>
          </div>
          <p>
            Automate high-speed choke-point verification in headless CI/CD pipelines, or command an interactive visual attack-path HUD on your local workstation.
          </p>
        </div>

        <div className="platform-grid">
          {/* Card 1: Armelis CLI */}
          <div className="platform-card">
            <div className="platform-top">
              <span className="platform-badge">⚡ HEADLESS &amp; CI/CD NATIVE</span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>v0.1.0 • Node / Rust</span>
            </div>
            <h3 className="platform-title">Armelis CLI</h3>
            <p className="platform-desc">
              Deterministic, terminal-first attack-path intelligence designed for developers, automated GitHub Actions, Docker builds, and SecOps triage.
            </p>
            <ul className="platform-features">
              <li>
                <i>✓</i>
                <span><strong>3D Block Shadow Typography:</strong> Terminal aesthetic with live Git branch detection, current directory path, and UTC telemetry.</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>Lateral Hop Tracing (<code>armelis trace</code>):</strong> Correlates entry points, vulnerable dependencies, and database credentials into ordered attack chains.</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>1-Click Choke-Point Severance (<code>armelis break</code>):</strong> Computes the minimal code or container policy change needed to neutralize 100% of exploit reachability.</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>Direct SIEM Streaming:</strong> Emits formatted events to Splunk, Elasticsearch, QRadar, and Wazuh in CEF, ECS, and Syslog RFC 5424.</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>Dual Visual Modes:</strong> Toggle between <code>--cold</code> (Cold analytical mode) and <code>--warm</code> (Warm protective armor).</span>
              </li>
            </ul>

            <div className="platform-preview-terminal">
              <div>$ armelis scan . --cold</div>
              <div style={{ color: '#94a3b8' }}>● Scanners: vuln, misconfig, secret, license</div>
              <div style={{ color: 'var(--green)' }}>✔ Analysis Complete: 0 critical choke points active</div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button asChild size="sm">
                <a href="#install" onClick={() => { setInstallTab('cli'); setCliShell('powershell'); }}>
                  Install via PowerShell <span>→</span>
                </a>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <a href="#install" onClick={() => { setInstallTab('cli'); setCliShell('cmd'); }}>
                  Command Prompt (CMD) <span>→</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Card 2: Armelis Desktop App */}
          <div className="platform-card" style={{ borderColor: 'var(--cyan)' }}>
            <div className="platform-top">
              <span className="platform-badge" style={{ background: 'var(--navy)', color: 'var(--cyan)', borderColor: 'var(--cyan)' }}>
                🛡 TACTICAL COMMAND HUD
              </span>
              <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>Tauri 2 + Rust Native</span>
            </div>
            <h3 className="platform-title">Armelis Desktop</h3>
            <p className="platform-desc">
              Tactical AppSec command center running locally inside an isolated native sandbox. Near-zero memory footprint (&lt;40MB RAM), zero electron bloat.
            </p>
            <ul className="platform-features">
              <li>
                <i>✓</i>
                <span><strong>Attack Path Reachability Visualizer:</strong> Live interactive topology linking Public Ingress ➔ Vulnerability Choke Point ➔ Crown Jewel Assets.</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>Windows Custom Installer:</strong> Dedicated setup wizard with high-DPI vector icons, automatic PATH registration, and right-click "Scan with Armelis" explorer context menu.</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>Interactive Severance Simulator:</strong> Test how upgrading a single dependency severs the entire lateral exploit trajectory in real-time.</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>Perimeter Threat HUD:</strong> Monospace gauges for Reachability Exposure Index (84% ➔ 0%), Choke-Point Severance Ratio, and MITRE ATT&amp;CK coverage.</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>Atmospheric Canvas Transformation:</strong> Dynamic radial lighting and grid textures shift automatically between Cold analytical and Warm protective modes.</span>
              </li>
            </ul>

            <div className="platform-preview-terminal" style={{ color: 'var(--ink)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#ef4444' }}>[ 🌐 INGRESS ]</span>
                <span>──▶</span>
                <span style={{ color: '#f59e0b' }}>[ ⚡ CHOKE POINT ]</span>
                <span>──▶</span>
                <span style={{ color: '#10b981' }}>[ 💎 ASSET ]</span>
              </div>
              <div style={{ color: 'var(--cyan)', fontSize: '11px' }}>
                Simulate Severance: 1 Action Cuts 100% of Reachability Paths
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button asChild size="sm">
                <a href="#install" onClick={() => { setInstallTab('desktop'); setDesktopMode('installer'); }}>
                  Windows Installer (.exe) <span>→</span>
                </a>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <a href="#install" onClick={() => { setInstallTab('desktop'); setDesktopMode('source'); }}>
                  Compile from Source <span>→</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 100% Free & Open Source Section (Replaces Commercial Pricing) */}
      <section id="open-source" className="section shell pricing-section">
        <div className="section-intro">
          <p className="eyebrow">FOSS Commitment</p>
          <h2>
            100% Free.<br />
            <em>100% Open Source.</em>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>
            No paywalls, no seat limits, and no vendor lock-in. Armelis is published under the permissive MIT License for developers, security researchers, and SOC analysts worldwide.
          </p>
        </div>
        <div className="price-grid">
          <article className="price-featured" style={{ border: '1px solid rgba(0, 229, 255, 0.35)' }}>
            <span style={{ color: '#00e5ff', fontWeight: 800 }}>COMMUNITY EDITION</span>
            <strong style={{ fontSize: '42px', color: '#fff' }}>Free Forever</strong>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
              Full AST correlation, MITRE ATT&CK mapping, SIEM exports (CEF/ECS), and Tauri 2 desktop client.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>✓ Permissive MIT License</span>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>✓ Air-Gapped / Offline Local Execution</span>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>✓ Commercial & Enterprise Friendly</span>
            </div>
            <Link href="/dashboard" style={{ marginTop: '16px', color: '#00e5ff', fontWeight: 700 }}>
              Launch Dashboard →
            </Link>
          </article>

          <article style={{ border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(7, 14, 28, 0.65)' }}>
            <span style={{ color: '#94a3b8', fontWeight: 800 }}>SELF-HOSTED / INFRA</span>
            <strong style={{ fontSize: '42px', color: '#f8fafc' }}>Deploy Anywhere</strong>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
              Run natively in Docker, GitHub Actions, GitLab CI, or on your internal Kubernetes / VMware cluster.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>✓ Zero Cloud Phone-Home</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>✓ Dockerfile & Compose Included</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>✓ PostgreSQL + pgvector Ready</span>
            </div>
            <a
              href="https://github.com/Johanvasquezdev/armelis"
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: '16px', color: '#38bdf8', fontWeight: 700 }}
            >
              View GitHub Documentation →
            </a>
          </article>
        </div>
      </section>

      {/* Activation & Download Section */}
      <section id="install" className="section shell install-section">
        <div className="section-intro">
          <p className="eyebrow">DEPLOYMENT &amp; ACTIVATION GUIDE</p>
          <h2>
            Get Armed in<br />
            <em>Under 60 Seconds.</em>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '10px' }}>
            Armelis is 100% free and open-source under the MIT license. Everything runs strictly on your local machine with isolated process boundaries. Choose your activation path:
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="install-tab-bar" role="tablist">
          <button
            type="button"
            className={`install-tab-btn ${installTab === 'cli' ? 'active' : ''}`}
            onClick={() => setInstallTab('cli')}
          >
            ⌨️ Armelis CLI (Terminal)
          </button>
          <button
            type="button"
            className={`install-tab-btn ${installTab === 'desktop' ? 'active' : ''}`}
            onClick={() => setInstallTab('desktop')}
          >
            🖥️ Armelis Desktop (Tauri 2)
          </button>
          <button
            type="button"
            className={`install-tab-btn ${installTab === 'docker' ? 'active' : ''}`}
            onClick={() => setInstallTab('docker')}
          >
            🐳 CI/CD &amp; Docker Pipeline
          </button>
        </div>

        {/* Tab 1: CLI */}
        {installTab === 'cli' && (
          <div className="install-card">
            {/* Shell Selector Subtabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                  Command Shell Selector
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                  Select your terminal shell to copy optimized installation and execution commands:
                </p>
              </div>
              <div className="install-subtab-bar" role="group" aria-label="Command shell selector">
                <button
                  type="button"
                  className={`install-subtab-btn ${cliShell === 'powershell' ? 'active' : ''}`}
                  onClick={() => setCliShell('powershell')}
                >
                  <span>🟦</span> PowerShell (Windows)
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${cliShell === 'cmd' ? 'active' : ''}`}
                  onClick={() => setCliShell('cmd')}
                >
                  <span>⬛</span> Command Prompt (CMD)
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${cliShell === 'bash' ? 'active' : ''}`}
                  onClick={() => setCliShell('bash')}
                >
                  <span>🟧</span> Bash / Zsh (macOS &amp; Linux)
                </button>
              </div>
            </div>

            {/* PowerShell Instructions */}
            {cliShell === 'powershell' && (
              <>
                <div className="install-step">
                  <h4><span>1</span> Global Installation in PowerShell</h4>
                  <p>Execute in Windows PowerShell (or PowerShell 7+ / <code>pwsh</code>):</p>
                  <div className="install-code-box">
                    <code>npm install -g armelis</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('npm install -g armelis', 'ps-install')}
                    >
                      {copiedSnippet === 'ps-install' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="shell-command-note">
                    <span>💡</span> Zero-install alternative: Run instantly without global installation via <code>npx armelis scan . --cold</code>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>2</span> Verify Binary &amp; Environment PATH</h4>
                  <p>Check the active version and telemetry status:</p>
                  <div className="install-code-box">
                    <code>armelis --version</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis --version', 'ps-version')}
                    >
                      {copiedSnippet === 'ps-version' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>3</span> Execute Scan in PowerShell</h4>
                  <p>Scan the current repository using the Cold analytical theme:</p>
                  <div className="install-code-box">
                    <code>armelis scan . --cold</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis scan . --cold', 'ps-scan')}
                    >
                      {copiedSnippet === 'ps-scan' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="shell-command-note">
                    <span>📂</span> PowerShell absolute path example: <code>armelis scan "$HOME\Documents\YourRepo" --cold</code>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>4</span> Calculate Choke Points &amp; Copy AI Prompt</h4>
                  <p>Pinpoint the exact lateral choke point and generate the ready-to-paste prompt for Cursor/Copilot:</p>
                  <div className="install-code-box">
                    <code>armelis break .</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis break .', 'ps-break')}
                    >
                      {copiedSnippet === 'ps-break' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* CMD Instructions */}
            {cliShell === 'cmd' && (
              <>
                <div className="install-step">
                  <h4><span>1</span> Global Installation in Command Prompt (CMD)</h4>
                  <p>Open <code>cmd.exe</code> and install the Armelis CLI globally:</p>
                  <div className="install-code-box">
                    <code>npm install -g armelis</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('npm install -g armelis', 'cmd-install')}
                    >
                      {copiedSnippet === 'cmd-install' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>2</span> Verify Installation in CMD</h4>
                  <p>Check that Windows detects the executable and display the banner:</p>
                  <div className="install-code-box">
                    <code>armelis --help</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis --help', 'cmd-help')}
                    >
                      {copiedSnippet === 'cmd-help' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>3</span> Run Scan with Windows Environment Paths</h4>
                  <p>Scan your current directory or target a path using <code>%USERPROFILE%</code>:</p>
                  <div className="install-code-box">
                    <code>armelis scan "%USERPROFILE%\Documents\YourProject" --cold</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis scan "%USERPROFILE%\\Documents\\YourProject" --cold', 'cmd-scan')}
                    >
                      {copiedSnippet === 'cmd-scan' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="shell-command-note">
                    <span>💡</span> For current directory in CMD: <code>armelis scan . --cold</code>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>4</span> Neutralize Choke Points (Warm Protective Mode)</h4>
                  <p>Run choke-point severance analysis in CMD with the warm defensive theme:</p>
                  <div className="install-code-box">
                    <code>armelis break . --warm</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis break . --warm', 'cmd-break')}
                    >
                      {copiedSnippet === 'cmd-break' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Bash / Linux / macOS Instructions */}
            {cliShell === 'bash' && (
              <>
                <div className="install-step">
                  <h4><span>1</span> Global Installation (macOS &amp; Linux)</h4>
                  <p>Install via npm with automatic POSIX symlink creation:</p>
                  <div className="install-code-box">
                    <code>npm install -g armelis</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('npm install -g armelis', 'bash-install')}
                    >
                      {copiedSnippet === 'bash-install' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>2</span> Scan &amp; Stream CEF / ECS Events</h4>
                  <p>Scan repository and pipe standardized Common Event Format telemetry to disk or SIEM:</p>
                  <div className="install-code-box">
                    <code>armelis scan . --cold --format cef &gt; findings.cef</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis scan . --cold --format cef > findings.cef', 'bash-scan')}
                    >
                      {copiedSnippet === 'bash-scan' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>3</span> Lateral Hop Tracing</h4>
                  <p>Correlate ingress points, dependencies, and database targets into an attack trajectory:</p>
                  <div className="install-code-box">
                    <code>armelis trace .</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis trace .', 'bash-trace')}
                    >
                      {copiedSnippet === 'bash-trace' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Desktop */}
        {installTab === 'desktop' && (
          <div>
            {/* Desktop Mode Sub-tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                  Desktop Client Deployment Mode
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                  Choose between the pre-configured Windows Custom Setup Wizard or building from native Rust source:
                </p>
              </div>
              <div className="install-subtab-bar" role="group" aria-label="Desktop deployment mode">
                <button
                  type="button"
                  className={`install-subtab-btn ${desktopMode === 'installer' ? 'active' : ''}`}
                  onClick={() => setDesktopMode('installer')}
                >
                  <span>📦</span> Windows Custom Installer (.exe / .msi)
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${desktopMode === 'source' ? 'active' : ''}`}
                  onClick={() => setDesktopMode('source')}
                >
                  <span>🛠️</span> Run from Source (Tauri 2)
                </button>
              </div>
            </div>

            {/* Mode 1: Custom Windows Installer Showcase */}
            {desktopMode === 'installer' && (
              <div className="installer-showcase-box">
                <div className="installer-header">
                  <div className="installer-header-left">
                    <div className="installer-logo-badge">
                      <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                        <polygon points="18,3 33,10 33,26 18,33 3,26 3,10" stroke="var(--cyan)" strokeWidth="2" fill="rgba(0, 229, 255, 0.12)" />
                        <circle cx="18" cy="18" r="6" stroke="var(--cyan)" strokeWidth="1.8" />
                        <line x1="18" y1="3" x2="18" y2="12" stroke="var(--cyan)" strokeWidth="1.5" />
                        <line x1="18" y1="24" x2="18" y2="33" stroke="var(--cyan)" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="installer-title-box">
                      <h3>Armelis Tactical Command — Windows Setup Wizard</h3>
                      <p>Custom-branded native installer with vector icons, logos, context menu hooks &amp; automatic PATH</p>
                    </div>
                  </div>
                  <div className="installer-badge-tag">
                    <span>✨</span> ROADMAP &amp; EARLY ACCESS
                  </div>
                </div>

                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
                  The dedicated Armelis Windows Installer (<code>Armelis-Setup-x64.exe</code> &amp; <code>.msi</code>) provides a seamless out-of-the-box installation experience for workstations, developers, and enterprise security analysts:
                </p>

                {/* 4 Feature Highlights */}
                <div className="installer-features-grid">
                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">🎨</div>
                    <div className="installer-feat-content">
                      <strong>Custom Visual Identity &amp; Icons</strong>
                      <p>Handcrafted high-resolution multi-size <code>.ico</code> icons (16px to 512px) for Windows Explorer, Start Menu, taskbar pinning, and a branded dark cold-cyan wizard window.</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">🖱️</div>
                    <div className="installer-feat-content">
                      <strong>Explorer Context Menu ("Scan with Armelis")</strong>
                      <p>Deep Windows Explorer shell integration: Right-click any repository folder or drive and click <em>"Scan with Armelis"</em> to launch immediate attack-path graph traversal.</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">⚡</div>
                    <div className="installer-feat-content">
                      <strong>Automated System PATH Registration</strong>
                      <p>Automatically configures Windows User &amp; System <code>PATH</code> variables. Use the <code>armelis</code> CLI instantly from any new PowerShell or CMD terminal without manual setup.</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">🛡️</div>
                    <div className="installer-feat-content">
                      <strong>Air-Gapped &amp; Sub-40MB RAM Footprint</strong>
                      <p>Built with native Rust and Tauri 2. No bloated Electron runtimes. Consumes &lt;40MB of RAM and executes 100% locally with zero cloud phone-home.</p>
                    </div>
                  </div>
                </div>

                {/* Download Actions & Specs */}
                <div className="installer-actions-wrap">
                  <div className="installer-buttons-group">
                    <a
                      href="https://github.com/Johanvasquezdev/armelis/releases"
                      target="_blank"
                      rel="noreferrer"
                      className="installer-primary-btn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.851" />
                      </svg>
                      Download Armelis-Setup-x64.exe
                    </a>
                    <a
                      href="https://github.com/Johanvasquezdev/armelis/releases"
                      target="_blank"
                      rel="noreferrer"
                      className="installer-secondary-btn"
                    >
                      <span>📦</span> Download Portable .zip
                    </a>
                  </div>

                  <div className="installer-specs-pill">
                    <span>💾 ~12.4 MB</span>
                    <span>•</span>
                    <span>🪟 Windows 10 / 11 (x64)</span>
                    <span>•</span>
                    <span>🔐 SHA-256 Verified</span>
                    <span>•</span>
                    <span>⚖️ MIT License</span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>ℹ️</span>
                  <span>
                    The custom packaging pipeline is currently scheduled for deployment. In the meantime, you can launch or compile the Desktop client immediately from source using the tab above.
                  </span>
                </div>
              </div>
            )}

            {/* Mode 2: Build from Source */}
            {desktopMode === 'source' && (
              <div className="install-card">
                <div className="install-step">
                  <h4><span>1</span> Clone Repository</h4>
                  <p>Clone the open-source Armelis repository to your machine:</p>
                  <div className="install-code-box">
                    <code>git clone https://github.com/Johanvasquezdev/armelis.git armelis</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('git clone https://github.com/Johanvasquezdev/armelis.git armelis', 'desktop-clone')}
                    >
                      {copiedSnippet === 'desktop-clone' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>2</span> Launch Desktop App in Dev Mode</h4>
                  <p>Start Vite and the native Rust/Tauri 2 window with live HMR:</p>
                  <div className="install-code-box">
                    <code>cd armelis/apps/desktop &amp;&amp; npm install &amp;&amp; npm run tauri dev</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('cd armelis/apps/desktop && npm install && npm run tauri dev', 'desktop-run')}
                    >
                      {copiedSnippet === 'desktop-run' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>3</span> Compile Standalone Binary (.exe / .msi)</h4>
                  <p>Package an ultra-compact, air-gapped native executable with zero dependencies:</p>
                  <div className="install-code-box">
                    <code>npm run tauri build</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('npm run tauri build', 'desktop-build')}
                    >
                      {copiedSnippet === 'desktop-build' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Docker & CI/CD */}
        {installTab === 'docker' && (
          <div className="install-card">
            <div className="install-step">
              <h4><span>1</span> GitHub Actions Security Gate</h4>
              <p>Add deterministic choke-point scanning to your automated Pull Request pipeline:</p>
              <div className="install-code-box">
                <code>- name: Armelis Choke-Point Scan\n  run: npx armelis scan . --format cef &gt; findings.cef</code>
                <button
                  type="button"
                  className="install-copy-btn"
                  onClick={() => handleCopy('- name: Armelis Choke-Point Scan\n  run: npx armelis scan . --format cef > findings.cef', 'ci-github')}
                >
                  {copiedSnippet === 'ci-github' ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="install-step">
              <h4><span>2</span> Standalone Docker Container</h4>
              <p>Mount any local repository without installing Node or Rust:</p>
              <div className="install-code-box">
                <code>docker run --rm -v $(pwd):/repo ghcr.io/johanvasquezdev/armelis:latest scan /repo</code>
                <button
                  type="button"
                  className="install-copy-btn"
                  onClick={() => handleCopy('docker run --rm -v $(pwd):/repo ghcr.io/johanvasquezdev/armelis:latest scan /repo', 'ci-docker')}
                >
                  {copiedSnippet === 'ci-docker' ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Launch Buttons */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '36px' }}>
          <Button asChild>
            <Link href="/dashboard">
              Launch Live Console <span>→</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <a
              href="https://github.com/Johanvasquezdev/armelis"
              target="_blank"
              rel="noreferrer"
            >
              Star on GitHub ★
            </a>
          </Button>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer shell">
        <span>ARMELIS • APPLICATION SECURITY INTELLIGENCE</span>
        <span>100% FREE & OPEN SOURCE • MIT LICENSE</span>
        <span>DEVELOPED BY JOHAN VASQUEZ</span>
      </footer>
    </main>
  );
}
