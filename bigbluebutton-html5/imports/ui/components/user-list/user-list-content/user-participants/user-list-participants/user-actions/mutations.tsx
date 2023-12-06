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

export default { SET_AWAY, SET_ROLE };
