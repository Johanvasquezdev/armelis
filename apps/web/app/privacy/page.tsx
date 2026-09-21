'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--void, #040711)', color: 'var(--ink, #f4f8ff)', padding: '64px 24px 120px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--cyan, #00e5ff)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '36px',
            textDecoration: 'none'
          }}
        >
          ← Return to Armelis Home
        </Link>

        <div style={{ borderBottom: '1px solid var(--line, #18324d)', paddingBottom: '24px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--cyan, #00e5ff)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            LEGAL COMPLIANCE &amp; TELEMETRY DISCLOSURE
          </p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(34px, 5vw, 46px)', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.03em' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--muted, #8ba2bb)', fontSize: '14px', margin: 0 }}>
            Last updated: September 17, 2026 • Effective for Armelis by Johan Vasquez
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '15px', lineHeight: 1.75, color: '#cbd5e1' }}>
          <section>
            <h2 style={{ color: 'var(--ink, #ffffff)', fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
              1. Local-First &amp; Air-Gapped Philosophy
            </h2>
            <p style={{ margin: 0 }}>
              Armelis is engineered as an entirely local-first application security platform. 100% of Abstract Syntax Tree (AST) parsing, CVE vulnerability correlation, reachability graph construction, and choke-point calculations are executed strictly on your local workstation, continuous integration runner, or container runtime. None of your source code, configuration files, or vulnerabilities are transmitted to external cloud servers.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--ink, #ffffff)', fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
              2. Zero Telemetry &amp; No Tracking
            </h2>
            <p style={{ margin: 0 }}>
              Armelis does not collect, sell, or monetize user data. We employ zero tracking pixels, zero analytics cookies, and zero behavioral fingerprinting. When you use the Armelis web application or CLI, your execution footprint remains strictly private.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--ink, #ffffff)', fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
              3. GitHub API Connectivity &amp; Authentication
            </h2>
            <p style={{ margin: 0 }}>
              When analyzing remote repositories using the Live GitHub Analyzer, network requests communicate directly from your browser to GitHub&#39;s public REST API (<code>api.github.com</code>). If you provide a GitHub Personal Access Token (PAT), it is stored exclusively in your browser&#39;s local session storage (<code>sessionStorage</code>) and is never routed through any third-party intermediary.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--ink, #ffffff)', fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
              4. Enterprise SIEM Telemetry Streaming
            </h2>
            <p style={{ margin: 0 }}>
              Telemetry dispatched in Common Event Format (CEF), Elastic Common Schema (ECS), or RFC 5424 Syslog is streamed directly and exclusively to user-specified local or internal endpoints (such as your Wazuh manager, Splunk HEC, or Elasticsearch cluster). No telemetry is sent to any centralized Armelis service.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--ink, #ffffff)', fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
              5. Open-Source Governance &amp; Inquiries
            </h2>
            <p style={{ margin: 0 }}>
              Armelis is an independent open-source project authored and maintained exclusively by <strong>Johan Vasquez</strong> under the MIT License. For security disclosures or policy inquiries, please open an issue on the official GitHub repository at{' '}
              <a href="https://github.com/Johanvasquezdev/armelis" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan, #00e5ff)' }}>
                github.com/Johanvasquezdev/armelis
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
