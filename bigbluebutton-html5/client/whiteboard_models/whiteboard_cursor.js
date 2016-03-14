const bind = function (fn, me) {
  return function () {
    return fn.apply(me, arguments);
  };
};

// The cursor/pointer in the whiteboard
this.WhiteboardCursorModel = (function () {
  class WhiteboardCursorModel {
    constructor(paper, radius, color) {
      this.paper = paper;
      this.radius = radius != null ? radius : null;
      this.color = color != null ? color : null;
      this.draw = bind(this.draw, this);
      if (this.radius == null) {
        this.radius = 6;
      }

      if (this.color == null) {
        this.color = '#ff6666'; // a pinkish red
      }

      this.cursorDOM = null;
    }

    draw() {
      this.cursorDOM = this.paper.circle(0, 0, this.radius);
      this.cursorDOM.attr({
        fill: this.color,
        stroke: this.color,
        opacity: '0.8',
      });
      return $(this.cursorDOM.node).on('mousewheel', _.bind(this._onMouseWheel, this));
    }

    toFront() {
      if (this.cursorDOM != null) {
        return this.cursorDOM.toFront();
      }
    }

    setRadius(value) {
      if (this.cursorDOM != null) {
        return this.cursorDOM.attr({
          r: value,
        });
      }
    }

    setPosition(x, y) {
      if (this.cursorDOM != null) {
        return this.cursorDOM.attr({
          cx: x,
          cy: y,
        });
      }
    }

    undrag() {
      if (this.cursorDOM != null) {
        return this.cursorDOM.undrag();
      }
    }

    drag(onMove, onStart, onEnd, target) {
      if (target == null) {
        target = null;
      }

      if (this.cursorDOM != null) {
        target || (target = this);
        return this.cursorDOM.drag(_.bind(onMove, target), _.bind(onStart, target), _.bind(onEnd, target));
      }
    }

    _onMouseWheel(e, delta) {
      return this.trigger('cursor:mousewheel', e, delta);
    }

    remove() {
      return this.cursorDOM.remove();
    }
  }

  return WhiteboardCursorModel;
})();
