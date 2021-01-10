import changeLockSettings from '../modifiers/changeLockSettings';

export default function handleLockSettingsInMeeting({ body }, meetingId) {
  changeLockSettings(meetingId, body);
}
