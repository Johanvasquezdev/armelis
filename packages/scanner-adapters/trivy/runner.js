const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { parseTrivyJson } = require('./index');

const DEFAULT_SCANNERS = ['vuln', 'misconfig', 'secret', 'license'];

function isWithinRoot(target, root) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function validateTarget(target, workspaceRoot) {
  if (typeof target !== 'string' || typeof workspaceRoot !== 'string') {
    throw new TypeError('target and workspaceRoot must be strings');
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) {
    throw new Error('Only local repository paths are allowed');
  }

  const root = path.resolve(workspaceRoot);
  const resolvedTarget = path.resolve(root, target);
  if (!isWithinRoot(resolvedTarget, root)) {
    throw new Error('Repository path is outside the configured workspace root');
  }
  if (!fs.existsSync(resolvedTarget) || !fs.statSync(resolvedTarget).isDirectory()) {
    throw new Error('Repository path must exist and be a directory');
  }
  return { root, resolvedTarget };
}

function buildTrivyArgs(target, scanners = DEFAULT_SCANNERS, extraArgs = []) {
  if (!Array.isArray(scanners) || scanners.length === 0 || scanners.some((item) => !/^[a-z]+$/.test(item))) {
    throw new Error('Scanner names must be a non-empty list of simple names');
  }
  if (!Array.isArray(extraArgs) || extraArgs.some((item) => typeof item !== 'string' || item.startsWith('-'))) {
    throw new Error('Additional Trivy arguments must be positional values only');
  }
  return ['repo', '--format', 'json', '--scanners', scanners.join(','), ...extraArgs, target];
}

function runTrivy(options) {
  const {
    target,
    workspaceRoot,
    executable = 'trivy',
    scanners = DEFAULT_SCANNERS,
    extraArgs = [],
    timeoutMs = 120000
  } = options || {};

  if (typeof executable !== 'string' || executable.length === 0) throw new TypeError('executable is required');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000) throw new Error('timeoutMs must be at least 1000ms');

  const { resolvedTarget } = validateTarget(target, workspaceRoot);
  const args = buildTrivyArgs(resolvedTarget, scanners, extraArgs);

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

module.exports = { DEFAULT_SCANNERS, buildTrivyArgs, validateTarget, runTrivy };
