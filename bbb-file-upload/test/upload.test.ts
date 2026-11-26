import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, dump } from 'js-yaml';

// Same config-isolation approach as storage.test.ts / cleanup.test.ts: rewrite
// basePath to a scratch dir before importing the handler so real writes land in
// a temp tree, not /var/bigbluebutton. We also shrink quotaPerMeetingMb so a
// tiny fixture can push a meeting over quota (handleUpload captures quotaBytes
// at import time, so the override must be in place before the import below).
// node --test runs each file in its own process, so the chdir is isolated.

const origCwd = process.cwd();
const pkgRoot = fileURLToPath(new URL('..', import.meta.url));
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bbb-file-upload-upload-'));
const dataDir = path.join(tmpRoot, 'data');

const realConfig = load(fs.readFileSync(path.join(pkgRoot, 'config/default.yml'), 'utf8')) as {
  storage: { basePath: string; uploadsDirName: string };
  limits: { quotaPerMeetingMb: number; maxImageDimensionPx: number };
};
realConfig.storage.basePath = dataDir;
// ~1048 bytes: comfortably above a 33-byte PNG header (so the happy path fits)
// but low enough that a small filler file can exceed it (so 413 can fire).
realConfig.limits.quotaPerMeetingMb = 0.001;
fs.mkdirSync(path.join(tmpRoot, 'config'), { recursive: true });
fs.writeFileSync(path.join(tmpRoot, 'config/default.yml'), dump(realConfig));
process.chdir(tmpRoot);
// The explicit path (not just the chdir) is what pins the config: on a host
// with the service package deployed, /usr/share/.../config/default.yml exists
// and would otherwise win over the scratch ./config/default.yml.
process.env.BBB_FILE_UPLOAD_CONFIG = path.join(tmpRoot, 'config/default.yml');

const { handleUpload } = await import('../src/express/upload.ts');
const storage = await import('../src/upload/storage.ts');
const config = (await import('../src/config/index.ts')).default;

assert.equal(config.storage.basePath, dataDir, 'test config did not take effect');

const maxDim = config.limits.maxImageDimensionPx;

after(() => {
  process.chdir(origCwd);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

// A minimal valid PNG: 8-byte signature + IHDR chunk carrying the width/height.
// This is enough for both detectImage (magic bytes) and image-size (dimensions),
// matching the fixture used in imageValidation.test.ts.
function png(width: number, height: number): Buffer {
  const b = Buffer.alloc(33);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  b.writeUInt32BE(13, 8); // IHDR length
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  b[24] = 8; // bit depth
  b[25] = 6; // colour type (RGBA)
  return b;
}

// Minimal Express stubs. handleUpload only reads req.header(name) and req.file,
// and only writes res.status(code).json(payload).
function makeReq(
  headers: Record<string, string | undefined>,
  buffer?: Buffer,
  originalname = 'pasted.png',
  mimetype = 'image/png',
) {
  const req = {
    header(name: string): string | undefined {
      return headers[name.toLowerCase()];
    },
    file: buffer === undefined ? undefined : {
      buffer,
      size: buffer.length,
      originalname,
      mimetype,
    },
  };
  return req as unknown as import('express').Request;
}

function makeRes() {
  const captured: { statusCode?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      captured.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      captured.body = payload;
      return res;
    },
  };
  return { res: res as unknown as import('express').Response, captured };
}

const validIdentity = { 'meeting-id': 'meeting-upload-1', 'user-id': 'user-1' };

test('handleUpload rejects a request with missing identity headers (401)', () => {
  const { res, captured } = makeRes();
  handleUpload(makeReq({}, png(10, 10)), res);
  assert.equal(captured.statusCode, 401);
  assert.deepEqual(captured.body, { code: 'unauthorized' });
});

test('handleUpload rejects an invalid meeting id in the identity header (401)', () => {
  const { res, captured } = makeRes();
  handleUpload(makeReq({ 'meeting-id': '../etc', 'user-id': 'user-1' }, png(10, 10)), res);
  assert.equal(captured.statusCode, 401);
  assert.deepEqual(captured.body, { code: 'unauthorized' });
});

// Fixtures for the non-image types: only the leading signature matters, and
// none of them goes through the pixel-dimension check.
function mp4(): Buffer {
  const b = Buffer.alloc(32);
  b.writeUInt32BE(32, 0);
  b.write('ftypisom', 4, 'ascii');
  return b;
}

const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n');

test('handleUpload rejects content that is not a supported file type (415)', () => {
  const notAFile = Buffer.from('this is definitely not an image, even if it claims to be a png');
  const { res, captured } = makeRes();
  handleUpload(makeReq(validIdentity, notAFile), res);
  assert.equal(captured.statusCode, 415);
  assert.deepEqual(captured.body, { code: 'unsupported_file_type' });
});

test('handleUpload rejects a spoofed mp4 (right name and type, wrong bytes) with 415', () => {
  const html = Buffer.from('<html><script>alert(1)</script></html>');
  const { res, captured } = makeRes();
  handleUpload(makeReq(validIdentity, html, 'clip.mp4', 'video/mp4'), res);
  assert.equal(captured.statusCode, 415);
  assert.deepEqual(captured.body, { code: 'unsupported_file_type' });
});

test('handleUpload stores an mp4 without reading image dimensions (201)', () => {
  const { res, captured } = makeRes();
  handleUpload(makeReq(validIdentity, mp4(), 'Lecture 1.mp4', 'video/mp4'), res);

  assert.equal(captured.statusCode, 201);
  const body = captured.body as { url: string; name: string; size: number; mime: string };
  assert.match(body.url, /^\/bigbluebutton\/fileUpload\/meeting-upload-1\/[0-9a-f-]{36}\.mp4$/);
  assert.deepEqual({ name: body.name, size: body.size, mime: body.mime }, {
    name: 'Lecture 1.mp4', size: 32, mime: 'video/mp4',
  });
  assert.equal(fs.existsSync(path.join(storage.uploadsDir('meeting-upload-1'), path.basename(body.url))), true);
});

test('handleUpload stores a pdf (201)', () => {
  const { res, captured } = makeRes();
  handleUpload(makeReq(validIdentity, pdf, 'notes.pdf', 'application/pdf'), res);
  assert.equal(captured.statusCode, 201);
  assert.equal((captured.body as { mime: string }).mime, 'application/pdf');
});

test('handleUpload gives the returned name the extension of the detected type', () => {
  // The name is what a download is saved as: a pdf must never come back as
  // "page.html", whatever the client called it.
  const cases: Array<[string, string]> = [
    ['page.html', 'page.html.pdf'],
    ['report', 'report.pdf'],
    ['REPORT.PDF', 'REPORT.PDF'],
    ['../../etc/passwd.pdf', 'passwd.pdf'],
    ['C:\\Users\\me\\a.pdf', 'a.pdf'],
    ['bad\u0000\u001fname.pdf', 'badname.pdf'],
    ['', 'file.pdf'],
  ];
  for (const [sent, expected] of cases) {
    const { res, captured } = makeRes();
    handleUpload(makeReq(validIdentity, pdf, sent, 'application/pdf'), res);
    assert.equal((captured.body as { name: string }).name, expected, sent);
  }
});

test('handleUpload accepts .jpeg as a name for a jpeg', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const { res, captured } = makeRes();
  handleUpload(makeReq(validIdentity, jpeg, 'photo.jpeg', 'image/jpeg'), res);
  // image-size cannot read dimensions from this stub, so the image path stops
  // at 422: what matters is that jpeg went down the image branch.
  assert.equal(captured.statusCode, 422);
});

