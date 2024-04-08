import { gql } from '@apollo/client';

export interface PinnedPadSubscriptionResponse {
  sharedNotes: Array<{
    pinned: boolean;
    sharedNotesExtId: string;
  }>;
}

export const PINNED_PAD_SUBSCRIPTION = gql`
  subscription isSharedNotesPinned {
    sharedNotes(where: { pinned: { _eq: true } }) {
      pinned
      sharedNotesExtId
      model
    }
  }
`;

export default { PINNED_PAD_SUBSCRIPTION };
