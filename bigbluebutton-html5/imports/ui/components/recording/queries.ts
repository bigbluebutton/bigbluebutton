import { gql } from '@apollo/client';

export interface GetRecordingResponse {
  meeting_recording: {
    isRecording: boolean;
    previousRecordedTimeInSeconds: number;
  }[]
}

export const GET_RECORDINGS = gql`
  subscription getRecordingData {
    meeting_recording {
      isRecording
      previousRecordedTimeInSeconds
    }
  }
`;

export default {
  GET_RECORDINGS,
};
