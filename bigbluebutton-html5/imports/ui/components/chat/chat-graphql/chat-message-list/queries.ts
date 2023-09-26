import { gql } from '@apollo/client';

const LAST_SEEN_MUTATION = gql`
  mutation UpdateChatUser($chatId: String, $lastSeenAt: timestamptz) {
    update_chat_user(
      where: { 
        chatId: { _eq: $chatId },
        _or: [
            {lastSeenAt: { _lt: $lastSeenAt } },
            {lastSeenAt: {_is_null: true} },
        ]
      }
      _set: { lastSeenAt: $lastSeenAt }
    ) {
      affected_rows
    }
  }
`;

export default LAST_SEEN_MUTATION;
