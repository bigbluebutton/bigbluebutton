import { check } from 'meteor/check';
import clearBroadcast from '../modifiers/clearBroadcast';

export default function handleBroadcastStartedVoice({ body }, meetingId) {
  check(meetingId, String);

  const { screenshareConf } = body;

  return clearBroadcast(meetingId, screenshareConf);
}
