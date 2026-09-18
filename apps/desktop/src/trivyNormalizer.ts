export type MitreTechnique = {
  tactic: string;
  technique_id: string;
  technique_name: string;
  url?: string;
};

export type CodeDiff = {
  file: string;
  before: string[];
  after: string[];
};

export type Finding = {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  confidence: string;
  source: string;
  category: string;
  finding_type: string;
  owasp_top10?: string[];
  mitre_attack?: MitreTechnique[];
  package?: string;
  installed_version?: string;
  fixed_version?: string;
  file?: string;
  line?: number;
  cve?: string;
  remediation?: string;
  code_diff?: CodeDiff;
  ai_prompt?: string;
  status: string;
  is_reachable?: boolean;
  evidence?: Record<string, unknown>;
};

export type AttackNode = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  hopNumber: number;
  isChokePoint?: boolean;
  isCrownJewel?: boolean;
  findingId?: string;
  fixedVersion?: string;
};

function normalizeSeverity(sev: unknown): Finding['severity'] {
  const s = String(sev || '').toUpperCase();
  if (s === 'CRITICAL' || s === 'HIGH' || s === 'MEDIUM' || s === 'LOW') {
    return s;
  }
  return 'INFO';
}

function redactEvidence(text: string): string {
  return text.replace(/(password|secret|token|key|bearer|apiKey)\s*[:=]\s*['"]?[^'"\s]+['"]?/gi, '$1=[REDACTED]');
}

/**
 * Normalizes raw Trivy JSON report or Armelis finding report into standard Finding[]
 */
