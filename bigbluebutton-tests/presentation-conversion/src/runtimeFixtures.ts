import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Fixtures too big to commit, generated deterministically at run time from the parameters in their manifest.
 * Every generator returns the same bytes for the same parameters, so a generated file is kept for later runs under a
 * name that carries a hash of those parameters.
 */

function prng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s & 0xff;
  };
}

function randomBytes(n: number, seed: number): Buffer {
  const next = prng(seed);
  const b = Buffer.allocUnsafe(n);
  for (let i = 0; i < n; i++) b[i] = next();
  return b;
}

interface PdfObject {
  dict: string;
  stream?: Buffer;
}

function pdf(objects: PdfObject[]): Buffer {
  const parts: Buffer[] = [Buffer.from('%PDF-1.5\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
  let offset = parts[0].length;
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(offset);
    const head = Buffer.from(`${i + 1} 0 obj\n${o.dict}${o.stream ? `\nstream\n` : '\n'}`, 'latin1');
    const tail = Buffer.from(o.stream ? '\nendstream\nendobj\n' : 'endobj\n', 'latin1');
    const chunk = o.stream ? Buffer.concat([head, o.stream, tail]) : Buffer.concat([head, tail]);
    parts.push(chunk);
    offset += chunk.length;
  });
  const xref = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, ...offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)].join('');
  parts.push(Buffer.from(`${xref}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`, 'latin1'));
  return Buffer.concat(parts);
}

function textContent(lines: string[]): Buffer {
  const ops = lines.map((l, i) => `BT /F1 28 Tf 60 ${460 - i * 40} Td (${l.replace(/[()\\]/g, '\\$&')}) Tj ET`).join('\n');
  return Buffer.from(ops, 'latin1');
}

/** One text page plus an unreferenced stream of incompressible bytes, so the file has exactly `bytes` bytes. */
export function paddedPdf(bytes: number, seed: number, label: string): Buffer {
  const build = (pad: number) => {
    const content = textContent([label, `${bytes} bytes`]);
    return pdf([
      { dict: '<< /Type /Catalog /Pages 2 0 R >>' },
      { dict: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
      { dict: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 960 540] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>' },
      { dict: `<< /Length ${content.length} >>`, stream: content },
      { dict: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>' },
      { dict: `<< /Length ${pad} >>`, stream: randomBytes(pad, seed) },
    ]);
  };
  const base = build(0).length;
  if (bytes < base) throw new Error(`paddedPdf: ${bytes} bytes is smaller than the minimal file (${base})`);
  let pad = bytes - base;
  let out = build(pad);
  while (out.length !== bytes) {
    pad += bytes - out.length;
    out = build(pad);
  }
  return out;
}

/** One page whose only content is a full-page image of random RGB pixels (incompressible), for the big-page path. */
export function noiseImagePdf(width: number, height: number, seed: number): Buffer {
  const pixels = randomBytes(width * height * 3, seed);
  const image = zlib.deflateSync(pixels, { level: 6 });
  const content = Buffer.from(`q 960 0 0 540 0 0 cm /Im0 Do Q`, 'latin1');
  return pdf([
    { dict: '<< /Type /Catalog /Pages 2 0 R >>' },
    { dict: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
    { dict: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 960 540] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>' },
    { dict: `<< /Length ${content.length} >>`, stream: content },
    {
      dict: `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${image.length} >>`,
      stream: image,
    },
  ]);
}

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** A large RGB PNG with a smooth gradient and the four marker bands, so orientation stays checkable after resizing. */
export function gradientPng(width: number, height: number): Buffer {
  const row = width * 3 + 1;
  const raw = Buffer.alloc(row * height);
  const band = Math.max(8, Math.floor(Math.min(width, height) / 7));
  for (let y = 0; y < height; y++) {
    raw[y * row] = 0;
    for (let x = 0; x < width; x++) {
      const o = y * row + 1 + x * 3;
      let rgb: [number, number, number] = [Math.floor((x / width) * 200) + 40, Math.floor((y / height) * 200) + 40, 160];
      if (y < band) rgb = [230, 0, 0];
      else if (y >= height - band) rgb = [0, 0, 230];
      else if (x < band) rgb = [0, 190, 0];
      else if (x >= width - band) rgb = [240, 220, 0];
      raw[o] = rgb[0];
      raw[o + 1] = rgb[1];
      raw[o + 2] = rgb[2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

export interface RuntimeSpec {
  kind: string;
  [key: string]: unknown;
}

export function runtimeExtension(spec: RuntimeSpec): string {
  return spec.kind === 'gradient-png' ? '.png' : '.pdf';
}

export function generateRuntimeFixture(id: string, spec: RuntimeSpec, outDir: string): string {
  const hash = crypto.createHash('sha256').update(id + JSON.stringify(spec)).digest('hex').slice(0, 12);
  const file = path.join(outDir, `${id}-${hash}${runtimeExtension(spec)}`);
  if (fs.existsSync(file)) return file;
  fs.mkdirSync(outDir, { recursive: true });
  let data: Buffer;
  switch (spec.kind) {
    case 'padded-pdf':
      data = paddedPdf(Number(spec.bytes), Number(spec.seed ?? 1), String(spec.label ?? id));
      break;
    case 'noise-image-pdf':
      data = noiseImagePdf(Number(spec.width), Number(spec.height), Number(spec.seed ?? 1));
      break;
    case 'gradient-png':
      data = gradientPng(Number(spec.width), Number(spec.height));
      break;
    default:
      throw new Error(`${id}: unknown runtime fixture kind "${spec.kind}"`);
  }
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
  return file;
}
