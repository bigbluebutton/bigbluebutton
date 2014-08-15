Template.slide.rendered = ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
  if currentSlide?.slide?.png_uri?
    Template.slide.createWhiteboardPaper (wpm)->
      Template.slide.displaySlide wpm

Template.slide.helpers
  createWhiteboardPaper: (callback) ->
    Template.slide.whiteboardPaperModel = new WhiteboardPaperModel('whiteboard-paper')
    callback(Template.slide.whiteboardPaperModel)

  displaySlide: (wpm) ->
    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})

    wpm.create()
    wpm._displayPage(currentSlide?.slide?.png_uri)

  updatePointerLocation: (pointer) ->
    wpm = Template.slide.whiteboardPaperModel
    wpm?.moveCursor(pointer.x, pointer.y)

  manuallyDisplayShapes: ->
    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
    wpm = Template.slide.whiteboardPaperModel

    shapes = Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).fetch()
    for s in shapes
      shapeInfo = s.shape?.shape
      shapeType = shapeInfo?.type

      for num in [0..3] # the coordinates must be in the range 0 to 1
        shapeInfo.points[num] = shapeInfo.points[num] / 100
      wpm.makeShape(shapeType, shapeInfo)
      wpm.updateShape(shapeType, shapeInfo)


#### SHAPE ####
Template.shape.rendered = ->
  # @data is the shape object coming from the {{#each}} in the html file
  shapeInfo = @data.shape?.shape
  shapeType = shapeInfo?.type

  for num in [0..3] # the coordinates must be in the range 0 to 1
    shapeInfo.points[num] = shapeInfo.points[num] / 100

  wpm = Template.slide.whiteboardPaperModel
  wpm.makeShape(shapeType, shapeInfo)
  wpm.updateShape(shapeType, shapeInfo)

Template.shape.destroyed = ->
  wpm = Template.slide.whiteboardPaperModel
  wpm.clearShapes()
  Template.slide.displaySlide(wpm)
  Template.slide.manuallyDisplayShapes()

