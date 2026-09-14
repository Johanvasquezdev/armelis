'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { animate } from 'animejs';
import { gsap } from 'gsap';
import { Button } from '../components/ui/button';

const findings = [
  ['01', 'Public endpoint', 'GET /orders/:id'],
  ['02', 'Auth check missing', 'Potential exposure'],
  ['03', 'Customer data', 'Orders database']
];

function CyberScanWordmark({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`cyberscan-wordmark${large ? ' cyberscan-wordmark-large' : ''}`}
      role="img"
      aria-label="CyberScan"
    >
      <span>CYBER</span>
      <b>SCAN</b>
      <svg viewBox="0 0 420 48" aria-hidden="true">
        <path d="M8 12H172L187 29H202M412 12H248L233 29H218" />
        <circle cx="210" cy="29" r="15" />
        <circle cx="210" cy="29" r="5" />
      </svg>
    </span>
  );
}

export default function HomePage() {
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
    <main className="cyberscan-site">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      
      {/* Site Header */}
      <header className="site-header shell">
        <Link className="brand-lockup" href="/" aria-label="CyberScan home">
          <CyberScanWordmark />
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/dashboard" style={{ color: '#00e5ff', fontWeight: 700 }}>
            Live Console ↗
          </Link>
          <Link href="#how-it-works">How it works</Link>
          <Link href="#open-source">Open Source</Link>
          <Link href="#quickstart">Quickstart</Link>
          <Button asChild size="sm">
            <a
              href="https://github.com/Johanvasquezdev/CyberScan"
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
            Find the path.<br />
            <em>Fix the risk.</em>
          </h1>
          <p className="hero-lede">
            CyberScan connects your code, dependencies, containers, and configuration to show what could actually happen—and what to fix first.
          </p>
          <div className="hero-actions">
            <Button asChild>
              <Link href="/dashboard">
                Open Live Console <span>→</span>
              </Link>
            </Button>
            <a
              className="text-link"
              href="https://github.com/Johanvasquezdev/CyberScan"
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
        <div className="hero-visual" aria-label="Sample CyberScan attack path visualization">
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
            CyberScan connects code, dependencies, containers, and configuration—then turns disconnected alerts into a concrete risk path your team can understand and remediate.
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

      {/* 100% Free & Open Source Section (Replaces Commercial Pricing) */}
      <section id="open-source" className="section shell pricing-section">
        <div className="section-intro">
          <p className="eyebrow">FOSS Commitment</p>
          <h2>
            100% Free.<br />
            <em>100% Open Source.</em>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>
            No paywalls, no seat limits, and no vendor lock-in. CyberScan is published under the permissive MIT License for developers, security researchers, and SOC analysts worldwide.
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
              href="https://github.com/Johanvasquezdev/CyberScan"
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: '16px', color: '#38bdf8', fontWeight: 700 }}
            >
              View GitHub Documentation →
            </a>
          </article>
        </div>
      </section>

      {/* Quickstart Section (Replaces Commercial Waitlist) */}
      <section id="quickstart" className="waitlist shell">
        <CyberScanWordmark large />
        <p className="eyebrow" style={{ marginTop: '18px' }}>Developer Quickstart</p>
        <h2>
          Clone, Scan, and<br />
          <em>Map Your Risks.</em>
        </h2>
        <p style={{ maxWidth: '540px', margin: '16px auto 24px', color: '#94a3b8', fontSize: '15px' }}>
          Get started in 30 seconds. Run CyberScan against your own repository without signing up or submitting credentials.
        </p>

        {/* Nano-Banana Style Compact Terminal Snippet */}
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(3, 8, 20, 0.9)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#38bdf8',
            marginBottom: '28px'
          }}
        >
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <code>git clone https://github.com/Johanvasquezdev/CyberScan.git</code><br />
          <code>cd cyberscan && npm install && npm run dev</code>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button asChild>
            <Link href="/dashboard">
              Launch Live Console <span>→</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <a
              href="https://github.com/Johanvasquezdev/CyberScan"
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
        <span>CYBERSCAN</span>
        <span>100% FREE & OPEN SOURCE • MIT LICENSE</span>
        <span>DEVELOPED BY JOHAN VASQUEZ</span>
      </footer>
    </main>
  );
}
