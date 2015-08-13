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
    calcFontSize = 30
    votesTotal = 0
    textArray = []

    #creating an array of text objects for the labels, percentages and number inside line bars
    if startingData.result? and startingData.result.length > 1
      #counting the total number of votes
      for i in [0..startingData.result.length-1]
        votesTotal += startingData.result[i].num_votes
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

    test = [@obj]

    test


  # Update the poll dimensions
  # @param  {number} x1 the x value of the top left corner
  # @param  {number} y1 the y value of the top left corner
  # @param  {number} x2 the x value of the bottom right corner
  # @param  {number} y2 the y value of the bottom right corner
  # @param  {boolean} square (draw a square or not)
  update: (startingData) ->
