import {Path, Marker, Defs} from '@svgdotjs/svg.js';
import {Shape} from './Shape.js';
import {TAU, circleFromThreePoints, normalize, rotate}
  from '../shapes/helpers.js';
import {ColorTypes} from '../shapes/Shape.js';

/**
 * Creates an SVG path from Tldraw v2 arrow data.
 *
 * @class Arrow
 * @extends {Shape}
 */
export class Arrow extends Shape {
  /**
   * @param {Object} arrow - The arrow shape JSON.
   */
  constructor(arrow) {
    super(arrow);
    this.start = this.props?.start;
    this.end = this.props?.end;
    this.arrowheadStart = this.props?.arrowheadStart;
    this.arrowheadEnd = this.props?.arrowheadEnd;
    this.bend = this.props?.bend;
  }

  /**
 * Calculates the midpoint of a curve considering the bend of the line.
 * The midpoint is adjusted by the bend property to represent the
 * actual midpoint of a quadratic Bezier curve defined by the start
 * and end points with the bend as control point offset.
 *
 * @return {number[]} An array containing the x and y coordinates.
 */
  getMidpoint() {
    const mid = [
      (this.start.x + this.end.x) / 2,
      (this.start.y + this.end.y) / 2];

    const unitVector = normalize([
      this.end.x - this.start.x,
      this.end.y - this.start.y]);

    const unitRotated = rotate(unitVector);
    const bendOffset = [
      unitRotated[0] * -this.bend,
      unitRotated[1] * -this.bend];

    const middle = [
      mid[0] + bendOffset[0],
      mid[1] + bendOffset[1]];

    return middle;
  }

  /**
   * Calculates the angle in radians between the line segments joining the start
   * point to the midpoint and the endpoint to the midpoint of a given set of
   * points. Assumes that `this.getMidpoint()` is a method which calculates the
   * midpoint between the start and end points, `this.start` is the start point,
   * and `this.end` is the end point of the line segments. The points are
   * objects with `x` and `y`properties representing their coordinates.
   * @return {number} Angle between the two line segments at the midpoint.
 */
  getTheta() {
    const [middleX, middleY] = this.getMidpoint();

    const ab = Math.hypot(this.start.y - middleY, this.start.x - middleX);
    const bc = Math.hypot(middleY - this.end.y, middleX - this.end.x);
    const ca = Math.hypot(this.end.y - this.start.y, this.end.x - this.start.x);
    const theta = Math.acos((bc * bc + ca * ca - ab * ab) / (2 * bc * ca)) * 2;
    return theta || 0;
  }

  /**
   * Constructs the path for the arrow, considering straight and curved lines.
   *
   * @return {string} - The SVG path string.
   */
  constructPath() {
    const [startX, startY] = [this.start.x, this.start.y];
    const [endX, endY] = [this.end.x, this.end.y];
    const bend = this.bend;

    const isStraightLine = (bend.toFixed(2) === '0.00');
    const straightLine = `M ${startX} ${startY} L ${endX} ${endY}`;

    if (isStraightLine) {
      return straightLine;
    }

    const [middleX, middleY] = this.getMidpoint();

    const [,, r] = circleFromThreePoints(
        [startX, startY],
        [middleX, middleY],
        [endX, endY]);

    // Could not calculate a circle
    if (!r) {
      return straightLine;
    }

    const radius = r.toFixed(2);

    // Whether to draw the longer arc
    const theta = this.getTheta();
    const largeArcFlag = theta > (TAU / 4) ? '1' : '0';

    // Clockwise or counterclockwise
    const sweepFlag = ((endX - startX) * (middleY - startY) -
                        (middleX - startX) * (endY - startY) > 0 ? '0' : '1');

    const path = `M ${startX} ${startY} ` +
                 `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ` +
                 `${endX} ${endY}`;

    return path;
  }

  /**
 * Calculates the tangent angles at the start and end points of a path.
 * This method assumes that the path is an instance of a class with
 * a method `pointAt` which returns a point with `x` and `y` properties
 * given a distance along the path.
 *
 * @param {Object} path - SVG.js path with the `pointAt` method.
 * @return {Object} An object with `startAngleDegrees` and `endAngleDegrees`
 * properties.
 */
  getTangentAngleAtEnds(path) {
    const length = path.length();
    const start = path.pointAt(0);
    const epsilon = 0.01; // A small value
    const end = path.pointAt(length);

    // Get points just a little further along the path to calculate the tangent
    const startTangentPoint = path.pointAt(epsilon);
    const endTangentPoint = path.pointAt(length - epsilon);

    // Calculate angles using Math.atan2 to find the slope of the tangent
    const startAngleRadians = Math.atan2(
        startTangentPoint.y - start.y,
        startTangentPoint.x - start.x) + + TAU / 2;

    const endAngleRadians = Math.atan2(
        end.y - endTangentPoint.y,
        end.x - endTangentPoint.x);

    // Convert to degrees
    const startAngleDegrees = startAngleRadians * (360 / TAU);
    const endAngleDegrees = endAngleRadians * (360 / TAU);

    return {startAngleDegrees, endAngleDegrees};
  }

