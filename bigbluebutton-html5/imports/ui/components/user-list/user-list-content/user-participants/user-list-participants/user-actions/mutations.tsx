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

export const USER_EJECT_CAMERAS = gql`
  mutation UserEjectCameras($userId: String!) {
    userEjectCameras(
      userId: $userId,
    )
  }
`;

export default { SET_AWAY, SET_ROLE, USER_EJECT_CAMERAS };
