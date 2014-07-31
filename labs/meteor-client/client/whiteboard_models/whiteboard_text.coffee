# A text in the whiteboard
class @WhiteboardTextModel extends WhiteboardToolModel

  constructor: (@paper) ->
    super @paper

    # the defintion of this shape, kept so we can redraw the shape whenever needed
    # format: x, y, width, height, colour, fontSize, calcFontSize, text
    @definition = [0, 0, 0, 0, "#000", 0, 0, ""]

    # @textX = null
    # @textY = null

  # Make a text on the whiteboard
  make: (x, y, width, height, colour, fontSize, calcFontSize, text) ->
    @definition =
      shape: "text"
      data: [x, y, width, height, colour, fontSize, calcFontSize, text]

    calcFontSize = (calcFontSize/100 * @gh)
    x = (x * @gw) + @xOffset
    y = (y * @gh) + @yOffset + calcFontSize
    width = width/100 * @gw
    colour = Utils.strokeAndThickness(colour)["stroke"]

    @obj = @paper.text(x, y, "")
    @obj.attr
      fill: colour
      "font-family": "Arial" # TODO: make dynamic
      "font-size": calcFontSize
    @obj.node.style["text-anchor"] = "start" # force left align
    @obj.node.style["textAnchor"] = "start"  # for firefox, 'cause they like to be different
    @obj

  # Update triangle drawn
  # @param  {number} x1 the x value of the top left corner
  # @param  {number} y1 the y value of the top left corner
  # @param  {number} x2 the x value of the bottom right corner
  # @param  {number} y2 the y value of the bottom right corner
  update: (x, y, width, height, colour, fontSize, calcFontSize, text) ->
    if @obj?
      @definition.data = [x, y, width, height, colour, fontSize, calcFontSize, text]

      calcFontSize = (calcFontSize/100 * @gh)
      x = (x * @gw) + @xOffset
      width = width/100 * @gw
      colour = Utils.strokeAndThickness(colour)["stroke"]

      @obj.attr
        fill: colour
        "font-size": calcFontSize
      cell = @obj.node
      while cell? and cell.hasChildNodes()
        cell.removeChild(cell.firstChild)
      textFlow(text, cell, width, x, calcFontSize, false)


  # Draw a text on the whiteboard
  # @param  {string} colour    the colour of the object
  # @param  {number} thickness the thickness of the object's line(s)
  draw: (x, y, width, height, colour, fontSize, calcFontSize, text) ->
    calcFontSize = (calcFontSize/100 * @gh)
    x = x * @gw + @xOffset
    y = (y * @gh) + @yOffset + calcFontSize
    width = width/100 * @gw
    colour = Utils.strokeAndThickness(colour)["stroke"]

    el = @paper.text(x, y, "")
    el.attr
      fill: colour
      "font-family": "Arial" # TODO: make dynamic
      "font-size": calcFontSize
    el.node.style["text-anchor"] = "start" # force left align
    el.node.style["textAnchor"] = "start"  # for firefox, 'cause they like to be different
    textFlow(text, el.node, width, x, calcFontSize, false)
    el

  # When first dragging the mouse to create the textbox size
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # TODO: moved here but not finished nor tested
  # _textStart: (x, y) ->
  #   [sw, sh] = @_currentSlideDimensions()
  #   [cx, cy] = @_currentSlideOffsets()
  #   if @currentText?
  #     globals.connection.emitPublishShape "text",
  #       [ @textbox.value, @currentText.attrs.x / @gw, @currentText.attrs.y / @gh,
  #         @textbox.clientWidth, 16, @currentColour, "Arial", 14 ]
  #     globals.connection.emitTextDone()
  #   @textbox.value = ""
  #   @textbox.style.visibility = "hidden"
  #   @textX = x
  #   @textY = y
  #   sx = (@containerWidth - @gw) / 2
  #   sy = (@containerHeight - @gh) / 2
  #   @cx2 = (x - @containerOffsetLeft - sx + cx) / sw
  #   @cy2 = (y - @containerOffsetTop - sy + cy) / sh
  #   @_makeRect @cx2, @cy2, "#000", 1
  #   globals.connection.emitMakeShape "rect", [ @cx2, @cy2, "#000", 1 ]

  # Finished drawing the rectangle that the text will fit into
  # @param  {Event} e the mouse event
  # TODO: moved here but not finished nor tested
  # _textStop: (e) ->
  #   @currentRect.hide() if @currentRect?
  #   [sw, sh] = @_currentSlideDimensions()
  #   [cx, cy] = @_currentSlideOffsets()
  #   tboxw = (e.pageX - @textX)
  #   tboxh = (e.pageY - @textY)
  #   if tboxw >= 14 or tboxh >= 14 # restrict size
  #     @textbox.style.width = tboxw * (@gw / sw) + "px"
  #     @textbox.style.visibility = "visible"
  #     @textbox.style["font-size"] = 14 + "px"
  #     @textbox.style["fontSize"] = 14 + "px" # firefox
  #     @textbox.style.color = @currentColour
  #     @textbox.value = ""
  #     sx = (@containerWidth - @gw) / 2
  #     sy = (@containerHeight - @gh) / 2
  #     x = @textX - @containerOffsetLeft - sx + cx + 1 # 1px random padding
  #     y = @textY - @containerOffsetTop - sy + cy
  #     @textbox.focus()

  #     # if you click outside, it will automatically sumbit
  #     @textbox.onblur = (e) =>
  #       if @currentText
  #         globals.connection.emitPublishShape "text",
  #           [ @value, @currentText.attrs.x / @gw, @currentText.attrs.y / @gh,
  #             @textbox.clientWidth, 16, @currentColour, "Arial", 14 ]
  #         globals.connection.emitTextDone()
  #       @textbox.value = ""
  #       @textbox.style.visibility = "hidden"

  #     # if user presses enter key, then automatically submit
  #     @textbox.onkeypress = (e) ->
  #       if e.keyCode is "13"
  #         e.preventDefault()
  #         e.stopPropagation()
  #         @onblur()

  #     # update everyone with the new text at every change
  #     _paper = @
  #     @textbox.onkeyup = (e) ->
  #       @style.color = _paper.currentColour
  #       @value = @value.replace(/\n{1,}/g, " ").replace(/\s{2,}/g, " ")
  #       globals.connection.emitUpdateShape "text",
  #         [ @value, x / _paper.sw, (y + (14 * (_paper.sh / _paper.gh))) / _paper.sh,
  #           tboxw * (_paper.gw / _paper.sw), 16, _paper.currentColour, "Arial", 14 ]

  # The server has said the text is finished,
  # so set it to null for the next text object
  # TODO: moved here but not finished nor tested
  # textDone: ->
  #   if @currentText?
  #     @currentText = null
  #     @currentRect.hide() if @currentRect?
