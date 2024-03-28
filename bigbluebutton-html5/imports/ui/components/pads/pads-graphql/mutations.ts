import { gql } from '@apollo/client';

export const CREATE_SESSION = gql`
  mutation createSession($externalId: String!) {
    sharedNotesCreateSession(
      sharedNotesExtId: $externalId
    )
  }
`;

export default {
  CREATE_SESSION,
};
