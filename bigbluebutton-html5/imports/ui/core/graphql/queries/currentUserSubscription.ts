import { gql } from '@apollo/client';

export const CURRENT_USER_SUBSCRIPTION = gql`
subscription userCurrentSubscription {
  user_current {
    authToken
    avatar
    webcamBackground
    away
    clientType
    color
    ejectReason
    ejectReasonCode
    ejected
    reactionEmoji
    extId
    guest
    guestStatus
    hasDrawPermissionOnCurrentPage
    inactivityWarningDisplay
    inactivityWarningTimeoutSecs
    isDialIn
    isModerator
    currentlyInMeeting
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
    userLockSettings {
      disablePublicChat
    }
    sessionCurrent {
      enforceLayout
    }
    livekit {
      livekitToken
    }
  }
}
`;

export default CURRENT_USER_SUBSCRIPTION;
