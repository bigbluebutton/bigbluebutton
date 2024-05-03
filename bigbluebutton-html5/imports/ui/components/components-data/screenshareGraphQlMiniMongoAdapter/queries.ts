import { gql } from '@apollo/client';

export interface GetPresentationUploadTokenSubscriptionResponse {
  data: {
    screenshare: ScreenshareType[];
  };
}

export interface ScreenshareType {
  contentType: string;
  hasAudio: boolean;
  screenshareConf: string;
  screenshareId: string;
  startedAt: string;
  stoppedAt: string | null;
  stream: string;
  vidHeight: number;
  vidWidth: number;
  voiceConf: string;
}

export const getScreenShareData = gql`
  subscription getPresentationUploadToken {
    screenshare {
      contentType
      hasAudio
      screenshareConf
      screenshareId
      startedAt
      stoppedAt
      stream
      vidHeight
      vidWidth
      voiceConf
    }
  }
`;

export default {
  getScreenShareData,
};
