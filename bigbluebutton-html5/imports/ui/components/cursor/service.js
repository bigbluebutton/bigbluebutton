import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { CursorStreamer } from '/imports/api/cursor';
import { throttle } from 'lodash';

const Cursor = new Mongo.Collection(null);

function updateCursor(meetingId, userId, x = -1, y = -1) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      userId,
      meetingId,
      x,
      y,
    },
  };

	return Cursor.upsert(selector, modifier);
}

CursorStreamer.on('message', ({ meetingId, cursors }) => {
  Object.keys(cursors).forEach(userId => {
    if (Auth.meetingID === meetingId && Auth.userID === userId) return;
    updateCursor(meetingId, userId, cursors[userId].x, cursors[userId].y);
  });
});

const throttledEmit = throttle(CursorStreamer.emit.bind(CursorStreamer), 30, { 'trailing': false });

export function publishCursorUpdate(x, y) {
  throttledEmit('publish', {
		credentials: Auth.credentials,
		payload: {
      xPercent: x,
      yPercent: y,
    },
	});

  return updateCursor(Auth.meetingID, Auth.userID, x, y);
}

export default Cursor;
