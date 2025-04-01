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

export const PRESENTATION_SET_WRITERS = gql`
  mutation PresentationSetWriters($pageId: String!, $usersIds: [String]!) {
    presentationSetWriters(
      pageId: $pageId,
      usersIds: $usersIds,
    )
  }
`;

export const PRESENTATION_SET_PAGE = gql`
  mutation PresentationSetPage($presentationId: String!, $pageId: String!) {
    presentationSetPage(
      presentationId: $presentationId,
      pageId: $pageId,
    )
  }
`;

export const PRESENTATION_SET_DOWNLOADABLE = gql`
  mutation PresentationSetDownloadable(
    $presentationId: String!,
    $downloadable: Boolean!,
    $fileStateType: String!,) {
    presentationSetDownloadable(
      presentationId: $presentationId,
      downloadable: $downloadable,
      fileStateType: $fileStateType,
    )
  }
`;

export const PRESENTATION_EXPORT = gql`
  mutation PresentationExport(
    $presentationId: String!,
    $fileStateType: String!,) {
    presentationExport(
      presentationId: $presentationId,
      fileStateType: $fileStateType,
    )
  }
`;

export const PRESENTATION_SET_CURRENT = gql`
  mutation PresentationSetCurrent($presentationId: String!) {
    presentationSetCurrent(
      presentationId: $presentationId,
    )
  }
`;

export const PRESENTATION_REMOVE = gql`
  mutation PresentationRemove($presentationId: String!) {
    presentationRemove(
      presentationId: $presentationId,
    )
  }
`;

export const PRES_ANNOTATION_DELETE = gql`
  mutation PresAnnotationDelete($pageId: String!, $annotationsIds: [String]!) {
    presAnnotationDelete(
      pageId: $pageId,
      annotationsIds: $annotationsIds,
    )
  }
`;

export const PRES_ANNOTATION_SUBMIT = gql`
  mutation PresAnnotationSubmit($pageId: String!, $annotations: json!) {
    presAnnotationSubmit(
      pageId: $pageId,
      annotations: $annotations,
    )
  }
`;

export const PRESENTATION_PUBLISH_CURSOR = gql`
  mutation PresentationPublishCursor($whiteboardId: String!, $xPercent: Float!, $yPercent: Float!) {
    presentationPublishCursor(
      whiteboardId: $whiteboardId,
      xPercent: $xPercent,
      yPercent: $yPercent,
    )
  }
`;

export const PRESENTATION_SET_PAGE_INFINITE_WHITEBOARD = gql`
  mutation PresentationSetPageInfiniteWhiteboard($pageId: String!, $infiniteWhiteboard: Boolean!) {
    presentationSetPageInfiniteWhiteboard(
      pageId: $pageId,
      infiniteWhiteboard: $infiniteWhiteboard
    )
  }
`;

export default {
  PRESENTATION_SET_ZOOM,
  PRESENTATION_SET_WRITERS,
  PRESENTATION_SET_PAGE,
  PRESENTATION_SET_DOWNLOADABLE,
  PRESENTATION_EXPORT,
  PRESENTATION_SET_CURRENT,
  PRESENTATION_REMOVE,
  PRES_ANNOTATION_DELETE,
  PRES_ANNOTATION_SUBMIT,
  PRESENTATION_PUBLISH_CURSOR,
  PRESENTATION_SET_PAGE_INFINITE_WHITEBOARD,
};
