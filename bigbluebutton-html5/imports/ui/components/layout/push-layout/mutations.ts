import { gql } from '@apollo/client';

export const SET_SYNC_WITH_PRESENTER_LAYOUT = gql`
  mutation SetSyncWithPresenterLayout($syncWithPresenterLayout: Boolean!) {
    meetingLayoutSetSyncWithPresenterLayout(
      syncWithPresenterLayout: $syncWithPresenterLayout,
    )
  }
`;

export const SET_LAYOUT_PROPS = gql`
  mutation SetLayoutProps(
    $layout: String!,
    $syncWithPresenterLayout: Boolean!,
    $presentationIsOpen: Boolean!,
    $isResizing: Boolean!,
    $cameraPosition: String!,
    $focusedCamera: String!,
    $presentationVideoRate: Float!
  ) {
    meetingLayoutSetProps(
      layout: $layout,
      syncWithPresenterLayout: $syncWithPresenterLayout,
      presentationIsOpen: $presentationIsOpen,
      isResizing: $isResizing,
      cameraPosition: $cameraPosition,
      focusedCamera: $focusedCamera,
      presentationVideoRate: $presentationVideoRate,
    )
  }
`;

export default { SET_SYNC_WITH_PRESENTER_LAYOUT, SET_LAYOUT_PROPS };
