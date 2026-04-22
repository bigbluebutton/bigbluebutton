import { gql } from '@apollo/client';

export interface MeetingEndDataResponse {
  user_current: Array<{
    meeting: {
      learningDashboard: {
        learningDashboardAccessToken: string;
      }
    };
  }>;
}

export const getMeetingEndData = gql`
query getMeetingEndData {
  user_current {
    meeting {
      learningDashboard {
        learningDashboardAccessToken
      }
    }
  }
}
`;

export default {
  getMeetingEndData,
};
