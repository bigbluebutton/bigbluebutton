import { check } from 'meteor/check';

import addVoiceUser from '../modifiers/addVoiceUser';

export default function handleJoinVoiceUser({ body }, meetingId) {
  const voiceUser = body;
  voiceUser.joined = true;

  check(meetingId, String);

  return addVoiceUser(meetingId, voiceUser);
}
