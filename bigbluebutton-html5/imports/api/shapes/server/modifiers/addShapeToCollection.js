import Shapes from '/imports/api/shapes';
import { logger } from '/imports/startup/server/logger';

export function addShapeToCollection(meetingId, whiteboardId, shapeObject) {
  let entry;
  let id;
  let removeTempTextShape;

  //A separate check for the polling shape before adding the object to the collection
  //Meteor stringifies an array of JSONs (...shape.result) in this message
  //Parsing the String and reassigning the value
  if (shapeObject != null && shapeObject.shape_type === 'poll_result' &&
    typeof shapeObject.shape.result === 'string') {
    shapeObject.shape.result = JSON.parse(shapeObject.shape.result);
  }

  if (shapeObject != null && shapeObject.shape_type === 'text') {
    logger.info(`we are dealing with a text shape and the event is:${shapeObject.status}`);
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
          textBoxHeight: shapeObject.shape.textBoxHeight,
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
        },
      },
    };

    if (shapeObject.status === 'textCreated') {
      Shapes.insert(entry);
      return logger.info(`${shapeObject.status} adding an initial text shape to the collection`);
    } else if (shapeObject.status === 'textEdited' || shapeObject.status === 'textPublished') {
      //check if the shape with this id exists in the collection
      //this check and 'else' block can be removed once issue #3170 is fixed
      let _shape = Shapes.findOne({ 'shape.id': shapeObject.shape.id });

      if (_shape != null) {
        Shapes.update({
            'shape.id': entry.shape.id,
          }, {
            $set: {
              shape: entry.shape,
            },
          });

        return logger.info(`${shapeObject.status} substituting the temp shapes with the newer one`);
      } else {
        Shapes.insert(entry);
      }
    }

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
