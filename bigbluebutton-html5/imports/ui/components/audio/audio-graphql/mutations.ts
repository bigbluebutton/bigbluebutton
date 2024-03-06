import { gql } from '@apollo/client';

export const USER_SET_MUTED = gql`
  mutation UserSetMuted($userId: String, $muted: Boolean!) {
    userSetMuted(
      userId: $userId,
      muted: $muted
    )
  }
`;

export default {
  USER_SET_MUTED,
};
