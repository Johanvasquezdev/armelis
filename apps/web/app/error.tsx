'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Armelis Runtime Exception Caught:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--void, #040711)',
        color: 'var(--ink, #f4f8ff)',
        fontFamily: "'IBM Plex Sans', sans-serif",
        textAlign: 'center'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          padding: '40px 36px',
          borderRadius: '14px',
          border: '1px solid var(--line-bright, #21517c)',
          background: 'var(--panel, #0a1829)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 20px',
            color: '#ef4444'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 22 22 22 12 2" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: "'Gilroy', sans-serif",
            fontSize: '26px',
            margin: '0 0 10px',
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          Session Exception Intercepted
        </h2>
        <p style={{ color: 'var(--muted, #8ba2bb)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
          An unexpected error occurred in the browser runtime. Your workspace data and local security states remain protected.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: 'var(--cyan, #00e5ff)',
              color: '#040711',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Retry Session
          </button>
          <Link
            href="/"
            style={{
              background: 'transparent',
              color: 'var(--ink, #f4f8ff)',
              border: '1px solid var(--line-bright, #21517c)',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
