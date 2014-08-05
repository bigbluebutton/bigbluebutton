Template.slide.rendered = ->
  console.log "rendered - dom is ready"
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
  console.log "the current slide is:" + currentSlide?.slide?.id
  if currentSlide?.slide?.png_uri?

    Template.slide.createWhiteboardPaper((wpm)->
      Template.slide.displaySlide(wpm, (currentSlide)->
        console.log "wpm=" + wpm
        Template.slide.displayShapeOnSlide()
        ))

Template.slide.helpers
  createWhiteboardPaper: (callback) ->
    console.log "this should happen 1st" + document.getElementById('whiteboard-paper')
    console.log "whiteboardPaperModel already exists" if whiteboardPaperModel?
    whiteboardPaperModel = new WhiteboardPaperModel('whiteboard-paper')
    callback(whiteboardPaperModel)

  displayShapeOnSlide: ->
    console.log "this should happen third"
    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
    console.log "(shapesOnSlide)the current slide is:" + currentSlide?.slide?.id
    console.log "(shapesOnSlide) and there are #{Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).count()} shapes"
    for shape in Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id}).fetch()
      console.log "displaying shape on slide for a " + JSON.stringify shape.shape

      shapeType = shape.shape?.shape?.type
      data = shape.shape?.shape # TODO change some of these!!

      data.points[0] = data.points[0] / 100
      data.points[1] = data.points[1] / 100
      data.points[2] = data.points[2] / 100
      data.points[3] = data.points[3] / 100

      console.log "shapeType=" + shapeType
      console.log "data=" + JSON.stringify data

      #whiteboardPaperModel.makeShape(shapeType, data)
      #whiteboardPaperModel.updateShape(shapeType, data)

  displaySlide: (wpm, callback) ->
    console.log "this should happen second!"
    console.log "wpm2=" + wpm
    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})

    wpm.create() #TODO maybe move this to main.coffee
    wpm._displayPage(currentSlide?.slide?.png_uri)
    callback(currentSlide?.slide)
