import { check } from 'meteor/check';

export default function handleBroadcastStartedVoice({ body }, meetingId) {
  check(meetingId, String);
  return meetingId;
}
