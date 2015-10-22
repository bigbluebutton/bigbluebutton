# A poll in the whiteboard
class @WhiteboardPollModel extends WhiteboardToolModel
  constructor: (@paper) ->
    super @paper

    # the defintion of this shape, kept so we can redraw the shape whenever needed
    # format: x1, y1, x2, y2, stroke color, thickness, fill
    @definition = [0, 0, 0, 0, "#333333", "2px", "#ffffff"]
    @paper

  # Creates a polling in the paper
  # @param  {number} x1                the x value of the top left corner
  # @param  {number} y1                the y value of the top left corner
  # @param  {number} x2                the x value of the bottom right corner
  # @param  {number} y2                the y value of the bottom right corner
  # @param  {number} thickness         the thickness of the object's line(s)
  # @param  {string} backgroundColor   the background color of the base poll rectangle
  # @param  {number} calcFontSize      the default font-size of the text objects
  make: (startingData) =>
    #data needed to create the first base rectangle filled with white color
    x1 = startingData.points[0]
    y1 = startingData.points[1]
    x2 = startingData.points[2] + startingData.points[0] - 0.001
    y2 = startingData.points[3] + startingData.points[1] - 0.001
    thickness = 2
    backgroundColor = "#ffffff"
    verticalPadding = 0
    horizontalPadding = 0
    calcFontSize = 30
    votesTotal = 0
    maxNumVotes = 0
    textArray = []

    #creating an array of text objects for the labels, percentages and number inside line bars
    if startingData.result?
      #counting the total number of votes and finding the biggest number of votes
      for i in [0..startingData.result.length-1]
        votesTotal += startingData.result[i].num_votes
        if maxNumVotes < startingData.result[i].num_votes
          maxNumVotes = startingData.result[i].num_votes
        textArray[i] = []
      #filling the array with proper text objects to display
      for i in [0..startingData.result.length-1]
        textArray[i].push(startingData.result[i].key, startingData.result[i].num_votes+"")
        if votesTotal is 0
          textArray[i].push("0%")
        else
          textArray[i].push(startingData.result[i].num_votes/votesTotal*100+"%")

    #if coordinates are reversed - change them back
    if x2 < x1
        [x1, x2] = [x2, x1]
    if y2 < y1
      [y1, y2] = [y2, y1]

    #Params:
    #x      - the actual calculated x value of the top left corner of the polling area
    #y      - the actual calculated y value of the top left corner of the polling area
    #width  - the width of the polling area
    #height - the height of the polling area
    x = x1 * @gw + @xOffset
    y = y1 * @gh + @yOffset
    width = (x2 * @gw + @xOffset) - x
    height = (y2 * @gh + @yOffset) - y

    #creating a base outer rectangle
    @obj = @paper.rect(x, y, width, height, 0)
    @obj.attr "fill", backgroundColor
    @obj.attr "stroke-width", 0
    @definition =
      shape: "poll_result"
      data: [x1, y1, x2, y2, @obj.attrs["stroke"], @obj.attrs["stroke-width"], @obj.attrs["fill"]]

    #recalculated coordinates, width and height for the inner rectangle
    width = width*0.95
    height = height - width*0.05
    x = x+width*0.025
    y = y+width*0.025

    #creating a base inner rectangle
    @obj1 = @paper.rect(x, y, width, height, 0)
    @obj1.attr "stroke", "#333333"
    @obj1.attr "fill", backgroundColor
    @obj1.attr "stroke-width", zoomStroke(formatThickness(thickness))
    @definition =
      shape: "poll_result"
      data: [x1, y1, x2, y2, @obj.attrs["stroke"], @obj1.attrs["stroke-width"], @obj1.attrs["fill"]]

    #Calculating a proper font-size, and the maximum widht and height of the objects
    calculatedData = calculateFontAndWidth(textArray, calcFontSize, width, height, x, y)
    calcFontSize = calculatedData[0]
    maxLeftWidth = calculatedData[1]
    maxRightWidth = calculatedData[2]
    maxLineHeight = calculatedData[3]
    maxDigitWidth = calculatedData[4]
    maxBarWidth = width*0.9-maxLeftWidth-maxRightWidth
    barHeight = height*0.75/textArray.length
    svgNSi = "http://www.w3.org/2000/svg"

    #Initializing a text element for further calculations and for the left column of keys
    @obj2 = @paper.text(x, y, "")
    @obj2.attr
      "fill": "#333333"
      "font-family": "Arial"
      "font-size": calcFontSize
    @obj2.node.style["text-anchor"] = "start" # force left align
    @obj2.node.style["textAnchor"] = "start"  # for firefox, 'cause they like to be different
    leftCell = @obj2.node
    while leftCell? and leftCell.hasChildNodes()
      leftCell.removeChild(leftCell.firstChild)

    #Initializing a text element for the right column of percentages
    @obj3 = @paper.text(x, y, "")
    @obj3.attr
      "fill": "#333333"
      "font-family": "Arial"
      "font-size": calcFontSize
    @obj3.node.style["text-anchor"] = "end" # force right align
    @obj3.node.style["textAnchor"] = "end"  # for firefox, 'cause they like to be different
    rightCell = @obj3.node
    while rightCell? and rightCell.hasChildNodes()
      rightCell.removeChild(rightCell.firstChild)


    #setting a font size for the text elements on the left and on the right
    leftCell.style['font-size'] = calcFontSize
    rightCell.style['font-size'] = calcFontSize
    #Horizontal padding
    horizontalPadding = width*0.1/4
    #Vertical padding
    verticalPadding = height*0.25/(textArray.length+1)

    #*****************************************************************************************************
    #******************************************MAGIC NUMBER***********************************************
    #There is no automatic vertical centering in SVG. 
    #To center the text element we have to move it down by the half of its height.
    #But every text element has its own padding by default.
    #The height we receive by calling getBBox() includes padding, but the anchor point doesn't consider it.
    #This way the text element is moved down a little bit too much and we have to move it up a bit.
    #Number 3.5 seems to work fine.
    # Oleksandr Zhurbenko. August 19, 2015
    magicNumber = 3.5
    #*****************************************************************************************************

    #Initial coordinates of the key column
    yLeft = y+verticalPadding+barHeight/2 - magicNumber
    xLeft = x + horizontalPadding + 1
    #Initial coordinates of the line bar column
    xBar = x+maxLeftWidth+horizontalPadding*2
    yBar = y + verticalPadding
    #Initial coordinates of the percentage column
    yRight = y+verticalPadding+barHeight/2 - magicNumber
    xRight = x + horizontalPadding*3 + maxLeftWidth + maxRightWidth + maxBarWidth + 1
    objects = [@obj, @obj1, @obj2, @obj3]

    for i in [0..textArray.length-1]
      #Adding an element to the left column
      tempSpanEl = document.createElementNS(svgNSi, "tspan")
      tempSpanEl.setAttributeNS null, "x", xLeft
      tempSpanEl.setAttributeNS null, "y", yLeft
      tempSpanEl.setAttributeNS null, "dy", maxLineHeight/2
      tempTextNode = document.createTextNode(textArray[i][0])
      tempSpanEl.appendChild tempTextNode
      leftCell.appendChild tempSpanEl

      #drawing a black graph bar
      if maxNumVotes is 0 or startingData.result[i].num_votes is 0
        barWidth = 2
      else
        barWidth = startingData.result[i].num_votes / maxNumVotes * maxBarWidth
      @obj4 = @paper.rect(xBar, yBar, barWidth, barHeight, 0)
      @obj4.attr "stroke", "#333333"
      @obj4.attr "fill", "#333333"
      @obj4.attr "stroke-width", zoomStroke(formatThickness(0))
      objects.push @obj4

      #Adding an element to the right column
      tempSpanEl = document.createElementNS(svgNSi, "tspan")
      tempSpanEl.setAttributeNS null, "x", xRight
      tempSpanEl.setAttributeNS null, "y", yRight
      tempSpanEl.setAttributeNS null, "dy", maxLineHeight/2
      tempTextNode = document.createTextNode(textArray[i][2])
      tempSpanEl.appendChild tempTextNode
      rightCell.appendChild tempSpanEl

      #changing the Y coordinate for all the objects
      yBar = yBar + barHeight + verticalPadding
      yLeft = yLeft + barHeight + verticalPadding
      yRight = yRight + barHeight + verticalPadding

    #Initializing a text element for the number of votes text field inside the line bar
    @obj5 = @paper.text(x, y, "")
    @obj5.attr
      "fill": "#333333"
      "font-family": "Arial"
      "font-size": calcFontSize
    centerCell = @obj5.node
    while centerCell? and centerCell.hasChildNodes()
      centerCell.removeChild(centerCell.firstChild)

    #Initial coordinates of the text inside the bar column
    xNumVotesDefault = x+maxLeftWidth+horizontalPadding*2
    xNumVotesMovedRight = xNumVotesDefault + barWidth/2 + horizontalPadding + maxDigitWidth/2
    yNumVotes = y + verticalPadding - magicNumber
    color = "white"
    #Drawing the text element with the number of votes inside of the black line bars
    #Or outside if a line bar is too small
    for i in [0..textArray.length-1]
      if maxNumVotes is 0 or startingData.result[i].num_votes is 0
        barWidth = 2
      else
        barWidth = startingData.result[i].num_votes / maxNumVotes * maxBarWidth
      if barWidth < maxDigitWidth + 8
        xNumVotes = xNumVotesMovedRight
        color = "#333333"
      else
        xNumVotes = xNumVotesDefault
        color = "white"

      tempSpanEl = document.createElementNS(svgNSi, "tspan")
      tempSpanEl.setAttributeNS null, "x", xNumVotes + barWidth/2
      tempSpanEl.setAttributeNS null, "y", yNumVotes + barHeight/2
      tempSpanEl.setAttributeNS null, "dy", maxLineHeight/2
      tempSpanEl.setAttributeNS null, "fill", color
      tempTextNode = document.createTextNode(startingData.result[i].num_votes)
      tempSpanEl.appendChild tempTextNode
      centerCell.appendChild tempSpanEl
      yNumVotes = yNumVotes + barHeight + verticalPadding

    objects.push @obj5
    objects


  # Update the poll dimensions. Does nothing.
  update: (startingData) ->

