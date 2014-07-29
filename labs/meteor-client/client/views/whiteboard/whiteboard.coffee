Template.whiteboard.events
  "click .drawShapes":() ->
    alert "drawShapes"
    wpm = new WhiteboardPaperModel('whiteboard-paper')
    wpm.create()
    wpm._displayPage("someSampleData")
    # paper = new Raphael(document.getElementById('whiteboard-paper'), 500, 500);
    # circle = paper.circle(100, 100, 80);

    # console.log "shapes:" + Meteor.Shapes.find().fetch().length
    for shape in Meteor.Shapes.find().fetch()
      shapeType = shape.shape.payload.shape.shape_type
      data = shape.shape.payload.shape.shape
      console.log "shapeType=" + shapeType
      console.log "data=" + JSON.stringify data

      wpm.makeShape(shapeType, data)
      wpm.updateShape(shapeType, data)
      #circle = wpm.circle(100, 100, 80)