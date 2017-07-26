import { check } from 'meteor/check';
import clearVoiceUser from '../modifiers/clearVoiceUser';

export default function handleStoppedVoice({ body }, meetingId) {
  const { callerIdNum, screenshareConf } = body;

  check(meetingId, String);
  check(callerIdNum, String);
  check(screenshareConf, String);

  return clearVoiceUser(meetingId, screenshareConf, callerIdNum);
}
