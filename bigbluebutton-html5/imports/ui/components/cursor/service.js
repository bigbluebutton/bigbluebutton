import Auth from '/imports/ui/services/auth';
import { whiteboardConnection } from '/imports/ui/components/app/service';
import { throttle } from 'lodash';
import logger from '/imports/startup/client/logger';

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
      userId: Auth.userID,
      payload,
    });
  }

  return updateCursor(Auth.userID, payload);
}

export function initCursorStreamListener() {
  logger.info({
    logCode: 'init_cursor_stream_listener',
    extraInfo: { meetingId: Auth.meetingID, userId: Auth.userID },
  }, 'initCursorStreamListener called');

  if (Meteor.settings.public.role) {
    cursorStreamListener = new Meteor.Streamer(`cursor-${Auth.meetingID}`, { ddpConnection: whiteboardConnection });
  } else {
    cursorStreamListener = new Meteor.Streamer(`cursor-${Auth.meetingID}`);
  }

  const startStreamHandlersPromise = new Promise((resolve) => {
    const checkStreamHandlersInterval = setInterval(() => {
      const streamHandlersSize = Object.values(Meteor.StreamerCentral.instances[`cursor-${Auth.meetingID}`].handlers)
        .filter(el => el != undefined)
        .length;

      if (!streamHandlersSize) {
        resolve(clearInterval(checkStreamHandlersInterval));
      }
    }, 250);
  });

  startStreamHandlersPromise.then(() => {
    logger.debug({
      logCode: 'init_cursor_stream_listener',
    }, 'initCursorStreamListener called');

    cursorStreamListener.on('message', ({ cursors }) => {
      Object.keys(cursors).forEach((userId) => {
        if (Auth.userID === userId) return;
        updateCursor(userId, cursors[userId]);
      });
    });
  });
}

export default Cursor;
