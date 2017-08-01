import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';
import addVoiceUser from '/imports/api/2.0/voice-users/server/modifiers/addVoiceUser';

export default function addUser(meetingId, user) {
  check(user, Object);
  check(meetingId, String);

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

  if (dummyUser &&
    dummyUser.clientType === 'HTML5' &&
    user.role === ROLE_MODERATOR &&
    !ALLOW_HTML5_MODERATOR) {
    user.role = ROLE_VIEWER;
  }

  let userRoles = [];

  userRoles.push(
    'viewer',
    user.presenter ? 'presenter' : false,
    user.role === 'MODERATOR' ? 'moderator' : false,
  );

  userRoles = userRoles.filter(Boolean);

  const modifier = {
    $set: {
      meetingId,
      userId,
      'user.connection_status': 'online',
      'user.userid': userId,
      'user.extId': user.extId,
      'user.role': user.role,
      'user.roles': userRoles,
      'user.name': user.name,
      'user._sort_name': user.name.trim().toLowerCase(),
      'user.avatarURL': user.avatar,
      'user.set_emoji_time': user.set_emoji_time || (new Date()).getTime(),
      'user.joiningTime': (new Date()).getTime(),
      'user.emoji': user.emoji,
      'user.presenter': user.presenter,
      'user.locked': user.locked,
      'user.listenOnly': user.listenOnly,
    },
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
