import {Draw} from './Draw.js';
import {Shape, ColorTypes} from './Shape.js';

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
    this.shapeColor = Shape.colorToHex(this.color, ColorTypes.HighlightColor);
    this.thickness = this.thickness * 7;
    this.isClosed = false;
  }
}
