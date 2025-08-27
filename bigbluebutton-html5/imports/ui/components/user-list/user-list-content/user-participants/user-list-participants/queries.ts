import { gql } from '@apollo/client';
import type { Meeting as MeetingBase } from 'imports/ui/Types/meeting';

export interface UsersCountSubscriptionResponse {
  user_aggregate: {
    aggregate: {
      count: number;
    };
  };
}
export interface MeetingPermissionsSubscriptionResponse {
  meeting: MeetingPermission[];
}

export interface MeetingPermission extends Pick<MeetingBase, 'meetingId' | 'isBreakout' | 'lockSettings' | 'usersPolicies'> {}

export const MEETING_PERMISSIONS_SUBSCRIPTION = gql`
subscription MeetingPermissions {
  meeting {
    meetingId
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

export const USER_AGGREGATE_COUNT_SUBSCRIPTION = gql`
subscription UsersCount {
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
