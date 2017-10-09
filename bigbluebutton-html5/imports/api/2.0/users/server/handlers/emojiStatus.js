import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/2.0/users';

export default function handleEmojiStatus({ body }, meetingId) {
  const { userId, emoji } = body;

  check(userId, String);
  check(emoji, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      emojiTime: (new Date()).getTime(),
      emoji,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Assigning user emoji status: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Assigned user emoji status${
         emoji} id=${userId} meeting=${meetingId}`,
      );
    }
  };

  return Users.update(selector, modifier, cb);
}
