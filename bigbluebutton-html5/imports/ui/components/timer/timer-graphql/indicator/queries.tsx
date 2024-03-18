import { gql } from '@apollo/client';

export interface GetTimerResponse {
  timer: Array<{
    accumulated: number;
    active: boolean;
    songTrack: string;
    time: number;
    stopwatch: boolean;
    running: boolean;
    startedOn: number;
    endedOn: number;
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
      startedOn
      endedOn
    }
  }
`;

export default GET_TIMER;
