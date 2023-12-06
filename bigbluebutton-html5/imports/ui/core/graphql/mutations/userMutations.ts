import { gql } from '@apollo/client';

export const SET_CAMERA_PINNED = gql`
  mutation SetCameraPinned($userId: String!, $pinned: Boolean!) {
    userSetCameraPinned(
      userId: $userId,
      pinned: $pinned,
    )
  }
`;

export default { SET_CAMERA_PINNED };
