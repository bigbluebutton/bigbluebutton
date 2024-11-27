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
