// A triangle in the whiteboard
this.WhiteboardTriangleModel = (function () {
  class WhiteboardTriangleModel extends WhiteboardToolModel {
    constructor(paper) {
      super(paper);
      this.paper = paper;

      // the defintion of this shape, kept so we can redraw the shape whenever needed
      // format: x1, y1, x2, y2, stroke color, thickness
      this.definition = [0, 0, 0, 0, '#000', '0px'];
    }

    // Make a triangle on the whiteboard
    // @param  {[type]} x         the x value of the top left corner
    // @param  {[type]} y         the y value of the top left corner
    // @param  {string} colour    the colour of the object
    // @param  {number} thickness the thickness of the object's line(s)
    make(info) {
      let color, path, thickness, x, y;
      if ((info != null ? info.points : void 0) != null) {
        x = info.points[0];
        y = info.points[1];
        color = info.color;
        thickness = info.thickness;
        path = this._buildPath(x, y, x, y, x, y);
        this.obj = this.paper.path(path);
        this.obj.attr('stroke', formatColor(color));
        this.obj.attr('stroke-width', zoomStroke(formatThickness(thickness)));
        this.obj.attr({
          'stroke-linejoin': 'round',
        });
        this.definition = [x, y, x, y, this.obj.attrs['stroke'], this.obj.attrs['stroke-width']];
      }

      return this.obj;
    }

    // Update triangle drawn
    // @param  {number} x1 the x value of the top left corner
    // @param  {number} y1 the y value of the top left corner
    // @param  {number} x2 the x value of the bottom right corner
    // @param  {number} y2 the y value of the bottom right corner
    update(info) {
      let path, ref, x1, x2, xBottomLeft, xBottomRight, xTop, y1, y2, yBottomLeft, yBottomRight, yTop;
      if ((info != null ? info.points : void 0) != null) {
        x1 = info.points[0];
        y1 = info.points[1];
        x2 = info.points[2];
        y2 = info.points[3];
        if (this.obj != null) {
          ref = this._getCornersFromPoints(x1, y1, x2, y2), xTop = ref[0], yTop = ref[1], xBottomLeft = ref[2], yBottomLeft = ref[3], xBottomRight = ref[4], yBottomRight = ref[5];
          path = this._buildPath(xTop * this.gw + this.xOffset, yTop * this.gh + this.yOffset, xBottomLeft * this.gw + this.xOffset, yBottomLeft * this.gh + this.yOffset, xBottomRight * this.gw + this.xOffset, yBottomRight * this.gh + this.yOffset);
          this.obj.attr({
            path: path,
          });
          this.definition[0] = x1;
          this.definition[1] = y1;
          this.definition[2] = x2;
          return this.definition[3] = y2;
        }
      }
    }

    // Draw a triangle on the whiteboard
    // @param  {number} x1 the x value of the top left corner
    // @param  {number} y1 the y value of the top left corner
    // @param  {number} x2 the x value of the bottom right corner
    // @param  {number} y2 the y value of the bottom right corner
    // @param  {string} colour    the colour of the object
    // @param  {number} thickness the thickness of the object's line(s)
    draw(x1, y1, x2, y2, colour, thickness) {
      let path, ref, triangle, xBottomLeft, xBottomRight, xTop, yBottomLeft, yBottomRight, yTop;
      ref = this._getCornersFromPoints(x1, y1, x2, y2), xTop = ref[0], yTop = ref[1], xBottomLeft = ref[2], yBottomLeft = ref[3], xBottomRight = ref[4], yBottomRight = ref[5];
      path = this._buildPath(xTop, yTop, xBottomLeft, yBottomLeft, xBottomRight, yBottomRight);
      path = this._scaleTrianglePath(path, this.gw, this.gh, this.xOffset, this.yOffset);
      triangle = this.paper.path(path);
      triangle.attr(Utils.strokeAndThickness(colour, thickness));
      triangle.attr({
        'stroke-linejoin': 'round',
      });
      return triangle;
    }

    _getCornersFromPoints(x1, y1, x2, y2) {
      let xBottomLeft, xBottomRight, xTop, yBottomLeft, yBottomRight, yTop;
      xTop = ((x2 - x1) / 2) + x1;
      yTop = y1;
      xBottomLeft = x1;
      yBottomLeft = y2;
      xBottomRight = x2;
      yBottomRight = y2;
      return [xTop, yTop, xBottomLeft, yBottomLeft, xBottomRight, yBottomRight];
    }

    _buildPath(xTop, yTop, xBottomLeft, yBottomLeft, xBottomRight, yBottomRight) {
      return `M${xTop},${yTop},${xBottomLeft},${yBottomLeft},${xBottomRight},${yBottomRight}z`;
    }

    // Scales a triangle path string to fit within a width and height of the new paper size
    // @param  {number} w width of the shape as a percentage of the original width
    // @param  {number} h height of the shape as a percentage of the original height
    // @return {string}   the path string after being manipulated to new paper size
    _scaleTrianglePath(string, w, h, xOffset, yOffset) {
      let j, len, path, points;
      if (xOffset == null) {
        xOffset = 0;
      }

      if (yOffset == null) {
        yOffset = 0;
      }

      path = null;
      points = string.match(/(\d+[.]?\d*)/g);
      len = points.length;
      j = 0;

      // go through each point and multiply it by the new height and width
      path = 'M';
      while (j < len) {
        if (j !== 0) {
          path += ',';
        }

        path += `${points[j + 1] * h}${yOffset}${points[j] * w + xOffset},${points[j + 1] * h + yOffset}`;
        j += 2;
      }

      return `${path}z`;
    }
  }

  return WhiteboardTriangleModel;
})();
