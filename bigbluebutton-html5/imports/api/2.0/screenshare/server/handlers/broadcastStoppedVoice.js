import { check } from 'meteor/check';

export default function handleBroadcastStopped({ header, body }, meetingId) {
  check(meetingId, String);
  return meetingId;
}
