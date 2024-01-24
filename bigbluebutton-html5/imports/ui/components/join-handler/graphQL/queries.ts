import { gql } from '@apollo/client';

export interface GetUserCurrentResponse {
  user_current: Array<{
    userId: string;
    authToken: string;
    authed: boolean;
    joinErrorCode: string;
    joinErrorMessage: string;
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
subscription {
    user_current {
      userId
      authToken
      authed
      joinErrorCode
      joinErrorMessage
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
