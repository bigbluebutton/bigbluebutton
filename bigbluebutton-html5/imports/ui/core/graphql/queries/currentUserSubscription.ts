import { gql } from '@apollo/client';

export const CURRENT_USER_SUBSCRIPTION = gql`
subscription userCurrentSubscription {
  user_current {
    authToken
    authed
    avatar
    away
    banned
    clientType
    color
    disconnected
    echoTestRunningAt
    ejectReason
    ejectReasonCode
    ejected
    emoji
    enforceLayout
    expired
    extId
    guest
    guestStatus
    hasDrawPermissionOnCurrentPage
    inactivityWarningDisplay
    inactivityWarningTimeoutSecs
    isDialIn
    isModerator
    isOnline
    isRunningEchoTest
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
    registeredOn
    role
    speechLocale
    userId
    customParameters {
      parameter
      value
    }
    breakoutRooms {
      currentRoomJoined
      assignedAt
      breakoutRoomId
      currentRoomPriority
      currentRoomRegisteredAt
      durationInSeconds
      endedAt
      freeJoin
      inviteDismissedAt
      isDefaultName
      joinURL
      lastRoomIsOnline
      lastRoomJoinedAt
      lastRoomJoinedId
      name
      sendInvitationToModerators
      sequence
      shortName
      showInvitation
      startedAt
      currentRoomIsOnline
    }
    lastBreakoutRoom {
      breakoutRoomId
      currentlyInRoom
      isDefaultName
      sequence
      shortName
    }
    cameras {
      streamId
    }
    userClientSettings {
      userClientSettingsJson
    }
    voice {
      joined
      muted
      spoke
      listenOnly
    }
    presPagesWritable {
      isCurrentPage
      changedModeOn
      pageId
      presentationId
    }
  }
}
`;

export default CURRENT_USER_SUBSCRIPTION;
