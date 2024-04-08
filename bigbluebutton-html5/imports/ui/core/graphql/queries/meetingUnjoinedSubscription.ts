import { gql } from '@apollo/client';

export const MEETING_UNJOINED_SUBSCRIPTION = gql`
  subscription MeetingUnjoinedSubscription {
    meeting {
      bannerColor
      bannerText
      ended
      endedByUserName
      endedReasonCode
      logoutUrl
      meetingId
      name
    }
  }
`;

export default {
  MEETING_UNJOINED_SUBSCRIPTION,
};
