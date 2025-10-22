import { gql } from '@apollo/client';

export interface UserMutedResponse {
  user_voice_activity_stream: Array<{
    talking: boolean;
    muted: boolean;
    userId: string;
    user: {
      color: string;
      name: string;
      speechLocale: string | undefined;
    };
  }>;
}

// This subscription is handled by bbb-graphql-middleware and its content should not be modified
export const USER_MUTED = gql`
  subscription getUserVoiceStateStream {
    user_voice_activity_stream(
      cursor: { initial_value: { voiceActivityAt: "2020-01-01" } },
      batch_size: 10
    ) {
      talking
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
