import { gql } from '@apollo/client';
export const USERS_SUBSCRIPTION = gql`subscription {
  user(where: {joined: {_eq: true}}, order_by: [{role: asc}, {name: asc}]) {
    userId
    name
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


export const MEETING_SUBSCRIPTION = gql`subscription {
  meeting {
    meetingId
    disabledFeatures
  }
}`;

export default {
  USERS_SUBSCRIPTION,
  MEETING_SUBSCRIPTION,
};
