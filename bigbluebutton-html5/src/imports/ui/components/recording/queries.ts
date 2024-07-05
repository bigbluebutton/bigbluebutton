import { gql } from '@apollo/client';

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
