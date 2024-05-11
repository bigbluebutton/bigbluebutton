import { gql } from '@apollo/client';

export const UPDATE_CONNECTION_ALIVE_AT = gql`
  mutation UpdateConnectionAliveAt($networkRttInMs: Float!) {
    userSetConnectionAlive(
      networkRttInMs: $networkRttInMs
    )
  }`;

export default {
  UPDATE_CONNECTION_ALIVE_AT,
};
