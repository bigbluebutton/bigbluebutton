import { gql } from '@apollo/client';

const SUBMIT_TRANSCRIPT = gql`
  mutation (
    $transcriptId: String!
    $transcript: String!
    $locale: String!
  ) {
    captionSubmitTranscript(
      transcriptId: $transcriptId,
      transcript: $transcript,
      locale: $locale,
    )
  }
`;

export default SUBMIT_TRANSCRIPT;
