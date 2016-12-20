import Cursor from '/imports/api/cursor';
import updateCursor from './updateCursor';

export default function initializeCursor(meetingId) {
  check(meetingId, String);

  return updateCursor(meetingId, 0, 0);
};
