import { gql } from '@apollo/client';

export interface VoiceActivityResponse {
  user_voice_activity_stream: Array<{
    userId: string;
    voiceUserId: string;
    talking: boolean;
    muted: boolean;
    leftVoiceConf: boolean;
    user: {
      color: string;
      name: string;
      speechLocale: string | undefined;
      role: string;
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
      userId
      voiceUserId
      talking
      muted
      leftVoiceConf
      user {
        color
        name
        speechLocale
        role
      }
    }
  }
`;

export default VOICE_ACTIVITY;
