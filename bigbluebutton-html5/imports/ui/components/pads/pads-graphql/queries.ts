import { gql } from '@apollo/client';

export interface HasPadSubscriptionResponse {
  sharedNotes: Array<{
    sharedNotesExtId: string;
  }>;
}

export interface GetPadIdQueryResponse {
  sharedNotes: Array<{
    padId: string;
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

export const GET_PAD_ID = gql`
  query getPadId($externalId: String!) {
    sharedNotes(
      where: { sharedNotesExtId: { _eq: $externalId } }
    ) {
      padId
      sharedNotesExtId
    }
  }
`;

export default {
  HAS_PAD_SUBSCRIPTION,
  GET_PAD_ID,
};
