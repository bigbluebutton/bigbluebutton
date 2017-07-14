import { check } from 'meteor/check';

export default function handleBroadcastStoppedVoice({ body }, meetingId) {
  check(meetingId, String);
  return meetingId;
}
