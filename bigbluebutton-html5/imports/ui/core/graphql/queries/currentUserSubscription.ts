import { gql } from '@apollo/client';

const CURRENT_USER_SUBSCRIPTION = gql`
subscription userCurrentSubscription {
  user_current {
    authed
    avatar
    banned
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
  lastBreakoutRoom {
      breakoutRoomId
      currentlyInRoom
      isDefaultName
      sequence
      shortName
    }
    localSettings {
      settingsJson
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
