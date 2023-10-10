import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
 * Creates an SVG right-arrow shape.
 *
 * @class ArrowRight
 * @extends {Geo}
 */
export class ArrowRight extends Geo {
  /**
   * Draws a right arrow shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the right arrow.
   */
  draw() {
    const w = this.w;
    const h = this.h + this.growY;
    const ox = Math.min(w, h) * 0.38;
    const oy = h * 0.16;

    const points = [
      [0, oy],
      [w - ox, oy],
      [w - ox, 0],
      [w, h / 2],
      [w - ox, h],
      [w - ox, h - oy],
      [0, h - oy],
    ].map(([x, y]) => `${x},${y}`).join(' ');

    const arrowGroup = this.shapeGroup;
    const arrow = new SVGPolygon();
    arrow.plot(points)
        .stroke({color: this.shapeColor, width: this.thickness})
        .style({dasharray: this.dasharray});

    this.setFill(arrow);
    arrowGroup.add(arrow);
    this.drawLabel(arrowGroup);

    return arrowGroup;
  }
}
