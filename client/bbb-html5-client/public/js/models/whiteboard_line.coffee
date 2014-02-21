define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!utils',
  'cs!models/whiteboard_tool'
], ($, _, Backbone, Raphael, globals, Utils, WhiteboardToolModel) ->

  MAX_PATHS_IN_SEQUENCE = 30

  # A line in the whiteboard
  # Note: is used to draw lines from the pencil tool and from the line tool, this is why some
  # methods can receive different set of parameters.
  # TODO: Maybe this should be split in WhiteboardPathModel for the pencil and
  #       WhiteboardLineModel for the line tool
  class WhiteboardLineModel extends WhiteboardToolModel

    initialize: (@paper) ->
      super @paper

      # the defintion of this shape, kept so we can redraw the shape whenever needed
      # format: svg path, stroke color, thickness
      @definition = ["", "#000", "0px"]

      # @lineX = null
      # @lineY = null

    # Creates a line in the paper
    # @param  {number} x         the x value of the line start point as a percentage of the original width
    # @param  {number} y         the y value of the line start point as a percentage of the original height
    # @param  {string} colour    the colour of the shape to be drawn
    # @param  {number} thickness the thickness of the line to be drawn
    make: (info) ->
      console.log "in line MAKE(info): " + info

      x = info.payload.data.coordinate.first_x
      y = info.payload.data.coordinate.first_y
      color = info.payload.data.line.color
      thickness = info.payload.data.line.weight

      x1 = x * @gw + @xOffset
      y1 = y * @gh + @yOffset
      path = "M" + x1 + " " + y1 + " L" + x1 + " " + y1
      pathPercent = "M" + x + " " + y + " L" + x + " " + y
      @obj = @paper.path(path)
      @obj.attr Utils.strokeAndThickness(color, thickness)
      @obj.attr({"stroke-linejoin": "round"})

      @definition =
        shape: "path"
        data: [pathPercent, @obj.attrs["stroke"], @obj.attrs["stroke-width"]]

      @obj

    # Update the line dimensions
    # @param  {number}  x1         1) the x of the first point
    #                              2) the next x point to be added to the line
    # @param  {number}  y1         1) the y of the first point
    #                              2) the next y point to be added to the line
    # @param  {number,boolean} x2  1) the x of the second point
    #                              2) true if the line should be added to the current line,
    #                                 false if it should replace the last point
    # @param  {number}         y2  1) the y of the second point
    #                              2) undefined
    update: (info) ->
      console.log "in line-UPDATE(info): " + info

      x1 = info.payload.data.coordinate.first_x
      y1 = info.payload.data.coordinate.first_y
      x2 = info.payload.data.coordinate.last_x
      y2 = info.payload.data.coordinate.last_y

      if @obj?

        # if adding points from the pencil 
        if _.isBoolean(info.adding)
          add = info.adding

          pathPercent = "L" + x1 + " " + y1
          @definition.data[0] += pathPercent

          x1 = x1 * @gw + @xOffset
          y1 = y1 * @gh + @yOffset

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

        # adding lines from the line tool
        else
          path = @_buildPath(x1, y1, x2, y2)
          @definition.data[0] = path

          path = @_scaleLinePath(path, @gw, @gh, @xOffset, @yOffset)
          @obj.attr path: path

    # Draw a line on the paper
    # @param  {number,string} x1 1) the x value of the first point
    #                            2) the string path
    # @param  {number,string} y1 1) the y value of the first point
    #                            2) the colour
    # @param  {number} x2        1) the x value of the second point
    #                            2) the thickness
    # @param  {number} y2        1) the y value of the second point
    #                            2) undefined
    # @param  {string} colour    1) the colour of the shape to be drawn
    #                            2) undefined
    # @param  {number} thickness 1) the thickness of the line to be drawn
    #                            2) undefined
    draw: (x1, y1, x2, y2, colour, thickness) ->

      # if the drawing is from the pencil tool, it comes as a path first
      if _.isString(x1)
        colour = y1
        thickness = x2
        path = x1

      # if the drawing is from the line tool, it comes with two points
      else
        path = @_buildPath(x1, y1, x2, y2)

      line = @paper.path(@_scaleLinePath(path, @gw, @gh, @xOffset, @yOffset))
      line.attr Utils.strokeAndThickness(colour, thickness)
      line.attr({"stroke-linejoin": "round"})
      line

    # When dragging for drawing lines starts
    # @param  {number} x the x value of the cursor
    # @param  {number} y the y value of the cursor
    # TODO: moved here but not finished
    dragOnStart: (x, y) ->
      # # find the x and y values in relation to the whiteboard
      # sx = (@paperWidth - @gw) / 2
      # sy = (@paperHeight - @gh) / 2
      # @lineX = x - @containerOffsetLeft - sx + @xOffset
      # @lineY = y - @containerOffsetTop - sy + @yOffset
      # values = [ @lineX / @paperWidth, @lineY / @paperHeight, @currentColour, @currentThickness ]
      # globals.connection.emitMakeShape "line", values

    # As line drawing drag continues
    # @param  {number} dx the difference between the x value from _lineDragStart and now
    # @param  {number} dy the difference between the y value from _lineDragStart and now
    # @param  {number} x  the x value of the cursor
    # @param  {number} y  the y value of the cursor
    # TODO: moved here but not finished
    dragOnMove: (dx, dy, x, y) ->
      # sx = (@paperWidth - @gw) / 2
      # sy = (@paperHeight - @gh) / 2
      # [cx, cy] = @_currentSlideOffsets()
      # # find the x and y values in relation to the whiteboard
      # @cx2 = x - @containerOffsetLeft - sx + @xOffset
      # @cy2 = y - @containerOffsetTop - sy + @yOffset
      # if @shiftPressed
      #   globals.connection.emitUpdateShape "line", [ @cx2 / @paperWidth, @cy2 / @paperHeight, false ]
      # else
      #   @currentPathCount++
      #   if @currentPathCount < MAX_PATHS_IN_SEQUENCE
      #     globals.connection.emitUpdateShape "line", [ @cx2 / @paperHeight, @cy2 / @paperHeight, true ]
      #   else if @obj?
      #     @currentPathCount = 0
      #     # save the last path of the line
      #     @obj.attrs.path.pop()
      #     path = @obj.attrs.path.join(" ")
      #     @obj.attr path: (path + "L" + @lineX + " " + @lineY)

      #     # scale the path appropriately before sending
      #     pathStr = @obj.attrs.path.join(",")
      #     globals.connection.emitPublishShape "path",
      #       [ @_scaleLinePath(pathStr, 1 / @gw, 1 / @gh),
      #         @currentColour, @currentThickness ]
      #     globals.connection.emitMakeShape "line",
      #       [ @lineX / @paperWidth, @lineY / @paperHeight, @currentColour, @currentThickness ]
      #   @lineX = @cx2
      #   @lineY = @cy2

    # Drawing line has ended
    # @param  {Event} e the mouse event
    # TODO: moved here but not finished
    dragOnEnd: (e) ->
      # if @obj?
      #   path = @obj.attrs.path
      #   @obj = null # any late updates will be blocked by this
      #   # scale the path appropriately before sending
      #   globals.connection.emitPublishShape "path",
      #     [ @_scaleLinePath(path.join(","), 1 / @gw, 1 / @gh),
      #       @currentColour, @currentThickness ]

    _buildPath: (x1, y1, x2, y2) ->
      "M#{x1} #{y1}L#{x2} #{y2}"

    # Scales a path string to fit within a width and height of the new paper size
    # @param  {number} w width of the shape as a percentage of the original width
    # @param  {number} h height of the shape as a percentage of the original height
    # @return {string}   the path string after being manipulated to new paper size
    _scaleLinePath: (string, w, h, xOffset=0, yOffset=0) ->
      path = null
      points = string.match(/(\d+[.]?\d*)/g)
      len = points.length
      j = 0

      # go through each point and multiply it by the new height and width
      while j < len
        if j isnt 0
          path += "L" + (points[j] * w + xOffset) + "," + (points[j + 1] * h + yOffset)
        else
          path = "M" + (points[j] * w + xOffset) + "," + (points[j + 1] * h + yOffset)
        j += 2
      path

  WhiteboardLineModel
