import {Shape} from './Shape.js';
import {Rect, Text, ClipPath, Defs, G} from '@svgdotjs/svg.js';
import {ColorTypes} from '../shapes/Shape.js';
import {overlayAnnotation} from '../workers/process.js';

/**
 * Creates an SVG frame from Tldraw v2 pencil data.
 *
 * @class Frane
 * @extends {Shape}
 */
export class Frame extends Shape {
  /**
   * @param {Object} frame - The Frame shape JSON.
   */
  constructor(frame) {
    super(frame);
    this.name = this.props?.name;
    this.w = this.props?.w;
    this.h = this.props?.h;
    this.children = frame.children;
  }

  /**
   * Renders the frame object as an SVG group element.
   *
   * @return {G} - An SVG group element.
   */
  draw() {
    // Parent group
    const frameGroup = this.shapeGroup;

    // Group for clipped elements
    const clipGroup = new G();

    const fillColor = Shape.colorToHex(ColorTypes.SemiFillColor,
        ColorTypes.SemiFillColor);

    const frameLabel = this.name || 'Frame';

    // The text element is not clipped
    const textElement = new Text()
        .text(frameLabel)
        .move(0, -20)
        .font({
          'family': 'Arial',
          'size': 12,
        })
        .fill('black');

    // The frame rectangle that is not clipped
    const frame = new Rect({
      'x': 0,
      'y': 0,
      'width': this.w,
      'height': this.h,
      'stroke': 'black',
      'stroke-width': 1,
      'fill': fillColor,
    });

    // Create the clip path with the same properties as the frame
    const clipPath = new ClipPath().id(`clipFrame-${this.id}`);
    const clipFrame = new Rect({
      'x': 0,
      'y': 0,
      'width': this.w,
      'height': this.h,
    });

    clipPath.add(clipFrame);

    // Definitions for clip paths
    const defs = new Defs();
    defs.add(clipPath);

    // Add defs to the parent group
    frameGroup.add(defs);

    const children = this.children || [];

    // Add the children to the clipGroup so they will be clipped
    children.forEach((child) => {
      overlayAnnotation(clipGroup, child);
    });

    // Apply clipping to the clipGroup only
    clipGroup.clipWith(clipPath);

    // Add non-clipped...
    frameGroup.add(frame);
    frameGroup.add(textElement);

    // ...and clipped elements to the frame group
    frameGroup.add(clipGroup);

    return frameGroup;
  }
}
