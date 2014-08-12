Meteor.methods
  addShapeToCollection: (meetingId, whiteboardId, shapeObject) ->
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

    # if there is a shape with the same shape.id and whiteboardId in the collection
    # then we are dealing with slow drawing of a shape. We need to overwrite the existing shape
    # with the new candidate
    existing = Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId, "shape.id": shapeObject.id})
    console.log "there are #{existing?.count()} shapes with this id"
    if existing?
      for s in existing.fetch()
        # overwrite by removing completely and adding the fresh object
        #alreadyPresent = Meteor.Shapes.findOne({meetingId: meetingId, whiteboardId: whiteboardId, "shape.id": shapeObject.id})
        #if alreadyPresent?
        Meteor.Shapes.remove(s._id)
        console.log "overwriting shape " + s.shape.id
      Meteor.call("addTheShape", entry)

    else
      Meteor.call("addTheShape", entry)

  addTheShape: (entry) ->
    id = Meteor.Shapes.insert(entry)
    numShapesOnSlide = Meteor.Shapes.find({meetingId: entry.meetingId, whiteboardId: entry.whiteboardId}).count()
    console.log "added shape id =[#{id}]:#{entry.shape.id} in #{entry.meetingId} || now there are #{numShapesOnSlide} shapes on the slide"

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
