import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import updateCursor from '../modifiers/updateCursor';

export default function handleCursorUpdate({ payload }) {
  const meetingId = payload.meeting_id;
  const x = payload.x_percent;
  const y = payload.y_percent;

  check(meetingId, String);
  check(x, Number);
  check(y, Number);

  return updateCursor(meetingId, x, y);
};
