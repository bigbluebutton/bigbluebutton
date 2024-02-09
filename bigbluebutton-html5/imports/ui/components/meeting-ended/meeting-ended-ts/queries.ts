import { gql } from '@apollo/client';

export interface Meeting {
  learningDashboardAccessToken: string;
  isBreakout: boolean;
}

export interface MeetingClientSettings {
  askForFeedbackOnLogout: boolean;
  allowDefaultLogoutUrl: boolean;
  learningDashboardBase: string;
}

export interface UserCurrent {
  role: string;
}

export interface MeetingEndDataResponse {
    meeting: Meeting[];
    meeting_clientSettings: MeetingClientSettings[];
    user_current: UserCurrent[];
}

export const getMeetingEndData = gql`
  query getMeetingEndData {
    meeting {
      learningDashboardAccessToken
      isBreakout
      logoutUrl
    }
    meeting_clientSettings {
      askForFeedbackOnLogout: clientSettingsJson(path: "$.public.app.askForFeedbackOnLogout")
      allowDefaultLogoutUrl: clientSettingsJson(path: "$.public.app.allowDefaultLogoutUrl")
      learningDashboardBase: clientSettingsJson(path: "$.public.app.learningDashboardBase")
    }
    user_current {
      role
    }
  }
`;

export default {
  getMeetingEndData,
};
