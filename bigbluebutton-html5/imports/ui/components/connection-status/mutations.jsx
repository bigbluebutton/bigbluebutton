import { gql } from '@apollo/client';

export const UPDATE_CONNECTION_ALIVE_AT = gql`
  mutation UpdateConnectionAliveAt($serverRequestId: String!, $clientSessionUUID: String!, $networkRttInMs: Float!, $applicationRttInMs: Float, $traceLog: String) {
    userSetConnectionAlive(
      serverRequestId: $serverRequestId
      clientSessionUUID: $clientSessionUUID
      networkRttInMs: $networkRttInMs
      applicationRttInMs: $applicationRttInMs
      traceLog: $traceLog
    )
  }`;

export default {
  UPDATE_CONNECTION_ALIVE_AT,
};
