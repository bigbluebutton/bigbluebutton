import { check } from 'meteor/check';
import changeLockSettings from '../modifiers/changeLockSettings';

export default function handleLockSettingsInMeeting({ body }, meetingId) {

  return changeLockSettings(meetingId, body);
}
