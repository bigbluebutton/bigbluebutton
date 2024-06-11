import { gql } from '@apollo/client';

interface VoiceUsers {
  joined: string | null;
  listenOnly: string | null;
  muted: string | null;
  talking: string | null;
  userId: string;
}

export interface VoiceUsersResponse {
  user_voice: VoiceUsers[];
}

export const VOICE_USERS_SUBSCRIPTION = gql`
  subscription VoiceUsers {
    user_voice {
      joined
      listenOnly
      muted
      talking
      userId
    }
  }
`;

export default {
  VOICE_USERS_SUBSCRIPTION,
};
