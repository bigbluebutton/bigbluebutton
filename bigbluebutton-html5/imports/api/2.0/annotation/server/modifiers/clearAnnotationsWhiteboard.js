import Annotations from '/imports/api/2.0/annotation';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function clearAnnotationsWhiteboard(meetingId, whiteboardId) {
  check(meetingId, String);
  check(whiteboardId, String);

  const selector = {
    meetingId,
    whiteboardId,
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Annotations2x from collection: ${err}`);
    }

    return Logger.info(`Removed Annotations2x where whiteboard=${whiteboardId}`);
  };

  return Annotations.remove(selector, cb);
}
