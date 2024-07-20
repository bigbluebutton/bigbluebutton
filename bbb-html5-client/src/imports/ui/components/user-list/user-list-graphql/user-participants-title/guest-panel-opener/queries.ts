import { gql } from '@apollo/client';

export interface GuestUsersCountResponse {
  user_guest_aggregate: {
    aggregate: {
      count: number;
    };
}
}

export const GET_GUESTS_COUNT = gql`
  subscription getGuestsCount {
    user_guest_aggregate(where: {isWaiting: {_eq: true}}) {
      aggregate {
        count
      }
    }
  }
`;

export default {
  GET_GUESTS_COUNT,
};
