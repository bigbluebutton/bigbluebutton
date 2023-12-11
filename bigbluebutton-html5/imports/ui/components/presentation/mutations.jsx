import { gql } from '@apollo/client';

export const PRESENTATION_SET_ZOOM = gql`
  mutation PresentationSetZoom($presentationId: String!, $pageId: String!, $pageNum: Int!, $xOffset: Float!, $yOffset: Float!, $widthRatio: Float!, $heightRatio: Float!) {
    presentationSetZoom(
      presentationId: $presentationId,
      pageId: $pageId,
      pageNum: $pageNum,
      xOffset: $xOffset,
      yOffset: $yOffset,
      widthRatio: $widthRatio,
      heightRatio: $heightRatio,
    )
  }
`;

export default {
  PRESENTATION_SET_ZOOM,
};
