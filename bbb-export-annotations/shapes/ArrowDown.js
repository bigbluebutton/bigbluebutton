import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
 * Creates an SVG down-arrow shape.
 *
 * @class ArrowDown
 * @extends {Geo}
 */
export class ArrowDown extends Geo {
  /**
   * Draws a down arrow shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the down arrow.
   */
  draw() {
    const w = this.w;
    const h = this.h + this.growY;
    const ox = w * 0.16;
    const oy = Math.min(w, h) * 0.38;

    const points = [
      [ox, 0],
      [w - ox, 0],
      [w - ox, h - oy],
      [w, h - oy],
      [w / 2, h],
      [0, h - oy],
      [ox, h - oy],
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
