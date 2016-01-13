let MAX_PATHS_IN_SEQUENCE = 30;

this.WhiteboardLineModel = (function() {
  class WhiteboardLineModel extends WhiteboardToolModel {
    constructor(paper) {
      super(paper);
      this.paper = paper;
      this.definition = ["", "#000", "0px"];
    }

    make(info) {
      let color, path, pathPercent, thickness, x, x1, y, y1;
      if((info != null ? info.points : void 0) != null) {
        x = info.points[0];
        y = info.points[1];
        color = info.color;
        thickness = info.thickness;
        x1 = x * this.gw + this.xOffset;
        y1 = y * this.gh + this.yOffset;
        path = `M${x1} ${y1} L${x1} ${y1}`;
        pathPercent = `M${x} ${y} L${x} ${y}`;
        this.obj = this.paper.path(path);
        this.obj.attr("stroke", formatColor(color));
        this.obj.attr("stroke-width", zoomStroke(formatThickness(thickness)));
        this.obj.attr({
          "stroke-linejoin": "round"
        });
        this.obj.attr("stroke-linecap", "round");
        this.definition = [pathPercent, this.obj.attrs["stroke"], this.obj.attrs["stroke-width"]];
      }
      return this.obj;
    }

    update(info) {
      let path, x1, x2, y1, y2;
      if((info != null ? info.points : void 0) != null) {
        x1 = info.points[0];
        y1 = info.points[1];
        x2 = info.points[2];
        y2 = info.points[3];
        if(this.obj != null) {
          path = this._buildPath(info.points);
          this.definition[0] = path;
          path = this._scaleLinePath(path, this.gw, this.gh, this.xOffset, this.yOffset);
          return this.obj.attr({
            path: path
          });
        }
      }
    }

    draw(x1, y1, x2, y2, colour, thickness) {}
    dragOnStart(x, y) {}
    dragOnMove(dx, dy, x, y) {}
    dragOnEnd(e) {}

    _buildPath(points) {
      let i, path;
      path = "";
      if(points && points.length >= 2) {
        path += `M ${points[0]} ${points[1]}`;
        i = 2;
        while(i < points.length) {
          path += `${i}${1}L${points[i]} ${points[i + 1]}`;
          i += 2;
        }
        path += "Z";
        return path;
      }
    }

    _scaleLinePath(string, w, h, xOffset, yOffset) {
      let j, len, path, points;
      if(xOffset == null) {
        xOffset = 0;
      }
      if(yOffset == null) {
        yOffset = 0;
      }
      path = null;
      points = string.match(/(\d+[.]?\d*)/g);
      len = points.length;
      j = 0;
      while(j < len) {
        if(j !== 0) {
          path += `${points[j + 1] * h}${yOffset}L${points[j] * w + xOffset},${points[j + 1] * h + yOffset}`;
        } else {
          path = `${points[j + 1] * h}${yOffset}M${points[j] * w + xOffset},${points[j + 1] * h + yOffset}`;
        }
        j += 2;
      }
      return path;
    }
  }

  return WhiteboardLineModel;
})();
