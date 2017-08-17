import Annotations from '/imports/api/2.0/annotations';
import Logger from '/imports/startup/server/logger';

export default function clearAnnotations(meetingId, whiteboardId, userId, fullClear) {
  const selector = {};

  if (meetingId) {
    selector.meetingId = meetingId;
  }

  if (whiteboardId) {
    selector.whiteboardId = whiteboardId;
  }

  if (!fullClear && userId) {
    selector.userId = userId;
  }

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Shapes2x from collection: ${err}`);
    }

    if (!meetingId) {
      return Logger.info('Cleared Annotations (all)');
    }

    if (!fullClear) {
      return Logger.info(`Removed Shapes2x for userId=${userId} where whiteboard=${whiteboardId}`);
    }

    return Logger.info(`Removed Shapes2x where whiteboard=${whiteboardId}`);
  };

  return Annotations.remove(selector, cb);
}
