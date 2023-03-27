import { check } from 'meteor/check';

import updateVoiceUser from '../modifiers/updateVoiceUser';

export default async function handleVoiceUpdate({ body }, meetingId) {
  const voiceUser = body;

  check(meetingId, String);

  const result = await updateVoiceUser(meetingId, voiceUser);
  return result;
}
