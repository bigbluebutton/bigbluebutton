import { check } from 'meteor/check';

import removeVoiceUser from '/imports/api/voice-users/server/modifiers/removeVoiceUser';
import removeUser from '/imports/api/users/server/modifiers/removeUser';

export default function handleVoiceUpdate({ body }, meetingId) {
  const voiceUser = body;

  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    intId: String,
    voiceUserId: String,
  });

  const { intId, voiceUserId } = voiceUser;

  const isDialInUser = (voiceUserId) => {
    return voiceUserId && (voiceUserId[0] == 'v');
  }

  // if the user is dial-in, leaving voice also means leaving userlist
  if(isDialInUser(voiceUserId)) removeUser(meetingId, intId);

  return removeVoiceUser(meetingId, voiceUser);
}