test('handleUpload caps the returned name length, keeping the extension', () => {
  const { res, captured } = makeRes();
  handleUpload(makeReq(validIdentity, pdf, `${'a'.repeat(400)}.pdf`, 'application/pdf'), res);
  const { name } = captured.body as { name: string };
  assert.equal(name.length, 255);
  assert.match(name, /^a+\.pdf$/);
});

test('handleUpload rejects a PNG whose dimensions exceed the maximum (422)', () => {
  const oversized = png(maxDim + 1, maxDim + 1);
  const { res, captured } = makeRes();
  handleUpload(makeReq(validIdentity, oversized), res);
  assert.equal(captured.statusCode, 422);
  const body = captured.body as { code: string; sentWidth: number; sentHeight: number };
  assert.equal(body.code, 'image_dimensions_exceed_maximum');
  assert.equal(body.sentWidth, maxDim + 1);
  assert.equal(body.sentHeight, maxDim + 1);
});

test('handleUpload rejects an upload that would push the meeting over quota (413)', () => {
  // Pre-fill the meeting past its (tiny, test-only) quota so the next upload,
  // however small, exceeds it.
  storage.store('meeting-quota-full', 'filler.bin', Buffer.alloc(2000));
  const { res, captured } = makeRes();
  handleUpload(makeReq({ 'meeting-id': 'meeting-quota-full', 'user-id': 'user-1' }, png(10, 10)), res);
  assert.equal(captured.statusCode, 413);
  assert.deepEqual(captured.body, { code: 'meeting_quota_exceeded' });
});

test('handleUpload stores a valid small PNG and returns a 201 with url, name, size and mime', () => {
  const { res, captured } = makeRes();
  handleUpload(makeReq(validIdentity, png(10, 10)), res);

  assert.equal(captured.statusCode, 201);
  const body = captured.body as { url: string; name: string; size: number; mime: string };
  assert.deepEqual(Object.keys(body).sort(), ['mime', 'name', 'size', 'url']);
  assert.deepEqual({ name: body.name, size: body.size, mime: body.mime }, {
    name: 'pasted.png', size: 33, mime: 'image/png',
  });
  const urlPattern = /^\/bigbluebutton\/fileUpload\/meeting-upload-1\/[0-9a-f-]{36}\.png$/;
  assert.match(body.url, urlPattern);

  // The file named by the url must actually be on disk under the meeting's dir.
  const filename = path.basename(body.url);
  const onDisk = path.join(storage.uploadsDir('meeting-upload-1'), filename);
  assert.equal(fs.existsSync(onDisk), true);
  assert.deepEqual(fs.readFileSync(onDisk), png(10, 10));
});
