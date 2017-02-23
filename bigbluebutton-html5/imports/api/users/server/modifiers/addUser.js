import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';

import addChat from '/imports/api/chat/server/modifiers/addChat';
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

  const modifier = {
    $set: {
      meetingId,
      userId,
      'user.connection_status': 'online',
      'user.userid': userId,
      'user.extern_userid': user.extern_userid,
      'user.role': user.role,
      'user.name': user.name,
      'user._sort_name': user.name.trim().toLowerCase(),
      'user.avatarURL': user.avatarURL,
      'user.set_emoji_time': user.set_emoji_time || new Date(),
      'user.time_of_joining': new Date(),
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
      addWelcomeChatMessage(meetingId, userId);
      return Logger.info(`Added user id=${userId} meeting=${meetingId}`);
    }

    if (numChanged) {
      return Logger.info(`Upserted user id=${userId} meeting=${meetingId}`);
    }
  };

  return Users.upsert(selector, modifier, cb);
};

const addWelcomeChatMessage = (meetingId, userId) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const CHAT_CONFIG = Meteor.settings.public.chat;

  const Meeting = Meetings.findOne({ meetingId });

  let welcomeMessage = APP_CONFIG.defaultWelcomeMessage
      .concat(APP_CONFIG.defaultWelcomeMessageFooter)
      .replace(/%%CONFNAME%%/, Meeting.meetingName);

  const message = {
    chat_type: CHAT_CONFIG.type_system,
    message: welcomeMessage,
    from_color: '0x3399FF',
    to_userid: userId,
    from_userid: CHAT_CONFIG.type_system,
    from_username: '',
    from_time: new Date(),
  };

  return addChat(meetingId, message);
};
