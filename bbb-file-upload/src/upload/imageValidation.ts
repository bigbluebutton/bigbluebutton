import { imageSize } from 'image-size';

export interface DetectedImage {
  mime: string;
  ext: string;
}

// Magic-byte signatures for the supported raster formats. Detection is done on
// the file content, never on the client-supplied filename or Content-Type, so a
// renamed .txt or a spoofed header cannot get through. SVG is intentionally
// absent: being XML, it is a stored-XSS vector and is never accepted.
const SIGNATURES: Array<{ mime: string; ext: string; match: (b: Buffer) => boolean }> = [
  {
    mime: 'image/png',
    ext: 'png',
    match: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: 'image/jpeg',
    ext: 'jpg',
    match: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: 'image/gif',
    ext: 'gif',
    // "GIF87a" or "GIF89a"
    match: (b) =>
      b.length >= 6 &&
      b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 &&
      (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61,
  },
  {
    mime: 'image/webp',
    ext: 'webp',
    // "RIFF"...."WEBP"
    match: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

// Returns the real image type inferred from the magic bytes, or null if the
// content does not match any supported raster format.
export function detectImage(buffer: Buffer): DetectedImage | null {
  for (const sig of SIGNATURES) {
    if (sig.match(buffer)) {
      return { mime: sig.mime, ext: sig.ext };
    }
  }
  return null;
}

export interface Dimensions {
  width: number;
  height: number;
}

// Reads width/height from the file header without decoding the bitmap. Returns
// null if the dimensions cannot be determined.
export function readDimensions(buffer: Buffer): Dimensions | null {
  try {
    const { width, height } = imageSize(buffer);
    if (typeof width !== 'number' || typeof height !== 'number') {
      return null;
    }
    return { width, height };
  } catch {
    return null;
  }
}
