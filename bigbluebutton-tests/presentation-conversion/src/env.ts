import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export const SUITE_ROOT = path.resolve(__dirname, '..');

export function loadDotEnv(file = path.join(SUITE_ROOT, '.env')): void {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=(.*?)\s*$/);
    if (!m || line.trimStart().startsWith('#')) continue;
    // Read the value as bash does when the bin/ scripts source .env: drop one pair of quotes or an unquoted " # comment".
    const quoted = m[2].trimStart().match(/^(['"])(.*?)\1(?:\s+#.*)?$/);
    const value = quoted ? quoted[2] : m[2].replace(/\s+#.*$/, '').trimStart();
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

export type Kind = 'vector' | 'raster' | 'blank' | 'any';

export interface Target {
  name: string;
  apiBase: string;
  secret: string;
  checksum: 'sha1' | 'sha256' | 'sha384' | 'sha512';
  presentationDir: string;
  meetingKey: 'internal' | 'external';
  layout: string;
  files: { svg: string; thumb: string; text: string; png: string };
  blankSvgBytes: number;
  blankText: string;
  statusSource: 'db' | 'disk';
  db?: { command: string };
  served: { base: string; token: 'pageToken-hmac-sha256' | 'none' };
  urlDocuments: { webroot: string; urlPath: string };
}

function substitute(value: unknown, where: string): unknown {
  if (typeof value === 'string') {
    return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name: string) => {
      const v = process.env[name];
      if (v === undefined || v === '') throw new Error(`${where}: environment variable ${name} is not set`);
      return v;
    });
  }
  if (Array.isArray(value)) return value.map((v) => substitute(v, where));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, substitute(v, where)]));
  }
  return value;
}

/**
 * On a BBB host the URL and shared secret can be read from bbb-web's own configuration (as bbb-conf --secret does),
 * so a run on the server needs no .env. Values already in the environment win; nothing is printed.
 */
export function detectServerDefaults(): void {
  if (process.env.BBB_URL && process.env.BBB_SECRET) return;
  const props: Record<string, string> = {};
  for (const file of ['/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties', '/etc/bigbluebutton/bbb-web.properties']) {
    try {
      for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
        if (m) props[m[1]] = m[2];
      }
    } catch {
      // not a BBB host, or not readable: the environment must provide the values
    }
  }
  if (!process.env.BBB_SECRET && props.securitySalt) process.env.BBB_SECRET = props.securitySalt;
  const server = props['bigbluebutton.web.serverURL'];
  if (!process.env.BBB_URL && server && !server.includes('${')) process.env.BBB_URL = `${server.replace(/\/$/, '')}/bigbluebutton/`;
}

export function loadTarget(): Target {
  loadDotEnv();
  detectServerDefaults();
  if (process.env.BBB_URL && !process.env.BBB_URL.endsWith('/')) process.env.BBB_URL += '/';
  const file = path.resolve(SUITE_ROOT, process.env.PC_TARGET || 'targets/bbb-web.yaml');
  const raw = YAML.parse(fs.readFileSync(file, 'utf8'));
  return substitute(raw, path.relative(SUITE_ROOT, file)) as Target;
}

export function profileName(): string {
  return process.env.PC_PROFILE || 'defaults';
}

export function runId(): string {
  if (!process.env.PC_RUN_ID) throw new Error('PC_RUN_ID is not set (playwright.config.ts sets it)');
  return process.env.PC_RUN_ID;
}

export function workDir(...parts: string[]): string {
  return path.join(SUITE_ROOT, 'work', runId(), ...parts);
}

export function profileWorkDir(...parts: string[]): string {
  return workDir(profileName(), ...parts);
}

export function serverHost(target: Target): string {
  return new URL(target.apiBase).host;
}
