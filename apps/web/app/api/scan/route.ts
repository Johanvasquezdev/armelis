import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Optional local Trivy scan for the Next.js dashboard.
 * Disabled by default. Enable with ARMELIS_ALLOW_LOCAL_SCAN=true.
 * Target must be an absolute path under ARMELIS_SCAN_ALLOWLIST
 * (default: monorepo root two levels above apps/web).
 */

function isWithinRoot(target: string, root: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function resolveAllowlistRoot(): string {
  const fromEnv = process.env.ARMELIS_SCAN_ALLOWLIST?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  // apps/web -> repo root
  return path.resolve(process.cwd(), '../..');
}

async function loadRunTrivy(): Promise<(opts: Record<string, unknown>) => Promise<unknown>> {
  const candidates = [
    path.resolve(process.cwd(), '../../packages/scanner-adapters/trivy/runner.js'),
    path.resolve(process.cwd(), '../packages/scanner-adapters/trivy/runner.js'),
    path.resolve(process.cwd(), 'packages/scanner-adapters/trivy/runner.js')
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(/*turbopackIgnore: true*/ candidate)) continue;
    // CommonJS module — use createRequire via dynamic import of node:module
    const { createRequire } = await import('node:module');
    const require = createRequire(pathToFileURL(candidate).href);
    const mod = require(candidate) as { runTrivy?: (opts: Record<string, unknown>) => Promise<unknown> };
    if (typeof mod.runTrivy === 'function') return mod.runTrivy.bind(mod);
  }

  throw new Error(
    'Could not load packages/scanner-adapters/trivy/runner.js. Prefer: node scripts/scan-to-json.js <path> then Import scan JSON.'
  );
}

export async function POST(req: NextRequest) {
  if (process.env.ARMELIS_ALLOW_LOCAL_SCAN !== 'true') {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Local scan is disabled. Set ARMELIS_ALLOW_LOCAL_SCAN=true (and optionally ARMELIS_SCAN_ALLOWLIST) to enable, or run `armelis scan --format json` / `node scripts/scan-to-json.js <path>` and Import the JSON.'
      },
      { status: 403 }
    );
  }

  let body: { target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const target = typeof body.target === 'string' ? body.target.trim() : '';
  if (!target || !path.isAbsolute(target)) {
    return NextResponse.json(
      { ok: false, error: 'target must be an absolute local filesystem path' },
      { status: 400 }
    );
  }

  const allowRoot = resolveAllowlistRoot();
  const resolved = path.resolve(target);
  if (!isWithinRoot(resolved, allowRoot)) {
    return NextResponse.json(
      {
        ok: false,
        error: `target is outside ARMELIS_SCAN_ALLOWLIST root (${allowRoot})`
      },
      { status: 403 }
    );
  }

  if (!fs.existsSync(/*turbopackIgnore: true*/ resolved) || !fs.statSync(/*turbopackIgnore: true*/ resolved).isDirectory()) {
    return NextResponse.json(
      { ok: false, error: 'target must exist and be a directory' },
      { status: 400 }
    );
  }

  try {
    const runTrivy = await loadRunTrivy();
    const result = (await runTrivy({
      target: resolved,
      workspaceRoot: allowRoot
    })) as {
      scanner?: string;
      scanner_version?: string;
      target?: string;
      findings?: unknown[];
      metadata?: Record<string, unknown>;
    };

    return NextResponse.json({
      ok: true,
      product: 'Armelis',
      generated_at: new Date().toISOString(),
      scanner: result.scanner || 'Trivy',
      scanner_version: result.scanner_version,
      target: result.target || resolved,
      source: 'trivy-local-scan',
      findings: result.findings || [],
      metadata: result.metadata
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint:
          'Ensure the Trivy binary is on PATH, or use Import scan JSON / Load Trivy fixture instead.'
      },
      { status: 500 }
    );
  }
}
