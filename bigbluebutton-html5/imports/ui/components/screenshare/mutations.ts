import { gql } from '@apollo/client';

export const SCREENSHARE_SET_SHOW_AS_CONTENT = gql`
  mutation ScreenshareSetShowAsContent($streamId: String!, $showAsContent: Boolean!) {
    screenshareSetShowAsContent(streamId: $streamId, showAsContent: $showAsContent)
  }
`;

export default {
  SCREENSHARE_SET_SHOW_AS_CONTENT,
};
