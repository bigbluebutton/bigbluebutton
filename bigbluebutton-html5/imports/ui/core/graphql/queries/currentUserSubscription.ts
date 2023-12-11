import { gql } from '@apollo/client';

const CURRENT_USER_SUBSCRIPTION = gql`
subscription userCurrentSubscription {
  user_current {
    authed
    avatar
    banned
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
  guestStatus {
    guestStatus
  }
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
      breakoutRoomId
      currentlyInRoom
      isDefaultName
      sequence
      shortName
    }
    userClientSettings {
      userClientSettingsJson
    }
    locked
    loggedOut
    mobile
    name
    pinned
    presenter
    registeredOn
    role
    userId
    voice {
      joined
      muted
      spoke
      talking
      listenOnly
    }
  }
}
`;
export default CURRENT_USER_SUBSCRIPTION;
