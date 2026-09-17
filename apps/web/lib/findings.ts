/**
 * Shared Finding type + mappers for Armelis-normalized scanner JSON
 * (packages/scanner-adapters/trivy output / armelis scan --format json).
 */

export type MitreTechnique = {
  tactic: string;
  technique_id: string;
  technique_name: string;
  url?: string;
};

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | 'UNKNOWN';

export type Finding = {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
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
  ai_prompt?: string;
  status: string;
  evidence?: Record<string, unknown>;
};

/** How the dashboard currently got its findings. */
export type FindingsDataSource =
  | 'empty'
  | 'trivy-fixture'
  | 'trivy-import'
  | 'trivy-local-scan';

export type NormalizedScanEnvelope = {
  product?: string;
  generated_at?: string;
  scanner?: string;
  scanner_version?: string;
  target?: string;
  source?: string;
  findings?: unknown[];
  metadata?: Record<string, unknown>;
};

const SEVERITIES = new Set<FindingSeverity>([
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'INFO',
  'UNKNOWN'
]);

function asSeverity(value: unknown): FindingSeverity {
  const s = String(value || 'UNKNOWN').toUpperCase() as FindingSeverity;
  return SEVERITIES.has(s) ? s : 'UNKNOWN';
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

function mapMitre(raw: unknown): MitreTechnique[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const mapped: MitreTechnique[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const technique_id = asString(o.technique_id);
    const technique_name = asString(o.technique_name);
    const tactic = asString(o.tactic);
    if (!technique_id || !technique_name || !tactic) continue;
    mapped.push({
      tactic,
      technique_id,
      technique_name,
      url: asOptionalString(o.url)
    });
  }
  return mapped.length > 0 ? mapped : undefined;
}

/** Map one Armelis-normalized finding object into the dashboard Finding shape. */
export function mapNormalizedFinding(raw: unknown, index = 0): Finding | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const id = asString(o.id, `imported-finding-${index + 1}`);
  const title = asString(o.title);
  if (!title) return null;

  const severity = asSeverity(o.severity);
  // UI severity chips expect CRITICAL|HIGH|MEDIUM|LOW|INFO — fold UNKNOWN into INFO for display bars
  const uiSeverity: FindingSeverity =
    severity === 'UNKNOWN' ? 'INFO' : severity;

  return {
    id,
    title,
    description: asString(o.description),
    severity: uiSeverity,
    confidence: asString(o.confidence, 'HIGH'),
    source: asString(o.source, 'Trivy'),
    category: asString(o.category, 'Vulnerability'),
    finding_type: asString(o.finding_type, 'OTHER'),
    owasp_top10: Array.isArray(o.owasp_top10)
      ? o.owasp_top10.filter((x): x is string => typeof x === 'string')
      : undefined,
    mitre_attack: mapMitre(o.mitre_attack),
    package: asOptionalString(o.package),
    installed_version: asOptionalString(o.installed_version),
    fixed_version: asOptionalString(o.fixed_version),
    file: asOptionalString(o.file),
    line: asOptionalNumber(o.line),
    cve: asOptionalString(o.cve),
    remediation: asOptionalString(o.remediation),
    ai_prompt: asOptionalString(o.ai_prompt),
    status: asString(o.status, 'OPEN'),
    evidence:
      o.evidence && typeof o.evidence === 'object'
        ? (o.evidence as Record<string, unknown>)
        : undefined
  };
}

/**
 * Accepts either:
 * - `{ findings: [...] }` Armelis scan / fixture envelope
 * - a bare array of normalized findings
 * - `{ Results: [...] }` raw Trivy report (not preferred; tell user to use armelis scan --format json)
 */
export function extractFindingsFromJson(payload: unknown): {
  findings: Finding[];
  target?: string;
  scanner?: string;
  envelope?: NormalizedScanEnvelope;
} {
  if (Array.isArray(payload)) {
    const findings = payload
      .map((item, i) => mapNormalizedFinding(item, i))
      .filter((f): f is Finding => f !== null);
    return { findings };
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('JSON must be an object or an array of findings');
  }

  const envelope = payload as NormalizedScanEnvelope & Record<string, unknown>;

  if (Array.isArray(envelope.findings)) {
    const findings = envelope.findings
      .map((item, i) => mapNormalizedFinding(item, i))
      .filter((f): f is Finding => f !== null);
    return {
      findings,
      target: asOptionalString(envelope.target),
      scanner: asOptionalString(envelope.scanner) || 'Trivy',
      envelope
    };
  }

  // Raw Trivy report shape — reject with a clear message rather than inventing
  if (Array.isArray(envelope.Results)) {
    throw new Error(
      'This looks like raw Trivy JSON. Run `armelis scan --format json` (or scripts/scan-to-json.js) and import the normalized output.'
    );
  }

  throw new Error(
    'Unrecognized scan JSON. Expected { findings: [...] } from armelis scan --format json or the Trivy fixture.'
  );
}

export function dataSourceLabel(source: FindingsDataSource): string {
  switch (source) {
    case 'trivy-fixture':
      return 'Trivy fixture';
    case 'trivy-import':
      return 'Trivy import';
    case 'trivy-local-scan':
      return 'Trivy local scan';
    default:
      return 'No scan loaded';
  }
}

export function dataSourceBadgeColor(source: FindingsDataSource): {
  bg: string;
  border: string;
  color: string;
} {
  if (source === 'empty') {
    return {
      bg: 'rgba(100, 116, 139, 0.15)',
      border: 'rgba(148, 163, 184, 0.35)',
      color: '#94a3b8'
    };
  }
  return {
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.4)',
    color: '#38bdf8'
  };
}
