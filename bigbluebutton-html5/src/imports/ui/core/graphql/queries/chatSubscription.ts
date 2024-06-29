import { gql } from '@apollo/client';

const CHATS_SUBSCRIPTION = gql`
  subscription ChatSubscription {
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

export default CHATS_SUBSCRIPTION;
