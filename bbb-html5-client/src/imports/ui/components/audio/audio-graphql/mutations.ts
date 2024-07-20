import { gql } from '@apollo/client';

export const USER_SET_MUTED = gql`
  mutation UserSetMuted($userId: String, $muted: Boolean!) {
    userSetMuted(
      userId: $userId,
      muted: $muted
    )
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
  USER_SET_MUTED,
  USER_SET_SPEECH_OPTIONS,
};
