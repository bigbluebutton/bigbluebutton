import { gql } from '@apollo/client';

export const SET_CAMERA_PINNED = gql`
  mutation SetCameraPinned($userId: String!, $pinned: Boolean!) {
    userSetCameraPinned(
      userId: $userId,
      pinned: $pinned,
    )
  }
`;

export const SET_RAISE_HAND = gql`
  mutation SetRaiseHand($userId: String!, $raiseHand: Boolean!) {
    userSetRaiseHand(
      userId: $userId,
      raiseHand: $raiseHand,
    )
  }
`;

export default { SET_CAMERA_PINNED, SET_RAISE_HAND };
