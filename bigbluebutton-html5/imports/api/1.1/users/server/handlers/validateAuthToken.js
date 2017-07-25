import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/1.1/meetings';
import Users from './../../';

import addChat from '/imports/api/1.1/chat/server/modifiers/addChat';
import clearUserSystemMessages from '/imports/api/1.1/chat/server/modifiers/clearUserSystemMessages';

export default function handleValidateAuthToken({ payload }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid;
  const validStatus = JSON.parse(payload.valid);

  check(meetingId, String);
  check(userId, String);
  check(validStatus, Boolean);

  const selector = {
    meetingId,
    userId,
  };

  const User = Users.findOne(selector);

  // If we dont find the user on our collection is a flash user and we can skip
  if (!User) return;

  // User already flagged so we skip
  if (User.validated === validStatus) return;

  const modifier = {
    $set: {
      validated: validStatus,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Validating auth token: ${err}`);
    }

    if (numChanged) {
      if (validStatus) {
        clearUserSystemMessages(meetingId, userId);
        addWelcomeChatMessage(meetingId, userId);
      }

      return Logger.info(`Validated auth token as ${validStatus
       }${+' user='}${userId} meeting=${meetingId}`,
      );
    }
  };

  return Users.update(selector, modifier, cb);
}

const addWelcomeChatMessage = (meetingId, userId) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const CHAT_CONFIG = Meteor.settings.public.chat;

  const Meeting = Meetings.findOne({ meetingId });

  const welcomeMessage = APP_CONFIG.defaultWelcomeMessage
    .concat(APP_CONFIG.defaultWelcomeMessageFooter)
    .replace(/%%CONFNAME%%/, Meeting.meetingName);

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
