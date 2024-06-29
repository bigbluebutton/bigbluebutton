import { gql } from '@apollo/client';

export interface UnreadChatsSubscriptionResponse {
  chat: Array<{
    chatId: string;
    totalUnread: number;
    participant?: {
      name: string;
    };
  }>;
}

export const UNREAD_CHATS_SUBSCRIPTION = gql`
  subscription unreadChatsSubscription {
    chat(
      where: {
        totalUnread: { _gt: 0 },
        visible: { _eq: true }
      }
    ) {
      chatId
      totalUnread
      participant {
        name
      }
    }
  }
`;

export default {
  UNREAD_CHATS_SUBSCRIPTION,
};