calculateFontAndWidth = (textArray, calcFontSize, width, height, x, y) ->
    calculatedData = []
    #maximum line width can be either 1/3 of the line or 40px
    #maximum line height is 75% of the initial size of the box divided by the number of lines
    maxLineWidth = width/3
    maxLineHeight = height*0.75/textArray?.length

    #calculating a proper font-size
    flag = true
    while flag
      flag = false
      for i in [0..textArray.length-1]
        for j in [0..textArray[i].length-1]
          test = getRenderedTextSize(textArray[i][j], calcFontSize)
          spanWidth = test[0]
          spanHeight = test[1]
          if spanWidth > maxLineWidth or spanHeight > maxLineHeight
            calcFontSize -= 1
            flag = true
    calculatedData.push calcFontSize

    #looking for a maximum width and height of the left and right text elements
    maxLeftWidth = 0
    maxRightWidth = 0
    maxLineHeight = 0
    for line in textArray
      test = getRenderedTextSize(line[0], calcFontSize)
      spanWidth = test[0]
      spanHeight = test[1]
      if spanWidth > maxLeftWidth
        maxLeftWidth = spanWidth
      if spanHeight > maxLineHeight
        maxLineHeight = spanHeight
      test = getRenderedTextSize(line[2], calcFontSize)
      spanWidth = test[0] 
      spanHeight = test[1]
      if spanWidth > maxRightWidth
        maxRightWidth = spanWidth
      if spanHeight > maxLineHeight
        maxLineHeight = spanHeight

    test = getRenderedTextSize("0", calcFontSize)
    spanWidth = test[0]
    spanHeight = test[1]
    maxDigitWidth = spanWidth
    calculatedData.push maxLeftWidth, maxRightWidth, maxLineHeight, maxDigitWidth
    calculatedData


  getRenderedTextSize = (string, fontSize) ->
    paper = Raphael(0, 0, 0, 0)
    paper.canvas.style.visibility = 'hidden'
    el = paper.text(0, 0, string)
    el.attr "font-family", "Arial"
    el.attr "font-size", fontSize
    bBox = el.getBBox()
    paper.remove()
    arrayTest = []
    arrayTest.push bBox.width
    arrayTest.push bBox.height
    paper.remove()
    arrayTest
