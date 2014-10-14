Template.slide.rendered = ->
  currentSlide = getCurrentSlideDoc()
  pic = new Image()
  pic.onload = ->
    originalWidth = this.width
    originalHeight = this.height

    boardWidth = $("#whiteboard").width()
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

    if currentSlide?.slide?.png_uri?
      Template.slide.createWhiteboardPaper (wpm) ->
        Template.slide.displaySlide wpm, originalWidth, originalHeight

  pic.src = currentSlide?.slide?.png_uri

Template.slide.helpers
  createWhiteboardPaper: (callback) ->
    Template.slide.whiteboardPaperModel = new WhiteboardPaperModel('whiteboard-paper')
    callback(Template.slide.whiteboardPaperModel)

  displaySlide: (wpm, originalWidth, originalHeight) ->
    currentSlide = getCurrentSlideDoc()
    wpm.create()
    wpm._displayPage(currentSlide?.slide?.png_uri, originalWidth, originalHeight)
    Template.slide.manuallyDisplayShapes()

  updatePointerLocation: (pointer) ->
    wpm = Template.slide.whiteboardPaperModel
    wpm?.moveCursor(pointer.x, pointer.y)

  manuallyDisplayShapes: ->
    currentSlide = getCurrentSlideDoc()
    
    wpm = Template.slide.whiteboardPaperModel

    shapes = Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).fetch()
    for s in shapes
      shapeInfo = s.shape?.shape or s?.shape
      shapeType = shapeInfo?.type

      if shapeType isnt "text"
        len = shapeInfo.points.length
        for num in [0..len] # the coordinates must be in the range 0 to 1
          shapeInfo?.points[num] = shapeInfo?.points[num] / 100
      wpm.makeShape(shapeType, shapeInfo)
      wpm.updateShape(shapeType, shapeInfo)


#### SHAPE ####
Template.shape.rendered = ->
  # @data is the shape object coming from the {{#each}} in the html file
  shapeInfo = @data.shape?.shape or @data.shape
  shapeType = shapeInfo?.type

  if shapeType isnt "text"
    len = shapeInfo.points.length
    for num in [0..len] # the coordinates must be in the range 0 to 1
      shapeInfo.points[num] = shapeInfo.points[num] / 100

  wpm = Template.slide.whiteboardPaperModel
  wpm.makeShape(shapeType, shapeInfo)
  wpm.updateShape(shapeType, shapeInfo)

Template.shape.destroyed = ->
  wpm = Template.slide.whiteboardPaperModel
  wpm.clearShapes()
  Template.slide.displaySlide(wpm)
  Template.slide.manuallyDisplayShapes()
