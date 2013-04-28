define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!utils',
  'cs!models/whiteboard_tool'
], ($, _, Backbone, Raphael, globals, Utils, WhiteboardToolModel) ->

  # An ellipse in the whiteboard
  class WhiteboardEllipseModel extends WhiteboardToolModel

    initialize: (@paper) ->
      super @paper

      # the defintion of this shape, kept so we can redraw the shape whenever needed
      # format: top left x, top left y, bottom right x, bottom right y, stroke color, thickness
      @definition = [0, 0, 0, 0, "#000", "0px"]

    # Make an ellipse on the whiteboard
    # @param  {[type]} x         the x value of the top left corner
    # @param  {[type]} y         the y value of the top left corner
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    make: (x, y, colour, thickness) ->
      @obj = @paper.ellipse(x * @gw + @xOffset, y * @gh + @yOffset, 0, 0)
      @obj.attr Utils.strokeAndThickness(colour, thickness)
      @definition =
        shape: "ellipse"
        data: [x, y, y, x, @obj.attrs["stroke"], @obj.attrs["stroke-width"]]
      @obj

    # Update ellipse drawn
    # @param  {number} x1 the x value of the top left corner
    # @param  {number} y1 the y value of the top left corner
    # @param  {number} x2 the x value of the bottom right corner
    # @param  {number} y2 the y value of the bottom right corner
    update: (x1, y1, x2, y2) ->
      if @obj?
        [x1, x2] = [x2, x1] if x2 < x1
        [y1, y2] = [y2, y1] if y2 < y1

        rx = (x2 - x1) / 2
        ry = (y2 - y1) / 2
        @obj.attr
          cx: (rx + x1) * @gw + @xOffset
          cy: (ry + y1) * @gh + @yOffset
          rx: rx * @gw
          ry: ry * @gh

        @definition.data[0] = x1
        @definition.data[1] = y1
        @definition.data[2] = x2
        @definition.data[3] = y2

    # Draw an ellipse on the whiteboard
    # @param  {number} x1 the x value of the top left corner
    # @param  {number} y1 the y value of the top left corner
    # @param  {number} x2 the x value of the bottom right corner
    # @param  {number} y2 the y value of the bottom right corner
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    draw: (x1, y1, x2, y2, colour, thickness) ->
      [x1, x2] = [x2, x1] if x2 < x1
      [y1, y2] = [y2, y1] if y2 < y1

      rx = (x2 - x1) / 2
      ry = (y2 - y1) / 2
      x = (rx + x1) * @gw + @xOffset
      y = (ry + y1) * @gh + @yOffset
      elip = @paper.ellipse(x, y, rx * @gw, ry * @gh)
      elip.attr Utils.strokeAndThickness(colour, thickness)
      elip

  WhiteboardEllipseModel
