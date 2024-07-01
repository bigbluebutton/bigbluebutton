import { gql } from '@apollo/client';

export const SET_MUTED = gql`
  mutation SetMuted($muted: Boolean!, $exceptPresenter: Boolean!) {
    meetingSetMuted(
      muted: $muted,
      exceptPresenter: $exceptPresenter,
    )
  }
`;

export default { SET_MUTED };
