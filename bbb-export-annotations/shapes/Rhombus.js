import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
 * Creates an SVG rhombus shape from Tldraw v2 JSON data.
 *
 * @class Rhombus
 * @extends {Geo}
 */
export class Rhombus extends Geo {
  /**
   * Draws a rhombus shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the rhombus.
   */
  draw() {
    const width = this.w;
    const height = this.h + this.growY;

    // Internal angle between adjacent sides varies with width and height
    const offset = Math.min(width * 0.38, height * 0.38);

    // Coordinates for the four vertices of the rhombus
    const points = [
      [offset, 0], // Top left vertex
      [width, 0], // Top right vertex
      [width - offset, height], // Bottom right vertex
      [0, height], // Bottom left vertex
    ].map((p) => p.join(',')).join(' ');

    const rhombusGroup = this.shapeGroup;
    const rhombus = new SVGPolygon({
      points,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    this.setFill(rhombus);
    rhombusGroup.add(rhombus);
    this.drawLabel(rhombusGroup);

    return rhombusGroup;
  }
}
