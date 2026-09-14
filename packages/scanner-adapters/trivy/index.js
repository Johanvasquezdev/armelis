const crypto = require('node:crypto');

const SEVERITIES = new Set(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN']);

function normalizeSeverity(value) {
  const severity = String(value || 'UNKNOWN').toUpperCase();
  return SEVERITIES.has(severity) ? severity : 'UNKNOWN';
}

function normalizeConfidence(value) {
  const confidence = String(value || '').toUpperCase();
  if (confidence === 'CONFIRMED' || confidence === 'HIGH' || confidence === 'MEDIUM' || confidence === 'LOW') {
    return confidence;
  }
  return 'HIGH';
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableId(kind, target, item) {
  const identity = [
    kind,
    target || '',
    item.VulnerabilityID || item.ID || item.RuleID || item.PkgName || item.Title || '',
    item.PkgName || item.Resource || item.Target || '',
    item.InstalledVersion || item.Line || item.StartLine || ''
  ].join('|');
  return `trivy-${sha256(identity).slice(0, 24)}`;
}

function redactEvidence(value) {
  if (Array.isArray(value)) return value.map(redactEvidence);
  if (!value || typeof value !== 'object') return value;

  const result = {};
  for (const [key, child] of Object.entries(value)) {
    if (/^(secret|match|raw|plaintext|value)$/i.test(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redactEvidence(child);
    }
  }
  return result;
}

function location(item, result) {
  const target = item.Target || result.Target || result.Class || undefined;
  const startLine = Number(item.StartLine || item.Line || 0);
  return {
    file: target,
    line: Number.isInteger(startLine) && startLine > 0 ? startLine : undefined
  };
}

function mapOwaspTop10(kind) {
  switch (kind) {
    case 'VULNERABILITY':
      return ['A06:2021'];
    case 'MISCONFIGURATION':
      return ['A05:2021'];
    case 'SECRET':
      return ['A07:2021'];
    case 'LICENSE':
      return ['A08:2021'];
    default:
      return undefined;
  }
}

function mapMitreAttack(kind) {
  switch (kind) {
    case 'VULNERABILITY':
      return [
        {
          tactic: 'Initial Access',
          technique_id: 'T1190',
          technique_name: 'Exploit Public-Facing Application',
          url: 'https://attack.mitre.org/techniques/T1190/'
        },
        {
          tactic: 'Initial Access',
          technique_id: 'T1195.002',
          technique_name: 'Supply Chain Compromise: Compromise Software Dependencies',
          url: 'https://attack.mitre.org/techniques/T1195/002/'
        }
      ];
    case 'MISCONFIGURATION':
      return [
        {
          tactic: 'Defense Evasion',
          technique_id: 'T1562.001',
          technique_name: 'Impair Defenses: Disable or Modify Tools',
          url: 'https://attack.mitre.org/techniques/T1562/001/'
        }
      ];
    case 'SECRET':
      return [
        {
          tactic: 'Credential Access',
          technique_id: 'T1552.001',
          technique_name: 'Unsecured Credentials: Credentials In Files',
          url: 'https://attack.mitre.org/techniques/T1552/001/'
        }
      ];
    case 'LICENSE':
      return [
        {
          tactic: 'Initial Access',
          technique_id: 'T1195',
          technique_name: 'Supply Chain Compromise',
          url: 'https://attack.mitre.org/techniques/T1195/'
        }
      ];
    default:
      return undefined;
  }
}

function baseFinding(kind, item, result, report) {
  const loc = location(item, result);
  const source = 'Trivy';
  const title = item.Title || item.VulnerabilityID || item.ID || item.RuleID || `${kind} finding`;
  const target = item.Target || result.Target || report.ArtifactName || report.Target || undefined;
  const finding = {
    id: stableId(kind, target, item),
    title,
    description: item.Description || item.Message || item.Status || '',
    severity: normalizeSeverity(item.Severity),
    confidence: normalizeConfidence(item.Confidence),
    source,
    category: kind === 'VULNERABILITY' ? 'Vulnerability' : kind[0] + kind.slice(1).toLowerCase(),
    finding_type: kind === 'VULNERABILITY' ? 'DEPENDENCY' : kind === 'MISCONFIGURATION' ? 'IAC' : kind,
    owasp_top10: mapOwaspTop10(kind),
    mitre_attack: mapMitreAttack(kind),
    status: 'OPEN',
    target_type: report.ArtifactType === 'container_image' ? 'IMAGE' : target ? 'FILE' : 'REPOSITORY',
    resource: item.Resource,
    file: loc.file,
    line: loc.line,
    package: item.PkgName,
    installed_version: item.InstalledVersion,
    fixed_version: item.FixedVersion,
    cve: item.VulnerabilityID && /^CVE-/i.test(item.VulnerabilityID) ? item.VulnerabilityID : undefined,
    remediation: item.FixedVersion ? `Upgrade ${item.PkgName || 'the affected package'} to ${item.FixedVersion} or later.` : item.Resolution,
    provenance: {
      scanner: source,
      scanner_version: report.SchemaVersion ? `schema-${report.SchemaVersion}` : 'unknown',
      rule_id: item.VulnerabilityID || item.ID || item.RuleID,
      raw_finding_id: item.PkgID || item.VulnerabilityID || item.ID || item.RuleID
    },
    evidence: redactEvidence({
      target: report.Target,
      artifact_name: report.ArtifactName,
      artifact_type: report.ArtifactType,
      class: result.Class,
      type: result.Type,
      item
    })
  };

  return Object.fromEntries(Object.entries(finding).filter(([, value]) => value !== undefined && value !== ''));
}

function parseResult(kind, item, result, report) {
  const finding = baseFinding(kind, item, result, report);
  if (kind === 'SECRET') finding.finding_type = 'SECRET';
  if (kind === 'LICENSE') finding.finding_type = 'LICENSE';
  if (kind === 'MISCONFIGURATION') finding.category = 'Security Misconfiguration';
  return finding;
}

function parseTrivyReport(report) {
  if (!report || typeof report !== 'object') throw new TypeError('Trivy report must be an object');
  const findings = [];
  const results = Array.isArray(report.Results) ? report.Results : [];

  for (const result of results) {
    for (const item of result.Vulnerabilities || []) findings.push(parseResult('VULNERABILITY', item, result, report));
    for (const item of result.Misconfigurations || []) findings.push(parseResult('MISCONFIGURATION', item, result, report));
    for (const item of result.Secrets || []) findings.push(parseResult('SECRET', item, result, report));
    for (const item of result.Licenses || []) findings.push(parseResult('LICENSE', item, result, report));
  }

  return {
    scanner: 'Trivy',
    scanner_version: report.TrivyVersion || 'unknown',
    target: report.ArtifactName || report.Target || undefined,
    findings,
    metadata: {
      artifact_name: report.ArtifactName,
      artifact_type: report.ArtifactType,
      repository: report.Repository,
      created_at: report.CreatedAt,
      schema_version: report.SchemaVersion,
      result_count: findings.length
    }
  };
}

function parseTrivyJson(text) {
  if (typeof text !== 'string') throw new TypeError('Trivy JSON must be a string');
  return parseTrivyReport(JSON.parse(text));
}

module.exports = { parseTrivyJson, parseTrivyReport, redactEvidence };
