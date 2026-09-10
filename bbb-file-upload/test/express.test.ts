import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';
import { load, dump } from 'js-yaml';

// Same config-isolation approach as the other test files, plus limits shrunk so
// the express layer's own error paths are reachable with tiny fixtures: a 1KB
// multer fileSize cap (413) and a 3-requests/window rate limit (429). These
// tests exercise the real HTTP surface (multer + express-rate-limit wiring),
// asserting the error contract every response body follows: { code: '...' }.

const origCwd = process.cwd();
const pkgRoot = fileURLToPath(new URL('..', import.meta.url));
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bbb-file-upload-express-'));
const dataDir = path.join(tmpRoot, 'data');

const realConfig = load(fs.readFileSync(path.join(pkgRoot, 'config/default.yml'), 'utf8')) as {
  storage: { basePath: string };
  limits: { maxFileSizeKb: number };
  rateLimit: { maxRequestsPerWindow: number };
};
realConfig.storage.basePath = dataDir;
realConfig.limits.maxFileSizeKb = 1;
realConfig.rateLimit.maxRequestsPerWindow = 3;
fs.mkdirSync(path.join(tmpRoot, 'config'), { recursive: true });
fs.writeFileSync(path.join(tmpRoot, 'config/default.yml'), dump(realConfig));
process.chdir(tmpRoot);
// The explicit path (not just the chdir) is what pins the config: on a host
// with the service package deployed, /usr/share/.../config/default.yml exists
// and would otherwise win over the scratch ./config/default.yml.
process.env.BBB_FILE_UPLOAD_CONFIG = path.join(tmpRoot, 'config/default.yml');

const { createApp } = await import('../src/express/index.ts');
const config = (await import('../src/config/index.ts')).default;

assert.equal(config.limits.maxFileSizeKb, 1, 'test config did not take effect');

const server = createApp().listen(0, '127.0.0.1');
await once(server, 'listening');
const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

after(() => {
  server.close();
  process.chdir(origCwd);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

const BOUNDARY = 'bbb-file-upload-test-boundary';

function filePart(content: Buffer | string, name = 'file'): string {
  return [
    `--${BOUNDARY}`,
    `Content-Disposition: form-data; name="${name}"; filename="a.png"`,
    'Content-Type: image/png',
    '',
    content.toString('binary'),
    '',
  ].join('\r\n');
}

// The identity headers are normally injected by the nginx auth_request; the
// tests talk to the express app directly, so they play that role themselves.
// Each test uses its own user so the per-user+meeting rate limit buckets do
// not interfere across tests.
function post(userId: string, parts: string[]): Promise<Response> {
  const body = Buffer.from(`${parts.join('')}--${BOUNDARY}--\r\n`, 'binary');
  return fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${BOUNDARY}`,
      'meeting-id': 'meeting-express-test',
      'user-id': userId,
    },
    body,
  });
}

test('a file above the multer size cap yields 413 with code file_too_large', async () => {
  const res = await post('user-413', [filePart(Buffer.alloc(2048, 1))]);
  assert.equal(res.status, 413);
  assert.deepEqual(await res.json(), { code: 'file_too_large' });
});

test('a malformed upload (two files) yields 400 with code invalid_upload', async () => {
  const res = await post('user-400', [filePart('a'), filePart('b')]);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { code: 'invalid_upload' });
});

test('a request without a file yields 400 with code no_file', async () => {
  const res = await post('user-nofile', []);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { code: 'no_file' });
});

test('requests beyond the rate limit yield 429 with code rate_limited', async () => {
  for (let i = 0; i < config.rateLimit.maxRequestsPerWindow; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await post('user-429', []);
    assert.equal(res.status, 400, 'requests within the limit must not be rate limited');
  }
  const res = await post('user-429', []);
  assert.equal(res.status, 429);
  assert.deepEqual(await res.json(), { code: 'rate_limited' });
});
