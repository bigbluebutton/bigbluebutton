import { gql } from '@apollo/client';

export const UPDATE_CONNECTION_ALIVE_AT = gql`
  mutation UpdateConnectionAliveAt($networkRttInMs: Float!, $traceLog: String) {
    userSetConnectionAlive(
      networkRttInMs: $networkRttInMs
      traceLog: $traceLog
    )
  }`;

export default {
  UPDATE_CONNECTION_ALIVE_AT,
};
