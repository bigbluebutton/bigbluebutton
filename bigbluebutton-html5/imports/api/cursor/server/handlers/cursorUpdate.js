import { check } from 'meteor/check';
import CursorStreamer from '/imports/api/cursor/server/streamer';
import Logger from '/imports/startup/server/logger';


const { streamerLog } = Meteor.settings.private.serverLog;

const CURSOR_PROCCESS_INTERVAL = 30;

let cursorQueue = {};
let cursorReceiverIsRunning = false;

const proccess = () => {
  if (!Object.keys(cursorQueue).length) {
    cursorReceiverIsRunning = false;
    return;
  }
  cursorReceiverIsRunning = true;

  try {
    Object.keys(cursorQueue).forEach((meetingId) => {
      CursorStreamer(meetingId).emit('message', { meetingId, cursors: cursorQueue[meetingId] });
    });
    cursorQueue = {};

    Meteor.setTimeout(proccess, CURSOR_PROCCESS_INTERVAL);
  } catch (error) {
    Logger.error(`Error while trying to send cursor streamer data. ${error}`);
    cursorReceiverIsRunning = false;
  }
};

export default function handleCursorUpdate({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);

  check(meetingId, String);
  check(userId, String);

  if (!cursorQueue.hasOwnProperty(meetingId)) {
    cursorQueue[meetingId] = {};
  }

  if (streamerLog) {
    Logger.debug(`CursorUpdate process for meeting ${meetingId} is running: ${cursorReceiverIsRunning}`);
  }

  // overwrite since we dont care about the other positions
  cursorQueue[meetingId][userId] = body;
  if (!cursorReceiverIsRunning) proccess();
}
