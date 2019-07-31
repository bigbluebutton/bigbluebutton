import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function stopTyping(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
    isTyping: true,
  };

  const modifier = {
    $set: {
      isTyping: false,
      isTypingTo: '',
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Stop user=${userId} typing indicator error: ${err}`);
    }
    return Logger.info(`Stopped user=${userId} typing indicator`);
  };

  return Users.update(selector, modifier, cb);
}
