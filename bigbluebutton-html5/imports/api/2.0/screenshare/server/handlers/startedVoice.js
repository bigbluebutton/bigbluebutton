import { check } from 'meteor/check';
import addVoiceUser from '../modifiers/addVoiceUser';

export default function handleStartedVoice({ body }, meetingId) {
  check(meetingId, String);

  const { screenshareConf } = body;

  check(screenshareConf, String);

  return addVoiceUser(meetingId, screenshareConf, body);
}
