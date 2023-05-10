import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { throttle } from 'lodash';
import logger from '/imports/startup/client/logger';

const { cursorInterval: CURSOR_INTERVAL } = Meteor.settings.public.whiteboard;

const Cursor = new Mongo.Collection(null);
let cursorStreamListener = null;

export const clearCursors = () => {
  Cursor.remove({});
};

const updateCursor = (userId, payload) => {
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
};

const publishCursorUpdate = throttle((payload) => {
  if (cursorStreamListener) {
    cursorStreamListener.emit.bind(cursorStreamListener)('publish', payload);
  }

  return updateCursor(Auth.userID, payload);
}, CURSOR_INTERVAL);

export const initCursorStreamListener = () => {
  logger.info({
    logCode: 'init_cursor_stream_listener',
    extraInfo: { meetingId: Auth.meetingID, userId: Auth.userID },
  }, 'initCursorStreamListener called');

  /**
  * We create a promise to add the handlers after a ddp subscription stop.
  * The problem was caused because we add handlers to stream before the onStop event happens,
  * which set the handlers to undefined.
  */
  cursorStreamListener = new Meteor.Streamer(`cursor-${Auth.meetingID}`, { retransmit: false });

  const startStreamHandlersPromise = new Promise((resolve) => {
    const checkStreamHandlersInterval = setInterval(() => {
      const streamHandlersSize = Object.values(Meteor.StreamerCentral.instances[`cursor-${Auth.meetingID}`].handlers)
        .filter((el) => el !== undefined)
        .length;

      if (!streamHandlersSize) {
        resolve(clearInterval(checkStreamHandlersInterval));
      }
    }, 250);
  });

  startStreamHandlersPromise.then(() => {
    logger.debug({ logCode: 'cursor_stream_handler_attach' }, 'Attaching handlers for cursor stream');

    cursorStreamListener.on('message', ({ cursors }) => {
      Object.keys(cursors).forEach((cursorId) => {
        const cursor = cursors[cursorId];
        const { userId } = cursor;
        delete cursor.userId;
        if (Auth.userID === userId) return;
        updateCursor(userId, cursor);
      });
    });
  });
};

const getCurrentCursors = (whiteboardId) => {
  const selector = { whiteboardId };
  const filter = {};
  const cursors = Cursor.find(selector, filter).fetch();
  return cursors.reduce((result, cursor) => {
    const { userId } = cursor;
    const user = Users.findOne(
      { userId },
      {
        fields: {
          name: 1, presenter: 1, userId: 1, role: 1,
        },
      },
    );
    if (user) {
      const newCursor = cursor;
      newCursor.userName = user.name;
      newCursor.userId = user.userId;
      newCursor.role = user.role;
      newCursor.presenter = user.presenter;
      result.push(newCursor);
    }
    return result;
  }, []);
};

export default {
  getCurrentCursors,
  publishCursorUpdate,
};
