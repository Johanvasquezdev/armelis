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

const videoChapters = [
  {
    id: 'cli-severance',
    title: 'Terminal Choke-Point Severance',
    duration: '0:58',
    badge: 'CLI COMMAND',
    desc: 'Rapid lateral hop tracing from public route to sensitive DB, terminating in 1-line choke point.',
    terminalLines: [
      { type: 'cmd', text: '$ armelis trace . --cold' },
      { type: 'dim', text: 'Ingesting 14 dependencies, 4 API controllers, 1 Dockerfile...' },
      { type: 'alert', text: '[!] EXPLOIT PATH DETECTED: GET /api/v1/orders/:id -> missing auth check -> DB' },
      { type: 'choke', text: '[★] CHOKE POINT ISOLATED: controllers/orders.ts:42 (Enforce tenant validation)' },
      { type: 'cmd', text: '$ armelis break .' },
      { type: 'success', text: '[✔] 100% EXPLOIT REACHABILITY ELIMINATED • Bedrock Security Active' }
    ]
  },
  {
    id: 'desktop-hud',
    title: 'Tactical Desktop Command HUD',
    duration: '1:24',
    badge: 'NATIVE TAURI 2',
    desc: 'Interactive node graph visualizer mapping public ingress to crown jewel assets in real-time.',
    terminalLines: [
      { type: 'cmd', text: '> armelis-desktop --mode tactical-hud --live-trace' },
      { type: 'dim', text: 'Initializing native Rust 2.0 window (<38MB memory footprint)...' },
      { type: 'alert', text: '[!] Attack Path Topology: Public Ingress -> CVE-2024-auth-bypass -> Production DB' },
      { type: 'choke', text: '[★] Simulating Choke-Point Severance on orders API...' },
      { type: 'success', text: '[✔] Threat Exposure Index: 84% ===> 0% [OPTIMAL DEFENSE]' },
      { type: 'dim', text: 'Radial atmosphere synced with Cold analytical mode.' }
    ]
  },
  {
    id: 'github-analyzer',
    title: 'Live GitHub Repository Analyzer',
    duration: '1:12',
    badge: 'WEB CONSOLE',
    desc: 'Remote repository ingestion, dynamic mathematical posture score, and 1-click AI prompt export.',
    terminalLines: [
      { type: 'cmd', text: 'GET https://api.github.com/repos/Johanvasquezdev/armelis' },
      { type: 'dim', text: 'Fetching manifest and dependency tree via GitHub REST API...' },
      { type: 'success', text: '[+] Posture Score Computed: 99 / 100 (Optimal Bedrock Defense)' },
      { type: 'dim', text: 'Verified Defensive Barriers: Auth (✓), Sanitize (✓), RateLimit (✓), Isolation (✓)' },
      { type: 'choke', text: '[★] Generating remediation prompt for Cursor, Copilot & Claude Code...' },
      { type: 'success', text: '[✔] AI Prompt ready to paste into IDE agent.' }
    ]
  },
  {
    id: 'siem-stream',
    title: 'Wazuh & Splunk SIEM Telemetry',
    duration: '0:45',
    badge: 'ENTERPRISE SOC',
    desc: 'Standardized Common Event Format (CEF) and Elastic Common Schema (ECS) direct streaming.',
    terminalLines: [
      { type: 'cmd', text: '$ armelis scan . --format cef --stream syslog://soc.internal:514' },
      { type: 'dim', text: 'Formatting events to RFC 5424 Syslog and Common Event Format (CEF)...' },
      { type: 'success', text: '[+] WAZUH AGENT: CONNECTED (Active Rule 100204 Triggered)' },
      { type: 'success', text: '[+] SPLUNK HEC: 200 OK (Event ID: ARM-8941204)' },
      { type: 'success', text: '[+] ELASTICSEARCH: Indexed into appsec-armelis-2026' },
      { type: 'dim', text: '[✔] Zero external tracking or phone-home telemetry guaranteed.' }
    ]
  }
];

