# A text in the whiteboard
class @WhiteboardTextModel extends WhiteboardToolModel

  constructor: (@paper) ->
    super @paper
    # the defintion of this shape, kept so we can redraw the shape whenever needed
    # format: x, y, width, height, colour, fontSize, calcFontSize, text
    @definition = [0, 0, 0, 0, "#000", 0, 0, ""]

  # Make a text on the whiteboard
  make: (startingData) ->
    #console.log "making text:" + JSON.stringify startingData

    x = startingData.x
    y = startingData.y
    width = startingData.textBoxWidth
    height = startingData.textBoxHeight
    colour = formatColor(startingData.fontColor)
    fontSize = startingData.fontSize
    calcFontSize = startingData.calcedFontSize
    text = startingData.text

    @definition =
      shape: "text"
      data: [x, y, width, height, colour, fontSize, calcFontSize, text]

    #calcFontSize = (calcFontSize/100 * @gh)
    x = (x * @gw) + @xOffset
    y = (y * @gh) + @yOffset + calcFontSize
    width = width/100 * @gw

    @obj = @paper.text(x/100, y/100, "")
    @obj.attr
      "fill": colour
      "font-family": "Arial" # TODO: make dynamic
      "font-size": calcFontSize
    @obj.node.style["text-anchor"] = "start" # force left align
    @obj.node.style["textAnchor"] = "start"  # for firefox, 'cause they like to be different
    @obj

  # Update text shape drawn
  # @param  {object} the object containing the shape info
  update: (startingData) ->
    #console.log "updating text" + JSON.stringify startingData

    x = startingData.x
    y = startingData.y
    maxWidth = startingData.textBoxWidth
    height = startingData.textBoxHeight
    colour = formatColor(startingData.fontColor)
    fontSize = startingData.fontSize
    calcFontSize = startingData.calcedFontSize
    myText = startingData.text

    if @obj?
      @definition.data = [x, y, maxWidth, height, colour, fontSize, calcFontSize, myText]

      calcFontSize = (calcFontSize/100 * @gh)
      x = (x * @gw)/100 + @xOffset
      maxWidth = maxWidth/100 * @gw

      @obj.attr
        "fill": colour
        "font-family": "Arial" # TODO: make dynamic
        "font-size": calcFontSize
      cell = @obj.node
      while cell? and cell.hasChildNodes()
        cell.removeChild(cell.firstChild)

      # used code from textFlow lib http://www.carto.net/papers/svg/textFlow/
      # but had to merge it here because "cell" was bigger than what the stack could take

      #extract and add line breaks for start
      dashArray = new Array()
      dashFound = true
      indexPos = 0
      cumulY = 0
      svgNS = "http://www.w3.org/2000/svg"
      while dashFound is true
        result = myText.indexOf("-", indexPos)
        if result is -1
          #could not find a dash
          dashFound = false
        else
          dashArray.push result
          indexPos = result + 1
      #split the text at all spaces and dashes
      words = myText.split(/[\s-]/)
      line = ""
      dy = 0
      curNumChars = 0
      computedTextLength = 0
      myTextNode = undefined
      tspanEl = undefined
      i = 0
      while i < words.length
        word = words[i]
        curNumChars += word.length + 1
        if computedTextLength > maxWidth or i is 0
          if computedTextLength > maxWidth
            tempText = tspanEl.firstChild.nodeValue
            tempText = tempText.slice(0, (tempText.length - words[i - 1].length - 2)) #the -2 is because we also strip off white space
            tspanEl.firstChild.nodeValue = tempText

          #alternatively one could use textLength and lengthAdjust, however, currently this is not too well supported in SVG UA's
          tspanEl = document.createElementNS(svgNS, "tspan")
          tspanEl.setAttributeNS null, "x", x
          tspanEl.setAttributeNS null, "dy", dy
          myTextNode = document.createTextNode(line)
          tspanEl.appendChild myTextNode
          cell.appendChild tspanEl
          if checkDashPosition(dashArray, curNumChars - 1)
            line = word + "-"
          else
            line = word + " "
          line = words[i - 1] + " " + line  unless i is 0
          dy = calcFontSize
          cumulY += dy
        else
          if checkDashPosition(dashArray, curNumChars - 1)
            line += word + "-"
          else
            line += word + " "
        tspanEl.firstChild.nodeValue = line
        computedTextLength = tspanEl.getComputedTextLength()
        if i is words.length - 1
          if computedTextLength > maxWidth
            tempText = tspanEl.firstChild.nodeValue
            tspanEl.firstChild.nodeValue = tempText.slice(0, (tempText.length - words[i].length - 1))
            tspanEl = document.createElementNS(svgNS, "tspan")
            tspanEl.setAttributeNS null, "x", x
            tspanEl.setAttributeNS null, "dy", dy
            myTextNode = document.createTextNode(words[i])
            tspanEl.appendChild myTextNode
            cell.appendChild tspanEl
        i++
      cumulY


  #this function checks if there should be a dash at the given position, instead of a blank
  checkDashPosition = (dashArray, pos) ->
    result = false
    i = 0
    while i < dashArray.length
      result = true  if dashArray[i] is pos
      i++
    result


  # Draw a text on the whiteboard
  # @param  {string} colour    the colour of the object
  # @param  {number} thickness the thickness of the object's line(s)
  # draw: (x, y, width, height, colour, fontSize, calcFontSize, text) ->
  #   calcFontSize = (calcFontSize/100 * @gh)
  #   x = x * @gw + @xOffset
  #   y = (y * @gh) + @yOffset + calcFontSize
  #   width = width/100 * @gw
  #   #colour = Utils.strokeAndThickness(colour)["stroke"]
    

  #   el = @paper.text(x, y, "")
  #   el.attr
  #     fill: Meteor.call("strokeAndThickness",colour, false)
  #     "font-family": "Arial" # TODO: make dynamic
  #     "font-size": calcFontSize
  #   el.node.style["text-anchor"] = "start" # force left align
  #   el.node.style["textAnchor"] = "start"  # for firefox, 'cause they like to be different
  #   Meteor.call("textFlow", text, el.node, width, x, calcFontSize, false)
  #   el

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
