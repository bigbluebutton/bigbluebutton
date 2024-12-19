import { gql } from '@apollo/client';

export interface LastSentMessageData {
  messageSequence: number;
  chatId: string;
  message: string;
  messageId: string;
}

export type LastSentMessageResponse =
  | { chat_message_public: LastSentMessageData[] }
  | { chat_message_private: LastSentMessageData[] };

export const USER_LAST_SENT_PUBLIC_CHAT_MESSAGE_QUERY = gql`
  query userLastSentPublicChatMessage($userId: String!) {
    chat_message_public(
      limit: 1,
      order_by: { createdAt: desc },
      where: {
        user: {
          userId: { _eq: $userId },
        },
        deletedAt: { _is_null: true },
        messageType: { _eq: "default" }
      },
    ) {
      messageSequence
      chatId
      message
      messageId
    }
  }
`;

export const USER_LAST_SENT_PRIVATE_CHAT_MESSAGE_QUERY = gql`
  query userLastSentPrivateChatMessage($userId: String!, $requestedChatId: String!) {
    chat_message_private(
      limit: 1,
      order_by: { createdAt: desc },
      where: {
        user: {
          userId: { _eq: $userId },
        },
        deletedAt: { _is_null: true },
        messageType: { _eq: "default" },
        chatId: { _eq: $requestedChatId }
      },
    ) {
      messageSequence
      chatId
      message
      messageId
    }
  }
`;

export default {
  USER_LAST_SENT_PUBLIC_CHAT_MESSAGE_QUERY,
  USER_LAST_SENT_PRIVATE_CHAT_MESSAGE_QUERY,
};
