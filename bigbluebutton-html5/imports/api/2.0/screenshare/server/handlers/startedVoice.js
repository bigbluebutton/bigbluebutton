import { check } from 'meteor/check';

export default function handleStartedVoice({ body }, meetingId) {
  check(meetingId, String);
  return meetingId;
}
