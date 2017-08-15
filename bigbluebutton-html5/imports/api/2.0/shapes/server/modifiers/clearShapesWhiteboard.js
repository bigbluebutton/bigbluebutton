import Shapes from '/imports/api/2.0/shapes';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function clearShapesWhiteboard(meetingId, whiteboardId, userId, fullClear) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(userId, String);
  check(fullClear, Boolean);

  let selector = {};

  if (fullClear) {
    selector = {
      meetingId,
      whiteboardId,
    };
  } else {
    selector = {
      meetingId,
      whiteboardId,
      userId,
    };
  }

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Shapes2x from collection: ${err}`);
    }

    if (!fullClear) {
      return Logger.info(`Removed Shapes2x for userId=${userId} where whiteboard=${whiteboardId}`);
    }

    return Logger.info(`Removed Shapes2x where whiteboard=${whiteboardId}`);
  };

  return Shapes.remove(selector, cb);
}
