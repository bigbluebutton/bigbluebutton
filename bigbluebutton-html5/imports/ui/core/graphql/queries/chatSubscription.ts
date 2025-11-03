import { gql } from '@apollo/client';

const CHATS_SUBSCRIPTION = gql`
  subscription ChatSubscription {
    chat(
      order_by: [
        { chatId: asc }
      ]
    ) {
      chatId
      participant {
        userId
        name
        nameSortable
        role
        color
        loggedOut
        avatar
        currentlyInMeeting
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
