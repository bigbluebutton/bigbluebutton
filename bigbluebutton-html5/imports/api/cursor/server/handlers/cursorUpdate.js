import { check } from 'meteor/check';
import { CursorStreamer } from '/imports/api/cursor';

const CURSOR_PROCCESS_INTERVAL = 30;

let cursorQueue = [];
let cursorRecieverIsRunning = false;

const proccess = () => {
  if (!Object.keys(cursorQueue).length) {
    cursorRecieverIsRunning = false;
    return;
  }
  cursorRecieverIsRunning = true;
  
  Object.keys(cursorQueue).forEach(meetingId => {
    CursorStreamer.emit('message', { meetingId, cursors: cursorQueue[meetingId] });
  });
  cursorQueue = {};

  Meteor.setTimeout(proccess, CURSOR_PROCCESS_INTERVAL);
};

export default function handleCursorUpdate({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);

  check(meetingId, String);
  check(userId, String);

  if(!cursorQueue.hasOwnProperty(meetingId)) {
    cursorQueue[meetingId] = {};
  }
  // overwrite since we dont care about the other positions
  cursorQueue[meetingId][userId] = body;
  if (!cursorRecieverIsRunning) proccess();
}
