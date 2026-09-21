import { Finding, FindingSeverity } from './findings';

export type GitHubScanResult = {
  ok: boolean;
  owner: string;
  repo: string;
  stars: number | null;
  defaultBranch: string;
  language: string;
  manifestPath: string | null;
  auditedCount: number;
  findings: Finding[];
  error?: string;
};

type OsvBatchItem = {
  package: {
    name: string;
    ecosystem: string;
  };
  version: string;
};

type OsvVulnSummary = {
  id: string;
  modified?: string;
};

type OsvBatchResponse = {
  results: Array<{
    vulns?: OsvVulnSummary[];
  }>;
};

function normalizeSeverity(raw?: string): FindingSeverity {
  const upper = String(raw || '').toUpperCase();
  if (upper.includes('CRIT')) return 'CRITICAL';
  if (upper.includes('HIGH')) return 'HIGH';
  if (upper.includes('MED')) return 'MEDIUM';
  if (upper.includes('LOW')) return 'LOW';
  return 'MEDIUM';
}

function cleanSemver(raw: string): string | null {
  const cleaned = raw.replace(/^[\^~>=<v\s]+/, '').split(' ')[0].trim();
  return /^\d+(\.\d+)?(\.\d+)?/.test(cleaned) ? cleaned : null;
}

/**
 * Audits a remote GitHub repository's dependency manifest via GitHub REST API + OSV.dev database
 */
