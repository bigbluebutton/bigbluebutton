import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { CursorStreamer } from '/imports/api/cursor';
import { throttle } from 'lodash';

const Cursor = new Mongo.Collection(null);

function updateCursor(meetingId, userId, payload) {
  const selector = {
    meetingId,
    userId,
    whiteboardId: payload.whiteboardId,
  };

  const modifier = {
    $set: {
      userId,
      meetingId,
      ...payload,
    },
  };

  return Cursor.upsert(selector, modifier);
}

CursorStreamer.on('message', ({ meetingId, cursors }) => {
  Object.keys(cursors).forEach((userId) => {
    if (Auth.meetingID === meetingId && Auth.userID === userId) return;
    updateCursor(meetingId, userId, cursors[userId]);
  });
});

const throttledEmit = throttle(CursorStreamer.emit.bind(CursorStreamer), 30, { trailing: true });

export function publishCursorUpdate(payload) {
  throttledEmit('publish', {
    credentials: Auth.credentials,
    payload,
  });

  return updateCursor(Auth.meetingID, Auth.userID, payload);
}

export default Cursor;
