import { gql } from '@apollo/client';

export interface GetGuestLobbyInfo {
  user_current: Array<{
    guestStatusDetails: {
      guestLobbyMessage: string | null;
      positionInWaitingQueue: number;
      isAllowed: boolean;
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
}
`;

export const getGuestLobbyInfo = gql`
subscription getGuestLobbyInfo {
    user_current {
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
  userJoinMutation,
  getUserInfo,
};
