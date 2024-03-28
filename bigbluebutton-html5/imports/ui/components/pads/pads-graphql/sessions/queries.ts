import { gql } from '@apollo/client';

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
  PAD_SESSION_SUBSCRIPTION,
};
