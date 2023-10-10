import {Path} from '@svgdotjs/svg.js';
import {Shape} from './Shape.js';

/**
 * Creates an SVG path from Tldraw v2 line data.
 *
 * @class Line
 * @extends {Shape}
 */
export class Line extends Shape {
  /**
   * @param {Object} line - The line shape JSON.
   */
  constructor(line) {
    super(line);
    this.handles = this.props?.handles;
    this.spline = this.props?.spline;
  }

  /**
   * Given the line type (spline, line), constructs the SVG path.
   *
   * @param {Object} handles - The vertex points and control points.
   * @param {string} spline - The type of spline ('cubic' or 'line').
   * @return {string} - The SVG path data.
   */
  constructPath(handles, spline) {
    const start = handles.start;
    const end = handles.end;
    const ctl = handles['handle:a1V'];
    let path = `M${start.x},${start.y} `;

    if (spline === 'cubic' && ctl) {
      // Compute adjusted control points to make curve pass through `ctl`
      const t = 0.5; // Assumes the curve passes through `ctl` at t = 0.5
      const b = {
        x: (ctl.x - (1-t) ** 3 * start.x - t ** 3 * end.x) / (3 * (1-t) * t),
        y: (ctl.y - (1-t) ** 3 * start.y - t ** 3 * end.y) / (3 * (1-t) * t),
      };
      const c = {
        x: (ctl.x - (1-t) ** 3 * start.x - t ** 3 * end.x) / (3 * (1-t) * t),
        y: (ctl.y - (1-t) ** 3 * start.y - t ** 3 * end.y) / (3 * (1-t) * t),
      };
      // Draw cubic spline
      path += `C${b.x},${b.y} ${c.x},${c.y} ${end.x},${end.y}`;
    } else if (spline === 'line' && ctl) {
      // Draw straight lines to and from control point
      path += `L${ctl.x},${ctl.y} L${end.x},${end.y}`;
    } else {
      // Draw straight line
      path += `L${end.x},${end.y}`;
    }

    return path;
  }

  /**
   * Renders the line object as an SVG group element.
   *
   * @return {G} - An SVG group element.
   */
  draw() {
    const lineGroup = this.shapeGroup;
    const linePath = new Path();

    const svgPath = this.constructPath(this.handles, this.spline);

    linePath.attr({
      'd': svgPath,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
      'fill': 'none',
    });

    lineGroup.add(linePath);
    this.drawLabel(lineGroup);

    return lineGroup;
  }
}
