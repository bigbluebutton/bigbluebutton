import { gql } from '@apollo/client';

export interface UserMutedResponse {
  user_voice: Array<{
    muted: boolean;
    userId: string;
  }>;
}

export const USER_MUTED = gql`
  subscription UserMuted {
    user_voice {
      muted
      userId
    }
  }
`;

export default {
  USER_MUTED,
};
