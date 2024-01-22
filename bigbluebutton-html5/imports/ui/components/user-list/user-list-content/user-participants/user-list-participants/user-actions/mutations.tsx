import { gql } from '@apollo/client';

export const SET_AWAY = gql`
  mutation SetAway($away: Boolean!) {
    userSetAway(
      away: $away,
    )
  }
`;

export const SET_ROLE = gql`
  mutation SetRole($userId: String!, $role: String!) {
    userSetRole(
      userId: $userId,
      role: $role,
    )
  }
`;

export const CHAT_CREATE_WITH_USER = gql`
  mutation ChatCreateWithUser($userId: String!) {
    chatCreateWithUser(
      userId: $userId,
    )
  }
`;

export default { SET_AWAY, SET_ROLE, CHAT_CREATE_WITH_USER };
