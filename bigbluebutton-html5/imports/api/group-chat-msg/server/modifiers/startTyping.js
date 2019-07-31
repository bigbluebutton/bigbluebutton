import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function startTyping(meetingId, userId, chatId) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      isTyping: true,
      isTypingTo: chatId,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Typing indicator update error: ${err}`);
    }
    return Logger.info(`Typing indicator update for userId={${userId}} chatId={${chatId}}`);
  };

  return Users.update(selector, modifier, cb);
}
