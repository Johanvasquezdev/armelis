#!/usr/bin/env node
'use strict';

const { executeScan } = require('../src/commands/scan');
const { executeTrace } = require('../src/commands/trace');
const { executeBreak } = require('../src/commands/break');
const { colors, banner } = require('../src/formatter');
const pkg = require('../package.json');

function printHelp() {
  console.log(banner());
  console.log(`${colors.bold}USAGE:${colors.reset}`);
  console.log(`  hopchain <command> [target] [options]\n`);
  console.log(`${colors.bold}COMMANDS:${colors.reset}`);
  console.log(`  ${colors.cyan}scan${colors.reset} [target]      Scan repository with Trivy, normalize findings & redact secrets`);
  console.log(`  ${colors.cyan}trace${colors.reset} [target]     Trace and map reachability attack paths (hops) to crown jewels`);
  console.log(`  ${colors.cyan}break${colors.reset} [target]     Identify the single critical link that severs the attack chain`);
  console.log(`  ${colors.cyan}export${colors.reset} [target]    Stream findings in SIEM formats (CEF, ECS, Syslog)`);
  console.log(`  ${colors.cyan}version${colors.reset}          Print Hopchain version`);
  console.log(`  ${colors.cyan}help${colors.reset}             Show this help menu\n`);
  console.log(`${colors.bold}OPTIONS:${colors.reset}`);
  console.log(`  --format <fmt>       Output format: terminal, json, cef, ecs, syslog (default: terminal)`);
  console.log(`  --scanners <list>    Comma-separated list (vuln, misconfig, secret, license)`);
  console.log(`  --output <file>      Write results to custom output path`);
  console.log(`  --stdout             Stream raw exported records directly to stdout\n`);
  console.log(`${colors.bold}EXAMPLES:${colors.reset}`);
  console.log(`  hopchain scan .`);
  console.log(`  hopchain trace ./apps/web`);
  console.log(`  hopchain break .`);
  console.log(`  hopchain export . --format cef\n`);
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    return 0;
  }

  if (command === '--version' || command === '-v' || command === 'version') {
    console.log(`Hopchain v${pkg.version} (MIT License) - by Johan Vasquez`);
    return 0;
  }

  const args = {
    target: '.',
    scanners: undefined,
    format: 'terminal',
    output: undefined,
    stdout: false
  };

  let targetSet = false;
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--format' && argv[i + 1]) {
      args.format = argv[++i].toLowerCase();
    } else if (arg === '--scanners' && argv[i + 1]) {
      args.scanners = argv[++i].split(',');
    } else if (arg === '--output' && argv[i + 1]) {
      args.output = argv[++i];
    } else if (arg === '--stdout') {
      args.stdout = true;
    } else if (!arg.startsWith('-') && !targetSet) {
      args.target = arg;
      targetSet = true;
    }
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
      console.log(`Run ${colors.cyan}hopchain --help${colors.reset} for a list of available commands.\n`);
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
