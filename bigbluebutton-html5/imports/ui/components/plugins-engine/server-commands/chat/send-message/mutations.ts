import { gql } from '@apollo/client';

export const CHAT_SEND_MESSAGE = gql`
  mutation ChatSendMessage(
    $chatId: String!,
    $chatMessageInMarkdownFormat: String!,
    $metadata: json,
  ) {
    chatSendMessage(
      chatId: $chatId,
      chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat
      metadata: $metadata,
    )
  }
`;

export default CHAT_SEND_MESSAGE;
