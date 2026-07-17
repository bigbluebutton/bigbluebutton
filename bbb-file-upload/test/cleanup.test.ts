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
// The explicit path (not just the chdir) is what pins the config: on a host
// with the service package deployed, /usr/share/.../config/default.yml exists
// and would otherwise win over the scratch ./config/default.yml.
process.env.BBB_FILE_UPLOAD_CONFIG = path.join(tmpRoot, 'config/default.yml');

const { residualMeetingsToClean, deleteUploads, startResidualScanLoop } = await import('../src/redis/cleanup.ts');
const config = (await import('../src/config/index.ts')).default;

assert.equal(config.storage.basePath, dataDir, 'test config did not take effect');

const uploadsDirName = config.storage.uploadsDirName;
const { recordingHoldMarker } = config.cleanup;

function uploadsPath(meetingId: string): string {
  return path.join(dataDir, meetingId, uploadsDirName);
}

function makeUploadsDir(meetingId: string): void {
  const dir = uploadsPath(meetingId);
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

test('deleteUploads removes the uploads directory when no recording-hold marker is present', () => {
  makeUploadsDir('delete-me');
  assert.equal(fs.existsSync(uploadsPath('delete-me')), true);

  deleteUploads('delete-me');

  assert.equal(fs.existsSync(uploadsPath('delete-me')), false);
});

test('deleteUploads skips deletion while a recording-hold marker is present', () => {
  makeUploadsDir('held-meeting');
  const dir = uploadsPath('held-meeting');
  fs.writeFileSync(path.join(dir, recordingHoldMarker), '');

  // The archive still holds these files, so cleanup must leave the directory
  // (and the file inside it) in place and re-arm itself instead of deleting.
  deleteUploads('held-meeting');

  assert.equal(fs.existsSync(dir), true);
  assert.equal(fs.existsSync(path.join(dir, 'file.png')), true);
  assert.equal(fs.existsSync(path.join(dir, recordingHoldMarker)), true);
});

test('deleteUploads deletes anyway once the recording hold exceeds its maximum age', () => {
  makeUploadsDir('stuck-hold-meeting');
  const dir = uploadsPath('stuck-hold-meeting');
  const marker = path.join(dir, recordingHoldMarker);
  fs.writeFileSync(marker, '');

  // Backdate the marker past the cap: a hold whose archive never succeeds
  // (broken recording) must not defer the cleanup forever.
  const capMs = config.cleanup.recordingHoldMaxHours * 60 * 60 * 1000;
  const past = new Date(Date.now() - capMs - 60 * 1000);
  fs.utimesSync(marker, past, past);

  deleteUploads('stuck-hold-meeting');

  assert.equal(fs.existsSync(dir), false);
});

test('deleteUploads is a no-op for a meeting with no uploads directory', () => {
  // No throw, nothing created.
  deleteUploads('never-existed');
  assert.equal(fs.existsSync(uploadsPath('never-existed')), false);
});

test('startResidualScanLoop scans immediately and keeps re-scanning (recovers the bbb-web startup race)', async () => {
  // The startup race is the whole point: the first scan can fail (bbb-web not
  // up yet), so the loop must run again rather than skip forever. Inject a fake
  // scan and a tiny interval to prove both the immediate run and the repeat.
  let calls = 0;
  const scan = async () => { calls += 1; };
  const stop = startResidualScanLoop(scan, 15);

  // The immediate run is synchronous, so at least one scan has fired already.
  assert.equal(calls >= 1, true, 'the loop must scan once immediately at startup');

  await new Promise((resolve) => { setTimeout(resolve, 55); });
  stop();
  assert.equal(calls >= 2, true, 'the loop must keep re-scanning on its interval, not run once');
});
