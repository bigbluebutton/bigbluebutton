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

    for shape in Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).fetch()
      console.log "for this shape\n#{JSON.stringify(shape)}\n"
      shapeType = shape.shape?.shape?.type
      data = shape.shape?.shape # TODO change some of these!!
      console.log "shapeType=" + shapeType
      console.log "data=" + JSON.stringify data
      
      #the points should be within [0,1]
      for point in data.points
        point = point / 100
        #alert point

      #wpm.makeShape(shapeType, data)
      #wpm.updateShape(shapeType, data)
  #currentSlide?.slide?.png_uri

# Template.whiteboard.events
#   "click .drawShapes": ->
#     currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
#     presentationId = currentPresentation?.presentation?.id
#     currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
#     console.log "the current slide is:" + currentSlide?.slide?.id

#     if currentSlide?.slide?.png_uri?
#       #alert "drawShapes"
#       wpm = new WhiteboardPaperModel('whiteboard-paper')
#       setInSession "wpm", wpm
#       wpm.create()
#       wpm._displayPage(currentSlide?.slide?.png_uri)

#   "click .drawShapes2": ->
#       alert "hoho"
#       currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
#       presentationId = currentPresentation?.presentation?.id
#       currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
#       console.log "the current slide is:" + currentSlide?.slide?.id
#       for shape in Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).fetch()
#         console.log "for this shape\n#{JSON.stringify(shape)}\n"
#         shapeType = shape.shape?.shape?.type
#         data = shape.shape?.shape # TODO change some of these!!
#         console.log "shapeType=" + shapeType
#         console.log "data=" + JSON.stringify data

#         #the points should be within [0,1]
#         for point in data.points
#           point = point / 100
#           #alert point

#         wpm = getInSession("wpm")

#         wpm.makeShape(shapeType, data)
#         wpm.updateShape(shapeType, data)

