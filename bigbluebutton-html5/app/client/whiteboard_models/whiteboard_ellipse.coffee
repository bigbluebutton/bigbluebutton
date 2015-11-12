# An ellipse in the whiteboard
class @WhiteboardEllipseModel extends WhiteboardToolModel

    constructor: (@paper) ->
      super @paper

      # the defintion of this shape, kept so we can redraw the shape whenever needed
      # format: top left x, top left y, bottom right x, bottom right y, stroke color, thickness
      @definition = [0, 0, 0, 0, "#000", "0px"]

    # Make an ellipse on the whiteboard
    # @param    {[type]} x                 the x value of the top left corner
    # @param    {[type]} y                 the y value of the top left corner
    # @param    {string} colour        the colour of the object
    # @param    {number} thickness the thickness of the object's line(s)
    make: (info) ->
      #console.log "Whiteboard - Making ellipse: "
      #console.log info
      if info?.points?
        x = info.points[0]
        y = info.points[1]
        color = info.color
        thickness = info.thickness

        @obj = @paper.ellipse(x * @gw + @xOffset, y * @gh + @yOffset, 0, 0)
        @obj.attr "stroke", formatColor(color)
        @obj.attr "stroke-width", zoomStroke(formatThickness(thickness))
        @definition = [x, y, y, x, @obj.attrs["stroke"], @obj.attrs["stroke-width"]]

      @obj

    # Update ellipse drawn
    # @param    {number} x1 the x value of the top left corner in percent of current slide size
    # @param    {number} y1 the y value of the top left corner in percent of current slide size
    # @param    {number} x2 the x value of the bottom right corner in percent of current slide size
    # @param    {number} y2 the y value of the bottom right corner in percent of current slide size
    # @param    {boolean} square (draw a circle or not
    update: (info) ->
      #console.log info
      if info?.points?
        x1 = info.points[0]
        y1 = info.points[1]
        x2 = info.points[2]
        y2 = info.points[3]

        circle = info.square

        if @obj?
          [x1, x2] = [x2, x1] if x2 < x1

          if y2 < y1
            [y1, y2] = [y2, y1]
            reversed = true

          #if the control key is pressed then the width and height of the ellipse are equal (a circle)
          #we calculate this by making the y2 coord equal to the y1 coord plus the width of x2-x1 and corrected for the slide size
          if circle
            if reversed # if reveresed, the y1 coordinate gets updated, not the y2 coordinate
              y1 = y2 - (x2 - x1) * @gw / @gh
            else
              y2 = y1 + (x2 - x1) * @gw / @gh

          coords =
            x1: x1
            x2: x2
            y1: y1
            y2: y2

          #console.log(coords)

          rx = (x2 - x1) / 2
          ry = (y2 - y1) / 2

          r =
            rx: rx * @gw
            ry: ry * @gh
            cx: (rx + x1) * @gw + @xOffset
            cy: (ry + y1) * @gh + @yOffset

          @obj.attr(r)

          #console.log( "@gw: " + @gw + "\n@gh: " + @gh + "\n@xOffset: " + @xOffset + "\n@yOffset: " + @yOffset );
          # we need to update all these values, specially for when shapes are drawn backwards
          @definition[0] = x1
          @definition[1] = y1
          @definition[2] = x2
          @definition[3] = y2

    # Draw an ellipse on the whiteboard
    # @param    {number} x1 the x value of the top left corner
    # @param    {number} y1 the y value of the top left corner
    # @param    {number} x2 the x value of the bottom right corner
    # @param    {number} y2 the y value of the bottom right corner
    # @param    {string} colour        the colour of the object
    # @param    {number} thickness the thickness of the object's line(s)
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

    # When first starting drawing the ellipse
    # @param    {number} x the x value of cursor at the time in relation to the left side of the browser
    # @param    {number} y the y value of cursor at the time in relation to the top of the browser
    # TODO: moved here but not finished
    dragOnStart: (x, y) ->
        # sx = (@paperWidth - @gw) / 2
        # sy = (@paperHeight - @gh) / 2
        # # find the x and y values in relation to the whiteboard
        # @ellipseX = (x - @containerOffsetLeft - sx + @xOffset)
        # @ellipseY = (y - @containerOffsetTop - sy + @yOffset)
        # globals.connection.emitMakeShape "ellipse",
        #     [ @ellipseX / @paperWidth, @ellipseY / @paperHeight, @currentColour, @currentThickness ]

    # When first starting to draw an ellipse
    # @param    {number} dx the difference in the x value at the start as opposed to the x value now
    # @param    {number} dy the difference in the y value at the start as opposed to the y value now
    # @param    {number} x the x value of cursor at the time in relation to the left side of the browser
    # @param    {number} y the y value of cursor at the time in relation to the top of the browser
    # @param    {Event} e     the mouse event
    # TODO: moved here but not finished
    dragOnMove: (dx, dy, x, y, e) ->
        # # if shift is pressed, draw a circle instead of ellipse
        # dy = dx if @shiftPressed
        # dx = dx / 2
        # dy = dy / 2
        # # adjust for negative values as well
        # x = @ellipseX + dx
        # y = @ellipseY + dy
        # dx = (if dx < 0 then -dx else dx)
        # dy = (if dy < 0 then -dy else dy)
        # globals.connection.emitUpdateShape "ellipse",
        #     [ x / @paperWidth, y / @paperHeight, dx / @paperWidth, dy / @paperHeight ]

    # When releasing the mouse after drawing the ellipse
    # @param    {Event} e the mouse event
    # TODO: moved here but not finished
    dragOnStop: (e) ->
        # attrs = undefined
        # attrs = @currentEllipse.attrs if @currentEllipse?
        # if attrs?
        #     globals.connection.emitPublishShape "ellipse",
        #         [ attrs.cx / @gw, attrs.cy / @gh, attrs.rx / @gw, attrs.ry / @gh,
        #             @currentColour, @currentThickness ]
        # @currentEllipse = null # late updates will be blocked by this
