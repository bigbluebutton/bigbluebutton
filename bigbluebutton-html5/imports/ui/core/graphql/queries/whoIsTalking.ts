import { gql } from '@apollo/client';
import { UserVoice } from '/imports/ui/Types/userVoice';

export interface WhoIsTalkingResponse {
  user_voice: Array<Partial<UserVoice>>;
}

const WHO_IS_TALKING = gql`
  subscription WhoIsTalkingSubscription {
    user_voice(
      order_by: [{ startTime: asc_nulls_last }]
    ) {
      callerName
      floor
      joined
      listenOnly
      muted
      showTalkingIndicator
      spoke
      startTime
      talking
      userId
      voiceUserId
      user {
        color
        name
        speechLocale
      }
    }
  }
`;

export default WHO_IS_TALKING;
