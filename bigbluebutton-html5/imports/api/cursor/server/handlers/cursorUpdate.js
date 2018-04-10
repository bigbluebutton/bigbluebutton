import { check } from 'meteor/check';
import updateCursor from '../modifiers/updateCursor';

export default function handleCursorUpdate({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);
  const { whiteboardId, xPercent: x, yPercent: y } = body;

  check(whiteboardId, String);
  check(userId, String);
  check(x, Number);
  check(y, Number);

  return updateCursor(meetingId, whiteboardId, userId, x, y);
}
