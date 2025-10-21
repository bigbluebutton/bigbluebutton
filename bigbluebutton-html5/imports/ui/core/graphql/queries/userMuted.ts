import { gql } from "@apollo/client";

export interface UserMutedResponse {
  user_voice_activity_stream: Array<{
    muted: boolean;
    userId: string;
  }>;
}

export const USER_MUTED = gql`
  subscription getUserMutedStateStream {
    user_voice_activity_stream(
      cursor: { initial_value: { voiceActivityAt: "2020-01-01" } },
      batch_size: 10
    ) {
      muted
      userId
    }
  }
`;
