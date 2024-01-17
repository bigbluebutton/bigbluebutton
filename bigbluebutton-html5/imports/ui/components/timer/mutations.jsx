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
  mutation timerStop($accumulated: Float!) {
    timerStop(accumulated: $accumulated)
  }
`;

export default {
  TIMER_ACTIVATE,
  TIMER_DEACTIVATE,
  TIMER_RESET,
  TIMER_START,
  TIMER_STOP,
};
