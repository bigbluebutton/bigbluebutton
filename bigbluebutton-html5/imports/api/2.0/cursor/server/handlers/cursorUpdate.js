import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import updateCursor from '../modifiers/updateCursor';

export default function handleCursorUpdate({ header, body }) {  
  const meetingId = header.meetingId;
  const x = body.xPercent;
  const y = body.yPercent;

  check(meetingId, String);
  check(x, Number);
  check(y, Number);

  return updateCursor(meetingId, x, y);
}
