import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, dump } from 'js-yaml';

// inlineHostImages reads uploads from config.fileUpload.basePath, and the config
// loader reads ./config/default.yml relative to the process cwd. So, before
// importing the handler, we drop a copy of the real config with basePath
// rewritten to a scratch directory and chdir into it. This exercises the genuine
// disk-read code path without ever touching /var/bigbluebutton. node --test runs
// each test file in its own process, so the chdir is isolated to this file.

const origCwd = process.cwd();
const pkgRoot = fileURLToPath(new URL('..', import.meta.url));
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bbb-shared-notes-inline-'));
const dataDir = path.join(tmpRoot, 'data');

const realConfig = load(fs.readFileSync(path.join(pkgRoot, 'config/default.yml'), 'utf8')) as {
  fileUpload: { basePath: string; uploadsDirName: string };
};
realConfig.fileUpload.basePath = dataDir;
fs.mkdirSync(path.join(tmpRoot, 'config'), { recursive: true });
fs.writeFileSync(path.join(tmpRoot, 'config/default.yml'), dump(realConfig));
process.chdir(tmpRoot);

const config = (await import('../src/config/index.ts')).default;
const { inlineHostImages } = await import('../src/express/handlers/inlineHostImages.ts');

assert.equal(config.fileUpload.basePath, dataDir, 'test config did not take effect');

// Drop a real image file where an upload for `meetingId` would live.
const PNG_BYTES = Buffer.from('89504e470d0a1a0a-fake-png-body', 'utf8');
const writeUpload = (meetingId: string, filename: string, bytes: Buffer = PNG_BYTES): void => {
  const dir = path.join(dataDir, meetingId, 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), bytes);
};

after(() => {
  process.chdir(origCwd);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('inlines a same-origin upload as a base64 data URI', async () => {
  const meetingId = 'meeting-abc-1';
  const filename = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png';
  writeUpload(meetingId, filename);

  const html = `<p><img src="/bigbluebutton/fileUpload/${meetingId}/${filename}" alt="x"></p>`;
  const result = await inlineHostImages(html);

  const expected = `data:image/png;base64,${PNG_BYTES.toString('base64')}`;
  assert.equal(result.includes(expected), true, 'src should be replaced with the base64 data URI');
  assert.equal(result.includes('/bigbluebutton/fileUpload/'), false, 'no relative URL should remain');
});

test('inlines src and drops the data-url metadata BlockNote emits', async () => {
  const meetingId = 'meeting-data-url';
  const filename = 'cccccccc-dddd-eeee-ffff-000000000000.png';
  writeUpload(meetingId, filename);

  // This is the exact shape blocksToHTMLLossy produces for an image block:
  // the upload URL appears in BOTH `src` and `data-url`.
  const url = `/bigbluebutton/fileUpload/${meetingId}/${filename}`;
  const html = `<img src="${url}" alt="" width="256" data-url="${url}" data-preview-width="256">`;
  const result = await inlineHostImages(html);

  const expected = `data:image/png;base64,${PNG_BYTES.toString('base64')}`;
  assert.equal(result.includes(expected), true, 'src should be replaced with the base64 data URI');
  assert.equal(result.includes('/bigbluebutton/fileUpload/'), false, 'neither src nor data-url may leak the upload path');
  assert.equal(result.includes('data-url'), false, 'the data-url metadata attribute should be dropped');
});

test('strips an external <img> (same-origin enforcement)', async () => {
  const html = '<p><img src="https://evil.example.com/tracker.png" alt="pixel"></p>';
  const result = await inlineHostImages(html);
  assert.equal(result.includes('evil.example.com'), false, 'external image must be dropped');
  assert.equal(result, '<p></p>');
});

test('drops an upload <img> whose file is missing on disk', async () => {
  const html = '<p><img src="/bigbluebutton/fileUpload/meeting-gone/00000000-0000-0000-0000-000000000000.png"></p>';
  const result = await inlineHostImages(html);
  assert.equal(result.includes('fileUpload'), false, 'missing upload must be dropped, not left dangling');
});

test('rejects a path-traversal src that the regex would not match', async () => {
  const html = '<p><img src="/bigbluebutton/fileUpload/../../etc/passwd"></p>';
  const result = await inlineHostImages(html);
  assert.equal(result, '<p></p>', 'traversal payload must not read from disk and must be stripped');
});

test('leaves already-inlined data URIs untouched', async () => {
  const html = '<p><img src="data:image/png;base64,QUJD" alt="inline"></p>';
  const result = await inlineHostImages(html);
  assert.equal(result, html);
});

test('returns HTML unchanged when there are no images', async () => {
  const html = '<p>hello <strong>world</strong></p>';
  assert.equal(await inlineHostImages(html), html);
});

test('handles several images in one document independently', async () => {
  const meetingId = 'meeting-multi';
  const good = 'ffffffff-1111-2222-3333-444444444444.jpg';
  writeUpload(meetingId, good, Buffer.from('jpeg-bytes'));

  const html = [
    `<img src="/bigbluebutton/fileUpload/${meetingId}/${good}">`,
    '<img src="http://tracker.test/p.gif">',
    '<p>text</p>',
  ].join('');
  const result = await inlineHostImages(html);

  assert.equal(result.includes('data:image/jpeg;base64,'), true, 'good jpeg inlined');
  assert.equal(result.includes('tracker.test'), false, 'external dropped');
  assert.equal(result.includes('<p>text</p>'), true, 'surrounding content preserved');
});
