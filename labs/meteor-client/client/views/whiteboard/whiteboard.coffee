Template.whiteboard.png = ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
  console.log "the current slide is:" + currentSlide?.slide?.id
  if currentSlide?.slide?.png_uri?
    #alert "drawShapes" 
    wpm = new WhiteboardPaperModel('whiteboard-paper')
    wpm.create()
    wpm._displayPage(currentSlide?.slide?.png_uri)
    for shape in Meteor.Shapes.find().fetch()
      shapeType = shape.shape.payload.shape.shape_type
      data = shape.shape.payload.shape.shape
      console.log "shapeType=" + shapeType
      console.log "data=" + JSON.stringify data

      wpm.makeShape(shapeType, data)
      wpm.updateShape(shapeType, data)
  currentSlide?.slide?.png_uri

