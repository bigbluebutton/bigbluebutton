import { gql } from '@apollo/client';

export const EXTERNAL_VIDEO_START = gql`
  mutation ExternalVideoStart($externalVideoUrl: String!) {
    externalVideoStart(
      externalVideoUrl: $externalVideoUrl
    )
  }
`;

export const EXTERNAL_VIDEO_UPDATE = gql`
  mutation ExternalVideoUpdate(
    $status: String!
    $rate: Float!,
    $time: Float!,
    $state: Float!,
  ) {
    externalVideoUpdate(
      status: $status,
      rate: $rate,
      time: $time,
      state: $state,
    )
  }
`;

export const EXTERNAL_VIDEO_STOP = gql`
  mutation ExternalVideoStop {
    externalVideoStop
  }
`;

export default { EXTERNAL_VIDEO_START, EXTERNAL_VIDEO_UPDATE, EXTERNAL_VIDEO_STOP };
