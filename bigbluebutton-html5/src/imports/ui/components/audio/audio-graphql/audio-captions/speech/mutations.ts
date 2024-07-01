import { gql } from '@apollo/client';

export const SUBMIT_TEXT = gql`
  mutation SubmitText(
    $transcriptId: String!
    $start: Int!
    $end: Int!
    $text: String!
    $transcript: String!
    $locale: String!
    $isFinal: Boolean!
  ) {
    captionSubmitText(
      transcriptId: $transcriptId,
      start: $start,
      end: $end,
      text: $text,
      transcript: $transcript,
      locale: $locale,
      isFinal: $isFinal,
    )
  }
`;

export default {
  SUBMIT_TEXT,
};
