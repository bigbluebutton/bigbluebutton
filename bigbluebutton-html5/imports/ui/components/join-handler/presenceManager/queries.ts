import { gql } from '@apollo/client';

export const userJoinMutation = gql`
  mutation UserJoin($authToken: String!, $clientType: String!) {
    userJoinMeeting(
      authToken: $authToken,
      clientType: $clientType,
    )
  }
`;

export default {
  userJoinMutation,
};
