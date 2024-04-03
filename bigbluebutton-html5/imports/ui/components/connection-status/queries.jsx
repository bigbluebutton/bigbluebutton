import { gql } from '@apollo/client';

export const CONNECTION_STATUS_REPORT_SUBSCRIPTION = gql`subscription ConnStatusReport {
  user_connectionStatusReport {
    user {
      userId
      name
      avatar
      color
      isModerator
      isOnline
    }
    clientNotResponding
    lastUnstableStatus
    lastUnstableStatusAt
    currentStatus
  }
}`;

export const CONNECTION_STATUS_SUBSCRIPTION = gql`subscription ConnStatus {
  user_connectionStatus {
    connectionAliveAt
    userClientResponseAt
    status
    statusUpdatedAt
  }
}`;

export default CONNECTION_STATUS_REPORT_SUBSCRIPTION;
