import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { UsersTyping } from '/imports/api/group-chat-msg';
import stopTyping from './stopTyping';

const TYPING_TIMEOUT = 5000;

export default function startTyping(meetingId, userId, chatId) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const user = Users.findOne(selector);

  const mod = {
    meetingId,
    userId,
    name: user.name,
    isTypingTo: chatId,
    role: user.role,
    time: (new Date()),
  };

  const typingUser = UsersTyping.findOne(selector, {
    fields: {
      time: 1,
    },
  });

  if (typingUser) {
    if (mod.time - typingUser.time <= TYPING_TIMEOUT - 100) return;
  }

  const cb = (err) => {
    if (err) {
      return Logger.error(`Typing indicator update error: ${err}`);
    }

    Meteor.setTimeout(() => {
      stopTyping(meetingId, userId);
    }, TYPING_TIMEOUT);
    return Logger.debug(`Typing indicator update for userId={${userId}} chatId={${chatId}}`);
  };

  return UsersTyping.upsert(selector, mod, cb);
}
