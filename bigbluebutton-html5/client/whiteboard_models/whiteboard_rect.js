const bind = function (fn, me) {
  return function () {
    return fn.apply(me, arguments);
  };
};

// A rectangle in the whiteboard
this.WhiteboardRectModel = (function () {
  class WhiteboardRectModel extends WhiteboardToolModel{
    constructor(paper) {
      super(paper);
      this.paper = paper;
      this.make = bind(this.make, this);

      // the defintion of this shape, kept so we can redraw the shape whenever needed
      // format: x1, y1, x2, y2, stroke color, thickness
      this.definition = [0, 0, 0, 0, '#000', '0px'];
    }

    // Creates a rectangle in the paper
    // @param  {number} x         the x value of the top left corner
    // @param  {number} y         the y value of the top left corner
    // @param  {string} colour    the colour of the object
    // @param  {number} thickness the thickness of the object's line(s)
    make(startingData) {
      let color, thickness, x, y;
      x = startingData.points[0];
      y = startingData.points[1];
      color = startingData.color;
      thickness = startingData.thickness;
      this.obj = this.paper.rect(x * this.gw + this.xOffset, y * this.gh + this.yOffset, 0, 0, 1);
      this.obj.attr('stroke', formatColor(color));
      this.obj.attr('stroke-width', zoomStroke(formatThickness(thickness)));
      this.definition = {
        shape: 'rect',
        data: [x, y, 0, 0, this.obj.attrs['stroke'], this.obj.attrs['stroke-width']],
      };
      return this.obj;
    }

    // Update the rectangle dimensions
    // @param  {number} x1 the x value of the top left corner
    // @param  {number} y1 the y value of the top left corner
    // @param  {number} x2 the x value of the bottom right corner
    // @param  {number} y2 the y value of the bottom right corner
    // @param  {boolean} square (draw a square or not)
    update(startingData) {
      let height, ref, ref1, reversed, square, width, x, x1, x2, y, y1, y2;
      x1 = startingData.points[0];
      y1 = startingData.points[1];
      x2 = startingData.points[2];
      y2 = startingData.points[3];
      square = startingData.square;
      if (this.obj != null) {
        if (x2 < x1) {
          ref = [x2, x1], x1 = ref[0], x2 = ref[1];
        }

        if (y2 < y1) {
          ref1 = [y2, y1], y1 = ref1[0], y2 = ref1[1];
          reversed = true;
        }

        if (square) {
          if (reversed) { //if reveresed, the y1 coordinate gets updated, not the y2 coordinate
            y1 = y2 - (x2 - x1) * this.gw / this.gh;
          } else {
            y2 = y1 + (x2 - x1) * this.gw / this.gh;
          }
        }

        x = x1 * this.gw + this.xOffset;
        y = y1 * this.gh + this.yOffset;
        width = (x2 * this.gw + this.xOffset) - x;
        height = (y2 * this.gh + this.yOffset) - y;

        //if !square
        this.obj.attr({
          x: x,
          y: y,
          width: width,
          height: height,
        });

        /*else
          @obj.attr
            x: x
            y: y
            width: width
            height: width
         */

        // we need to update all these values, specially for when shapes are drawn backwards
        this.definition.data[0] = x1;
        this.definition.data[1] = y1;
        this.definition.data[2] = x2;
        return this.definition.data[3] = y2;
      }
    }

    // Draw a rectangle on the paper
    // @param  {number} x1        the x value of the top left corner
    // @param  {number} y1        the y value of the top left corner
    // @param  {number} x2        the x value of the bottom right corner
    // @param  {number} y2        the y value of the bottom right corner
    // @param  {string} colour    the colour of the object
    // @param  {number} thickness the thickness of the object's line(s)
    draw(x1, y1, x2, y2, colour, thickness) {
      let r, ref, ref1, x, y;
      if (x2 < x1) {
        ref = [x2, x1], x1 = ref[0], x2 = ref[1];
      }

      if (y2 < y1) {
        ref1 = [y2, y1], y1 = ref1[0], y2 = ref1[1];
      }

      x = x1 * this.gw;
      y = y1 * this.gh;
      r = this.paper.rect(x + this.xOffset, y + this.yOffset, (x2 * this.gw) - x, (y2 * this.gh) - y, 1);
      r.attr(Meteor.call('strokeAndThickness', colour, thickness));
      return r;
    }

    // Creating a rectangle has started
    // @param  {number} x the x value of cursor at the time in relation to the left side of the browser
    // @param  {number} y the y value of cursor at the time in relation to the top of the browser
    // TODO: moved here but not finished
    dragOnStart(x, y) {
      // sx = (@paperWidth - @gw) / 2
      // sy = (@paperHeight - @gh) / 2
      // // find the x and y values in relation to the whiteboard
      // @cx2 = (x - @containerOffsetLeft - sx + @xOffset) / @paperWidth
      // @cy2 = (y - @containerOffsetTop - sy + @yOffset) / @paperHeight
      // globals.connection.emitMakeShape "rect",
      //   [ @cx2, @cy2, @currentColour, @currentThickness ]
    }

    // Adjusting rectangle continues
    // @param  {number} dx the difference in the x value at the start as opposed to the x value now
    // @param  {number} dy the difference in the y value at the start as opposed to the y value now
    // @param  {number} x the x value of cursor at the time in relation to the left side of the browser
    // @param  {number} y the y value of cursor at the time in relation to the top of the browser
    // @param  {Event} e  the mouse event
    // TODO: moved here but not finished
    dragOnMove(dx, dy, x, y, e) {
      // // if shift is pressed, make it a square
      // dy = dx if @shiftPressed
      // dx = dx / @paperWidth
      // dy = dy / @paperHeight
      // // adjust for negative values as well
      // if dx >= 0
      //   x1 = @cx2
      // else
      //   x1 = @cx2 + dx
      //   dx = -dx
      // if dy >= 0
      //   y1 = @cy2
      // else
      //   y1 = @cy2 + dy
      //   dy = -dy
      // globals.connection.emitUpdateShape "rect", [ x1, y1, dx, dy ]
    }

    // When rectangle finished being drawn
    // @param  {Event} e the mouse event
    // TODO: moved here but not finished
    dragOnEnd(e) {
      // if @obj?
      //   attrs = @obj.attrs
      //   if attrs?
      //     globals.connection.emitPublishShape "rect",
      //       [ attrs.x / @gw, attrs.y / @gh, attrs.width / @gw, attrs.height / @gh,
      //         @currentColour, @currentThickness ]
      // @obj = null
    }
  }

  return WhiteboardRectModel;
})();
