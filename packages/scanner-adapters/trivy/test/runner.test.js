const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildTrivyArgs, validateTarget } = require('../runner');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'armelis-trivy-'));
const repo = path.join(root, 'repo');
fs.mkdirSync(repo);

assert.deepEqual(buildTrivyArgs(repo), [
  'repo', '--format', 'json', '--scanners', 'vuln,misconfig,secret,license', repo
]);
assert.equal(validateTarget('repo', root).resolvedTarget, repo);
assert.throws(() => validateTarget('../outside', root), /outside/);
assert.throws(() => validateTarget('https://example.com/repo', root), /local repository/);
assert.throws(() => buildTrivyArgs(repo, ['vuln', 'bad-value']), /simple names/);
console.log('trivy runner tests: passed');
