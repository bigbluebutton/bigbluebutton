import { check } from 'meteor/check';
import Users from '/imports/api/users';
import addDialInUser from '/imports/api/users/server/modifiers/addDialInUser';
import addVoiceUser from '../modifiers/addVoiceUser';

export default async function handleJoinVoiceUser({ body }, meetingId) {
  const voiceUser = body;
  voiceUser.joined = true;

  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    intId: String,
    voiceUserId: String,
    callerName: String,
    callerNum: String,
    color: String,
    muted: Boolean,
    talking: Boolean,
    callingWith: String,
    listenOnly: Boolean,
    joined: Boolean,
  });

  const {
    intId,
  } = voiceUser;

  const User = await Users.findOneAsync({
    meetingId,
    intId,
  });

  if (!User) {
    /* voice-only user - called into the conference */
    await addDialInUser(meetingId, voiceUser);
  }

  const result = await addVoiceUser(meetingId, voiceUser);
  return result;
}
