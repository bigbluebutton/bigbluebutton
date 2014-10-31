Template.slide.rendered = ->
  currentSlide = getCurrentSlideDoc()
  if currentSlide?.slide?.png_uri?
    createWhiteboardPaper (wpm) ->
      displaySlide wpm

@createWhiteboardPaper = (callback) =>
  @whiteboardPaperModel = new Meteor.WhiteboardPaperModel('whiteboard-paper')
  callback(@whiteboardPaperModel)

@displaySlide = (wpm) ->
  currentSlide = getCurrentSlideDoc()
  wpm.create()
  pic = new Image()
  pic.onload = ->
    originalWidth = this.width
    originalHeight = this.height

    boardWidth = $("#whiteboard").width()

    whiteboardBottom = $("#whiteboard").offset().top + $("#whiteboard").height()
    footerTop = $(".myFooter").offset().top
    if footerTop < whiteboardBottom
      boardHeight = footerTop - $("#whiteboard").offset().top - $("#whiteboard-navbar").height() - 10
    else
      boardHeight = $("#whiteboard").height() - $("#whiteboard-navbar").height() - 10

    if originalWidth <= originalHeight
      adjustedWidth = boardHeight * originalWidth / originalHeight
      $('#whiteboard-paper').width(adjustedWidth)
      if boardWidth < adjustedWidth
        adjustedHeight = boardHeight * boardWidth / adjustedWidth
        adjustedWidth = boardWidth
      else
        adjustedHeight = boardHeight
      $("#whiteboard-paper").height(adjustedHeight)
    else
      adjustedHeight = boardWidth * originalHeight / originalWidth
      $('#whiteboard-paper').height(adjustedHeight)
      if boardHeight < adjustedHeight
        adjustedWidth = boardWidth * boardHeight / adjustedHeight
        adjustedHeight = boardHeight
      else
        adjustedWidth = boardWidth
      $("#whiteboard-paper").width(adjustedWidth)

    height = $('#whiteboard').height()
    $('#whiteboard-paper').height((height-$("#whiteboard-navbar").height()-10)+'px')

    wpm._displayPage(currentSlide?.slide?.png_uri, originalWidth, originalHeight)
    manuallyDisplayShapes()
    wpm.scale(adjustedWidth, adjustedHeight)

  pic.src = currentSlide?.slide?.png_uri

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
