import { gql } from '@apollo/client';

export const MEETING_PERMISSIONS_SUBSCRIPTION = gql`
subscription MeetingPermissions {
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
      allowPromoteGuestToModerator
      guestPolicy
      maxUserConcurrentAccesses
      maxUsers
      meetingLayout
      userCameraCap
      webcamsOnlyForModerator
    }
  }
}`;

export const CURRENT_USER_SUBSCRIPTION = gql`
subscription UserListCurrUser {
  user_current {
    userId 
    isModerator
    guest
    presenter
    locked
  }
}`;

export default {
  MEETING_PERMISSIONS_SUBSCRIPTION,
  CURRENT_USER_SUBSCRIPTION,
};
