import { gql } from '@apollo/client';

export const UPDATE_ECHO_TEST_RUNNING = gql`
  mutation UpdateUserClientEchoTestRunningAt {
    userSetEchoTestRunning
  }
`;

export default {
  UPDATE_ECHO_TEST_RUNNING,
};
