# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addShapeToCollection = (meetingId, whiteboardId, shapeObject) ->
  if shapeObject?.shape_type is "text"
    Meteor.log.info "we are dealing with a text shape and the event is:#{shapeObject.status}"

    entry =
      meetingId: meetingId
      whiteboardId: whiteboardId
      shape:
        type: shapeObject.shape.type
        textBoxHeight: shapeObject.shape.textBoxHeight
        backgroundColor: shapeObject.shape.backgroundColor
        fontColor: shapeObject.shape.fontColor
        status: shapeObject.shape.status
        dataPoints: shapeObject.shape.dataPoints
        x: shapeObject.shape.x
        textBoxWidth: shapeObject.shape.textBoxWidth
        whiteboardId: shapeObject.shape.whiteboardId
        fontSize: shapeObject.shape.fontSize
        id: shapeObject.shape.id
        y: shapeObject.shape.y
        calcedFontSize: shapeObject.shape.calcedFontSize
        text: shapeObject.shape.text
        background: shapeObject.shape.background

    if shapeObject.status is "textEdited" or shapeObject.status is "textPublished"
      # only keep the final version of the text shape
      removeTempTextShape = (callback) ->
        Meteor.Shapes.remove({'shape.id':shapeObject.shape.id})
        # for s in Meteor.Shapes.find({'shape.id':shapeObject.shape.id}).fetch()
        #   Meteor.log.info "there is this shape: #{s.shape.text}"
        callback()

      removeTempTextShape( ->
        # display as the prestenter is typing
        id = Meteor.Shapes.insert(entry)
        Meteor.log.info "#{shapeObject.status} substituting the temp shapes with the newer one"
      )

  else
    # the mouse button was released - the drawing is complete
    # TODO: pencil messages currently don't send draw_end and are labeled all as DRAW_START
    if shapeObject?.status is "DRAW_END" or (shapeObject?.status is "DRAW_START" and shapeObject?.shape_type is "pencil")
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

@removeAllShapesFromSlide = (meetingId, whiteboardId) ->
  Meteor.log.info "removeAllShapesFromSlide__" + whiteboardId
  if meetingId? and whiteboardId? and Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId})?
    shapesOnSlide = Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId}).fetch()
    Meteor.log.info "number of shapes:" + shapesOnSlide.length
    for s in shapesOnSlide
      Meteor.log.info "shape=" + s.shape.id
      id = Meteor.Shapes.findOne({meetingId: meetingId, whiteboardId: whiteboardId, "shape.id": s.shape.id})
      if id?
        Meteor.Shapes.remove(id._id)
        Meteor.log.info "----removed shape[" + s.shape.id + "] from " + whiteboardId
        Meteor.log.info "remaining shapes on the slide:" + Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId}).fetch().length

@removeShapeFromSlide = (meetingId, whiteboardId, shapeId) ->
  shapeToRemove = Meteor.Shapes.findOne({meetingId: meetingId, whiteboardId: whiteboardId, "shape.id": shapeId})
  if meetingId? and whiteboardId? and shapeId? and shapeToRemove?
    Meteor.Shapes.remove(shapeToRemove._id)
    Meteor.log.info "----removed shape[" + shapeId + "] from " + whiteboardId
    Meteor.log.info "remaining shapes on the slide:" + Meteor.Shapes.find({meetingId: meetingId, whiteboardId: whiteboardId}).count()


# called on server start and meeting end
@clearShapesCollection = (meetingId) ->
  if meetingId?
    Meteor.Shapes.remove({meetingId: meetingId}, Meteor.log.info "cleared Shapes Collection (meetingId: #{meetingId}!")
  else
    Meteor.Shapes.remove({}, Meteor.log.info "cleared Shapes Collection (all meetings)!")

# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
