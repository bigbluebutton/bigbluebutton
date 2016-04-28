import { Cursor } from '/collections/collections';
import { logger } from '/server/server.js';

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

export function updateCursorLocation(meetingId, cursorObject) {
  return Cursor.update({
    meetingId: meetingId,
  }, {
    $set: {
      x: cursorObject.x,
      y: cursorObject.y,
    },
  }, (err, numChanged) => {
    if (err != null) {
      return logger.error(`_unsucc update of cursor for ${meetingId} ${JSON.stringify(cursorObject)} err=${JSON.stringify(err)}`);
    } else {
      // logger.info "updated cursor for #{meetingId} #{JSON.stringify cursorObject}"
    }
  });
};

// called on server start and meeting end
export function clearCursorCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Cursor.remove({
      meetingId: meetingId,
    }, () => {
      return logger.info(`cleared Cursor Collection (meetingId: ${meetingId})!`);
    });
  } else {
    return Cursor.remove({}, () => {
      return logger.info('cleared Cursor Collection (all meetings)!');
    });
  }
};
