import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { Reactions } from '/imports/api/group-chat-msg';

export default function undoMessageReaction(meetingId, userId, chatId, messageId, emojiId) {
  check(meetingId, String);
  check(userId, String);
  check(chatId, String);
  check(messageId, String);
  check(emojiId, String);

  const doc = {
    meetingId,
    chatId,
    msgId: messageId,
    userId,
    emojiId,
  };

  try {
    const removed = Reactions.remove(doc);

    if (removed) {
      Logger.info(`Removed msg reaction msgId=${messageId} chatId=${chatId} emojiId=${emojiId}`);
    }
  } catch (err) {
    Logger.error(`Error on remove message reaction: ${err}`);
  }
}
