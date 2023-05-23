import { gql } from '@apollo/client';
import { Chat } from '/imports/ui/Types/chat';

export interface ChatSubscriptionResponse {
  chat: Array<Chat>;
}

export const CHAT_SUBSCRIPTION = gql`
subscription {
  chat {
        chatId
        participant {
            name
            role
            color
            loggedOut
        }
        totalMessages
        totalUnread
        public
      }
}
`
