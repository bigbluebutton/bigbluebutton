import { gql } from '@apollo/client';

export const IS_TYPING_SUBSCRIPTION = gql`subscription IsTyping($chatId: String!) {
  user_typing_public(
      limit: 4,
      where: {
        isCurrentlyTyping: {_eq: true}
        chatId: {_eq: $chatId}
      }
    ) {
    meetingId
    chatId
    userId
    typingAt
    isCurrentlyTyping
    user {
      name
    }
  }  
}`;

export default {
  IS_TYPING_SUBSCRIPTION,
};
