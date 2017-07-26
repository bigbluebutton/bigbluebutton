import { check } from 'meteor/check';
import clearBroadcast from '../modifiers/clearBroadcast';

export default function handleBroadcastStartedVoice({ body }, meetingId) {
  const { screenshareConf } = body;

  check(meetingId, String);
  check(screenshareConf, String);

  return clearBroadcast(meetingId, screenshareConf);
}
