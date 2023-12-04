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

export default { CHAT_SEND_MESSAGE };
