import { gql } from '@apollo/client';

export interface HasPendingPollResponse {
  meeting: Array<{
    polls: Array<{
      quiz: boolean;
      users: Array<{
        userId: string;
        responded: boolean;
      }>;
      options: Array<{
        optionDesc: string;
        optionId: number;
        pollId: string;
      }>;
      multipleResponses: boolean;
      pollId: string;
      questionText: string;
      secret: boolean;
      type: string;
    }>;
  }>;
}

export const hasPendingPoll = gql`
  subscription hasPendingPoll($userId: String!) {
    meeting {
      polls(
        where: {
          ended: { _eq: false }
          users: { responded: { _eq: false }, userId: { _eq: $userId } },
          userCurrent: { responded: { _eq: false } }
        }
      ) {
        quiz
        users {
          responded
          userId
        }
        options(order_by: {optionId: asc}) {
          optionDesc
          optionId
          pollId
        }
        multipleResponses
        pollId
        questionText
        secret
        type
      }
    }
  }
`;

export default { hasPendingPoll };
