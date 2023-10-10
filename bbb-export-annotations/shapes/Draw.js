import pkg from 'perfect-freehand';
import {TAU} from '../shapes/helpers.js';
import {Path} from '@svgdotjs/svg.js';
import {Shape} from './Shape.js';

const {getStrokePoints, getStrokeOutlinePoints} = pkg;

/**
 * Creates an SVG path from Tldraw v2 pencil data.
 *
 * @class Draw
 * @extends {Shape}
 */
export class Draw extends Shape {
  /**
   * @param {Object} draw - The draw shape JSON.
   */
  constructor(draw) {
    super(draw);
    this.segments = this.props?.segments;
    this.isClosed = this.props?.isClosed;
    this.isComplete = this.props?.isComplete;
  }

  static simulatePressure = {
    easing: (t) => Math.sin((t * TAU) / 4),
    simulatePressure: true,
  };

  static realPressure = {
    easing: (t) => t * t,
    simulatePressure: false,
  };

  /**
    * Turns an array of points into a path of quadradic curves.
    * @param {Array} annotationPoints
    * @param {Boolean} closed - whether the path end and start
    *                           should be connected (default)
    * @return {Array} - an SVG quadratic curve path
    */
  getSvgPath(annotationPoints, closed = true) {
    const svgPath = annotationPoints.reduce(
        (acc, [x0, y0], i, arr) => {
          if (!arr[i + 1]) return acc;
          const [x1, y1] = arr[i + 1];
          acc.push(x0.toFixed(2), y0.toFixed(2),
              ((x0 + x1) / 2).toFixed(2),
              ((y0 + y1) / 2).toFixed(2));
          return acc;
        },

        ['M', ...annotationPoints[0], 'Q'],
    );

    if (closed) svgPath.push('Z');
    return svgPath;
  }

  /**
   * Renders the draw object as an SVG group element.
   *
   * @return {G} - An SVG group element.
   */
  draw() {
    const shapePoints = this.segments[0]?.points;
    const shapePointsLength = shapePoints?.length || 0;
    const isDashDraw = (this.dash === 'draw');
    const drawGroup = this.shapeGroup;

    const options = {
      size: 1 + this.thickness * 1.5,
      thinning: 0.65,
      streamline: 0.65,
      smoothing: 0.65,
      ...(shapePoints[1]?.z === 0.5 ?
          this.simulatePressure : this.realPressure),
      last: this.isComplete,
    };

    const strokePoints = getStrokePoints(shapePoints, options);

    const drawPath = new Path();
    const fillShape = new Path();

    const last = shapePoints[shapePointsLength - 1];

    // Avoid single dots from not being drawn
    if (strokePoints[0].point[0] == last[0] &&
        strokePoints[0].point[1] == last[1]) {
      strokePoints.push({point: last});
    }

    const solidPath = strokePoints.map((strokePoint) => strokePoint.point);
    const svgPath = this.getSvgPath(solidPath, this.isClosed);

    fillShape.attr('d', svgPath);

    // In case the background shape is the shape itself, add the stroke to it
    if (!isDashDraw) {
      fillShape.attr('stroke', this.shapeColor);
      fillShape.attr('stroke-width', this.thickness);
      fillShape.attr('style', this.dasharray);
    }

    // Fill only applies for closed shapes
    if (!this.isClosed) {
      this.fill = 'none';
    }

    this.setFill(fillShape);

    if (isDashDraw) {
      const strokeOutlinePoints = getStrokeOutlinePoints(strokePoints, options);
      const svgPath = this.getSvgPath(strokeOutlinePoints);

      drawPath.attr('fill', this.shapeColor);
      drawPath.attr('d', svgPath);
    }

    drawGroup.add(fillShape);
    drawGroup.add(drawPath);

    return drawGroup;
  }
}
