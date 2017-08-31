import { check } from 'meteor/check';
import changeLockSettings from '../modifiers/changeLockSettings';

export default function handleLockSettingsInMeeting({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  return changeLockSettings(meetingId, body);
}
