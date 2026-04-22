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

export const CHAT_CREATE_WITH_USER = gql`
  mutation ChatCreateWithUser($userId: String!) {
    chatCreateWithUser(
      userId: $userId,
    )
  }
`;

export const SET_LISTEN_ONLY_INPUT_DEVICE = gql`
  mutation UserSetListenOnlyInput($listenOnlyInputDevice: Boolean!) {
    userSetListenOnlyInput(
      listenOnlyInputDevice: $listenOnlyInputDevice,
    )
  }
`;

export default {
  SET_AWAY,
  SET_ROLE,
  USER_EJECT_CAMERAS,
  CHAT_CREATE_WITH_USER,
  SET_LISTEN_ONLY_INPUT_DEVICE,
};
