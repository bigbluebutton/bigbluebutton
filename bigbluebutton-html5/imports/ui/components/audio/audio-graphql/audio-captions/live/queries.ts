import { gql } from '@apollo/client';
import { User } from '/imports/ui/Types/user';

export interface Caption {
  user: Pick<User, 'avatar' | 'color' | 'isModerator' | 'name'>;
  captionText: string;
  captionId: string;
  captionType: string;
  createdAt: string;
}

export interface getCaptions {
  caption: Caption[];
}

export interface GetAudioCaptions {
  audio_caption: Array<{
    user: {
      avatar: string;
      color: string;
      isModerator: boolean;
      name: string;
    };
    transcript: string;
    transcriptId: string;
  }>;
}

export const GET_CAPTIONS = gql`
  subscription getCaptions($locale: String!) {
    caption(where: {locale: {_eq: $locale}}) {
      user {
        avatar
        color
        isModerator
        name
      }
      captionText
      captionId
      captionType
      createdAt
    }
  }
`;

export default {
  GET_CAPTIONS,
};
