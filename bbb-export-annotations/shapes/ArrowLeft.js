import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
 * Creates an SVG left-arrow shape.
 *
 * @class ArrowLeft
 * @extends {Geo}
 */
export class ArrowLeft extends Geo {
  /**
   * Draws a left arrow shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the left arrow.
   */
  draw() {
    const w = this.w;
    const h = this.h + this.growY;
    const ox = Math.min(w, h) * 0.38;
    const oy = h * 0.16;

    const points = [
      [ox, 0],
      [ox, oy],
      [w, oy],
      [w, h - oy],
      [ox, h - oy],
      [ox, h],
      [0, h / 2],
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