const galleryCaptures = [
  {
    id: 'desktop-hud',
    title: 'Tactical Desktop Command HUD',
    subtitle: 'Interactive reachability topology visualizer',
    badge: 'DESKTOP APP • TAURI 2',
    imageSrc: '/media/capture-desktop-hud.svg',
    specs: 'Rust 2.0 • <40MB RAM • Native Sandbox',
    desc: 'Real-time node graph linking Public Ingress ➔ Vulnerability Choke Point ➔ Crown Jewel Database with live severance simulation and perimeter gauges.',
    details: [
      'Interactive force-directed graph linking endpoints to sensitive databases',
      'Dynamic Reachability Exposure Index (84% ➔ 0%)',
      'Atmospheric color transitions between Cold analytical and Warm protective themes',
      'Explorer context menu hook ("Scan with Armelis")'
    ]
  },
  {
    id: 'cli-terminal',
    title: 'Headless CI/CD & Terminal CLI',
    subtitle: 'Multi-scanner synthesis with 3D block shadow typography',
    badge: 'CLI • HEADLESS',
    imageSrc: '/media/capture-cli-terminal.svg',
    specs: 'Windows, macOS, Linux • CI/CD Native',
    desc: 'Terminal-first attack-path intelligence with live Git branch detection, multi-engine AST correlation (Trivy, Semgrep, Gitleaks), and lateral hop tracing.',
    details: [
      '3D Block Shadow typography with UTC telemetry',
      'armelis trace command synthesizes attack trajectories in seconds',
      'armelis break command pinpoints the single critical choke-point link',
      'Pipe findings directly to CEF, ECS, or Wazuh / Splunk syslog'
    ]
  },
  {
    id: 'github-analyzer',
    title: 'GitHub Live Repository Analyzer',
    subtitle: 'Dynamic 0-100 mathematical posture calculation',
    badge: 'WEB CONSOLE • NEXT.JS 16',
    imageSrc: '/media/capture-github-analyzer.svg',
    specs: 'Turbopack • Local-First • No Cloud Tracking',
    desc: 'Analyze public or private GitHub repositories by URL. Computes dynamic posture score from actual findings and generates copy-paste remediation prompts for AI agents.',
    details: [
      'Dynamic mathematical posture score: 100 - (crit*28 + high*14 + med*6 + low*1)',
      'Verified defensive barrier cards for clean repositories',
      'One-click AI remediation prompts for Cursor, Copilot & Claude Code',
      'Optional GitHub Personal Access Token (stored strictly in local memory)'
    ]
  },
  {
    id: 'siem-stream',
    title: 'Enterprise SIEM & Telemetry Pipeline',
    subtitle: 'CEF, ECS, and RFC 5424 Syslog stream',
    badge: 'SOC INTEGRATION',
    imageSrc: '/media/capture-siem-stream.svg',
    specs: 'CEF • ECS • RFC 5424 • Wazuh & Splunk',
    desc: 'Emits standardized Common Event Format and Elastic Common Schema events directly into enterprise SOC SIEM pipelines without external telemetry leaks.',
    details: [
      'Native CEF event emission with attack chain and choke-point labels',
      'Direct Wazuh manager & Splunk HEC integration',
      'Air-gapped verification: 0 cloud telemetry or phone-home calls',
      'JSON, CEF, and RFC 5424 Syslog export formats'
    ]
  }
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

  // Marketing Showcase State
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showcaseMode, setShowcaseMode] = useState<'video' | 'photos'>('video');
  const [videoChapter, setVideoChapter] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(35);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lightboxItem, setLightboxItem] = useState<{
    title: string;
    subtitle: string;
    badge: string;
    imageSrc: string;
    specs?: string;
    desc?: string;
    details: string[];
  } | null>(null);

  // Animated video player timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 350);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

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
          <Link href="#showcase">Demo &amp; Videos</Link>
          <Link href="#platforms">CLI &amp; Desktop</Link>
          <Link href="#how-it-works">How it works</Link>
          <Link href="#install">Activation &amp; Download</Link>
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

        {/* Mobile Navigation Toggle Button */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer shell" role="dialog" aria-modal="true">
          <div className="mobile-nav-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Navigation &amp; Controls
              </span>
              <div className="web-theme-control" role="group" aria-label="Mobile theme switcher">
                <button
                  type="button"
                  className={`web-theme-btn ${theme === 'cold' ? 'active' : ''}`}
                  onClick={() => setTheme('cold')}
                  title="Cold analytical mode"
                >
                  Cold
                </button>
                <button
                  type="button"
                  className={`web-theme-btn ${theme === 'warm' ? 'active' : ''}`}
                  onClick={() => setTheme('warm')}
                  title="Warm protective"
                >
                  Warm
                </button>
              </div>
            </div>

            <div className="mobile-nav-links">
              <Link
                href="/dashboard"
                className="mobile-nav-link active-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Live Interactive Console</span>
                <b>↗</b>
              </Link>
              <Link
                href="#showcase"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Demo &amp; Interactive Media</span>
                <b>→</b>
              </Link>
              <Link
                href="#platforms"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>CLI &amp; Desktop HUD</span>
                <b>→</b>
              </Link>
              <Link
                href="#how-it-works"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Choke-Point Mathematics</span>
                <b>→</b>
              </Link>
              <Link
                href="#install"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Download &amp; Activation</span>
                <b>→</b>
              </Link>
              <Link
                href="#open-source"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Open Source Philosophy</span>
                <b>→</b>
              </Link>
              <a
                href="https://github.com/Johanvasquezdev/armelis"
                target="_blank"
                rel="noreferrer"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>GitHub Repository</span>
                <b>↗</b>
              </a>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '6px', display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
                <Link
                  href="/privacy"
                  style={{ color: 'var(--muted)', fontSize: '12px', textDecoration: 'none' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  style={{ color: 'var(--muted)', fontSize: '12px', textDecoration: 'none' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Terms of Use
                </Link>
                <a
                  href="https://github.com/Johanvasquezdev/armelis"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--muted)', fontSize: '12px', textDecoration: 'none' }}
                >
                  MIT License
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
              href="#showcase"
              className="cs-button cs-button-ghost cs-button-md"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Demo (2 min)
            </a>
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

      {/* Interactive Marketing Showcase: Videos & Photo Captures */}
      <section id="showcase" className="showcase-section">
        <div className="shell">
          <div className="showcase-header">
            <div>
              <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>PRODUCT SHOWCASE &bull; SYSTEM DEMOS</span>
                <span className="eyebrow-rule" />
              </p>
              <h2 style={{ margin: '8px 0 0', fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.9 }}>
                See Armelis<br />
                <em>in Action.</em>
              </h2>
              <p style={{ margin: '14px 0 0', color: 'var(--muted)', fontSize: '15px', maxWidth: '620px', lineHeight: 1.6 }}>
                Watch high-resolution video walkthroughs and inspect architectural captures of the CLI engine, tactical desktop HUD, and GitHub repository analyzer.
              </p>
            </div>

            {/* Mode Switcher: Videos vs Photos */}
            <div className="showcase-mode-switcher" role="tablist" aria-label="Showcase view mode">
              <button
                type="button"
                className={`showcase-mode-btn ${showcaseMode === 'video' ? 'active' : ''}`}
                onClick={() => setShowcaseMode('video')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Video Walkthroughs</span>
              </button>
              <button
                type="button"
                className={`showcase-mode-btn ${showcaseMode === 'photos' ? 'active' : ''}`}
                onClick={() => setShowcaseMode('photos')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Product Captures</span>
              </button>
            </div>
          </div>

          {/* MODE 1: VIDEO WALKTHROUGHS PLAYER */}
          {showcaseMode === 'video' && (
            <div className="media-window">
              {/* Top Chrome Bar */}
              <div className="media-window-bar">
                <div className="media-window-left">
                  <div className="media-window-dots">
                    <span className="media-window-dot" style={{ background: '#ef4444' }} />
                    <span className="media-window-dot" style={{ background: '#f59e0b' }} />
                    <span className="media-window-dot" style={{ background: '#10b981' }} />
                  </div>
                  <div className="media-window-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>armelis-walkthrough-{videoChapters[videoChapter].id}.mp4</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="media-window-badge">
                    <span>●</span> {videoChapters[videoChapter].badge}
                  </span>
                  <span className="media-window-badge" style={{ borderColor: 'var(--line-bright)', color: 'var(--muted)', background: 'transparent' }}>
                    4K 60FPS
                  </span>
                </div>
              </div>

              {/* Video Stage / Playback Canvas */}
              <div className="video-stage">
                <div className="video-sim-backdrop">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em' }}>
                        CHAPTER 0{videoChapter + 1}
                      </span>
                      <span style={{ color: 'var(--dim)', fontSize: '12px' }}>•</span>
                      <span style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '13px' }}>
                        {videoChapters[videoChapter].title}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                      AIR-GAPPED ENVIRONMENT • 100% LOCAL EXECUTION
                    </span>
                  </div>

                  <div className="video-sim-terminal">
                    {videoChapters[videoChapter].terminalLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={
                          line.type === 'cmd'
                            ? 'cmd-line'
                            : line.type === 'alert'
                            ? 'alert-line'
                            : line.type === 'choke'
                            ? 'choke-line'
                            : line.type === 'success'
                            ? 'success-line'
                            : ''
                        }
                        style={{
                          opacity: isPlaying ? 1 : idx <= 3 ? 1 : 0.45,
                          transition: 'opacity 200ms ease'
                        }}
                      >
                        {line.text}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--dim)' }}>
                      Target: Johanvasquezdev/armelis (MIT License)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>
                      {isPlaying ? '● SIMULATING LIVE EXECUTION' : 'PAUSED • CLICK TO PLAY'}
                    </span>
                  </div>
                </div>

                {/* Big Play Overlay (when paused) */}
                {!isPlaying && (
                  <div className="video-play-overlay" onClick={() => setIsPlaying(true)} role="button" aria-label="Play video walkthrough">
                    <div className="video-play-button">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls Bar */}
              <div className="video-controls-bar">
                <button
                  type="button"
                  className="video-ctrl-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>

                <div
                  className="video-progress-wrap"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    setVideoProgress(Math.round((clickX / rect.width) * 100));
                  }}
                >
                  <div className="video-progress-fill" style={{ width: `${videoProgress}%` }} />
                </div>

                <div className="video-time-display">
                  <span>{Math.floor((videoProgress * 58) / 100)}s</span> / <span>{videoChapters[videoChapter].duration}</span>
                </div>

                <button
                  type="button"
                  className="video-ctrl-btn"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  className="video-ctrl-btn"
                  onClick={() => {
                    setLightboxItem({
                      title: videoChapters[videoChapter].title,
                      subtitle: videoChapters[videoChapter].desc,
                      badge: videoChapters[videoChapter].badge,
                      imageSrc: '/media/video-preview-poster.svg',
                      details: [
                        'Format: 4K 60FPS High-Definition Recording',
                        'Audio: Technical Narration & Keyboard Foley',
                        'Execution: 100% Local Air-Gapped Simulation',
                        'Source Repository: github.com/Johanvasquezdev/armelis'
                      ]
                    });
                  }}
                  title="Expand to Fullscreen Lightbox"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              </div>

              {/* Video Chapter Switcher */}
              <div className="video-chapters-track">
                {videoChapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    className={`video-chapter-btn ${videoChapter === idx ? 'active' : ''}`}
                    onClick={() => {
                      setVideoChapter(idx);
                      setVideoProgress(15);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="video-chapter-meta">
                      <span>0{idx + 1} • {ch.duration}</span>
                      <span>{videoChapter === idx && isPlaying ? '● PLAYING' : 'SELECT'}</span>
                    </div>
                    <div className="video-chapter-title">{ch.title}</div>
                    <div className="video-chapter-desc">{ch.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: HIGH-RESOLUTION PHOTO / SCREENSHOT GALLERY */}
          {showcaseMode === 'photos' && (
            <div className="gallery-grid">
              {galleryCaptures.map((item) => (
                <div className="gallery-card" key={item.id}>
                  <div
                    className="gallery-media-thumb"
                    onClick={() => setLightboxItem(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${item.title}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageSrc} alt={item.title} loading="lazy" />
                    <span className="gallery-badge">{item.badge}</span>
                    <div className="gallery-zoom-action">
                      <span className="gallery-zoom-pill">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                        Inspect Fullscreen
                      </span>
                    </div>
                  </div>

                  <div className="gallery-info">
                    <h3 className="gallery-title">{item.title}</h3>
                    <p className="gallery-desc">{item.desc}</p>
                    <div className="gallery-footer">
                      <span style={{ color: 'var(--dim)', fontFamily: 'monospace' }}>{item.specs}</span>
                      <button
                        type="button"
                        onClick={() => setLightboxItem(item)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--cyan)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px'
                        }}
                      >
                        Inspect Details <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Developer Media Slot Note */}
          <div className="developer-media-slot">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                <strong>Custom Media Slot:</strong> To add your own custom video recordings or screenshots, simply place your <code>.mp4</code> or <code>.png</code> files into <code>apps/web/public/media/</code>.
              </span>
            </div>
            <a
              href="https://github.com/Johanvasquezdev/armelis"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--cyan)', fontWeight: 700 }}
            >
              View Documentation ↗
            </a>
          </div>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
            <span>Armelis CLI (Terminal)</span>
          </button>
          <button
            type="button"
            className={`install-tab-btn ${installTab === 'desktop' ? 'active' : ''}`}
            onClick={() => setInstallTab('desktop')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            <span>Armelis Desktop (Tauri 2)</span>
          </button>
          <button
            type="button"
            className={`install-tab-btn ${installTab === 'docker' ? 'active' : ''}`}
            onClick={() => setInstallTab('docker')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
            <span>CI/CD &amp; Docker Pipeline</span>
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  <span>PowerShell (Windows)</span>
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${cliShell === 'cmd' ? 'active' : ''}`}
                  onClick={() => setCliShell('cmd')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8l4 4-4 4" /><line x1="12" y1="16" x2="18" y2="16" /></svg>
                  <span>Command Prompt (CMD)</span>
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${cliShell === 'bash' ? 'active' : ''}`}
                  onClick={() => setCliShell('bash')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                  <span>Bash / Zsh (macOS &amp; Linux)</span>
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
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>Zero-install alternative: Run instantly without global installation via <code>npx armelis scan . --cold</code></span>
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
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span>PowerShell absolute path example: <code>armelis scan "$HOME\Documents\YourRepo" --cold</code></span>
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
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>For current directory in CMD: <code>armelis scan . --cold</code></span>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                  <span>Windows Custom Installer (.exe / .msi)</span>
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${desktopMode === 'source' ? 'active' : ''}`}
                  onClick={() => setDesktopMode('source')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                  <span>Run from Source (Tauri 2)</span>
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span>ROADMAP &amp; EARLY ACCESS</span>
                  </div>
                </div>

                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
                  The dedicated Armelis Windows Installer (<code>Armelis-Setup-x64.exe</code> &amp; <code>.msi</code>) provides a seamless out-of-the-box installation experience for workstations, developers, and enterprise security analysts:
                </p>

                {/* 4 Feature Highlights */}
                <div className="installer-features-grid">
                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                    </div>
                    <div className="installer-feat-content">
                      <strong>Custom Visual Identity &amp; Icons</strong>
                      <p>Handcrafted high-resolution multi-size <code>.ico</code> icons (16px to 512px) for Windows Explorer, Start Menu, taskbar pinning, and a branded dark cold-cyan wizard window.</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
                    </div>
                    <div className="installer-feat-content">
                      <strong>Explorer Context Menu ("Scan with Armelis")</strong>
                      <p>Deep Windows Explorer shell integration: Right-click any repository folder or drive and click <em>"Scan with Armelis"</em> to launch immediate attack-path graph traversal.</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <div className="installer-feat-content">
                      <strong>Automated System PATH Registration</strong>
                      <p>Automatically configures Windows User &amp; System <code>PATH</code> variables. Use the <code>armelis</code> CLI instantly from any new PowerShell or CMD terminal without manual setup.</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                      <span>Download Portable .zip</span>
                    </a>
                  </div>

                  <div className="installer-specs-pill">
                    <span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>
                      ~12.4 MB
                    </span>
                    <span>•</span>
                    <span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.851" /></svg>
                      Windows 10 / 11 (x64)
                    </span>
                    <span>•</span>
                    <span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      SHA-256 Verified
                    </span>
                    <span>•</span>
                    <span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
                      MIT License
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span>Star on GitHub</span>
            </a>
          </Button>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer shell" style={{ alignItems: 'center' }}>
        <span>ARMELIS • APPLICATION SECURITY INTELLIGENCE</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms ease' }}>
            Privacy Policy
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms ease' }}>
            Terms of Use
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <a
            href="https://github.com/Johanvasquezdev/armelis"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms ease' }}
          >
            MIT License
          </a>
        </div>
        <span>DEVELOPED BY JOHAN VASQUEZ</span>
      </footer>

      {/* High-Resolution Media Lightbox Modal */}
      {lightboxItem && (
        <div
          className="lightbox-modal"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="media-window-badge">
                  {lightboxItem.badge}
                </span>
                <strong style={{ color: 'var(--ink)', fontSize: '14px' }}>
                  {lightboxItem.title}
                </strong>
              </div>
              <button
                type="button"
                className="video-ctrl-btn"
                onClick={() => setLightboxItem(null)}
                style={{ fontSize: '18px', padding: '4px 10px' }}
                aria-label="Close Lightbox"
              >
                ✕
              </button>
            </div>

            <div className="lightbox-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxItem.imageSrc} alt={lightboxItem.title} />

              <div style={{ width: '100%', marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--ink)', fontSize: '15px' }}>
                    {lightboxItem.title}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px', lineHeight: 1.5 }}>
                    {lightboxItem.subtitle}
                  </p>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 8px', color: 'var(--cyan)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Architectural Highlights
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--muted)', fontSize: '12px', lineHeight: 1.6 }}>
                    {lightboxItem.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
