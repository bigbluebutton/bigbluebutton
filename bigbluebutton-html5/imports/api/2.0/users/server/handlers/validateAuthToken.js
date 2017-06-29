import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/2.0/meetings';
import Users from '/imports/api/2.0/users';

import addChat from '/imports/api/1.1/chat/server/modifiers/addChat';
import clearUserSystemMessages from '/imports/api/1.1/chat/server/modifiers/clearUserSystemMessages';

const addWelcomeChatMessage = (meetingId, userId) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const CHAT_CONFIG = Meteor.settings.public.chat;

  const Meeting = Meetings.findOne({ 'meetingProp.intId': meetingId });

  if (!Meeting) {
    // TODO add meeting properly so it does not get reset
    return;
  }

  const welcomeMessage = APP_CONFIG.defaultWelcomeMessage
    .concat(APP_CONFIG.defaultWelcomeMessageFooter)
    .replace(/%%CONFNAME%%/, Meeting.meetingProp.name);

  const message = {
    chat_type: CHAT_CONFIG.type_system,
    message: welcomeMessage,
    from_color: '0x3399FF',
    to_userid: userId,
    from_userid: CHAT_CONFIG.type_system,
    from_username: '',
    from_time: (new Date()).getTime(),
  };

  return addChat(meetingId, message);
};

export default function handleValidateAuthToken({ body }, meetingId) {
  const { userId, valid } = body;

  check(userId, String);
  check(valid, Boolean);

  const selector = {
    meetingId,
    userId,
  };

  const User = Users.findOne(selector);

  // If we dont find the user on our collection is a flash user and we can skip
  if (!User) return;

  // User already flagged so we skip
  if (User.validated === valid) return;

  const modifier = {
    $set: {
      validated: valid,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Validating auth token: ${err}`);
    }

    if (numChanged) {
      if (valid) {
        clearUserSystemMessages(meetingId, userId);
        addWelcomeChatMessage(meetingId, userId);
      }

      return Logger.info(`Validated auth token as ${valid
       }${+' user='}${userId} meeting=${meetingId}`,
      );
    }
  };

  return Users.update(selector, modifier, cb);
}
