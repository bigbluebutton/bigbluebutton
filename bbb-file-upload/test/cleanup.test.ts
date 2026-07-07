import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, dump } from 'js-yaml';

// Same approach as storage.test.ts: point the config loader at a scratch
// basePath before importing the module under test, so residualMeetingsToClean
// scans a temp tree instead of /var/bigbluebutton. Each test file runs in its
// own process, so the chdir is isolated.

const origCwd = process.cwd();
const pkgRoot = fileURLToPath(new URL('..', import.meta.url));
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bbb-file-upload-cleanup-'));
const dataDir = path.join(tmpRoot, 'data');

const realConfig = load(fs.readFileSync(path.join(pkgRoot, 'config/default.yml'), 'utf8')) as {
  storage: { basePath: string; uploadsDirName: string };
};
realConfig.storage.basePath = dataDir;
fs.mkdirSync(path.join(tmpRoot, 'config'), { recursive: true });
fs.writeFileSync(path.join(tmpRoot, 'config/default.yml'), dump(realConfig));
process.chdir(tmpRoot);

const { residualMeetingsToClean } = await import('../src/redis/cleanup.ts');
const config = (await import('../src/config/index.ts')).default;

assert.equal(config.storage.basePath, dataDir, 'test config did not take effect');

const uploadsDirName = config.storage.uploadsDirName;

function makeUploadsDir(meetingId: string): void {
  const dir = path.join(dataDir, meetingId, uploadsDirName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'file.png'), Buffer.from('x'));
}

after(() => {
  process.chdir(origCwd);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('an uploads directory for an ended meeting is selected for cleanup', () => {
  makeUploadsDir('ended-meeting');
  const stale = residualMeetingsToClean(new Set());
  assert.deepEqual(stale, ['ended-meeting']);
});

test('an uploads directory for a still-running meeting is left alone', () => {
  makeUploadsDir('live-meeting');
  const stale = residualMeetingsToClean(new Set(['live-meeting']));
  assert.equal(stale.includes('live-meeting'), false);
});

test('a meeting directory without an uploads subdir is ignored', () => {
  // e.g. a sibling recording/presentation directory under /var/bigbluebutton.
  fs.mkdirSync(path.join(dataDir, 'presentation-only', 'somethingElse'), { recursive: true });
  const stale = residualMeetingsToClean(new Set());
  assert.equal(stale.includes('presentation-only'), false);
});

test('mixed tree: ended meetings with uploads are returned, the running one is not', () => {
  makeUploadsDir('ended-a');
  makeUploadsDir('ended-b');
  makeUploadsDir('running-c');

  const stale = residualMeetingsToClean(new Set(['running-c']));
  assert.equal(stale.includes('ended-a'), true);
  assert.equal(stale.includes('ended-b'), true);
  assert.equal(stale.includes('running-c'), false);
});
