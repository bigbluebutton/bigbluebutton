import { check } from 'meteor/check';
import addScreenshare from '../modifiers/addScreenshare';

export default function handleBroadcastStartedVoice({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  return addScreenshare(meetingId, body);
}
