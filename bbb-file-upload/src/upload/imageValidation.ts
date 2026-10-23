import { imageSize } from 'image-size';

export interface DetectedFile {
  mime: string;
  ext: string;
}

const startsWith = (b: Buffer, bytes: number[], offset = 0): boolean =>
  b.length >= offset + bytes.length && bytes.every((byte, i) => b[offset + i] === byte);

const ascii = (text: string): number[] => Array.from(text, (c) => c.charCodeAt(0));

// ISO base media brands that are MP4 video. The same ftyp box also opens HEIC
// images, QuickTime movies and 3GP files, which must not be filed as video/mp4.
const MP4_BRANDS = new Set(['isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'dash', 'mmp4', 'M4V ']);

// An MPEG audio frame header (Layer III, i.e. mp3): 11 sync bits, then a
// version, layer, bitrate and sample rate that must not be the reserved values.
// Checking the fields, not just the sync bits, keeps random binary out.
function isMp3FrameHeader(b: Buffer): boolean {
  if (b.length < 3 || b[0] !== 0xff || (b[1] & 0xe0) !== 0xe0) return false;
  const version = (b[1] >> 3) & 0x03;
  const layer = (b[1] >> 1) & 0x03;
  const bitrateIndex = b[2] >> 4;
  const sampleRateIndex = (b[2] >> 2) & 0x03;
  return version !== 0x01 && layer === 0x01 && bitrateIndex !== 0x00 && bitrateIndex !== 0x0f
    && sampleRateIndex !== 0x03;
}

// Magic-byte signatures for every type the service accepts. Detection is done
// on the file content, never on the client-supplied filename or Content-Type,
// so a renamed .txt or a spoofed header cannot get through. A type is only
// accepted if it is listed here: the configured allowlist can shrink this set,
// never widen it (see resolveAllowedMimeTypes). SVG is intentionally absent:
// being XML, it is a stored-XSS vector and is never accepted.
const SIGNATURES: Array<{ mime: string; ext: string; match: (b: Buffer) => boolean }> = [
  {
    mime: 'image/png',
    ext: 'png',
    match: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    mime: 'image/jpeg',
    ext: 'jpg',
    match: (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  },
  {
    mime: 'image/gif',
    ext: 'gif',
    // "GIF87a" or "GIF89a"
    match: (b) => startsWith(b, ascii('GIF87a')) || startsWith(b, ascii('GIF89a')),
  },
  {
    mime: 'image/webp',
    ext: 'webp',
    // "RIFF"...."WEBP"
    match: (b) => startsWith(b, ascii('RIFF')) && startsWith(b, ascii('WEBP'), 8),
  },
  {
    mime: 'application/pdf',
    ext: 'pdf',
    match: (b) => startsWith(b, ascii('%PDF-')),
  },
  {
    mime: 'video/mp4',
    ext: 'mp4',
    // <box size> "ftyp" <major brand>
    match: (b) => startsWith(b, ascii('ftyp'), 4) && b.length >= 12
      && MP4_BRANDS.has(b.toString('latin1', 8, 12)),
  },
  {
    mime: 'audio/mpeg',
    ext: 'mp3',
    // An ID3v2 tag, or a file that starts straight on a frame header.
    match: (b) => startsWith(b, ascii('ID3')) || isMp3FrameHeader(b),
  },
];

export const SUPPORTED_MIME_TYPES: readonly string[] = SIGNATURES.map((sig) => sig.mime);

// Extensions a file name of each type may already carry, the canonical one first.
export const NAME_EXTENSIONS: Readonly<Record<string, readonly string[]>> = {
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
  'video/mp4': ['mp4'],
  'audio/mpeg': ['mp3'],
};

export function isImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}

// The configured allowlist restricted to the types the service can verify. An
// admin can shrink the default list; a type without a signature above is
// ignored (and reported) instead of being accepted on the client's word.
export function resolveAllowedMimeTypes(configured: string[]): { allowed: string[]; ignored: string[] } {
  return {
    allowed: configured.filter((mime) => SUPPORTED_MIME_TYPES.includes(mime)),
    ignored: configured.filter((mime) => !SUPPORTED_MIME_TYPES.includes(mime)),
  };
}

// Returns the real file type inferred from the magic bytes, or null if the
// content does not match any supported format.
export function detectFileType(buffer: Buffer): DetectedFile | null {
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
