import { Resvg } from '@resvg/resvg-js';

export interface Rendered {
  png: Buffer;
  rgba: Buffer;
  width: number;
  height: number;
}

/**
 * Rasterizes a slide SVG over white at a fixed width. resvg is deterministic and needs no browser;
 * it ignores JPEG EXIF orientation, which is why the exif check exists separately.
 */
export function renderSvg(svg: string | Buffer, width = 400): Rendered {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'white',
    font: { loadSystemFonts: false },
    logLevel: 'off',
  });
  const img = resvg.render();
  return { png: img.asPng(), rgba: Buffer.from(img.pixels), width: img.width, height: img.height };
}
