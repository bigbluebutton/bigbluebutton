this.WhiteboardEllipseModel = (function() {
  class WhiteboardEllipseModel extends WhiteboardToolModel {
    constructor(paper) {
      super(paper);
      this.paper = paper;
      this.definition = [0, 0, 0, 0, "#000", "0px"];
    }

    make(info) {
      let color, thickness, x, y;
      if((info != null ? info.points : void 0) != null) {
        x = info.points[0];
        y = info.points[1];
        color = info.color;
        thickness = info.thickness;
        this.obj = this.paper.ellipse(x * this.gw + this.xOffset, y * this.gh + this.yOffset, 0, 0);
        this.obj.attr("stroke", formatColor(color));
        this.obj.attr("stroke-width", zoomStroke(formatThickness(thickness)));
        this.definition = [x, y, y, x, this.obj.attrs["stroke"], this.obj.attrs["stroke-width"]];
      }
      return this.obj;
    }

    update(info) {
      let circle, coords, r, ref, ref1, reversed, rx, ry, x1, x2, y1, y2;
      if((info != null ? info.points : void 0) != null) {
        x1 = info.points[0];
        y1 = info.points[1];
        x2 = info.points[2];
        y2 = info.points[3];
        circle = info.square;
        if(this.obj != null) {
          if(x2 < x1) {
            ref = [x2, x1], x1 = ref[0], x2 = ref[1];
          }
          if(y2 < y1) {
            ref1 = [y2, y1], y1 = ref1[0], y2 = ref1[1];
            reversed = true;
          }
          if(circle) {
            if(reversed) {
              y1 = y2 - (x2 - x1) * this.gw / this.gh;
            } else {
              y2 = y1 + (x2 - x1) * this.gw / this.gh;
            }
          }
          coords = {
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2
          };
          rx = (x2 - x1) / 2;
          ry = (y2 - y1) / 2;
          r = {
            rx: rx * this.gw,
            ry: ry * this.gh,
            cx: (rx + x1) * this.gw + this.xOffset,
            cy: (ry + y1) * this.gh + this.yOffset
          };
          this.obj.attr(r);
          this.definition[0] = x1;
          this.definition[1] = y1;
          this.definition[2] = x2;
          return this.definition[3] = y2;
        }
      }
    }

    draw(x1, y1, x2, y2, colour, thickness) {
      let elip, ref, ref1, rx, ry, x, y;
      if(x2 < x1) {
        ref = [x2, x1], x1 = ref[0], x2 = ref[1];
      }
      if(y2 < y1) {
        ref1 = [y2, y1], y1 = ref1[0], y2 = ref1[1];
      }
      rx = (x2 - x1) / 2;
      ry = (y2 - y1) / 2;
      x = (rx + x1) * this.gw + this.xOffset;
      y = (ry + y1) * this.gh + this.yOffset;
      elip = this.paper.ellipse(x, y, rx * this.gw, ry * this.gh);
      elip.attr(Utils.strokeAndThickness(colour, thickness));
      return elip;
    }

    dragOnStart(x, y) {}
    dragOnMove(dx, dy, x, y, e) {}
    dragOnStop(e) {}
  }

  return WhiteboardEllipseModel;
})();
