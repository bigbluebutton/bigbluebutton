import { Shapes, WhiteboardCleanStatus } from '/imports/startup/collections';
import { logger } from '/imports/startup/server/logger';

export function addShapeToCollection(meetingId, whiteboardId, shapeObject) {
  let entry, id, removeTempTextShape;
  if (shapeObject != null && shapeObject.shape_type === 'text') {
    logger.info(`we are dealing with a text shape and the event is:${shapeObject.status}`);
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
        Shapes.remove({
          'shape.id': shapeObject.shape.id,
        });
        return callback();
      };

      return removeTempTextShape(() => {
        // display as the prestenter is typing
        let id;
        id = Shapes.insert(entry);
        return logger.info(`${shapeObject.status} substituting the temp shapes with the newer one`);
      });
    }

    // the mouse button was released - the drawing is complete
    // TODO: pencil messages currently don't send draw_end and are labeled all as DRAW_START
  } else if (shapeObject != null && (shapeObject.status === 'DRAW_START' ||
    shapeObject.status === 'DRAW_UPDATE' || shapeObject.status === 'DRAW_END')) {
    shape = Shapes.findOne({
        'shape.id': shapeObject.shape.id,
      });
    if (shape != null) {
      return id = Shapes.update({
          'shape.id': shapeObject.shape.id,
        }, {
          $set: {
            'shape.shape.points': shapeObject.shape.points,
          },
        });
    } else {
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
      return id = Shapes.insert(entry);
    }
  }
};

export function removeAllShapesFromSlide(meetingId, whiteboardId) {
  logger.info(`removeAllShapesFromSlide__${whiteboardId}`);
  if ((meetingId != null) && (whiteboardId != null) && (Shapes.find({
    meetingId: meetingId,
    whiteboardId: whiteboardId,
  }) != null)) {
    return Shapes.remove({
      meetingId: meetingId,
      whiteboardId: whiteboardId,
    }, () => {
      logger.info('clearing all shapes from slide');

      // After shapes are cleared, wait 1 second and set cleaning off
      // Why would we wait 1 second? (Alex)
      return Meteor.setTimeout(() => {
        return WhiteboardCleanStatus.update({
          meetingId: meetingId,
        }, {
          $set: {
            in_progress: false,
          },
        });
      }, 0);
    });
  }
};

export function removeShapeFromSlide(meetingId, whiteboardId, shapeId) {
  let shapeToRemove;
  if (meetingId != null && whiteboardId != null && shapeId != null) {
    shapeToRemove = Shapes.findOne({
      meetingId: meetingId,
      whiteboardId: whiteboardId,
      'shape.id': shapeId,
    });
    if (shapeToRemove != null) {
      Shapes.remove(shapeToRemove._id);
      logger.info(`----removed shape[${shapeId}] from ${whiteboardId}`);
      return logger.info(`remaining shapes on the slide: ${
        Shapes.find({
          meetingId: meetingId,
          whiteboardId: whiteboardId,
        }).count()}`);
    }
  }
};

// called on server start and meeting end
export function clearShapesCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Shapes.remove({
      meetingId: meetingId,
    }, () => {
      logger.info(`cleared Shapes Collection (meetingId: ${meetingId}!`);
      return WhiteboardCleanStatus.update({
        meetingId: meetingId,
      }, {
        $set: {
          in_progress: false,
        },
      });
    });
  } else {
    return Shapes.remove({}, () => {
      logger.info('cleared Shapes Collection (all meetings)!');
      return WhiteboardCleanStatus.update({
        meetingId: meetingId,
      }, {
        $set: {
          in_progress: false,
        },
      });
    });
  }
};
