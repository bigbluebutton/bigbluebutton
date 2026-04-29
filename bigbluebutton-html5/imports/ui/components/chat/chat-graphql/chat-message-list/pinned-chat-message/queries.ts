import { gql } from '@apollo/client';
import { Message } from '/imports/ui/Types/message';

export const CHAT_PINNED_MESSAGE_PUBLIC_SUBSCRIPTION = gql`
  subscription pinnedChatMessage($messageId: String) {
    chat_message_public(
      where: { messageId: { _eq: $messageId } }
    ) {
      messageId
      chatId
      messageSequence
      createdAt
      messageAsHtml
      senderName
    }
  }
`;

export type ChatMessageSubscriptionResponse =
  | { chat_message_public: Message[]; chat_message_private?: never }
  | { chat_message_private: Message[]; chat_message_public?: never };
