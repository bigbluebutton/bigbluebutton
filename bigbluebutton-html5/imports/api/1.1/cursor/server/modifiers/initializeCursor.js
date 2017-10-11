import Cursor from '/imports/api/2.0/cursor';
import updateCursor from './updateCursor';

export default function initializeCursor(meetingId) {
  check(meetingId, String);

  return updateCursor(meetingId, -1, -1);
}
