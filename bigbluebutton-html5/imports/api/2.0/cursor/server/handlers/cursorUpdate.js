import { check } from 'meteor/check';
import updateCursor from '../modifiers/updateCursor';

export default function handleCursorUpdate({ header, body }, meetingId) {
  const userId = header.userId;
  const x = body.xPercent;
  const y = body.yPercent;

  check(userId, String);
  check(x, Number);
  check(y, Number);

  return updateCursor(meetingId, userId, x, y);
}
