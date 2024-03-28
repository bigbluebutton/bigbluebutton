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

export const USER_SET_SPEECH_OPTIONS = gql`
  mutation UserSetSpeechOptions(
    $partialUtterances: Boolean!
    $minUtteranceLength: Float!
  ) {
    userSetSpeechOptions(
      partialUtterances: $partialUtterances
      minUtteranceLength: $minUtteranceLength
    )
  }
`;

export default {
  USER_MUTED,
  USER_SET_SPEECH_OPTIONS,
};
