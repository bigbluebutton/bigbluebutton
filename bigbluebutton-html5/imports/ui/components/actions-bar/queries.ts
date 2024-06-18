import { gql } from '@apollo/client';

interface ScreenShare {
  contentType: string;
}

export interface GetScreenShareTypeResponse {
  screenshare: ScreenShare[];
}

export const getSceenShareType = gql`
  subscription getSceenShareType {
    screenshare {
      contentType
    }
  }
`;

export default {
  getSceenShareType,
};
