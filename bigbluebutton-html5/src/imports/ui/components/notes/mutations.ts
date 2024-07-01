import { gql } from '@apollo/client';

export const PIN_NOTES = gql`
  mutation pinNotes($pinned: Boolean!) {
    sharedNotesSetPinned(
      sharedNotesExtId: notes,
      pinned: $pinned
    )
  }
`;

export default {
  PIN_NOTES,
};
