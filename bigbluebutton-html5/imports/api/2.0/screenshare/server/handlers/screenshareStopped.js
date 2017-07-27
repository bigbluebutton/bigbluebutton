import { check } from 'meteor/check';
import clearScreenshare from '../modifiers/clearScreenshare';

export default function handleBroadcastStartedVoice({ body }, meetingId) {
  const { screenshareConf } = body;

  check(meetingId, String);
  check(screenshareConf, String);

  return clearScreenshare(meetingId, screenshareConf);
}
