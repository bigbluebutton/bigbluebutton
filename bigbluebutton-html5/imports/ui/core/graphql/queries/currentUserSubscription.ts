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
    lastBreakoutRoom {
      currentlyInRoom
      sequence
      shortName
    }
    breakoutRoomsSummary {
        totalOfBreakoutRooms
        totalOfIsUserCurrentlyInRoom
        totalOfShowInvitation
        totalOfJoinURL
    }
    cameras {
      streamId
    }
    voice {
      joined
      spoke
      listenOnly
      deafened
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
    presPagesWritable {
      isCurrentPage
      pageId
      userId
    }
  }
}
`;

export default CURRENT_USER_SUBSCRIPTION;
