import { check } from 'meteor/check';

import updateVoiceUser from '../modifiers/updateVoiceUser';

export default function handleVoiceUpdate({ body }, meetingId) {
  const user = body;

  check(user, Object);
  console.error(user);
  return updateVoiceUser(meetingId, user);
}
