const bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; }, extend = function(child, parent) { for (let key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }, hasProp = {}.hasOwnProperty;

this.WhiteboardRectModel = (function(superClass) {
  extend(WhiteboardRectModel, superClass);

  class WhiteboardRectModel {
    constructor(paper) {
      this.paper = paper;
      this.make = bind(this.make, this);
      WhiteboardRectModel.__super__.constructor.call(this, this.paper);
      this.definition = [0, 0, 0, 0, "#000", "0px"];
      this.paper;
    }

    make(startingData) {
      let color, thickness, x, y;
      x = startingData.points[0];
      y = startingData.points[1];
      color = startingData.color;
      thickness = startingData.thickness;
      this.obj = this.paper.rect(x * this.gw + this.xOffset, y * this.gh + this.yOffset, 0, 0, 1);
      this.obj.attr("stroke", formatColor(color));
      this.obj.attr("stroke-width", zoomStroke(formatThickness(thickness)));
      this.definition = {
        shape: "rect",
        data: [x, y, 0, 0, this.obj.attrs["stroke"], this.obj.attrs["stroke-width"]]
      };
      return this.obj;
    }

    update(startingData) {
      let height, ref, ref1, reversed, square, width, x, x1, x2, y, y1, y2;
      x1 = startingData.points[0];
      y1 = startingData.points[1];
      x2 = startingData.points[2];
      y2 = startingData.points[3];
      square = startingData.square;
      if(this.obj != null) {
        if(x2 < x1) {
          ref = [x2, x1], x1 = ref[0], x2 = ref[1];
        }
        if(y2 < y1) {
          ref1 = [y2, y1], y1 = ref1[0], y2 = ref1[1];
          reversed = true;
        }
        if(square) {
          if(reversed) {
            y1 = y2 - (x2 - x1) * this.gw / this.gh;
          } else {
            y2 = y1 + (x2 - x1) * this.gw / this.gh;
          }
        }
        x = x1 * this.gw + this.xOffset;
        y = y1 * this.gh + this.yOffset;
        width = (x2 * this.gw + this.xOffset) - x;
        height = (y2 * this.gh + this.yOffset) - y;
        this.obj.attr({
          x: x,
          y: y,
          width: width,
          height: height
        });

        /*else
          @obj.attr
            x: x
            y: y
            width: width
            height: width
         */
        this.definition.data[0] = x1;
        this.definition.data[1] = y1;
        this.definition.data[2] = x2;
        return this.definition.data[3] = y2;
      }
    }

    draw(x1, y1, x2, y2, colour, thickness) {
      let r, ref, ref1, x, y;
      if(x2 < x1) {
        ref = [x2, x1], x1 = ref[0], x2 = ref[1];
      }
      if(y2 < y1) {
        ref1 = [y2, y1], y1 = ref1[0], y2 = ref1[1];
      }
      x = x1 * this.gw;
      y = y1 * this.gh;
      r = this.paper.rect(x + this.xOffset, y + this.yOffset, (x2 * this.gw) - x, (y2 * this.gh) - y, 1);
      r.attr(Meteor.call("strokeAndThickness", colour, thickness));
      return r;
    }

    dragOnStart(x, y) {}
    dragOnMove(dx, dy, x, y, e) {}
    dragOnEnd(e) {}
  }

  return WhiteboardRectModel;
})(WhiteboardToolModel);
