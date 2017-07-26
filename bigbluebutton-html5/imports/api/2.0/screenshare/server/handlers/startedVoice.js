import { check } from 'meteor/check';
import addVoiceUser from '../modifiers/addVoiceUser';

export default function handleStartedVoice({ body }, meetingId) {
  const { screenshareConf } = body;

  check(meetingId, String);
  check(screenshareConf, String);

  return addVoiceUser(meetingId, screenshareConf, body);
}
