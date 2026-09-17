'use strict';

const isColorSupported = !process.env.NO_COLOR && (process.stdout.isTTY || process.env.FORCE_COLOR);

const colors = {
  reset: isColorSupported ? '\x1b[0m' : '',
  bold: isColorSupported ? '\x1b[1m' : '',
  dim: isColorSupported ? '\x1b[2m' : '',
  italic: isColorSupported ? '\x1b[3m' : '',
  cyan: isColorSupported ? '\x1b[36m' : '',
  blue: isColorSupported ? '\x1b[34m' : '',
  green: isColorSupported ? '\x1b[32m' : '',
  yellow: isColorSupported ? '\x1b[33m' : '',
  red: isColorSupported ? '\x1b[31m' : '',
  magenta: isColorSupported ? '\x1b[35m' : '',
  gray: isColorSupported ? '\x1b[90m' : '',
  brightBlue: isColorSupported ? '\x1b[94m' : '',
  brightRed: isColorSupported ? '\x1b[91m' : '',
  brightCyan: isColorSupported ? '\x1b[96m' : '',
  bgCyan: isColorSupported ? '\x1b[46m\x1b[30m' : '',
  bgRed: isColorSupported ? '\x1b[41m\x1b[37m' : '',
  bgYellow: isColorSupported ? '\x1b[43m\x1b[30m' : ''
};

const rgb = (r, g, b) => (isColorSupported ? `\x1b[38;2;${r};${g};${b}m` : '');
const bgRgb = (r, g, b) => (isColorSupported ? `\x1b[48;2;${r};${g};${b}m` : '');

function getGitBranch() {
  try {
    const { execSync } = require('node:child_process');
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || 'main';
  } catch {
    return 'main';
  }
}

