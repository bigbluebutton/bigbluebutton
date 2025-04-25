import { gql } from '@apollo/client';

export const USER_AGGREGATE_COUNT_SUBSCRIPTION = gql`
subscription UsersCount {
  user_aggregate {
    aggregate {
      count
    }
  }
}
`;

export default {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
};
