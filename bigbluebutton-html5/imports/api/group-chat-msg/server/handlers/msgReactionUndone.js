import undoMessageReaction from '/imports/api/group-chat-msg/server/modifiers/undoMessageReaction';

export default function msgReactionUndone({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    userId,
    chatId,
    messageId,
    emojiId,
  } = body;

  undoMessageReaction(meetingId, userId, chatId, messageId, emojiId);
}
