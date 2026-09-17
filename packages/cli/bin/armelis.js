#!/usr/bin/env node
'use strict';

const { executeScan } = require('../src/commands/scan');
const { executeTrace } = require('../src/commands/trace');
const { executeBreak } = require('../src/commands/break');
const { colors, banner } = require('../src/formatter');
const pkg = require('../package.json');

function printHelp(theme = 'warm') {
  console.log(banner(theme));
  console.log(`${colors.bold}USAGE:${colors.reset}`);
  console.log(`  armelis <command> [target] [options]\n`);
  console.log(`${colors.bold}COMMANDS:${colors.reset}`);
  console.log(`  ${colors.cyan}scan${colors.reset} [target]      Scan target with Trivy, IaC & secrets, normalize findings`);
  console.log(`  ${colors.cyan}trace${colors.reset} [target]     Trace and synthesize reachability attack paths (hops)`);
  console.log(`  ${colors.cyan}break${colors.reset} [target]     Pinpoint the critical choke-point link that severs the chain`);
  console.log(`  ${colors.cyan}export${colors.reset} [target]    Stream findings in SIEM formats (CEF, ECS, Syslog)`);
  console.log(`  ${colors.cyan}version${colors.reset}          Print Armelis version`);
  console.log(`  ${colors.cyan}help${colors.reset}             Show this help menu\n`);
  console.log(`${colors.bold}OPTIONS:${colors.reset}`);
  console.log(`  --theme <mode>       Visual theme: "cold" (Cold analytical mode) or "warm" (Warm protective)`);
  console.log(`  --cold               Quick switch to Cold analytical mode`);
  console.log(`  --warm               Quick switch to Warm protective`);
  console.log(`  --format <fmt>       Output format: terminal, json, cef, ecs, syslog (default: terminal)`);
  console.log(`  --scanners <list>    Comma-separated list (vuln, misconfig, secret, license)`);
  console.log(`  --output <file>      Write results to custom output path`);
  console.log(`  --stdout             Stream raw exported records directly to stdout\n`);
  console.log(`${colors.bold}EXAMPLES:${colors.reset}`);
  console.log(`  armelis scan .`);
  console.log(`  armelis scan "C:\\Users\\johan\\Projects\\storefront" --cold`);
  console.log(`  armelis trace ./apps/web`);
  console.log(`  armelis break .`);
  console.log(`  armelis export . --format cef\n`);
}

async function main() {
  const argv = process.argv.slice(2);
  let theme = 'warm';
  if (argv.includes('--cold') || argv.includes('-c')) {
    theme = 'cold';
  } else if (argv.includes('--warm') || argv.includes('-w')) {
    theme = 'warm';
  } else if (argv.includes('--theme')) {
    const tIdx = argv.indexOf('--theme');
    if (argv[tIdx + 1]) theme = argv[tIdx + 1];
  }

  const nonFlags = argv.filter((a) => !a.startsWith('-'));

  if (argv.includes('--version') || argv.includes('-v') || nonFlags[0] === 'version') {
    console.log(`Armelis v${pkg.version} (MIT License) - by Johan Vasquez`);
    return 0;
  }

  const command = nonFlags[0] || (argv.includes('-h') || argv.includes('--help') ? 'help' : undefined);

  if (!command || command === 'help') {
    printHelp(theme);
    return 0;
  }

  const args = {
    target: '.',
    scanners: undefined,
    format: 'terminal',
    theme,
    output: undefined,
    stdout: false
  };

  // Flatten any arguments that bundled flags due to Windows backslash-quote escaping
  const normalizedArgv = [];
  for (let i = 1; i < argv.length; i++) {
    const raw = argv[i];
    if (raw.includes(' --')) {
      const splitParts = raw.split(' --');
      normalizedArgv.push(splitParts[0]);
      for (let s = 1; s < splitParts.length; s++) {
        normalizedArgv.push('--' + splitParts[s]);
      }
    } else {
      normalizedArgv.push(raw);
    }
  }

  const targetParts = [];
  for (let i = 0; i < normalizedArgv.length; i++) {
    const arg = normalizedArgv[i];
    if (arg === '--format' && normalizedArgv[i + 1]) {
      args.format = normalizedArgv[++i].toLowerCase();
    } else if (arg === '--theme' && normalizedArgv[i + 1]) {
      args.theme = normalizedArgv[++i].toLowerCase();
    } else if (arg === '--cold' || arg === '-c') {
      args.theme = 'cold';
    } else if (arg === '--warm' || arg === '-w') {
      args.theme = 'warm';
    } else if (arg === '--scanners' && normalizedArgv[i + 1]) {
      args.scanners = normalizedArgv[++i].split(',');
    } else if (arg === '--output' && normalizedArgv[i + 1]) {
      args.output = normalizedArgv[++i];
    } else if (arg === '--stdout') {
      args.stdout = true;
    } else if (!arg.startsWith('-')) {
      targetParts.push(arg);
    }
  }

  if (targetParts.length > 0) {
    args.target = targetParts.join(' ').replace(/^["']|["']$/g, '').trim();
  }

  switch (command) {
    case 'scan':
      return await executeScan(args);
    case 'trace':
    case 'graph':
      return await executeTrace(args);
    case 'break':
    case 'fix':
      return await executeBreak(args);
    case 'export':
      if (args.format === 'terminal') args.format = 'cef';
      return await executeScan(args);
    default:
      console.error(`${colors.red}Unknown command: '${command}'${colors.reset}`);
      console.log(`Run ${colors.cyan}armelis --help${colors.reset} for a list of available commands.\n`);
      return 1;
  }
}

if (require.main === module) {
  main().then((code) => {
    if (code) process.exit(code);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
