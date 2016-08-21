import Cursor from '/imports/api/cursor';
import { logger } from '/imports/startup/server/logger';

export function updateCursorLocation(meetingId, cursorObject) {
  return Cursor.upsert({
    meetingId: meetingId,
  }, {
    $set: {
      meetingId: meetingId,
      x: cursorObject.x,
      y: cursorObject.y,
    },
  }, (err, numChanged) => {
    if (err != null) {
      return logger.error(`_unsucc update of cursor for ${meetingId} err=${JSON.stringify(err)}`);
    }

  });
};
