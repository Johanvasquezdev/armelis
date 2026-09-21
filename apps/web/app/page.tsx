'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { animate } from 'animejs';
import { gsap } from 'gsap';
import { Button } from '../components/ui/button';
import { translations, type Language } from '../lib/i18n';
import {
  trackLanguageSwitch,
  trackLiveConsoleLaunch,
  trackInstallerDownload,
  trackDocView
} from '../lib/analytics';



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
          fontFamily: "'Gilroy', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: large ? '42px' : '30px',
          fontWeight: 800,
          letterSpacing: '-0.4px',
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
  const [lang, setLang] = useState<Language>('en');
  const [docsTab, setDocsTab] = useState<'cli' | 'graph' | 'siem' | 'cicd'>('cli');
  const [installTab, setInstallTab] = useState<'cli' | 'desktop' | 'docker'>('cli');
  const [cliShell, setCliShell] = useState<'powershell' | 'cmd' | 'bash'>('powershell');
  const [desktopMode, setDesktopMode] = useState<'installer' | 'source'>('installer');
  const [copiedSnippet, setCopiedSnippet] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('armelis_lang') as Language;
      if (saved === 'en' || saved === 'es') {
        setLang(saved);
        document.documentElement.lang = saved;
      } else if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es')) {
        setLang('es');
        document.documentElement.lang = 'es';
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    trackLanguageSwitch(newLang);
    try {
      localStorage.setItem('armelis_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  const handleSetDocsTab = (tab: 'cli' | 'graph' | 'siem' | 'cicd') => {
    setDocsTab(tab);
    trackDocView(tab);
  };


  const t = translations[lang];


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
          <Link href="/dashboard" style={{ color: 'var(--cyan)', fontWeight: 700 }}>
            {t.nav.liveConsole}
          </Link>
          <Link href="#showcase">{t.nav.showcase}</Link>
          <Link href="#platforms">{t.nav.platforms}</Link>
          <Link href="#how-it-works">{t.nav.howItWorks}</Link>
          <Link href="#docs" style={{ color: 'var(--cyan)' }}>{t.nav.docs}</Link>
          <Link href="#install">{t.nav.install}</Link>
          <Link href="#open-source">{t.nav.openSource}</Link>
        </nav>

        {/* Header Right Actions (Language Switcher + Theme Switcher + GitHub CTA) */}
        <div className="site-header-actions">
          {/* Apple HIG Segmented Language Control */}
          <div className="web-theme-control" role="group" aria-label="Language selector">
            <button
              type="button"
              className={`web-theme-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => handleSetLang('en')}
              title="English"
            >
              <span>EN</span>
            </button>
            <button
              type="button"
              className={`web-theme-btn ${lang === 'es' ? 'active' : ''}`}
              onClick={() => handleSetLang('es')}
              title="Español"
            >
              <span>ES</span>
            </button>
          </div>

          {/* Apple HIG Segmented Theme Control */}
          <div className="web-theme-control" role="group" aria-label="Theme mode switcher">
            <button
              type="button"
              className={`web-theme-btn ${theme === 'cold' ? 'active' : ''}`}
              onClick={() => setTheme('cold')}
              title="Cold analytical mode"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>{t.nav.coldMode}</span>
            </button>
            <button
              type="button"
              className={`web-theme-btn ${theme === 'warm' ? 'active' : ''}`}
              onClick={() => setTheme('warm')}
              title="Warm protective"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{t.nav.warmMode}</span>
            </button>
          </div>

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
        </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Navigation &amp; Controls
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div className="web-theme-control" role="group" aria-label="Mobile language switcher">
                  <button
                    type="button"
                    className={`web-theme-btn ${lang === 'en' ? 'active' : ''}`}
                    onClick={() => handleSetLang('en')}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    className={`web-theme-btn ${lang === 'es' ? 'active' : ''}`}
                    onClick={() => handleSetLang('es')}
                  >
                    ES
                  </button>
                </div>
                <div className="web-theme-control" role="group" aria-label="Mobile theme switcher">
                  <button
                    type="button"
                    className={`web-theme-btn ${theme === 'cold' ? 'active' : ''}`}
                    onClick={() => setTheme('cold')}
                    title="Cold analytical mode"
                  >
                    {t.nav.coldMode}
                  </button>
                  <button
                    type="button"
                    className={`web-theme-btn ${theme === 'warm' ? 'active' : ''}`}
                    onClick={() => setTheme('warm')}
                    title="Warm protective"
                  >
                    {t.nav.warmMode}
                  </button>
                </div>
              </div>
            </div>

            <div className="mobile-nav-links">
              <Link
                href="/dashboard"
                className="mobile-nav-link active-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{t.nav.liveConsole}</span>
                <b>↗</b>
              </Link>
              <Link
                href="#showcase"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{t.nav.showcase}</span>
                <b>→</b>
              </Link>
              <Link
                href="#platforms"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{t.nav.platforms}</span>
                <b>→</b>
              </Link>
              <Link
                href="#how-it-works"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{t.nav.howItWorks}</span>
                <b>→</b>
              </Link>
              <Link
                href="#docs"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span style={{ color: 'var(--cyan)' }}>{t.nav.docs}</span>
                <b>→</b>
              </Link>
              <Link
                href="#install"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{t.nav.install}</span>
                <b>→</b>
              </Link>
              <Link
                href="#open-source"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{t.nav.openSource}</span>
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
            {t.hero.badge} <span className="eyebrow-rule" />
          </p>
          <h1 id="hero-title">
            {t.hero.title1}<br />
            <em>{t.hero.title2}</em>
          </h1>
          <p className="hero-lede">
            {t.hero.lede}
          </p>
          <div className="hero-actions">
            <Button asChild size="md">
              <Link href="/dashboard" onClick={() => trackLiveConsoleLaunch('hero')}>
                <span>{t.hero.openConsole}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </Button>
            <a
              href="#showcase"
              className="cs-button cs-button-ghost cs-button-md"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{t.hero.exploreShowcase}</span>
            </a>
            <a
              className="text-link"
              href="https://github.com/Johanvasquezdev/armelis"
              target="_blank"
              rel="noreferrer"
            >
              {lang === 'es' ? 'Clonar en GitHub (MIT)' : 'Clone on GitHub (MIT)'} <span>↗</span>
            </a>
          </div>
          <p className="hero-proof">
            <span>{t.hero.badge1}</span>
            <i /> {t.hero.badge2} <i /> {t.hero.badge3}
          </p>
        </div>

        {/* 3D Console Perspective (Blender Motion Style) */}
        <div className="hero-visual" aria-label="Sample Armelis attack path visualization">
          <div className="console-orbit orbit-a" />
          <div className="console-orbit orbit-b" />
          <div className="radar-sweep" />
          <div className="scan-console">
            <div className="console-top">
              <span className="live-dot" /> {lang === 'es' ? 'escaneo muestra / storefront-api' : 'sample scan / storefront-api'} <b>{lang === 'es' ? 'LISTO' : 'READY'}</b>
            </div>
            <div className="console-body">
              <div className="console-repo">
                <div className="repo-mark">⌘</div>
                <div>
                  <strong>storefront-api</strong>
                  <small>{lang === 'es' ? 'repositorio conectado' : 'connected repository'}</small>
                </div>
                <span>{lang === 'es' ? 'CONECTADO' : 'CONNECTED'}</span>
              </div>
              <div className="console-label">{t.hero.traceTitle}</div>
              <div className="path-flow">
                {findings.map(([index, title, detail], i) => (
                  <div className="path-segment" key={index}>
                    <div className={`path-node node-${i + 1}`}>
                      <span>{index}</span>
                      <strong>{i === 0 ? t.hero.taintedInput : i === 1 ? t.hero.chokePoint : t.hero.exfilSink}</strong>
                      <small>{i === 0 ? t.hero.taintedInputSub : i === 1 ? t.hero.chokePointSub : t.hero.exfilSinkSub}</small>
                    </div>
                    {i < findings.length - 1 && <div className="path-connector" />}
                  </div>
                ))}
              </div>
              <div className="fix-callout">
                <div className="fix-spark">✦</div>
                <div>
                  <span>{lang === 'es' ? 'REPARAR PRIMERO' : 'FIX FIRST'}</span>
                  <strong>{lang === 'es' ? 'Verificar que order.user_id coincida con la sesión.' : 'Verify order.user_id matches authenticated session.'}</strong>
                  <p>{lang === 'es' ? 'Una sola verificación de autorización rompe toda la cadena del exploit.' : 'One single authorization check breaks the entire exploit chain.'}</p>
                </div>
                <b>→</b>
              </div>
            </div>
          </div>
          <span className="visual-caption caption-a">{lang === 'es' ? '01 / AST + Secretos Correlacionados' : '01 / AST + Secrets Correlated'}</span>
          <span className="visual-caption caption-b">{lang === 'es' ? '02 / Mapeado a MITRE ATT&CK' : '02 / MITRE ATT&CK Mapped'}</span>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section shell story-section">
        <div className="section-intro">
          <p className="eyebrow">{t.howItWorks.eyebrow}</p>
          <h2>
            {t.howItWorks.title1}<br />
            <em>{t.howItWorks.title2}</em>
          </h2>
          <p>
            {lang === 'es'
              ? 'Armelis conecta código, dependencias, contenedores y configuraciones, transformando alertas dispersas en una ruta de riesgo concreta que tu equipo puede entender y mitigar de inmediato.'
              : 'Armelis connects code, dependencies, containers, and configuration—then turns disconnected alerts into a concrete risk path your team can understand and remediate.'}
          </p>
        </div>
        <div className="steps">
          <article>
            <span>{t.howItWorks.step1Num}</span>
            <h3>{t.howItWorks.step1Title}</h3>
            <p>{t.howItWorks.step1Desc}</p>
          </article>
          <article>
            <span>{t.howItWorks.step2Num}</span>
            <h3>{t.howItWorks.step2Title}</h3>
            <p>{t.howItWorks.step2Desc}</p>
          </article>
          <article>
            <span>{t.howItWorks.step3Num}</span>
            <h3>{t.howItWorks.step3Title}</h3>
            <p>{t.howItWorks.step3Desc}</p>
          </article>
        </div>
      </section>

      {/* AI & Vibecoding Security Spotlight Section */}
      <section id="vibecoding" className="vibecoding-section">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)' }} />
              {t.aiVibecoding.eyebrow}
            </p>
            <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', lineHeight: 1.05, margin: '10px 0 16px' }}>
              {t.aiVibecoding.title.split('.')[0]}.<br />
              <em>{t.aiVibecoding.title.split('.').slice(1).join('.').trim() || t.aiVibecoding.title}</em>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '780px', lineHeight: 1.7, margin: '0 0 8px' }}>
              {t.aiVibecoding.subtitle}
            </p>
          </div>

          <div className="vibecoding-grid">
            <div className="vibecoding-card">
              <span className="vibecoding-badge">{t.aiVibecoding.card1Badge}</span>
              <h3>{t.aiVibecoding.card1Title}</h3>
              <p>{t.aiVibecoding.card1Desc}</p>
            </div>

            <div className="vibecoding-card">
              <span className="vibecoding-badge" style={{ color: '#f59e0b' }}>{t.aiVibecoding.card2Badge}</span>
              <h3>{t.aiVibecoding.card2Title}</h3>
              <p>{t.aiVibecoding.card2Desc}</p>
            </div>

            <div className="vibecoding-card" style={{ borderColor: 'rgba(0, 229, 255, 0.4)', background: 'rgba(7, 18, 38, 0.85)' }}>
              <span className="vibecoding-badge" style={{ color: '#10b981' }}>{t.aiVibecoding.card3Badge}</span>
              <h3>{t.aiVibecoding.card3Title}</h3>
              <p>{t.aiVibecoding.card3Desc}</p>
            </div>
          </div>

          {/* 1-Click AI Prompt Box */}
          <div className="vibecoding-prompt-box">
            <div className="vibecoding-prompt-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(0, 229, 255, 0.15)', color: 'var(--cyan)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                  CURSOR / COPILOT / CLAUDE PROMPT
                </span>
                <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>
                  {t.aiVibecoding.promptTitle}
                </strong>
              </div>
              <button
                type="button"
                className="install-copy-btn"
                onClick={() => handleCopy(t.aiVibecoding.promptSnippet, 'vibecoding-prompt')}
              >
                {copiedSnippet === 'vibecoding-prompt' ? 'Copied to Clipboard! ✓' : (lang === 'es' ? 'Copiar Prompt' : 'Copy AI Prompt')}
              </button>
            </div>
            <pre className="vibecoding-prompt-code">{t.aiVibecoding.promptSnippet}</pre>
            <div style={{ padding: '14px 20px', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {t.aiVibecoding.promptDesc}
              </span>
              <Link
                href="/dashboard"
                onClick={() => trackLiveConsoleLaunch('vibecoding_section')}
                style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {t.aiVibecoding.ctaConsole}
              </Link>
            </div>
          </div>
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
                <span>{t.showcase.eyebrow}</span>
                <span className="eyebrow-rule" />
              </p>
              <h2 style={{ margin: '8px 0 0', fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.9 }}>
                {t.showcase.title.split(' ')[0]} {t.showcase.title.split(' ')[1] || ''}<br />
                <em>{t.showcase.title.split(' ').slice(2).join(' ') || t.showcase.title}</em>
              </h2>
              <p style={{ margin: '14px 0 0', color: 'var(--muted)', fontSize: '15px', maxWidth: '620px', lineHeight: 1.6 }}>
                {lang === 'es'
                  ? 'Explora recorridos en video interactivo y capturas de alta definición del motor CLI, el command center táctico de escritorio y el analizador de repositorios de GitHub.'
                  : 'Watch high-resolution video walkthroughs and inspect architectural captures of the CLI engine, tactical desktop HUD, and GitHub repository analyzer.'}
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
                <span>{t.showcase.tabVideo}</span>
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
                <span>{t.showcase.tabPhotos}</span>
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

        </div>
      </section>

      {/* Sample Scan Comparison */}
      <section id="sample-scan" className="section shell sample-section">
        <div className="section-intro split">
          <div>
            <p className="eyebrow">{t.comparison.eyebrow}</p>
            <h2>
              {t.comparison.title1}<br />
              <em>{t.comparison.title2}</em>
            </h2>
          </div>
          <p>
            {lang === 'es'
              ? 'El recorrido determinista de grafos elimina la fatiga de alertas y evita ciclos desperdiciados de desarrollo.'
              : 'Deterministic graph traversal cuts alert fatigue and eliminates wasted developer cycles.'}
          </p>
        </div>
        <div className="comparison">
          <div className="signal-column">
            <span className="column-label">{t.comparison.legacyTitle} • {t.comparison.legacyTag}</span>
            {t.comparison.legacyPoints.map((point, i) => (
              <p key={i}>
                <i className={i % 2 === 0 ? 'signal orange' : 'signal blue'} /> {point}
              </p>
            ))}
          </div>
          <div className="comparison-beam">→</div>
          <div className="signal-column resolved">
            <span className="column-label">{t.comparison.armelisTitle} • {t.comparison.armelisTag}</span>
            <div className="resolved-row">
              <span>✓</span>
              <div>
                <strong>{lang === 'es' ? 'Punto Crítico Neutralizado' : 'Authorization Check Enforced'}</strong>
                <small>{lang === 'es' ? 'Ruta de ataque rota. Radio de impacto reducido a cero.' : 'Attack path broken. Blast radius reduced to zero.'}</small>
              </div>
            </div>
            <div className="risk-direction">
              <span>{lang === 'es' ? 'REDUCCIÓN DE RIESGO' : 'RISK REDUCTION'}</span>
              <b>{lang === 'es' ? '100% NEUTRALIZADO' : '100% ELIMINATED'}</b>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="section shell feature-section">
        <div className="section-intro split">
          <div>
            <p className="eyebrow">{t.features.eyebrow}</p>
            <h2>
              {t.features.title.split('.')[0]}<br />
              <em>{lang === 'es' ? 'En tu flujo de desarrollo.' : 'In your workflow.'}</em>
            </h2>
          </div>
          <p>
            {lang === 'es'
              ? 'Evidencia primero. Compensaciones claras. Útil programando a mano, con agentes de IA o en un equipo completo de ingeniería.'
              : 'Evidence first. Clear tradeoffs. Useful whether you code by hand, with AI, or across a full engineering team.'}
          </p>
        </div>
        <div className="feature-grid">
          {t.features.items.map((feat, i) => (
            <article key={i}>
              <span style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>
                {i === 0 ? 'AST / TAINT' : i === 1 ? 'OFFLINE' : i === 2 ? 'SIEM' : 'PATCH'}
              </span>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CLI vs Desktop Platforms Section */}
      <section id="platforms" className="section shell platforms-section">
        <div className="section-intro split">
          <div>
            <p className="eyebrow">{t.platforms.eyebrow}</p>
            <h2>
              {t.platforms.title1}<br />
              <em>{t.platforms.title2}</em>
            </h2>
          </div>
          <p>
            {t.platforms.lead}
          </p>
        </div>

        <div className="platform-grid">
          {/* Card 1: Armelis CLI */}
          <div className="platform-card">
            <div className="platform-top">
              <span className="platform-badge">{t.platforms.cliBadge}</span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>{t.platforms.cliMeta}</span>
            </div>
            <h3 className="platform-title">{t.platforms.cliTitle}</h3>
            <p className="platform-desc">
              {t.platforms.cliDesc}
            </p>
            <ul className="platform-features">
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.cliFeat1Title}:</strong> {t.platforms.cliFeat1Desc}</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.cliFeat2Title}:</strong> {t.platforms.cliFeat2Desc}</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.cliFeat3Title}:</strong> {t.platforms.cliFeat3Desc}</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.cliFeat4Title}:</strong> {t.platforms.cliFeat4Desc}</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.cliFeat5Title}:</strong> {t.platforms.cliFeat5Desc}</span>
              </li>
            </ul>

            <div className="platform-preview-terminal">
              <div>$ armelis scan . --cold</div>
              <div style={{ color: '#94a3b8' }}>{t.platforms.cliPreviewScanners}</div>
              <div style={{ color: 'var(--green)' }}>{t.platforms.cliPreviewStatus}</div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button asChild size="sm">
                <a href="#install" onClick={() => { setInstallTab('cli'); setCliShell('powershell'); }}>
                  {t.platforms.cliBtnPowershell} <span>→</span>
                </a>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <a href="#install" onClick={() => { setInstallTab('cli'); setCliShell('cmd'); }}>
                  {t.platforms.cliBtnCmd} <span>→</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Card 2: Armelis Desktop App */}
          <div className="platform-card" style={{ borderColor: 'var(--cyan)' }}>
            <div className="platform-top">
              <span className="platform-badge" style={{ background: 'var(--navy)', color: 'var(--cyan)', borderColor: 'var(--cyan)' }}>
                {t.platforms.desktopBadge}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>{t.platforms.desktopMeta}</span>
            </div>
            <h3 className="platform-title">{t.platforms.desktopTitle}</h3>
            <p className="platform-desc">
              {t.platforms.desktopDesc}
            </p>
            <ul className="platform-features">
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.desktopFeat1Title}:</strong> {t.platforms.desktopFeat1Desc}</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.desktopFeat2Title}:</strong> {t.platforms.desktopFeat2Desc}</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.desktopFeat3Title}:</strong> {t.platforms.desktopFeat3Desc}</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.desktopFeat4Title}:</strong> {t.platforms.desktopFeat4Desc}</span>
              </li>
              <li>
                <i>✓</i>
                <span><strong>{t.platforms.desktopFeat5Title}:</strong> {t.platforms.desktopFeat5Desc}</span>
              </li>
            </ul>

            <div className="platform-preview-terminal" style={{ color: 'var(--ink)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#ef4444' }}>{t.platforms.desktopPreviewIngress}</span>
                <span>──▶</span>
                <span style={{ color: '#f59e0b' }}>{t.platforms.desktopPreviewChoke}</span>
                <span>──▶</span>
                <span style={{ color: '#10b981' }}>{t.platforms.desktopPreviewAsset}</span>
              </div>
              <div style={{ color: 'var(--cyan)', fontSize: '11px' }}>
                {t.platforms.desktopPreviewSimulate}
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button asChild size="sm">
                <a
                  href="#install"
                  onClick={() => {
                    setInstallTab('desktop');
                    setDesktopMode('installer');
                    trackInstallerDownload('windows');
                  }}
                >
                  {t.platforms.downloadInstaller} <span>→</span>
                </a>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <a
                  href="#install"
                  onClick={() => {
                    setInstallTab('desktop');
                    setDesktopMode('source');
                    trackInstallerDownload('source');
                  }}
                >
                  {t.platforms.buildFromSource} <span>→</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Developer Documentation Section */}
      <section id="docs" className="section shell docs-section">
        <div className="section-intro">
          <p className="eyebrow">{t.docs.eyebrow}</p>
          <h2>
            {t.docs.title}<br />
            <em>{t.docs.subtitle}</em>
          </h2>
        </div>

        {/* Documentation Navigation Tabs */}
        <div className="docs-tabs-nav" role="tablist" aria-label="Documentation Categories">
          <button
            type="button"
            className={`docs-tab-btn ${docsTab === 'cli' ? 'active' : ''}`}
            onClick={() => handleSetDocsTab('cli')}
          >
            ⚡ {t.docs.tabCli}
          </button>
          <button
            type="button"
            className={`docs-tab-btn ${docsTab === 'graph' ? 'active' : ''}`}
            onClick={() => handleSetDocsTab('graph')}
          >
            🕸 {t.docs.tabGraph}
          </button>
          <button
            type="button"
            className={`docs-tab-btn ${docsTab === 'siem' ? 'active' : ''}`}
            onClick={() => handleSetDocsTab('siem')}
          >
            📡 {t.docs.tabSiem}
          </button>
          <button
            type="button"
            className={`docs-tab-btn ${docsTab === 'cicd' ? 'active' : ''}`}
            onClick={() => handleSetDocsTab('cicd')}
          >
            🛡 {t.docs.tabCicd}
          </button>
        </div>

        {/* Tab 1: CLI Quickstart */}
        {docsTab === 'cli' && (
          <div className="docs-panel">
            <div className="docs-panel-grid">
              <div>
                <h3 style={{ fontSize: '22px', color: 'var(--ink)', margin: '0 0 10px' }}>
                  {t.docs.cliTitle}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
                  {t.docs.cliDesc}
                </p>
                <div className="docs-feature-list">
                  <div className="docs-feature-item">
                    <div className="docs-feature-icon">01</div>
                    <div>
                      <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>
                        {lang === 'es' ? 'Trazado AST de Árbol de Llamadas' : 'AST Call-Graph Tracing'}
                      </strong>
                      <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                        {lang === 'es'
                          ? 'Comprueba si las funciones vulnerables de dependencias transitivas realmente pueden ser ejecutadas desde tus rutas públicas.'
                          : 'Validates whether vulnerable functions inside transitive dependencies can actually be called from your controllers.'}
                      </p>
                    </div>
                  </div>
                  <div className="docs-feature-item">
                    <div className="docs-feature-icon">02</div>
                    <div>
                      <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>
                        {lang === 'es' ? 'Exportación Estándar SARIF v2.1.0' : 'Standard SARIF v2.1.0 Output'}
                      </strong>
                      <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                        {lang === 'es'
                          ? 'Compatible de forma nativa con la pestaña de Seguridad de GitHub, GitLab y herramientas de auditoría corporativa.'
                          : 'Directly ingests into GitHub Security tab, GitLab Vulnerability Report, or IDE plugins.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="docs-code-card">
                <div className="docs-code-header">
                  <div className="docs-code-dots">
                    <span className="docs-code-dot" />
                    <span className="docs-code-dot" />
                    <span className="docs-code-dot" />
                  </div>
                  <button
                    type="button"
                    className="install-copy-btn"
                    onClick={() => handleCopy('npm install -g @armelis/cli\narmelis scan . --reachability\narmelis trace . --choke-only --cold\narmelis scan . --format sarif --out ./armelis.sarif', 'docs-cli')}
                  >
                    {copiedSnippet === 'docs-cli' ? 'Copied! ✓' : t.docs.copySnippet}
                  </button>
                </div>
                <pre className="docs-code-body">{`# 1. Install CLI globally
npm install -g @armelis/cli

# 2. Run AST reachability analysis on current repo
armelis scan . --reachability

# 3. Trace only confirmed exploit choke points
armelis trace . --choke-only --cold

# 4. Generate SARIF report for GitHub Code Scanning
armelis scan . --format sarif --out ./armelis.sarif`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attack Graph */}
        {docsTab === 'graph' && (
          <div className="docs-panel">
            <div className="docs-panel-grid">
              <div>
                <h3 style={{ fontSize: '22px', color: 'var(--ink)', margin: '0 0 10px' }}>
                  {t.docs.graphTitle}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
                  {t.docs.graphDesc}
                </p>
                <div className="docs-feature-list">
                  <div className="docs-feature-item">
                    <div className="docs-feature-icon">★</div>
                    <div>
                      <strong style={{ color: 'var(--cyan)', fontSize: '13px' }}>
                        {lang === 'es' ? 'Matemática de Puntos Críticos' : 'Choke Point Mathematics'}
                      </strong>
                      <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                        {lang === 'es'
                          ? 'Aísla el vértice puente exacto cuya actualización neutraliza el 100% de las rutas de ataque hacia la base de datos.'
                          : 'Isolates the single bridge vertex whose removal reduces the Reachability Exposure Index to 0%.'}
                      </p>
                    </div>
                  </div>
                  <div className="docs-feature-item">
                    <div className="docs-feature-icon">🛡</div>
                    <div>
                      <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>
                        {lang === 'es' ? 'Mapeo de Técnicas MITRE ATT&CK' : 'MITRE ATT&CK Technique Mapping'}
                      </strong>
                      <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                        {lang === 'es'
                          ? 'Cada vulnerabilidad se mapea a tácticas reales: T1190 (Explotación de Aplicación Externa), T1552 y T1059.'
                          : 'Each vulnerability is mapped to T1190 (Exploit Public-Facing App), T1552 (Unsecured Credentials), and T1059 (Command Execution).'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="docs-code-card">
                <div className="docs-code-header">
                  <div className="docs-code-dots">
                    <span className="docs-code-dot" />
                    <span className="docs-code-dot" />
                    <span className="docs-code-dot" />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                    DAG Topology Trace
                  </span>
                </div>
                <pre className="docs-code-body" style={{ color: '#67e8f9' }}>{`[ 🌐 Public Ingress: POST /api/v1/auth/callback ]
      │
      ▼  (Tainted token parameter)
[ ⚙️ Auth Controller: verifyToken() ]
      │
      ▼  (Unpatched signature verification)
[ ⚡ CHOKE POINT: jsonwebtoken@8.5.1 (CVE-2025-4128) ]
      │
      ▼  (Lateral Token Forgery)
[ 🗄️ Sink: PostgreSQL Prod Database Pool ]

>> Severing jsonwebtoken cuts 100% of exploit reachability.`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SIEM Telemetry */}
        {docsTab === 'siem' && (
          <div className="docs-panel">
            <div className="docs-panel-grid">
              <div>
                <h3 style={{ fontSize: '22px', color: 'var(--ink)', margin: '0 0 10px' }}>
                  {t.docs.siemTitle}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
                  {t.docs.siemDesc}
                </p>
                <div className="docs-feature-list">
                  <div className="docs-feature-item">
                    <div className="docs-feature-icon">CEF</div>
                    <div>
                      <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>
                        {lang === 'es' ? 'Formato ArcSight CEF' : 'ArcSight Common Event Format (CEF)'}
                      </strong>
                      <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                        {lang === 'es'
                          ? 'Cabeceras estandarizadas con severidad, origen, destino y etiquetas CVE para indexación inmediata en Splunk.'
                          : 'Standardized headers with severity, source, destination, and CVE labels for instant Splunk indexing.'}
                      </p>
                    </div>
                  </div>
                  <div className="docs-feature-item">
                    <div className="docs-feature-icon">ECS</div>
                    <div>
                      <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>
                        {lang === 'es' ? 'Elastic Common Schema (ECS 8.x)' : 'Elastic Common Schema (ECS 8.x)'}
                      </strong>
                      <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                        {lang === 'es'
                          ? 'Objetos JSON estructurados con clasificación de amenazas para tableros en Elasticsearch y Kibana.'
                          : 'JSON objects with threat classifications and reachability hops for Elasticsearch and Kibana dashboards.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="docs-code-card">
                <div className="docs-code-header">
                  <div className="docs-code-dots">
                    <span className="docs-code-dot" />
                    <span className="docs-code-dot" />
                    <span className="docs-code-dot" />
                  </div>
                  <button
                    type="button"
                    className="install-copy-btn"
                    onClick={() => handleCopy('armelis scan . --format cef --stream syslog://soc.internal:514\narmelis scan . --format ecs --out ./telemetry.json', 'docs-siem')}
                  >
                    {copiedSnippet === 'docs-siem' ? 'Copied! ✓' : t.docs.copySnippet}
                  </button>
                </div>
                <pre className="docs-code-body">{`# Stream CEF events directly to your SOC syslog collector
armelis scan . --format cef --stream syslog://soc.internal:514

# Sample event output:
CEF:0|Armelis|AppSecEngine|0.1.3|CHOKE_POINT_ISOLATED|Critical Choke Point|9|
  src=192.168.1.50 dst=10.0.0.12 dpt=5432
  cs1=CVE-2025-4128 cs1Label=VulnerabilityId
  cs2=jsonwebtoken@8.5.1 cs2Label=Package
  msg=Attack path verified reachable to database sink`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: CI/CD Gate */}
        {docsTab === 'cicd' && (
          <div className="docs-panel">
            <div className="docs-panel-grid">
              <div>
                <h3 style={{ fontSize: '22px', color: 'var(--ink)', margin: '0 0 10px' }}>
                  {t.docs.cicdTitle}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
                  {t.docs.cicdDesc}
                </p>
                <div className="docs-feature-list">
                  <div className="docs-feature-item">
                    <div className="docs-feature-icon">⚡</div>
                    <div>
                      <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>
                        {lang === 'es' ? 'Puerta Determinista de Calidad' : 'Deterministic Quality Gate'}
                      </strong>
                      <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                        {lang === 'es'
                          ? 'Falla el código de salida de CI únicamente cuando se confirma una ruta de ataque ejecutable. Cero bloqueos por CVEs inactivas.'
                          : 'Fails CI exit code only when a critical reachability chain is proven. No more blocking PRs for unreachable CVEs.'}
                      </p>
                    </div>
                  </div>
                  <div className="docs-feature-item">
                    <div className="docs-feature-icon">🛡</div>
                    <div>
                      <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>
                        {lang === 'es' ? 'Integración con Pestaña de Seguridad GitHub' : 'Direct GitHub Security Tab Integration'}
                      </strong>
                      <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                        {lang === 'es'
                          ? 'Sube resultados SARIF de modo que las sugerencias de remediación aparezcan en línea en los code reviews de los PRs.'
                          : 'Uploads SARIF results directly so security advisories and suggested fixes appear inline in GitHub PR code reviews.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="docs-code-card">
                <div className="docs-code-header">
                  <div className="docs-code-dots">
                    <span className="docs-code-dot" />
                    <span className="docs-code-dot" />
                    <span className="docs-code-dot" />
                  </div>
                  <button
                    type="button"
                    className="install-copy-btn"
                    onClick={() => handleCopy(`name: Armelis Security Gate
on: [push, pull_request]

jobs:
  reachability-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g @armelis/cli
      - name: Enforce Zero Reachable Choke Points
        run: armelis scan . --fail-on critical --format sarif --out ./armelis.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: armelis.sarif`, 'docs-cicd')}
                  >
                    {copiedSnippet === 'docs-cicd' ? 'Copied! ✓' : t.docs.copySnippet}
                  </button>
                </div>
                <pre className="docs-code-body">{`name: Armelis Security Gate
on: [push, pull_request]

jobs:
  reachability-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g @armelis/cli
      - name: Enforce Zero Reachable Choke Points
        run: armelis scan . --fail-on critical --format sarif --out ./armelis.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: armelis.sarif`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 100% Free & Open Source Section (Replaces Commercial Pricing) */}
      <section id="open-source" className="section shell pricing-section">
        <div className="section-intro">
          <p className="eyebrow">{t.openSource.eyebrow}</p>
          <h2>
            {t.openSource.title.split('.')[0]}<br />
            <em>{lang === 'es' ? '100% Código Abierto.' : '100% Open Source.'}</em>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>
            {t.openSource.desc}
          </p>
        </div>
        <div className="price-grid">
          <article className="price-featured" style={{ border: '1px solid rgba(0, 229, 255, 0.35)' }}>
            <span style={{ color: '#00e5ff', fontWeight: 800 }}>COMMUNITY EDITION</span>
            <strong style={{ fontSize: '42px', color: '#fff' }}>{lang === 'es' ? 'Gratis Siempre' : 'Free Forever'}</strong>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
              {lang === 'es'
                ? 'Correlación AST completa, mapeo MITRE ATT&CK, exportación SIEM (CEF/ECS) y cliente de escritorio Tauri 2.'
                : 'Full AST correlation, MITRE ATT&CK mapping, SIEM exports (CEF/ECS), and Tauri 2 desktop client.'}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>✓ {lang === 'es' ? 'Licencia Permisiva MIT' : 'Permissive MIT License'}</span>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>✓ {lang === 'es' ? 'Ejecución Local Air-Gapped / Offline' : 'Air-Gapped / Offline Local Execution'}</span>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>✓ {lang === 'es' ? 'Apto para Uso Comercial y Empresarial' : 'Commercial & Enterprise Friendly'}</span>
            </div>
            <Link href="/dashboard" style={{ marginTop: '16px', color: '#00e5ff', fontWeight: 700 }}>
              {t.nav.liveConsole}
            </Link>
          </article>

          <article style={{ border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(7, 14, 28, 0.65)' }}>
            <span style={{ color: '#94a3b8', fontWeight: 800 }}>SELF-HOSTED / INFRA</span>
            <strong style={{ fontSize: '42px', color: '#f8fafc' }}>{lang === 'es' ? 'Despliega Donde Sea' : 'Deploy Anywhere'}</strong>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
              {lang === 'es'
                ? 'Ejecuta de forma nativa en Docker, GitHub Actions, GitLab CI o en tu clúster Kubernetes / VMware interno.'
                : 'Run natively in Docker, GitHub Actions, GitLab CI, or on your internal Kubernetes / VMware cluster.'}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>✓ {lang === 'es' ? 'Cero Llamadas a la Nube' : 'Zero Cloud Phone-Home'}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>✓ {lang === 'es' ? 'Dockerfile y Compose Incluidos' : 'Dockerfile & Compose Included'}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>✓ {lang === 'es' ? 'Compatible con PostgreSQL + pgvector' : 'PostgreSQL + pgvector Ready'}</span>
            </div>
            <a
              href="https://github.com/Johanvasquezdev/armelis"
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: '16px', color: '#38bdf8', fontWeight: 700 }}
            >
              {t.openSource.viewSource} →
            </a>
          </article>
        </div>
      </section>

      {/* Activation & Download Section */}
      <section id="install" className="section shell install-section">
        <div className="section-intro">
          <p className="eyebrow">{t.install.eyebrow}</p>
          <h2>
            {t.install.title.split(' ')[0]} {t.install.title.split(' ')[1] || ''}<br />
            <em>{t.install.title.split(' ').slice(2).join(' ') || t.install.title}</em>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '10px' }}>
            {t.install.desc}
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
            <span>{t.install.tabCli}</span>
          </button>
          <button
            type="button"
            className={`install-tab-btn ${installTab === 'desktop' ? 'active' : ''}`}
            onClick={() => setInstallTab('desktop')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            <span>{t.install.tabDesktop}</span>
          </button>
          <button
            type="button"
            className={`install-tab-btn ${installTab === 'docker' ? 'active' : ''}`}
            onClick={() => setInstallTab('docker')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
            <span>{t.install.tabDocker}</span>
          </button>
        </div>

        {/* Tab 1: CLI */}
        {installTab === 'cli' && (
          <div className="install-card">
            {/* Shell Selector Subtabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                  {t.install.shellSelectorTitle}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                  {t.install.shellSelectorDesc}
                </p>
              </div>
              <div className="install-subtab-bar" role="group" aria-label="Command shell selector">
                <button
                  type="button"
                  className={`install-subtab-btn ${cliShell === 'powershell' ? 'active' : ''}`}
                  onClick={() => setCliShell('powershell')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  <span>{t.install.shellTabPowershell}</span>
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${cliShell === 'cmd' ? 'active' : ''}`}
                  onClick={() => setCliShell('cmd')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8l4 4-4 4" /><line x1="12" y1="16" x2="18" y2="16" /></svg>
                  <span>{t.install.shellTabCmd}</span>
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${cliShell === 'bash' ? 'active' : ''}`}
                  onClick={() => setCliShell('bash')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                  <span>{t.install.shellTabBash}</span>
                </button>
              </div>
            </div>

            {/* PowerShell Instructions */}
            {cliShell === 'powershell' && (
              <>
                <div className="install-step">
                  <h4><span>1</span> {t.install.psStep1Title}</h4>
                  <p>{t.install.psStep1Desc}</p>
                  <div className="install-code-box">
                    <code>npm install -g armelis</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('npm install -g armelis', 'ps-install')}
                    >
                      {copiedSnippet === 'ps-install' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                  <div className="shell-command-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>{t.install.psStep1ZeroInstall}</span>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>2</span> {t.install.psStep2Title}</h4>
                  <p>{t.install.psStep2Desc}</p>
                  <div className="install-code-box">
                    <code>armelis --version</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis --version', 'ps-version')}
                    >
                      {copiedSnippet === 'ps-version' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>3</span> {t.install.psStep3Title}</h4>
                  <p>{t.install.psStep3Desc}</p>
                  <div className="install-code-box">
                    <code>armelis scan . --cold</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis scan . --cold', 'ps-scan')}
                    >
                      {copiedSnippet === 'ps-scan' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                  <div className="shell-command-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span>{t.install.psStep3Note}</span>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>4</span> {t.install.psStep4Title}</h4>
                  <p>{t.install.psStep4Desc}</p>
                  <div className="install-code-box">
                    <code>armelis break .</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis break .', 'ps-break')}
                    >
                      {copiedSnippet === 'ps-break' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* CMD Instructions */}
            {cliShell === 'cmd' && (
              <>
                <div className="install-step">
                  <h4><span>1</span> {t.install.cmdStep1Title}</h4>
                  <p>{t.install.cmdStep1Desc}</p>
                  <div className="install-code-box">
                    <code>npm install -g armelis</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('npm install -g armelis', 'cmd-install')}
                    >
                      {copiedSnippet === 'cmd-install' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>2</span> {t.install.cmdStep2Title}</h4>
                  <p>{t.install.cmdStep2Desc}</p>
                  <div className="install-code-box">
                    <code>armelis --help</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis --help', 'cmd-help')}
                    >
                      {copiedSnippet === 'cmd-help' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>3</span> {t.install.cmdStep3Title}</h4>
                  <p>{t.install.cmdStep3Desc}</p>
                  <div className="install-code-box">
                    <code>armelis scan "%USERPROFILE%\Documents\YourProject" --cold</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis scan "%USERPROFILE%\\Documents\\YourProject" --cold', 'cmd-scan')}
                    >
                      {copiedSnippet === 'cmd-scan' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                  <div className="shell-command-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>{t.install.cmdStep3Note}</span>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>4</span> {t.install.cmdStep4Title}</h4>
                  <p>{t.install.cmdStep4Desc}</p>
                  <div className="install-code-box">
                    <code>armelis break . --warm</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis break . --warm', 'cmd-break')}
                    >
                      {copiedSnippet === 'cmd-break' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Bash / Linux / macOS Instructions */}
            {cliShell === 'bash' && (
              <>
                <div className="install-step">
                  <h4><span>1</span> {t.install.bashStep1Title}</h4>
                  <p>{t.install.bashStep1Desc}</p>
                  <div className="install-code-box">
                    <code>npm install -g armelis</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('npm install -g armelis', 'bash-install')}
                    >
                      {copiedSnippet === 'bash-install' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>2</span> {t.install.bashStep2Title}</h4>
                  <p>{t.install.bashStep2Desc}</p>
                  <div className="install-code-box">
                    <code>armelis scan . --cold --format cef &gt; findings.cef</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis scan . --cold --format cef > findings.cef', 'bash-scan')}
                    >
                      {copiedSnippet === 'bash-scan' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>3</span> {t.install.bashStep3Title}</h4>
                  <p>{t.install.bashStep3Desc}</p>
                  <div className="install-code-box">
                    <code>armelis trace .</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('armelis trace .', 'bash-trace')}
                    >
                      {copiedSnippet === 'bash-trace' ? t.install.copied : t.install.copy}
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
                  {t.install.desktopModeTitle}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                  {t.install.desktopModeDesc}
                </p>
              </div>
              <div className="install-subtab-bar" role="group" aria-label="Desktop deployment mode">
                <button
                  type="button"
                  className={`install-subtab-btn ${desktopMode === 'installer' ? 'active' : ''}`}
                  onClick={() => setDesktopMode('installer')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                  <span>{t.install.desktopTabInstaller}</span>
                </button>
                <button
                  type="button"
                  className={`install-subtab-btn ${desktopMode === 'source' ? 'active' : ''}`}
                  onClick={() => setDesktopMode('source')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                  <span>{t.install.desktopTabSource}</span>
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
                      <h3>{t.install.installerHeading}</h3>
                      <p>{t.install.installerSubheading}</p>
                    </div>
                  </div>
                  <div className="installer-badge-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span>{t.install.installerRoadmapBadge}</span>
                  </div>
                </div>

                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
                  {t.install.installerIntro}
                </p>

                {/* 4 Feature Highlights */}
                <div className="installer-features-grid">
                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                    </div>
                    <div className="installer-feat-content">
                      <strong>{t.install.installerFeat1Title}</strong>
                      <p>{t.install.installerFeat1Desc}</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
                    </div>
                    <div className="installer-feat-content">
                      <strong>{t.install.installerFeat2Title}</strong>
                      <p>{t.install.installerFeat2Desc}</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <div className="installer-feat-content">
                      <strong>{t.install.installerFeat3Title}</strong>
                      <p>{t.install.installerFeat3Desc}</p>
                    </div>
                  </div>

                  <div className="installer-feature-item">
                    <div className="installer-feat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className="installer-feat-content">
                      <strong>{t.install.installerFeat4Title}</strong>
                      <p>{t.install.installerFeat4Desc}</p>
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
                      {t.install.installerBtnExe}
                    </a>
                    <a
                      href="https://github.com/Johanvasquezdev/armelis/releases"
                      target="_blank"
                      rel="noreferrer"
                      className="installer-secondary-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                      <span>{t.install.installerBtnZip}</span>
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
                    {t.install.installerPipelineNotice}
                  </span>
                </div>
              </div>
            )}

            {/* Mode 2: Build from Source */}
            {desktopMode === 'source' && (
              <div className="install-card">
                <div className="install-step">
                  <h4><span>1</span> {t.install.sourceStep1Title}</h4>
                  <p>{t.install.sourceStep1Desc}</p>
                  <div className="install-code-box">
                    <code>git clone https://github.com/Johanvasquezdev/armelis.git armelis</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('git clone https://github.com/Johanvasquezdev/armelis.git armelis', 'desktop-clone')}
                    >
                      {copiedSnippet === 'desktop-clone' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>2</span> {t.install.sourceStep2Title}</h4>
                  <p>{t.install.sourceStep2Desc}</p>
                  <div className="install-code-box">
                    <code>cd armelis/apps/desktop &amp;&amp; npm install &amp;&amp; npm run tauri dev</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('cd armelis/apps/desktop && npm install && npm run tauri dev', 'desktop-run')}
                    >
                      {copiedSnippet === 'desktop-run' ? t.install.copied : t.install.copy}
                    </button>
                  </div>
                </div>

                <div className="install-step">
                  <h4><span>3</span> {t.install.sourceStep3Title}</h4>
                  <p>{t.install.sourceStep3Desc}</p>
                  <div className="install-code-box">
                    <code>npm run tauri build</code>
                    <button
                      type="button"
                      className="install-copy-btn"
                      onClick={() => handleCopy('npm run tauri build', 'desktop-build')}
                    >
                      {copiedSnippet === 'desktop-build' ? t.install.copied : t.install.copy}
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
              <h4><span>1</span> {t.install.dockerStep1Heading}</h4>
              <p>{t.install.dockerStep1Text}</p>
              <div className="install-code-box">
                <code>- name: Armelis Choke-Point Scan\n  run: npx armelis scan . --format cef &gt; findings.cef</code>
                <button
                  type="button"
                  className="install-copy-btn"
                  onClick={() => handleCopy('- name: Armelis Choke-Point Scan\n  run: npx armelis scan . --format cef > findings.cef', 'ci-github')}
                >
                  {copiedSnippet === 'ci-github' ? t.install.copied : t.install.copy}
                </button>
              </div>
            </div>

            <div className="install-step">
              <h4><span>2</span> {t.install.dockerStep2Heading}</h4>
              <p>{t.install.dockerStep2Text}</p>
              <div className="install-code-box">
                <code>docker run --rm -v $(pwd):/repo ghcr.io/johanvasquezdev/armelis:latest scan /repo</code>
                <button
                  type="button"
                  className="install-copy-btn"
                  onClick={() => handleCopy('docker run --rm -v $(pwd):/repo ghcr.io/johanvasquezdev/armelis:latest scan /repo', 'ci-docker')}
                >
                  {copiedSnippet === 'ci-docker' ? t.install.copied : t.install.copy}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Launch Buttons */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '36px' }}>
          <Button asChild>
            <Link href="/dashboard" onClick={() => trackLiveConsoleLaunch('bottom_cta')}>
              {t.install.launchConsole} <span>→</span>
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
              <span>{t.nav.starGithub}</span>
            </a>
          </Button>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer shell" style={{ alignItems: 'center' }}>
        <span>{t.footer.tagline}</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms ease' }}>
            {t.footer.privacy}
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms ease' }}>
            {t.footer.terms}
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <a
            href="https://github.com/Johanvasquezdev/armelis"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms ease' }}
          >
            {t.footer.license}
          </a>
        </div>
        <span>{t.footer.credit}</span>
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
                aria-label={t.lightbox.close}
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
                    {t.lightbox.highlights}
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
