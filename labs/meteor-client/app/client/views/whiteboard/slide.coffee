Template.slide.rendered = ->
  currentSlide = getCurrentSlideDoc()
  pic = new Image()
  pic.onload = ->
    setInSession 'slideOriginalWidth', this.width
    setInSession 'slideOriginalHeight', this.height
    $(window).resize( ->
      # redraw the whiteboard to adapt to the resized window
      redrawWhiteboard()
    )
    if currentSlide?.slide?.png_uri?
      createWhiteboardPaper (wpm) ->
        displaySlide wpm
  pic.src = currentSlide?.slide?.png_uri

@createWhiteboardPaper = (callback) =>
  @whiteboardPaperModel = new Meteor.WhiteboardPaperModel('whiteboard-paper')
  callback(@whiteboardPaperModel)

@displaySlide = (wpm) ->
  currentSlide = getCurrentSlideDoc()
  wpm.create()
  adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'))
  wpm._displayPage(currentSlide?.slide?.png_uri, getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'))
  manuallyDisplayShapes()
  wpm.scale(adjustedDimensions.width, adjustedDimensions.height)

@manuallyDisplayShapes = ->
  currentSlide = getCurrentSlideDoc()
  wpm = @whiteboardPaperModel
  shapes = Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).fetch()
  for s in shapes
    shapeInfo = s.shape?.shape or s?.shape
    shapeType = shapeInfo?.type

    if shapeType isnt "text"
      len = shapeInfo.points.length
      for num in [0..len] # the coordinates must be in the range 0 to 1
        shapeInfo?.points[num] = shapeInfo?.points[num] / 100
    wpm?.makeShape(shapeType, shapeInfo)
    wpm?.updateShape(shapeType, shapeInfo)


# calculates and returns the best fitting {width, height} pair
# based on the image's original width and height
@scaleSlide = (originalWidth, originalHeight) ->

  # set the size of the whiteboard space (frame) where the slide will be displayed
  if window.matchMedia('(orientation: landscape)').matches
    # for landscape orientation we want "fit to height" so that we can
    # minimize the empty space above and below the slide (for best readability)
    boardWidth = $("#whiteboard").width()
    # the slide area is under the whiteboard navbar. -10 so that the slide stays within
    boardHeight = $("#whiteboard").height() - $("#whiteboard-navbar").height() - 10
  else
    # for portrait orientation we want "fit to width" so that we can
    # minimize the empty space on the sides of the slide (for best readability)
    boardWidth = $("#whiteboard").width()
    boardHeight = 1.4 * $("#whiteboard").width() # A4 paper size

  # this is the best fitting pair
  adjustedWidth = null
  adjustedHeight = null


  # the slide image is in portrait orientation
  if originalWidth <= originalHeight
    adjustedWidth = boardHeight * originalWidth / originalHeight
    if boardWidth < adjustedWidth
      adjustedHeight = boardHeight * boardWidth / adjustedWidth
      adjustedWidth = boardWidth
    else
      adjustedHeight = boardHeight

  # ths slide image is in landscape orientation
  else
    adjustedHeight = boardWidth * originalHeight / originalWidth
    if boardHeight < adjustedHeight
      adjustedWidth = boardWidth * boardHeight / adjustedHeight
      adjustedHeight = boardHeight
    else
      adjustedWidth = boardWidth

  { width: adjustedWidth, height: adjustedHeight }

Template.slide.helpers
  updatePointerLocation: (pointer) ->
    if whiteboardPaperModel?
      wpm = whiteboardPaperModel
      wpm?.moveCursor(pointer.x, pointer.y)

#### SHAPE ####
Template.shape.rendered = ->
  # @data is the shape object coming from the {{#each}} in the html file
  shapeInfo = @data.shape?.shape or @data.shape
  shapeType = shapeInfo?.type

  if shapeType isnt "text"
    len = shapeInfo.points.length
    for num in [0..len] # the coordinates must be in the range 0 to 1
      shapeInfo.points[num] = shapeInfo.points[num] / 100

  if whiteboardPaperModel?
    wpm = whiteboardPaperModel
    wpm?.makeShape(shapeType, shapeInfo)
    wpm?.updateShape(shapeType, shapeInfo)

Template.shape.destroyed = ->
  if whiteboardPaperModel?
    wpm = whiteboardPaperModel
    wpm.clearShapes()
    manuallyDisplayShapes()
