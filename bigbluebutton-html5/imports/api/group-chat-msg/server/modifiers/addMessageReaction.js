import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { Reactions } from '/imports/api/group-chat-msg';

export default function addMessageReaction(meetingId, userId, chatId, messageId, emojiId) {
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

  const exists = Reactions.findOne(doc);

  if (exists) return;

  try {
    const insertedId = Reactions.insert(doc);

    if (insertedId) {
      Logger.info(`Added msg reaction msgId=${messageId} chatId=${chatId} emojiId=${emojiId}`);
    }
  } catch (err) {
    Logger.error(`Error on add message reaction: ${err}`);
  }
}
