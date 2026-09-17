#!/usr/bin/env node
'use strict';

/**
 * Wrap the Trivy adapter for dashboard import:
 *   node scripts/scan-to-json.js [target] > scan.json
 *   node scripts/scan-to-json.js C:\path\to\repo -o scan.json
 *
 * Requires the `trivy` binary on PATH.
 */

const fs = require('node:fs');
const path = require('node:path');
const { runTrivy } = require('../packages/scanner-adapters/trivy/runner');

async function main() {
  const args = process.argv.slice(2);
  let target = '.';
  let outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-o' || args[i] === '--out') {
      outFile = args[++i];
      continue;
    }
    if (args[i] === '-h' || args[i] === '--help') {
      console.error('Usage: node scripts/scan-to-json.js [target] [-o out.json]');
      process.exit(0);
    }
    if (!args[i].startsWith('-')) target = args[i];
  }

  const resolved = path.resolve(target);
  const result = await runTrivy({
    target: resolved,
    workspaceRoot: path.resolve(__dirname, '..')
  });

  const envelope = {
    product: 'Armelis',
    generated_at: new Date().toISOString(),
    scanner: result.scanner || 'Trivy',
    scanner_version: result.scanner_version,
    target: result.target || resolved,
    source: 'trivy-cli',
    findings: result.findings || [],
    metadata: result.metadata
  };

  const text = JSON.stringify(envelope, null, 2);
  if (outFile) {
    fs.writeFileSync(outFile, text, 'utf8');
    console.error(`Wrote ${result.findings?.length || 0} findings to ${outFile}`);
  } else {
    process.stdout.write(text + '\n');
  }
}

main().catch((err) => {
  console.error(err.message || err);
  console.error('Tip: install Trivy and ensure it is on PATH, or import apps/web/public/fixtures/trivy-sample-findings.json');
  process.exit(1);
});
