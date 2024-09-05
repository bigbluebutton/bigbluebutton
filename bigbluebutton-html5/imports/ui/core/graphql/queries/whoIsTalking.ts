import { gql } from '@apollo/client';

export interface VoiceActivityResponse {
  user_voice_activity_stream: Array<{
    startTime: number | undefined;
    endTime: number | undefined;
    muted: boolean;
    talking: boolean;
    userId: string;
    user: {
      color: string;
      name: string;
      speechLocale: string | undefined;
    };
  }>;
}

export const VOICE_ACTIVITY = gql`
  subscription UserVoiceActivity {
    user_voice_activity_stream(
      cursor: { initial_value: { voiceActivityAt: "2020-01-01" } },
      batch_size: 10
    ) {
      muted
      startTime
      endTime
      talking
      userId
      user {
        color
        name
        speechLocale
      }
    }
  }
`;

export default VOICE_ACTIVITY;