export function normalizeTrivyReport(rawJson: string, targetPath: string): Finding[] {
  if (!rawJson || !rawJson.trim()) return [];

  let data: any;
  try {
    data = JSON.parse(rawJson);
  } catch {
    return [];
  }

  // If already normalized findings array (e.g. from Armelis API or demo)
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.findings)) {
    return data.findings;
  }

  // Parse raw Trivy Schema (SchemaVersion: 2, Results: [...])
  const results = Array.isArray(data.Results) ? data.Results : [];
  const findings: Finding[] = [];
  let counter = 0;

  for (const res of results) {
    const targetFile = res.Target || targetPath || 'manifest';

    // 1. Vulnerabilities (CVEs / Dependencies)
    if (Array.isArray(res.Vulnerabilities)) {
      for (const v of res.Vulnerabilities) {
        counter++;
        const cve = v.VulnerabilityID || `VULN-${counter}`;
        const pkg = v.PkgName || 'unknown-package';
        const installed = v.InstalledVersion || '0.0.0';
        const fixed = v.FixedVersion || undefined;
        const sev = normalizeSeverity(v.Severity);

        const title = v.Title ? `${cve}: ${v.Title}` : `${cve}: Vulnerability in ${pkg}`;
        const description = v.Description || `Known vulnerability in dependency ${pkg}@${installed}.`;
        const remediation = fixed
          ? `Upgrade ${pkg} from version ${installed} to ${fixed} or later.`
          : `Review security advisory for ${pkg}. No direct patch currently available.`;

        const codeDiff: CodeDiff = {
          file: targetFile,
          before: [`- "${pkg}": "${installed}"`],
          after: [`+ "${pkg}": "${fixed || installed + '-patched'}"`]
        };

        const aiPrompt = `Task: Mitigate ${cve} in ${pkg}.
1. Update dependency "${pkg}" from ${installed} to ${fixed || 'the latest secure patch'}.
2. Verify package-lock or lockfile resolution is updated without breaking breaking changes.
3. Run tests to ensure API compatibility.`;

        findings.push({
          id: `trivy-vuln-${counter}-${cve.toLowerCase()}`,
          title,
          description,
          severity: sev,
          confidence: 'CONFIRMED',
          source: 'Trivy',
          category: 'Vulnerability',
          finding_type: 'DEPENDENCY',
          package: pkg,
          installed_version: installed,
          fixed_version: fixed,
          file: targetFile,
          cve,
          remediation,
          code_diff: codeDiff,
          ai_prompt: aiPrompt,
          status: 'OPEN',
          is_reachable: sev === 'CRITICAL' || sev === 'HIGH',
          owasp_top10: ['A06:2021-Vulnerable and Outdated Components'],
          mitre_attack: [
            {
              tactic: 'Initial Access',
              technique_id: 'T1190',
              technique_name: 'Exploit Public-Facing Application',
              url: 'https://attack.mitre.org/techniques/T1190/'
            },
            {
              tactic: 'Initial Access',
              technique_id: 'T1195.002',
              technique_name: 'Supply Chain Compromise',
              url: 'https://attack.mitre.org/techniques/T1195/002/'
            }
          ],
          evidence: {
            primary_url: v.PrimaryURL,
            cvss: v.CVSS,
            published_date: v.PublishedDate
          }
        });
      }
    }

    // 2. Misconfigurations (IaC / Dockerfile / Policies)
    if (Array.isArray(res.Misconfigurations)) {
      for (const m of res.Misconfigurations) {
        counter++;
        const id = m.ID || `MISCONF-${counter}`;
        const sev = normalizeSeverity(m.Severity);
        const title = m.Title || `${id}: Security Misconfiguration`;
        const description = m.Description || m.Message || 'Security policy violation detected in configuration.';
        const remediation = m.Resolution || 'Update configuration according to CIS/OWASP hardening baselines.';
        const line = typeof m.IacMetadata?.StartLine === 'number' ? m.IacMetadata.StartLine : undefined;

        findings.push({
          id: `trivy-misc-${counter}-${id.toLowerCase()}`,
          title: `${id}: ${title}`,
          description,
          severity: sev,
          confidence: 'HIGH',
          source: 'Trivy',
          category: 'Misconfiguration',
          finding_type: 'IAC',
          file: targetFile,
          line,
          remediation,
          ai_prompt: `Task: Fix misconfiguration ${id} in ${targetFile}.\n${remediation}`,
          status: 'OPEN',
          is_reachable: sev === 'CRITICAL' || sev === 'HIGH',
          owasp_top10: ['A05:2021-Security Misconfiguration'],
          mitre_attack: [
            {
              tactic: 'Defense Evasion',
              technique_id: 'T1562.001',
              technique_name: 'Impair Defenses: Disable Tools',
              url: 'https://attack.mitre.org/techniques/T1562/001/'
            }
          ],
          evidence: {
            rule_id: id,
            query: m.Query,
            resolution: m.Resolution
          }
        });
      }
    }

    // 3. Secrets (Committed credentials)
    if (Array.isArray(res.Secrets)) {
      for (const s of res.Secrets) {
        counter++;
        const ruleId = s.RuleID || `SEC-${counter}`;
        const sev = normalizeSeverity(s.Severity || 'CRITICAL');
        const title = s.Title ? `${s.Title} Exposed` : `Exposed Secret: ${ruleId}`;
        const line = typeof s.StartLine === 'number' ? s.StartLine : undefined;

        findings.push({
          id: `trivy-sec-${counter}-${ruleId.toLowerCase()}`,
          title,
          description: `Plaintext credential or secret token detected in ${targetFile}:${line || 1}.`,
          severity: sev,
          confidence: 'CONFIRMED',
          source: 'Trivy',
          category: 'Secret',
          finding_type: 'SECRET',
          file: targetFile,
          line,
          remediation: 'Immediately revoke the exposed secret token, remove it from git history, and use an environment variable or secret manager.',
          ai_prompt: `Task: Eliminate hardcoded secret (${ruleId}) in ${targetFile}.\n1. Remove the plaintext credential from the code.\n2. Reference the secret securely using process.env or secret manager.\n3. Ensure the token is rotated immediately in the vendor dashboard.`,
          code_diff: {
            file: targetFile,
            before: [`- ${redactEvidence(s.Match || 'SECRET_KEY=...')}`],
            after: [`+ SECRET_KEY=process.env.SECRET_KEY`]
          },
          status: 'OPEN',
          is_reachable: true,
          owasp_top10: ['A07:2021-Identification and Authentication Failures'],
          mitre_attack: [
            {
              tactic: 'Credential Access',
              technique_id: 'T1552.001',
              technique_name: 'Credentials in Files',
              url: 'https://attack.mitre.org/techniques/T1552/001/'
            }
          ],
          evidence: {
            rule_id: ruleId,
            category: s.Category
          }
        });
      }
    }

    // 4. Licenses (Compliance notices)
    if (Array.isArray(res.Licenses)) {
      for (const l of res.Licenses) {
        counter++;
        const pkg = l.PkgName || 'package';
        const name = l.Name || 'Unknown License';
        const sev = normalizeSeverity(l.Severity || 'LOW');

        findings.push({
          id: `trivy-lic-${counter}-${pkg.toLowerCase()}`,
          title: `License Policy: ${pkg} (${name})`,
          description: `Software package ${pkg} is distributed under license: ${name}.`,
          severity: sev,
          confidence: 'CONFIRMED',
          source: 'Trivy',
          category: 'License',
          finding_type: 'LICENSE',
          package: pkg,
          file: targetFile,
          remediation: `Verify compatibility of ${name} with your organization software distribution terms.`,
          status: 'OPEN',
          is_reachable: false,
          owasp_top10: ['A08:2021-Software and Data Integrity Failures'],
          mitre_attack: [
            {
              tactic: 'Initial Access',
              technique_id: 'T1195',
              technique_name: 'Supply Chain Compromise',
              url: 'https://attack.mitre.org/techniques/T1195/'
            }
          ]
        });
      }
    }
  }

  // Sort: CRITICAL -> HIGH -> MEDIUM -> LOW -> INFO
  const rank: Record<Finding['severity'], number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1
  };

  return findings.sort((a, b) => rank[b.severity] - rank[a.severity]);
}

