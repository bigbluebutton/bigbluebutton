import Cursor from '/imports/api/cursor/collection';
import { logger } from '/imports/startup/server/logger';

export function initializeCursor(meetingId) {
  return Cursor.upsert({
    meetingId: meetingId,
  }, {
    meetingId: meetingId,
    x: 0,
    y: 0,
  }, (err, numChanged) => {
    if (err) {
      return logger.error(`err upserting cursor for ${meetingId}`);
    } else {
      // logger.info "ok upserting cursor for #{meetingId}"
    }
  });
};
