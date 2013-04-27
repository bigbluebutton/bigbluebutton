define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!utils'
], ($, _, Backbone, Raphael, globals, Utils) ->

  # A rectangle in the whiteboard
  WhiteboardRectModel = Backbone.Model.extend

    initialize: (@paper) ->
      @gh = 0
      @gw = 0
      @obj = 0

      # the defintion of this shape, kept so we can redraw the shape whenever needed
      # format: x1, y1, x2, y2, stroke color, thickness
      @definition = [0, 0, 0, 0, "#000", "0px"]

    setPaperSize: (@gh, @gw) ->

    setOffsets: (@xOffset, @yOffset) ->

    # Creates a rectangle in the paper
    # @param  {number} x         the x value of the top left corner
    # @param  {number} y         the y value of the top left corner
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    make: (x, y, colour, thickness) ->
      @obj = @paper.rect(x * @gw + @xOffset, y * @gh + @yOffset, 0, 0)
      @obj.attr Utils.strokeAndThickness(colour, thickness)
      @definition =
        shape: "rect"
        data: [x, y, 0, 0, @obj.attrs["stroke"], @obj.attrs["stroke-width"]]
      @obj

    getDefinition: () ->
      @definition

    # Update the rectangle dimensions
    # @param  {number} x1 the x value of the top left corner
    # @param  {number} y1 the y value of the top left corner
    # @param  {number} x2 the x value of the bottom right corner
    # @param  {number} y2 the y value of the bottom right corner
    update: (x1, y1, x2, y2) ->
      if @obj?
        x = x1 * @gw + @xOffset
        y = y1 * @gh + @yOffset
        width = (x2 * @gw + @xOffset) - x
        height = (y2 * @gh + @yOffset) - y
        @obj.attr
          x: x
          y: y
          width: width
          height: height
        @definition.data[2] = x2
        @definition.data[3] = y2

    # Draw a rectangle on the paper
    # @param  {number} x1        the x value of the top left corner
    # @param  {number} y1        the y value of the top left corner
    # @param  {number} x2        the x value of the bottom right corner
    # @param  {number} y2        the y value of the bottom right corner
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    draw: (x1, y1, x2, y2, colour, thickness) ->
      x = x1 * @gw
      y = y1 * @gh
      r = @paper.rect(x + @xOffset, y + @yOffset, (x2 * @gw) - x, (y2 * @gh) - y, 1)
      r.attr Utils.strokeAndThickness(colour, thickness)
      r

    hide: () ->
      @obj.hide() if @obj?

  WhiteboardRectModel
