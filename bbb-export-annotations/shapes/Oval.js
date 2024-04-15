import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';
import {TAU} from '../shapes/helpers.js';

/**
 * Creates an SVG oval shape from Tldraw v2 JSON data.
 *
 * @class Oval
 * @extends {Geo}
 */
export class Oval extends Geo {
  /**
   * Draws an oval shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the oval.
   * @see {@link https://github.com/tldraw/tldraw/blob/main/packages/editor/src/lib/primitives/geometry/Stadium2d.ts} Adapted from Tldraw.
   */
  draw() {
    const w = Math.max(1, this.w);
    const h = Math.max(1, this.h + this.growY);
    const cx = w / 2;
    const cy = h / 2;

    const len = 25; // Number of vertices to use for the oval
    const points = Array(len * 2 - 2).fill(null).map(() => []);

    if (h > w) {
      for (let i = 0; i < len - 1; i++) {
        const t1 = -(TAU / 2) + ((TAU / 2) * i) / (len - 2);
        const t2 = ((TAU / 2) * i) / (len - 2);
        points[i] = [cx + cx * Math.cos(t1), cx + cx * Math.sin(t1)];
        points[i + (len - 1)] = [cx + cx * Math.cos(t2),
          h - cx + cx * Math.sin(t2)];
      }
    } else {
      for (let i = 0; i < len - 1; i++) {
        const t1 = -(TAU / 4) + (TAU / 2 * i) / (len - 2);
        const t2 = (TAU / 4) + (TAU / 2 * -i) / (len - 2);
        points[i] = [w - cy + cy * Math.cos(t1), h - cy + cy * Math.sin(t1)];
        points[i + (len - 1)] = [cy - cy * Math.cos(t2),
          h - cy + cy * Math.sin(t2)];
      }
    }

    const formattedPoints = points.map((p) => p.join(',')).join(' ');

    const ovalGroup = this.shapeGroup;
    const oval = new SVGPolygon({
      'points': formattedPoints,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    this.setFill(oval);
    ovalGroup.add(oval);
    this.drawLabel(ovalGroup);

    return ovalGroup;
  }
}
