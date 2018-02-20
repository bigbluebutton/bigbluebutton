import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';

import addChat from '/imports/api/chat/server/modifiers/addChat';
import clearUserSystemMessages from '/imports/api/chat/server/modifiers/clearUserSystemMessages';

import userJoin from '../methods/userJoin';

const addWelcomeChatMessage = (meetingId, userId) => {
  const CHAT_CONFIG = Meteor.settings.public.chat;

  const Meeting = Meetings.findOne({ meetingId });

  const message = {
    message: Meeting.welcomeProp.welcomeMsg,
    fromColor: '0x3399FF',
    toUserId: userId,
    toUsername: CHAT_CONFIG.type_system,
    fromUserId: CHAT_CONFIG.type_system,
    fromUsername: '',
    fromTime: (new Date()).getTime(),
  };

  addChat(meetingId, message);
};

const clearOtherSessions = (sessionUserId, current = false) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions)
    .filter(i => serverSessions[i].userId === sessionUserId)
    .filter(i => i !== current)
    .forEach(i => serverSessions[i].close());
};

export default function handleValidateAuthToken({ body }, meetingId) {
  const { userId, valid, waitForApproval } = body;

  check(userId, String);
  check(valid, Boolean);
  check(waitForApproval, Boolean);

  const selector = {
    meetingId,
    userId,
  };

  const User = Users.findOne(selector);

  // If we dont find the user on our collection is a flash user and we can skip
  if (!User) return;

  // Publish user join message
  if (valid && !waitForApproval) {
    userJoin(meetingId, userId, User.authToken);
  }

  const modifier = {
    $set: {
      validated: valid,
      approved: !waitForApproval,
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

        const sessionUserId = `${meetingId}-${userId}`;
        const currentConnectionId = User.connectionId ? User.connectionId : false;
        console.error(currentConnectionId);
        clearOtherSessions(sessionUserId, currentConnectionId);
      }

      return Logger.info(`Validated auth token as ${valid} user=${userId} meeting=${meetingId}`);
    }

    return Logger.info('No auth to validate');
  };

  Users.update(selector, modifier, cb);
}
