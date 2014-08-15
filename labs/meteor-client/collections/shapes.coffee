Meteor.methods
  addShapeToCollection: (meetingId, whiteboardId, shapeObject) ->
    if shapeObject?.status is "DRAW_END" #the mouse button was released - the drawing is complete
      entry =
        meetingId: meetingId
        whiteboardId: whiteboardId
        shape:
          wb_id: shapeObject.wb_id
          shape_type: shapeObject.shape_type
          status: shapeObject.status
          id: shapeObject.id
          shape:
            type: shapeObject.shape.type
            status: shapeObject.shape.status
            points: shapeObject.shape.points
            whiteboardId: shapeObject.shape.whiteboardId
            id: shapeObject.shape.id
            square: shapeObject.shape.square
            transparency: shapeObject.shape.transparency
            thickness: shapeObject.shape.thickness
            color: shapeObject.shape.color

      id = Meteor.Shapes.insert(entry)
      numShapesOnSlide = Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId}).fetch().length
      console.log "added shape id =[#{id}]:#{shapeObject.id} in #{meetingId} || now there are #{numShapesOnSlide} shapes on the slide"

  removeAllShapesFromSlide: (meetingId, whiteboardId) ->
    console.log "removeAllShapesFromSlide__" + whiteboardId
    if meetingId? and whiteboardId? and Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId})?
      shapesOnSlide = Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId}).fetch()
      console.log "number of shapes:" + shapesOnSlide.length
      for s in shapesOnSlide
        console.log "shape=" + s.shape.id
        id = Meteor.Shapes.findOne({meetingId: meetingId, whiteboardId: whiteboardId, "shape.id": s.shape.id})
        if id?
          Meteor.Shapes.remove(id._id)
          console.log "----removed shape[" + s.shape.id + "] from " + whiteboardId
          console.log "remaining shapes on the slide:" + Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId}).fetch().length

  removeShapeFromSlide: (meetingId, whiteboardId, shapeId) ->
    console.log "remove a shape from slide:" + shapeId
    shapeToRemove = Meteor.Shapes.findOne({meetingId: meetingId, whiteboardId: whiteboardId, "shape.id": shapeId})
    if meetingId? and whiteboardId? and shapeId? and shapeToRemove?
      console.log "found the shape to be removed"
      Meteor.Shapes.remove(shapeToRemove._id)
      console.log "----removed shape[" + shapeId + "] from " + whiteboardId
      console.log "remaining shapes on the slide:" + Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId}).count()



