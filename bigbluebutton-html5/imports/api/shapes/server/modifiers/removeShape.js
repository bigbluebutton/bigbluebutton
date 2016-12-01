import { check } from 'meteor/check';
import Shapes from '/imports/api/shapes';
import Logger from '/imports/startup/server/logger';

export default function removeShape(meetingId, whiteboardId, shapeId) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(shapeId, String);

  const selector = {
    meetingId,
    whiteboardId,
    'shape.id': shapeId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Removing shape from collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Removed shape id=${shapeId} whiteboard=${whiteboardId}`);
    }
  };

  return Shapes.remove(selector, cb);
};
