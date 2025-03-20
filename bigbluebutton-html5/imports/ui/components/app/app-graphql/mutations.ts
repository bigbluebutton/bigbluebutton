import { gql } from '@apollo/client';

export const SET_PRESENTATION_FIT_TO_WIDTH = gql`
  mutation presentationSetFitToWidth(
  $fitToWidth: Boolean!
  $pageId: String!
) {
  presentationSetFitToWidth(
    fitToWidth: $fitToWidth
    pageId: $pageId
  )
}
`;

export default {
  SET_PRESENTATION_FIT_TO_WIDTH,
};
