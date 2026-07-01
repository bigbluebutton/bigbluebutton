import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {PNG} from 'pngjs';
import {
  ensureSlideViewBox,
  largestEmbeddedRasterWidth,
  rasterizeSlideBackground,
} from '../lib/utils/slide-background.js';

/**
 * Build a base64 data URI for a solid-colour PNG of the given size.
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {number[]} rgb Colour as [r, g, b].
 * @return {string} A `data:image/png;base64,...` URI.
 */
function pngDataUri(w, h, [r, g, b]) {
  const png = new PNG({width: w, height: h});
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = r;
    png.data[i + 1] = g;
    png.data[i + 2] = b;
    png.data[i + 3] = 255;
  }
  return 'data:image/png;base64,' + PNG.sync.write(png).toString('base64');
}

const config = JSON.parse(fs.readFileSync('./config/settings.json', 'utf8'));
const cairosvg = config.shared.cairosvg;

// Slide body: the whole slide area (720 x 405 user units) painted solid blue,
// so any exported pixel that is not blue means the slide did not fill the box.
const SLIDE_BODY =
  '<rect x="0" y="0" width="720" height="405" fill="rgb(0,0,255)"/>\n';

// A slide that carries absolute units (720pt) AND a viewBox. This is the shape
// of the reporter's ODF slide (issue #25303): when referenced from an <image>,
// CairoSVG renders it at its intrinsic pixel size and crops it into the
// top-left corner - the gap PR #25315 could not reach.
const SLIDE_WITH_VIEWBOX =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<svg xmlns="http://www.w3.org/2000/svg" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'width="720pt" height="405pt" viewBox="0 0 720 405" version="1.2">\n' +
  SLIDE_BODY + '</svg>\n';

// The same slide with NO viewBox: the case PR #25315 introduced ensureSlideVie-
// wBox for. Without a viewBox the content has no mapping to the canvas and
// rasterizing alone would crop it, so ensureSlideViewBox must still run.
const SLIDE_WITHOUT_VIEWBOX =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<svg xmlns="http://www.w3.org/2000/svg" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'width="720pt" height="405pt" version="1.1">\n' +
  SLIDE_BODY + '</svg>\n';

// Slide geometry in tldraw coordinates (a 16:9 slide) and the values process.js
// derives from it. See workers/process.js.
const SLIDE_WIDTH = 1440;
const SLIDE_HEIGHT = 810;

/**
 * Converts points to pixels exactly as process.js does.
 * @param {number} pt Measurement in points.
 * @return {number} Measurement in pixels.
 */
function toPx(pt) {
  return (pt / config.process.pointsPerInch) * config.process.pixelsPerInch;
}

const OUTPUT_WIDTH = toPx(SLIDE_WIDTH); // 1920
const OUTPUT_HEIGHT = toPx(SLIDE_HEIGHT); // 1080

// The (smaller) box the composite canvas is sized to. The fix must NOT use
// these for the rasterization or the background would be upscaled and blurry.
const maxImageWidth = config.process.maxImageWidth;
const maxImageHeight = config.process.maxImageHeight;
const ratio = Math.min(maxImageWidth / SLIDE_WIDTH,
    maxImageHeight / SLIDE_HEIGHT);
const scaledWidth = SLIDE_WIDTH * ratio;

let workdir;

before(() => {
  workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'bbb-export-test-'));
});

after(() => {
  fs.rmSync(workdir, {recursive: true, force: true});
});

/**
 * Returns the RGBA components of a single pixel.
 * @param {PNG} png Decoded image.
 * @param {number} x Column.
 * @param {number} y Row.
 * @return {number[]} [r, g, b, a].
 */
function pixel(png, x, y) {
  const idx = (png.width * y + x) << 2;
  return [png.data[idx], png.data[idx + 1],
    png.data[idx + 2], png.data[idx + 3]];
}

/**
 * Rasterizes a slide SVG and asserts the resulting PNG is the final render
 * resolution and covered edge to edge with the opaque blue of the slide. A
 * full-resolution raster covering its whole area is what guarantees the
 * composited slide fills the <image> box on any CairoSVG version.
 * @param {string} svg Slide SVG contents.
 * @param {string} tag Unique file suffix.
 */
