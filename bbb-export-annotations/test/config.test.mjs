// Precedence of the bbb-export-annotations settings: default.json, then production.json in the
// /etc directory of NODE_CONFIG_DIR, then the environment variables mapped in
// custom-environment-variables.json. The config package reads everything when it is imported,
// so every case runs in its own child process.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const configModule = join(root, 'lib/utils/config.js');
const VARIABLES = Object.keys(process.env).filter((name) => /^(REDIS_|BBB_WEB_|BBB_EXPORT_ANNOTATIONS_|NODE_CONFIG)/.test(name));

function load({ production, env = {}, etcMode, fileMode } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'export-config-'));
  const def = join(dir, 'default');
  const etc = join(dir, 'etc');
  mkdirSync(def);
  mkdirSync(etc);
  for (const file of ['default.json', 'custom-environment-variables.json']) {
    copyFileSync(join(root, 'config', file), join(def, file));
  }
  if (production !== undefined) {
    writeFileSync(join(etc, 'production.json'), JSON.stringify(production));
    if (fileMode !== undefined) chmodSync(join(etc, 'production.json'), fileMode);
  }
  if (etcMode !== undefined) chmodSync(etc, etcMode);
  const childEnv = { ...process.env };
  for (const name of VARIABLES) delete childEnv[name];
  Object.assign(childEnv, { NODE_ENV: 'production', NODE_CONFIG_DIR: `${def}:${etc}`, SUPPRESS_NO_CONFIG_WARNING: 'y' }, env);
  try {
    const out = execFileSync(process.execPath, ['--input-type=module', '-e',
      `import c from ${JSON.stringify(configModule)}; console.log(JSON.stringify(c));`],
    { env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
    return JSON.parse(out.toString().trim().split('\n').pop());
  } catch (error) {
    return { crashed: true, stderr: error.stderr?.toString() };
  } finally {
    if (etcMode !== undefined) chmodSync(etc, 0o755);
  }
}

const defaults = JSON.parse(readFileSync(join(root, 'config/default.json'), 'utf8'));

test('default.json alone', () => {
  const c = load();
  assert.equal(c.bbbWebAPI, defaults.bbbWebAPI);
  assert.equal(c.redis.host, defaults.redis.host);
});

test('production.json wins over default.json and keeps the other keys', () => {
  const c = load({ production: { log: { level: 'debug' }, redis: { host: '10.0.0.1' } } });
  assert.equal(c.log.level, 'debug');
  assert.equal(c.redis.host, '10.0.0.1');
  assert.equal(c.redis.port, defaults.redis.port);
});

test('BBB_WEB_URL wins over production.json', () => {
  const c = load({ production: { bbbWebAPI: 'http://file:8090' }, env: { BBB_WEB_URL: 'http://web:8090' } });
  assert.equal(c.bbbWebAPI, 'http://web:8090');
});

test('BBB_WEB_API, bbb-apps-akka\'s API URL, is not read', () => {
  const c = load({ env: { BBB_WEB_API: 'http://web:8090/bigbluebutton/api' } });
  assert.equal(c.bbbWebAPI, defaults.bbbWebAPI);
});

test('an empty variable does not win', () => {
  const c = load({ production: { redis: { host: '10.0.0.1' } }, env: { REDIS_HOST: '', BBB_WEB_URL: '' } });
  assert.equal(c.redis.host, '10.0.0.1');
  assert.equal(c.bbbWebAPI, defaults.bbbWebAPI);
});

test('every mapped variable wins', () => {
  const c = load({ env: { REDIS_HOST: 'redis', REDIS_PASSWORD: 'secret', BBB_EXPORT_ANNOTATIONS_LOG_LEVEL: 'warn',
    BBB_EXPORT_ANNOTATIONS_PROCESS_RASTERIZE_TIMEOUT_SECONDS: '45' } });
  assert.equal(c.redis.host, 'redis');
  assert.equal(c.redis.password, 'secret');
  assert.equal(c.log.level, 'warn');
  assert.equal(c.process.rasterizeTimeoutSeconds, 45);
});

test('REDIS_PORT=6390 is a number', () => {
  assert.equal(load({ env: { REDIS_PORT: '6390' } }).redis.port, 6390);
});

// Kubernetes injects REDIS_PORT=tcp://<ip>:6379 for a Service named redis.
test('REDIS_PORT=tcp://10.0.0.1:6379 keeps the file value', () => {
  const c = load({ env: { REDIS_PORT: 'tcp://10.0.0.1:6379' } });
  assert.equal(c.crashed, undefined);
  assert.equal(c.redis.port, defaults.redis.port);
});

// What `bbb-conf --check` warns about: an override the service user cannot read. In a directory
// it cannot list, the file is skipped and the defaults are used; a file it cannot read stops it.
test('a production.json in a directory the service user cannot list is skipped', (t) => {
  if (process.getuid() === 0) return t.skip('root reads anything');
  const c = load({ production: { log: { level: 'debug' } }, etcMode: 0o000 });
  assert.equal(c.crashed, undefined);
  assert.equal(c.log.level, defaults.log.level);
});

test('a production.json the service user cannot read stops the service', (t) => {
  if (process.getuid() === 0) return t.skip('root reads anything');
  const c = load({ production: { log: { level: 'debug' } }, fileMode: 0o000 });
  assert.equal(c.crashed, true);
  assert.match(c.stderr, /cannot be read/);
});

test('docker/README.md lists the variables of custom-environment-variables.json', () => {
  const names = JSON.stringify(JSON.parse(readFileSync(join(root, 'config/custom-environment-variables.json'), 'utf8')))
    .match(/"[A-Z][A-Z0-9_]+"/g).map((n) => n.slice(1, -1));
  const readme = readFileSync(join(root, '../docker/README.md'), 'utf8');
  const entry = readme.slice(readme.indexOf('- **bbb-export-annotations**'), readme.indexOf('- **bbb-record-and-playback**'));
  for (const name of names) {
    const listed = entry.includes(name) || (name.startsWith('BBB_EXPORT_ANNOTATIONS_') && entry.includes('BBB_EXPORT_ANNOTATIONS_*'));
    assert.ok(listed, `${name} is not in the bbb-export-annotations entry of docker/README.md`);
  }
});
