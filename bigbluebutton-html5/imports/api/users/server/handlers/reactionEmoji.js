import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/users';

export default async function handleReactionEmoji({ body }, meetingId) {
  const { userId, reactionEmoji } = body;
aaa
  check(userId, String);
  check(reactionEmoji, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      reactionEmojiTime: (new Date()).getTime(),
      reactionEmoji,
    },
  };

  try {
    const numberAffected = await Users.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Assigned user rectionEmoji ${reactionEmoji} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Assigning user reactionEmoji: ${err}`);
  }
}