function assertFillsBox(svg, tag) {
  const svgPath = path.join(workdir, `slide-${tag}.svg`);
  fs.writeFileSync(svgPath, svg);

  const png = rasterizeSlideBackground(
      svgPath, path.join(workdir, `slide-${tag}.png`),
      {width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT, cairosvg});

  const image = PNG.sync.read(fs.readFileSync(png));

  // Must match the SVG->PDF pass (toPx), not the smaller composite box, so the
  // background is never upscaled from a low-resolution raster.
  assert.equal(image.width, OUTPUT_WIDTH);
  assert.equal(image.height, OUTPUT_HEIGHT);
  assert.notEqual(image.width, scaledWidth);

  const w = image.width;
  const h = image.height;
  const samples = [
    [1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2],
    [w >> 1, 1], [w >> 1, h - 2], [1, h >> 1], [w - 2, h >> 1],
    [w >> 1, h >> 1],
  ];

  for (const [x, y] of samples) {
    const [r, g, b, a] = pixel(image, x, y);
    assert.ok(a > 250, `pixel (${x},${y}) is transparent (uncovered)`);
    assert.ok(b > 200 && r < 50 && g < 50,
        `pixel (${x},${y}) is not the slide blue: rgba(${r},${g},${b},${a})`);
  }
}

test('slide with a viewBox rasterizes filling the whole box (issue #25303)',
    () => assertFillsBox(SLIDE_WITH_VIEWBOX, 'vb'));

test('slide without a viewBox still fills the box (no #25315 regression)',
    () => assertFillsBox(SLIDE_WITHOUT_VIEWBOX, 'novb'));

test('ensureSlideViewBox derives a viewBox only when one is missing', () => {
  const missing = path.join(workdir, 'missing.svg');
  fs.writeFileSync(missing, SLIDE_WITHOUT_VIEWBOX);
  ensureSlideViewBox(missing);
  assert.match(fs.readFileSync(missing, 'utf8'),
      /viewBox="0 0 720 405"/);

  // A slide that already has a viewBox is left untouched.
  const present = path.join(workdir, 'present.svg');
  fs.writeFileSync(present, SLIDE_WITH_VIEWBOX);
  ensureSlideViewBox(present);
  assert.equal(fs.readFileSync(present, 'utf8'), SLIDE_WITH_VIEWBOX);
});

/**
 * A slide shaped like an office-document export: a small (720pt) viewBox whose
 * entire area is a single high-resolution embedded raster (2048px wide, scaled
 * down into the viewBox). CairoSVG < 2.7 crops this when asked to downscale the
 * raster below its native size, which is what issue #25303 reports.
 * @return {string} The slide SVG.
 */
function slideWithRaster() {
  const uri = pngDataUri(2048, 1152, [0, 0, 255]);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'width="720pt" height="405pt" viewBox="0 0 720 405" version="1.2">\n' +
    `<g transform="scale(${720 / 2048})">` +
    '<image width="2048" height="1152" preserveAspectRatio="none" ' +
    `xlink:href="${uri}"/></g>\n</svg>\n`;
}

test('reads the largest embedded raster width', () => {
  const svgPath = path.join(workdir, 'raster.svg');
  fs.writeFileSync(svgPath, slideWithRaster());
  assert.equal(largestEmbeddedRasterWidth(svgPath), 2048);

  const vector = path.join(workdir, 'vector.svg');
  fs.writeFileSync(vector, SLIDE_WITH_VIEWBOX);
  assert.equal(largestEmbeddedRasterWidth(vector), 0);
});

test('renders at the embedded raster resolution when it exceeds the target',
    () => {
      const svgPath = path.join(workdir, 'raster.svg');
      fs.writeFileSync(svgPath, slideWithRaster());

      // Target is the small final resolution; the raster (2048px) is larger, so
      // the slide must be rendered at 2048 to avoid CairoSVG's downscale crop.
      const png = rasterizeSlideBackground(
          svgPath, path.join(workdir, 'raster.png'),
          {width: 960, height: 540, cairosvg});
      const image = PNG.sync.read(fs.readFileSync(png));
      assert.equal(image.width, 2048);
      assert.equal(image.height, Math.round(2048 * 540 / 960));

      // Still fills to the corners with the embedded blue (sample just inside
      // the edge to avoid the anti-aliased border pixel).
      for (const [x, y] of [[5, 5], [image.width - 6, image.height - 6]]) {
        const [r, g, b, a] = pixel(image, x, y);
        assert.ok(a > 250 && b > 200 && r < 50 && g < 50,
            `corner (${x},${y}) not filled: rgba(${r},${g},${b},${a})`);
      }
    });

test('throws when CairoSVG cannot produce the raster', () => {
  const svgPath = path.join(workdir, 'err.svg');
  fs.writeFileSync(svgPath, SLIDE_WITH_VIEWBOX);

  assert.throws(() => rasterizeSlideBackground(
      svgPath, path.join(workdir, 'err.png'),
      {width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT, cairosvg: '/nonexistent'}));
});
