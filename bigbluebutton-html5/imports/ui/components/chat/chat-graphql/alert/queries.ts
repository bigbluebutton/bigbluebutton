import { gql } from '@apollo/client';

export interface Message {
  messageType: string;
  chatId: string;
  message: string;
  messageId: string;
  createdAt: string;
  messageMetadata: string | null;
  senderName: string | null;
  senderRole: string | null;
  senderId: string | null;
}

export interface ChatMessageStreamResponse {
  chat_message_stream: Array<Message>;
}

// This subscription is handled by bbb-graphql-middleware and its content should not be modified
export const CHAT_MESSAGE_STREAM = gql`
  subscription getChatMessageStream($createdAt: timestamptz!) {
    chat_message_stream(
      cursor: { initial_value: { createdAt: $createdAt }, ordering: ASC},
      batch_size: 10
    ) {
      chatId
      createdAt
      message
      messageId
      messageMetadata
      messageType
      senderName
      senderRole
      senderId
    }
  }
`;

export default {
  CHAT_MESSAGE_STREAM,
};