/**
 * Dynamically synthesizes the 5-node attack path topology graph from real findings
 */
export function synthesizeAttackTopology(findings: Finding[], targetName: string): AttackNode[] {
  // If no findings detected (secure repository)
  if (findings.length === 0) {
    return [
      {
        id: 'node-ingress',
        category: 'ENTRY POINT',
        title: 'Verified Perimeter Ingress',
        subtitle: `${targetName || 'Workspace'} • External Boundary`,
        description: 'No unauthenticated entry points exposed to vulnerable execution paths.',
        hopNumber: 1
      },
      {
        id: 'node-chokepoint',
        category: 'CHOKE POINT (DEFENDED)',
        title: 'Zero Vulnerabilities Detected',
        subtitle: 'Defensive Perimeter Intact',
        description: 'All dependencies and manifests verified against known CVEs and misconfigurations.',
        hopNumber: 2,
        isChokePoint: true
      },
      {
        id: 'node-pivot',
        category: 'LATERAL MOVEMENT',
        title: 'Internal RPC / Service Mesh',
        subtitle: 'Zero Exploitation Routes',
        description: 'Internal components isolated from lateral escalation.',
        hopNumber: 3
      },
      {
        id: 'node-secret',
        category: 'CREDENTIAL STORE',
        title: 'Secrets & IAM Sanitized',
        subtitle: 'No Plaintext Keys Detected',
        description: 'Codebase verified clean of hardcoded credentials or API tokens.',
        hopNumber: 4
      },
      {
        id: 'node-crown',
        category: 'CROWN JEWEL',
        title: 'Production Assets & Data',
        subtitle: 'Protected & Isolated',
        description: 'Core databases, infrastructure, and user data remain completely unexposed.',
        hopNumber: 5,
        isCrownJewel: true
      }
    ];
  }

  // Find the single primary choke point:
  // 1. Highest severity reachable dependency with a fixed version
  // 2. OR any Critical/High vulnerability
  // 3. OR first finding
  const chokeCandidate =
    findings.find((f) => f.finding_type === 'DEPENDENCY' && Boolean(f.fixed_version)) ||
    findings.find((f) => f.severity === 'CRITICAL') ||
    findings.find((f) => f.severity === 'HIGH') ||
    findings[0];

  // Look for any exposed secret
  const secretCandidate = findings.find((f) => f.finding_type === 'SECRET');

  // Look for any secondary vulnerability or misconfiguration
  const pivotCandidate = findings.find((f) => f.id !== chokeCandidate.id && f.finding_type !== 'SECRET');

  return [
    {
      id: 'node-ingress',
      category: 'ENTRY POINT',
      title: 'Public Inbound Gateway',
      subtitle: `${targetName || 'Workspace'} • Network Boundary`,
      description: 'External attack surface accepting input routed to internal components.',
      hopNumber: 1
    },
    {
      id: 'node-chokepoint',
      category: 'CHOKE POINT #1',
      title: chokeCandidate.package
        ? `${chokeCandidate.package} @ ${chokeCandidate.installed_version || 'installed'}`
        : chokeCandidate.title,
      subtitle: chokeCandidate.cve
        ? `${chokeCandidate.cve} • ${chokeCandidate.file || 'manifest'}`
        : `${chokeCandidate.id} • ${chokeCandidate.file || 'manifest'}`,
      description: chokeCandidate.description || 'Critical vulnerability creates a direct reachability path into internal systems.',
      hopNumber: 2,
      isChokePoint: true,
      findingId: chokeCandidate.id,
      fixedVersion: chokeCandidate.fixed_version
    },
    {
      id: 'node-pivot',
      category: 'LATERAL MOVEMENT',
      title: pivotCandidate
        ? (pivotCandidate.package ? `${pivotCandidate.package} Execution Path` : pivotCandidate.title)
        : 'Internal Service Pivot',
      subtitle: pivotCandidate?.file || 'Internal Service Communication',
      description: pivotCandidate?.description || 'Adversary leverages initial choke-point foothold to bypass perimeter defenses.',
      hopNumber: 3,
      findingId: pivotCandidate?.id
    },
    {
      id: 'node-secret',
      category: 'CREDENTIAL ACCESS',
      title: secretCandidate?.title || 'System Configuration & Auth Tokens',
      subtitle: secretCandidate?.file ? `${secretCandidate.file}:${secretCandidate.line || 1}` : 'Runtime Environment',
      description: secretCandidate?.description || 'Extracted tokens and service credentials allow unauthorized data access.',
      hopNumber: 4,
      findingId: secretCandidate?.id
    },
    {
      id: 'node-crown',
      category: 'CROWN JEWEL',
      title: 'Production Assets & Customer Data',
      subtitle: 'Target Infrastructure',
      description: 'Primary objective: proprietary source code, database stores, or customer PII.',
      hopNumber: 5,
      isCrownJewel: true
    }
  ];
}
