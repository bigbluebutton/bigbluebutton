this.WhiteboardToolModel = (function() {
  class WhiteboardToolModel {
    constructor() {}

    initialize(paper) {
      this.paper = paper;
      console.log(`paper:${this.paper}`);
      this.gh = 0;
      this.gw = 0;
      this.obj = 0;
      return this.definition = [];
    }

    setPaperSize(gh, gw) {
      this.gh = gh;
      this.gw = gw;
    }

    setOffsets(xOffset, yOffset) {
      this.xOffset = xOffset;
      this.yOffset = yOffset;
    }

    setPaperDimensions(paperWidth, paperHeight) {
      this.paperWidth = paperWidth;
      this.paperHeight = paperHeight;
    }

    getDefinition() {
      return this.definition;
    }

    hide() {
      if(this.obj != null) {
        return this.obj.hide();
      }
    }
  }

  return WhiteboardToolModel;
})();
