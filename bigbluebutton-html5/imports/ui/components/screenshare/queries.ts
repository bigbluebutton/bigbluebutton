import { gql } from '@apollo/client';

export interface ScreenshareResponse {
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

export const SCREENSHARE_SUBSCRIPTION = gql`
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

export default {
  SCREENSHARE_SUBSCRIPTION,
};
