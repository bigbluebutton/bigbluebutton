import { check } from 'meteor/check';
import Shapes from '/imports/api/shapes';
import Logger from '/imports/startup/server/logger';

const SHAPE_TYPE_TEXT = 'text';
const SHAPE_TYPE_POLL_RESULT = 'poll_result';

export default function addShape(meetingId, whiteboardId, shape) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(shape, Object);

  const selector = {
    meetingId,
    'shape.id': shape.id,
  };

  let modifier = {
    $set: {
      meetingId,
      whiteboardId,
      'shape.id': shape.id,
      'shape.wb_id': shape.wb_id,
      'shape.shape_type': shape.shape_type,
      'shape.status': shape.status,
      'shape.shape.type': shape.shape.type,
      'shape.shape.status': shape.shape.status,
    },
  };

  const shapeType = shape.shape_type;

  switch (shapeType) {
    case SHAPE_TYPE_TEXT:
      modifier.$set = Object.assign(modifier.$set, {
        'shape.shape.textBoxHeight': shape.shape.textBoxHeight,
        'shape.shape.fontColor': shape.shape.fontColor,
        'shape.shape.dataPoints': shape.shape.dataPoints,
        'shape.shape.x': shape.shape.x,
        'shape.shape.textBoxWidth': shape.shape.textBoxWidth,
        'shape.shape.whiteboardId': shape.shape.whiteboardId,
        'shape.shape.fontSize': shape.shape.fontSize,
        'shape.shape.id': shape.shape.id,
        'shape.shape.y': shape.shape.y,
        'shape.shape.calcedFontSize': shape.shape.calcedFontSize,
        'shape.shape.text': shape.shape.text,
      });
      break;

    case SHAPE_TYPE_POLL_RESULT:
      shape.shape.result = JSON.parse(shape.shape.result);

    default:
      modifier.$set = Object.assign(modifier.$set, {
        'shape.shape.points': shape.shape.points,
        'shape.shape.whiteboardId': shape.shape.whiteboardId,
        'shape.shape.id': shape.shape.id,
        'shape.shape.square': shape.shape.square,
        'shape.shape.transparency': shape.shape.transparency,
        'shape.shape.thickness': shape.shape.thickness,
        'shape.shape.color': shape.shape.color,
        'shape.shape.result': shape.shape.result,
        'shape.shape.num_respondents': shape.shape.num_respondents,
        'shape.shape.num_responders': shape.shape.num_responders,
      });
      break;
  }

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding shape to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added shape id=${shape.id} whiteboard=${whiteboardId}`);
    }

    if (numChanged) {
      return Logger.info(`Upserted shape id=${shape.id} whiteboard=${whiteboardId}`);
    }
  };

  return Shapes.upsert(selector, modifier, cb);
};
