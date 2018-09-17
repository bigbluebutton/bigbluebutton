import { check } from 'meteor/check';
import Users from '/imports/api/users';
import addDialInUser from '/imports/api/users/server/modifiers/addDialInUser';
import addVoiceUser from '../modifiers/addVoiceUser';


export default function handleJoinVoiceUser({ body }, meetingId) {
  const voiceUser = body;
  voiceUser.joined = true;

  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    intId: String,
    voiceUserId: String,
    callerName: String,
    callerNum: String,
    muted: Boolean,
    talking: Boolean,
    callingWith: String,
    listenOnly: Boolean,
    joined: Boolean,
  });

  const {
    intId,
  } = voiceUser;

  const User = Users.findOne({
    meetingId,
    intId,
    connectionStatus: 'online',
  });

  if (!User) {
    /* voice-only user - called into the conference */
    addDialInUser(meetingId, voiceUser);
  }

  return addVoiceUser(meetingId, voiceUser);
}
