import {Polygon as SVGPolygon} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
 * Creates an SVG up-arrow shape.
 *
 * @class ArrowUp
 * @extends {Geo}
 */
export class ArrowUp extends Geo {
  /**
   * Draws an up arrow shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the up arrow.
   */
  draw() {
    const w = this.w;
    const h = this.h + this.growY;
    const ox = w * 0.16;
    const oy = Math.min(w, h) * 0.38;

    const points = [
      [w / 2, 0],
      [w, oy],
      [w - ox, oy],
      [w - ox, h],
      [ox, h],
      [ox, oy],
      [0, oy],
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
