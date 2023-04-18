import { gql } from '@apollo/client';
export const USERS_SUBSCRIPTION = gql`subscription Users($offset: Int!, $limit: Int!) {
  user(limit:$limit, offset: $offset, order_by: [{role: asc}, {name: asc}, {userId: asc}]) {
    userId
    extId
    name
    isModerator
    role
    color
    avatar
    emoji
    avatar
    presenter
    pinned
    locked
    authed
    mobile
    guest
    clientType
    leftFlag
    loggedOut
    voice {
      joined
      listenOnly
      talking
      muted
      voiceUserId
    }
    cameras {
      streamId
    }
    presPagesWritable {
      isCurrentPage
      pageId
      userId
    }
    lastBreakoutRoom {
      isDefaultName
      sequence
      shortName
      currentlyInRoom
    }
  }
}`;


export const MEETING_PERMISSIONS_SUBSCRIPTION = gql`subscription {
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
      meetingId
      webcamsOnlyForModerator
    }
    usersPolicies {
      allowModsToEjectCameras
      allowModsToUnmuteUsers
      authenticatedGuest
      guestPolicy
      maxUserConcurrentAccesses
      maxUsers
      meetingId
      meetingLayout
      userCameraCap
      webcamsOnlyForModerator
    }
  }
}`;

export const CURRENT_USER_SUBSCRIPTION = gql`subscription User($userId: String!) {
  user(where: {userId: {_eq: $userId}}) {
    isModerator
    guest
    presenter
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
  USERS_SUBSCRIPTION,
  MEETING_PERMISSIONS_SUBSCRIPTION,
  CURRENT_USER_SUBSCRIPTION,
  USER_AGGREGATE_COUNT_SUBSCRIPTION
};
