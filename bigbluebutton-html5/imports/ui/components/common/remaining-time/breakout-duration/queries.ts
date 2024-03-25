import { gql } from '@apollo/client';

export type breakoutDataResponse = {
  breakoutRoom: Array<{durationInSeconds: number, startedAt: string}>;
}

export const FIRST_BREAKOUT_DURATION_DATA_SUBSCRIPTION = gql`
  subscription firstBreakoutData {
    breakoutRoom(limit: 1) {
      durationInSeconds
      startedAt
    }
  }
`;

export default {
  FIRST_BREAKOUT_DURATION_DATA_SUBSCRIPTION,
};
