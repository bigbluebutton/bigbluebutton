import { gql } from '@apollo/client';

export const MEETING_PERMISSIONS_SUBSCRIPTION = gql`subscription {
  meeting {
    meetingId
    isBreakout
    lockSettings {
      disableCam
      disableMic
      disableNotes
      disablePrivateChat
      disablePublicChat
      hasActiveLockSetting
      hideUserList
      hideViewersCursor
      webcamsOnlyForModerator
    }
    usersPolicies {
      allowModsToEjectCameras
      allowModsToUnmuteUsers
      authenticatedGuest
      guestPolicy
      maxUserConcurrentAccesses
      maxUsers
      meetingLayout
      userCameraCap
      webcamsOnlyForModerator
    }
  }
}`;

export const CURRENT_USER_SUBSCRIPTION = gql`subscription {
  user_current {
    userId 
    isModerator
    guest
    presenter
    locked
  }
}`;

export const USER_AGGREGATE_COUNT_SUBSCRIPTION = gql`
subscription {
  user_aggregate {
    aggregate {
      count
    }
  }
}
`;

export default {
  MEETING_PERMISSIONS_SUBSCRIPTION,
  CURRENT_USER_SUBSCRIPTION,
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
};
