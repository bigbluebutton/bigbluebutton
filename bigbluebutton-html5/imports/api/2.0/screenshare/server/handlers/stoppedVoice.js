import { check } from 'meteor/check';

export default function handleStoppedVoice({ body }, meetingId) {
  check(meetingId, String);
  return meetingId;
}
