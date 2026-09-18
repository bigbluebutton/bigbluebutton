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
 * The rasterization itself must avoid a second CairoSVG (< 2.7) quirk: when it
 * *downscales* an embedded raster below its native pixel size it crops the
 * slide the same way. Office-document slides embed a single high-resolution
 * image (e.g. a 2048px picture in a 720pt viewBox), so the final resolution
 * `toPx(slideWidth)` can fall well below it. We therefore render at least as
 * large as the biggest embedded raster; the composite scales the PNG down
 * cleanly afterwards, keeping the background sharp.
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

  // Never render below the largest embedded raster's native width, otherwise
  // CairoSVG crops the slide (issue #25303). Keep the slide's aspect ratio.
  let renderWidth = width;
  let renderHeight = height;
  const maxRasterWidth = largestEmbeddedRasterWidth(svgPath);
  if (maxRasterWidth > renderWidth) {
    renderWidth = maxRasterWidth;
    renderHeight = Math.round(maxRasterWidth * height / width);
  }

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
