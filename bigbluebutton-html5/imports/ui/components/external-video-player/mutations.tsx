import { gql } from '@apollo/client';

export const EXTERNAL_VIDEO_START = gql`
  mutation ExternalVideoStart($externalVideoUrl: String!) {
    externalVideoStart(
      externalVideoUrl: $externalVideoUrl
    )
  }
`;

export default { EXTERNAL_VIDEO_START };
