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
  SCREENSHARE_SUBSCRIPTION,
};
