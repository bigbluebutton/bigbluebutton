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

export const CONNECTION_STATUS_SUBSCRIPTION = gql`subscription ConnStatus {
  user_connectionStatus {
    connectionAliveAt
    userClientResponseAt
    status
    statusUpdatedAt
  }
}`;

export default CONNECTION_STATUS_REPORT_SUBSCRIPTION;
