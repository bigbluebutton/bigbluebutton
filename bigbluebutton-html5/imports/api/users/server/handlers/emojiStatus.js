import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/users';

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

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Assigned user emoji status ${emoji} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Assigning user emoji status: ${err}`);
  }
}
