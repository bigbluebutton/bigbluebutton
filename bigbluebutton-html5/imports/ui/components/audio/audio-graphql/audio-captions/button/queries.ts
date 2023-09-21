import { gql } from '@apollo/client';

export interface GetAudioCaptionsCountResponse {
  audio_caption_aggregate: {
    aggregate: {
      count: number;
    }
  };
}

export const GET_AUDIO_CAPTIONS_COUNT = gql`
  subscription GetAudioCaptionsCount {
    audio_caption_aggregate {
      aggregate {
        count(columns: transcriptId)
      }
    }
  }
`;

export default {
  GET_AUDIO_CAPTIONS_COUNT,
};
