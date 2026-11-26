import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import {Shape} from './Shape.js';

const IMAGE_MIME_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

/**
 * Renders a user-pasted image annotation.
 *
 * The image bytes are inlined as a base64 data URI, mirroring how the slide
 * background is embedded in process.js: CairoSVG blocks external/local file
 * access unless run with the unsafe flag, so the file cannot be referenced by
 * path. The collector copies the referenced uploads into the dropbox first.
 *
 * @class ImageShape
 */
export class ImageShape extends Shape {
  /**
   * @constructor
   * @param {Object} annotation - JSON image annotation data.
   * @param {String} uploadsDir - Directory holding the copied upload files.
   */
  constructor(annotation, uploadsDir) {
    super(annotation);
    this.width = this.props?.w ?? 0;
    this.height = this.props?.h ?? 0;
    // Only the relative src is persisted with the shape; the server validated it.
    this.src = annotation?.meta?.bbbImageSrc;
    this.uploadsDir = uploadsDir;
  }

  /**
   * Reads the copied upload and returns it as a data URI, or null when the file
   * is missing or the source is not a recognized image type.
   *
   * @method getDataURI
   * @return {?String}
   */
  getDataURI() {
    if (!this.src) return null;

    const filename = sanitize(path.basename(this.src));
    const ext = path.extname(filename).slice(1).toLowerCase();
    const mimeType = IMAGE_MIME_TYPES[ext];
    if (!mimeType) return null;

    const file = path.join(this.uploadsDir, filename);
    if (!fs.existsSync(file)) return null;

    const data = fs.readFileSync(file).toString('base64');
    return `data:${mimeType};base64,${data}`;
  }

  /**
   * Draws the image within the shape group (already positioned/rotated/scaled by
   * the base transform), or an empty group when the file cannot be resolved.
   *
   * @method draw
   * @return {Promise<G>}
   */
  async draw() {
    const dataURI = this.getDataURI();
    if (!dataURI) {
      return this.shapeGroup;
    }

    this.shapeGroup.image(dataURI).size(this.width, this.height);
    return this.shapeGroup;
  }
}
