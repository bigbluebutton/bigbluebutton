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

export default {
  getUser,
  getBreakouts,
};
