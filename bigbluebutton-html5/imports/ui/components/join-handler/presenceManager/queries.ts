import { gql } from '@apollo/client';

export interface GetUserCurrentResponse {
  user_current: Array<{
    userId: string;
    authToken: string;
    joined: boolean;
    joinErrorCode: string;
    joinErrorMessage: string;
    ejectReasonCode: string;
    meeting: {
      ended: boolean;
      endedReasonCode: string;
      endedBy: string;
    };
  }>;
}

export interface GetUserInfoResponse {
  meeting: Array<{
    meetingId: string;
    name: string;
    logoutUrl: string;
  }>;
  user_current: Array<{
    extId: string;
    name: string;
    userId: string;
  }>;
}

export const getUserInfo = gql`
query getUserInfo {
  meeting {
    meetingId
    name
    logoutUrl
  }
  user_current {
    extId
    name
    userId
  }
}
`;

export const getUserCurrent = gql`
subscription getUserCurrent {
    user_current {
      userId
      authToken
      joinErrorCode
      joinErrorMessage
      joined
      ejectReasonCode
      meeting {
        ended
        endedReasonCode
        endedBy
      }
    }
  }
`;
export const userJoinMutation = gql`
mutation UserJoin($authToken: String!, $clientType: String!) {
  userJoinMeeting(
    authToken: $authToken,
    clientType: $clientType,
  )
}
`;
export default {
  getUserCurrent,
  userJoinMutation,
  getUserInfo,
};
