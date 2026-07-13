import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, dump } from 'js-yaml';

// storage.ts captures config.storage.basePath at import time, and the config
// loader reads ./config/default.yml relative to the process cwd. So, before
// importing storage, we drop a copy of the real config with basePath rewritten
// to a scratch directory and chdir into it. This exercises the genuine
// store()/usedBytes() code paths (real writes, real renames) without ever
// touching /var/bigbluebutton. node --test runs each test file in its own
// process, so the chdir is isolated to this file.

const origCwd = process.cwd();
const pkgRoot = fileURLToPath(new URL('..', import.meta.url));
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bbb-file-upload-storage-'));
const dataDir = path.join(tmpRoot, 'data');

const realConfig = load(fs.readFileSync(path.join(pkgRoot, 'config/default.yml'), 'utf8')) as {
  storage: { basePath: string; uploadsDirName: string };
};
realConfig.storage.basePath = dataDir;
fs.mkdirSync(path.join(tmpRoot, 'config'), { recursive: true });
fs.writeFileSync(path.join(tmpRoot, 'config/default.yml'), dump(realConfig));
process.chdir(tmpRoot);
// The explicit path (not just the chdir) is what pins the config: on a host
// with the service package deployed, /usr/share/.../config/default.yml exists
// and would otherwise win over the scratch ./config/default.yml.
process.env.BBB_FILE_UPLOAD_CONFIG = path.join(tmpRoot, 'config/default.yml');

const storage = await import('../src/upload/storage.ts');
const config = (await import('../src/config/index.ts')).default;

// Guard: if the loader ever resolved a different config (e.g. a real
// /usr/share or /etc file leaking into the test env), fail loud rather than
// silently write to the wrong place.
assert.equal(config.storage.basePath, dataDir, 'test config did not take effect');

after(() => {
  process.chdir(origCwd);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('isValidMeetingId accepts a plain BBB internal id', () => {
  assert.equal(storage.isValidMeetingId('abc123-DEF-456'), true);
});

test('isValidMeetingId bars path-traversal payloads', () => {
  // These are exactly the shapes that would let a crafted meetingId escape the
  // per-meeting directory. All must be refused before any path is built.
  for (const bad of ['..', '../etc', 'a/../../etc/passwd', 'a/b', 'a\\b', 'foo bar', 'foo\0bar', 'meeting.id', '.', '']) {
    assert.equal(storage.isValidMeetingId(bad), false, `should reject ${JSON.stringify(bad)}`);
  }
});

test('uploadsDir for a valid id stays inside basePath', () => {
  const dir = storage.uploadsDir('meeting-1');
  const resolved = path.resolve(dir);
  assert.equal(resolved.startsWith(path.resolve(dataDir) + path.sep), true);
  assert.equal(resolved.endsWith(path.join('meeting-1', 'uploads')), true);
});

test('store writes the file under {basePath}/{meetingId}/uploads and returns its path', () => {
  const buffer = Buffer.from('hello-image-bytes');
  const finalPath = storage.store('meeting-write', 'a1b2c3.png', buffer);

  const expected = path.join(dataDir, 'meeting-write', 'uploads', 'a1b2c3.png');
  assert.equal(finalPath, expected);
  assert.equal(fs.existsSync(expected), true);
  assert.deepEqual(fs.readFileSync(expected), buffer);
});

test('store is atomic: it leaves no .tmp file behind', () => {
  storage.store('meeting-atomic', 'final.png', Buffer.from('abc'));
  const dir = storage.uploadsDir('meeting-atomic');
  const entries = fs.readdirSync(dir);
  assert.deepEqual(entries, ['final.png']);
  assert.equal(entries.some((e) => e.endsWith('.tmp')), false);
});

test('usedBytes is 0 for a meeting with no uploads directory', () => {
  assert.equal(storage.usedBytes('meeting-never-used'), 0);
});

test('usedBytes sums the stored files for a meeting', () => {
  storage.store('meeting-quota', 'one.png', Buffer.alloc(100));
  storage.store('meeting-quota', 'two.png', Buffer.alloc(50));
  assert.equal(storage.usedBytes('meeting-quota'), 150);
});
