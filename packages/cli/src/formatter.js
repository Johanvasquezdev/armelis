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
  brightRed: isColorSupported ? '\x1b[91m' : '',
  brightCyan: isColorSupported ? '\x1b[96m' : '',
  bgCyan: isColorSupported ? '\x1b[46m\x1b[30m' : '',
  bgRed: isColorSupported ? '\x1b[41m\x1b[37m' : '',
  bgYellow: isColorSupported ? '\x1b[43m\x1b[30m' : ''
};

function banner() {
  return [
    `${colors.cyan}${colors.bold}  _  _  _____  ____   ___ _  _   _   ___ _  _ `,
    ` | || |/ _ \\ \\|  _ \\ / __| || | /_\\ |_ _| \\| |`,
    ` | __ | (_) ) | |_) | (__| __ |/ _ \\ | || .\` |`,
    ` |_||_|\\___/ /| .__/ \\___|_||_/_/ \\_\\___|_|\\_|`,
    `            /_|_|${colors.reset}`,
    ` ${colors.dim}Application Security Intelligence for AI-Assisted Teams & SOC Analysts${colors.reset}`,
    ` ${colors.dim}See every hop. Break the chain.${colors.reset}`,
    ''
  ].join('\n');
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
