import { gql } from '@apollo/client';

export const CURRENT_USER_SUBSCRIPTION = gql`
subscription userCurrentSubscription {
  user_current {
    authToken
    avatar
    away
    clientType
    color
    ejectReason
    ejectReasonCode
    ejected
    emoji
    reactionEmoji
    enforceLayout
    extId
    guest
    guestStatus
    hasDrawPermissionOnCurrentPage
    inactivityWarningDisplay
    inactivityWarningTimeoutSecs
    isDialIn
    isModerator
    isOnline
    joinErrorCode
    joinErrorMessage
    joined
    locked
    loggedOut
    mobile
    name
    nameSortable
    pinned
    presenter
    raiseHand
    registeredAt
    role
    speechLocale
    captionLocale
    userId
    breakoutRooms {
      hasJoined
      assignedAt
      breakoutRoomId
      isLastAssignedRoom
      durationInSeconds
      endedAt
      freeJoin
      inviteDismissedAt
      isDefaultName
      joinURL
      name
      sendInvitationToModerators
      sequence
      shortName
      showInvitation
      startedAt
      isUserCurrentlyInRoom
    }
    lastBreakoutRoom {
      currentlyInRoom
      sequence
      shortName
    }
    cameras {
      streamId
    }
    voice {
      joined
      spoke
      listenOnly
    }
  }
}
`;

export default CURRENT_USER_SUBSCRIPTION;
