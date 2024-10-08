import { gql } from '@apollo/client';

export interface TimerData {
  accumulated: number;
  active: boolean;
  songTrack: string;
  time: number;
  stopwatch: boolean;
  running: boolean;
  startedOn: number;
  startedAt: string;
  elapsed: boolean;
}

export interface GetTimerResponse {
  timer: Array<TimerData>;
}

export const GET_TIMER = gql`
  subscription Timer {
    timer {
      accumulated
      active
      songTrack
      time
      stopwatch
      running
      startedOn
      startedAt
      elapsed
    }
  }
`;

export default GET_TIMER;
