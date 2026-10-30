import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { Kind, SUITE_ROOT } from './env';

export type Tier = 'synthetic' | 'repo' | 'variant' | 'runtime' | 'public' | 'private';
export type UploadMethod = 'create' | 'insertDocument' | 'create-url' | 'insertDocument-url';
export type CheckName = 'outcome' | 'pages' | 'kind' | 'aspect' | 'exif' | 'text' | 'marker' | 'pixels' | 'thumb' | 'served';

export const ALL_CHECKS: CheckName[] = ['outcome', 'pages', 'kind', 'aspect', 'exif', 'text', 'marker', 'pixels', 'thumb', 'served'];
export const ERROR_KEYS = [
  'FILE_TOO_LARGE',
  'PAGE_COUNT_EXCEEDED',
  'PAGE_COUNT_FAILED',
  'CONVERSION_TIMEOUT',
  'OFFICE_DOC_CONVERSION_FAILED',
  'OFFICE_DOC_CONVERSION_INVALID',
  'INVALID_MIME_TYPE',
  'FILE_VIRUS',
  'SCAN_FAILED',
];
export const BASE64_LIMIT = 650_000;

export interface PageSpec {
  kind?: Kind | Record<string, Kind>;
  marker?: boolean | { split: number };
  aspect?: 'auto' | 'none' | number;
}

export interface Manifest extends PageSpec {
  id: string;
  title?: string;
  tier: Tier;
  file?: string;
  generate?: { kind: string; [key: string]: unknown };
  issues?: number[];
  catalog?: string[];
  upload: {
    method: UploadMethod;
    name?: string;
    /** URL documents only: template for the URL bbb-web fetches; {base} is where the harness stages the file, {host} the server */
    url?: string;
    /** URL documents only: the file name the staged copy is served as (default: the upload name) */
    servedAs?: string;
    /** append a short PDF/JPEG-safe trailer so several uploads of one file have different bytes (default: true for variants) */
    uniqueBytes?: boolean;
  };
  pages: number;
  expect: string;
  expectByProfile?: Record<string, string>;
  pageOverrides?: Record<number, PageSpec>;
  checks?: CheckName[];
  tolerance?: { maxDiffPixelRatio?: number; threshold?: number };
  profiles?: string[];
  goldenProfiles?: string[];
  createParams?: Record<string, string>;
  notes?: string;
  /** resolved at load time */
  manifestPath: string;
  filePath?: string;
}

const FIXTURES_DIR = path.join(SUITE_ROOT, 'fixtures');

function manifestFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && e.name !== 'generators' && !e.name.startsWith('.')) walk(full);
      else if (e.isFile() && e.name.endsWith('.yaml')) out.push(full);
    }
  };
  walk(FIXTURES_DIR);
  return out.sort();
}

export function loadAllManifests(): Manifest[] {
  return manifestFiles().map((file) => {
    const raw = YAML.parse(fs.readFileSync(file, 'utf8')) as Manifest;
    raw.manifestPath = file;
    raw.upload = { ...(raw.upload || {}), method: raw.upload?.method ?? 'create' };
    raw.profiles = raw.profiles?.length ? raw.profiles : ['defaults'];
    raw.goldenProfiles = raw.goldenProfiles?.length ? raw.goldenProfiles : ['defaults'];
    if (raw.file) raw.filePath = path.resolve(path.dirname(file), raw.file);
    return raw;
  });
}

export function selectedManifests(profile: string): Manifest[] {
  const only = (process.env.PC_FIXTURES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const tiers = (process.env.PC_TIERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return loadAllManifests().filter(
    (m) =>
      m.profiles!.includes(profile) &&
      (only.length === 0 || only.includes(m.id)) &&
      (tiers.length === 0 ? m.tier !== 'private' : tiers.includes(m.tier)) &&
      (m.tier !== 'private' || (m.filePath && fs.existsSync(m.filePath))),
  );
}

export function enabledChecks(m: Manifest): CheckName[] {
  return m.checks ?? ALL_CHECKS;
}

export function expectationFor(m: Manifest, profile: string): string {
  return m.expectByProfile?.[profile] ?? m.expect;
}

export function uploadName(m: Manifest, filePath: string): string {
  return m.upload.name ?? `${m.id}${path.extname(filePath)}`;
}

function resolveKind(k: PageSpec['kind'], profile: string): Kind | undefined {
  if (k === undefined) return undefined;
  if (typeof k === 'string') return profile === 'rasterize-all' && k === 'vector' ? 'raster' : k;
  return k[profile] ?? (profile === 'rasterize-all' ? 'raster' : k.defaults);
}

export function pageSpec(m: Manifest, page: number, profile: string): { kind: Kind; marker: false | { split: number }; aspect: 'auto' | 'none' | number } {
  const o = m.pageOverrides?.[page] ?? {};
  const kind = resolveKind(o.kind, profile) ?? resolveKind(m.kind, profile) ?? 'any';
  const markerRaw = o.marker ?? m.marker ?? false;
  const marker = markerRaw === true ? { split: 1 } : markerRaw === false ? false : markerRaw;
  return { kind, marker, aspect: o.aspect ?? m.aspect ?? 'auto' };
}

export function goldenProfile(m: Manifest, profile: string): string {
  return m.goldenProfiles!.includes(profile) ? profile : 'defaults';
}

export function sha256(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/** Problems that make a manifest unusable; the CLI lint and the convert step both refuse them. */
export function lintManifests(all: Manifest[]): string[] {
  const problems: string[] = [];
  const ids = new Map<string, string>();
  for (const m of all) {
    const where = path.relative(SUITE_ROOT, m.manifestPath);
    if (!m.id || !/^[a-z0-9][a-z0-9-]*$/.test(m.id)) problems.push(`${where}: bad id "${m.id}"`);
    if (path.basename(m.manifestPath, '.yaml') !== m.id) problems.push(`${where}: file name must be ${m.id}.yaml`);
    if (ids.has(m.id)) problems.push(`${where}: duplicate id, also in ${ids.get(m.id)}`);
    ids.set(m.id, where);
    if (m.tier === 'runtime') {
      if (!m.generate?.kind) problems.push(`${where}: runtime fixtures need generate.kind`);
    } else if (m.tier !== 'private') {
      if (!m.filePath) problems.push(`${where}: missing file`);
      else if (!fs.existsSync(m.filePath)) problems.push(`${where}: file not found: ${m.file}`);
      else if (['create', 'insertDocument'].includes(m.upload.method) && fs.statSync(m.filePath).size > BASE64_LIMIT)
        problems.push(`${where}: ${fs.statSync(m.filePath).size} bytes is too big for a base64 body, use ${m.upload.method}-url`);
    }
    for (const e of [m.expect, ...Object.values(m.expectByProfile ?? {})]) {
      const ok = ['converted', 'dropped', 'measure'].includes(e) || (e?.startsWith('rejected:') && ERROR_KEYS.includes(e.slice(9)));
      if (!ok) problems.push(`${where}: unknown expectation "${e}"`);
    }
    if (typeof m.pages !== 'number') problems.push(`${where}: pages must be a number`);
    for (const c of m.checks ?? []) if (!ALL_CHECKS.includes(c)) problems.push(`${where}: unknown check "${c}"`);
    if (!['create', 'insertDocument', 'create-url', 'insertDocument-url'].includes(m.upload.method))
      problems.push(`${where}: unknown upload method "${m.upload.method}"`);
  }
  return problems;
}
