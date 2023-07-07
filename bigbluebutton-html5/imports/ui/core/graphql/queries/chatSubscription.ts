import { gql } from '@apollo/client';

export const CHATS_SUBSCRIPTION = gql`
  subscription {
    chat(
      order_by: [
        { public: desc }
        { totalUnread: desc }
        { participant: { name: asc, userId: asc } }
      ]
    ) {
      chatId
      participant {
        userId
        name
        role
        color
        loggedOut
        avatar
        isOnline
        isModerator
      }
      totalMessages
      totalUnread
      public
      lastSeenAt
    }
  }
`;
