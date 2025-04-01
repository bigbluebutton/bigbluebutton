import { gql } from '@apollo/client';

export const UPDATE_ECHO_TEST_RUNNING = gql`
  mutation UpdateUserClientEchoTestRunningAt {
    userSetEchoTestRunning
  }
`;

export const MEETING_IS_BREAKOUT = gql`
  query MeetingIsBreakout {
    meeting {
      isBreakout
      breakoutPolicies {
        parentId
      }
    }
  }
`;

export default {
  UPDATE_ECHO_TEST_RUNNING,
  MEETING_IS_BREAKOUT,
};
