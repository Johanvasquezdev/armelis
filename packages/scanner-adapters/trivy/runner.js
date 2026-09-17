const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { parseTrivyJson } = require('./index');

const DEFAULT_SCANNERS = ['vuln', 'misconfig', 'secret', 'license'];

/**
 * Glob skips so nested trees are ignored (e.g. apps/web/.next), not only repo-root names.
 * Trivy --skip-dirs accepts glob patterns.
 */
const DEFAULT_SKIP_DIRS = [
  '**/node_modules',
  '**/.git',
  '**/dist',
  '**/build',
  '**/.next',
  '**/target',
  '**/.venv',
  '**/embedding-pipeline/.cache'
];

/** Node wall-clock budget (10m). Also passed to Trivy as --timeout. */
const DEFAULT_TIMEOUT_MS = 600000;

function isWithinRoot(target, root) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function validateTarget(target, workspaceRoot) {
  if (typeof target !== 'string') {
    throw new TypeError('target and workspaceRoot must be strings');
  }
  let cleanTarget = target.trim();
  if ((cleanTarget.startsWith('"') && cleanTarget.endsWith('"')) || (cleanTarget.startsWith("'") && cleanTarget.endsWith("'"))) {
    cleanTarget = cleanTarget.slice(1, -1).trim();
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleanTarget)) {
    throw new Error('Only local repository paths are allowed');
  }

  const root = workspaceRoot ? path.resolve(workspaceRoot) : undefined;
  const isRelative = !path.isAbsolute(cleanTarget);
  const resolvedTarget = root && isRelative ? path.resolve(root, cleanTarget) : path.resolve(cleanTarget);

  if (root && isRelative && !isWithinRoot(resolvedTarget, root)) {
    throw new Error('Repository path is outside the configured workspace root');
  }
  if (!fs.existsSync(resolvedTarget) || !fs.statSync(resolvedTarget).isDirectory()) {
    throw new Error('Repository path must exist and be a directory');
  }
  return { root: root || resolvedTarget, resolvedTarget };
}

function formatTrivyTimeout(timeoutMs) {
  const seconds = Math.max(60, Math.ceil(Number(timeoutMs) / 1000));
  return `${seconds}s`;
}

function buildTrivyArgs(target, scanners = DEFAULT_SCANNERS, extraArgs = [], options = {}) {
  if (!Array.isArray(scanners) || scanners.length === 0 || scanners.some((item) => !/^[a-z]+$/.test(item))) {
    throw new Error('Scanner names must be a non-empty list of simple names');
  }
  if (!Array.isArray(extraArgs) || extraArgs.some((item) => typeof item !== 'string' || item.startsWith('-'))) {
    throw new Error('Additional Trivy arguments must be positional values only');
  }
  const skipDirs = Array.isArray(options.skipDirs) ? options.skipDirs : [];
  const skipArgs = [];
  for (const dir of skipDirs) {
    if (typeof dir === 'string' && dir.trim()) {
      skipArgs.push('--skip-dirs', dir.trim());
    }
  }
  const timeoutMs = options.timeoutMs;
  const timeoutArgs =
    Number.isInteger(timeoutMs) && timeoutMs >= 1000
      ? ['--timeout', formatTrivyTimeout(timeoutMs)]
      : [];
  return ['repo', '--format', 'json', '--scanners', scanners.join(','), ...timeoutArgs, ...skipArgs, ...extraArgs, target];
}

function runTrivy(options) {
  const {
    target,
    workspaceRoot,
    executable = 'trivy',
    scanners = DEFAULT_SCANNERS,
    extraArgs = [],
    skipDirs = DEFAULT_SKIP_DIRS,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = options || {};

  if (typeof executable !== 'string' || executable.length === 0) throw new TypeError('executable is required');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000) throw new Error('timeoutMs must be at least 1000ms');

  const { resolvedTarget } = validateTarget(target, workspaceRoot);
  const args = buildTrivyArgs(resolvedTarget, scanners, extraArgs, { skipDirs, timeoutMs });

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { shell: false, windowsHide: true });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(new Error(`Trivy could not be started: ${error.message}`));
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return reject(new Error(`Trivy scan timed out after ${timeoutMs}ms`));
      if (code !== 0) {
        return reject(new Error(`Trivy scan failed with exit code ${code}${signal ? ` (${signal})` : ''}: ${stderr.trim()}`));
      }
      try {
        resolve(parseTrivyJson(stdout));
      } catch (error) {
        reject(new Error(`Trivy returned invalid JSON: ${error.message}`));
      }
    });
  });
}

module.exports = {
  DEFAULT_SCANNERS,
  DEFAULT_SKIP_DIRS,
  DEFAULT_TIMEOUT_MS,
  buildTrivyArgs,
  formatTrivyTimeout,
  validateTarget,
  runTrivy
};
