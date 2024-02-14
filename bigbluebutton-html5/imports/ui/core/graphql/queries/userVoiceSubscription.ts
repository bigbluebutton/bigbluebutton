import { gql } from '@apollo/client';

const TALKING_INDICATOR_SUBSCRIPTION = gql`
  subscription TalkingIndicatorSubscription($limit: Int!) {
    user_voice(
      where: { showTalkingIndicator: { _eq: true } }
      order_by: [{ startTime: asc_nulls_last }]
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

export default TALKING_INDICATOR_SUBSCRIPTION;
