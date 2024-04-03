import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
 * Creates an SVG trapezoid shape from Tldraw v2 JSON data.
 *
 * @class Trapezoid
 * @extends {Geo}
 */
export class Trapezoid extends Geo {
  /**
   * Draws a trapezoid shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the trapezoid.
   */
  draw() {
    const width = this.w;
    const height = this.h + this.growY;

    // Adjust this value as needed for the trapezoid
    const topWidth = width * 0.6;
    const xOffset = (width - topWidth) / 2;

    // Shape begins from the upper left corner
    const points = [
      [xOffset, 0],
      [xOffset + topWidth, 0],
      [width, height],
      [0, height],
    ].map((p) => p.join(',')).join(' ');

    const trapezoidGroup = this.shapeGroup;
    const trapezoid = new SVGPolygon({
      points,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    this.setFill(trapezoid);
    trapezoidGroup.add(trapezoid);
    this.drawLabel(trapezoidGroup);

    return trapezoidGroup;
  }
}
