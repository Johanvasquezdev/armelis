'use strict';

const path = require('node:path');
const { runTrivy, DEFAULT_SCANNERS } = require('../../../scanner-adapters/trivy/runner');
const { exportReport } = require('../../../scanner-adapters/trivy/siem-exporter');
const { colors, banner, severityBadge } = require('../formatter');

async function executeScan(args = {}) {
  const rawTarget = String(args.target || '.').replace(/^["']|["']$/g, '').trim();
  const resolvedTarget = path.resolve(rawTarget);
  const scanners = args.scanners || DEFAULT_SCANNERS;
  const format = args.format || 'terminal';

  const theme = args.theme || 'cold';
  if (format === 'terminal') {
    console.log(banner(theme));
    console.log(`${colors.cyan}● Target:${colors.reset}   ${resolvedTarget}`);
    console.log(`${colors.cyan}● Scanners:${colors.reset} ${scanners.join(', ')}`);
    console.log(`${colors.gray}Running Armelis ${theme === 'warm' ? 'Protective Shield Engine' : 'Analytical Defense Engine'}...${colors.reset}\n`);
  }

  let result;
  try {
    result = await runTrivy({
      target: resolvedTarget,
      workspaceRoot: process.cwd(),
      scanners
    });
  } catch (error) {
    if (format === 'terminal') {
      console.error(`${colors.red}Scan error: ${error.message}${colors.reset}`);
      console.log(`\n${colors.yellow}Tip: Make sure Trivy is installed or pass a simulated target.${colors.reset}`);
    } else {
      console.error(JSON.stringify({ status: 'FAILED', error: error.message }));
    }
    return 1;
  }

  const findings = result.findings || [];

  if (format === 'terminal') {
    console.log(`${colors.bold}Analysis Complete:${colors.reset} ${findings.length} findings normalized\n`);

    if (findings.length === 0) {
      console.log(`${colors.green}✔ No vulnerabilities or misconfigurations detected in target!${colors.reset}\n`);
      return 0;
    }

    // Print summary table
    for (let i = 0; i < Math.min(10, findings.length); i++) {
      const f = findings[i];
      const badge = severityBadge(f.severity);
      const loc = f.file ? `${f.file}:${f.line || 1}` : f.package || 'general';
      console.log(` ${badge} ${colors.bold}${f.title}${colors.reset}`);
      console.log(`    ${colors.dim}Source:${colors.reset} ${f.source}  ${colors.dim}Location:${colors.reset} ${loc}`);
      if (f.mitre_attack?.[0]) {
        console.log(`    ${colors.dim}ATT&CK:${colors.reset} ${colors.cyan}${f.mitre_attack[0].technique_id} (${f.mitre_attack[0].technique_name})${colors.reset}`);
      }
      console.log('');
    }

    if (findings.length > 10) {
      console.log(`${colors.gray}... and ${findings.length - 10} additional findings.${colors.reset}\n`);
    }

    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  armelis trace ${rawTarget}   ${colors.dim}# Visualize reachability attack paths${colors.reset}`);
    console.log(`  armelis break ${rawTarget}   ${colors.dim}# Find the single fix that breaks the chain${colors.reset}\n`);
  } else {
    const report = {
      product: 'Armelis',
      generated_at: new Date().toISOString(),
      target: resolvedTarget,
      findings
    };
    console.log(exportReport(report, format));
  }

  return 0;
}

module.exports = { executeScan };
