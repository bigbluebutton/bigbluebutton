import { gql } from '@apollo/client';

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