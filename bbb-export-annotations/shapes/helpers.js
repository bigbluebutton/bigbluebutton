/**
 * Represents the constant TAU, which is equal to 2 * PI.
 *
 * TAU is often used in trigonometric calculations as it represents
 * one full turn in radians, making it more intuitive than using 2 * PI.
 * For example, half a circle is TAU / 2, a quarter is TAU / 4, etc.,
 * which makes the math easier to follow.
 *
 * @constant {number}
 */
export const TAU = Math.PI * 2;

/**
 * Sorts an array of objects lexicographically based on a nested key-value pair.
 *
 * @param {Array} array - The array to be sorted.
 * @param {string} key - The key in each object to be used for sorting.
 * @param {string} value - The nested key within the 'key' object to be used
 *                         for sorting.
 * @return {Array} - Returns a new array sorted lexicographically
 *                    by the specified nested key-value pair.
 *
 * @example
 * const data = [
 *   {annotationInfo: {index: 'a1V'}, type: 'shape'},
 *   {annotationInfo: {index: 'a2'}, type: 'shape'},
 *   {annotationInfo: {index: 'a1'}, type: 'draw'}
 * ];
 * const sortedData = sortByKey(data, 'annotationInfo', 'index');
 * // Output: [{ annotationInfo: { index: 'a1' }, type: 'draw' },
 *             { annotationInfo: { index: 'a1V' }, type: 'shape' },
 *             { annotationInfo: { index: 'a2' }, type: 'shape' }]
 */
export function sortByKey(array, key, value) {
  return array.sort((a, b) => {
    const [x, y] = [a[key][value], b[key][value]];
    return x.localeCompare(y);
  });
}

/**
   * Converts an angle from radians to degrees.
   *
   * @param {number} angle - The angle in radians.
   * @return {number} The angle in degrees, fixed to two decimal places.
   */
export function radToDegree(angle) {
  return parseFloat(angle * (360 / TAU)).toFixed(2) || 0;
}

/**
 * Random number generator based on a seed value.
 * This uses a variation of the xorshift algorithm to generate
 * pseudo-random numbers. The function returns a `next` function that,
 * when called, generates the next random number in sequence.
 *
 * @param {string} [seed=''] - The seed value for the random number generator.
 *                             Default is an empty string.
 * @return {Function} The `next` function to generate random numbers.
 * @see {@link https://github.com/tldraw/tldraw/blob/main/packages/utils/src/lib/number.ts} Adapted from Tldraw.
 */
export function rng(seed = '') {
  let x = 0;
  let y = 0;
  let z = 0;
  let w = 0;

  /**
 * Generates the next number in the pseudo-random sequence using bitwise
 * operations. This function uses a form of 'xorshift', a type of pseudo-
 * random number generator algorithm. It manipulates four state variables
 * \( x, y, z, w \) with bitwise operations to produce a new random number
 * upon each call. The returned value is scaled to the range [0, 2).
 * @return {number} The next pseudo-random number within [0, 2).
 */
  function next() {
    const t = x ^ (x << 11);
    x = y;
    y = z;
    z = w;
    w ^= ((w >>> 19) ^ t ^ (t >>> 8)) >>> 0;
    return (w / 0x100000000) * 2;
  }

  for (let k = 0; k < seed.length + 64; k++) {
    x ^= seed.charCodeAt(k) | 0;
    next();
  }

  return next;
}

/**
 * Get a point on the perimeter of a circle.
 *
 * @param {number} cx - The center x of the circle.
 * @param {number} cy - The center y of the circle.
 * @param {number} r - The radius of the circle.
 * @param {number} a - The angle in radians to get the point from.
 * @return {Object} A point object with 'x' and 'y' properties
 * @public
 */