export async function auditGitHubRepository(
  owner: string,
  repo: string,
  pat?: string,
  onProgress?: (step: string) => void
): Promise<GitHubScanResult> {
  onProgress?.(`Connecting to GitHub API for ${owner}/${repo}...`);

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json'
  };
  if (pat?.trim()) {
    headers['Authorization'] = `token ${pat.trim()}`;
  }

  // 1. Fetch Repository Metadata
  let stars: number | null = null;
  let defaultBranch = 'main';
  let language = 'Unknown';

  try {
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (metaRes.ok) {
      const data = await metaRes.json();
      stars = data.stargazers_count ?? null;
      defaultBranch = data.default_branch || 'main';
      language = data.language || 'Unknown';
    } else if (metaRes.status === 404) {
      return {
        ok: false,
        owner,
        repo,
        stars: null,
        defaultBranch: 'main',
        language: 'Unknown',
        manifestPath: null,
        auditedCount: 0,
        findings: [],
        error: `Repository ${owner}/${repo} not found or is private (connect token if private).`
      };
    }
  } catch {
    // network or rate limit, continue with default
  }

  // 2. Fetch Dependency Manifest
  onProgress?.(`Discovering package manifests in ${owner}/${repo} (${defaultBranch})...`);

  const manifestCandidates = [
    'package.json',
    'apps/web/package.json',
    'client/package.json',
    'frontend/package.json'
  ];

  let rawManifest: string | null = null;
  let manifestPath: string | null = null;

  for (const candidate of manifestCandidates) {
    try {
      // Try raw GitHub content directly (CORS friendly)
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${candidate}`;
      const rawRes = await fetch(rawUrl, {
        headers: pat?.trim() ? { Authorization: `token ${pat.trim()}` } : undefined
      });
      if (rawRes.ok) {
        rawManifest = await rawRes.text();
        manifestPath = candidate;
        break;
      }
    } catch {
      continue;
    }
  }

  // If no package.json found, check if Dependabot alerts exist via PAT
  if (!rawManifest && pat?.trim()) {
    try {
      onProgress?.('Querying GitHub Dependabot security alerts...');
      const depRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/dependabot/alerts?state=open&per_page=30`, { headers });
      if (depRes.ok) {
        const alerts = await depRes.json();
        if (Array.isArray(alerts) && alerts.length > 0) {
          const findings: Finding[] = alerts.map((a, idx) => {
            const adv = a.security_advisory || {};
            const vuln = a.security_vulnerability || {};
            const pkgName = vuln.package?.name || a.dependency?.package?.name || 'package';
            const cve = adv.cve_id || adv.ghsa_id || `GHSA-${idx}`;
            const sev = normalizeSeverity(adv.severity || vuln.severity);

            return {
              id: cve,
              cve,
              title: adv.summary || `Vulnerability in ${pkgName}`,
              description: adv.description?.slice(0, 300) || `Security advisory reported by GitHub Dependabot for ${pkgName}.`,
              severity: sev,
              confidence: 'CONFIRMED',
              source: 'GitHub Dependabot',
              category: 'Vulnerable Dependency',
              finding_type: 'DEPENDENCY',
              package: pkgName,
              installed_version: a.dependency?.manifest_path || 'remote',
              fixed_version: vuln.first_patched_version?.identifier,
              file: a.dependency?.manifest_path || 'package.json',
              status: 'OPEN',
              remediation: vuln.first_patched_version?.identifier
                ? `Upgrade ${pkgName} to version ${vuln.first_patched_version.identifier} or higher.`
                : `Review GitHub Dependabot alert #${a.number} and apply recommended mitigation.`,
              ai_prompt: `Task: Remediate GitHub Dependabot alert for ${pkgName} (${cve}).\nUpgrade package to ${vuln.first_patched_version?.identifier || 'safe release'}.\nAdvisory: ${adv.summary}`,
              mitre_attack: [
                {
                  tactic: 'Initial Access',
                  technique_id: 'T1195.002',
                  technique_name: 'Supply Chain Compromise: Compromise Software Dependencies',
                  url: 'https://attack.mitre.org/techniques/T1195/002/'
                }
              ],
              owasp_top10: ['A06:2021-Vulnerable and Outdated Components']
            };
          });

          return {
            ok: true,
            owner,
            repo,
            stars,
            defaultBranch,
            language,
            manifestPath: 'dependabot/alerts',
            auditedCount: alerts.length,
            findings
          };
        }
      }
    } catch {
      // ignore and fallback
    }
  }

  if (!rawManifest) {
    return {
      ok: true,
      owner,
      repo,
      stars,
      defaultBranch,
      language,
      manifestPath: null,
      auditedCount: 0,
      findings: [],
      error: `No package.json manifest found in repository root or standard paths for ${owner}/${repo}.`
    };
  }

  // 3. Parse Dependencies
  let parsedJson: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  } = {};

  try {
    parsedJson = JSON.parse(rawManifest);
  } catch {
    return {
      ok: false,
      owner,
      repo,
      stars,
      defaultBranch,
      language,
      manifestPath,
      auditedCount: 0,
      findings: [],
      error: `Invalid JSON syntax in ${manifestPath}.`
    };
  }

  const allDeps: Record<string, string> = {
    ...(parsedJson.dependencies || {}),
    ...(parsedJson.devDependencies || {})
  };

  const queries: OsvBatchItem[] = [];
  const packageVersionMap: Record<string, string> = {};

  for (const [pkgName, rawVer] of Object.entries(allDeps)) {
    if (typeof rawVer !== 'string') continue;
    const clean = cleanSemver(rawVer);
    if (!clean) continue;

    queries.push({
      package: { name: pkgName, ecosystem: 'npm' },
      version: clean
    });
    packageVersionMap[pkgName] = clean;
  }

  if (queries.length === 0) {
    return {
      ok: true,
      owner,
      repo,
      stars,
      defaultBranch,
      language,
      manifestPath,
      auditedCount: 0,
      findings: []
    };
  }

  // 4. Query Google OSV.dev Open Source Vulnerability Database
  onProgress?.(`Auditing ${queries.length} dependencies via OSV.dev & GitHub Advisories...`);

  const findings: Finding[] = [];

  try {
    // OSV allows batch queries up to 100 items per request
    const batchSize = 100;
    const batchQueries = queries.slice(0, batchSize);

    const osvRes = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries: batchQueries })
    });

    if (osvRes.ok) {
      const osvData = (await osvRes.json()) as OsvBatchResponse;
      const results = osvData.results || [];

      const vulnFetchQueue: Array<{
        vulnId: string;
        pkgName: string;
        installedVer: string;
      }> = [];

      for (let i = 0; i < results.length; i++) {
        const queryItem = batchQueries[i];
        const resItem = results[i];
        if (resItem?.vulns && resItem.vulns.length > 0) {
          // Take top vulnerability per package
          const primaryVuln = resItem.vulns[0];
          vulnFetchQueue.push({
            vulnId: primaryVuln.id,
            pkgName: queryItem.package.name,
            installedVer: queryItem.version
          });
        }
      }

      // Fetch vulnerability details in parallel (max 5)
      const detailPromises = vulnFetchQueue.slice(0, 6).map(async (item) => {
        try {
          const vRes = await fetch(`https://api.osv.dev/v1/vulns/${item.vulnId}`);
          if (vRes.ok) {
            const vData = await vRes.json();
            const cve = vData.aliases?.find((a: string) => a.startsWith('CVE-')) || item.vulnId;
            const sev = normalizeSeverity(
              vData.database_specific?.severity || vData.severity?.[0]?.score || 'HIGH'
            );

            // Extract fixed version
            let fixedVer: string | undefined;
            if (Array.isArray(vData.affected)) {
              for (const aff of vData.affected) {
                if (Array.isArray(aff.ranges)) {
                  for (const r of aff.ranges) {
                    const fixedEvent = r.events?.find((e: Record<string, string>) => Boolean(e.fixed));
                    if (fixedEvent?.fixed) {
                      fixedVer = fixedEvent.fixed;
                      break;
                    }
                  }
                }
              }
            }

            const finding: Finding = {
              id: cve,
              cve,
              title: vData.summary || `Vulnerability in ${item.pkgName} (${cve})`,
              description: vData.details
                ? vData.details.replace(/#+\s+/g, '').slice(0, 320) + '…'
                : `Known security advisory ${cve} affects ${item.pkgName} @ ${item.installedVer}.`,
              severity: sev,
              confidence: 'CONFIRMED',
              source: 'OSV / GitHub Advisory',
              category: 'Vulnerable Dependency',
              finding_type: 'DEPENDENCY',
              package: item.pkgName,
              installed_version: item.installedVer,
              fixed_version: fixedVer,
              file: manifestPath || 'package.json',
              status: 'OPEN',
              remediation: fixedVer
                ? `Upgrade ${item.pkgName} to version ${fixedVer} or higher.`
                : `Update ${item.pkgName} to the latest patched version.`,
              ai_prompt: `Task: Upgrade vulnerable package ${item.pkgName} in ${manifestPath || 'package.json'}.\n` +
                `Current Version: ${item.installedVer}\n` +
                `Recommended Version: ${fixedVer || 'latest'}\n` +
                `Vulnerability: ${cve}\n` +
                `Action: Run \`npm install ${item.pkgName}@${fixedVer || 'latest'}\` and commit the updated lockfile.`,
              mitre_attack: [
                {
                  tactic: 'Initial Access',
                  technique_id: 'T1195.002',
                  technique_name: 'Supply Chain Compromise: Compromise Software Dependencies',
                  url: 'https://attack.mitre.org/techniques/T1195/002/'
                }
              ],
              owasp_top10: ['A06:2021-Vulnerable and Outdated Components']
            };

            return finding;
          }
        } catch {
          return null;
        }
        return null;
      });

      const resolved = await Promise.all(detailPromises);
      for (const f of resolved) {
        if (f) findings.push(f);
      }
    }
  } catch {
    // OSV query failed, continue with clean
  }

  // Sort findings CRITICAL -> HIGH -> MEDIUM -> LOW
  const rank: Record<FindingSeverity, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
    UNKNOWN: 0
  };

  findings.sort((a, b) => rank[b.severity] - rank[a.severity]);

  return {
    ok: true,
    owner,
    repo,
    stars,
    defaultBranch,
    language,
    manifestPath,
    auditedCount: queries.length,
    findings
  };
}
