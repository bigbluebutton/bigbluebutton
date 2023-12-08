import { gql } from '@apollo/client';

export const POLL_PUBLISH_RESULT = gql`
  mutation PollPublishResult($pollId: String!) {
    pollPublishResult(
      pollId: $pollId,
    )
  }`;

export default {
  POLL_PUBLISH_RESULT,
};
