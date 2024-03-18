import { gql } from '@apollo/client';

export const UPDATE_CONNECTION_ALIVE_AT = gql`
  mutation UpdateConnectionAliveAt {
    userSetConnectionAlive
  }`;

export const UPDATE_USER_CLIENT_RTT = gql`
  mutation UpdateConnectionRtt($networkRttInMs: Float!) {
    userSetConnectionRtt(
      networkRttInMs: $networkRttInMs
    )
  }`;

export default {
  UPDATE_CONNECTION_ALIVE_AT,
  UPDATE_USER_CLIENT_RTT,
};
