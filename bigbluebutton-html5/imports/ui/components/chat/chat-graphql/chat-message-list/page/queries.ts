/* eslint-disable camelcase */
import { gql } from '@apollo/client';

export const CHAT_MESSAGE_PUBLIC_SUBSCRIPTION = gql`
  subscription chatMessages($limit: Int!, $offset: Int!) {
    chat_message_public(limit: $limit, offset: $offset, order_by: { createdAt: asc }) {
      user {
        name
        userId
        avatar
        isOnline
        isModerator
        color
      }
      messageType
      chatEmphasizedText
      chatId
      message
      messageId
      createdAt
      messageMetadata
      senderName
      senderRole
    }
  }
`;

export const CHAT_MESSAGE_PRIVATE_SUBSCRIPTION = gql`
  subscription chatMessages($limit: Int!, $offset: Int!, $requestedChatId: String!) {
    chat_message_private(
      limit: $limit
      offset: $offset
      where: { chatId: { _eq: $requestedChatId } }
      order_by: { createdAt: asc }
    ) {
      user {
        name
        userId
        avatar
        isOnline
        isModerator
        color
      }
      chatId
      message
      messageType
      chatEmphasizedText
      messageId
      createdAt
      messageMetadata
    }
  }
`;
