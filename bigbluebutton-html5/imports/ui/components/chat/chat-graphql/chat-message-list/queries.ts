import { gql } from '@apollo/client';

const LAST_SEEN_MUTATION = gql`
  mutation UpdateChatLastSeen($chatId: String, $lastSeenAt: String) {
    chatSetLastSeen(
      chatId: $chatId
      lastSeenAt: $lastSeenAt
    )
  }
`;

export interface UserBasicInfoQueryResponse {
  user: {
    userId: string;
    name: string;
    isModerator: boolean;
    color: string;
    avatar: string;
    presenter: boolean;
  }[];
}

export const USER_BASIC_INFO = gql`
  query UserBasicInfo($limit: Int!, $name: String!) {
    user(
      where: {
        name: { _like: $name },
      },
      order_by: [
        { presenter: desc },
        { role: asc },
        { nameSortable: asc },
      ],
      limit: $limit,
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
