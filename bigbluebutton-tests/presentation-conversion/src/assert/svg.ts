import { Kind } from '../env';

/**
 * vector: pdftocairo output (including image uploads, which become a PDF holding one image);
 * raster: bbb-web's own wrapper around one embedded PNG (SvgImageCreatorImp.createSvgWithEmbeddedPng);
 * blank: the blank slide bbb-web substitutes when conversion fails.
 */
export function slideKind(svg: string, blankSvgBytes: number): Exclude<Kind, 'any'> {
  if (Buffer.byteLength(svg) === blankSvgBytes && !/<path|<image/.test(svg)) return 'blank';
  if (/<image\s+href="data:image\/png;base64,/.test(svg) && !/<path[\s>]/.test(svg)) return 'raster';
  return 'vector';
}

/** Width / height of the slide as declared by the root element (viewBox first). */
export function svgAspect(svg: string): number | null {
  const root = svg.match(/<svg\b[^>]*>/)?.[0];
  if (!root) return null;
  const vb = root.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
  if (vb && Number(vb[2]) > 0) return Number(vb[1]) / Number(vb[2]);
  const w = root.match(/\bwidth="([\d.]+)/);
  const h = root.match(/\bheight="([\d.]+)/);
  return w && h && Number(h[1]) > 0 ? Number(w[1]) / Number(h[1]) : null;
}

/** EXIF Orientation of a JPEG (1 when there is no EXIF block or no orientation tag). */
export function jpegOrientation(jpeg: Buffer): number {
  if (jpeg.length < 4 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return 1;
  let i = 2;
  while (i + 4 <= jpeg.length && jpeg[i] === 0xff) {
    const marker = jpeg[i + 1];
    if (marker === 0xda) break;
    const len = jpeg.readUInt16BE(i + 2);
    if (marker === 0xe1 && jpeg.toString('latin1', i + 4, i + 10) === 'Exif\0\0') {
      const t = i + 10;
      const le = jpeg.toString('latin1', t, t + 2) === 'II';
      const u16 = (o: number) => (le ? jpeg.readUInt16LE(o) : jpeg.readUInt16BE(o));
      const u32 = (o: number) => (le ? jpeg.readUInt32LE(o) : jpeg.readUInt32BE(o));
      const ifd = t + u32(t + 4);
      if (ifd + 2 > jpeg.length) return 1;
      for (let k = 0; k < u16(ifd); k++) {
        const e = ifd + 2 + 12 * k;
        if (e + 12 > jpeg.length) break;
        if (u16(e) === 0x0112) return u16(e + 8);
      }
      return 1;
    }
    i += 2 + len;
  }
  return 1;
}

/** Orientations of every JPEG embedded in the slide as a data URI. */
export function embeddedJpegOrientations(svg: string): number[] {
  return [...svg.matchAll(/data:image\/jpeg;base64,([A-Za-z0-9+/=\s]+)/g)].map((m) => jpegOrientation(Buffer.from(m[1], 'base64')));
}
