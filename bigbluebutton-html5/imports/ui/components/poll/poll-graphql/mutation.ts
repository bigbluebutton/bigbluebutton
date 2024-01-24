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

export const POLL_CANCEL = gql`
  mutation PollCancel {
    pollCancel
  }
`;

export const POLL_CREATE = gql`
  mutation PollCreate(
    $pollType: String!,
    $pollId: String!,
    $secretPoll: Boolean!,
    $question: String!,
    $isMultipleResponse: Boolean!,
    $answers: [String]!
  ) {
    pollCreate(
      pollType: $pollType,
      pollId: $pollId,
      secretPoll: $secretPoll,
      question: $question,
      isMultipleResponse: $isMultipleResponse,
      answers: $answers,
    )
  }
`;

export default {
  POLL_PUBLISH_RESULT,
  POLL_SUBMIT_TYPED_VOTE,
  POLL_SUBMIT_VOTE,
  POLL_CANCEL,
  POLL_CREATE,
};
