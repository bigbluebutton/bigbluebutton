import changeUserLock from '../modifiers/changeUserLock';

export default function handleLockSettingsInMeeting({ body }, meetingId) {
  changeUserLock(meetingId, body);
}
