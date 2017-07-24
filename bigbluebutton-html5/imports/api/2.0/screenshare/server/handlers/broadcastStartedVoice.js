import { check } from 'meteor/check';

export default function handleBroadcastStarted({ body }, meetingId) {
  check(meetingId, String);
  return meetingId;
}
