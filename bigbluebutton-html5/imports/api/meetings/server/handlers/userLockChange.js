import changeUserLock from '../modifiers/changeUserLock';

export default async function handleLockSettingsInMeeting({ body }, meetingId) {
  await changeUserLock(meetingId, body);
}
