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
  userId
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
