/* eslint-disable camelcase */
import { gql } from '@apollo/client';
import { Meeting } from '/imports/ui/Types/meeting';
import { Message } from '/imports/ui/Types/message';

export type getChatMessageHistory = {
  chat_message_public: Array<Message>
  meeting: Array<Meeting>;
};

export const GET_CHAT_MESSAGE_HISTORY = gql`
query getChatMessageHistory {
  chat_message_public(order_by: {createdAt: asc}) {
    message
    messageId
    messageType
    messageMetadata
    senderName
    chatEmphasizedText
    createdAt
    user {
      userId
      name
      role
    }
    deletedBy {
      name
    }
  }
  meeting {
    name
  }
}
`;
