import { gql } from '@apollo/client';

const SUBMIT_TRANSCRIPT = gql`
  mutation (
    $transcriptId: String!
    $transcript: String!
    $locale: String!
    $captionType: String!
  ) {
    captionSubmitTranscript(
      transcriptId: $transcriptId,
      transcript: $transcript,
      locale: $locale,
      captionType: $captionType
    )
  }
`;

export default SUBMIT_TRANSCRIPT;
