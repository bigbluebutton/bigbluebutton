import cp from 'child_process';
import fs from 'fs';

/**
 * Ensure a slide background SVG carries a viewBox.
 *
 * A slide whose root `<svg>` declares a width/height but no viewBox has no
 * intrinsic mapping from its user coordinates to that box, so when it is
 * rasterized (or referenced) it renders into the top-left corner and leaves the
 * rest blank. Deriving a viewBox from the declared width/height restores that
 * mapping so the slide content fills the whole slide. See issue #25303 and the
 * regression guarded by PR #25315.
 *
 * The file is patched in place. A missing width/height, an already present
 * viewBox, or an unreadable file is a no-op (nothing to derive from).
 *
 * @param {string} file Path of the slide SVG.
 */
export function ensureSlideViewBox(file) {
  const svg = fs.readFileSync(file, {encoding: 'utf-8'});
  const svgTag = svg.match(/<svg[^>]*>/)?.[0];

  if (!svgTag || /viewBox=/.test(svgTag)) return;

  const width = svgTag.match(/(?<![\w-])width\s*=\s*['"]([\d.]+)/i)?.[1];
  const height = svgTag.match(/(?<![\w-])height\s*=\s*['"]([\d.]+)/i)?.[1];

  if (!width || !height) return;

  const patchedTag = svgTag.replace(
      '<svg', `<svg viewBox="0 0 ${width} ${height}"`);
  fs.writeFileSync(file, svg.replace(svgTag, patchedTag));
}

/**
 * Find the native width, in pixels, of the largest raster `<image>` embedded in
 * a slide SVG. Returns 0 when the slide has no embedded raster (pure vector) or
 * cannot be read.
 * @param {string} file Path of the slide SVG.
 * @return {number} Largest embedded raster width, or 0.
 */
export function largestEmbeddedRasterWidth(file) {
  try {
    const svg = fs.readFileSync(file, {encoding: 'utf-8'});
    let maxWidth = 0;
    const imageTag = /<image\b[^>]*>/gi;
    const widthAttr = /(?<![\w-])width\s*=\s*['"]([\d.]+)/i;
    for (const [tag] of svg.matchAll(imageTag)) {
      const width = parseFloat(tag.match(widthAttr)?.[1]);
      if (width > maxWidth) maxWidth = width;
    }
    return maxWidth;
  } catch (error) {
    return 0;
  }
}

/**
 * Pick the pixel size a slide background should be rasterized at.
 *
 * Never render below the largest raster the slide embeds, otherwise CairoSVG
 * crops the slide when it downscales it (issue #25303) and, whichever renderer
 * is used, a detailed page would be resampled below its native resolution.
 * Keeps the slide's aspect ratio.
 *
 * @param {string} svgPath Path of the slide background SVG.
 * @param {number} width Target output width in pixels (final render).
 * @param {number} height Target output height in pixels.
 * @return {{width: number, height: number}} Size to rasterize at.
 */
export function slideRasterSize(svgPath, width, height) {
  const maxRasterWidth = largestEmbeddedRasterWidth(svgPath);

  if (maxRasterWidth > width) {
    return {
      width: maxRasterWidth,
      height: Math.round(maxRasterWidth * height / width),
    };
  }

  return {width, height};
}

/**
 * Rasterize a slide background from the source PDF page with poppler.
 *
 * Preferred over rendering the derived slide SVG, because CairoSVG cannot
 * reproduce the soft masks that `pdftocairo -svg` emits. Poppler writes a
 * soft-masked fill as an SVG `<mask>` holding an opaque grayscale bitmap of
 * the glyphs, and relies on two `feColorMatrix` primitives to turn that
 * bitmap's luminance into the mask's alpha. CairoSVG implements only
 * `feOffset`, `feBlend` and `feFlood`, so it silently drops `feColorMatrix`,
 * and it applies masks through cairo's `mask_surface` - an *alpha* mask,
 * where SVG specifies a *luminance* mask. The bitmap is opaque everywhere, so
 * the mask passes the whole shape and the fill paints as a solid block: text
 * that a browser renders correctly exports as solid bars.
 *
 * Rendering the page from the PDF sidesteps the SVG round-trip altogether.
 * Poppler produced the slide SVG in the first place and composites PDF soft
 * masks natively, so the background matches what the client displays.
 *
 * @param {string} pdfPath Path of the presentation PDF.
 * @param {number} page 1-based page number to render.
 * @param {string} pngPath Destination path for the rasterized PNG.
 * @param {Object} options
 * @param {number} options.width Width in pixels to render at.
 * @param {number} options.height Height in pixels to render at.
 * @param {string} [options.pdftocairo='pdftocairo'] Path to the pdftocairo
 *   executable. Defaults to resolving it on PATH, as bbb-web does, so a
 *   deployment whose settings.json predates this setting still works.
 * @return {string} Path of the rasterized PNG.
 * @throws {Error} If pdftocairo cannot be spawned or exits non-zero.
 */
export function rasterizeSlideBackgroundFromPdf(pdfPath, page, pngPath, {
  width, height, pdftocairo = 'pdftocairo',
}) {
  // -singlefile appends the extension to the output root itself.
  const outputRoot = pngPath.replace(/\.png$/, '');

  const args = [
    '-png', '-singlefile',
    '-f', String(page), '-l', String(page),
    '-scale-to-x', String(Math.round(width)),
    '-scale-to-y', String(Math.round(height)),
    pdfPath, outputRoot,
  ];

  const result = cp.spawnSync(pdftocairo, args, {shell: false});

  if (result.error) throw result.error;

  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim();
    throw new Error(
        `pdftocairo exited with status ${result.status}: ${stderr}`);
  }

  return `${outputRoot}.png`;
}

/**
 * Rasterize a background slide SVG to a PNG so it composites without cropping.
 *
 * The background slide is later embedded in the annotated SVG as an `<image>`
 * sized to the slide canvas. CairoSVG only rescales a *referenced* SVG to that
 * box when it is resolution-independent; slides carrying absolute units (e.g.
 * `width="720pt"`) keep their intrinsic size and render cropped into the
 * top-left corner even when they have a viewBox (issue #25303, the case PR
 * #25315 could not reach). A raster image always scales to fill the `<image>`
 * box, so rasterizing the slide first sidesteps that. The slide's viewBox is
 * ensured first so that slides missing one still fill the raster.
 *
 * The size to render at comes from `slideRasterSize`, which keeps the raster
 * at or above the slide's own embedded rasters - CairoSVG (< 2.7) crops the
 * slide the same way when it *downscales* an embedded raster below its native
 * pixel size.
 *
 * Kept as the fallback for slides whose source PDF is unavailable; prefer
 * `rasterizeSlideBackgroundFromPdf`, which does not lose soft masks.
 *
 * @param {string} svgPath Path of the slide background SVG.
 * @param {string} pngPath Destination path for the rasterized PNG.
 * @param {Object} options
 * @param {number} options.width Target output width in pixels (final render).
 * @param {number} options.height Target output height in pixels.
 * @param {string} options.cairosvg Path to the CairoSVG executable.
 * @param {boolean} [options.unsafe=false] Pass CairoSVG's `-u` flag, needed
 *   from CairoSVG 2.7.0 onwards to allow loading external resources.
 * @return {string} Path of the rasterized PNG.
 * @throws {Error} If CairoSVG cannot be spawned or exits non-zero.
 */
export function rasterizeSlideBackground(svgPath, pngPath, {
  width, height, cairosvg, unsafe = false,
}) {
  ensureSlideViewBox(svgPath);

  const {width: renderWidth, height: renderHeight} =
    slideRasterSize(svgPath, width, height);

  const args = [
    svgPath,
    '--output-width', renderWidth,
    '--output-height', renderHeight,
    ...(unsafe ? ['-u'] : []),
    '-o', pngPath,
  ];

  const result = cp.spawnSync(cairosvg, args, {shell: false});

  if (result.error) throw result.error;

  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim();
    throw new Error(`CairoSVG exited with status ${result.status}: ${stderr}`);
  }

  return pngPath;
}
