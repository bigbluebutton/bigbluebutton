import Auth from '/imports/ui/services/auth';
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
  logger.info({ logCode: 'init_cursor_stream_listener' }, 'initCursorStreamListener called');

  /**
  * We create a promise to add the handlers after a ddp subscription stop.
  * The problem was caused because we add handlers to stream before the onStop event happens,
  * which set the handlers to undefined.
  */
  cursorStreamListener = new Meteor.Streamer(`cursor-${Auth.meetingID}`, { retransmit: false });

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
    logger.debug({ logCode: 'cursor_stream_handler_attach' }, 'Attaching handlers for cursor stream');

    cursorStreamListener.on('message', ({ cursors }) => {
      Object.keys(cursors).forEach((userId) => {
        if (Auth.userID === userId) return;
        updateCursor(userId, cursors[userId]);
      });
    });
  });
}

export default Cursor;