  /**
   * Creates a marker element with specified attributes
   * and shape based on the type. The marker is configured with default
   * properties which can be overridden according to the type.
   * The marker type determines the path and fill of the SVG element.
   *
   * @param {string} type - One of 'arrow', 'diamond', 'triangle', 'inverted',
   *                        'square', 'dot', 'bar'.
   * @param {string} url - URL reference in SVG.
   * @param {number} [angle=0] - Angle in degrees for the marker.
   * @return {Marker} A new Marker instance.
  */
  createMarker(type, url, angle = 0) {
    const arrowMarker = new Marker({
      id: url,
      viewBox: '0 0 10 10',
      refX: '5',
      refY: '5',
      markerWidth: '6',
      markerHeight: '6',
      orient: angle,
    });

    const fillColor = Shape.colorToHex(this.color, ColorTypes.FillColor);

    switch (type) {
      case 'arrow':
        arrowMarker.path('M 0 0 L 10 5 L 0 10 Z').fill(this.shapeColor);
        break;
      case 'diamond':
        arrowMarker.path('M 5 0 L 10 5 L 5 10 L 0 5 z')
            .stroke(this.shapeColor)
            .fill(fillColor);
        break;
      case 'triangle':
        arrowMarker.path('M 0 0 L 10 5 L 0 10 Z')
            .stroke(this.shapeColor)
            .fill(fillColor);
        break;
      case 'inverted':
        arrowMarker.attr('orient', angle + 180);
        arrowMarker.path('M 0 0 L 10 5 L 0 10 Z')
            .stroke(this.shapeColor)
            .fill(fillColor);
        break;
      case 'square':
        arrowMarker.path('M 0 0 L 10 0 L 10 10 L 0 10 Z')
            .stroke(this.shapeColor)
            .fill(fillColor);
        break;
      case 'dot':
        const circleSize = 5;
        arrowMarker.attr('refX', '0');
        arrowMarker.attr('refY', circleSize / 2);
        arrowMarker.attr('markerUnits', 'strokeWidth');
        arrowMarker.attr('markerWidth', '6');
        arrowMarker.attr('markerHeight', '6');
        arrowMarker.stroke('context-stroke');
        arrowMarker.fill(fillColor);
        arrowMarker.circle(circleSize)
            .stroke(this.shapeColor)
            .fill(fillColor);
        break;
      case 'bar':
        arrowMarker.attr('refX', '0');
        arrowMarker.attr('refY', '2.5');
        arrowMarker.path('M 0 0 L 0 -5 L 2 -5  L 2 5 L 0 5 Z')
            .stroke(this.shapeColor)
            .fill(this.shapeColor);
        break;
      default:
        arrowMarker.path('M 0 0 L 10 5 L 0 10 z').fill(this.shapeColor);
    }
    return arrowMarker;
  }

  /**
   * Renders the arrow object as an SVG group element.
   *
   * @return {G} - An SVG group element.
   */
  draw() {
    const arrowGroup = this.shapeGroup;
    const arrowPath = new Path();
    const pathData = this.constructPath();

    arrowPath.attr({
      'd': pathData,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
      'fill': 'none',
    });

    const angles = this.getTangentAngleAtEnds(arrowPath);

    // If there are arrowheads, create the markers
    if (this.arrowheadStart !== 'none' || this.arrowheadEnd !== 'none') {
      const defs = new Defs();

      // There is an arrowhead at the start
      if (this.arrowheadStart !== 'none') {
        const url = `${this.arrowheadStart}-${this.id}-start`;
        const startMarker = this.createMarker(
            this.arrowheadStart,
            url,
            angles.startAngleDegrees);

        defs.add(startMarker);
        arrowPath.attr('marker-start', `url(#${url})`);
      }

      // There is an arrowhead at the end
      if (this.arrowheadEnd !== 'none') {
        const url = `${this.arrowheadEnd}-${this.id}-end`;
        const endMarker = this.createMarker(
            this.arrowheadEnd,
            url,
            angles.endAngleDegrees);
        defs.add(endMarker);
        arrowPath.attr('marker-end', `url(#${url})`);
      }

      arrowGroup.add(defs);
    }

    arrowGroup.add(arrowPath);
    this.drawLabel(arrowGroup);

    return arrowGroup;
  }
}
