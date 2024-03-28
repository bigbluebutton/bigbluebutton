import {Line} from '@svgdotjs/svg.js';
import {Rectangle} from './Rectangle.js';

/**
 * Creates an SVG "XBox" shape, which is a rectangle
 * with an "X" drawn through it.
 *
 * @class XBox
 * @extends {Rectangle}
 */
export class XBox extends Rectangle {
  /**
   * Draws an "XBox" shape on the SVG canvas.
   * @return {G} Returns the SVG group element
   *             containing the rectangle and the X.
   */
  draw() {
    // Draw the base rectangle
    const rectGroup = super.draw();

    // Add the first diagonal line from upper-left to lower-right
    const line1 = new Line();
    line1.plot(0, 0, this.w, this.h + this.growY)
        .stroke({color: this.shapeColor, width: this.thickness})
        .style({dasharray: this.dasharray});

    // Add the second diagonal line from upper-right to lower-left
    const line2 = new Line();
    line2.plot(this.w, 0, 0, this.h + this.growY)
        .stroke({color: this.shapeColor, width: this.thickness})
        .style({dasharray: this.dasharray});

    // Add the lines to the group
    rectGroup.add(line1);
    rectGroup.add(line2);
    this.drawLabel(rectGroup);

    return rectGroup;
  }
}
