// A slide in the whiteboard
this.WhiteboardSlideModel = (function () {
  class WhiteboardSlideModel {

    // TODO: check if we really need original and display width and heights separate or if they can be the same
    constructor(
      id,
      url,
      img,
      originalWidth,
      originalHeight,
      displayWidth,
      displayHeight,
      xOffset,
      yOffset) {
      this.id = id;
      this.url = url;
      this.img = img;
      this.originalWidth = originalWidth;
      this.originalHeight = originalHeight;
      this.displayWidth = displayWidth;
      this.displayHeight = displayHeight;
      this.xOffset = xOffset != null ? xOffset : 0;
      this.yOffset = yOffset != null ? yOffset : 0;
    }

    getWidth() {
      return this.displayWidth;
    }

    getHeight() {
      return this.displayHeight;
    }

    getOriginalWidth() {
      return this.originalWidth;
    }

    getOriginalHeight() {
      return this.originalHeight;
    }

    getId() {
      return this.id;
    }

    getDimensions() {
      return [this.getWidth(), this.getHeight()];
    }

    getOriginalDimensions() {
      return [this.getOriginalWidth(), this.getOriginalHeight()];
    }

    getOffsets() {
      return [this.xOffset, this.yOffset];
    }
  }

  return WhiteboardSlideModel;
})();
