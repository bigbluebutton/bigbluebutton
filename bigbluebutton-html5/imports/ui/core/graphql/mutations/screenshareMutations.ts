import { gql } from '@apollo/client';

export const SET_SCREENSHARE_SHOW_AS_CONTENT = gql`
  mutation SetScreenshareShowAsContent($streamId: String!, $showAsContent: Boolean!) {
    screenshareSetShowAsContent(streamId: $streamId, showAsContent: $showAsContent)
  }
`;

export default {
  SET_SCREENSHARE_SHOW_AS_CONTENT,
};