function banner(theme = 'warm') {
  const isCold = String(theme).toLowerCase().includes('cold');
  const reset = colors.reset;
  const bold = colors.bold;
  const dim = colors.dim;

  // Powerline / Breadcrumb Bar (Matching Reference Screenshot)
  const pathPart = require('node:path').basename(process.cwd()) || 'workspace';
  const branch = getGitBranch();
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

  const pathBadge = isCold
    ? bgRgb(14, 116, 144) + rgb(255, 255, 255) + bold + ` ~\\${pathPart} ` + reset
    : bgRgb(30, 64, 175) + rgb(255, 255, 255) + bold + ` ~\\${pathPart} ` + reset;
  const branchBadge = isCold
    ? bgRgb(3, 105, 161) + rgb(186, 230, 253) + ` ⎇ ${branch} ` + reset
    : bgRgb(161, 98, 7) + rgb(254, 240, 138) + ` ⎇ ${branch} ` + reset;
  const timeBadge = bgRgb(30, 41, 59) + rgb(148, 163, 184) + ` ${timeStr} ` + reset;

  const topBreadcrumb = ` ${pathBadge}${branchBadge}                                  ${timeBadge}\n`;

  // Tactical Shields (Cold with severed attack path, Warm with fortified perimeter)
  const shieldCold = [
    '   ╭───▲───╮   ',
    '  ╱  ╭─┴─╮  ╲  ',
    ' ▕  ╭┤◈ ═├╮  ▏ ',
    ' ▕  │ ╰◈╯ │  ▏ ',
    '  ╲  ╰─┬─╯  ╱  ',
    '   ╰───▼───╯   '
  ];

  const shieldWarm = [
    '   ╭───▲───╮   ',
    '  ╱  ╭─┴─╮  ╲  ',
    ' ▕  ╭┤▞ ▚├╮  ▏ ',
    ' ▕  │ ▚ ▞ │  ▏ ',
    '  ╲  ╰─┬─╯  ╱  ',
    '   ╰───▼───╯   '
  ];

  const fontARME = [
    ' █████╗ ██████╗ ███╗   ███╗███████╗',
    '██╔══██╗██╔══██╗████╗ ████║██╔════╝',
    '███████║██████╔╝██╔████╔██║█████╗  ',
    '██╔══██║██╔══██╗██║╚██╔╝██║██╔══╝  ',
    '██║  ██║██║  ██║██║ ╚═╝ ██║███████╗',
    '╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝'
  ];

  const fontLIS = [
    '██╗     ██╗███████╗',
    '██║     ██║██╔════╝',
    '██║     ██║███████╗',
    '██║     ██║╚════██║',
    '███████╗██║███████║',
    '╚══════╝╚═╝╚══════╝'
  ];

  const bracketLeft = [' ╔ ', ' ║ ', ' ║ ', ' ║ ', ' ║ ', ' ╚ '];
  const bracketRight = [' ╗', ' ║', ' ║', ' ║', ' ║', ' ╝'];

  // Right-hand Side Menu
  const menu = [
    (isCold ? rgb(0, 229, 255) : rgb(245, 158, 11)) + '> Commands' + reset,
    '  ' + bold + 'scan' + reset + '    ' + dim + 'Execute AST, CVE & secret engine' + reset,
    '  ' + bold + 'trace' + reset + '   ' + dim + 'Synthesize attack reachability graph' + reset,
    '  ' + bold + 'break' + reset + '   ' + dim + 'Pinpoint critical choke-point link' + reset,
    '  ' + bold + 'export' + reset + '  ' + dim + 'Dispatch findings in SIEM formats' + reset,
    ''
  ];

  const accent = isCold ? rgb(0, 229, 255) : rgb(245, 158, 11);
  const white = rgb(240, 246, 252);
  const shield = isCold ? shieldCold : shieldWarm;

  const renderedFont = fontARME.map((lineARME, idx) => {
    const s = accent + bold + shield[idx] + reset;
    const a = white + bold + lineARME + reset;
    const bl = accent + bold + bracketLeft[idx] + reset;
    const l = accent + bold + fontLIS[idx] + reset;
    const br = accent + bold + bracketRight[idx] + reset;
    const rightCol = menu[idx] || '';
    return s + ' ' + a + bl + l + br + '   ' + rightCol;
  }).join('\n');

  const modeLabel = isCold ? 'Cold analytical mode' : 'Warm protective';
  const subtitle = [
    '',
    ` ${dim}Application Security Intelligence & Choke-Point Defense • ${reset}${bold}${modeLabel}${reset}`,
    ` ${dim}See every hop. Sever the chain against bedrock.${reset}`,
    ''
  ].join('\n');

  return `\n${topBreadcrumb}\n${renderedFont}\n${subtitle}`;
}

function severityBadge(severity) {
  switch (String(severity).toUpperCase()) {
    case 'CRITICAL':
      return `${colors.brightRed}${colors.bold}[CRITICAL]${colors.reset}`;
    case 'HIGH':
      return `${colors.red}[HIGH]${colors.reset}`;
    case 'MEDIUM':
      return `${colors.yellow}[MEDIUM]${colors.reset}`;
    case 'LOW':
      return `${colors.blue}[LOW]${colors.reset}`;
    default:
      return `${colors.gray}[INFO]${colors.reset}`;
  }
}

function box(title, lines) {
  const content = Array.isArray(lines) ? lines : [lines];
  const width = Math.min(80, Math.max(50, ...content.map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').length + 4)));
  const top = `┌─ ${title} ${'─'.repeat(Math.max(0, width - title.length - 5))}┐`;
  const bottom = `└${'─'.repeat(width - 2)}┘`;
  const body = content.map((l) => {
    const rawLen = l.replace(/\x1b\[[0-9;]*m/g, '').length;
    const pad = ' '.repeat(Math.max(0, width - rawLen - 4));
    return `│  ${l}${pad}│`;
  }).join('\n');
  return `${top}\n${body}\n${bottom}`;
}

module.exports = {
  colors,
  banner,
  severityBadge,
  box
};
