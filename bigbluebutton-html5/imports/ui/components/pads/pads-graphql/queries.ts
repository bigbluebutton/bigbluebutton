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

export interface PadSessionSubscriptionResponse {
  sharedNotes_session: Array<{
    sessionId: string;
    sharedNotesExtId: string;
    padId: string;
    sharedNotes: {
      padId: string;
    };
  }>;
}

export const PAD_SESSION_SUBSCRIPTION = gql`
  subscription padSession {
    sharedNotes_session {
      sessionId
      sharedNotesExtId
      padId
      sharedNotes {
        padId
      }
    }
  }
`;

export default {
  HAS_PAD_SUBSCRIPTION,
  PAD_SESSION_SUBSCRIPTION,
};
