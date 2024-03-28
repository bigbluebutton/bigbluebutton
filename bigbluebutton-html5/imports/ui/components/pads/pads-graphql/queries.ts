import { gql } from '@apollo/client';

export interface HasPadSubscriptionResponse {
  sharedNotes: Array<{
    sharedNotesExtId: string;
  }>;
}

export const HAS_PAD_SUBSCRIPTION = gql`
  subscription hasPad($externalId: String!) {
    sharedNotes(
      where: { sharedNotesExtId: { _eq: $externalId } }
    ) {
      sharedNotesExtId
    }
  }
`;

export default {
  HAS_PAD_SUBSCRIPTION,
};
