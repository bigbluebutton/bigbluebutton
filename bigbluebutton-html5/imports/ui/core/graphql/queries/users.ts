import { gql } from '@apollo/client';
import type { User } from '/imports/ui/Types/user';

export interface UsersCountSubscriptionResponse {
  user_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const USER_LIST_SUBSCRIPTION = gql`
subscription UserListSubscription($offset: Int!, $limit: Int!, $where: user_bool_exp!) {
  user(limit:$limit, offset: $offset,
  where: $where,
                order_by: [
                  {presenter: desc},
                  {role: asc},
                  {isDialIn: desc},
                  {whiteboardWriteAccess: desc},
                  {nameSortable: asc},
                  {registeredAt: asc},
                  {userId: asc}
                ]) {
    isDialIn
    userId
    meetingId
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
      listenOnlyInputDevice
    }
    cameras {
      streamId
    }
    whiteboardWriteAccess
    lastBreakoutRoom {
      isDefaultName
      sequence
      shortName
      isUserCurrentlyInRoom
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

export const GET_USER_NAMES = gql`
  query GetUserNames {
    user(where: { bot: { _eq: false } } ) {
      userId
      meetingId
      name
      nameSortable
      firstNameSortable
      lastNameSortable
    }
  }
`;

export type RaisedHandUser = Pick<
User,
| 'meetingId'
| 'userId'
| 'name'
| 'color'
| 'presenter'
| 'isModerator'
| 'raiseHand'
| 'whiteboardWriteAccess'
| 'locked'
> & {
  raiseHandTime?: string;
};

export interface RaisedHandUsersSubscriptionResponse {
  user: RaisedHandUser[];
}

export const RAISED_HAND_USERS = gql`
subscription RaisedHandUsers {
  user(
    where: {
      raiseHand: {_eq: true}
    },
    order_by: [
      {raiseHandTime: asc_nulls_last},
    ]) {
    meetingId
    userId
    name
    color
    presenter
    isModerator
    raiseHand
    raiseHandTime
    whiteboardWriteAccess
    locked
  }
}`;
