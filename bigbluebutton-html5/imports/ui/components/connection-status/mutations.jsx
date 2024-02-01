import { gql } from '@apollo/client';

export const UPDATE_CONNECTION_ALIVE_AT = gql`
  mutation UpdateConnectionAliveAt($userId: String, $connectionAliveAt: timestamp) {
    update_user_connectionStatus(
      where: {},
      _set: { connectionAliveAt: "now()" }
    ) {
      affected_rows
    }
  }`;

export const UPDATE_USER_CLIENT_RESPONSE_AT = gql`
  mutation UpdateConnectionClientResponse($networkRttInMs: numeric) {
    update_user_connectionStatus(
      where: {userClientResponseAt: {_is_null: true}}
      _set: { 
        userClientResponseAt: "now()",
        networkRttInMs: $networkRttInMs 
      }
    ) {
      affected_rows
    }
  }`;

export default {
  UPDATE_CONNECTION_ALIVE_AT,
  UPDATE_USER_CLIENT_RESPONSE_AT,
};
