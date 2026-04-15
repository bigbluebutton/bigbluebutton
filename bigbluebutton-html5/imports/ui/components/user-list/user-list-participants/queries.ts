import { gql } from '@apollo/client';

export interface UsersCountSubscriptionResponse {
  user_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const USER_AGGREGATE_COUNT_SUBSCRIPTION = gql`
subscription UsersCount($where: user_bool_exp) {
  user_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
`;

export default {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
};
