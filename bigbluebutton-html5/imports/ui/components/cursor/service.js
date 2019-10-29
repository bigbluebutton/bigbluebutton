import Auth from '/imports/ui/services/auth';
import { CursorStreamer } from '/imports/api/cursor';
import { throttle } from 'lodash';

const Cursor = new Mongo.Collection(null);

function updateCursor(userId, payload) {
  const selector = {
    userId,
    whiteboardId: payload.whiteboardId,
  };

  const modifier = {
    $set: {
      userId,
      ...payload,
    },
  };

  return Cursor.upsert(selector, modifier);
}

CursorStreamer.on('message', ({ meetingID, cursors }) => {
  Object.keys(cursors).forEach((userId) => {
    if (Auth.userID === userId) return;
    updateCursor(userId, cursors[userId]);
  });
});

const throttledEmit = throttle(CursorStreamer.emit.bind(CursorStreamer), 30, { trailing: true });

export function publishCursorUpdate(payload) {
  throttledEmit('publish', {
    credentials: Auth.credentials,
    payload,
  });

  return updateCursor(Auth.userID, payload);
}

export default Cursor;
