const assert = require('node:assert/strict');
const {
  severityToCEF,
  escapeCEF,
  toCEF,
  toECS,
  toSyslog,
  exportReport
} = require('../siem-exporter');

// 1. Test severity conversion
assert.equal(severityToCEF('CRITICAL'), 10);
assert.equal(severityToCEF('HIGH'), 8);
assert.equal(severityToCEF('MEDIUM'), 6);
assert.equal(severityToCEF('LOW'), 3);
assert.equal(severityToCEF('INFO'), 1);
assert.equal(severityToCEF('UNKNOWN'), 0);

// 2. Test CEF escaping
assert.equal(escapeCEF('key=value|other\\test\nline'), 'key\\=value\\|other\\\\test\\nline');

// 3. Sample finding with MITRE and OWASP mapping
const sampleFinding = {
  id: 'trivy-abc1234567890',
  title: 'CVE-2025-1337 Vulnerability in lodash',
  description: 'Prototype pollution in lodash',
  severity: 'CRITICAL',
  confidence: 'HIGH',
  source: 'Trivy',
  category: 'Vulnerability',
  finding_type: 'DEPENDENCY',
  owasp_top10: ['A06:2021'],
  mitre_attack: [
    {
      tactic: 'Initial Access',
      technique_id: 'T1190',
      technique_name: 'Exploit Public-Facing Application',
      url: 'https://attack.mitre.org/techniques/T1190/'
    }
  ],
  package: 'lodash',
  installed_version: '4.17.20',
  fixed_version: '4.17.21',
  cve: 'CVE-2025-1337',
  file: 'package.json',
  line: 42,
  status: 'OPEN',
  provenance: {
    scanner: 'Trivy',
    scanner_version: '0.60.0',
    rule_id: 'CVE-2025-1337'
  }
};

const report = {
  product: 'Armelis',
  generated_at: '2026-09-14T12:00:00.000Z',
  target: 'my-service',
  findings: [sampleFinding]
};

// 4. Test toCEF
const cef = toCEF(sampleFinding, { target: 'my-service' });
assert.ok(cef.startsWith('CEF:0|Armelis|Armelis|1.0.0|DEPENDENCY|CVE-2025-1337 Vulnerability in lodash|10|'));
assert.ok(cef.includes('externalId=trivy-abc1234567890'));
assert.ok(cef.includes('cs1=T1190'));
assert.ok(cef.includes('cs1Label=mitre_technique_id'));
assert.ok(cef.includes('cs2=Exploit Public-Facing Application'));
assert.ok(cef.includes('cs3=A06:2021'));
assert.ok(cef.includes('cve=CVE-2025-1337'));
assert.ok(cef.includes('deviceCustomString4=lodash'));

// 5. Test toECS
const ecs = toECS(sampleFinding, { target: 'my-service', created_at: report.generated_at });
assert.equal(ecs['@timestamp'], '2026-09-14T12:00:00.000Z');
assert.equal(ecs.event.dataset, 'armelis.findings');
assert.equal(ecs.event.severity, 10);
assert.equal(ecs.vulnerability.id, 'CVE-2025-1337');
assert.equal(ecs.threat.framework, 'MITRE ATT&CK');
assert.equal(ecs.threat.technique[0].id, 'T1190');
assert.equal(ecs.package.name, 'lodash');
assert.equal(ecs.file.path, 'package.json');
assert.equal(ecs.file.line, 42);

// 6. Test toSyslog
const syslog = toSyslog(sampleFinding, { target: 'my-service' });
assert.ok(syslog.startsWith('<130>1 ')); // facility 16*8 + CRITICAL 2 = 130
assert.ok(syslog.includes('Armelis'));
assert.ok(syslog.includes('trivy-abc1234567890'));
assert.ok(syslog.includes('CEF:0|Armelis'));

// 7. Test exportReport
const exportedJson = exportReport(report, 'json');
assert.ok(JSON.parse(exportedJson).findings.length === 1);

const exportedCEF = exportReport(report, 'cef');
assert.ok(exportedCEF.startsWith('CEF:0|Armelis'));

const exportedECS = exportReport(report, 'ecs');
const parsedECS = JSON.parse(exportedECS);
assert.equal(parsedECS.observer.vendor, 'Armelis');

const exportedSyslog = exportReport(report, 'syslog');
assert.ok(exportedSyslog.includes('<130>1 '));

console.log('siem-exporter tests: passed');
