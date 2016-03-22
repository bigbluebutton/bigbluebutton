// --------------------------------------------------------------------------------------------
// Private methods on server
// --------------------------------------------------------------------------------------------
this.addShapeToCollection = function (meetingId, whiteboardId, shapeObject) {
  let entry, id, removeTempTextShape;
  if (shapeObject != null && shapeObject.shape_type === 'text') {
    Meteor.log.info(`we are dealing with a text shape and the event is:${shapeObject.status}`);
    entry = {
      meetingId: meetingId,
      whiteboardId: whiteboardId,
      shape: {
        type: shapeObject.shape.type,
        textBoxHeight: shapeObject.shape.textBoxHeight,
        backgroundColor: shapeObject.shape.backgroundColor,
        fontColor: shapeObject.shape.fontColor,
        status: shapeObject.shape.status,
        dataPoints: shapeObject.shape.dataPoints,
        x: shapeObject.shape.x,
        textBoxWidth: shapeObject.shape.textBoxWidth,
        whiteboardId: shapeObject.shape.whiteboardId,
        fontSize: shapeObject.shape.fontSize,
        id: shapeObject.shape.id,
        y: shapeObject.shape.y,
        calcedFontSize: shapeObject.shape.calcedFontSize,
        text: shapeObject.shape.text,
        background: shapeObject.shape.background,
      },
    };
    if (shapeObject.status === 'textEdited' || shapeObject.status === 'textPublished') {
      // only keep the final version of the text shape
      removeTempTextShape = function (callback) {
        Meteor.Shapes.remove({
          'shape.id': shapeObject.shape.id,
        });

        // for s in Meteor.Shapes.find({'shape.id':shapeObject.shape.id}).fetch()
        //   Meteor.log.info "there is this shape: #{s.shape.text}"
        return callback();
      };

      return removeTempTextShape(() => {
        // display as the prestenter is typing
        let id;
        id = Meteor.Shapes.insert(entry);
        return Meteor.log.info(`${shapeObject.status} substituting the temp shapes with the newer one`);
      });
    }

    // the mouse button was released - the drawing is complete
    // TODO: pencil messages currently don't send draw_end and are labeled all as DRAW_START
  } else if (shapeObject != null && shapeObject.status === 'DRAW_END' || (shapeObject != null && shapeObject.status === 'DRAW_START' && shapeObject.shape_type === 'pencil')) {
    entry = {
        meetingId: meetingId,
        whiteboardId: whiteboardId,
        shape: {
          wb_id: shapeObject.wb_id,
          shape_type: shapeObject.shape_type,
          status: shapeObject.status,
          id: shapeObject.id,
          shape: {
            type: shapeObject.shape.type,
            status: shapeObject.shape.status,
            points: shapeObject.shape.points,
            whiteboardId: shapeObject.shape.whiteboardId,
            id: shapeObject.shape.id,
            square: shapeObject.shape.square,
            transparency: shapeObject.shape.transparency,
            thickness: shapeObject.shape.thickness,
            color: shapeObject.shape.color,
            result: shapeObject.shape.result,
            num_respondents: shapeObject.shape.num_respondents,
            num_responders: shapeObject.shape.num_responders,
          },
        },
      };
    return id = Meteor.Shapes.insert(entry);
  }
};

this.removeAllShapesFromSlide = function (meetingId, whiteboardId) {
  Meteor.log.info(`removeAllShapesFromSlide__${whiteboardId}`);
  if ((meetingId != null) && (whiteboardId != null) && (Meteor.Shapes.find({
    meetingId: meetingId,
    whiteboardId: whiteboardId,
  }) != null)) {
    return Meteor.Shapes.remove({
      meetingId: meetingId,
      whiteboardId: whiteboardId,
    }, () => {
      Meteor.log.info('clearing all shapes from slide');

      // After shapes are cleared, wait 1 second and set cleaning off
      return Meteor.setTimeout(() => {
        return Meteor.WhiteboardCleanStatus.update({
          meetingId: meetingId,
        }, {
          $set: {
            in_progress: false,
          },
        });
      }, 1000);
    });
  }
};

this.removeShapeFromSlide = function (meetingId, whiteboardId, shapeId) {
  let shapeToRemove;
  if (meetingId != null && whiteboardId != null && shapeId != null) {
    shapeToRemove = Meteor.Shapes.findOne({
      meetingId: meetingId,
      whiteboardId: whiteboardId,
      'shape.id': shapeId,
    });
    if (shapeToRemove != null) {
      Meteor.Shapes.remove(shapeToRemove._id);
      Meteor.log.info(`----removed shape[${shapeId}] from ${whiteboardId}`);
      return Meteor.log.info(`remaining shapes on the slide: ${
        Meteor.Shapes.find({
          meetingId: meetingId,
          whiteboardId: whiteboardId,
        }).count()}`);
    }
  }
};

// called on server start and meeting end
this.clearShapesCollection = function (meetingId) {
  if (meetingId != null) {
    return Meteor.Shapes.remove({
      meetingId: meetingId,
    }, () => {
      Meteor.log.info(`cleared Shapes Collection (meetingId: ${meetingId}!`);
      return Meteor.WhiteboardCleanStatus.update({
        meetingId: meetingId,
      }, {
        $set: {
          in_progress: false,
        },
      });
    });
  } else {
    return Meteor.Shapes.remove({}, () => {
      Meteor.log.info('cleared Shapes Collection (all meetings)!');
      return Meteor.WhiteboardCleanStatus.update({
        meetingId: meetingId,
      }, {
        $set: {
          in_progress: false,
        },
      });
    });
  }
};

// --------------------------------------------------------------------------------------------
// end Private methods on server
// --------------------------------------------------------------------------------------------
