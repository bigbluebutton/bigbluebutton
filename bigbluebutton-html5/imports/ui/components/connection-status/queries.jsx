import { gql } from '@apollo/client';

export const CONNECTION_STATUS_REPORT_SUBSCRIPTION = gql`subscription ConnStatusReport {
  user_connectionStatusReport(
  where: {
    _or: [
            { clientNotResponding: { _eq: true } },
            { lastUnstableStatus: { _is_null: false } }
          ]
  },
  order_by: {lastUnstableStatusAt: desc}
  ) {
    user {
      userId
      name
      avatar
      color
      isModerator
      currentlyInMeeting
    }
    clientNotResponding
    lastUnstableStatus
    lastUnstableStatusAt
    currentStatus
    connectionAliveAt
  }
}`;

export const USER_CURRENT_STATUS_SUBSCRIPTION = gql`
  subscription CurrentUserConnStatus($userId: String!) {
    user_connectionStatusReport(
      where: {
        user: {
          userId: { _eq: $userId }
        }
      }
    ) {
      currentStatus
    }
  }
`;

// does not change: This subscription is used by the backend to measure the server load
export const CONNECTION_STATUS_SUBSCRIPTION = gql`subscription ConnStatusWithTraceLog {
  user_connectionStatus {
    meetingId
    userId
    traceLog
    networkRttInMs
    statusUpdatedAt
  }
}`;

export default CONNECTION_STATUS_REPORT_SUBSCRIPTION;
