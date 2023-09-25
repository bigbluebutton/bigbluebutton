import { gql } from '@apollo/client';

export interface GetTimerResponse {
  timer: Array<{
    accumulated: number;
    active: boolean;
    songTrack: string;
    time: number;
    stopwatch: boolean;
    running: boolean;
    startedAt: number;
    endedAt: number;
  }>;
}

export const GET_TIMER = gql`
  subscription MySubscription {
    timer {
      accumulated
      active
      songTrack
      time
      stopwatch
      running
      startedAt
      endedAt
    }
  }
`;

export default GET_TIMER;
