import { gql } from '@apollo/client';

export const TIMER_ACTIVATE = gql`
  mutation timerActivate($stopwatch: Boolean!, $running: Boolean!, $time: Int!) {
    timerActivate(
      stopwatch: $stopwatch,
      running: $running,
      time: $time
    )
  }
`;

export const TIMER_DEACTIVATE = gql`
  mutation timerDeactivate {
    timerDeactivate
  }
`;

export const TIMER_RESET = gql`
  mutation timerReset {
    timerReset
  }
`;

export const TIMER_START = gql`
  mutation timerStart {
    timerStart
  }
`;

export const TIMER_STOP = gql`
  mutation timerStop {
    timerStop
  }
`;

export const TIMER_SWITCH_MODE = gql`
  mutation timerSwitchMode($stopwatch: Boolean!) {
    timerSwitchMode(stopwatch: $stopwatch)
  }
`;

export const TIMER_SET_SONG_TRACK = gql`
  mutation timerSetSongTrack($track: String!) {
    timerSetSongTrack(track: $track)
  }
`;

export const TIMER_SET_TIME = gql`
  mutation timerSetTime($time: Int!) {
    timerSetTime(time: $time)
  }
`;

export default {
  TIMER_ACTIVATE,
  TIMER_DEACTIVATE,
  TIMER_RESET,
  TIMER_START,
  TIMER_STOP,
  TIMER_SWITCH_MODE,
  TIMER_SET_SONG_TRACK,
  TIMER_SET_TIME,
};
