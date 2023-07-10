import { gql } from '@apollo/client';
import { UserVoice } from '/imports/ui/Types/userVoice';

interface IsBreakoutData {
  meetingId: string;
  isBreakout: boolean;
}

export interface TalkingIndicatorSubscriptionData {
  user_voice: Array<Partial<UserVoice>>;
}

export interface IsBreakoutSubscriptionData {
  meeting: Array<IsBreakoutData>;
}

export const TALKING_INDICATOR_SUBSCRIPTION = gql`
  subscription TalkingIndicatorSubscription($limit: Int!) {
    user_voice(
      where: { showTalkingIndicator: { _eq: true } }
      order_by: [{ startTime: desc_nulls_last }, { endTime: desc_nulls_last }]
      limit: $limit
    ) {
      callerName
      spoke
      talking
      floor
      startTime
      muted
      userId
      user {
        color
        name
        speechLocale
      }
    }
  }
`;

// TODO: rework when useMeeting hook be avaible
export const MEETING_ISBREAKOUT_SUBSCRIPTION = gql`
  subscription getIsBreakout {
    meeting {
      meetingId
      isBreakout
    }
  }
`;
