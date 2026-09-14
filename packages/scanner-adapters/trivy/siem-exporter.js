const os = require('node:os');

const SEVERITY_SCORES = {
  CRITICAL: 10,
  HIGH: 8,
  MEDIUM: 6,
  LOW: 3,
  INFO: 1,
  UNKNOWN: 0
};

const SYSLOG_SEVERITIES = {
  CRITICAL: 2, // Critical
  HIGH: 3,     // Error
  MEDIUM: 4,   // Warning
  LOW: 5,      // Notice
  INFO: 6,     // Informational
  UNKNOWN: 6
};

function severityToCEF(severity) {
  const normalized = String(severity || '').toUpperCase();
  return SEVERITY_SCORES[normalized] ?? 0;
}

function escapeCEF(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/=/g, '\\=')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function toCEF(finding, metadata = {}) {
  const vendor = 'CyberScan';
  const product = 'CyberScan';
  const version = '1.0.0';
  const eventClassId = finding.finding_type || finding.category || 'VULNERABILITY';
  const name = finding.title || 'Security Finding';
  const severity = severityToCEF(finding.severity);

  const target = metadata.target || finding.resource || finding.file || 'local-repo';
  const mitrePrimary = finding.mitre_attack?.[0];
  const timestamp = metadata.created_at ? new Date(metadata.created_at).getTime() : Date.now();

  const extensions = [
    `externalId=${escapeCEF(finding.id)}`,
    `src=${escapeCEF(target)}`,
    finding.file ? `filePath=${escapeCEF(finding.file)}` : null,
    finding.line ? `fileId=${finding.line}` : null,
    finding.description ? `msg=${escapeCEF(finding.description.slice(0, 500))}` : null,
    `cat=${escapeCEF(finding.category || '')}`,
    mitrePrimary ? `cs1=${escapeCEF(mitrePrimary.technique_id)}` : null,
    mitrePrimary ? `cs1Label=mitre_technique_id` : null,
    mitrePrimary ? `cs2=${escapeCEF(mitrePrimary.technique_name)}` : null,
    mitrePrimary ? `cs2Label=mitre_technique_name` : null,
    finding.owasp_top10?.[0] ? `cs3=${escapeCEF(finding.owasp_top10[0])}` : null,
    finding.owasp_top10?.[0] ? `cs3Label=owasp_category` : null,
    finding.cve ? `cve=${escapeCEF(finding.cve)}` : null,
    finding.package ? `deviceCustomString4=${escapeCEF(finding.package)}` : null,
    finding.package ? `deviceCustomString4Label=affected_package` : null,
    finding.installed_version ? `deviceCustomString5=${escapeCEF(finding.installed_version)}` : null,
    finding.installed_version ? `deviceCustomString5Label=installed_version` : null,
    finding.fixed_version ? `deviceCustomString6=${escapeCEF(finding.fixed_version)}` : null,
    finding.fixed_version ? `deviceCustomString6Label=fixed_version` : null,
    `rt=${timestamp}`
  ].filter(Boolean).join(' ');

  return `CEF:0|${escapeCEF(vendor)}|${escapeCEF(product)}|${escapeCEF(version)}|${escapeCEF(eventClassId)}|${escapeCEF(name)}|${severity}|${extensions}`;
}

function toECS(finding, metadata = {}) {
  const timestamp = metadata.created_at || new Date().toISOString();
  const severityScore = severityToCEF(finding.severity);

  const ecsEvent = {
    '@timestamp': timestamp,
    event: {
      kind: 'alert',
      category: ['vulnerability', 'configuration'],
      type: ['info'],
      dataset: 'cyberscan.findings',
      severity: severityScore,
      outcome: finding.status === 'RESOLVED' ? 'success' : 'failure'
    },
    observer: {
      vendor: 'CyberScan',
      product: 'CyberScan',
      version: '1.0.0'
    },
    vulnerability: {
      id: finding.cve || finding.provenance?.rule_id || finding.id,
      severity: finding.severity,
      description: finding.description,
      category: finding.category,
      reference: finding.references?.[0]
    },
    rule: {
      id: finding.provenance?.rule_id,
      name: finding.title
    },
    cyberscan: {
      finding_id: finding.id,
      finding_type: finding.finding_type,
      category: finding.category,
      confidence: finding.confidence,
      owasp_top10: finding.owasp_top10,
      remediation: finding.remediation,
      scanner: finding.provenance?.scanner,
      scanner_version: finding.provenance?.scanner_version
    }
  };

  if (finding.mitre_attack && finding.mitre_attack.length > 0) {
    ecsEvent.threat = {
      framework: 'MITRE ATT&CK',
      tactic: {
        name: finding.mitre_attack[0].tactic
      },
      technique: finding.mitre_attack.map((m) => ({
        id: m.technique_id,
        name: m.technique_name,
        reference: m.url
      }))
    };
  }

  if (finding.package) {
    ecsEvent.package = {
      name: finding.package,
      version: finding.installed_version,
      fixed_version: finding.fixed_version
    };
  }

  if (finding.file) {
    ecsEvent.file = {
      path: finding.file,
      line: finding.line
    };
  }

  return ecsEvent;
}

function toSyslog(finding, metadata = {}, options = { format: 'cef' }) {
  const timestamp = metadata.created_at || new Date().toISOString();
  const hostname = os.hostname() || 'localhost';
  const pid = process.pid;

  const facility = 16; // local0
  const syslogSeverity = SYSLOG_SEVERITIES[String(finding.severity || '').toUpperCase()] ?? 6;
  const pri = facility * 8 + syslogSeverity;

  const payload = options.format === 'ecs'
    ? JSON.stringify(toECS(finding, metadata))
    : toCEF(finding, metadata);

  return `<${pri}>1 ${timestamp} ${hostname} CyberScan ${pid} ${finding.id} - ${payload}`;
}

function exportReport(report, format = 'json') {
  if (!report || !Array.isArray(report.findings)) {
    throw new TypeError('Report must be an object with a findings array');
  }

  const metadata = {
    target: report.target,
    created_at: report.generated_at || report.metadata?.created_at || new Date().toISOString()
  };

  const normalizedFormat = String(format || 'json').toLowerCase();

  switch (normalizedFormat) {
    case 'cef':
      return report.findings.map((f) => toCEF(f, metadata)).join('\n');
    case 'ecs':
    case 'ndjson':
      return report.findings.map((f) => JSON.stringify(toECS(f, metadata))).join('\n');
    case 'syslog':
      return report.findings.map((f) => toSyslog(f, metadata, { format: 'cef' })).join('\n');
    case 'json':
    default:
      return JSON.stringify(report, null, 2);
  }
}

module.exports = {
  SEVERITY_SCORES,
  severityToCEF,
  escapeCEF,
  toCEF,
  toECS,
  toSyslog,
  exportReport
};
