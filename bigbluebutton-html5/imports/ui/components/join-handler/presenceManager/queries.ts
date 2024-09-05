import { gql } from '@apollo/client';

export interface GetUserCurrentResponse {
  user_current: Array<{
    userId: string;
    authToken: string;
    joined: boolean;
    joinErrorCode: string;
    joinErrorMessage: string;
    ejectReasonCode: string;
    loggedOut: boolean;
    guestStatus: string;
    guestStatusDetails: {
      guestLobbyMessage: string | null;
      positionInWaitingQueue: number;
      isAllowed: boolean;
    } | null;
    meeting: {
      ended: boolean;
      endedReasonCode: string;
      endedByUserName: string;
      logoutUrl: string;
    };
  }>;
}

export interface GetUserInfoResponse {
  meeting: Array<{
    meetingId: string;
    name: string;
    logoutUrl: string;
    bannerColor: string;
    bannerText: string;
    customLogoUrl: string;
    customDarkLogoUrl: string;
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
    bannerColor
    bannerText
    customLogoUrl
    customDarkLogoUrl
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
      loggedOut
      guestStatus
      meeting {
        ended
        endedReasonCode
        endedByUserName
        logoutUrl
      }
      guestStatusDetails {
        guestLobbyMessage
        positionInWaitingQueue
        isAllowed
      }
    }
  }
`;
export const userJoinMutation = gql`
mutation UserJoin($authToken: String!, $clientType: String!, $clientIsMobile: Boolean!) {
  userJoinMeeting(
    authToken: $authToken,
    clientType: $clientType,
    clientIsMobile: $clientIsMobile,
  )
}
`;
export default {
  getUserCurrent,
  userJoinMutation,
  getUserInfo,
};
