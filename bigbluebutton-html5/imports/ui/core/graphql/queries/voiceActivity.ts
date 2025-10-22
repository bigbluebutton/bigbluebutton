import { gql } from '@apollo/client';

export interface VoiceActivityResponse {
  user_voice_activity_stream: Array<{
    talking: boolean;
    muted: boolean;
    userId: string;
    voiceUserId: string;
    user: {
      color: string;
      name: string;
      speechLocale: string | undefined;
    };
  }>;
}

// This subscription is handled by bbb-graphql-middleware and its content should not be modified
export const VOICE_ACTIVITY = gql`
  subscription getUserVoiceStateStream {
    user_voice_activity_stream(
      cursor: { initial_value: { voiceActivityAt: "2020-01-01" } },
      batch_size: 10
    ) {
      talking
      muted
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

export default VOICE_ACTIVITY;
