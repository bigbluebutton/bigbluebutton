import { gql } from '@apollo/client';
import { BreakoutUser } from './room-managment-state/types';

export interface getUserResponse {
  user: Array<BreakoutUser>;
}

export interface breakoutRoom {
  sequence: number;
  name: string;
  breakoutRoomId: string;
  participants: Array<{
    user: {
      name: string;
      userId: string;
      isModerator: boolean;
    }
  }>
}

export interface getBreakoutsResponse {
  breakoutRoom: Array<breakoutRoom>
}

export interface LastBreakoutData {
  user: {
    lastBreakoutRoom: {
      breakoutRoomId: string;
      currentlyInRoom: boolean;
      sequence: number;
      shortName: string;
      userId: string;
    }
  }[];
  breakoutRoom_createdLatest: {
    sequence: number;
    shortName: string;
    isDefaultName: boolean;
  }[];
}

export const getUser = gql`
  query getUser {
    user(
      where: { bot: {_eq: false } }
      order_by: [
        {role: asc},
        {raiseHandTime: asc_nulls_last},
        {awayTime: asc_nulls_last},
        {isDialIn: desc},
        {hasDrawPermissionOnCurrentPage: desc},
        {nameSortable: asc},
        {userId: asc}
      ]) {
      userId
      name
      isModerator
    }
  }
`;

export const getBreakouts = gql`
  query getBreakouts {
    breakoutRoom {
      sequence
      name
      breakoutRoomId
      participants {
        user {
          name
          userId
          isModerator
        }
      }
    }
  }
`;

export const getBreakoutCount = gql`
  query getBreakoutCount {
    breakoutRoom_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const getLastBreakouts = gql`
  query {
    user {
      lastBreakoutRoom {
        breakoutRoomId
        currentlyInRoom
        sequence
        shortName
        userId
      }
    }
    breakoutRoom_createdLatest {
      sequence
      shortName
      isDefaultName
    }
  }
`;

export default {
  getUser,
  getBreakouts,
  getLastBreakouts,
};
