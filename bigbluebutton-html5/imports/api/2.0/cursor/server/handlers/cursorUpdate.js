import { check } from 'meteor/check';
import updateCursor from '../modifiers/updateCursor';

export default function handleCursorUpdate({ header, body }) {  
  const meetingId = header.meetingId;
  const userId = header.userId;
  const x = body.xPercent;
  const y = body.yPercent;

  check(meetingId, String);
  check(userId, String);
  check(x, Number);
  check(y, Number);

  return updateCursor(meetingId, userId, x, y);
}
