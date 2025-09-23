import { gql } from '@apollo/client';

export interface UsersCountSubscriptionResponse {
  user_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

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
