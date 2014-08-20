define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!utils',
  'cs!models/whiteboard_tool'
], ($, _, Backbone, Raphael, globals, Utils, WhiteboardToolModel) ->

  # A rectangle in the whiteboard
  class WhiteboardRectModel extends WhiteboardToolModel

    initialize: (@paper) ->
      super @paper

      # the defintion of this shape, kept so we can redraw the shape whenever needed
      # format: x1, y1, x2, y2, stroke color, thickness
      @definition = [0, 0, 0, 0, "#000", "0px"]

    # Creates a rectangle in the paper
    # @param  {number} x         the x value of the top left corner
    # @param  {number} y         the y value of the top left corner
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    make: (startingData) ->
      console.log "make startingData"#+ JSON.stringify startingData
      x = startingData.payload.shape.shape.points[0]
      y = startingData.payload.shape.shape.points[1]
      color = startingData.payload.shape.shape.color
      thickness = startingData.payload.shape.shape.thickness

      @obj = @paper.rect(x * @gw + @xOffset, y * @gh + @yOffset, 0, 0, 1)
      @obj.attr Utils.strokeAndThickness(color, thickness)
      @definition =
        shape: "rectangle"
        data: [x, y, 0, 0, @obj.attrs["stroke"], @obj.attrs["stroke-width"]]
      @obj

    # Update the rectangle dimensions
    # @param  {number} x1 the x value of the top left corner
    # @param  {number} y1 the y value of the top left corner
    # @param  {number} x2 the x value of the bottom right corner
    # @param  {number} y2 the y value of the bottom right corner
    # @param  {boolean} square (draw a square or not)
    update: (startingData) -> 
      x1 = startingData.payload.shape.shape.points[0]
      y1 = startingData.payload.shape.shape.points[1]
      x2 = startingData.payload.shape.shape.points[2]
      y2 = startingData.payload.shape.shape.points[3]
      square = startingData.payload.shape.shape.square
      if @obj?
        [x1, x2] = [x2, x1] if x2 < x1
        [x1, x2] = [x2, x1] if x2 < x1

        if y2 < y1
            [y1, y2] = [y2, y1]
            reversed = true

        if square
            if reversed #if reveresed, the y1 coordinate gets updated, not the y2 coordinate
                y1 = y2 - (x2 - x1) * @gw / @gh
            else
                y2 = y1 + (x2 - x1) * @gw / @gh

        x = x1 * @gw + @xOffset
        y = y1 * @gh + @yOffset
        width = (x2 * @gw + @xOffset) - x
        height = (y2 * @gh + @yOffset) - y
        #if !square
        @obj.attr
          x: x
          y: y
          width: width
          height: height
        ###else
          @obj.attr
            x: x
            y: y
            width: width
            height: width###

        # we need to update all these values, specially for when shapes are drawn backwards
        @definition.data[0] = x1
        @definition.data[1] = y1
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
      [x1, x2] = [x2, x1] if x2 < x1
      [y1, y2] = [y2, y1] if y2 < y1

      x = x1 * @gw
      y = y1 * @gh
      r = @paper.rect(x + @xOffset, y + @yOffset, (x2 * @gw) - x, (y2 * @gh) - y, 1)
      r.attr Utils.strokeAndThickness(colour, thickness)
      r

    # Creating a rectangle has started
    # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
    # @param  {number} y the y value of cursor at the time in relation to the top of the browser
    # TODO: moved here but not finished
    dragOnStart: (x, y) ->
      # sx = (@paperWidth - @gw) / 2
      # sy = (@paperHeight - @gh) / 2
      # # find the x and y values in relation to the whiteboard
      # @cx2 = (x - @containerOffsetLeft - sx + @xOffset) / @paperWidth
      # @cy2 = (y - @containerOffsetTop - sy + @yOffset) / @paperHeight
      # globals.connection.emitMakeShape "rect",
      #   [ @cx2, @cy2, @currentColour, @currentThickness ]

    # Adjusting rectangle continues
    # @param  {number} dx the difference in the x value at the start as opposed to the x value now
    # @param  {number} dy the difference in the y value at the start as opposed to the y value now
    # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
    # @param  {number} y the y value of cursor at the time in relation to the top of the browser
    # @param  {Event} e  the mouse event
    # TODO: moved here but not finished
    dragOnMove: (dx, dy, x, y, e) ->
      # # if shift is pressed, make it a square
      # dy = dx if @shiftPressed
      # dx = dx / @paperWidth
      # dy = dy / @paperHeight
      # # adjust for negative values as well
      # if dx >= 0
      #   x1 = @cx2
      # else
      #   x1 = @cx2 + dx
      #   dx = -dx
      # if dy >= 0
      #   y1 = @cy2
      # else
      #   y1 = @cy2 + dy
      #   dy = -dy
      # globals.connection.emitUpdateShape "rect", [ x1, y1, dx, dy ]

    # When rectangle finished being drawn
    # @param  {Event} e the mouse event
    # TODO: moved here but not finished
    dragOnEnd: (e) ->
      # if @obj?
      #   attrs = @obj.attrs
      #   if attrs?
      #     globals.connection.emitPublishShape "rect",
      #       [ attrs.x / @gw, attrs.y / @gh, attrs.width / @gw, attrs.height / @gh,
      #         @currentColour, @currentThickness ]
      # @obj = null

  WhiteboardRectModel
