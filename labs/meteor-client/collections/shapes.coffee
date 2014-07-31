Meteor.methods
  addShapeToCollection: (meetingId, whiteboardId, shapeObject) ->
    unless Meteor.Shapes.findOne({whiteboardId:whiteboardId, meetingId: meetingId, "shape.wb_id": "shapeObject.wb_id"})?
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
      console.log "added shape id =[#{id}]:#{shapeObject.id} in #{meetingId}"

