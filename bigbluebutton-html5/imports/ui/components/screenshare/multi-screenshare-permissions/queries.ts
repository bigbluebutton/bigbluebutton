import { gql } from '@apollo/client';

export const meetingMultiScreensharePermissions = gql`
    subscription MySubscription {
      meeting {
        screenShareBroadcastAllowedFor
        viewerScreenShareViewAllowedFor
      }
    }
`;

export default {
  meetingMultiScreensharePermissions,
};
