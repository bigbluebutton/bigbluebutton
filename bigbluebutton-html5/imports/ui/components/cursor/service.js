import Auth from '/imports/ui/services/auth';
import { throttle } from 'lodash';

const Cursor = new Mongo.Collection(null);
let cursorStreamListener = null;

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

export function publishCursorUpdate(payload) {
  if (cursorStreamListener) {
    const throttledEmit = throttle(cursorStreamListener.emit.bind(cursorStreamListener), 30, { trailing: true });

    throttledEmit('publish', {
      credentials: Auth.credentials,
      payload,
    });
  }

  return updateCursor(Auth.userID, payload);
}

export function initCursorStreamListener() {
  if (!cursorStreamListener) {
    cursorStreamListener = new Meteor.Streamer(`cursor-${Auth.meetingID}`, { retransmit: false });

    cursorStreamListener.on('message', ({ cursors }) => {
      Object.keys(cursors).forEach((userId) => {
        if (Auth.userID === userId) return;
        updateCursor(userId, cursors[userId]);
      });
    });
  }
}

export default Cursor;
