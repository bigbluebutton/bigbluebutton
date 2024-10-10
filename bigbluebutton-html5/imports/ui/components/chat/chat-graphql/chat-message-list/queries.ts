import { gql } from '@apollo/client';

const LAST_SEEN_MUTATION = gql`
  mutation UpdateChatLastSeen($chatId: String, $lastSeenAt: String) {
    chatSetLastSeen(
      chatId: $chatId
      lastSeenAt: $lastSeenAt
    )
  }
`;

export default LAST_SEEN_MUTATION;
