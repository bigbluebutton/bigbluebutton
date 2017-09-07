import { check } from 'meteor/check';
import changeUserLock from '../modifiers/changeUserLock';

export default function handleLockSettingsInMeeting({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  return changeUserLock(meetingId, body);
}
