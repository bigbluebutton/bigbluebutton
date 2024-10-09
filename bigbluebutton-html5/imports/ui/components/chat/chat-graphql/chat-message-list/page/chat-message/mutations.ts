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

export default {
  CHAT_EDIT_MESSAGE_MUTATION,
  CHAT_DELETE_MESSAGE_MUTATION,
};

export {
  CHAT_EDIT_MESSAGE_MUTATION,
  CHAT_DELETE_MESSAGE_MUTATION,
};
