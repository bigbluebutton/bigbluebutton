const bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; };

this.WhiteboardCursorModel = (function() {
  class WhiteboardCursorModel {
    constructor(paper, radius, color) {
      this.paper = paper;
      this.radius = radius != null ? radius : null;
      this.color = color != null ? color : null;
      this.draw = bind(this.draw, this);
      if(this.radius == null) {
        this.radius = 6;
      }
      if(this.color == null) {
        this.color = "#ff6666";
      }
      this.cursor = null;
      this.paper;
    }

    draw() {
      this.cursor = this.paper.circle(0, 0, this.radius);
      this.cursor.attr({
        "fill": this.color,
        "stroke": this.color,
        "opacity": "0.8"
      });
      return $(this.cursor.node).on("mousewheel", _.bind(this._onMouseWheel, this));
    }

    toFront() {
      if(this.cursor != null) {
        return this.cursor.toFront();
      }
    }

    setRadius(value) {
      if(this.cursor != null) {
        return this.cursor.attr({
          r: value
        });
      }
    }

    setPosition(x, y) {
      if(this.cursor != null) {
        return this.cursor.attr({
          cx: x,
          cy: y
        });
      }
    }

    undrag() {
      if(this.cursor != null) {
        return this.cursor.undrag();
      }
    }

    drag(onMove, onStart, onEnd, target) {
      if(target == null) {
        target = null;
      }
      if(this.cursor != null) {
        target || (target = this);
        return this.cursor.drag(_.bind(onMove, target), _.bind(onStart, target), _.bind(onEnd, target));
      }
    }

    _onMouseWheel(e, delta) {
      return this.trigger("cursor:mousewheel", e, delta);
    }

    remove() {
      return this.cursor.remove();
    }
  }

  return WhiteboardCursorModel;
})();
