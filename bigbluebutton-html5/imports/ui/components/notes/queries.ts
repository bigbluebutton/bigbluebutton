import { gql } from '@apollo/client';

export interface GetPadIdQueryResponse {
  sharedNotes: Array<{
    padId: string;
    sharedNotesExtId: string;
  }>;
}

export const GET_PAD_ID = gql`
  query getPadId($externalId: String!) {
    sharedNotes(where: { sharedNotesExtId: { _eq: $externalId } }) {
      padId
      sharedNotesExtId
    }
  }
`;

export default {
  GET_PAD_ID,
};
