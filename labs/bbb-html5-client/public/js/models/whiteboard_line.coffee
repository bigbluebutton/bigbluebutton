define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!utils'
], ($, _, Backbone, Raphael, globals, Utils) ->

  # A line in the whiteboard
  WhiteboardLineModel = Backbone.Model.extend

    initialize: (@paper) ->
      @gh = 0
      @gw = 0
      @obj = 0

      # the defintion of this shape, kept so we can redraw the shape whenever needed
      # format: array of points, stroke color, thickness
      @definition = ["", "#000", "0px"]

    setPaperSize: (@gh, @gw) ->

    setOffsets: (@xOffset, @yOffset) ->

    # Creates a line in the paper
    # @param  {number} x         the x value of the line start point as a percentage of the original width
    # @param  {number} y         the y value of the line start point as a percentage of the original height
    # @param  {string} colour    the colour of the shape to be drawn
    # @param  {number} thickness the thickness of the line to be drawn
    make: (x, y, colour, thickness) ->
      x1 = x * @gw + @xOffset
      y1 = y * @gh + @yOffset
      path = "M" + x1 + " " + y1 + " L" + x1 + " " + y1
      pathPercent = "M" + x + " " + y + " L" + x + " " + y
      @obj = @paper.path(path)
      @obj.attr Utils.strokeAndThickness(colour, thickness)
      @obj.attr({"stroke-linejoin": "round"})

      @definition =
        shape: "path"
        data: [pathPercent, @obj.attrs["stroke"], @obj.attrs["stroke-width"]]

      @obj

    getDefinition: () ->
      @definition

    # Update the line dimensions
    # @param  {number} x  the next x point to be added to the line as a percentage of the original width
    # @param  {number} y  the next y point to be added to the line as a percentage of the original height
    # @param  {boolean} add true if the line should be added to the current line, false if it should replace the last point
    update: (x, y, add) ->
      if @obj?
        x1 = x * @gw + @xOffset
        y1 = y * @gh + @yOffset

        # if adding to the line
        if add
          path = @obj.attrs.path + "L" + x1 + " " + y1
          @obj.attr path: path

        # if simply updating the last portion (for drawing a straight line)
        else
          @obj.attrs.path.pop()
          path = @obj.attrs.path.join(" ")
          path = path + "L" + x1 + " " + y1
          @obj.attr path: path

        pathPercent = "L" + x + " " + y
        @definition.data[0] += pathPercent

    # Draw a line on the paper
    # @param  {string} path      height of the shape as a percentage of the original height
    # @param  {string} colour    the colour of the shape to be drawn
    # @param  {number} thickness the thickness of the line to be drawn
    draw: (path, colour, thickness) ->
      line = @paper.path(Utils.stringToScaledPath(path, @gw, @gh, @xOffset, @yOffset))
      line.attr Utils.strokeAndThickness(colour, thickness)
      line.attr({"stroke-linejoin": "round"})
      line

    hide: () ->
      @obj.hide() if @obj?

  WhiteboardLineModel
