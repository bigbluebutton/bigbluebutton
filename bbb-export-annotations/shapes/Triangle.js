import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
   * Creates an SVG triangle shape from Tldraw v2 JSON data.
   *
   * @class Triangle
   * @extends {Geo}
   */
export class Triangle extends Geo {
  /**
     * Draws a triangle shape on the SVG canvas.
     * @return {G} Returns the SVG group element containing the triangle.
     */
  draw() {
    const width = this.w;
    const height = this.h + this.growY;
    const halfWidth = width / 2;

    // Shape begins from the upper left corner
    const points = [
      [halfWidth, 0],
      [width, height],
      [0, height],
    ].map((p) => p.join(',')).join(' ');

    const triangleGroup = this.shapeGroup;
    const triangle = new SVGPolygon({
      points,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    this.setFill(triangle);
    triangleGroup.add(triangle);
    this.drawLabel(triangleGroup);

    return triangleGroup;
  }
}
