import { gql } from '@apollo/client';
import { Message } from '/imports/ui/Types/message';
import { Chat } from '/imports/ui/Types/chat';

export interface ChatMessageSubscriptionResponse {
  chat_message_public: Array<Message>;
}

export const CHAT_MESSAGE_SUBSCRIPTION = gql`subscription chatMessages($limit: Int!, $offset: Int!) {
  chat_message_public(limit: $limit, offset: $offset, order_by: {createdTime: asc}) {
    user {
      name
      userId
      avatar
      isOnline
      isModerator
      color
    }
    message
    messageId
    createdTime
    createdTimeAsDate
  }
}
`;


