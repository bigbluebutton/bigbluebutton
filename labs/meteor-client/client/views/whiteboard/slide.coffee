Template.slide.rendered = ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
  if currentSlide?.slide?.png_uri?
    Template.slide.createWhiteboardPaper (wpm)->
      Template.slide.displaySlide wpm, ->
        #Template.slide.displayShapeOnSlide wpm
        Template.shape.displayShape wpm

Template.slide.helpers
  createWhiteboardPaper: (callback) ->
    whiteboardPaperModel = new WhiteboardPaperModel('whiteboard-paper')
    callback(whiteboardPaperModel)

  displaySlide: (wpm, callback) ->
    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})

    wpm.create()
    wpm._displayPage(currentSlide?.slide?.png_uri)
    callback(currentSlide?.slide)

#### SHAPE ####
Template.shape.helpers
  displayShape: (wpm) ->
    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
    for shape in Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).fetch()
      shapeType = shape.shape?.shape?.type
      data = shape.shape?.shape # TODO change some of these!!

      for num in [0..3] # the coordinates must be in the range 0 to 1
        data.points[num] = data.points[num] / 100

      wpm.makeShape(shapeType, data)
      wpm.updateShape(shapeType, data)
