// Precedence of the settings: config/default.yml, then the override file, then the environment
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig } from '../src/config/index.ts';

const defaultPath = join(import.meta.dirname, '../config/default.yml');
const defaults = loadConfig({ defaultPath, overridePath: '/nonexistent' }, {});

function load(override?: string, env: NodeJS.ProcessEnv = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'notes-config-'));
  const overridePath = join(dir, 'override.yml');
  if (override !== undefined) writeFileSync(overridePath, override);
  return loadConfig({ defaultPath, overridePath }, env);
}

test('default.yml alone', () => {
  assert.equal(defaults.redis.host, '127.0.0.1');
  assert.equal(defaults.bbbWeb.port, 8090);
});

test('the override file wins and keeps the other keys', () => {
  const c = load('redis:\n  host: 10.0.0.1\n');
  assert.equal(c.redis.host, '10.0.0.1');
  assert.equal(c.redis.port, defaults.redis.port);
  assert.deepEqual(c.redis.channels, defaults.redis.channels);
});

test('an empty override file changes nothing', () => {
  assert.deepEqual(load(''), defaults);
});

const variables: Array<[string, (c: ReturnType<typeof load>) => unknown, string, unknown]> = [
  ['SERVER_HOST', (c) => c.expressServer.host, '0.0.0.0', '0.0.0.0'],
  ['REDIS_HOST', (c) => c.redis.host, 'redis', 'redis'],
  ['REDIS_PORT', (c) => c.redis.port, '6390', 6390],
  ['REDIS_PASSWORD', (c) => c.redis.password, 'secret', 'secret'],
  ['POSTGRES_HOST', (c) => c.postgres.host, 'postgres', 'postgres'],
  ['POSTGRES_PASSWORD', (c) => c.postgres.password, 'secret', 'secret'],
];

for (const [name, field, value, expected] of variables) {
  test(`${name} wins over the override file; empty does not`, () => {
    const override = 'expressServer:\n  host: 10.0.0.9\nredis:\n  host: 10.0.0.9\n  port: 6381\n  password: file\npostgres:\n  host: 10.0.0.9\n  password: file\n';
    assert.equal(field(load(override, { [name]: value })), expected);
    assert.equal(field(load(override, { [name]: '' })), field(load(override)));
  });
}

test('REDIS_PORT that is not a number keeps the file value', () => {
  assert.equal(load('redis:\n  port: 6381\n', { REDIS_PORT: 'tcp://10.0.0.1:6379' }).redis.port, 6381);
});

test('BBB_WEB_URL sets the host and port of bbb-web', () => {
  const c = load('bbbWeb:\n  host: file\n', { BBB_WEB_URL: 'http://web:8091' });
  assert.equal(c.bbbWeb.host, 'web');
  assert.equal(c.bbbWeb.port, '8091');
  assert.equal(c.bbbWeb.presentationEndpoint, defaults.bbbWeb.presentationEndpoint);
  assert.equal(load(undefined, { BBB_WEB_URL: 'http://web' }).bbbWeb.port, '80');
});

test('BBB_WEB_URL that is not http://host[:port] stops with a message', () => {
  for (const value of ['web', 'web:8090', 'https://web:8443']) {
    assert.throws(() => load(undefined, { BBB_WEB_URL: value }), /is not bbb-web's base URL: use http:\/\/host\[:port\]/, value);
  }
});

test('BBB_WEB_HOST is not read', () => {
  assert.equal(load(undefined, { BBB_WEB_HOST: 'web' }).bbbWeb.host, defaults.bbbWeb.host);
});

test('every variable that default.yml documents changes the settings', () => {
  const names = [...readFileSync(defaultPath, 'utf8').matchAll(/or ([A-Z_]+) from the environment/g)].map((m) => m[1]);
  assert.ok(names.length > 0);
  for (const name of names) {
    const value = name.endsWith('_PORT') ? '6399' : name.endsWith('_URL') ? 'http://sentinel:1' : 'sentinel';
    assert.notDeepEqual(load(undefined, { [name]: value }), defaults, `${name} changes nothing`);
  }
});
