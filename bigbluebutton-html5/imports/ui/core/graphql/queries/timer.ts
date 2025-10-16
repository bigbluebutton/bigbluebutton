import { gql } from '@apollo/client';

export interface TimerData {
  accumulated: number;
  active: boolean;
  songTrack: string;
  time: number;
  stopwatch: boolean;
  running: boolean;
  startedAt: string | null;
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
      startedAt
      elapsed
    }
  }
`;

export default {
  GET_TIMER,
};
