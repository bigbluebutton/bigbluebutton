import { gql } from '@apollo/client';
import { Message } from '/imports/ui/Types/message';

export const CHAT_MESSAGE_PUBLIC_SUBSCRIPTION = gql`
  subscription chatMessages($limit: Int!, $offset: Int!) {
    chat_message_public(limit: $limit, offset: $offset, order_by: { createdAt: asc }) {
      user {
        name
        userId
        avatar
        currentlyInMeeting
        isModerator
        color
      }
      messageSequence
      replyToMessage {
        deletedAt
        deletedBy {
          name
        }
        chatEmphasizedText
        messageSequence
        message
        user {
          name
          color
        }
      }
      reactions(order_by: { createdAt: asc }) {
        createdAt
        reactionEmoji
        user {
          name
          userId
        }
      }
      messageType
      chatEmphasizedText
      chatId
      message
      messageId
      createdAt
      editedAt
      deletedAt
      deletedBy {
        name
      }
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
        currentlyInMeeting
        isModerator
        color
      }
      messageSequence
      replyToMessage {
        deletedAt
        deletedBy {
          name
        }
        chatEmphasizedText
        messageSequence
        message
        user {
          name
          color
        }
      }
      reactions {
        createdAt
        reactionEmoji
        user {
          name
          userId
        }
      }
      chatId
      message
      messageType
      chatEmphasizedText
      messageId
      createdAt
      editedAt
      deletedAt
      deletedBy {
        name
      }
      messageMetadata
      recipientHasSeen
    }
  }
`;

export type ChatMessageSubscriptionResponse = {
  chat_message_public: Message[]
} | {
  chat_message_private: Message[]
}
