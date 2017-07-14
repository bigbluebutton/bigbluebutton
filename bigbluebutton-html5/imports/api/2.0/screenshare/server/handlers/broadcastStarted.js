import { check } from 'meteor/check';
import addBroadcast from '../modifiers/addBroadcast';

export default function handleBroadcastStartedVoice({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  return addBroadcast(meetingId, body);
}
