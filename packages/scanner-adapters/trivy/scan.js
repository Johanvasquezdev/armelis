#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { runTrivy, DEFAULT_SCANNERS } = require('./runner');
const { exportReport } = require('./siem-exporter');

const VALID_FORMATS = ['json', 'cef', 'ecs', 'ndjson', 'syslog'];

function parseArgs(argv) {
  const options = { scanners: DEFAULT_SCANNERS, format: 'json' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--target') options.target = argv[++index];
    else if (arg === '--workspace-root') options.workspaceRoot = argv[++index];
    else if (arg === '--output') options.output = argv[++index];
    else if (arg === '--format') {
      const fmt = String(argv[++index] || '').toLowerCase();
      if (!VALID_FORMATS.includes(fmt)) {
        throw new Error(`Invalid format: ${fmt}. Supported: ${VALID_FORMATS.join(', ')}`);
      }
      options.format = fmt;
    }
    else if (arg === '--trivy') options.executable = argv[++index];
    else if (arg === '--timeout-ms') options.timeoutMs = Number(argv[++index]);
    else if (arg === '--scanners') options.scanners = String(argv[++index]).split(',').filter(Boolean);
    else if (arg === '--stdout') options.stdout = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function usage() {
  return [
    'CyberScan Trivy Scan & SIEM Exporter',
    '',
    'Usage:',
    '  node packages/scanner-adapters/trivy/scan.js --target <path> [options]',
    '',
    'Options:',
    '  --target <path>          Local repository path, required',
    '  --workspace-root <path>  Allowed path boundary, defaults to current directory',
    '  --output <path>          Report path, defaults to .cyberscan/scans/<timestamp>.<ext>',
    '  --format <type>          Output format: json, cef, ecs, ndjson, syslog (default: json)',
    '  --stdout                 Output results directly to stdout',
    '  --trivy <path>           Trivy executable, defaults to trivy',
    '  --scanners <list>        Comma-separated scanner list (vuln,misconfig,secret,license)',
    '  --timeout-ms <number>    Scan timeout, defaults to 120000',
    '  --help                   Show this help'
  ].join('\n');
}

function outputPath(workspaceRoot, requested, format = 'json') {
  const ext = format === 'cef' ? 'cef' : format === 'syslog' ? 'log' : 'json';
  const relative = requested || path.join('.cyberscan', 'scans', `${new Date().toISOString().replaceAll(':', '-')}.${ext}`);
  const resolved = path.resolve(workspaceRoot, relative);
  const relativeToRoot = path.relative(workspaceRoot, resolved);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    throw new Error('Output path must remain inside the workspace root');
  }
  return resolved;
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return 0;
  }
  const workspaceRoot = path.resolve(options.workspaceRoot || process.cwd());
  if (!options.target) throw new Error('--target is required');
  const output = outputPath(workspaceRoot, options.output, options.format);
  const result = await runTrivy({ ...options, workspaceRoot });

  const report = {
    product: 'CyberScan',
    generated_at: new Date().toISOString(),
    target: result.target,
    scanner: result.scanner,
    scanner_version: result.scanner_version,
    metadata: result.metadata,
    findings: result.findings
  };

  const formattedOutput = exportReport(report, options.format);

  if (options.stdout) {
    console.log(formattedOutput);
  } else {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${formattedOutput}\n`, { encoding: 'utf8', flag: 'wx' });
    console.log(JSON.stringify({
      status: 'COMPLETED',
      output,
      format: options.format,
      finding_count: result.findings.length
    }));
  }
  return 0;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(JSON.stringify({ status: 'FAILED', error: error.message }));
    process.exitCode = 1;
  });
}

module.exports = { main, outputPath, parseArgs, usage, VALID_FORMATS };
