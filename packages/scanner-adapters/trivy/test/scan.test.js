const assert = require('node:assert/strict');
const path = require('node:path');
const { outputPath, parseArgs } = require('../scan');

const root = path.resolve('test-workspace');
const parsed = parseArgs(['--target', 'repo', '--scanners', 'vuln,secret', '--timeout-ms', '5000']);
assert.equal(parsed.target, 'repo');
assert.deepEqual(parsed.scanners, ['vuln', 'secret']);
assert.equal(parsed.timeoutMs, 5000);
assert.equal(outputPath(root, 'reports/result.json'), path.join(root, 'reports', 'result.json'));
assert.equal(outputPath(root, null, 'cef').endsWith('.cef'), true);
assert.equal(outputPath(root, null, 'syslog').endsWith('.log'), true);
assert.equal(parseArgs(['--target', 'repo', '--format', 'cef']).format, 'cef');
assert.throws(() => parseArgs(['--target', 'repo', '--format', 'invalid']), /Invalid format/);
assert.throws(() => outputPath(root, '../outside.json'), /inside/);
console.log('scan command tests: passed');
