import { gql } from '@apollo/client';

// Define the GraphQL mutation
export const CHAT_SEND_MESSAGE = gql`
  mutation ChatSendMessage($chatId: String!, $chatMessageInMarkdownFormat: String!) {
    chatSendMessage(
      chatId: $chatId,
      chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat
    )
  }
`;

export const CHAT_SET_TYPING = gql`
  mutation ChatSetTyping($chatId: String!) {
    chatSetTyping(
      chatId: $chatId,
    )
  }
`;

export default { CHAT_SEND_MESSAGE, CHAT_SET_TYPING };
