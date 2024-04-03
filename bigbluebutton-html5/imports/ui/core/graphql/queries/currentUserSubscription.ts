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
    cameras {
    streamId
  }
  clientType
  color
  customParameters {
    parameter
    value
  }
  disconnected
  away
  raiseHand
  emoji
  extId
  guest
  guestStatus
  hasDrawPermissionOnCurrentPage
  isDialIn
  isModerator
  joined
  breakoutRooms {
    currentRoomJoined
    assignedAt
    breakoutRoomId
    currentRoomIsOnline
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
  }
  lastBreakoutRoom {
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
