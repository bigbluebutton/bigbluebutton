import { gql } from '@apollo/client';

export interface GetServerTimeResponse {
  current_time: Array<{ currentTimestampWithoutTimeZone: Date }>;
}

export const GET_SERVER_TIME = gql`
  query getServerTime {
    current_time {
      currentTimestampWithoutTimeZone
    }
  }
`;

export default {
  GET_SERVER_TIME,
};
