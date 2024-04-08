import { gql } from '@apollo/client';

export const IS_TYPING_PUBLIC_SUBSCRIPTION = gql`subscription IsTyping($chatId: String!) {
  user_typing_public(
      order_by: {startedTypingAt: asc}
      limit: 4,
      where: {
        isCurrentlyTyping: {_eq: true}
        chatId: {_eq: $chatId}
      }
    ) {
    chatId
    userId
    isCurrentlyTyping
    user {
      name
    }
  }  
}`;

export const IS_TYPING_PRIVATE_SUBSCRIPTION = gql`subscription IsTyping($chatId: String!) {
  user_typing_private(
      where: {
        isCurrentlyTyping: {_eq: true}
        chatId: {_eq: $chatId}
      }
    ) {
    chatId
    userId
    isCurrentlyTyping
    user {
      name
    }
  }
}`;

export default {
  IS_TYPING_PUBLIC_SUBSCRIPTION,
  IS_TYPING_PRIVATE_SUBSCRIPTION,
};
