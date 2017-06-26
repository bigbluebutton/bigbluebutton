import { check } from 'meteor/check';

import updateVoiceUser from '../modifiers/updateVoiceUser';

export default function handleVoiceUpdate({ body, header }) {
  const meetingId = header.meetingId;
  const user = body;

  check(meetingId, String);
  check(user, Object);

  return updateVoiceUser(meetingId, user);
}
