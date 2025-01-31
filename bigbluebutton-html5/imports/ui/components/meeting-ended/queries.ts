import { gql } from '@apollo/client';

export interface MeetingEndDataResponse {
  user_current: Array<{
    isModerator: boolean;
    logoutUrl: string;
    meeting: {
      learningDashboard: {
        learningDashboardAccessToken: string;
      }
      isBreakout: boolean;
      clientSettings: {
        skipMeetingEnded: boolean,
        allowDefaultLogoutUrl: boolean;
        learningDashboardBase: string;
      };
    };
  }>;
}

export const getMeetingEndData = gql`
query getMeetingEndData {
  user_current {
    isModerator
    logoutUrl
    meeting {
      learningDashboard {
        learningDashboardAccessToken
      }
      isBreakout
      clientSettings {
        skipMeetingEnded: clientSettingsJson(path: "$.public.app.skipMeetingEnded")
        allowDefaultLogoutUrl: clientSettingsJson(path: "$.public.app.allowDefaultLogoutUrl")
        learningDashboardBase: clientSettingsJson(path: "$.public.app.learningDashboardBase")
      }
    }
  }
}
`;

export default {
  getMeetingEndData,
};
