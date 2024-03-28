import { gql } from '@apollo/client';

const POLL_RESULTS_SUBSCRIPTION = gql`
  subscription PollResults {
    poll (where: {published: {_eq: true}}, order_by: [{ publishedAt: desc }], limit: 1) {
      ended
      published
      publishedAt
      pollId
      type
      questionText
      responses {
        optionDesc
        optionId
        optionResponsesCount
        pollResponsesCount
      }
    }
  }
`;

export default POLL_RESULTS_SUBSCRIPTION;
