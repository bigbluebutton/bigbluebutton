import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Shapes from '/imports/api/2.0/shapes';
import flat from 'flat';

const SHAPE_TYPE_TEXT = 'text';
const SHAPE_TYPE_PENCIL = 'pencil';

export default function addShape(meetingId, whiteboardId, userId, shape) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(shape, Object);

  const selector = {
    meetingId,
    id: shape.id,
    userId,
  };

  const modifier = {
    $set: Object.assign(
      { userId },
      { meetingId },
      { whiteboardId },
      flat(shape, { safe: true }),
    ),
  };

  const shapeType = shape.annotationType;

  switch (shapeType) {
    case SHAPE_TYPE_TEXT:
      modifier.$set = Object.assign(modifier.$set, {
        'annotationInfo.text': shape.annotationInfo.text.replace(/[\r]/g, '\n'),
      });
      break;
    case SHAPE_TYPE_PENCIL:
      // On the draw_end he send us all the points, we don't need to push, we can simple
      // set the new points.
      if (shape.status !== 'DRAW_END') {
        // We don't want it to be update twice.
        delete modifier.$set['annotationInfo.points'];
        modifier.$push = { 'annotationInfo.points': { $each: shape.annotationInfo.points } };
      }
      break;
    default:
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

    return Logger.info(`Upserted shape id=${shape.id} whiteboard=${whiteboardId}`);
  };

  return Shapes.upsert(selector, modifier, cb);
}
