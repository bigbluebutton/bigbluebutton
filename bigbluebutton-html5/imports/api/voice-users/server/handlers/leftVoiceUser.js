import { check } from 'meteor/check';

import removeVoiceUser from '/imports/api/voice-users/server/modifiers/removeVoiceUser';
import removeUser from '/imports/api/users/server/modifiers/removeUser';
import Users from '/imports/api/users';

export default async function handleVoiceUpdate({ body }, meetingId) {
  const voiceUser = body;

  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    intId: String,
    voiceUserId: String,
  });

  const {
    intId,
    voiceUserId,
  } = voiceUser;

  const isDialInUser = async (userId, meetingID) => {
    const user = await Users.findOneAsync({ meetingId: meetingID, userId, clientType: 'dial-in-user' });
    return !!user;
  };

  // if the user is dial-in, leaving voice also means leaving userlist
  if (await isDialInUser(voiceUserId, meetingId)) removeUser(voiceUser, meetingId);

  const result = await removeVoiceUser(meetingId, voiceUser);
  return result;
}
