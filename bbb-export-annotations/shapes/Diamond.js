import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
   * Creates an SVG diamond shape from Tldraw v2 JSON data.
   *
   * @class Diamond
   * @extends {Geo}
   */
export class Diamond extends Geo {
  /**
     * Draws a diamond shape on the SVG canvas.
     * @return {G} Returns the SVG group element containing the diamond.
     */
  draw() {
    const width = this.w;
    const height = this.h + this.growY;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Shape begins from the upper left corner
    const points = [
      [0, halfHeight],
      [halfWidth, 0],
      [width, halfHeight],
      [halfWidth, height],
    ].map((p) => p.join(',')).join(' ');

    const diamondGroup = this.shapeGroup;
    const diamond = new SVGPolygon({
      points,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    this.setFill(diamond);
    diamondGroup.add(diamond);
    this.drawLabel(diamondGroup);

    return diamondGroup;
  }
}
