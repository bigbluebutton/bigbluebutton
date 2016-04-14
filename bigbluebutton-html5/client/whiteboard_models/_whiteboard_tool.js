// A base class for whiteboard tools
this.WhiteboardToolModel = (function () {
  class WhiteboardToolModel {
    constructor() {}

    initialize(paper) {
      this.paper = paper;
      console.log(`paper:${this.paper}`);
      this.gh = 0;
      this.gw = 0;
      this.obj = 0;

      // the defintion of this shape, kept so we can redraw the shape whenever needed
      return this.definition = [];
    }

    //set the size of the paper
    // @param  {number} @gh    gh parameter
    // @param  {number} @gw    gw parameter
    setPaperSize(gh, gw) {
      this.gh = gh;
      this.gw = gw;
    }

    setOffsets(xOffset, yOffset) {
      this.xOffset = xOffset;
      this.yOffset = yOffset;
    }

    setPaperDimensions(paperWidth, paperHeight) {
      // TODO: can't we simply take the width and the height from `@paper`?
      this.paperWidth = paperWidth;
      this.paperHeight = paperHeight;
    }

    getDefinition() {
      return this.definition;
    }

    hide() {
      if (this.obj != null) {
        return this.obj.hide();
      }
    }
  }

  return WhiteboardToolModel;
})();
