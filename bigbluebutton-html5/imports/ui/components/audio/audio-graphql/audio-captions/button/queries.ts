import { gql } from '@apollo/client';

export interface GetAudioCaptionsCountResponse {
  caption_aggregate: {
    aggregate: {
      count: number;
    }
  };
}

export const GET_AUDIO_CAPTIONS_COUNT = gql`
  subscription GetAudioCaptionsCount {
    caption_aggregate {
      aggregate {
        count(columns: captionId)
      }
    }
  }
`;

export default {
  GET_AUDIO_CAPTIONS_COUNT,
};
