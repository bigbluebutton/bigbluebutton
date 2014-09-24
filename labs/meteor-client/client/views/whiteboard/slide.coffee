Template.slide.rendered = ->
  height = $('#whiteboard').height()
  console.log "height = #{height}"
  $('#whiteboard-paper').height((height-$("#whiteboard-navbar").height()-10)+'px')

  currentSlide = getCurrentSlideDoc()
    
  if currentSlide?.slide?.png_uri?
    Template.slide.createWhiteboardPaper (wpm) ->
      Template.slide.displaySlide wpm

Template.slide.helpers
  createWhiteboardPaper: (callback) ->
    Template.slide.whiteboardPaperModel = new WhiteboardPaperModel('whiteboard-paper')
    callback(Template.slide.whiteboardPaperModel)

  displaySlide: (wpm) ->
    currentSlide = getCurrentSlideDoc()

    wpm.create()
    
    # loading the image to find its original dimensions
    pic = new Image()
    pic.onload = ->
      wpm._displayPage(currentSlide?.slide?.png_uri, this.width, this.height)
      Template.slide.manuallyDisplayShapes()
    pic.src = currentSlide?.slide?.png_uri

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
