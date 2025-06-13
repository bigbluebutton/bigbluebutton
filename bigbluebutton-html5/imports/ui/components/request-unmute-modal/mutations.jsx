import { gql } from '@apollo/client';

export const USER_UNMUTE_REQUEST_ANSWER = gql`
  mutation userUnmuteRequestAnswer($userId: String!) {
    userUnmuteRequestAnswer(
      userId: $userId,
    )
  }
`;

export default {
  USER_UNMUTE_REQUEST_ANSWER,
};
