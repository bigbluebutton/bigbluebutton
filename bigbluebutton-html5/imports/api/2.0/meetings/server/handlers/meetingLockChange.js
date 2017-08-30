import { check } from 'meteor/check';
import ChangeLockSettings from '../modifiers/changeLockSettings';

export default function handleLockSettingsInMeeting({ body }, meetingId) {
  check(meetingId, String);

  return ChangeLockSettings(meetingId, body);
}