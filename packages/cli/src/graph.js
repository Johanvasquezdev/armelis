'use strict';

/**
 * Synthesizes an attack path graph from normalized findings.
 * Identifies:
 * - Public Ingress Hops (e.g. T1190, exposed routes, web controllers)
 * - Vulnerability Hops (e.g. CVEs, dependencies, misconfigs)
 * - Privilege Escalation / Credential Hops (e.g. T1552 secrets, IDOR, token forge)
 * - Crown-Jewel Sinks (e.g. Databases, customer PII, cloud IAM)
 */
function buildAttackGraph(findings) {
  const paths = [];

  for (const finding of findings) {
    const isPublicFacing = finding.mitre_attack?.some((m) => m.technique_id === 'T1190') ||
      finding.category?.toLowerCase().includes('ingress') ||
      finding.title?.toLowerCase().includes('remote') ||
      finding.title?.toLowerCase().includes('injection') ||
      finding.finding_type === 'DEPENDENCY';

    const hasSecret = finding.category === 'Secret' ||
      finding.title?.toLowerCase().includes('secret') ||
      finding.title?.toLowerCase().includes('token') ||
      finding.title?.toLowerCase().includes('key') ||
      finding.mitre_attack?.some((m) => m.technique_id.startsWith('T1552'));

    // Synthesize hop chain
    const hops = [
      {
        hop: 0,
        type: 'ENTRY_POINT',
        label: isPublicFacing ? 'Public Ingress Route (Web/API)' : 'Internal Service Boundary',
        resource: finding.file || 'Network Ingress',
        mitre: 'T1190'
      },
      {
        hop: 1,
        type: 'VULNERABILITY',
        label: finding.title,
        resource: finding.package || finding.file || finding.id,
        severity: finding.severity,
        cve: finding.cve
      }
    ];

    if (hasSecret) {
      hops.push({
        hop: 2,
        type: 'CREDENTIAL_EXPOSURE',
        label: 'Hardcoded Secret / Unauthenticated Token Exchange',
        resource: finding.file ? `${finding.file}:${finding.line || 1}` : 'Configuration Env',
        mitre: 'T1552.001'
      });
      hops.push({
        hop: 3,
        type: 'CROWN_JEWEL',
        label: 'Primary Database / Production Cloud Asset',
        resource: 'Production Datastore (Orders/PII)',
        impact: 'Full Data Exfiltration'
      });
    } else {
      hops.push({
        hop: 2,
        type: 'PRIVILEGE_ESCALATION',
        label: 'Arbitrary Code Execution / Context Takeover',
        resource: 'App Runtime Container',
        mitre: 'T1068'
      });
      hops.push({
        hop: 3,
        type: 'CROWN_JEWEL',
        label: 'Host Infrastructure / Internal Cluster Services',
        resource: 'Cluster Workload Node',
        impact: 'Cluster Lateral Movement'
      });
    }

    paths.push({
      id: `path-${finding.id}`,
      findingId: finding.id,
      severity: finding.severity,
      hops,
      cutCandidate: hops[1] // The primary fix node
    });
  }

  return paths;
}

/**
 * Computes the "Hopchain Break" — the minimal cut that severs attack chains.
 */
function computeBreak(paths, findings) {
  if (!paths || paths.length === 0) {
    return null;
  }

  // Frequency analysis on fixable nodes
  const nodeFrequencies = new Map();
  for (const path of paths) {
    const key = path.hops[1]?.resource || path.findingId;
    nodeFrequencies.set(key, (nodeFrequencies.get(key) || 0) + 1);
  }

  // Find most frequent single choke point
  let bestChokePoint = null;
  let maxCovered = -1;
  for (const [key, count] of nodeFrequencies.entries()) {
    if (count > maxCovered) {
      maxCovered = count;
      bestChokePoint = key;
    }
  }

  // Find related finding
  const criticalFinding = findings.find((f) => (f.package || f.file || f.id) === bestChokePoint) || findings[0];

  const affectedPaths = paths.filter((p) => p.hops[1]?.resource === bestChokePoint);
  const percentageEliminated = Math.round((affectedPaths.length / paths.length) * 100);

  // Generate deterministic AI prompt for Cursor/Claude/Copilot
  const aiPrompt = [
    `CRITICAL ATTACK PATH REMEDIATION:`,
    `Finding: ${criticalFinding.title} (${criticalFinding.severity})`,
    `File/Resource: ${criticalFinding.file || criticalFinding.package || 'Identified Dependency'}`,
    `Remediation Target: ${criticalFinding.remediation || (criticalFinding.fixed_version ? `Upgrade ${criticalFinding.package} to >= ${criticalFinding.fixed_version}` : 'Add input validation and authorization check')}`,
    ``,
    `Instruction: Apply the minimal patch to break the attack chain before it reaches sensitive assets. Verify with no regressions.`
  ].join('\n');

  return {
    chokePoint: bestChokePoint,
    criticalFinding,
    pathsSevered: affectedPaths.length,
    totalPaths: paths.length,
    percentageEliminated,
    remediationAction: criticalFinding.remediation || (criticalFinding.fixed_version ? `Upgrade ${criticalFinding.package} to ${criticalFinding.fixed_version}` : 'Patch vulnerable code path'),
    aiPrompt
  };
}

module.exports = {
  buildAttackGraph,
  computeBreak
};
