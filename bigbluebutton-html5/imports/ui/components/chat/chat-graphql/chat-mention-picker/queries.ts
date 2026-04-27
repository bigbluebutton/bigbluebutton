import { gql } from '@apollo/client';

export interface MentionUser {
  userId: string;
  name: string;
}

export interface GetMentionUsersResponse {
  user: MentionUser[];
}

export const GET_MENTION_USERS = gql`
  query GetMentionUsers {
    user(where: { bot: { _eq: false }, loggedOut: { _eq: false } }) {
      userId
      name
    }
  }
`;

export default {
  GET_MENTION_USERS,
};
