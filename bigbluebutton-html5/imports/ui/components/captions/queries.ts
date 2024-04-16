import { gql } from '@apollo/client';

export interface CaptionTypedActiveLocale {
  lang: string;
  userOwner: {
      userId: string;
      name: string;
  };
}

export interface GetActiveCaptionsResponse {
  caption_typed_activeLocales: CaptionTypedActiveLocale[];
}

export const getActiveCaptions = gql`
  subscription getActiveCaptions {
    caption_typed_activeLocales {
      lang
      userOwner {
        userId
        name
      }
    }
  }
`;

export default {
  getActiveCaptions,
};
