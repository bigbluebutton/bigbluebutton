import Shapes from '/imports/api/2.0/shapes';
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
      return Logger.error(`Removing Shapes2x from collection: ${err}`);
    }

    return Logger.info(`Removed Shapes2x where whiteboard=${whiteboardId}`);
  };

  return Shapes.remove(selector, cb);
}
