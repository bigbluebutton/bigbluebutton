import { gql } from '@apollo/client';

export interface GetServerTimeResponse {
  currentTime: Array<{ currentTimestamp: Date }>;
}

export const GET_SERVER_TIME = gql`
  query getServerTime {
    current_time {
      currentTimestamp
    }
  }
`;

export default {
  GET_SERVER_TIME,
};
