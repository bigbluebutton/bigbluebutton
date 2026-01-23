import { gql } from '@apollo/client';

export interface ScreenshareResponse {
  contentType: string;
  showAsContent?: boolean;
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

export const MULTI_SCREENSHARE_SUBSCRIPTION = gql`
  subscription Screenshare {
    user_camera(where: {contentType: {_eq: "screenshare"}}) {
    contentType
    showAsContent
    hasAudio
    streamId
    userId
  }
}
`;

export const SINGLE_SCREENSHARE_SUBSCRIPTION = gql`
  subscription Screenshare {
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
  MULTI_SCREENSHARE_SUBSCRIPTION,
  SINGLE_SCREENSHARE_SUBSCRIPTION,
};
