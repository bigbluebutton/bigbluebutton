import Cursor from '/imports/api/1.1/cursor';
import updateCursor from './updateCursor';

export default function initializeCursor(meetingId) {
  check(meetingId, String);

  return updateCursor(meetingId, 0, 0);
}
