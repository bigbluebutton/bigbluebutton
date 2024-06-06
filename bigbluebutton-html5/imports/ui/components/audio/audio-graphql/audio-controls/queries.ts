import { gql } from '@apollo/client';

export const UPDATE_ECHO_TEST_RUNNING = gql`
  mutation UpdateUserClientEchoTestRunningAt {
    update_user_current(where: {}, _set: { echoTestRunningAt: "now()" }) {
      affected_rows
    }
  }
`;

export default {
  UPDATE_ECHO_TEST_RUNNING,
};
