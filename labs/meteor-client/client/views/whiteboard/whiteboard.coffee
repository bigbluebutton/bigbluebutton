Template.whiteboard.png = ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
  console.log "the current slide is:" + currentSlide?.slide?.id
  if currentSlide?.slide?.png_uri?
    whiteboardPaperModel.create() #TODO maybe move this to main.coffee
    whiteboardPaperModel._displayPage(currentSlide?.slide?.png_uri)

Template.whiteboard.helpers
  displayShapeOnSlide: ->
    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
    console.log "(shapesOnSlide)the current slide is:" + currentSlide?.slide?.id
    console.log "(shapesOnSlide) and there are #{Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).count()} shapes"
    for shape in Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).fetch()
      console.log "displaying shape on slide for a " + JSON.stringify shape.shape
      
      shapeType = shape.shape?.shape?.type
      data = shape.shape?.shape # TODO change some of these!!
      for point in data.points
        point = point / 100
      console.log "shapeType=" + shapeType
      console.log "data=" + JSON.stringify data

      whiteboardPaperModel.makeShape(shapeType, data)
      whiteboardPaperModel.updateShape(shapeType, data)
