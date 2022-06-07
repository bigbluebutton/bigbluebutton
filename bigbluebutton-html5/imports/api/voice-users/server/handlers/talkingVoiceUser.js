import { check } from 'meteor/check';

import updateVoiceUser from '../modifiers/updateVoiceUser';

export default function handleVoiceUpdate({ body }, meetingId) {
  const voiceUser = body;

  check(meetingId, String);

  return updateVoiceUser(meetingId, voiceUser);
}
