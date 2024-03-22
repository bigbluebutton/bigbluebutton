import { gql } from '@apollo/client';
import { User } from '/imports/ui/Types/user';

export interface Caption {
  user: Pick<User, 'avatar' | 'color' | 'isModerator' | 'name'>;
  captionText: string;
  captionId: string;
  createdAt: string;
  captionType: string;
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
  subscription getCaptions {
    caption {
      user {
        avatar
        color
        isModerator
        name
      }
      captionText
      captionId
      createdAt
      captionType
    }
  }
`;

export default {
  GET_CAPTIONS,
};
