import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectImage, readDimensions } from '../src/upload/imageValidation.ts';

// Minimal, hand-crafted fixtures. detectImage only inspects the leading magic
// bytes, so tiny buffers are enough for it; readDimensions needs a header the
// image-size library can actually parse, so the GIF/PNG helpers write real
// width/height fields.

function jpeg(): Buffer {
  // SOI + APP0 marker start is all detectImage looks at.
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
}

function webp(): Buffer {
  // "RIFF" <size> "WEBP"
  return Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
}

function gif(width: number, height: number): Buffer {
  // "GIF89a" then logical-screen width/height as 16-bit little-endian.
  return Buffer.from([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
    width & 0xff, (width >> 8) & 0xff,
    height & 0xff, (height >> 8) & 0xff,
    0, 0, 0,
  ]);
}

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

// A file whose *content* is not an allowed image. It stands in for the classic
// attack of naming a non-image "photo.png": the service never looks at the
// filename, only at these bytes, so the spoofed extension cannot help it.
const svgText = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
const plainText = Buffer.from('this is definitely not an image, even if it is called photo.png');

test('detectImage accepts PNG by magic bytes', () => {
  assert.deepEqual(detectImage(png(1, 1)), { mime: 'image/png', ext: 'png' });
});

test('detectImage accepts JPEG by magic bytes', () => {
  assert.deepEqual(detectImage(jpeg()), { mime: 'image/jpeg', ext: 'jpg' });
});

test('detectImage accepts GIF by magic bytes', () => {
  assert.deepEqual(detectImage(gif(1, 1)), { mime: 'image/gif', ext: 'gif' });
});

test('detectImage accepts WEBP by magic bytes', () => {
  assert.deepEqual(detectImage(webp()), { mime: 'image/webp', ext: 'webp' });
});

test('detectImage bars SVG (XSS vector) even though it is an image format', () => {
  assert.equal(detectImage(svgText), null);
});

test('detectImage rejects a non-image regardless of its (spoofed) extension', () => {
  // Content-based detection: a text blob named photo.png never reaches an
  // allowed mime, so the caller answers 415.
  assert.equal(detectImage(plainText), null);
});

test('detectImage rejects a truncated buffer without matching a signature', () => {
  assert.equal(detectImage(Buffer.from([0x89, 0x50])), null);
});

test('readDimensions reads real width/height from a GIF header', () => {
  assert.deepEqual(readDimensions(gif(10, 20)), { width: 10, height: 20 });
});

test('readDimensions reads real width/height from a PNG header', () => {
  assert.deepEqual(readDimensions(png(100, 200)), { width: 100, height: 200 });
});

test('readDimensions reports oversized dimensions so the caller can reject them', () => {
  // The pixel cap lives in the upload handler; readDimensions just has to
  // surface the true size (here well above the 4096px default) so that check
  // can fire. What matters for this fix is that a huge header does not crash.
  assert.deepEqual(readDimensions(gif(8000, 8000)), { width: 8000, height: 8000 });
});

test('readDimensions returns null (no throw) on unparseable bytes', () => {
  assert.equal(readDimensions(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])), null);
});

test('readDimensions returns null (no throw) on an empty buffer', () => {
  assert.equal(readDimensions(Buffer.alloc(0)), null);
});
