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

#### SHAPE ####
Template.shape.rendered = ->
  # @data is the shape object
  shape = @data

  shapeType = shape.shape?.shape?.type
  data2 = shape.shape?.shape # TODO change some of these!!

  for num in [0..3] # the coordinates must be in the range 0 to 1
    data2.points[num] = data2.points[num] / 100

  wpm = Template.slide.whiteboardPaperModel
  wpm.makeShape(shapeType, data2)
  wpm.updateShape(shapeType, data2)



