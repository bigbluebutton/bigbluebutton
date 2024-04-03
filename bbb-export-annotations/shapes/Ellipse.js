import {Ellipse as SVGEllipse} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';

/**
 * Creates an SVG ellipse shape from Tldraw v2 JSON data.
 *
 * @class Ellipse
 * @extends {Geo}
 */
export class Ellipse extends Geo {
  /**
   * Draws an ellipse shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing the ellipse.
   */
  draw() {
    const rx = this.w / 2;
    const ry = (this.h + this.growY) / 2;

    const ellipseGroup = this.shapeGroup;
    const ellipse = new SVGEllipse({
      'cx': rx.toFixed(2),
      'cy': ry.toFixed(2),
      'rx': rx.toFixed(2),
      'ry': ry.toFixed(2),
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    this.setFill(ellipse);
    ellipseGroup.add(ellipse);
    this.drawLabel(ellipseGroup);

    return ellipseGroup;
  }
}
