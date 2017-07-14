import { check } from 'meteor/check';
import clearVoiceUser from '../modifiers/clearVoiceUser';

export default function handleStoppedVoice({ body }, meetingId) {
  check(meetingId, String);

  const { callerIdNum } = body;
  const { screenshareConf } = body;

  check(callerIdNum, String);

  return clearVoiceUser(meetingId, screenshareConf, callerIdNum);
}
