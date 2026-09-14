const assert = require('node:assert/strict');
const { parseTrivyReport } = require('../index');

const report = {
  SchemaVersion: 2,
  TrivyVersion: '0.60.0',
  ArtifactName: 'example-service',
  ArtifactType: 'repository',
  Results: [{
    Target: 'package-lock.json',
    Type: 'npm',
    Vulnerabilities: [{
      VulnerabilityID: 'CVE-2025-0001',
      PkgName: 'example-package',
      InstalledVersion: '1.0.0',
      FixedVersion: '1.0.1',
      Severity: 'HIGH',
      Title: 'Example vulnerability',
      Description: 'Example evidence'
    }],
    Misconfigurations: [{
      ID: 'DS-0001',
      Title: 'Run as non-root',
      Severity: 'MEDIUM',
      Resolution: 'Set a non-root user.'
    }],
    Secrets: [{
      RuleID: 'aws-access-key-id',
      Title: 'AWS Access Key',
      Severity: 'CRITICAL',
      StartLine: 12,
      Match: 'AKIA-DO-NOT-STORE'
    }],
    Licenses: [{
      Name: 'GPL-3.0',
      Severity: 'MEDIUM',
      PkgName: 'licensed-package',
      Title: 'Restricted license'
    }]
  }]
};

const parsed = parseTrivyReport(report);
assert.equal(parsed.findings.length, 4);
assert.equal(parsed.scanner, 'Trivy');
assert.equal(parsed.findings[0].finding_type, 'DEPENDENCY');
assert.equal(parsed.findings[0].cve, 'CVE-2025-0001');
assert.deepEqual(parsed.findings[0].owasp_top10, ['A06:2021']);
assert.equal(parsed.findings[0].mitre_attack[0].technique_id, 'T1190');
assert.equal(parsed.findings[1].finding_type, 'IAC');
assert.deepEqual(parsed.findings[1].owasp_top10, ['A05:2021']);
assert.equal(parsed.findings[1].mitre_attack[0].technique_id, 'T1562.001');
assert.equal(parsed.findings[2].finding_type, 'SECRET');
assert.deepEqual(parsed.findings[2].owasp_top10, ['A07:2021']);
assert.equal(parsed.findings[2].mitre_attack[0].technique_id, 'T1552.001');
assert.equal(parsed.findings[2].evidence.item.Match, '[REDACTED]');
assert.equal(parsed.findings[3].finding_type, 'LICENSE');
assert.deepEqual(parsed.findings[3].owasp_top10, ['A08:2021']);
assert.equal(parsed.findings[3].mitre_attack[0].technique_id, 'T1195');
assert.equal(parsed.findings[0].id, parseTrivyReport(report).findings[0].id);
console.log('trivy adapter tests: passed');
