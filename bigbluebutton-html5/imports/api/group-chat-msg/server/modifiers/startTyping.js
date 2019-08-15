import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { UsersTyping } from '/imports/api/group-chat-msg';

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
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Typing indicator update error: ${err}`);
    }
    return Logger.debug(`Typing indicator update for userId={${userId}} chatId={${chatId}}`);
  };

  return UsersTyping.upsert(selector, mod, cb);
}
