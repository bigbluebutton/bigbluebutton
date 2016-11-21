import Shapes from '/imports/api/shapes';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function clearShapesWhiteboard(meetingId, whiteboardId) {
  check(meetingId, String);
  check(whiteboardId, String);

  const selector = {
    meetingId,
    whiteboardId,
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Shapes from collection: ${err}`);
    }

    return Logger.info(`Removed Shapes where whiteboard=${whiteboardId}`);
  };

  return Shapes.remove(selector, cb);
};
