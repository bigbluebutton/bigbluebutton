import { gql } from '@apollo/client';

export const CURRENT_UNJOINED_USER_SUBSCRIPTION = gql`
  subscription CurrentUnjoinedUserSubscription {
    user_current {
      authToken
      ejectReasonCode
      extId
      joinErrorCode
      joinErrorMessage
      joined
      name
      userId
      loggedOut
    }
  }
`;

export default CURRENT_UNJOINED_USER_SUBSCRIPTION;
