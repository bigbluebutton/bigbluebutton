import { check } from 'meteor/check';
import Users from '/imports/api/users';
import addUser from '/imports/api/users/server/modifiers/addUser';
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
    callerName,
  } = voiceUser;

  const User = Users.findOne({
    meetingId,
    intId,
    connectionStatus: 'online',
  });

  if (!User) {
    /* voice-only user - called into the conference */

    const USER_CONFIG = Meteor.settings.public.user;
    const ROLE_VIEWER = USER_CONFIG.role_viewer;

    const voiceOnlyUser = { // web (Users) representation of dial-in user
      intId,
      extId: intId, // TODO
      name: callerName,
      role: ROLE_VIEWER.toLowerCase(),
      guest: false,
      authed: true,
      waitingForAcceptance: false,
      emoji: 'none',
      presenter: false,
      locked: false, // TODO
      avatar: 'https://bbb-joao.dev.imdt.com.br/client/avatar.png',
      clientType: 'dial-in-user',
    };

    addUser(meetingId, voiceOnlyUser);
  }

  return addVoiceUser(meetingId, voiceUser);
}
