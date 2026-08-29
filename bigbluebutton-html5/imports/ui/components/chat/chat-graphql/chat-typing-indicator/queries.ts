import { gql } from '@apollo/client';

export interface TypingUser {
  chatId: string;
  userId: string;
  user: {
    name: string;
  };
}

export interface IsTypingPrivateSubscriptionResponse {
  user_typing_private: TypingUser[];
}

export interface IsTypingPublicSubscriptionResponse {
  user_typing_public: TypingUser[];
}

export const IS_TYPING_PUBLIC_SUBSCRIPTION = gql`subscription IsTyping {
  user_typing_public(
      order_by: {startedTypingAt: asc}
      limit: 4,
    ) {
    chatId
    userId
    user {
      name
    }
  }
}`;

export const IS_TYPING_PRIVATE_SUBSCRIPTION = gql`subscription IsTyping($chatId: String!) {
  user_typing_private(
      where: {
        chatId: {_eq: $chatId}
      }
    ) {
    chatId
    userId
    user {
      name
    }
  }
}`;

export default {
  IS_TYPING_PUBLIC_SUBSCRIPTION,
  IS_TYPING_PRIVATE_SUBSCRIPTION,
};
