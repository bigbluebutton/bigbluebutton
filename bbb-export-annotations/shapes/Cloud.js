import {Path} from '@svgdotjs/svg.js';
import {Geo} from './Geo.js';
import {angle, rng, TAU, getPointOnCircle, calculateDistance,
  clockwiseAngleDist} from '../shapes/helpers.js';
/**
 * Class representing a Cloud shape.
 * @see {@link https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/lib/shapes/geo/cloudOutline.ts} Adapted from Tldraw.
 */
export class Cloud extends Geo {
  /**
  * Generate points on an arc between two given points.
  *
  * @param {Object} startPoint - Starting point with 'x' and 'y' properties.
  * @param {Object} endPoint - End point with 'x' and 'y' properties.
  * @param {Object|null} center - Center point with 'x' and 'y' properties
  * @param {number} radius - The radius of the circle.
  * @param {number} numPoints - The number of points to generate along the arc.
  * @return {Array} Array of point objects representing the points on the arc.
  */
  static pointsOnArc(startPoint, endPoint, center, radius, numPoints) {
    if (center === null) {
      return [startPoint, endPoint];
    }

    const results = [];
    const startAngle = angle(center, startPoint);
    const endAngle = angle(center, endPoint);
    const l = clockwiseAngleDist(startAngle, endAngle);

    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const angle = startAngle + l * t;
      const point = getPointOnCircle(center.x, center.y, radius, angle);
      results.push(point);
    }

