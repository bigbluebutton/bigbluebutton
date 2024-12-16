import { gql } from '@apollo/client';

export const CAMERA_BROADCAST_START = gql`
  mutation CameraBroadcastStart($cameraId: String!, $contentType: String!) {
    cameraBroadcastStart(
      stream: $cameraId
      contentType: $contentType
    )
  }
`;

export const CAMERA_BROADCAST_STOP = gql`
  mutation CameraBroadcastStop($cameraId: String!) {
    cameraBroadcastStop(
      stream: $cameraId
    )
  }
`;

export default {
  CAMERA_BROADCAST_START,
  CAMERA_BROADCAST_STOP,
};
