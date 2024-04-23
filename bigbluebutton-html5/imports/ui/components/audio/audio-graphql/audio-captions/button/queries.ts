import { gql } from '@apollo/client';

export interface GetAudioCaptionsCountResponse {
  caption_aggregate: {
    aggregate: {
      count: number;
    }
  };
}

export interface ActiveCaptionsResponse {
  caption_activeLocales: Array<{
    locale: string;
  }>;
}

export const getactiveCaptions = gql`
  subscription activeCaptions {
    caption_activeLocales {
      locale
    }
  }
`;

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
  getactiveCaptions,
};
