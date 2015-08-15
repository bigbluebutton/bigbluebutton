# A poll in the whiteboard
class @WhiteboardPollModel extends WhiteboardToolModel
  constructor: (@paper) ->
    super @paper

    # the defintion of this shape, kept so we can redraw the shape whenever needed
    # format: x1, y1, x2, y2, stroke color, thickness, fill
    @definition = [0, 0, 0, 0, "#000", "0px", "#ffffff"]
    @paper

  # Creates a polling in the paper
  # @param  {number} x1               the x value of the top left corner
  # @param  {number} y1               the y value of the top left corner
  # @param  {number} x2               the x value of the bottom right corner
  # @param  {number} y2               the y value of the bottom right corner
  # @param  {string} colour           the colour of the object
  # @param  {number} thickness        the thickness of the object's line(s)
  # @param  {string} backgroundColor  the background color of the poll element
  # @param  {number} vPadding         the vertical padding of the poll element
  # @param  {number} hPadding         the horizontal padding of the poll element
  make: (startingData) =>
    #data needed to create the first base rectangle filled with white color
    x1 = startingData.points[0]
    y1 = startingData.points[1]
    x2 = startingData.points[2] + startingData.points[0] - 0.001
    y2 = startingData.points[3] + startingData.points[1] - 0.001
    color = startingData.color
    thickness = 2
    backgroundColor = "#ffffff"
    vPadding = 10
    hPadding = 5
    calcFontSize = 22
    votesTotal = 0
    maxNumVotes = 0
    textArray = []

    #creating an array of text objects for the labels, percentages and number inside line bars
    if startingData.result? and startingData.result.length > 1
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

    #creating a base rectangle
    @obj = @paper.rect(x, y, width, height, 1)
    @obj.attr "stroke", formatColor(color)
    @obj.attr "fill", backgroundColor
    @obj.attr "stroke-width", zoomStroke(formatThickness(thickness))
    @definition =
      shape: "poll_result"
      data: [x1, y1, x2, y2, @obj.attrs["stroke"], @obj.attrs["stroke-width"], @obj.attrs["fill"]]

    #Initializing a text element for further calculations and for the left column of keys
    @obj2 = @paper.text(x, y, "")
    @obj2.attr
      "fill": "#000000"
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
      "fill": "#000000"
      "font-family": "Arial"
      "font-size": calcFontSize
    @obj3.node.style["text-anchor"] = "end" # force left align
    @obj3.node.style["textAnchor"] = "end"  # for firefox, 'cause they like to be different
    rightCell = @obj3.node
    while rightCell? and rightCell.hasChildNodes()
      rightCell.removeChild(rightCell.firstChild)

    calculatedData = calculateFontAndWidth(leftCell, textArray, calcFontSize, width, height, x, y)
    calcFontSize = calculatedData[0]
    maxLeftWidth = calculatedData[1]
    maxRightWidth = calculatedData[2]
    maxLineHeight = calculatedData[3]
    maxBarWidth = width*0.9-maxLeftWidth-maxRightWidth
    barHeight = height*0.75/textArray.length
    svgNSi = "http://www.w3.org/2000/svg"

    #setting a font style for the text elements
    leftCell.style['font-size'] = calcFontSize
    rightCell.style['font-size'] = calcFontSize
    #Horizontal padding
    widthPadding = width*0.1/(textArray[0].length+1)
    #Vertical padding
    heightPadding = height*0.25/(textArray.length+1)
    #Initial coordinates of the key column
    yLeft = y+heightPadding+barHeight/2
    xLeft = x + widthPadding + 1
    #Initial coordinates of the line bar column
    xBar = x+maxLeftWidth+widthPadding*2
    yBar = y + heightPadding
    #Initial coordinates of the percentage column
    yRight = y+heightPadding+barHeight/2
    xRight = x + widthPadding*3 + maxLeftWidth + maxRightWidth + maxBarWidth + 1
    test = [@obj, @obj2, @obj3]


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
      @obj5 = @paper.rect(xBar, yBar, barWidth, barHeight, 2)
      @obj5.attr "stroke", formatColor(color)
      @obj5.attr "fill", "#000000"
      @obj5.attr "stroke-width", zoomStroke(formatThickness(0))
      test.push @obj5

      #Adding an element to the right column
      tempSpanEl = document.createElementNS(svgNSi, "tspan")
      tempSpanEl.setAttributeNS null, "x", xRight
      tempSpanEl.setAttributeNS null, "y", yRight
      tempSpanEl.setAttributeNS null, "dy", maxLineHeight/2
      tempTextNode = document.createTextNode(textArray[i][2])
      tempSpanEl.appendChild tempTextNode
      rightCell.appendChild tempSpanEl

      #changing the Y coordinate for all the objects
      yBar = yBar + barHeight + heightPadding
      yLeft = yLeft + heightPadding + barHeight
      yRight = yRight + heightPadding + barHeight


    #Initializing a text element for the number of votes text field inside the line bar
    @obj4 = @paper.text(x, y, "")
    @obj4.attr
      "fill": "#000000"
      "font-family": "Arial"
      "font-size": calcFontSize
    centerCell = @obj4.node
    while centerCell? and centerCell.hasChildNodes()
      centerCell.removeChild(centerCell.firstChild)

    #Initial coordinates of the text inside the bar column
    xNumVotes = x+maxLeftWidth+widthPadding*2
    yNumVotes = y + heightPadding
    for i in [0..textArray.length-1]
      if maxNumVotes is 0 or startingData.result[i].num_votes is 0
        barWidth = 2
      else
        barWidth = startingData.result[i].num_votes / maxNumVotes * maxBarWidth

      tempSpanEl = document.createElementNS(svgNSi, "tspan")
      tempSpanEl.setAttributeNS null, "x", xNumVotes + barWidth/2
      tempSpanEl.setAttributeNS null, "y", yNumVotes + barHeight/2
      tempSpanEl.setAttributeNS null, "dy", maxLineHeight/2
      tempSpanEl.setAttributeNS null, "fill", "white"
      tempTextNode = document.createTextNode(startingData.result[i].num_votes)
      tempSpanEl.appendChild tempTextNode
      centerCell.appendChild tempSpanEl
      yNumVotes = yNumVotes + barHeight + heightPadding

    test.push @obj4
    test


  # Update the poll dimensions
  update: (startingData) ->


  calculateFontAndWidth = (leftCell, textArray, calcFontSize, width, height, x, y) ->
    calculatedData = []
    #Initializing a tspan for finding a proper font-size
    svgNSi = "http://www.w3.org/2000/svg"
    tempSpanEl = document.createElementNS(svgNSi, "tspan")
    tempSpanEl.setAttributeNS null, "x", x
    tempSpanEl.setAttributeNS null, "y", y
    tempTextNode = document.createTextNode("")
    tempSpanEl.appendChild tempTextNode

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
          tempSpanEl.firstChild.nodeValue = textArray[i][j]
          leftCell.appendChild tempSpanEl
          if tempSpanEl.getBBox().width > 40 or tempSpanEl.getBBox().width > maxLineWidth or tempSpanEl.getBBox().height > maxLineHeight
            calcFontSize -= 1
            leftCell.style['font-size'] = calcFontSize
            flag = true
          leftCell.removeChild(leftCell.firstChild)

    calculatedData.push calcFontSize

    #looking for a maximum width and height of the left and right text elements
    maxLeftWidth = 0
    maxRightWidth = 0
    maxLineHeight = 0
    for line in textArray
      tempSpanEl.firstChild.nodeValue = line[0]
      leftCell.appendChild tempSpanEl
      if tempSpanEl.getBBox().width > maxLeftWidth
        maxLeftWidth = tempSpanEl.getBBox().width
        if tempSpanEl.getBBox().height > maxLineHeight
          maxLineHeight = tempSpanEl.getBBox().height
      leftCell.removeChild(leftCell.firstChild)

      tempSpanEl.firstChild.nodeValue = line[2]
      leftCell.appendChild tempSpanEl
      if tempSpanEl.getBBox().width > maxRightWidth
        maxRightWidth = tempSpanEl.getBBox().width
        if tempSpanEl.getBBox().height > maxLineHeight
          maxLineHeight = tempSpanEl.getBBox().height
      leftCell.removeChild(leftCell.firstChild)

    calculatedData.push maxLeftWidth, maxRightWidth, maxLineHeight
    calculatedData
