import { check } from 'meteor/check';

import removeVoiceUser from '../modifiers/removeVoiceUser';

export default function handleVoiceUpdate({ body }, meetingId) {
  const voiceUser = body;

  check(meetingId, String);

  return removeVoiceUser(meetingId, voiceUser);
}
