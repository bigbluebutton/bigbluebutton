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

export interface PublicMessageStreamResponse {
  chat_message_public_stream: Array<Message>;
}

export interface PrivateMessageStreamResponse {
  chat_message_private_stream: Array<Message>;
}

export const CHAT_MESSAGE_PUBLIC_STREAM = gql`
  subscription chatMessages($createdAt: timestamptz!) {
    chat_message_public_stream(
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

export const CHAT_MESSAGE_PRIVATE_STREAM = gql`
  subscription chatMessages($createdAt: timestamptz!) {
    chat_message_private_stream(
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
  CHAT_MESSAGE_PRIVATE_STREAM,
  CHAT_MESSAGE_PUBLIC_STREAM,
};
