import { check } from 'meteor/check';
import CursorStreamer from '/imports/api/cursor/server/streamer';
import Logger from '/imports/startup/server/logger';
import _ from 'lodash';

const { streamerLog } = Meteor.settings.private.serverLog;

const CURSOR_PROCCESS_INTERVAL = 30;

const cursorQueue = {};

const proccess = _.throttle(() => {
  try {
    Object.keys(cursorQueue).forEach((meetingId) => {
      try {
        const cursors = cursorQueue[meetingId];
        delete cursorQueue[meetingId];
        CursorStreamer(meetingId).emit('message', { meetingId, cursors });

        // if (streamerLog) {
        //   Logger.debug('CursorUpdate process has finished', { meetingId });
        // }
      } catch (error) {
        Logger.error(`Error while trying to send cursor streamer data for meeting ${meetingId}. ${error}`);
      }
    });
  } catch (error) {
    Logger.error(`Error while processing cursor queue. ${error}`);
  }
}, CURSOR_PROCCESS_INTERVAL);

export default function handleCursorUpdate({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);

  check(meetingId, String);
  check(userId, String);

  if (!cursorQueue[meetingId]) {
    cursorQueue[meetingId] = {};
  }

  // overwrite since we dont care about the other positions
  cursorQueue[meetingId][userId] = body;

  proccess();
}
