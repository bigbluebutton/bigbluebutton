import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';
import {TAU} from './helpers.js';
/**
 * Creates an SVG star shape from Tldraw v2 JSON data.
 *
 * @class Star
 * @extends {Geo}
 */
export class Star extends Geo {
/**
 * Calculates the vertices of an n-point star.
 *
 * @param {number} w - The width of the bounding box.
 * @param {number} h - The height of the bounding box.
 * @param {number} n - The number of points on the star.
 * @return {Array} - An array of {x, y} objects representing star vertices.
 * @see {@link https://github.com/tldraw/tldraw/blob/main/packages/editor/src/lib/primitives/utils.ts} Adapted from Tldraw.
 */
  getStarVertices(w, h, n) {
    const sides = n;
    const step = TAU / sides / 2;

    const rightMostIndex = Math.floor(sides / 4) * 2;
    const leftMostIndex = sides * 2 - rightMostIndex;
    const topMostIndex = 0;
    const bottomMostIndex = Math.floor(sides / 2) * 2;
    const maxX = (Math.cos(-(TAU/4) + rightMostIndex * step) * w) / 2;
    const minX = (Math.cos(-(TAU/4) + leftMostIndex * step) * w) / 2;
    const minY = (Math.sin(-(TAU/4) + topMostIndex * step) * h) / 2;
    const maxY = (Math.sin(-(TAU/4) + bottomMostIndex * step) * h) / 2;

    const diffX = w - Math.abs(maxX - minX);
    const diffY = h - Math.abs(maxY - minY);

    const offsetX = w / 2 + minX - (w / 2 - maxX);
    const offsetY = h / 2 + minY - (h / 2 - maxY);

    const ratio = 1;
    const cx = (w - offsetX) / 2;
    const cy = (h - offsetY) / 2;

    const ox = (w + diffX) / 2;
    const oy = (h + diffY) / 2;
    const ix = (ox * ratio) / 2;
    const iy = (oy * ratio) / 2;

    const points = Array.from(Array(sides * 2)).map((_, i) => {
      const theta = -(TAU/4) + i * step;
      return {
        x: cx + (i % 2 ? ix : ox) * Math.cos(theta),
        y: cy + (i % 2 ? iy : oy) * Math.sin(theta),
      };
    });

    return points;
  }

  /**
   * Draws a star shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the star.
   */
  draw() {
    const width = this.w;
    const height = this.h + this.growY;

    // Get the vertices of the star
    const pointsOnPerimeter = this.getStarVertices(width, height, 5);

    // Convert the vertices to SVG polygon points format
    const points = pointsOnPerimeter.map((p) => `${p.x},${p.y}`).join(' ');

    // Create the SVG polygon
    const starGroup = this.shapeGroup;
    const star = new SVGPolygon({
      points,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    // Fill the polygon if required
    this.setFill(star);
    starGroup.add(star);

    this.drawLabel(starGroup);

    return starGroup;
  }
}
