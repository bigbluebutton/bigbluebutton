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
  user_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const USER_BASIC_INFO = gql`
  query UserBasicInfo($limit: Int!, $offset: Int!, $name: String!) {
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
      offset: $offset,
    ) {
      userId
      name
      isModerator
      color
      avatar
      presenter
    }
    user_aggregate(
      where: {
        name: { _like: $name },
      },
    ) {
      aggregate {
        count
      }
    }
  }
`;

export default LAST_SEEN_MUTATION;
