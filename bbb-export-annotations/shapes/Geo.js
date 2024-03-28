import {Shape} from './Shape.js';
import {TAU} from './helpers.js';
/**
 * Class representing geometric shapes.
 *
 * @class Geo
 * @extends {Shape}
 */
export class Geo extends Shape {
  /**
   * Creates an instance of Geo.
   *
   * @param {Object} geo - JSON containing geometric shape properties.
   */
  constructor(geo) {
    super(geo);
    this.url = this.props?.url;
    this.font = this.props?.font;
    this.w = this.props?.w;
    this.h = this.props?.h;
    this.growY = this.props?.growY;
    this.align = this.props?.align;
    this.geo = this.props?.geo;
    this.verticalAlign = this.props?.verticalAlign;
    this.labelColor = this.props?.labelColor;
  }

  /**
 * Gets the vertices of a polygon given its dimensions and the number of sides.
 * @param {number} width The width of the bounding box for the polygon.
 * @param {number} height The height of the bounding box for the polygon.
 * @param {number} sides The number of sides for the polygon.
 * @return {Array} An array of objects with x and y coordinates for each vertex.
 * @see {@link https://github.com/tldraw/tldraw/blob/main/packages/editor/src/lib/primitives/utils.ts} Adapted from Tldraw.
 */
  static getPolygonVertices(width, height, sides) {
    const cx = width / 2;
    const cy = height / 2;
    const pointsOnPerimeter = [];
    let minX = Infinity;
    let minY = Infinity;

    for (let i = 0; i < sides; i++) {
      const step = TAU / sides;
      const t = -(TAU / 4) + i * step;
      const x = cx + cx * Math.cos(t);
      const y = cy + cy * Math.sin(t);

      if (x < minX) minX = x;
      if (y < minY) minY = y;

      pointsOnPerimeter.push({x, y});
    }

    if (minX !== 0 || minY !== 0) {
      for (let i = 0; i < pointsOnPerimeter.length; i++) {
        const pt = pointsOnPerimeter[i];
        pt.x -= minX;
        pt.y -= minY;
      }
    }

    return pointsOnPerimeter;
  }
}
