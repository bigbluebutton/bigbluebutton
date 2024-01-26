import { gql } from '@apollo/client';

export const CAMERA_BROADCAST_START = gql`
  mutation CameraBroadcastStart($cameraId: String!) {
    cameraBroadcastStart(
      stream: $cameraId
    )
  }
`;

export default {
  CAMERA_BROADCAST_START,
};
