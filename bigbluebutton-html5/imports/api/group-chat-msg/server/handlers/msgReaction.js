import addMessageReaction from '/imports/api/group-chat-msg/server/modifiers/addMessageReaction';

export default function msgReaction({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    userId,
    chatId,
    messageId,
    emojiId,
  } = body;

  addMessageReaction(meetingId, userId, chatId, messageId, emojiId);
}
