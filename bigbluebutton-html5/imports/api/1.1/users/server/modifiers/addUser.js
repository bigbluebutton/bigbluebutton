import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import Users from './../../';

import requestStunTurn from '../methods/requestStunTurn';

export default function addUser(meetingId, user) {
  check(user, Object);
  check(meetingId, String);

  const userId = user.userid;
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

  const userRoles = [];
  userRoles.push('viewer');
  userRoles.push(user.presenter ? 'presenter' : undefined);
  userRoles.push(user.role === 'MODERATOR' ? 'moderator' : undefined);

  const modifier = {
    $set: {
      meetingId,
      userId,
      'user.connection_status': 'online',
      'user.userid': userId,
      'user.extern_userid': user.extern_userid,
      'user.role': user.role,
      'user.roles': userRoles,
      'user.name': user.name,
      'user._sort_name': user.name.trim().toLowerCase(),
      'user.avatarURL': user.avatarURL,
      'user.set_emoji_time': user.set_emoji_time || (new Date()).getTime(),
      'user.time_of_joining': (new Date()).getTime(),
      'user.emoji_status': user.emoji_status,
      'user.webcam_stream': user.webcam_stream,
      'user.presenter': user.presenter,
      'user.locked': user.locked,
      'user.phone_user': user.phone_user,
      'user.listenOnly': user.listenOnly,
      'user.has_stream': user.has_stream,
      'user.voiceUser.web_userid': user.voiceUser.web_userid,
      'user.voiceUser.callernum': user.voiceUser.callernum,
      'user.voiceUser.userid': user.voiceUser.userid,
      'user.voiceUser.talking': user.voiceUser.talking,
      'user.voiceUser.joined': user.voiceUser.joined,
      'user.voiceUser.callername': user.voiceUser.callername,
      'user.voiceUser.locked': user.voiceUser.locked,
      'user.voiceUser.muted': user.voiceUser.muted,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding user to collection: ${err}`);
    }

    // TODO: Do we really need to request the stun/turn everytime?
    requestStunTurn(meetingId, userId);

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added user id=${userId} meeting=${meetingId}`);
    }

    if (numChanged) {
      return Logger.info(`Upserted user id=${userId} meeting=${meetingId}`);
    }
  };

  return Users.upsert(selector, modifier, cb);
}
