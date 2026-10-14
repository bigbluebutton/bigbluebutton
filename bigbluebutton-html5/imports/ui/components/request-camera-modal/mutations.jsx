import { gql } from '@apollo/client';

export const USER_CAMERA_REQUEST_ANSWER = gql`
  mutation userCameraRequestAnswer($accepted: Boolean!) {
    userCameraRequestAnswer(
      accepted: $accepted,
    )
  }
`;

export default {
  USER_CAMERA_REQUEST_ANSWER,
};
