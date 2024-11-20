import { gql } from '@apollo/client';

const LAST_SEEN_MUTATION = gql`
  mutation UpdateChatLastSeen($chatId: String, $lastSeenAt: String) {
    chatSetLastSeen(
      chatId: $chatId
      lastSeenAt: $lastSeenAt
    )
  }
`;

export interface BasicUserInfoSubscriptionResponse {
  user: {
    userId: string;
    name: string;
    isModerator: boolean;
    color: string;
    avatar: string;
    presenter: boolean;
  }[];
}

export const BASIC_USER_INFO = gql`
  subscription UserNames {
    user(
      order_by: [
        { presenter: desc },
        { role: asc },
        { nameSortable: asc },
      ],
    ) {
      userId
      name
      isModerator
      color
      avatar
      presenter
    }
  }
`;

export default LAST_SEEN_MUTATION;
