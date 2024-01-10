import { gql } from '@apollo/client';

export const SET_POLICY = gql`
  mutation SetPolicy($guestPolicy: String!) {
    guestUsersSetPolicy(
      guestPolicy: $guestPolicy,
    )
  }
`;

export default { SET_POLICY };
