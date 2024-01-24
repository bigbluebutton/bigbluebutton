import { gql } from '@apollo/client';

export const SET_RECORDING_STATUS = gql`
  mutation SetRecordingStatus($recording: Boolean!) {
    meetingRecordingSetStatus(
      recording: $recording,
    )
  }
`;

export default { SET_RECORDING_STATUS };
