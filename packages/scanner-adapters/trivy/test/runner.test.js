const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildTrivyArgs, validateTarget, DEFAULT_SKIP_DIRS, formatTrivyTimeout } = require('../runner');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'armelis-trivy-'));
const repo = path.join(root, 'repo');
fs.mkdirSync(repo);

assert.equal(formatTrivyTimeout(600000), '600s');

assert.deepEqual(buildTrivyArgs(repo), [
  'repo', '--format', 'json', '--scanners', 'vuln,misconfig,secret,license', repo
]);
assert.equal(validateTarget('repo', root).resolvedTarget, repo);
assert.throws(() => validateTarget('../outside', root), /outside/);
assert.throws(() => validateTarget('https://example.com/repo', root), /local repository/);
assert.throws(() => buildTrivyArgs(repo, ['vuln', 'bad-value']), /simple names/);

assert.deepEqual(buildTrivyArgs(repo, undefined, [], { skipDirs: ['**/node_modules', '**/.next'], timeoutMs: 600000 }), [
  'repo', '--format', 'json', '--scanners', 'vuln,misconfig,secret,license',
  '--timeout', '600s',
  '--skip-dirs', '**/node_modules', '--skip-dirs', '**/.next', repo
]);

assert.ok(DEFAULT_SKIP_DIRS.includes('**/.next'));
assert.ok(DEFAULT_SKIP_DIRS.includes('**/node_modules'));
console.log('trivy runner tests: passed');
