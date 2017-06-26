import { check } from 'meteor/check';
import Shapes from './../../';
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

  const modifier = {
    $set: {
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
        'shape.shape.textBoxHeight': shape.annotationInfo.textBoxHeight,
        'shape.shape.fontColor': shape.annotationInfo.fontColor,
        'shape.shape.dataPoints': shape.annotationInfo.dataPoints,
        'shape.shape.x': shape.annotationInfo.x,
        'shape.shape.textBoxWidth': shape.annotationInfo.textBoxWidth,
        'shape.shape.whiteboardId': shape.annotationInfo.whiteboardId,
        'shape.shape.fontSize': shape.annotationInfo.fontSize,
        'shape.shape.id': shape.annotationInfo.id,
        'shape.shape.y': shape.annotationInfo.y,
        'shape.shape.calcedFontSize': shape.annotationInfo.calcedFontSize,
        'shape.shape.text': shape.annotationInfo.text.replace(/[\r]/g, '\n'),
      });
      break;

    case SHAPE_TYPE_POLL_RESULT:
      shape.annotationInfo.result = JSON.parse(shape.annotationInfo.result);

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
