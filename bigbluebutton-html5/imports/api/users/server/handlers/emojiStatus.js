import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/users';
import sendStatusChatMsg from '../methods/sendStatusChatMsg';

export default async function handleEmojiStatus({ body }, meetingId) {
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
    // must be called before modifying the users collection, because it
    // needs to be consulted in order to know the previous emoji
    sendStatusChatMsg(meetingId, userId, emoji);

    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Assigned user emoji status ${emoji} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Assigning user emoji status: ${err}`);
  }
}
