import Annotations from '/imports/api/annotations';
import Logger from '/imports/startup/server/logger';

export default function clearAnnotations(meetingId, whiteboardId, userId) {
  const selector = {};

  if (meetingId) {
    selector.meetingId = meetingId;
  }

  if (whiteboardId) {
    selector.whiteboardId = whiteboardId;
  }

  if (userId) {
    selector.userId = userId;
  }

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Annotations from collection: ${err}`);
    }

    if (userId) {
      return Logger.info(`Cleared Annotations for userId=${userId} where whiteboard=${whiteboardId}`);
    }

    if (whiteboardId) {
      return Logger.info(`Cleared Annotations for whiteboard=${whiteboardId}`);
    }

    if (meetingId) {
      return Logger.info(`Cleared Annotations (${meetingId})`);
    }

    return Logger.info('Cleared Annotations (all)');
  };

  return Annotations.remove(selector, cb);
}
