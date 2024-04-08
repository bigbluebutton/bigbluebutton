import {Rect} from '@svgdotjs/svg.js';
import {Shape, ColorTypes} from './Shape.js';

/**
 * Represents a sticky note, extending the Shape class.
 * @extends {Shape}
 */
export class StickyNote extends Shape {
  /**
   * Creates an instance of a StickyNote.
   * @param {Object} params - Parameters for the sticky note.
   * @param {string} [params.url] - URL associated with the sticky note.
   * @param {string} [params.text=""] - Text content of the sticky note.
   * @param {string} [params.align] - Text alignment within the sticky note.
   * @param {string} [params.verticalAlign] - Vertical text alignment.
   * @param {number} [params.growY] - Additional height for long notes.
   * @param {ColorTypes} [params.color] - Color category for the sticky note.
   */
  constructor(params) {
    super(params);
    this.url = this.props?.url;
    this.text = this.props?.text || '';
    this.align = this.props?.align;
    this.verticalAlign = this.props?.verticalAlign;
    this.growY = this.props?.growY;
    this.shapeColor = Shape.colorToHex(this.color, ColorTypes.StickyColor);
  }

  /**
   * Draws the sticky note and adds it to the SVG.
   * Overrides the placeholder draw method in the Shape base class.
   * @override
   * @method draw
   * @return {G} An SVG group element containing the note.
   */
  draw() {
    const stickyNote = this.shapeGroup;
    const rectW = 200;
    const rectH = 200 + this.growY;
    const cornerRadius = 10;

    // Create rectangle element
    const rect = new Rect()
        .size(rectW, rectH)
        .radius(cornerRadius)
        .fill(this.shapeColor);

    stickyNote.add(rect);
    this.drawLabel(stickyNote);

    return stickyNote;
  }
}
