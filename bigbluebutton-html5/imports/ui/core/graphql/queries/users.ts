import { gql } from '@apollo/client';

export interface UsersCountSubscriptionResponse {
  user_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const USER_LIST_SUBSCRIPTION = gql`
subscription UserListSubscription($offset: Int!, $limit: Int!) {
  user(limit:$limit, offset: $offset, 
                order_by: [
                  {presenter: desc},
                  {role: asc},
                  {raiseHandTime: asc_nulls_last},
                  {isDialIn: desc},
                  {hasDrawPermissionOnCurrentPage: desc},
                  {nameSortable: asc},
                  {registeredAt: asc},
                  {userId: asc}
                ]) {
    isDialIn
    userId
    extId
    name
    isModerator
    role
    color
    avatar
    away
    raiseHand
    reactionEmoji
    avatar
    presenter
    pinned
    locked
    authed
    mobile
    bot
    guest
    clientType
    disconnected
    loggedOut
    voice {
      joined
      deafened
      listenOnly
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
    userLockSettings {
      disablePublicChat
    }
  }
}`;

export const USER_AGGREGATE_COUNT_SUBSCRIPTION = gql`
  subscription UsersCount {
    user_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const GET_USER_IDS = gql`
  query Users {
    user(where: { bot: { _eq: false } } ) {
      userId
    }
  }
`;

export const GET_USER_NAMES = gql`
  query Users {
    user(where: { bot: { _eq: false } } ) {
      name
      nameSortable
      firstNameSortable
      lastNameSortable
    }
  }
`;