export function getPointOnCircle(cx, cy, r, a) {
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

/**
 * Calculates the angle (in radians) between a center point and another point
 * using the arctangent of the quotient of their coordinates.
 * The angle is measured in the coordinate system where x-axis points to the
 * right and y-axis points down. The angle is measured counterclockwise
 * from the positive x-axis.
 *
 * @param {Object} center - The center point with x and y coordinates.
 * @param {number} center.x - The x-coordinate of the center point.
 * @param {number} center.y - The y-coordinate of the center point.
 *
 * @param {Object} point - The other point with x and y coordinates.
 * @param {number} point.x - The x-coordinate of the other point.
 * @param {number} point.y - The y-coordinate of the other point.
 *
 * @return {number} The angle in radians between the line from the center
 *                  to the other point and the positive x-axis.
 */
export function angle(center, point) {
  const dy = point.y - center.y;
  const dx = point.x - center.x;
  return Math.atan2(dy, dx);
}

/**
 * Calculate the clockwise angular distance between two angles.
 *
 * This function takes two angles in radians and calculates the
 * shortest angular distance between them in the clockwise direction.
 * The result is also in radians and accounts for full circle rotation.
 *
 * @param {number} startAngle - The starting angle in radians.
 * @param {number} endAngle - The ending angle in radians.
 * @return {number} The Clockwise angular distance in radians
 *                  between the start and end angles.
 */
export function clockwiseAngleDist(startAngle, endAngle) {
  let l = endAngle - startAngle;
  if (l < 0) {
    l += TAU;
  }
  return l;
}

/**
  * Calculate the distance between two points.
  *
  * @param {Object} point1 - The first point, represented as an object {x, y}.
  * @param {Object} point2 - The second point, represented as an object {x, y}.
  * @return {number} - The calculated distance.
  */
export function calculateDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the circle that passes through three points A, B, and C.
 * Returns the circle's center as [x, y] and its radius.
 *
 * @param {number[]} A - Point A as [x1, y1].
 * @param {number[]} B - Point B as [x2, y2].
 * @param {number[]} C - Point C as [x3, y3].
 * @return {number[]|null} - The circle's center [x, y] and radius,
 *                          or null if the points are collinear.
 */
export function circleFromThreePoints(A, B, C) {
  const [x1, y1] = A;
  const [x2, y2] = B;
  const [x3, y3] = C;

  const a = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;

  if (a === 0) {
    return null;
  }

  const b =
    (x1 * x1 + y1 * y1) * (y3 - y2) +
    (x2 * x2 + y2 * y2) * (y1 - y3) +
    (x3 * x3 + y3 * y3) * (y2 - y1);

  const c =
    (x1 * x1 + y1 * y1) * (x2 - x3) +
    (x2 * x2 + y2 * y2) * (x3 - x1) +
    (x3 * x3 + y3 * y3) * (x1 - x2);

  const x = -b / (2 * a);
  const y = -c / (2 * a);

  return [x, y, Math.hypot(x - x1, y - y1)];
}

/**
 * Normalize a 2D vector represented as an array [x, y].
 *
 * @param {Array<number>} A - The 2D vector to normalize.
 * @return {Array<number>} The normalized vector,
 */
export function normalize(A) {
  const length = Math.sqrt(A[0] * A[0] + A[1] * A[1]);
  return [A[0] / length, A[1] / length];
}

/**
 * Rotates a vector [x,y] 90 degrees counter-clockwise.
 *
 * @param {Array<number>} vec - The 2D vector to rotate.
 * @return {Array<number>} The rotated vector.
 */
export function rotate(vec) {
  const [x, y] = vec;
  return [y, -x];
}


/**
 * Escapes special characters in a string to their corresponding HTML entities
 * to prevent misinterpretation of HTML content. This function converts
 * ampersands, single quotes, double quotes, greater-than signs, and
 * less-than signs to their corresponding HTML entity codes, making it safe
 * to insert the string into HTML or XML content where these characters would
 * otherwise be mistaken for markup.
 *
 * @param {string} string - The string to be escaped.
 * @return {string} The escaped string with HTML entities.
 */
export function escapeSVGText(string) {
  return string
      .replace(/&/g, '\\&amp;') // Escape ampersands.
      .replace(/'/g, '\\&apos;') // Escape single quotes.
      .replace(/"/g, '\\&quot;') // Escape double quotes.
      .replace(/>/g, '\\&gt;') // Escape greater-than signs.
      .replace(/</g, '\\&lt;'); // Escape less-than signs.
}
