import {Text, Tspan} from '@svgdotjs/svg.js';
import {Shape} from './Shape.js';

/**
 * Draws the text shape on the SVG canvas, aligning and styling it
 * based on the provided properties.
 * @override
 * @return {G} The SVG group element containing the text element.
 */
export class TextShape extends Shape {
  /**
 * Constructs a new TextShape instance with the given parameters.
 * Inherits from Shape and initializes text-specific properties.
 *
 * @param {Object} params - The configuration object for the text shape.
 * @param {string} [params.text=""] - The text content for the shape.
 * @param {string} [params.align] - The horizontal text alignment.
 * @param {number} [params.w] - The width of the shape.
 * @param {number} [params.h] - The height of the shape.
 * @param {string} [params.font] - The font family for the text.
 */
  constructor(params) {
    super(params);
    this.text = this.props?.text || '';
    this.align = this.props?.align;
    this.w = this.props?.w;
    this.h = this.props?.h;
    this.fontSize = Shape.determineFontSize(this.size);
    this.fontFamily = Shape.determineFontFromFamily(this.props?.font);
  }

  /**
   * Draws the text shape and adds it to the SVG.
   * Overrides the placeholder draw method in the Shape base class.
   * @override
   * @method draw
   * @return {G} An SVG group element containing the text.
   */
  draw() {
    const x = Shape.alignHorizontally(this.align, this.w);
    const y = 0;

    const textGroup = this.shapeGroup;
    const textElement = new Text()
        .attr({'xml:space': 'preserve'})
        .move(x, y)
        .font({
          'family': this.fontFamily,
          'size': this.fontSize,
          'anchor': this.align,
          'alignment-baseline': 'middle',
        })
        .fill(this.shapeColor);

    const lines = this.wrapText(this.text, this.w);

    lines.forEach((line) => {
      const tspan = new Tspan()
          .text(line)
          .attr({
            x,
            dy: this.fontSize,
          });

      textElement.add(tspan);
    });

    textGroup.add(textElement);

    return textGroup;
  }
}