    return results;
  }

  /**
 * Function to get points on the "pill" shape.
 *
 * @static
 * @param {number} width - The width of the pill shape.
 * @param {number} height - The height of the pill shape.
 * @param {number} numPoints - The number of points to generate.
 * @return {Array} - Array of points on the pill shape.
 */
  static getPillPoints(width, height, numPoints) {
    const radius = Math.min(width, height) / 2;
    const longSide = Math.max(width, height) - radius * 2;
    const circumference = TAU * radius + 2 * longSide;
    const spacing = circumference / numPoints;

    const sections = width > height ?
        [
          {type: 'straight', start: {x: radius, y: 0}, delta: {x: 1, y: 0}},
          {type: 'arc', center: {x: width - radius, y: radius},
            startAngle: -TAU / 4},
          {type: 'straight', start: {x: width - radius, y: height},
            delta: {x: -1, y: 0}},
          {type: 'arc', center: {x: radius, y: radius}, startAngle: TAU / 4},
        ] :
        [
          {type: 'straight', start: {x: width, y: radius}, delta: {x: 0, y: 1}},
          {type: 'arc', center: {x: radius, y: height - radius}, startAngle: 0},
          {type: 'straight', start: {x: 0, y: height - radius},
            delta: {x: 0, y: - 1}},
          {type: 'arc', center: {x: radius, y: radius}, startAngle: TAU / 2},
        ];

    let sectionOffset = 0;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const section = sections[0];
      if (section.type === 'straight') {
        points.push({
          x: section.start.x + section.delta.x * sectionOffset,
          y: section.start.y + section.delta.y * sectionOffset,
        });
      } else {
        points.push(getPointOnCircle(
            section.center.x,
            section.center.y,
            radius,
            section.startAngle + sectionOffset / radius,
        ));
      }
      sectionOffset += spacing;
      let sectionLength =
        section.type === 'straight' ? longSide : (TAU / 2) * radius;
      while (sectionOffset > sectionLength) {
        sectionOffset -= sectionLength;
        sections.push(sections.shift());
        sectionLength =
            sections[0].type === 'straight' ? longSide : (TAU / 2) * radius;
      }
    }

    return points;
  }

  /**
   * Returns a numerical value based on the given size parameter.
   *
   * @static
   * @param {string} size - The size style, one of: 's', 'm', 'l', 'xl'.
   * @return {number} The numerical value corresponding to the given size.
   * @throws Will default to 130 if the size parameter doesn't match any case.
  */
  static switchSize(size) {
    switch (size) {
      case 's':
        return 50;
      case 'm':
        return 70;
      case 'l':
        return 100;
      case 'xl':
        return 130;
      default:
        return 130;
    }
  }

  /**
   * Calculates the circumference of a pill shape.
   *
   * A pill shape is a rectangle with semi-circular ends. The function
   * calculates the total distance around the shape using its width and height.
   *
   * @static
   * @param {number} width - The width of the pill shape.
   * @param {number} height - The height of the pill shape.
   * @return {number} The circumference of the pill shape.
   */
  static getPillCircumference(width, height) {
    const radius = Math.min(width, height) / 2;
    const longSide = Math.max(width, height) - radius * 2;

    return TAU * radius + 2 * longSide;
  }

  /**
   * Get arcs for generating a cloud shape.
   *
   * @static
   * @param {number} width - The width of the cloud.
   * @param {number} height - The height of the cloud.
   * @param {string} seed - The random seed for the cloud.
   * @param {Object} size - The size style for the cloud.
   * @return {Array} An array of arcs data.
  */
  static getCloudArcs(width, height, seed, size) {
    const getRandom = rng(seed);

    const pillCircumference = Cloud.getPillCircumference(width, height);

    const numBumps = Math.max(
        Math.ceil(pillCircumference / Cloud.switchSize(size)),
        6,
        Math.ceil(pillCircumference / Math.min(width, height)),
    );

    const targetBumpProtrusion = (pillCircumference / numBumps) * 0.2;

    const innerWidth = Math.max(width - targetBumpProtrusion * 2, 1);
    const innerHeight = Math.max(height - targetBumpProtrusion * 2, 1);
    const paddingX = (width - innerWidth) / 2;
    const paddingY = (height - innerHeight) / 2;

    const distanceBetweenPointsOnPerimeter =
        Cloud.getPillCircumference(innerWidth, innerHeight) / numBumps;

    let bumpPoints = Cloud.getPillPoints(innerWidth, innerHeight, numBumps);
    bumpPoints = bumpPoints.map((p) => {
      return {
        x: p.x + paddingX,
        y: p.y + paddingY,
      };
    });

    const maxWiggleX = width < 20 ? 0 : targetBumpProtrusion * 0.3;
    const maxWiggleY = height < 20 ? 0 : targetBumpProtrusion * 0.3;
    const wiggledPoints = bumpPoints.slice(0);

    for (let i = 0; i < Math.floor(numBumps / 2); i++) {
      wiggledPoints[i].x += getRandom() * maxWiggleX;
      wiggledPoints[i].y += getRandom() * maxWiggleY;
      wiggledPoints[numBumps - i - 1].x += getRandom() * maxWiggleX;
      wiggledPoints[numBumps - i - 1].y += getRandom() * maxWiggleY;
    }

    const arcs = [];

    for (let i = 0; i < wiggledPoints.length; i++) {
      const j = i === wiggledPoints.length - 1 ? 0 : i + 1;
      const leftWigglePoint = wiggledPoints[i];
      const rightWigglePoint = wiggledPoints[j];
      const leftPoint = bumpPoints[i];
      const rightPoint = bumpPoints[j];

      const midPoint = {
        x: (leftPoint.x + rightPoint.x) / 2,
        y: (leftPoint.y + rightPoint.y) / 2,
      };

      const offsetAngle = Math.atan2(rightPoint.y - leftPoint.y,
          rightPoint.x - leftPoint.x) - TAU;

      const distanceBetweenOriginalPoints =
        Math.sqrt(Math.pow(rightPoint.x - leftPoint.x, 2) +
        Math.pow(rightPoint.y - leftPoint.y, 2));

      const curvatureOffset =
        distanceBetweenPointsOnPerimeter - distanceBetweenOriginalPoints;

      const distanceBetweenWigglePoints =
        Math.sqrt(Math.pow(rightWigglePoint.x - leftWigglePoint.x, 2) +
        Math.pow(rightWigglePoint.y - leftWigglePoint.y, 2));

      const relativeSize =
        distanceBetweenWigglePoints / distanceBetweenOriginalPoints;
      const finalDistance = (Math.max(paddingX, paddingY) +
        curvatureOffset) * relativeSize;

      const arcPoint = {
        x: midPoint.x + Math.cos(offsetAngle) * finalDistance,
        y: midPoint.y + Math.sin(offsetAngle) * finalDistance,
      };

      arcPoint.x = Math.min(Math.max(arcPoint.x, 0), width);
      arcPoint.y = Math.min(Math.max(arcPoint.y, 0), height);

      arcs.push({
        leftPoint: leftWigglePoint,
        rightPoint: rightWigglePoint,
        arcPoint,
      });
    }

    return arcs;
  }

  /**
  * Generate an SVG path string to represent a cloud shape using arc segments.
  *
  * @param {number} width - The width of the cloud.
  * @param {number} height - The height of the cloud.
  * @param {number} seed - The seed value for randomization (if applicable).
  * @param {number} size - The size of the cloud.
  * @return {string} - An SVG path string representing the cloud.
  */
  static cloudSvgPath(width, height, seed, size) {
    // Get cloud arcs based on input parameters
    const arcs = Cloud.getCloudArcs(width, height, seed, size);

    // Initialize SVG path starting with the 'M' command
    // for the first arc's leftPoint
    const initialX = arcs[0].leftPoint.x.toFixed(2);
    const initialY = arcs[0].leftPoint.y.toFixed(2);
    let path = `M${initialX},${initialY}`;

    // Loop through all arcs to construct the 'A' commands for the SVG path
    for (const {leftPoint, rightPoint, arcPoint} of arcs) {
      // Approximate radius through heuristic, as determining the true
      // radius from the circle formed by the three points proved numerically
      // unstable.
      const radius = calculateDistance(leftPoint, arcPoint).toFixed(2);

      const endPointX = rightPoint.x.toFixed(2);
      const endPointY = rightPoint.y.toFixed(2);

      path += `A${radius},${radius} 0 0, 1 ${endPointX},${endPointY}`;
    }

    // Close the SVG path with 'Z'
    path += ' Z';
    return path;
  }

  /**
 * Renders a cloud shape on the SVG canvas. It uses a predefined SVG path
 * for the cloud shape, which is scaled to the dimensions of the instance.
 * @return {G} An SVG group element (`<g>`)
 * that contains the cloud path and label.
 */
  draw() {
    const points = Cloud.cloudSvgPath(
        this.w,
        this.h + this.growY,
        this.id,
        this.size);

    const cloudGroup = this.shapeGroup;
    const cloud = new Path({
      'd': points,
      'stroke': this.shapeColor,
      'stroke-width': this.thickness,
      'style': this.dasharray,
    });

    this.setFill(cloud);
    cloudGroup.add(cloud);
    this.drawLabel(cloudGroup);

    return cloudGroup;
  }
}
