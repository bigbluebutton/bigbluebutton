import { gql } from '@apollo/client';

export interface BreakoutRoom {
  freeJoin: boolean;
  shortName: string;
  sendInvitationToModerators: boolean;
  sequence: number;
  showInvitation: boolean;
  joinURL: string | null;
  breakoutRoomId: string;
  isDefaultName: boolean;
  hasJoined: boolean;
  isUserCurrentlyInRoom: boolean;
  participants: Array<{
    userId: string;
    isAudioOnly: string;
    user: {
      name: string;
      nameSortable: string;
    }
  }>
}

export interface GetBreakoutDataResponse {
  breakoutRoom: BreakoutRoom[];
}

export interface GetIsUserCurrentlyInBreakoutRoomResponse {
  breakoutRoom_aggregate:{
  aggregate: {
    count: number;
  }
};
}

export const getBreakoutData = gql`
  subscription getBreakoutData {
    breakoutRoom(order_by: {sequence: asc}){
      freeJoin
      shortName
      sendInvitationToModerators
      sequence
      showInvitation
      joinURL
      breakoutRoomId
      isDefaultName
      hasJoined
      isUserCurrentlyInRoom
      participants {
        userId
        isAudioOnly
        user {
          name
          nameSortable
        }
      }
    }
  }
`;

export const getIsUserCurrentlyInBreakoutRoom = gql`
  subscription getIsUserCurrentlyInBreakoutRoom {
    breakoutRoom_aggregate(where: {isUserCurrentlyInRoom: {_eq: true}}) {
      aggregate {
        count
      }
    }
  }
`;

export default {
  getBreakoutData,
  getIsUserCurrentlyInBreakoutRoom,
};
