import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { UsersTyping } from '/imports/api/group-chat-msg';

export default function stopTyping(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Stop user=${userId} typing indicator error: ${err}`);
    }
    return Logger.info(`Stopped typing indicator for user=${userId}`);
  };

  return UsersTyping.remove(selector, cb);
}
