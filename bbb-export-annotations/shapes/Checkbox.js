import {Line} from '@svgdotjs/svg.js';
import {Rectangle} from './Rectangle.js';

/**
 * Creates an SVG "Checkbox" shape, which is a rectangle with a checkmark in it.
 *
 * @class Checkbox
 * @extends {Rectangle}
 */
export class Checkbox extends Rectangle {
  /**
   * Gets the lines to draw a checkmark inside a given width and height.
   * @param {number} w The width of the bounding rectangle.
   * @param {number} h The height of the bounding rectangle.
   * @return {Array} An array of lines, each defined by two arrays
   *                 representing points.
   * @see {@link https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/lib/shapes/geo/GeoShapeUtil.tsx} Adapted from Tldraw.
  */
  static getCheckBoxLines(w, h) {
    const size = Math.min(w, h) * 0.82;
    const ox = (w - size) / 2;
    const oy = (h - size) / 2;

    const clampX = (x) => Math.max(0, Math.min(w, x));
    const clampY = (y) => Math.max(0, Math.min(h, y));

    return [
      [
        [clampX(ox + size * 0.25), clampY(oy + size * 0.52)],
        [clampX(ox + size * 0.45), clampY(oy + size * 0.82)],
      ],
      [
        [clampX(ox + size * 0.45), clampY(oy + size * 0.82)],
        [clampX(ox + size * 0.82), clampY(oy + size * 0.22)],
      ],
    ];
  }

  /**
   * Draws a "Checkbox" shape on the SVG canvas.
   * @return {G} Returns the SVG group element containing
   *             the rectangle and the checkmark.
  */
  draw() {
    // Draw the base rectangle
    const rectGroup = super.draw();

    // Get the lines for the checkmark
    const lines = Checkbox.getCheckBoxLines(this.w, this.h + this.growY);

    lines.forEach(([start, end]) => {
      const line = new Line();
      line.plot(start[0], start[1], end[0], end[1])
          .stroke({color: this.shapeColor,
            width: this.thickness,
            linecap: 'round'})
          .style({dasharray: this.dasharray});

      // Add the line to the group
      rectGroup.add(line);
    });

    this.drawLabel(rectGroup);

    return rectGroup;
  }
}
