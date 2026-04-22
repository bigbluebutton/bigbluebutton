import { gql } from '@apollo/client';
import { Message } from '/imports/ui/Types/message';

export const CHAT_MESSAGE_PUBLIC_SUBSCRIPTION = gql`
  subscription chatMessages($messageIds: [String!]) {
    chat_message_public(
      where: { messageId: { _in: $messageIds } }
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
      messageType
      chatEmphasizedText
      chatId
      message
      messageAsHtml
      messageId
      messageSequence
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

export type ChatMessageSubscriptionResponse =
  | { chat_message_public: Message[]; chat_message_private?: never }
  | { chat_message_private: Message[]; chat_message_public?: never };
