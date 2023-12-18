import changeLockSettings from '../modifiers/changeLockSettings';

export default async function handleLockSettingsInMeeting({ body }, meetingId) {
  await changeLockSettings(meetingId, body);
}
