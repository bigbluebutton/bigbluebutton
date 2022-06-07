import Logger from '/imports/startup/server/logger';
import Cursor from '/imports/api/cursor';
import { check } from 'meteor/check';

export default function updateCursor(meetingId, whiteboardId, userId, x = -1, y = -1) {
  check(meetingId, String);
  check(userId, String);
  check(x, Number);
  check(y, Number);

  const selector = {
    meetingId,
    whiteboardId,
    userId,
  };

  const modifier = {
    $set: {
      meetingId,
      whiteboardId,
      userId,
      x,
      y,
    },
  };

  try {
    const { insertedId } = Cursor.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Initialized cursor meeting=${meetingId}`);
    } else {
      Logger.debug('Updated cursor ', { meetingId });
    }
  } catch (err) {
    Logger.error(`Upserting cursor to collection: ${err}`);
  }
}
