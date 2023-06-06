import Annotations from '/imports/api/annotations';
import Logger from '/imports/startup/server/logger';

export default async function clearAnnotations(meetingId, whiteboardId, userId) {
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

  try {
    const numberAffected = await Annotations.removeAsync(selector);

    if (numberAffected) {
      if (userId) {
        Logger.info(`Cleared Annotations for userId=${userId} where whiteboard=${whiteboardId}`);
        return;
      }

      if (whiteboardId) {
        Logger.info(`Cleared Annotations for whiteboard=${whiteboardId}`);
        return;
      }

      if (meetingId) {
        Logger.info(`Cleared Annotations (${meetingId})`);
        return;
      }

      Logger.info('Cleared Annotations (all)');
    }
  } catch (err) {
    Logger.error(`Removing Annotations from collection: ${err}`);
  }
}
