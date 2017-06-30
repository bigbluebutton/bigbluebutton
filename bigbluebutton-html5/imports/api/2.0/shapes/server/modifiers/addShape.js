import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Shapes from '/imports/api/2.0/shapes';

const SHAPE_TYPE_TEXT = 'text';
const SHAPE_TYPE_POLL_RESULT = 'poll_result';
const SHAPE_TYPE_PENCIL = 'pencil';

export default function addShape(meetingId, whiteboardId, userId, shape) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(shape, Object);

  const selector = {
    meetingId,
    'shape.id': shape.id,
    userId,
  };

  const modifier = {
    $set: {
      userId,
      meetingId,
      whiteboardId,
      'shape.id': shape.id,
      'shape.wb_id': shape.wbId,
      'shape.shape_type': shape.annotationType,
      'shape.status': shape.status,
      'shape.shape.type': shape.annotationInfo.type,
      'shape.shape.status': shape.annotationInfo.status,
    },
  };

  const shapeType = shape.annotationType;

  switch (shapeType) {
    case SHAPE_TYPE_TEXT:
      modifier.$set = Object.assign(modifier.$set, {
        'shape.shape.x': shape.annotationInfo.x,
        'shape.shape.y': shape.annotationInfo.y,
        'shape.shape.fontColor': shape.annotationInfo.fontColor,
        'shape.shape.calcedFontSize': shape.annotationInfo.calcedFontSize,
        'shape.shape.textBoxWidth': shape.annotationInfo.textBoxWidth,
        'shape.shape.text': shape.annotationInfo.text.replace(/[\r]/g, '\n'),
        'shape.shape.textBoxHeight': shape.annotationInfo.textBoxHeight,
        'shape.shape.id': shape.annotationInfo.id,
        'shape.shape.whiteboardId': shape.annotationInfo.whiteboardId,
        'shape.shape.fontSize': shape.annotationInfo.fontSize,
        'shape.shape.dataPoints': shape.annotationInfo.dataPoints,
      });
      break;

    case SHAPE_TYPE_POLL_RESULT:
      /**
       * TODO
       * shape.annotationInfo.result = JSON.parse(shape.annotationInfo.result);
       */
      break;
    case SHAPE_TYPE_PENCIL:
      modifier.$push = { 'shape.shape.points': { $each: shape.annotationInfo.points } };
      break;
    default:
      modifier.$set = Object.assign(modifier.$set, {
        'shape.shape.points': shape.annotationInfo.points,
        'shape.shape.whiteboardId': shape.annotationInfo.whiteboardId,
        'shape.shape.id': shape.annotationInfo.id,
        'shape.shape.square': shape.annotationInfo.square,
        'shape.shape.transparency': shape.annotationInfo.transparency,
        'shape.shape.thickness': shape.annotationInfo.thickness,
        'shape.shape.color': shape.annotationInfo.color,
        'shape.shape.result': shape.annotationInfo.result,
        'shape.shape.num_respondents': shape.annotationInfo.numRespondents,
        'shape.shape.num_responders': shape.annotationInfo.numResponders,
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
}
