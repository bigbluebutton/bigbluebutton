import { gql } from '@apollo/client';

interface IsBreakoutData {
  meetingId: string;
  isBreakout: boolean;
}

export interface IsBreakoutSubscriptionData {
  meeting: Array<IsBreakoutData>;
}

// TODO: rework when useMeeting hook be available
export const MEETING_ISBREAKOUT_SUBSCRIPTION = gql`
  subscription getIsBreakout {
    meeting {
      meetingId
      isBreakout
    }
  }
`;
