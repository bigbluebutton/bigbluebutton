import { check } from 'meteor/check';
import changeUserLock from '../modifiers/changeUserLock';

export default function handleLockSettingsInMeeting({ body }, meetingId) {

  return changeUserLock(meetingId, body);
}