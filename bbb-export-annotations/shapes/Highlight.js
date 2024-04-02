import {Draw} from './Draw.js';

/**
 * Represents a Highlight shape, extending the functionality of the Draw class.
 *
 * @class Highlight
 * @extends {Draw}
 */
export class Highlight extends Draw {
  /**
   * Creates an instance of the Highlight class.
   *
   * @param {Object} highlight - The highlighter's JSON data.
   */
  constructor(highlight) {
    super(highlight);

    this.fill = 'none';
    this.shapeColor = '#fedd00';
    this.thickness = this.thickness * 7;
    this.isClosed = false;
  }
}
