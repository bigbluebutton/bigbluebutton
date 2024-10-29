import { gql } from '@apollo/client';

const CHAT_EDIT_MESSAGE_MUTATION = gql`
  mutation($chatId: String!, $messageId: String!, $chatMessageInMarkdownFormat: String!) {
    chatEditMessage(chatId: $chatId, messageId: $messageId, chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat)
  }
`;

const CHAT_DELETE_MESSAGE_MUTATION = gql`
  mutation($chatId: String!, $messageId: String!) {
    chatDeleteMessage(chatId: $chatId, messageId: $messageId)
  }
`;

const CHAT_SEND_REACTION_MUTATION = gql`
  mutation($chatId: String!, $messageId: String!, $reactionEmoji: String!, $reactionEmojiId: String!) {
    chatSendMessageReaction(
      chatId: $chatId,
      messageId: $messageId,
      reactionEmoji: $reactionEmoji,
      reactionEmojiId: $reactionEmojiId
    )
  }
`;

const CHAT_DELETE_REACTION_MUTATION = gql`
  mutation($chatId: String!, $messageId: String!, $reactionEmoji: String!, $reactionEmojiId: String!) {
    chatDeleteMessageReaction(
      chatId: $chatId,
      messageId: $messageId,
      reactionEmoji: $reactionEmoji,
      reactionEmojiId: $reactionEmojiId
    )
  }
`;

export default {
  CHAT_EDIT_MESSAGE_MUTATION,
  CHAT_DELETE_MESSAGE_MUTATION,
  CHAT_DELETE_REACTION_MUTATION,
  CHAT_SEND_REACTION_MUTATION,
};

export {
  CHAT_EDIT_MESSAGE_MUTATION,
  CHAT_DELETE_MESSAGE_MUTATION,
  CHAT_DELETE_REACTION_MUTATION,
  CHAT_SEND_REACTION_MUTATION,
};
