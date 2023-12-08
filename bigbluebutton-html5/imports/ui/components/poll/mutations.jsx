import { gql } from '@apollo/client';

export const POLL_PUBLISH_RESULT = gql`
  mutation PollPublishResult($pollId: String!) {
    pollPublishResult(
      pollId: $pollId,
    )
  }
`;

export const POLL_SUBMIT_TYPED_VOTE = gql`
  mutation PollSubmitTypedVote($pollId: String!, $answer: String!) {
    pollSubmitUserTypedVote(
      pollId: $pollId,
      answer: $answer,
    )
  }
`;

export const POLL_SUBMIT_VOTE = gql`
  mutation PollSubmitVote($pollId: String!, $answerIds: [Int]!) {
    pollSubmitUserVote(
      pollId: $pollId,
      answerIds: $answerIds,
    )
  }
`;

export default {
  POLL_PUBLISH_RESULT,
  POLL_SUBMIT_TYPED_VOTE,
  POLL_SUBMIT_VOTE,
};
