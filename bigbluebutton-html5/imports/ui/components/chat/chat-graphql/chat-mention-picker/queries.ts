import { gql } from '@apollo/client';

export interface MentionUser {
  userId: string;
  name: string;
}

export interface GetMentionUsersResponse {
  user: MentionUser[];
}

export const GET_MENTION_USERS = gql`
  subscription GetMentionUsers($where: user_bool_exp, $limit: Int!) {
    user(
      where: $where,
      limit: $limit,
      order_by: [
        { nameSortable: asc },
        { userId: asc }
      ]
    ) {
      userId
      name
    }
  }
`;

export default {
  GET_MENTION_USERS,
};
