import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
 * Creates an SVG hexagon shape from Tldraw v2 JSON data.
 *
 * @class Hexagon
 * @extends {Geo}
 */
export class Hexagon extends Geo {
  /**
   * Draws a hexagon shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the hexagon.
   */
  draw() {
    const width = this.w;
    const height = this.h + this.growY;
    const sides = 6;

    // Get the vertices of the hexagon
    const pointsOnPerimeter = Geo.getPolygonVertices(width, height, sides);

    // Convert the vertices to SVG polygon points format
    const points = pointsOnPerimeter.map((p) => `${p.x},${p.y}`).join(' ');

    // Create the SVG polygon
    const hexagonGroup = this.shapeGroup;
    const hexagon = new SVGPolygon({
      points,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    // Fill the polygon if required
    this.setFill(hexagon);
    hexagonGroup.add(hexagon);
    this.drawLabel(hexagonGroup);

    return hexagonGroup;
  }
}
