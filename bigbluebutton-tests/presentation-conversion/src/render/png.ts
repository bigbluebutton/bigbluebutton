import fs from 'fs';
import { PNG } from 'pngjs';

export interface Rgba {
  data: Buffer;
  width: number;
  height: number;
}

export function decodePng(file: string | Buffer): Rgba {
  const png = PNG.sync.read(typeof file === 'string' ? fs.readFileSync(file) : file);
  return { data: png.data, width: png.width, height: png.height };
}

/** Box-downsamples to w x h (aspect ignored) and composites alpha over white. */
function downsample(img: Rgba, w: number, h: number): Float64Array {
  const out = new Float64Array(w * h * 3);
  const count = new Float64Array(w * h);
  for (let y = 0; y < img.height; y++) {
    const ty = Math.min(h - 1, Math.floor((y * h) / img.height));
    for (let x = 0; x < img.width; x++) {
      const tx = Math.min(w - 1, Math.floor((x * w) / img.width));
      const i = (y * img.width + x) * 4;
      const a = img.data[i + 3] / 255;
      const t = ty * w + tx;
      for (let c = 0; c < 3; c++) out[t * 3 + c] += img.data[i + c] * a + 255 * (1 - a);
      count[t]++;
    }
  }
  for (let t = 0; t < w * h; t++) for (let c = 0; c < 3; c++) out[t * 3 + c] /= Math.max(1, count[t]);
  return out;
}

/** Mean absolute RGB difference (0..255) after downsampling both images to 96x96. Reported, never asserted. */
export function meanDifference(a: Rgba, b: Rgba): number {
  const da = downsample(a, 96, 96);
  const db = downsample(b, 96, 96);
  let sum = 0;
  for (let i = 0; i < da.length; i++) sum += Math.abs(da[i] - db[i]);
  return Math.round((sum / da.length) * 10) / 10;
}

const COLOURS: Record<string, (r: number, g: number, b: number) => boolean> = {
  red: (r, g, b) => r > 170 && g < 80 && b < 80,
  blue: (r, g, b) => b > 170 && r < 80 && g < 80,
  green: (r, g, b) => g > 130 && r < 80 && b < 80,
  yellow: (r, g, b) => r > 180 && g > 170 && b < 90,
};

type Vec = [number, number];
const TRANSFORMS: Record<number, (v: Vec) => Vec> = {
  1: ([x, y]) => [x, y],
  2: ([x, y]) => [-x, y],
  3: ([x, y]) => [-x, -y],
  4: ([x, y]) => [x, -y],
  5: ([x, y]) => [y, x],
  6: ([x, y]) => [-y, x],
  7: ([x, y]) => [-y, -x],
  8: ([x, y]) => [y, -x],
};
export const ORIENTATION_NAMES: Record<number, string> = {
  1: 'upright',
  2: 'mirrored left-right',
  3: 'rotated 180',
  4: 'mirrored top-bottom',
  5: 'transposed',
  6: 'rotated 90 clockwise',
  7: 'transverse',
  8: 'rotated 90 counter-clockwise',
};

function axis([x, y]: Vec): string {
  return Math.abs(x) >= Math.abs(y) ? `${x > 0 ? 1 : -1},0` : `0,${y > 0 ? 1 : -1}`;
}

/**
 * Finds the marker picture (red top, blue bottom, green left, yellow right) and returns the EXIF-style
 * orientation it is shown in: 1 is correct. Null when the four colours are not all found.
 */
export function markerOrientation(img: Rgba, x0 = 0, x1 = img.width): number | null {
  const acc: Record<string, [number, number, number]> = { red: [0, 0, 0], blue: [0, 0, 0], green: [0, 0, 0], yellow: [0, 0, 0] };
  const step = Math.max(1, Math.floor(Math.min(x1 - x0, img.height) / 200));
  for (let y = 0; y < img.height; y += step) {
    for (let x = x0; x < x1; x += step) {
      const i = (y * img.width + x) * 4;
      if (img.data[i + 3] < 128) continue;
      for (const [name, test] of Object.entries(COLOURS)) {
        if (test(img.data[i], img.data[i + 1], img.data[i + 2])) {
          acc[name][0] += x;
          acc[name][1] += y;
          acc[name][2]++;
        }
      }
    }
  }
  if (Object.values(acc).some((a) => a[2] < 20)) return null;
  const c = (n: string): Vec => [acc[n][0] / acc[n][2], acc[n][1] / acc[n][2]];
  const up = axis([c('red')[0] - c('blue')[0], c('red')[1] - c('blue')[1]]);
  const left = axis([c('green')[0] - c('yellow')[0], c('green')[1] - c('yellow')[1]]);
  for (const [n, t] of Object.entries(TRANSFORMS)) if (axis(t([0, -1])) === up && axis(t([-1, 0])) === left) return Number(n);
  return null;
}
