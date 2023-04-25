import { gql } from '@apollo/client';

export const IS_TYPING_SUBSCRIPTION = gql`subscription IsTyping($userId: String!, $chatId: String!) {
  user_typing_public(
      limit: 3, 
      where: {
        isCurrentlyTyping: {_eq: true}
        chatId: {_eq: $chatId}
        userId: {_neq: $userId}
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
