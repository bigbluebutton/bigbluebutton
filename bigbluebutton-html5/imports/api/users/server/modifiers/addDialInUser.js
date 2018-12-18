import { check } from 'meteor/check';
import addUser from '/imports/api/users/server/modifiers/addUser';


export default function addDialInUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, Object);

  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_VIEWER = USER_CONFIG.role_viewer;

  const { intId, callerName } = voiceUser;

  const voiceOnlyUser = {
    intId,
    extId: intId, // TODO
    name: callerName,
    role: ROLE_VIEWER.toLowerCase(),
    guest: false,
    authed: true,
    waitingForAcceptance: false,
    guestStatus: 'ALLOW',
    emoji: 'none',
    presenter: false,
    locked: false, // TODO
    avatar: '',
    clientType: 'dial-in-user',
  };

  return addUser(meetingId, voiceOnlyUser);
}
