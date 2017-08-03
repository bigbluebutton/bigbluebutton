import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';
import flat from 'flat';
import addVoiceUser from '/imports/api/2.0/voice-users/server/modifiers/addVoiceUser';

export default function addUser(meetingId, user) {
  check(meetingId, String);

  check(user, {
    intId: String,
    extId: String,
    name: String,
    role: String,
    guest: Boolean,
    authed: Boolean,
    waitingForAcceptance: Boolean,
    emoji: String,
    presenter: Boolean,
    locked: Boolean,
    avatar: String,
  });

  const userId = user.intId;
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_MODERATOR = USER_CONFIG.role_moderator;
  const ROLE_VIEWER = USER_CONFIG.role_viewer;
  const APP_CONFIG = Meteor.settings.public.app;
  const ALLOW_HTML5_MODERATOR = APP_CONFIG.allowHTML5Moderator;

  // override moderator status of html5 client users, depending on a system flag
  const dummyUser = Users.findOne(selector);
  let userRole = user.role;

  if (
    dummyUser &&
    dummyUser.clientType === 'HTML5' &&
    userRole === ROLE_MODERATOR &&
    !ALLOW_HTML5_MODERATOR
  ) {
    userRole = ROLE_VIEWER;
  }

  const userRoles = [
    'viewer',
    user.presenter ? 'presenter' : false,
    userRole === ROLE_MODERATOR ? 'moderator' : false,
  ].filter(Boolean);

  const modifier = {
    $set: Object.assign(
      {
        meetingId,
        connectionStatus: 'online',
        roles: userRoles,
        sortName: user.name.trim().toLowerCase(),
      },
      flat(user),
    ),
  };

  addVoiceUser(meetingId, {
    voiceUserId: '',
    intId: userId,
    callerName: user.name,
    callerNum: '',
    muted: false,
    talking: false,
    callingWith: '',
    listenOnly: false,
    voiceConf: '',
  });

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding user to collection: ${err}`);
    }

    // TODO: Do we really need to request the stun/turn everytime?
    // requestStunTurn(meetingId, userId);

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added user id=${userId} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted user id=${userId} meeting=${meetingId}`);
  };

  return Users.upsert(selector, modifier, cb);
}
