import { gql } from '@apollo/client';

export const TALKING_INDICATOR_SUBSCRIPTION = gql`subscription UserVoice($limit: Int!, ) {
    user_voice(where: {showTalkingIndicator: {_eq: true}}, order_by: [{startTime: desc_nulls_last}, {endTime: desc_nulls_last}], limit: $limit) {
        user {
          name
          color
          userId
        }
        floor
        spoke
        joined
        muted
        startTime
        talking
      }
  }`;

export const MEETING_IS_BREAKOUT = gql ` subscription MeetingIsBreakout {
    meeting {
      isBreakout
    }
  }`;
 
  export default {
    TALKING_INDICATOR_SUBSCRIPTION,
    MEETING_IS_BREAKOUT,
  };