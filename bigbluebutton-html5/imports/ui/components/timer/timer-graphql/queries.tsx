import { gql } from '@apollo/client';

export interface TimerData {
  accumulated: number;
  active: boolean;
  songTrack: string;
  time: number;
  stopwatch: boolean;
  running: boolean;
  startedOn: number;
  endedOn: number;
  startedAt: string;
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
      endedOn
    }
  }
`;

export default GET_TIMER;
