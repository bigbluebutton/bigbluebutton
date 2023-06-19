import { gql } from "@apollo/client";


export const CURRENT_USER_SUBSCRIPTION = gql`
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
  emoji
  extId
  guest
  guestStatus
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