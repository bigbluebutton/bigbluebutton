import { gql } from '@apollo/client';

export const SET_SYNC_WITH_PRESENTER_LAYOUT = gql`
  mutation SetSyncWithPresenterLayout($syncWithPresenterLayout: Boolean!) {
    meetingLayoutSetSyncWithPresenterLayout(
      syncWithPresenterLayout: $syncWithPresenterLayout,
    )
  }
`;

export default { SET_SYNC_WITH_PRESENTER_LAYOUT };
