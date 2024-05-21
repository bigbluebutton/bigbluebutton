import { gql } from '@apollo/client';

const POLL_SUBSCRIPTION = gql`
  subscription PollPublished {
    poll {
      published
    }
  }
`;

export default POLL_SUBSCRIPTION;
